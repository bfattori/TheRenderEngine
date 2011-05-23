/**
 * The Render Engine
 * Test: Font Rendering
 *
 * Tests of the available font renderers.
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

// Load all required engine components
R.Engine.define({
	"class": "FontTest",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
		"R.rendercontexts.HTMLDivContext",
		"R.text.VectorText",
		"R.text.BitmapText",
		"R.text.ContextText",
		"R.text.TextRenderer",
		"R.resources.loaders.BitmapFontLoader",
		"R.lang.Timeout",
      "R.math.Rectangle2D",
      "R.math.Point2D"
	]
});

/**
 * @class Wii ball bounce game.  Press the A button over a ball
 *        to make it bounce.  Press A when not over a ball to create
 *        another ball.
 */
var FontTest = function() {
   return R.engine.Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // The play field
      fieldBox: null,
      fieldWidth: 760,
      fieldHeight: 400,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
			FontTest.fontLoader = R.resources.loaders.BitmapFontLoader.create();
			FontTest.fontLoader.load("lucida", "lucida_sans_36.font");
			FontTest.fontLoader.load("console", "press_start_24.font");
			FontTest.fontLoader.load("times", "times_36.font");
			
         // Don't start until all of the resources are loaded
         R.lang.Timeout.create("wait", 250, function(){
            if (FontTest.fontLoader.isReady("lucida") &&
                FontTest.fontLoader.isReady("console") &&
                FontTest.fontLoader.isReady("times")) {
                  FontTest.run();
                  this.destroy();
            } else {
               // Continue waiting
               this.restart();
            }
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.renderContext.destroy();
      },
      
      /**
       * Run the game
       */
      run: function(){
         // Create the render context
         this.fieldWidth = R.Engine.getDebugMode() ? 400 : this.fieldWidth;
         this.fieldBox = R.math.Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.centerPoint = this.fieldBox.getCenter();
			var ctx = R.engine.Support.getNumericParam("context", 1);
			if (ctx == 1) {
				this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", this.fieldWidth, this.fieldHeight);
			} else {
				this.renderContext = R.rendercontexts.HTMLDivContext.create("Playfield", this.fieldWidth, this.fieldHeight);
			}
			
	      this.renderContext.setBackgroundColor("#000000");
         R.Engine.getDefaultContext().add(this.renderContext);

         var textStr = "ABCxyz123!@#$%^&*()[]+=_-";

		 	// Vector Text
			var vector1 = R.text.TextRenderer.create(R.text.VectorText.create(), textStr, 1.2);
			vector1.setPosition(R.math.Point2D.create(20, 20));
			vector1.setTextWeight(1);
			vector1.setColor("#ffffff");
			this.renderContext.add(vector1);
			
			var vector2 = R.text.TextRenderer.create(R.text.VectorText.create(), textStr, 2);
			vector2.setPosition(R.math.Point2D.create(20, 43));
			vector2.setTextWeight(1);
			vector2.setColor("#ffffff");
			this.renderContext.add(vector2);
			
			var vector3 = R.text.TextRenderer.create(R.text.VectorText.create(), textStr, 2.5);
			vector3.setPosition(R.math.Point2D.create(20, 80));
			vector3.setTextWeight(1);
			vector3.setColor("#ffffff");
			this.renderContext.add(vector3);
			
			// Bitmap Text
			var bitmap1 = R.text.TextRenderer.create(R.text.BitmapText.create(FontTest.fontLoader.get("console")),
               textStr, 0.8);
			bitmap1.setPosition(R.math.Point2D.create(10, 135));
			bitmap1.setTextWeight(1);
			bitmap1.setColor("#ffff00");
			this.renderContext.add(bitmap1);
			
			var bitmap2 = R.text.TextRenderer.create(R.text.BitmapText.create(FontTest.fontLoader.get("lucida")),
               textStr, 1);
			bitmap2.setPosition(R.math.Point2D.create(10, 160));
			bitmap2.setTextWeight(1);
			bitmap2.setColor("#ffff00");
			this.renderContext.add(bitmap2);
			
			var bitmap3 = R.text.TextRenderer.create(R.text.BitmapText.create(FontTest.fontLoader.get("times")),
               textStr, 1.2);
			bitmap3.setPosition(R.math.Point2D.create(10, 195));
			bitmap3.setTextWeight(1);
			bitmap3.setColor("#ffff00");
			this.renderContext.add(bitmap3);
			
			// Context Render
	      var context1 = R.text.TextRenderer.create(R.text.ContextText.create(), textStr, 1);
	      context1.setPosition(R.math.Point2D.create(10, 260));
	      context1.setColor("#8888ff");
	      this.renderContext.add(context1);

	      var context2 = R.text.TextRenderer.create(R.text.ContextText.create(), textStr, 2);
	      context2.setPosition(R.math.Point2D.create(10, 288));
			context2.setTextFont("Times New Roman");
	      context2.setColor("#8888ff");
	      this.renderContext.add(context2);

	      var context3 = R.text.TextRenderer.create(R.text.ContextText.create(), textStr, 3);
	      context3.setPosition(R.math.Point2D.create(10, 320));
			context3.setTextFont("Courier New");
			context3.setTextWeight(R.rendercontexts.RenderContext2D.FONT_WEIGHT_BOLD);
	      context3.setColor("#8888ff");
	      this.renderContext.add(context3);

      },
      
      /**
       * Return a reference to the render context
       */
      getRenderContext: function(){
         return this.renderContext;
      },
      
      /**
       * Return a reference to the playfield box
       */
      getFieldBox: function() {
         return this.fieldBox;
      }
      
   });
};
