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
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/rendercontexts/context.htmldivcontext.js");
R.Engine.requires("/textrender/text.vector.js");
R.Engine.requires("/textrender/text.bitmap.js");
R.Engine.requires("/textrender/text.context.js");
R.Engine.requires("/textrender/text.renderer.js");
R.Engine.requires("/resourceloaders/loader.bitmapfont.js");
R.Engine.requires("/engine.timers.js");

R.Engine.initObject("FontTest", "Game", function(){

   /**
    * @class Wii ball bounce game.  Press the A button over a ball
    *        to make it bounce.  Press A when not over a ball to create
    *        another ball.
    */
   var FontTest = Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // Engine frames per second
      engineFPS: 30,
      
      // The play field
      fieldBox: null,
      fieldWidth: 700,
      fieldHeight: 400,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         R.Engine.setFPS(this.engineFPS);
			
			FontTest.fontLoader = BitmapFontLoader.create();
			FontTest.fontLoader.load("lucida", "lucida_sans_36.font");
			FontTest.fontLoader.load("century", "century_gothic_36.font");
			FontTest.fontLoader.load("times", "times_36.font");
			
         // Don't start until all of the resources are loaded
         FontTest.loadTimeout = Timeout.create("wait", 250, FontTest.waitForResources);
         this.waitForResources();
      },

      /**
       * Wait for resources to become available before starting the game
       * @private
       */
      waitForResources: function(){
         if (FontTest.fontLoader.isReady("lucida") &&
				 FontTest.fontLoader.isReady("century") &&
				 FontTest.fontLoader.isReady("times")) {
               FontTest.loadTimeout.destroy();
               FontTest.run();
               return;
         }
         else {
            // Continue waiting
            FontTest.loadTimeout.restart();
         }
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
         // Remove the "loading" message
         $("#loading").remove();
         
         // Create the render context
         this.fieldWidth = R.Engine.getDebugMode() ? 400 : this.fieldWidth;
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.centerPoint = this.fieldBox.getCenter();
			var ctx = R.engine.Support.getNumericParam("context", 1);
			if (ctx == 1) {
				this.renderContext = CanvasContext.create("Playfield", this.fieldWidth, this.fieldHeight);
			} else {
				this.renderContext = HTMLDivContext.create("Playfield", this.fieldWidth, this.fieldHeight);
			}
			
	      this.renderContext.setBackgroundColor("#000000");
         R.Engine.getDefaultContext().add(this.renderContext);

		 	// Vector Text
			var vector1 = TextRenderer.create(VectorText.create(), "ABCxyz123!@#$%^&*()", 1);
			vector1.setPosition(Point2D.create(20, 20));
			vector1.setTextWeight(1);
			vector1.setColor("#ffffff");
			this.renderContext.add(vector1);
			
			var vector2 = TextRenderer.create(VectorText.create(), "ABCxyz123!@#$%^&*()", 2);
			vector2.setPosition(Point2D.create(20, 43));
			vector2.setTextWeight(1);
			vector2.setColor("#ffffff");
			this.renderContext.add(vector2);
			
			var vector3 = TextRenderer.create(VectorText.create(), "ABCxyz123!@#$%^&*()", 2.5);
			vector3.setPosition(Point2D.create(20, 80));
			vector3.setTextWeight(1);
			vector3.setColor("#ffffff");
			this.renderContext.add(vector3);
			
			// Bitmap Text
			var bitmap1 = TextRenderer.create(BitmapText.create(FontTest.fontLoader.get("century")), "ABCxyz123!@#$%^&*()", 0.75);
			bitmap1.setPosition(Point2D.create(10, 120));
			bitmap1.setTextWeight(1);
			bitmap1.setColor("#ff0000");
			this.renderContext.add(bitmap1);
			
			var bitmap2 = TextRenderer.create(BitmapText.create(FontTest.fontLoader.get("lucida")), "ABCxyz123!@#$%^&*()", 1);
			bitmap2.setPosition(Point2D.create(10, 143));
			bitmap2.setTextWeight(1);
			bitmap2.setColor("#ff0000");
			this.renderContext.add(bitmap2);
			
			var bitmap3 = TextRenderer.create(BitmapText.create(FontTest.fontLoader.get("times")), "ABCxyz123!@#$%^&*()", 1.5);
			bitmap3.setPosition(Point2D.create(10, 175));
			bitmap3.setTextWeight(1);
			bitmap3.setColor("#ff0000");
			this.renderContext.add(bitmap3);
			
			// Context Render
	      var context1 = TextRenderer.create(ContextText.create(), "ABCxyz123!@#$%^&*()", 1);
	      context1.setPosition(Point2D.create(10, 260));
	      context1.setColor("#8888ff");
	      this.renderContext.add(context1);

	      var context2 = TextRenderer.create(ContextText.create(), "ABCxyz123!@#$%^&*()", 2);
	      context2.setPosition(Point2D.create(10, 288));
			context2.setTextFont("Times New Roman");
	      context2.setColor("#8888ff");
	      this.renderContext.add(context2);

	      var context3 = TextRenderer.create(ContextText.create(), "ABCxyz123!@#$%^&*()", 2.5);
	      context3.setPosition(Point2D.create(10, 320));
			context3.setTextFont("Courier New");
			context3.setTextWeight(RenderContext2D.FONT_WEIGHT_BOLD);
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
   
   return FontTest;
   
});
