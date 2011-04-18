// Load all required engine components
R.Engine.define({
	"class": "Tutorial7",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.collision.broadphase.SpatialGrid",
      "R.math.Math2D"
	]
});

// Load the game object
R.engine.Game.load("/gameObject.js");
R.engine.Game.load("/touchObject.js");

/**
 * @class Tutorial Seven.  Collision tutorial.
 */
var Tutorial7 = function() {
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
         this.renderContext = R.rendercontexts.CanvasContext.create("Playfield",
               480, 480);
         this.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(this.renderContext);

         // Create the collision model with 5x5 divisions
         this.collisionModel = R.collision.broadphase.SpatialGrid.create(480, 480, 5);

         // Create the game object and add it to the render context.
         this.renderContext.add(GameObject.create());

         // Now create some touchable and non-touchable objects
         for (var i = 0; i < 3; i++) {
            this.renderContext.add(TouchObject.create(true));
         }

         for (var i = 0; i < 3; i++) {
            this.renderContext.add(TouchObject.create(false));
         }
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.collisionModel.destroy();
      },

      /**
       * Return a reference to the playfield box
       */
      getFieldRect: function() {
         return this.renderContext.getViewport();
      }

   });
};
