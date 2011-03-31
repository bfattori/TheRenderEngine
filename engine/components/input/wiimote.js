/**
 * The Render Engine
 * WiimoteInputComponent
 *
 * @fileoverview An extension of the keyboard input component which handles the
 *               Nintendo Wii remote.
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
	"class": "R.components.input.Wiimote",
	"requires": [
		"R.components.input.Keyboard",
		"R.math.Math2D",
		"R.math.Point2D",
		"R.math.Vector2D",
		"R.math.Rectangle2D"
	]
});

/**
 * @class A component which responds to the Wiimote (in the Opera browser)
 * is notifies its host object by calling a number of methods.  The host object
 * should implement any of the following methods to receive the corresponding events.
 * <br/>
 * The next few events are fired on the host object, if they exist, when
 * the corresponding button is pressed and released.  All methods take three
 * arguments: the controller number, a boolean indicating <tt>true</tt>
 * if the button has been pressed or <tt>false</tt> when released, and
 * the event object that caused the method to be invoked.
 * <br/>
 * <ul>
 * <li><tt>onWiimoteLeft()</tt> - Direction pad left</li>
 * <li><tt>onWiimoteRight()</tt> - Direction pad right</li>
 * <li><tt>onWiimoteUp()</tt> - Direction pad up</li>
 * <li><tt>onWiimoteDown()</tt> - Direction pad down</li>
 * <li><tt>onWiimotePlus()</tt> - Plus button pressed/released</li>
 * <li><tt>onWiimoteMinus()</tt> - Minus button pressed/released</li>
 * <li><tt>onWiimoteButton1()</tt> - Button 1 pressed/released</li>
 * <li><tt>onWiimoteButton2()</tt> - Button 2 pressed/released</li>
 * <li><tt>onWiimoteButtonA()</tt> - Button A pressed/released</li>
 * <li><tt>onWiimoteButtonB()</tt> - Button B pressed/released</li>
 * <li><tt>onWiimoteButtonC()</tt> - Button C pressed/released</li>
 * <li><tt>onWiimoteButtonZ()</tt> - Button Z pressed/released</li>
 * </ul>
 * <br/><br/>
 * The following events are status events and take different
 * arguments:
 * <ul>
 * <li><tt>onWiimoteEnabled()</tt> - Enabled/disabled status (controller, state)</li>
 * <li><tt>onWiimoteValidity()</tt> - Validity of data transfer (controller, validity)</li>
 * <li><tt>onWiimoteDistance()</tt> - Distance from screen in meters (controller, dist)</li>
 * <li><tt>onWiimotePosition()</tt> - X/Y position (controller, x, y)</li>
 * <li><tt>onWiimoteRoll()</tt> - X-axis roll in radians (controller, roll)</li>
 * <li><tt>onWiimoteOffscreen()</tt> - Triggered <i>instead of</i> onWiimotePosition if the
 *                          remote isn't pointing at the screen.</li>
 * </ul>
 *
 * @param name {String} The name of the component
 * @param [priority=0.1] {Number} The priority of the component
 * @extends R.components.input.Keyboard
 * @constructor
 * @description Create a Wii remote input component.
 */
R.components.input.Wiimote = function() {
	return R.components.input.Keyboard.extend(/** @scope R.components.input.Wiimote.prototype */{

   enabledRemotes: null,

   remoteValid: null,
   
   hasMethods: null,
   
   /**
    * @private
    */
   constructor: function(name, priority) {
      this.base(name, priority || 0.1);
      this.enabledRemotes = [false, false, false, false];
      this.remoteValid = [0, 0, 0, 0];

      var ctx = R.Engine.getDefaultContext();
      var self = this;

      // Add the event handlers
      ctx.addEvent(this, "mousedown", function(evt) {
         self._mouseDownListener(evt);
      });

      ctx.addEvent(this, "mouseup", function(evt) {
         self._mouseUpListener(evt);
      });
      
      if (!$.browser.Wii) {
         // In the absense of the WiiMote, we'll use the mouse as the pointer
         ctx.addEvent(this, "mousemove", function(evt) {
            self._mouseMoveListener(evt);
         });
      }
      
      this.hasMethods = [false, false, false, false, false, false, 
								 false, false, false, false, false, false,
      						 false, false, false, false, false, false];
   },

   /**
    * Releases the component back into the object pool. See {@link R.engine.PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
      this.enabledRemotes = null;
      this.remoteValid = null;
      this.hasMethods = null;
   },

   /**
    * Destroy this instance and remove all references.
    */
   destroy: function() {
      var ctx = R.Engine.getDefaultContext();

      // Clean up event handlers
      ctx.removeEvent(this, "mousedown");
      ctx.removeEvent(this, "mouseup");

      if (!$.browser.Wii) {
         // In the absence of the WiiMote, remove the mouse move handler
         ctx.removeEvent(this, "mousemove");
      }
      this.base();
   },

	/**
    * Establishes the link between this component and its host object.
    * When you assign components to a host object, it will call this method
    * so that each component can refer to its host object, the same way
    * a host object can refer to a component with {@link R.engine.HostObject#getComponent}.
    *
    * @param hostObject {R.engine.HostObject} The object which hosts this component
	 */
	setHostObject: function(hostObj) {
		this.base(hostObj);
		this.hasMethods = [hostObj.onWiimoteLeft != undefined, 
								 hostObj.onWiimoteRight != undefined, 
								 hostObj.onWiimoteUp != undefined,
								 hostObj.onWiimoteDown != undefined,
								 hostObj.onWiimotePlus != undefined,
								 hostObj.onWiimoteMinus != undefined,
								 hostObj.onWiimoteButton1 != undefined,
								 hostObj.onWiimoteButton2 != undefined,
								 hostObj.onWiimoteButtonA != undefined,
								 hostObj.onWiimoteButtonB != undefined,
								 hostObj.onWiimoteButtonC != undefined,
								 hostObj.onWiimoteButtonZ != undefined,
								 hostObj.onWiimoteEnabled != undefined,
								 hostObj.onWiimoteDistance != undefined,
								 hostObj.onWiimoteValidity != undefined,
								 hostObj.onWiimoteOffscreen != undefined,
								 hostObj.onWiimotePosition != undefined,
								 hostObj.onWiimoteRoll != undefined];
	},


   /** @private */
   _mouseDownListener: function(evt) {
      this._wmButtonA(evt, 0, true);   
   },

   /** @private */
   _mouseUpListener: function(evt) {
      this._wmButtonA(evt, 0, false);  
   },

   /** @private */
   _mouseMoveListener: function(evt) {
      this._wmPosition(0, evt.pageX, evt.pageY, evt.screenX, evt.screenY);
   },

   /** @private */
   _keyDownListener: function(event) {
      // This is for handling the Primary Wiimote
      switch (event.keyCode) {
         case R.components.input.Wiimote.KEYCODE_LEFT:
            this._wmLeft(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_RIGHT:
            this._wmRight(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_UP:
            this._wmUp(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_DOWN:
            this._wmDown(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_PLUS:
            this._wmPlus(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_MINUS:
            this._wmMinus(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_1:
            this._wmButton1(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_2:
            this._wmButton2(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_A:
            this._wmButtonA(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_B:
            this._wmButtonB(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_C:
            return this._wmButtonC(event, 0, true);
            break;
         case R.components.input.Wiimote.KEYCODE_Z:
            this._wmButtonZ(event, 0, true);
            break;
      }
      
      // Pass along for straight keyboard handling
      this.base(event);
   },

   /** @private */
   _keyUpListener: function(event) {
      // This is for handling the Primary Wiimote
      switch (event.keyCode) {
         case R.components.input.Wiimote.KEYCODE_LEFT:
            this._wmLeft(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_RIGHT:
            this._wmRight(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_UP:
            this._wmUp(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_DOWN:
            this._wmDown(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_PLUS:
            this._wmPlus(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_MINUS:
            this._wmMinus(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_1:
            this._wmButton1(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_2:
            this._wmButton2(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_A:
            this._wmButtonA(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_B:
            this._wmButtonB(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_C:
            this._wmButtonC(event, 0, false);
            break;
         case R.components.input.Wiimote.KEYCODE_Z:
            this._wmButtonZ(event, 0, false);
            break;
      }
      
      // Pass along for straight keyboard handling
      this.base(event);
   },

   /**
    * This will do the polling of the Wiimote and fire events when
    * statuses change.
    *
    * @private
    */
   execute: function(renderContext, time) {
      if (!$.browser.Wii) {
         // If this isn't Opera for Wii, don't do anything
         return;
      }

      // Run through the available Wiimotes
      var op = $.browser.WiiMote;
      for (var w = 0; w < 4; w++) {

         var remote = op.update(w); // This fixes a dependency problem
         // Cannot perform this check on the primary remote,
         // that's why this object extends the keyboard input component...
         if (remote.isEnabled) {

            if (!this.enabledRemotes[w]) {
               // Let the host know that a Wiimote became enabled
               this._wmEnabled(w, true);
            }

            if (!remote.isBrowsing) {
               var evt = { primary: false };

               // Simple bitmask check to handle states and fire methods
               this._wmLeft(evt, w, remote.hold & 1);
               this._wmRight(evt, w, remote.hold & 2);
               this._wmDown(evt, w, remote.hold & 4);
               this._wmUp(evt, w, remote.hold & 8);
               this._wmPlus(evt, w, remote.hold & 16);
               this._wmButton2(evt, w, remote.hold & 256);
               this._wmButton1(evt, w, remote.hold & 512);
               this._wmButtonA(evt, w, remote.hold & 2048);
               this._wmMinus(evt, w, remote.hold & 4096);
               this._wmButtonZ(evt, w, remote.hold & 8192);
               this._wmButtonC(evt, w, remote.hold & 16384);
            }

            this._wmButtonB(evt, w, remote.hold & 1024);

            // Set validity of remote data
            this._wmValidity(w, remote.dpdValidity);

            // Set distance to screen
            this._wmDistance(w, remote.dpdDistance);
            
            // Set position and roll
            this._wmPosition(w, remote.dpdScreenX, remote.dpdScreenY, remote.dpdX, remote.dpdY);
            this._wmRoll(w, remote.dpdRollX, remote.dpdRollY, Math.atan2(remote.dpdRollY, remote.dpdRollX));
         } else {
            if (this.enabledRemotes[w]) {
               // Let the host know that a Wiimote became disabled
               this._wmEnabled(w, false);
            }
         }
      }
   },

   /** @private */
   _wmLeft: function(evt, controllerNum, pressed) {
      if (this.hasMethods[0])
      {
         this.getHostObject().onWiimoteLeft(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmRight: function(evt, controllerNum, pressed) {
      if (this.hasMethods[1])
      {
         this.getHostObject().onWiimoteRight(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmUp: function(evt, controllerNum, pressed) {
      if (this.hasMethods[2])
      {
         this.getHostObject().onWiimoteUp(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmDown: function(evt, controllerNum, pressed) {
      if (this.hasMethods[3])
      {
         this.getHostObject().onWiimoteDown(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmPlus: function(evt, controllerNum, pressed) {
      if (this.hasMethods[4])
      {
         this.getHostObject().onWiimotePlus(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmMinus: function(evt, controllerNum, pressed) {
      if (this.hasMethods[5])
      {
         this.getHostObject().onWiimoteMinus(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmButton1: function(evt, controllerNum, pressed) {
      if (this.hasMethods[6])
      {
         this.getHostObject().onWiimoteButton1(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmButton2: function(evt, controllerNum, pressed) {
      if (this.hasMethods[7])
      {
         this.getHostObject().onWiimoteButton2(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmButtonA: function(evt, controllerNum, pressed) {
      if (this.hasMethods[8])
      {
         this.getHostObject().onWiimoteButtonA(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmButtonB: function(evt, controllerNum, pressed) {
      if (this.hasMethods[9])
      {
         this.getHostObject().onWiimoteButtonB(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmButtonC: function(evt, controllerNum, pressed) {
      if (this.hasMethods[10])
      {
         this.getHostObject().onWiimoteButtonC(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmButtonZ: function(evt, controllerNum, pressed) {
      if (this.hasMethods[11])
      {
         this.getHostObject().onWiimoteButtonZ(controllerNum, pressed, evt);
      }
   },

   /** @private */
   _wmEnabled: function(controllerNum, state) {
      // Store the Wiimote enabled state
      this.enabledRemotes[controllerNum] = state;
      if (this.hasMethods[12])
      {
         this.getHostObject().onWiimoteEnabled(controllerNum, state);
      }
   },

   /** @private */
   _wmDistance: function(c, d) {
      if (this.hasMethods[13])
      {
         this.getHostObject().onWiimoteDistance(c, d);
      }
   },

   /** @private */
   _wmValidity: function(c, v) {
      if (this.remoteValid[c] != v) {
         this.remoteValid[c] = v;
         if (this.hasMethods[14])
         {
            this.getHostObject().onWiimoteValidity(c, v);
         }
      }
   },

   /** @private */
   _wmPosition: function(c, sx, sy, x, y) {
      if (this.hasMethods[15]) {
         this.getHostObject().onWiimoteOffscreen(c, (!sx || !sy));
      }

      if ((sx && sy) && this.hasMethods[16])
      {
         this.getHostObject().onWiimotePosition(c, sx, sy, x, y);
      }
   },

   /** @private */
   _wmRoll: function(c, x, y, z) {
      if (this.hasMethods[17])
      {
         // Pitch, yaw, roll?
         this.getHostObject().onWiimoteRoll(c, x, y, z);
      }
   }
}, /** @scope R.components.input.Wiimote.prototype */{ 

   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.input.Wiimote"
    */
   getClassName: function() {
      return "R.components.input.Wiimote";
   },

   /**
    * For second argument to <tt>onWiimoteValidity()</tt>: the data is good
    * @type {Number}
    */
   DATA_GOOD: 2,

   /**
    * For second argument to <tt>onWiimoteValidity()</tt>: the data is poor
    * @type {Number}
    */
   DATA_POOR: 1,

   /**
    * For second argument to <tt>onWiimoteValidity()</tt>: the Wiimote isn't pointing at the screen
    * @type {Number}
    */
   DATA_INVALID: 0,

   /**
    * For second argument to <tt>onWiimoteValidity()</tt>: the data is very poor (unreliable)
    * @type {Number}
    */
   DATA_VERY_POOR: -1,

   /**
    * For second argument to <tt>onWiimoteValidity()</tt>: the data is extremely poor (garbage)
    * @type {Number}
    */
   DATA_EXTREMELY_POOR: -2,

   /**
    * Keycode for button "A"
    * @type {Number}
    */    
   KEYCODE_A: 13,

   /**
    * Keycode for button "B"
    * @type {Number}
    */    
   KEYCODE_B: 32,       // 171

   /**
    * Keycode for button "C"
    * @type {Number}
    */    
   KEYCODE_C: 67,       // 201

   /**
    * Keycode for button "Z"
    * @type {Number}
    */    
   KEYCODE_Z: 90,       // 200

   /**
    * Keycode for button "1"
    * @type {Number}
    */    
   KEYCODE_1: 173,

   /**
    * Keycode for button "2"
    * @type {Number}
    */    
   KEYCODE_2: 173,

   /**
    * Keycode for button "-"
    * @type {Number}
    */    
   KEYCODE_MINUS: 170,

   /**
    * Keycode for button "+"
    * @type {Number}
    */    
   KEYCODE_PLUS: 174,

   /**
    * Keycode for dpad left
    * @type {Number}
    */    
   KEYCODE_LEFT: 178,

   /**
    * Keycode for dpad right
    * @type {Number}
    */    
   KEYCODE_RIGHT: 177,

   /**
    * Keycode for dpad up
    * @type {Number}
    */    
   KEYCODE_UP: 175,

   /**
    * Keycode for dpad down
    * @type {Number}
    */    
   KEYCODE_DOWN: 176
});
}
