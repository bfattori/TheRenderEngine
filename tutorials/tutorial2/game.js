// Load all required engine components
R.Engine.define({
	"class": "Tutorial2",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext"
	],

	// Game class dependencies
	"depends": [
		"BlockPlayer"
	]
});

// Load the game object class file which satisfies the dependency above for "GameObject"
R.engine.Game.load("/blockPlayer.js");

/**
 * @class Tutorial Two.  Generate a simple box and
 * 		 bounce it around the playfield.
 */
var Tutorial2 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 480, 480);
         this.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(this.renderContext);

         // Create the game object and add it to the render context.
         // It'll start animating immediately.
         this.renderContext.add(BlockPlayer.create());
      },

      /**
       * Return a reference to the playfield box
       */
      getFieldRect: function() {
         return this.renderContext.getViewport();
      }

   });
};
