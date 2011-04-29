
/**
 * The Render Engine
 * SpriteDemo
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
	"class": "SpriteDemo",
	"requires": [
		"R.engine.Game",
		"R.engine.Events",

		// The render context
		"R.rendercontexts.ScrollingBackgroundContext",

		// Resource loaders and types
		"R.resources.loaders.SoundLoader",
		"R.resources.loaders.SpriteLoader",
		"R.resources.loaders.LevelLoader",
		"R.resources.types.Level",
		"R.resources.types.Sprite",

		// Sound engine
		"R.sound.SM2",

		"R.storage.PersistentStorage",
		"R.math.Math2D",
		
		// Game objects
		"R.objects.SpriteActor",
		"R.objects.CollisionBox"
	],
	
	"includes": [
		"/../tools/level_editor/level_editor.js"
	],
	
	// Game class dependencies
	"depends": [
	]
});

/**
 * @class The game.
 */
var SpriteDemo = function() {
	return R.engine.Game.extend({

   constructor: null,

   renderContext: null,
   scrollBkg: null,

   fieldBox: null,
   centerPoint: null,
   areaScale: 1.0,

   fieldWidth: 640,
   fieldHeight: 448,

   spriteLoader: null,
   soundLoader: null,
   levelLoader: null,

   level: null,

   /**
    * Handle the keypress which starts the game
    *
    * @param event {Event} The event object
   onKeyPress: function(event) {
      if (event.keyCode == EventEngine.KEYCODE_ENTER)
      {
         Spaceroids.startGame();
      }
   },
    */

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

      this.spriteLoader = R.resources.loaders.SpriteLoader.create();
      this.soundLoader = R.resources.loaders.SoundLoader.create(new R.sound.SM2());
      this.levelLoader = R.resources.loaders.LevelLoader.create();

      // Load the music
      this.soundLoader.load("bgm", this.getFilePath("resources/smblvl1.mp3"));

      // Load the level
      this.levelLoader.load("level1", this.getFilePath("resources/smblevel1.level"));

      // Load the sprites
      this.spriteLoader.load("smbtiles", this.getFilePath("resources/smbtiles.sprite"));
      
		// Wait for resources to load
		R.lang.Timeout.create("wait", 250, function() {
			if (SpriteDemo.spriteLoader.isReady() && 
				 SpriteDemo.levelLoader.isReady() && 
				 SpriteDemo.soundLoader.isReady()) {
				 	this.destroy();
					SpriteDemo.run();
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
      this.fieldBox = R.math.Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
      this.centerPoint = this.fieldBox.getCenter();

      this.level = this.levelLoader.getLevel("level1");

      this.renderContext = R.rendercontexts.ScrollingBackgroundContext.create("bkg", this.level, this.fieldWidth, this.fieldHeight);
      this.renderContext.setWorldScale(this.areaScale);
      R.Engine.getDefaultContext().add(this.renderContext);

      //if (R.engine.Support.checkBooleanParam("edit")) {
         LevelEditor.edit(this);
      //} else {
      //   this.play();
      //}
   },

   play: function() {
      this.soundLoader.get("bgm").play();

      var player = R.objects.SpriteActor.create();
      player.setSprite(this.spriteLoader.getSprite("smbtiles", "super_walk"));
      player.setPosition(R.math.Point2D.create(100, 338));
      this.renderContext.add(player);

      var mario = R.objects.SpriteActor.create();
      mario.setSprite(this.spriteLoader.getSprite("smbtiles", "mario_walk"));
      mario.setPosition(R.math.Point2D.create(228, 370));
      this.renderContext.add(mario);
   },

   getLevel: function() {
      return this.level;
   },

   getRenderContext: function() {
      return this.renderContext;
   }

});
}