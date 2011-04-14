
/**
 * The Render Engine
 *
 * The preview canvas
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

R.Engine.define({
	"class": "SpritePreview",
	"requires": [
		"R.rendercontexts.CanvasContext"
	]
});

/**
 * @class The canvas upon which the preview sprite is displayed.
 */
var SpritePreview = function() {
   return R.rendercontexts.CanvasContext.extend({

      imgData: null,

      constructor: function() {
         this.base("Preview", 64, 64);
         $(this.getSurface()).css("display", "none");
      },

      /**
       * Clear the canvas
       * @private
       */
      clear: function() {
         var cRect = this.getViewport();
         this.get2DContext().clearRect(cRect.getTopLeft().x, cRect.getTopLeft().y, cRect.getDims().x, cRect.getDims().y);
      },

      /**
       * @private
       */
      reset: function(rect) {
         // Overloaded so the rectangle doesn't clear
      },

      /**
       * Update the preview context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();
         this.base(renderContext, time);

         //this.get2DContext().putImageData(this.imgData, 0, 0);

         // Now copy across the image to the preview in the editor
         var dataUrl = this.getDataURL();
         SpriteEditor.previewImage.attr("src", dataUrl);
         $(".frames ul li.currentFrame img").attr("src", dataUrl);
         $(".animations ul li img.currentAnimation").attr("src", dataUrl);

         renderContext.popTransform();
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return The string <tt>SpritePreview</tt>
       * @type String
       */
      getClassName: function() {
         return "SpritePreview";
      }
   });
};