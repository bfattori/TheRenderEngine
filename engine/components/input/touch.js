/**
 * The Render Engine
 * KeyboardInputComponent
 *
 * @fileoverview An extension of the input component to handle touch inputs from
 *               devices which support them.
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
	"class": "R.components.input.Touch",
	"requires": [
		"R.components.Input",
		"R.engine.Events",
		"R.struct.Touch"
	]
});

/**
 * @class A component which responds to touch events and notifies
 * its {@link R.engine.HostObject} by calling one of four methods.  The <tt>R.engine.HostObject</tt>
 * should implement any of the following methods to receive the corresponding event:
 * <ul>
 * <li><tt>onTouchStart()</tt> - A touch event started</li>
 * <li><tt>onTouchEnd()</tt> - A touch event ended</li>
 * <li><tt>onTouchMove()</tt> - A movement occurred after a touch event started</li>
 * <li><tt>onTouchCancel()</tt> - A touch event was cancelled</li>
 * </ul>
 * Each function should take up to two arguments.  The first argument is an array of
 * {@link R.struct.Touch} objects which represent each touch that occurred in the event.  Some
 * platforms support multi-touch, so each touch will be represented in the array.  The 
 * second argument is the actual event object itself.
 *
 * @param name {String} The unique name of the component.
 * @param [passThru] {Boolean} set to <tt>true</tt> to pass the event to the device 
 * @param [priority] {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create an instance of a touch input component. 
 */
R.components.input.Touch = function() {
	return R.components.Input.extend(/** @scope R.components.input.Touch.prototype */{

	hasTouchMethods: null,

   /**
    * @private
    */
   constructor: function(name, passThru, priority) {
		passThru = (typeof passThru == "number" ? false : passThru);
		priority = (typeof passThru == "number" ? passThru : null);
      this.base(name, priority);

      var ctx = R.Engine.getDefaultContext();
      var self = this;

      // Add the event handlers
      ctx.addEvent(this, "touchstart", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchStartListener(evt);
      });
      ctx.addEvent(this, "touchend", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchEndListener(evt);
      });
      ctx.addEvent(this, "touchmove", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchMoveListener(evt);
      });
      ctx.addEvent(this, "touchcancel", function(evt) {
			if (!passThru) {
	         evt.preventDefault();
			}
         return self._touchCancelListener(evt);
      });
      
      this.hasTouchMethods = [false, false, false, false];
   },

   /**
    * Destroy this instance and remove all references.
    */
   destroy: function() {
      var ctx = R.Engine.getDefaultContext();

      // Clean up event handlers
      ctx.removeEvent(this, "touchstart");
      ctx.removeEvent(this, "touchend");
      ctx.removeEvent(this, "touchmove");
      ctx.removeEvent(this, "touchcancel");
      this.base();
   },

	/**
	 * Releases the component back into the object pool
	 */
	release: function() {
		this.base();
		this.hasTouchMethods = null;
	},

	/**
    * Establishes the link between this component and its host object.
    * When you assign components to a host object, it will call this method
    * so that each component can refer to its host object, the same way
    * a host object can refer to a component with {@link R.engine.GameObject#getComponent}.
    *
    * @param hostObject {R.engine.GameObject} The object which hosts this component
	 */
	setHostObject: function(hostObj) {
		this.base(hostObj);
		this.hasTouchMethods = [hostObj.onTouchStart != undefined, 
										hostObj.onTouchEnd != undefined, 
										hostObj.onTouchMove != undefined,
										hostObj.onTouchCancel != undefined];
	},

   /**
    * Process the touches and pass an array of touch objects to be handled by the
    * host object.
    * @private
    */
   processTouches: function(eventObj) {
      var touches = [];
		if (eventObj.touches) {
	      for (var i = 0; i < eventObj.touches.length; i++) {
	         touches.push(new R.struct.Touch(eventObj.touches[i]));
	      }
		}
      return touches;
   },

   /** @private */
   _touchStartListener: function(eventObj) {
      if (this.hasTouchMethods[0]) {
         return this.getHostObject().onTouchStart(this.processTouches(eventObj.originalEvent), eventObj);
      }
   },

   /** @private */
   _touchEndListener: function(eventObj) {
      if (this.hasTouchMethods[1]) {
         return this.getHostObject().onTouchEnd(this.processTouches(eventObj.originalEvent), eventObj);
      }
   },

   /** @private */
   _touchMoveListener: function(eventObj) {
      if (this.hasTouchMethods[2]) {
         return this.getHostObject().onTouchMove(this.processTouches(eventObj.originalEvent), eventObj);
      }
   },

   /** @private */
   _touchCancelListener: function(eventObj) {
      if (this.hasTouchMethods[3]) {
         return this.getHostObject().onTouchCancel(this.processTouches(eventObj.originalEvent), eventObj);
      }
   }

}, /** @scope R.components.input.Touch.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.input.Touch"
    */
   getClassName: function() {
      return "R.components.input.Touch";
   },
   
   /** @private */
   RECORD_PART: ["shiftKey","ctrlKey","altKey","keyCode"]
});
}
