/**
 * The Render Engine
 * DebugComponent
 *
 * @fileoverview A debugging component.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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
    "class":"R.components.Debug",
    "requires":[
        "R.components.Base"
    ]
});

/**
 * @class A debugging component to render helpful debug widgets alongside an object.
 *
 * @param name {String} Name of the component
 *
 * @extends R.components.Base
 * @constructor
 * @description A debugging component.
 */
R.components.Debug = function () {
    "use strict";
    return R.components.Base.extend(/** @scope R.components.Collider.prototype */{

        /**
         * @private
         */
        constructor:function (name, priority) {
            this.base(name, R.components.Base.TYPE_POST, priority || 1.0);
        },

        /**
         * Destroy the component instance.
         */
        destroy:function () {
            this.base();
        },

        /**
         * This method has been deprecated in favor of {@link #setGameObject}.
         * @deprecated
         */
        setHostObject:function (gameObject) {
            this.base(gameObject);
        },

        /**
         * Establishes the link between this component and its game object.
         * When you assign components to a game object, it will call this method
         * so that each component can refer to its game object, the same way
         * a game object can refer to a component with {@link R.engine.GameObject#getComponent}.
         *
         * @param gameObject {R.engine.GameObject} The object which holds this component
         */
        setGameObject:function (gameObject) {
            this.base(gameObject);
        },

        /**
         * Releases the component back into the pool for reuse.  See {@link R.engine.PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
        },

        /**
         * Updates the object within the collision model and determines if
         * the host object should to be alerted whenever a potential collision
         * has occurred.  If a potential collision occurs, an array (referred to
         * as a Potential Collision List, or PCL) will be created which
         * contains objects that might be colliding with the host object.  It
         * is up to the host object to make the final determination that a
         * collision has occurred.  If no collisions have occurred, that will be reported
         * as well.
         * <p/>
         * The list of objects within the PCL will be passed to the <tt>onCollide()</tt>
         * method (if declared) on the host object.  If a collision occurred and was
         * handled, the <tt>onCollide()</tt> method should return {@link CollisionComponent#STOP},
         * otherwise, it should return {@link CollisionComponent#CONTINUE} to continue
         * checking objects from the PCL against the host object.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context for the component
         * @param time {Number} The current engine time in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        execute:function (renderContext, time, dt) {

        }

    }, /** @scope R.components.Debug.prototype */{ // Statics

        /**
         * Get the class name of this object
         *
         * @return {String} "R.components.Debug"
         */
        getClassName:function () {
            return "R.components.Debug";
        }

    });
}