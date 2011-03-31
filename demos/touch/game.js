/**
 * The Render Engine
 * Touchdown!
 *
 * A simple game of jewel matching
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
R.Engine.requires("/resourceloaders/loader.sprite.js");
R.Engine.requires("/engine.timers.js");

// Load game objects
//Game.load("/wiihost.js");

R.Engine.initObject("Touchdown", "Game", function(){

   /**
    * @class Jewel matching game
    */
   var Touchdown = Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // Engine frames per second
      engineFPS: 15,
      
      // The play field
      fieldBox: null,
      fieldWidth: 800,
      fieldHeight: 460,

      // Sprite resource loader
      spriteLoader: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         R.Engine.setFPS(this.engineFPS);
         
         this.spriteLoader = SpriteLoader.create();
         
         // Load the sprites
         this.spriteLoader.load("ui", this.getFilePath("resources/gameui.js"));
         
         // Don't start until all of the resources are loaded
         this.loadTimeout = Timeout.create("wait", 250, Touchdown.waitForResources);
      },
      
      /**
       * Wait for resources to become available before starting the game
       * @private
       */
      waitForResources: function(){
         if (Touchdown.spriteLoader.isReady()) {
            this.destroy();
            Touchdown.run();
         } else {
            // Continue waiting
            this.restart();
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
			R.engine.Support.sysInfo();
			$("body").scrollTop(0);
			this.fieldWidth = R.engine.Support.sysInfo().viewWidth;
			this.fieldHeight = R.engine.Support.sysInfo().viewHeight;
         // Create the render context
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.centerPoint = this.fieldBox.getCenter();
			this.renderContext = CanvasContext.create("Playfield", this.fieldWidth, this.fieldHeight);
	      this.renderContext.setBackgroundColor("#000000");

         R.Engine.getDefaultContext().add(this.renderContext);
			
			this.mainScreen();
      },

		mainScreen: function() {
				
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
   
   return Touchdown;
   
});
