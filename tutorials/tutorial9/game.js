// Load all required engine components
R.Engine.define({
	"class": "Tutorial9",
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
 * @class Tutorial Nine.  Load sounds and bitmaps from the server
 *        with the resource loader.
 */
var Tutorial9 = function() {
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
         Tutorial9.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 320, 271);
         Tutorial9.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(Tutorial9.renderContext);

         // The resource loaders
         Tutorial9.imageLoader = R.resources.loaders.ImageLoader.create();

         // Load the sounds, use a SoundManager2 sound system
         Tutorial9.soundLoader = R.resources.loaders.SoundLoader.create(new R.sound.SM2());

         // Begin the loading process
         Tutorial9.imageLoader.load("keys", Tutorial9.getFilePath("resources/fingerboard.png"), 220, 171);

         // Load each of the sound files
         $.each([["c1","low_c"],["d1","dee"],["e1","eee"],["f1","eff"],
                 ["g1","gee"],["a1","ay"],["b1","bee"],["c2", "hi_c"]], function() {
            Tutorial9.soundLoader.load(this[0], Tutorial9.getFilePath("resources/" + this[1] + ".mp3"));
         });

         // Wait until the image and sounds are loaded before proceeding
         this.loadTimeout = R.lang.Timeout.create("wait", 250, function() {
            if (Tutorial9.imageLoader.isReady() && Tutorial9.soundLoader.isReady()) {
               this.destroy();
               Tutorial9.run();
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
         Tutorial9.renderContext.add(PianoKeys.create());
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         Tutorial9.imageLoader.destroy();
         Tutorial9.soundLoader.destroy();
      }
   });
};
