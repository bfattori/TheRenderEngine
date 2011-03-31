
/**
 * The Render Engine
 * IsometricDemo
 *
 * Demonstration of using The Render Engine.
 *
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1305 $
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

// Load all required engine components
R.Engine.requires("/engine.math2d.js");
R.Engine.requires("/engine.timers.js");

Game.load("/tilesets.js");
Game.load("/isometricmap.js");

R.Engine.initObject("IsometricDemo", "Game", function() {

/**
 * @class The game.
 */
var IsometricDemo = Game.extend({

   constructor: null,

   renderContext: null,

   fieldBox: null,
   centerPoint: null,
   areaScale: 1.0,

   engineFPS: 30,

   fieldWidth: 640,
   fieldHeight: 448,

   tileset: null,

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

      // Set the FPS of the game
      R.Engine.setFPS(this.engineFPS);

      this.tileset = TileSets.create("tiles", this.getFilePath("resources/tiles.json"));
		this.map = IsometricMap.create("countryside", this.getFilePath("resources/map.json"), Point2D.create(85, 85));
		var self = this;
		Timeout.create("run", 250, function() {
			if (self.tileset.isReady() &&
				 self.map.isReady()) {
				this.destroy();
				self.run();
			} else {
				this.restart();
			}
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
      this.fieldBox = Rectangle2D.create(0, 0, R.engine.Support.sysInfo().viewWidth, R.engine.Support.sysInfo().viewHeight);
      this.centerPoint = this.fieldBox.getCenter();

      this.renderContext = HTMLDivContext.create("bkg", this.fieldBox.get().w, this.fieldBox.get().h);
      R.Engine.getDefaultContext().add(this.renderContext);
		
		this.map.setTileSets(this.tileset);
		R.Engine.getDefaultContext().add(this.map);
   },

   play: function() {
   },

   getRenderContext: function() {
      return this.renderContext;
   }

});

return IsometricDemo;

});