/**
 * The Render Engine
 * ButtonControl
 *
 * @fileoverview A button control.
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
   "class": "R.ui.ButtonControl",
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
R.ui.ButtonControl = function() {
   return R.ui.AbstractUIControl.extend(/** @scope R.ui.ButtonControl.prototype */{

      text: null,
      isDown: false,

      /** @private */
      constructor: function(text, textRenderer) {
         this.base("Button", textRenderer);
         this.addClass("buttoncontrol");
         this.text = text || this.getId();
         this.isDown = false;
      },

      /**
       * Destroy the text input control, releasing its event handlers.
       */
      destroy: function() {
         this.base();
      },

      /**
       * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.text = "";
      },

      /**
       * Set the value of the input control.
       * @param text {String} Text
       */
      setText: function(text) {
         this.text = text;
      },

      /**
       * Get the value of the input control.
       * @return {String}
       */
      getText: function() {
         return this.text;
      },

      /**
       * Calculate and return the width of the control in pixels.
       * @return {Number}
       */
      calcWidth: function(str) {
         this.getTextRenderer().setText(this.text);
         return this.getBoundingBox().w;
      },

      /**
       * Calculate and return the height of the control in pixels.
       * @return {Number}
       */
      calcHeight: function() {
         this.getTextRenderer().setText(this.text);
         return this.getBoundingBox().h;
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
         var rect = R.math.Rectangle2D.create(0,0,this.calcWidth(),this.calcHeight()),
             center = rect.getCenter(), tCent = this.getTextRenderer().getBoundingBox().getCenter();
         center.x -= tCent.x;
         center.y += tCent.y / 2;
         renderContext.setPosition(center);
         this.getTextRenderer().update(renderContext, worldTime, dt);
         rect.destroy();
         center.destroy();
         tCent.destroy();
         renderContext.popTransform();
      }

   }, /** @scope R.ui.ButtonControl.prototype */{

      /**
       * Get the class name of this object
       * @return {String} The string "R.ui.ButtonControl"
       */
      getClassName: function() {
         return "R.ui.ButtonControl";
      }
   });

};