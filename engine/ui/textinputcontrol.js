/**
 * The Render Engine
 * InputControl
 *
 * @fileoverview A single line text input control.
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
   "class": "R.ui.TextInputControl",
   "requires": [
      "R.ui.AbstractUIControl"
   ]
});

/**
 * @class UI input control for the input of a single line of text.
 *
 * @constructor
 * @param [size=10] {Number} The number of visible characters in the context.
 * @param [maxLength=0] {Number} The maximum number of allowed characters.  Zero for
 *    unlimited text length.
 * @extends R.ui.AbstractUIControl
 */
R.ui.TextInputControl = function() {
   return R.ui.AbstractUIControl.extend(/** @scope R.ui.TextInputControl.prototype */{

      text: "",
      maxLength: 0,
      size: 0,
      styleClass: "",
      password: false,
      passwordChar: null,
      passwordText: null,
      blinkTime: 0,
      blink: false,

      /** @private */
      constructor: function(size, maxLength, textRenderer) {
         this.base("TextInput", textRenderer);
         this.size = size || 10;
         this.maxLength = maxLength || 0;
         this.addClass("inputcontrol");
         this.password = false;
         this.passwordChar = "*";
         this.passwordText = "";
         this.blinkTime = 0;
         this.blink = false;

         // We want to add events to capture key presses
         // when the control has focus
         var self = this;
         R.Engine.getDefaultContext().addEvent(this, "keydown", function(evt) {
            if (self.hasFocus()) {
               if (evt.which == R.engine.Events.KEYCODE_BACKSPACE) {
                  if (self.text.length > 0) {
                     self.text = self.text.substring(0, self.text.length - 1);
                     if (self.password) {
                        self.passwordText = self.passwordText.substring(0, self.text.length - 1);
                     }
                  }

                  evt.stopPropagation();
                  evt.preventDefault();
               }

               self.getTextRenderer().setText(self.text);
               self.triggerEvent("change");
            }
         });

         R.Engine.getDefaultContext().addEvent(this, "keypress", function(evt) {
            if (self.hasFocus()) {
               if (evt.which != R.engine.Events.KEYCODE_ENTER &&
                   evt.which != R.engine.Events.KEYCODE_BACKSPACE) {
                  if (self.maxLength == 0 || self.text.length < self.maxLength) {
                     if (self.password) {
                        self.text += self.passwordChar;
                        self.passwordText += String.fromCharCode(evt.which);
                     } else {
                        self.text += String.fromCharCode(evt.which);
                     }
                  }
               }
               
               self.getTextRenderer().setText(self.text);
               self.triggerEvent("change");
               evt.stopPropagation();
               evt.preventDefault();
            }
         });
      },

      /**
       * Destroy the text input control, releasing its event handlers.
       */
      destroy: function() {
         R.Engine.getDefaultContext().removeEvent(this, "keydown");
         R.Engine.getDefaultContext().removeEvent(this, "keypress");
         this.base();
      },

      /**
       * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.text = "";
         this.maxLength = 0;
         this.size = 10;
         this.styleClass = "";
      },

      /**
       * Set a flag indicating this is a password field.
       * @param state {Boolean} <code>true</code> to mask the characters
       */
      setPassword: function(state) {
         this.password = state;
      },

      /**
       * Set the number of characters to display in the input.
       * @param size {Number} The number of characters to display
       */
      setSize: function(size) {
         this.size = size;
      },

      /**
       * Set the maximum length of input allowed.
       * @param maxLength {Number} Maximum allowed input length
       */
      setMaxLength: function(maxLength) {
         this.maxLength = maxLength;
      },

      /**
       * @private
       */
      mask: function(str) {
         var m = "";
         for (var s = 0; s < str.length; s++) {
            m += this.passwordChar;
         }
         return m;
      },

      /**
       * Set the value of the input control.
       * @param text {String} Text
       */
      setText: function(text) {
         this.text = this.password ? this.mask(text) : text;
         this.passwordText = this.password ? text : "";
         this.getTextRenderer().setText(this.text);
      },

      /**
       * Get the value of the input control.
       * @return {String}
       */
      getText: function() {
         return this.password ? this.passwordText : this.text;
      },

      /**
       * Calculate and return the width of the control in pixels.
       * @return {Number}
       */
      calcWidth: function(str) {
         var old = this.getTextRenderer().getText();
         if (str === undefined) {
            str = "";
            for (var s = 0; s < this.size; s++) {
               str += "W";
            }
         }
         this.getTextRenderer().setText(str);
         var width = this.getTextRenderer().getBoundingBox().w;
         this.getTextRenderer().setText(old);
         return width;
      },

      /**
       * Calculate and return the height of the control in pixels.
       * @return {Number}
       */
      calcHeight: function() {
         var str = "W", old = this.getTextRenderer().getText();
         this.getTextRenderer().setText(str);
         var height = this.getTextRenderer().getBoundingBox().h;
         this.getTextRenderer().setText(old);
         return height;
      },

      /**
       * Draw the input caret.
       * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
       *    drawn.
       * @param worldTime {Number} The current world time, in milliseconds
       * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
       */
      drawCaret: function(renderContext, worldTime, dt) {
         if (this.hasFocus()) {
            if (worldTime > this.blinkTime) {
               this.blink = !this.blink;
               this.blinkTime = worldTime + 500;
            }
            if (this.blink) {
               var cPos = R.math.Point2D.create(this.calcWidth(this.text) + 4, 2),
                   cEnd = R.clone(cPos);
               cEnd.y += this.calcHeight() - 4;
               renderContext.setLineStyle(this.getTextRenderer().getTextColor());
               renderContext.drawLine(cPos, cEnd);
               cPos.destroy();
               cEnd.destroy();
            }
         }
      },

      /**
       * Draw the input component within the
       * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
       *    drawn.
       * @param worldTime {Number} The current world time, in milliseconds
       * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
       */
      drawControl: function(renderContext, worldTime, dt) {
         // Draw the current input text.  The text baseline is the bottom of the font,
         // so we need to move that down by the height of the control (with some padding to look right)
         renderContext.pushTransform();
         var baseline = R.math.Point2D.create(2, this.calcHeight() - 3);
         renderContext.setPosition(baseline);
         this.getTextRenderer().update(renderContext, worldTime, dt);
         baseline.destroy();
         renderContext.popTransform();

         // Draw the caret
         this.drawCaret(renderContext, worldTime, dt);
      },

      /**
       * Returns a bean which represents the read or read/write properties
       * of the object.
       *
       * @return {Object} The properties object
       */
      getProperties: function(){
         var self = this;
         var prop = this.base(self);
         return $.extend(prop, {
            "Size": [function(){
               return self.size;
            }, function(i){
               self.setSize(parseInt(i));
            }, true],
            "MaxLength": [function() {
               return self.maxLength;
            }, function(i) {
               self.setMaxLength(parseInt(i));
            }, true],
            "IsPassword": [function() {
               return self.password;
            }, {
               "toggle": true,
               "fn": function(s) {
                  self.setPassword(s); }
               }, true],
            "Text": [function() {
               return self.getText();
            }, function(i) {
               self.setText(i);
            }, true]
         });
      }

   }, /** @scope R.ui.TextInputControl.prototype */{

      /**
       * Get the class name of this object
       * @return {String} The string "R.ui.TextInputControl"
       */
      getClassName: function() {
         return "R.ui.TextInputControl";
      },

      /**
       * Get a properties object with values for the given object.
       * @param obj {R.ui.TextInputControl} The text input control to query
       * @param [defaults] {Object} Default values that don't need to be serialized unless
       *    they are different.
       * @return {Object}
       */
      serialize: function(obj, defaults) {
         // Defaults for object properties which can be skipped if no different
         defaults = defaults || [];
         $.extend(defaults, {
            "Text":"",
            "MaxLength":0,
            "IsPassword":false,
            "Size":10
         });
         return R.ui.AbstractUIControl.serialize(obj, defaults);
      },

      /**
       * Deserialize the object back into a text input control.
       * @param obj {Object} The object to deserialize
       * @param [clazz] {Class} The object class to populate
       * @return {R.ui.TextInputControl} The object which was deserialized
       */
      deserialize: function(obj, clazz) {
         clazz = clazz || R.ui.TextInputControl.create();
         R.ui.AbstractUIControl.deserialize(obj, clazz);
         return clazz;
      }
   });

};