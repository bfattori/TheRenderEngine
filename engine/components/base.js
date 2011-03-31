/**
 * The Render Engine
 * BaseComponent
 *
 * @fileoverview The base class from which all components extend.  A component
 *               is a single part of the functionality used by a HostObject.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
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
	"class": "R.components.Base",
	"requires": [
		"R.engine.BaseObject",
		"R.engine.GameObject"
	]
});

/**
 * @class All components extend from this object class.  A component is one
 *        part of an operating whole object (a {@link R.engine.HostObject}) which is
 *        responsible for only a portion of the overall operation of an in-
 *        game object.  Components are broken down into five major categories:
 *        <ul>
 *          <li><b>TYPE_INPUT</b> - Input from controllers (keyboard, mouse, etc.)</li>
 *          <li><b>TYPE_TRANSFORM</b> - Performs transformations on the host object</li>
 *          <li><b>TYPE_LOGIC</b> - Handles logical operations that are not related to
 *              input and collision</li>
 *          <li><b>TYPE_COLLIDER</b> - Determines what this object is possibly colliding
 *              with, and reports those collisions via callbacks to the host.</li>
 *          <li><b>TYPE_RENDERING</b> - Performs some sort of rendering operation to the context</li>
 *        </ul>
 *        Components are executed in the order listed.  First, all inputs are
 *        checked, then logic is performed.  Logic may be internal to a host object
 *        itself, but some components perform an object-centric type of logic that
 *        can be reused.  Next, collisions are checked.  And finally, rendering can
 *        occur.
 *        <p/>
 *        Within each component type set, components can be prioritized so that
 *        one component will execute before others.  Such an ordering allows for
 *        multiple components of each type to perform their tasks in an order
 *        that the host defines.
 *
 *
 * @extends R.engine.BaseObject
 * @constructor
 * @description Create a new instance of a component, setting the name, type, and
 *              update priority of this component compared to all other components
 *              within the host.
 * @param name {String} The name of the component
 * @param type {Number} The type of the component
 * @param priority {Number} A value between 0.0 and 1.0.  Default: 0.5
 */
R.components.Base = function() {
	return R.engine.BaseObject.extend(/** @scope R.components.Base.prototype */{

   priority: 0,

   type: -1,

   host: null,

   /**
    * @private 
    */
   constructor: function(name, type, priority) {
      Assert((name != null), "You must assign a name to every Component.");
      name = name.toUpperCase();

      Assert((type != null && (type >= R.components.Base.TYPE_PRE && type <= R.components.Base.TYPE_POST)),
             "You must specify a type for component");

      this.type = type;

      Assert((priority != null && (priority >= 0.0 && priority <= 1.0)),
             "Priority must be between 0.0 and 1.0 for component");

      this.priority = priority || 0.5;
      this.base(name);
   },

   /**
    * Releases the object back into the object pool.  See {@link PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
      this.priority = 0;
      this.type = -1;
      this.host = null;
   },

   /**
    * Establishes the link between this component and its host object.
    * When you assign components to a host object, it will call this method
    * so that each component can refer to its host object, the same way
    * a host object can refer to a component with {@link GameObject#getComponent}.
    *
    * @param hostObject {R.engine.GameObject} The object which hosts this component
    */
   setHostObject: function(hostObject) {
      this.host = hostObject;
   },

   /**
    * Gets the game object this component is a part of.  When the component was
    * assigned to a game object, the game object will have set itself as the container
    * via {@link #setHostObject}.
    *
    * @return {R.engine.GameObject}
    */
   getHostObject: function() {
      return this.host;
   },

   /**
    * Get the type of this component.  The value will be one of:
    * {@link #TYPE_INPUT}, {@link #TYPE_TRANSFORM}, {@link #TYPE_LOGIC},
    * {@link #TYPE_COLLIDER}, or {@link #TYPE_RENDERING}
    *
    * @return {Number} The component type Id
    */
   getType: function() {
      return this.type;
   },

   /**
    * Set the execution priority of this component with
    * 1.0 being the highest priority and 0.0 being the lowest.  Components
    * within a host object are sorted by type, and then priority.  As such,
    * two components with the same type will be sorted by priority with the
    * higer value executing before the lower value.  This allows you to layer
    * components like the {@link #TYPE_RENDER} componenent so that one effect
    * is drawn before another.
    *
    * @param priority {Number} A value between 0.0 and 1.0
    */
   setPriority: function(priority) {
      this.priority = priority;
      this.getHost().sort();
   },

   /**
    * Returns the priority of this component.
    *
    * @return {Number} A value between 0.0 and 1.0
    */
   getPriority: function() {
      return this.priority;
   },

   /**
    * [ABSTRACT] This method is called by the host object to run the component, 
    * updating its state.  Not all components will need an execute
    * method.  However, it is important to include one if you need to 
    * update the state of the component each engine cycle.
    *
    * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the component will render within.
    * @param time {Number} The global engine time
    */
   execute: function(renderContext, time) {
      // ABSTRACT METHOD DECLARATION
   },

   /**
    * Get the type of the component as a string.
    * @return {String}
    */
   getTypeString: function() {
      var ts = "";
      switch (this.getType()) {
         case R.components.Base.TYPE_PRE: ts = "TYPE_PRE"; break;
         case R.components.Base.TYPE_INPUT: ts = "TYPE_INPUT"; break;
         case R.components.Base.TYPE_TRANSFORM: ts = "TYPE_TRANSFORM"; break;
         case R.components.Base.TYPE_LOGIC: ts = "TYPE_LOGIC"; break;
         case R.components.Base.TYPE_COLLIDER: ts = "TYPE_COLLIDER"; break;
         case R.components.Base.TYPE_RENDERING: ts = "TYPE_RENDERING"; break;
         case R.components.Base.TYPE_POST: ts = "TYPE_POST"; break;
         default: ts = "TYPE_UNKNOWN";
      }

      return ts;
   }


}, /** @scope R.components.Base.prototype */{

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.components.Base"
    */
   getClassName: function() {
      return "R.components.Base";
   },

   /**
    * The constant value for PRE process components.  Reserved for internal use.
    * @type {Number}
    * @private
    */
   TYPE_PRE:				0,

   /**
    * The constant value for INPUT components.
    * @type {Number}
    */
   TYPE_INPUT:          1,

   /**
    * The constant value for TRANSFORM (movement) components.
    * @type {Number}
    */
   TYPE_TRANSFORM:      2,

   /**
    * The constant value for LOGIC components.
    * @type {Number}
    */
   TYPE_LOGIC:          3,

   /**
    * The constant value for COLLIDER components.
    * @type {Number}
    */
   TYPE_COLLIDER:       4,

   /**
    * The constant value for RENDERING components.
    * @type {Number}
    */
   TYPE_RENDERING:      5,
   
   /**
    * The constant value for POST process components.  Reserved for internal use.
    * @type {Number}
    * @private
    */
   TYPE_POST:				6
});

}