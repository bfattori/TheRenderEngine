// Load all required engine components
R.Engine.define({
	"class": "Tutorial5",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.collision.broadphase.SpatialGrid",
      "R.math.Math2D"
	],

	// Game class dependencies
	"depends": [
		"GameObject",
      "TouchObject"
	]
});

// Load the game object
R.engine.Game.load("/gameObject.js");
R.engine.Game.load("/touchObject.js");

/**
 * @class Tutorial Five.  Broad Phase Collisions.
 */
var Tutorial5 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      // The broad phase collision model
      collisionModel: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         Tutorial5.renderContext = R.rendercontexts.CanvasContext.create("Playfield",
               480, 480);
         Tutorial5.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(Tutorial5.renderContext);

         // Create the collision model with 5x5 divisions
         Tutorial5.collisionModel = R.collision.broadphase.SpatialGrid.create(480, 480, 5);

         // Create the game object and add it to the render context.
         Tutorial5.renderContext.add(GameObject.create());

         // Now create some touchable and non-touchable objects
         for (var i = 0; i < 3; i++) {
            Tutorial5.renderContext.add(TouchObject.create(true));
         }

         for (var i = 0; i < 3; i++) {
            Tutorial5.renderContext.add(TouchObject.create(false));
         }
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         Tutorial5.collisionModel.destroy();
      },

      /**
       * Return a reference to the playfield box
       */
      getFieldRect: function() {
         return Tutorial5.renderContext.getViewport();
      }

   });
};
