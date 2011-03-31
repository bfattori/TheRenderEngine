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
	"class": "R.engine.GameObject",
	"requires": [
		"R.struct.HashContainer",
		"R.components.Base"
	]
});

/**
 * @class A game object is a container for components.  Each component within
 *        the host provides a portion of the overall functionality.  A game object
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
 *        component's functionality without having to necessarily implement anything.  Many
 *        components already exist in the engine, but you are only limited by your imagination
 *        when it comes to developing new components.
 *
 * @extends R.struct.HashContainer
 * @constructor
 * @description Create a game object.
 */
R.engine.GameObject = function(){
	return R.struct.HashContainer.extend(/** @scope R.engine.GameObject.prototype */{
	
		renderContext: null,
		dirtyFlag: false,
		oldDirty: false,
		deferredEvents: null,
		
		prePostComponents: null,
		
		/** @private */
		constructor: function(name){
			this.base(name);
			this.dirtyFlag = true;
			this.oldDirty = false;
			this.deferredEvents = [];
			this.prePostComponents = [];
		},
		
		/**
		 * Release the object back into the object pool.
		 */
		release: function(){
			this.base();
			this.renderContext = null;
			this.dirtyFlag = false;
			this.oldDirty = false;
			this.deferredEvents = null;
			this.prePostComponents = null;
		},
		
		/**
		 * Destroy all of the components within this object and
		 * remove this object from it's render context.
		 */
		destroy: function(){
			if (this.getRenderContext()) {
				this.getRenderContext().remove(this);
			}
			
			while (this.prePostComponents.length > 0) {
				this.prePostComponents.shift().destroy();
			}
			
			this.cleanUp();
			this.base();
		},
		
		
		/**
		 * Marks the object as dirty.  An object is considered dirty if something about
		 * it has changed which would affect how it is rendered.
		 */
		markDirty: function(){
			this.dirtyFlag = true;
		},
		
		/**
		 * Check the flag which indicates if the object is dirty.
		 * @return {Boolean}
		 */
		isDirty: function(){
			return this.dirtyFlag;
		},
		
		/**
		 * Check the flag which indicates if the object <i>was</i> dirty the last time
		 * it was updated.  Objects which aren't dirty, but were dirty, need to be redrawn
		 * one more time so they aren't missed in the next frame.
		 * @return {Boolean}
		 */
		wasDirty: function(){
			return this.oldDirty;
		},
		
		/**
		 * Adds an event to the host object.  If the host object has a representative DOM element,
		 * the event will be added to the element.  Otherwise, the event will be assigned to the
		 * host's render context.
		 * 
		 * @param ref {Object} The object reference which is assigning the event
		 * @param type {String} The event type to respond to
		 * @param [data] {Array} Optional data to pass to the handler when it is invoked.
		 * @param fn {Function} The function to trigger when the event fires
		 */
		addEvent: function(ref, type, data, fn) {
			var target = this.getElement() ? this.getElement() : this.getRenderContext();
			if (!target) {
				this.deferredEvents.push({
					dRef: ref,
					dType: type,
					dData: data,
					dFn: fn
				});
			} else {
				if (target == this.getElement()) {
					this.base(ref, type, data, fn);
				} else {
					this.getRenderContext().addEvent(ref, type, data, fn);
				}
			}
		},
		
		/**
		 * Set the rendering context this object will be drawn within.  This method is
		 * called when a host object is added to a rendering context.
		 *
		 * @param renderContext {R.rendercontexts.AbstractRenderContext} The context
		 */
		setRenderContext: function(renderContext){
			this.renderContext = renderContext;
			
			while(this.deferredEvents.length > 0) {
				// Assign any deferred events
				var e = this.deferredEvents.shift();
				this.addEvent(e.dRef, e.dType, e.dData, e.dFn);
			}
			
			this.markDirty();
		},
		
		/**
		 * Get the rendering context this object will be drawn upon.
		 *
		 * @return {R.rendercontexts.AbstractRenderContext} The render context the object belongs to
		 */
		getRenderContext: function(){
			return this.renderContext;
		},
		
		/**
		 * Update this object within the render context, at the specified timeslice.
		 *
		 * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the object will be rendered within.
		 * @param time {Number} The global time within the engine.
		 */
		update: function(renderContext, time){
		
			// Run the components
			var components = this.iterator();
			
			while (components.hasNext()) {
				components.next().execute(renderContext, time);
			}
			
			components.destroy();
			this.oldDirty = this.dirtyFlag;
			this.dirtyFlag = false;
			
			this.base(renderContext, time);
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
		add: function(component){
		
			Assert((R.components.Base.isInstance(component)), "Cannot add a non-component to a GameObject");
			Assert(!this.isInHash(component.getName()), "Components must have a unique name within the host");
			
			// Special handling for pre and post processing components
			if (component.getType() == R.components.Base.TYPE_PRE ||
				 component.getType() == R.components.Base.TYPE_POST) {
				 
				 // Only one of each can be added
				 this.setPreOrPostComponent(component);
				 component.setHostObject(this);
				 return;
			}
			
			this.base(component.getName(), component);
			
			component.setHostObject(this);
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
		remove: function(component) {
			var c;
			if (typeof component === "string") {
				c = this.get(component.toUpperCase());
			} else {
				c = component;
			}
			return this.base(c);
		},
		
		/**
		 * Setting up pre- or post-process components.  Only one of each can be assigned.
		 * This is intended to be used internally as the components are processed externally
		 * to the normal component handling.
		 * @private
		 */
		setPreOrPostComponent: function(component) {
			if (component.getType() == R.components.Base.TYPE_PRE) {
				this.prePostComponents[0] = component;
			} else {
				this.prePostComponents[1] = component;
			}
		},
		
		/**
		 * Get the component with the specified name from this object.
		 *
		 * @param name {String} The unique name of the component to get
		 * @return {R.components.Base}
		 */
		getComponent: function(name){
			return this.get(name.toUpperCase());
		},
		
		/**
		 * Returns a property object with accessor methods.
		 * @return {Object}
		 */
		getProperties: function(){
			var self = this;
			var prop = this.base(self);
			return $.extend(prop, {
				"RenderContext": [function(){
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
		componentSort: function(component1, component2){
			return ((component1.getType() - component2.getType()) +
			((1 / component1.getPriority()) - (1 / component2.getPriority())));
		},
		
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.engine.GameObject"
		 */
		getClassName: function(){
			return "R.engine.GameObject";
		}
		
	});
	
};