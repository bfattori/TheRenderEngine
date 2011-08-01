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
 * its {@link R.engine.GameObject} when one of the events occurs.  The <tt>R.engine.GameObject</tt>
 * should add event handlers for any of the following:
 * <ul>
 * <li><tt>keydown</tt> - A key was pressed down</li>
 * <li><tt>keyup</tt> - A key was released</li>
 * <li><tt>keypress</tt> - A key was pressed and released</li>
 * </ul>
 * Each event handler will be passed six arguments.  The first argument is the event object.
 * The second argument is the character code, a number which represents the key that was pressed.
 * The third argument is the <tt>keyCode</tt>, a number which represents special keys that were
 * pressed, such as the arrow keys and function keys.  See {@link R.engine.Events} for key codes of
 * the non-alphabetic keys. The fourth, fifth, and sixth arguments are boolean flags indicating if
 * the Control, Alt, or Shift keys, respectively, were pressed.
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
       * Deprecated in favor of {@link #setGameObject}
       * @deprecated
       */
      setHostObject: function(hostObj) {
         this.setGameObject(hostObj);
      },

      /**
       * Establishes the link between this component and its host object.
       * When you assign components to a host object, it will call this method
       * so that each component can refer to its host object, the same way
       * a host object can refer to a component with {@link HostObject#getComponent}.
       *
       * @param hostObject {HostObject} The object which hosts this component
       */
      setGameObject: function(gameObject) {
         this.base(gameObject);
         this.hasInputMethods = [gameObject.onKeyDown != undefined,
            gameObject.onKeyUp != undefined,
            gameObject.onKeyPressed != undefined];

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
         this.getGameObject().getRenderContext().getSurface().dispatchEvent(evt);
      },

      /** @private */
      _keyDownListener: function(eventObj) {
         this.record(eventObj, R.components.input.Keyboard.RECORD_PART);
         return this.getGameObject().triggerEvent("keydown", [eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey, eventObj]);
      },

      /** @private */
      _keyUpListener: function(eventObj) {
         this.record(eventObj, R.components.input.Keyboard.RECORD_PART);
         return this.getGameObject().triggerEvent("keyup", [eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey, eventObj]);
      },

      /** @private */
      _keyPressListener: function(eventObj) {
         this.record(eventObj, R.components.input.Keyboard.RECORD_PART);
         return this.getGameObject().triggerEvent("keypress", [eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey, eventObj]);
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
};