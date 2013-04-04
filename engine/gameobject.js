/**
 * The Render Engine
 * GameObject
 *
 * @fileoverview An object which contains components.  This is a base
 *               class for most in-game objects.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1573 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.engine.GameObject",
    "requires":[
        "R.struct.HashContainer",
        "R.components.Base"
    ]
});

/**
 * @class A game object is a container for components.  Each component within
 *        the object provides a portion of the overall functionality.  A game object
 *        can have any number of components of any type within it.  Components provide
 *        functionality for things like rendering, collision detection, effects, or
 *        transformations. This way, an object can be anything, depending on it's components.
 *        <p/>
 *        A <tt>GameObject</tt> is the logical foundation for all in-game objects.  It is
 *        through this mechanism that game objects can be created without having to manipulate
 *        large, monolithic objects.  A <tt>GameObject</tt> contains {@link R.components.Base Components},
 *        which are the building blocks for complex functionality and ease of development.
 *        <p/>
 *        By building a <tt>GameObject</tt> from multiple components, the object gains the
 *        component's functionality without necessarily having to implement anything.  Many
 *        components already exist in the engine, but you are only limited by your imagination
 *        when it comes to developing new components.
 *
 * @extends R.struct.HashContainer
 * @constructor
 * @description Create a game object.
 */
R.engine.GameObject = function () {
    "use strict";
    return R.struct.HashContainer.extend(/** @scope R.engine.GameObject.prototype */{

        renderContext:null,
        dirtyFlag:false,
        oldDirty:false,

        preRenderComponents:null,
        postRenderComponents:null,
        keepAlive:false,

        /** @private */
        constructor:function (name) {
            this.base(name);
            this.dirtyFlag = true;
            this.oldDirty = false;
            this.preRenderComponents = [];
            this.postRenderComponents = [];
            this.renderContext = null;
            this.keepAlive = false;
        },

        /**
         * Release the object back into the object pool.
         */
        release:function () {
            this.base();
            this.renderContext = null;
            this.dirtyFlag = false;
            this.oldDirty = false;
            this.preRenderComponents = null;
            this.postRenderComponents = null;
            this.keepAlive = false;
        },

        /**
         * Destroy all of the components within this object and
         * remove this object from it's render context.
         */
        destroy:function () {
            if (this.getRenderContext()) {
                this.getRenderContext().remove(this);
            }

            while (this.preRenderComponents.length > 0) {
                this.preRenderComponents.shift().destroy();
            }

            while (this.postRenderComponents.length > 0) {
                this.postRenderComponents.shift().destroy();
            }

            this.cleanUp();
            this.base();
        },


        /**
         * Marks the object as dirty.  An object is considered dirty if something about
         * it has changed which would affect how it is rendered.
         */
        markDirty:function () {
            this.dirtyFlag = true;
        },

        /**
         * Check the flag which indicates if the object is dirty.
         * @return {Boolean}
         */
        isDirty:function () {
            return this.dirtyFlag;
        },

        /**
         * Check the flag which indicates if the object <i>was</i> dirty the last time
         * it was updated.  Objects which aren't dirty, but were dirty, need to be redrawn
         * one more time so they aren't missed in the next frame.
         * @return {Boolean}
         */
        wasDirty:function () {
            return this.oldDirty;
        },

        /**
         * Set the rendering context this object will be drawn within.  This method is
         * called when a host object is added to a rendering context.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context
         */
        setRenderContext:function (renderContext) {
            this.renderContext = renderContext;
            this.markDirty();

            if (this.afterAdd) {
                // If the object being added to the render context has
                // an "afterAdd" method, call it
                this.afterAdd(renderContext);
            }
        },

        /**
         * Get the rendering context this object will be drawn upon.
         *
         * @return {R.rendercontexts.AbstractRenderContext} The render context the object belongs to
         */
        getRenderContext:function () {
            return this.renderContext;
        },

        /**
         * Update this object within the render context, at the specified timeslice.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the object will be rendered within.
         * @param time {Number} The global time within the engine.
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        update:function (renderContext, time, dt) {

            // Run the components
            var components = this.iterator();

            while (components.hasNext()) {
                components.next().execute(renderContext, time, dt);
            }

            components.destroy();
            this.oldDirty = this.dirtyFlag;
            this.dirtyFlag = false;

            this.base(renderContext, time, dt);
        },

        /**
         * Run pre-render or post-render components.
         * @param type {Number} The component type
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the object will be rendered within.
         * @param time {Number} The global time within the engine
         * @param dt {Number} The delta between the world time and the last time rthe world was updated
         * @private
         */
        runPreOrPostComponents: function(type, renderContext, time, dt) {
            var components = type === R.components.Base.TYPE_PRE ? this.preRenderComponents : this.postRenderComponents;
            if (components) {
                for (var cIdx = 0; cIdx < components.length; cIdx++) {
                    components[cIdx].execute(renderContext, time, dt);
                }
            }
        },

        /**
         * Keep object alive, even when outside viewport.  Setting an object to the "keep alive"
         * state will keep the object from being put into the render context's inactive bin,
         * even when it is outside of the expanded viewport.  This is good for objects which
         * traverse a large area of the game world.
         * @param state {Boolean} <code>true</code> to keep the object alive at all times
         */
        setKeepAlive:function (state) {
            this.keepAlive = state;
        },

        /**
         * Returns <code>true</code> if the object is to be kept alive (updated) at all times.
         * @return {Boolean}
         */
        isKeepAlive:function () {
            return this.keepAlive;
        },

        /**
         * Add a component to the game object.  The components will be
         * sorted based on their type then their priority within that type.
         * Components with a higher priority will be sorted before components
         * with a lower priority.  The sorting order for type is:
         * <ul>
         * <li>Input</li>
         * <li>Transform</li>
         * <li>Logic</li>
         * <li>Collision</li>
         * <li>Rendering</li>
         * </ul>
         *
         * @param component {R.components.Base} A component to add to the host
         */
        add:function (component) {

            Assert((R.components.Base.isInstance(component)), "Cannot add a non-component to a GameObject");
            Assert(!this.isInHash(component.getName()), "Components must have a unique name within the host");

            // Special handling for pre and post processing components
            if (component.getType() == R.components.Base.TYPE_PRE ||
                component.getType() == R.components.Base.TYPE_POST) {

                this.setPreOrPostComponent(component);
                component.setGameObject(this);
                return;
            }

            this.base(component.getName(), component);

            component.setGameObject(this);
            if (this.getObjects().length > 1) {
                this.sort(R.engine.GameObject.componentSort);
            }
            this.markDirty();
        },

        /**
         * Remove the component from the game object
         * @param component {String|R.components.Base} The component to remove, or the name of the component to remove
         * @return {R.components.Base} The component which was removed
         */
        remove:function (component) {
            var c = typeof component === "string" ? this.get(component.toUpperCase()) : component;
            return this.base(c);
        },

        /**
         * Setting up pre- or post-process components.  Only one of each can be assigned.
         * This is intended to be used internally as the components are processed externally
         * to the normal component handling.
         * @private
         */
        setPreOrPostComponent:function (component) {
            if (component.getType() === R.components.Base.TYPE_PRE) {
                this.preRenderComponents.push(component);
            } else {
                this.postRenderComponents.push(component);
            }
        },

        /**
         * Get the component with the specified name from this object.
         *
         * @param name {String} The unique name of the component to get
         * @return {R.components.Base}
         */
        getComponent:function (name) {
            return this.get(name.toUpperCase());
        },

        /**
         * Get a component by class name.  If there is more than one component with the given
         * class, returns the first occurrence.
         * @param className {String} The class name
         * @return {R.components.Base} The component, or <code>null</code> if not found
         */
        getComponentByClass:function (className) {
            var clazz = R.getClassForName(className);
            if (undefined === clazz) {
                return null;
            }

            var c = this.getAll();
            for (var i in c) {
                if (c[i] instanceof clazz) {
                    return c[i];
                }
            }
            return null;
        },

        /**
         * Returns a property object with accessor methods.
         * @return {Object}
         */
        getProperties:function () {
            var self = this;
            var prop = this.base(self);
            return $.extend(prop, {
                "RenderContext":[function () {
                    return self.renderContext.getName();
                }, null, false]
            });
        }

    }, /** @scope R.engine.GameObject.prototype */{

        /**
         * Sort components within this object based upon their component
         * type, and the priority within that type.  Components with a higher
         * priority will be sorted before components with a lower priority.
         * @static
         */
        componentSort:function (component1, component2) {
            return ((component1.getType() - component2.getType()) +
                ((1 / component1.getPriority()) - (1 / component2.getPriority())));
        },

        /**
         * Get the class name of this object
         *
         * @return {String} "R.engine.GameObject"
         */
        getClassName:function () {
            return "R.engine.GameObject";
        }

    });

};