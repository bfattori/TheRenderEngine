/**
 * The Render Engine
 * KeyboardInputComponent
 *
 * @fileoverview An extension of the input component for dealing with the
 *               keyboard.
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
	"class": "R.components.input.Keyboard",
	"requires": [
		"R.components.Input",
		"R.engine.Events"
	]
});

/**
 * @class A component which responds to keyboard events and notifies
 * its {@link R.engine.GameObject} by calling one of three methods.  The <tt>R.engine.GameObject</tt>
 * should implement any of the following methods to receive the corresponding event:
 * <ul>
 * <li><tt>onKeyDown()</tt> - A key was pressed down</li>
 * <li><tt>onKeyUp()</tt> - A key was released</li>
 * <li><tt>onKeyPress()</tt> - A key was pressed and released</li>
 * </ul>
 * Each function takes up to six arguments.  The first argument is the character
 * code, a number which represents the key that was pressed. The second argument is the
 * <tt>keyCode</tt>, a number which represents special keys that were pressed, such as
 * the arrow keys and function keys.  See 
 * {@link R.engine.Events} for key codes of the non-alphabetic keys. The third argument
 * is a boolean indicating if the Control key was pressed.  The fourth argument is a
 * boolean indicating if the Alt key was pressed.  The fifth argument is a boolean
 * indicating if the Shift key was pressed.  The sixth and final argument is the
 * actual event object itself.
 *
 * @param name {String} The unique name of the component.
 * @param priority {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create an instance of a keyboard input component. 
 */
R.components.input.Keyboard = function() {
	return R.components.Input.extend(/** @scope R.components.input.Keyboard.prototype */{

	hasInputMethods: null,

   /**
    * @private
    */
   constructor: function(name, priority) {
      this.base(name, priority);
      this.hasInputMethods = [false, false, false];
   },

   /**
    * Destroy this instance and remove all references.
    * @private
    */
   destroy: function() {
      var ctx = R.Engine.getDefaultContext();

      // Clean up event handlers
      if (this.hasInputMethods[0]) {
	      ctx.removeEvent(this, "keydown");
		}
		
		if (this.hasInputMethods[1]) {
			ctx.removeEvent(this, "keyup");
		}
		
		if (this.hasInputMethods[2]) {
	      ctx.removeEvent(this, "keypress");
		}	

      this.base();
   },

	release: function() {
		this.base();
		this.hasInputMethods = null;
	},

	/**
    * Establishes the link between this component and its host object.
    * When you assign components to a host object, it will call this method
    * so that each component can refer to its host object, the same way
    * a host object can refer to a component with {@link HostObject#getComponent}.
    *
    * @param hostObject {HostObject} The object which hosts this component
	 */
	setHostObject: function(hostObj) {
		this.base(hostObj);
		this.hasInputMethods = [hostObj.onKeyDown != undefined, 
										hostObj.onKeyUp != undefined, 
										hostObj.onKeyPressed != undefined];

      var ctx = R.Engine.getDefaultContext();
      var self = this;

      // Add the event handlers
      if (this.hasInputMethods[0]) {
			ctx.addEvent(this, "keydown", function(evt) {
				return self._keyDownListener(evt);
			});
		}
		
		if (this.hasInputMethods[1]) {
			ctx.addEvent(this, "keyup", function(evt) {
				return self._keyUpListener(evt);
			});
		}
		
		if (this.hasInputMethods[2]) {
			ctx.addEvent(this, "keypress", function(evt) {
				return self._keyPressListener(evt);
			});
		}	
	},

   /** @private */
   playEvent: function(e) {
      var evt = document.createEvent("KeyboardEvent");
      evt.initKeyEvent(e.type, true, false, null, e.ctrlKey, false, e.shiftKey, false, e.keyCode, 0);
      this.getHostObject().getRenderContext().getSurface().dispatchEvent(evt);
   },

   /** @private */
   _keyDownListener: function(eventObj) {
		this.record(eventObj,R.components.input.Keyboard.RECORD_PART);
		return this.getHostObject().onKeyDown(eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey, eventObj);
   },

   /** @private */
   _keyUpListener: function(eventObj) {
		this.record(eventObj,R.components.input.Keyboard.RECORD_PART);
		return this.getHostObject().onKeyUp(eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey, eventObj);
   },

   /** @private */
   _keyPressListener: function(eventObj) {
		this.record(eventObj,R.components.input.Keyboard.RECORD_PART);
		return this.getHostObject().onKeyPress(eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey, eventObj);
   }

}, /** @scope R.components.input.Keyboard.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.input.Keyboard"
    */
   getClassName: function() {
      return "R.components.input.Keyboard";
   },
   
   /** @private */
   RECORD_PART: ["shiftKey","ctrlKey","altKey","keyCode"]
});
}