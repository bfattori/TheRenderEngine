// Load all required engine components
R.Engine.define({
	"class": "Tutorial5",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext"
	],

	// Game class dependencies
	"depends": [
		"GameObject"
	]
});

// Load the game object
R.engine.Game.load("/gameObject.js");

/**
 * @class Tutorial Two.  Generate a simple vector drawn object and
 *        allow the player to move it with the keyboard.
 */
var Tutorial6 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         this.renderContext = CanvasContext.create("Playfield",
               480, 480);
         this.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(this.renderContext);

         // Create the game object and add it to the render context.
         // It'll start animating immediately.
         this.renderContext.add(GameObject.create());
      },

      /**
       * Return a reference to the playfield box
       */
      getFieldRect: function() {
         return this.renderContext.getViewport();
      }

   });
};
