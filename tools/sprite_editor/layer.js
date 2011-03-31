
/**
 * The Render Engine
 *
 * A sprite layer
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

R.Engine.requires("/engine.object2d.js");
R.Engine.requires("/engine.container.js");

R.Engine.initObject("SpriteLayer", "Object2D", function() {

/**
 * @class A single layer/frame within a sprite.
 */
var SpriteLayer = Object2D.extend({

   pixels: null,
   
   buffSize: 0,
   
   constructor: function() {
      this.base("Layer");

      this.pixels = [];
      this.buffSize = (SpriteEditor.editorSize / SpriteEditor.pixSize);
      this.buffSize *= this.buffSize;
      R.engine.Support.fillArray(this.pixels, this.buffSize, null);

      //this.pixels = HashContainer.create();
      this.mirror = [false, false];
   },

   release: function() {
      this.base();
      this.pixels = null;
   },

   /**
    * Update the layer within the rendering context.  This draws
    * the shape to the context.
    *
    * @param renderContext {RenderContext} The rendering context
    * @param time {Number} The engine time in milliseconds
    */
   update: function(renderContext, time) {
      renderContext.pushTransform();
      this.base(renderContext, time);

      var rect = Rectangle2D.create(0, 0, 8, 8);
      var pt = Point2D.create(0, 0);
      var t = SpriteEditor.editorSize / SpriteEditor.pixSize;
      renderContext.setScale(SpriteEditor.pixSize / 8);
      for (var p = 0; p < this.buffSize; p++) {
         if (this.pixels[p]) {
            renderContext.pushTransform();
            pt.set((p % t) * 8, Math.floor(p / t) * 8);
            renderContext.setPosition(pt);
            renderContext.setFillStyle(this.pixels[p]);
            renderContext.drawFilledRectangle(rect);
            renderContext.popTransform();
         }
      }

      renderContext.popTransform();
   },

	/**
	 * Get the pixel, normalized to the grid size, using the given coordinates.
	 * @param x {Number} The X coordinate
	 * @param y {Number} The Y coordinate
	 * @return {Array} An array containing the X and Y grid-normalized components
	 */
   getGridPixel: function(x, y) {
      var pSize = SpriteEditor.pixSize;
      x /= pSize;
      y /= pSize;
      x = Math.round(x);
      y = Math.round(y);
      return [x,y];     
   },

	/**
	 * Add a pixel to the layer, in the current color, at the given coordinates
	 * @param x {Number} The X coordinate
	 * @param y {Number} The Y coordinate
	 */
   addPixel: function(x, y) {
      var gP = this.getGridPixel(x, y);
      var t = SpriteEditor.editorSize / SpriteEditor.pixSize;
      this.pixels[gP[1] * t + gP[0]] = SpriteEditor.currentColor;
   },

	/**
	 * Clear the pixel on the layer at the given coordinates
	 * @param x {Number} The X coordinate
	 * @param y {Number} The Y coordinate
	 */
   clearPixel: function(x, y) {
      var gP = this.getGridPixel(x, y);
      var t = SpriteEditor.editorSize / SpriteEditor.pixSize;
      this.pixels[gP[1] * t + gP[0]] = null;
   },

	/**
	 * Clear all of the pixels on the layer
	 */
	clear: function() {
		this.pixels = [];	
	},

	/**
	 * Set the pixels array for the layer
	 * @param pixels {Array} The array of pixels for the current layer
	 */
	setPixels: function(pixels) {
		this.pixels = pixels;
	},
	
	/**
	 * Get the pixel array for the layer
	 * @return {Array} A copy of the pixels on the current layer
	 */
	getPixels: function() {
		return [].concat(this.pixels);
	},

	/**
	 * Get the pixel at the given coordinates
	 * @param x {Number} The X coordinate
	 * @param y {Number} The Y coordinate
	 */
   getPixel: function(x, y) {
      var gP = this.getGridPixel(x, y);
      var t = SpriteEditor.editorSize / SpriteEditor.pixSize;
      return this.pixels[gP[1] * t + gP[0]];
   },
   
	/**
	 * Flip the layer vertically
	 */
   flipVertical: function() {
      var rowSize = SpriteEditor.editorSize / SpriteEditor.pixSize;
      var flip = [];
      for (var y = rowSize + 1; y >= 0; y--) {
         var row = this.pixels.splice(y * rowSize, rowSize);
         flip = flip.concat(row);
      }
      this.pixels = flip;
   },
   
	/**
	 * Flip the layer horizontally
	 */
   flipHorizontal: function() {
      var flip = [];
      R.engine.Support.fillArray(flip, this.buffSize, null);
      var rowSize = SpriteEditor.editorSize / SpriteEditor.pixSize;
      for (var x = 0; x < rowSize; x++) {
         for (var y = 0; y < rowSize; y++) {
            flip[(y * rowSize) + (rowSize - x)] = this.pixels[(y * rowSize) + x];
         }
      }
      this.pixels = flip;     
   },
   
	/**
	 * Shift the pixels to the left, wrapping at the left border
	 */
   shiftLeft: function() {
      // Remove the first pixel of each row and insert it into the
      // last pixel
      var i = SpriteEditor.editorSize / SpriteEditor.pixSize;
      for (var r = 0; r < this.buffSize; r += i) {
         var pix = this.pixels.splice(r,1);
         this.pixels.splice(r + (i - 1), 0, pix[0]);
      }     
   },
   
	/**
	 * Shift the pixels to the right, wrapping at the right border
	 */
   shiftRight: function() {
      // Remove the last pixel of each row and insert it into the
      // first pixel
      var i = SpriteEditor.editorSize / SpriteEditor.pixSize;
      for (var r = (i-1); r < this.buffSize; r += i) {
         var pix = this.pixels.splice(r,1);
         this.pixels.splice(r - (i - 1), 0, pix[0]);
      }     
   },
   
	/**
	 * Shift the pixels up, wrapping at the top border
	 */
   shiftUp: function() {
      // Remove the top row of pixels and add to the bottom
      var start = 0;
      var end = SpriteEditor.editorSize / SpriteEditor.pixSize; 
      //var topRow = this.pixels.slice(start, end);
      var topRow = this.pixels.splice(start, end);
      this.pixels = this.pixels.concat(topRow); 
   },
   
	/**
	 * Shift the pixels down, wrapping at the bottom border
	 */
   shiftDown: function() {
      // Remove the bottom row of pixels and add to the top
      var start = this.buffSize - (SpriteEditor.editorSize / SpriteEditor.pixSize);
      var end = SpriteEditor.editorSize / SpriteEditor.pixSize;
      var botRow = this.pixels.splice(start, end);
      this.pixels = botRow.concat(this.pixels);
   }

}, { // Static

   /**
    * Get the class name of this object
    * @return The string <tt>SpriteTest.Actor</tt>
    * @type String
    */
   getClassName: function() {
      return "SpriteLayer";
   }
});

return SpriteLayer;

});