/**
 * The Render Engine
 * TilemapDemo
 *
 * Demonstration of using The Render Engine.
 *
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1527 $
 *
 * Copyright (c) 2008 Brett Fattori (brettf@renderengine.com)
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
   "class": "TilemapDemo",
   "requires": [
      "R.engine.Game",
      "R.engine.Events",

      // The render context
      "R.rendercontexts.VirtualCanvasContext",
      "R.rendercontexts.VirtualHTMLDivContext",

      // Resource loaders and types
      "R.resources.loaders.LevelLoader",
      "R.resources.types.Level",
      "R.resources.types.Sprite",
      "R.resources.types.Tile",
      "R.resources.types.TileMap",

      "R.math.Math2D",

      // Game objects
      "R.objects.SpriteActor",
      "R.objects.Fixture"
   ],

   // Game class dependencies
   "depends": [
   ]
});

/**
 * @class The game.
 */
var TilemapDemo = function() {
   return R.engine.Game.extend({

      constructor: null,

      renderContext: null,

      centerPoint: null,
      areaScale: 1.0,

      levelLoader: null,
      level: null,

      /**
       * This method is being used to clean up the demo container.
       * Each demo is loaded into this container, and when a demo
       * is unloaded we can call this method to clean it up.
       */
      cleanup: function() {
         this.renderContext.cleanUp();
      },

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function() {
         this.levelLoader = R.resources.loaders.LevelLoader.create();
         this.levelLoader.load("level1", this.getFilePath("levels/play.level"));

         // Attach to the "isready" event on the loader which is
         // fired when all resources have been loaded
         this.levelLoader.addEvent(this, "isready", function() {
            TilemapDemo.run();
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function() {
         this.renderContext.destroy();
      },

      run: function() {
         // Create the 2D context
         this.renderContext = R.rendercontexts.VirtualHTMLDivContext.create("playfield", 800, 600, 3200, 3200);
         this.renderContext.setWorldScale(this.areaScale);
         R.Engine.getDefaultContext().add(this.renderContext);
         this.renderContext.setBackgroundColor("#0a0a0a");

         // Attach the level to the render context which puts it in motion
         this.levelLoader.getLevel("level1").setRenderContext(this.renderContext);
      },

      getRenderContext: function() {
         return this.renderContext;
      }
   });
};