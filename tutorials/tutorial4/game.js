// Load all required engine components
R.Engine.define({
	"class": "Tutorial4",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.resources.loaders.ImageLoader",
      "R.resources.loaders.SoundLoader",
      "R.sound.SM2"
	],

	// Game class dependencies
	"depends": [
		"PianoKeys"
	]
});

// Load the game object
R.engine.Game.load("/piano.js");

/**
 * @class Tutorial Four.  Load sounds and bitmaps from the server
 *        with the resource loader.  This tutorial does not work with
 *        Internet Explorer less than version 9 since FlashCanvas and
 *        SoundManager2 cannot load simultaneously.
 */
var Tutorial4 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      // References to the resource loaders
      imageLoader: null,
      soundLoader: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 320, 271);
         this.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(this.renderContext);

         // The resource loaders
         this.imageLoader = R.resources.loaders.ImageLoader.create();

         // Load the sounds, use a SoundManager2 sound system
         this.soundLoader = R.resources.loaders.SoundLoader.create(new R.sound.SM2());

         // Begin the loading process
         this.imageLoader.load("keys", this.getFilePath("resources/fingerboard.png"), 220, 171);

         // Load each of the sound files
         $.each([["c1","low_c"],["d1","dee"],["e1","eee"],["f1","eff"],
                 ["g1","gee"],["a1","ay"],["b1","bee"],["c2", "hi_c"]], function() {
            this.soundLoader.load(this[0], this.getFilePath("resources/" + this[1] + ".mp3"));
         });

         // Wait until the image and sounds are loaded before proceeding
         var self = this;
         this.loadTimeout = R.lang.Timeout.create("wait", 250, function() {
            if (Tutorial4.imageLoader.isReady() && Tutorial4.soundLoader.isReady()) {
               this.destroy();
               Tutorial4.run();
            }
            else {
               // Continue waiting
               this.restart();
            }
         });
      },

      /**
       * Run the game
       */
      run: function(){
         this.renderContext.add(PianoKeys.create());
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.imageLoader.destroy();
         this.soundLoader.destroy();
      }
   });
};
