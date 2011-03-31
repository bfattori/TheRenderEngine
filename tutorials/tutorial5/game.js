/**
 * The Render Engine
 * Tutorial 5
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
R.Engine.requires("/textrender/text.vector.js");
R.Engine.requires("/textrender/text.bitmap.js");
R.Engine.requires("/textrender/text.context.js");
R.Engine.requires("/textrender/text.renderer.js");
R.Engine.requires("/resourceloaders/loader.bitmapfont.js");
R.Engine.requires("/engine.timers.js");

R.Engine.initObject("Tutorial5", "Game", function(){

   /**
    * @class This tutorial shows how to use the text renderers.
    */
   var Tutorial5 = Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // Engine frames per second
      engineFPS: 5,
      
      // The play field
      fieldBox: null,
      fieldWidth: 400,
      fieldHeight: 320,
      
      // The bitmap font loader
      fontLoader: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         R.Engine.setFPS(this.engineFPS);
         
         this.fontLoader = BitmapFontLoader.create();
         this.fontLoader.load("century", "century_gothic_36.font");
         
         // Don't start until all of the resources are loaded
         var self = this;
         this.loadTimeout = Timeout.create("wait", 250, function() {
            self.waitForResources();
         });
         this.waitForResources();
      },

      /**
       * Wait for resources to become available before starting the game
       * @private
       */
      waitForResources: function(){
         if (this.fontLoader.isReady("century")) {
               this.loadTimeout.destroy();
               this.run();
               return;
         }
         else {
            // Continue waiting
            this.loadTimeout.restart();
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
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.renderContext = CanvasContext.create("Playfield", this.fieldWidth, 
                     this.fieldHeight);
         this.renderContext.setBackgroundColor("#000000");
         
         // Add the render context
         R.Engine.getDefaultContext().add(this.renderContext);

         // Vector Text
         var vText = TextRenderer.create(VectorText.create(), 
                  "Vector Text", 2.5);
         vText.setPosition(Point2D.create(20, 40));
         vText.setTextWeight(1);
         vText.setColor("#ffffff");
         this.renderContext.add(vText);
         
         // Bitmap Text
         var bText = TextRenderer.create(BitmapText.create(this.fontLoader.get("century")), 
                  "Bitmap Text", 1.5);
         bText.setPosition(Point2D.create(10, 120));
         bText.setTextWeight(1);
         bText.setColor("#ff0000");
         this.renderContext.add(bText);
         
         // Native Context Text
         var cText = TextRenderer.create(ContextText.create(), 
                  "Context Native Text", 2.5);
         cText.setPosition(Point2D.create(10, 260));
         cText.setTextFont("Verdana")
         cText.setColor("#8888ff");
         this.renderContext.add(cText);
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
   
   return Tutorial5;
   
});
