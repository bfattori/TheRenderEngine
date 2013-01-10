
/**
 * The Render Engine
 *
 * The drawing grid
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
	"class": "SpriteGrid",
	"requires": [
		"R.objects.Object2D",
		"R.struct.Container",

		// Math objects
		"R.math.Math2D"
	]
});

/**
 * @class The grid.
 */
var SpriteGrid = function() {
   return R.objects.Object2D.extend({

      pixels: null,
      visible: true,
      color: null,
      mirror: [false, false],

      constructor: function() {
         this.base("Grid");
         this.setZIndex(1000);
         this.visible = true;
         this.color = "#c0c0c0";
      },

      /**
       * Set the color of the grid lines
       * @param colr {String} Hexadecimal color for the grid lines
       */
      setGridColor: function(colr) {
         this.color = colr;
      },

      /**
       * Update the grid within the rendering context.  This draws
       * the shape to the context, after updating the transform of the
       * object.  If the player is thrusting, draw the thrust flame
       * under the ship.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {

         // Before we draw the grid, let's capture the canvas to the preview window
         SpriteEditor.previewContext.clear();
         SpriteEditor.previewContext.drawImage(R.math.Rectangle2D.create(0, 0, 64, 64),
               renderContext.getSurface());

         renderContext.pushTransform();
         this.base(renderContext, time);

         if (!this.visible) {
            return;
         }

         renderContext.setLineStyle(this.color);
         renderContext.setLineWidth(0.5);
         var sT = R.math.Point2D.create(0,0);
         var eD = R.math.Point2D.create(0,0);
         for (var x=0; x < SpriteEditor.editorSize; x += SpriteEditor.pixSize)
         {
            // X-Lines
            sT.set(x, 0);
            eD.set(x, SpriteEditor.editorSize);
            renderContext.drawLine(sT, eD);
         }

         for (var y=0; y < SpriteEditor.editorSize; y += SpriteEditor.pixSize)
         {
            // Y-Lines
            sT.set(0, y);
            eD.set(SpriteEditor.editorSize, y);
            renderContext.drawLine(sT, eD);
         }

         // Mirror Lines
         if (this.mirror[0]) {
            // Horizontal
            renderContext.setLineWidth(0.75);
            sT.set(256, 0);
            eD.set(256, 512);
            renderContext.drawLine(sT, eD);
         }

         if (this.mirror[1]) {
            // Vertical
            renderContext.setLineWidth(0.75);
            sT.set(0, 256);
            eD.set(512, 256);
            renderContext.drawLine(sT, eD);
         }

         renderContext.popTransform();
      },

      /**
       * Set the visibility state of the grid
       * @param state {Boolean} <code>true</code> to show the grid, <code>false</code> to hide it
       */
      setVisible: function(state)  {
         this.visible = state;
      },

      /**
       * Set the vertical mirror state
       * @param state {Boolean} <code>true</code> to enable vertical mirroring
       */
      setMirrorVertical: function(state) {
         this.mirror[1] = state;
      },

      /**
       * Set the horizontal mirror state
       * @param state {Boolean} <code>true</code> to enable horizontal mirroring
       */
      setMirrorHorizontal: function(state) {
         this.mirror[0] = state;
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return The string <tt>SpriteTest.Actor</tt>
       * @type String
       */
      getClassName: function() {
         return "SpriteGrid";
      }
   });
};
