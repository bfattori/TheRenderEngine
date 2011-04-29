// Load all required engine components
R.Engine.define({
	"class": "Tutorial9",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.collision.broadphase.SpatialGrid",
      "R.resources.loaders.SpriteLoader"
	],

	// Game class dependencies
	"depends": [
		"Player",
      "Bomb",
      "Powerup"
	]
});

// Load the game objects
R.engine.Game.load("/player.js");
R.engine.Game.load("/bomb.js");
R.engine.Game.load("/powerup.js");

/**
 * @class Tutorial Nine.  Bringing sprites together with collision and
 * 		 a second render component.
 */
var Tutorial9 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      collisionModel: null,
      spriteLoader: null,

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

         // Create the collision model with 9x9 divisions
         this.collisionModel = R.collision.broadphase.SpatialGrid.create(480, 480, 9);

         this.spriteLoader = R.resources.loaders.SpriteLoader.create();

         // Load the sprites
         this.spriteLoader.load("sprites", this.getFilePath("resources/tutorial9.sprite"));

         // Wait until the resources are ready before running the game
         R.lang.Timeout.create("resourceWait", 250, function() {
            if (Tutorial9.spriteLoader.isReady()) {
               // Destroy the timer and start the game
               this.destroy();
               Tutorial9.run();
            } else {
               // Resources aren't ready, restart the timer
               this.restart();
            }
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.spriteLoader.destroy();
         this.collisionModel.destroy();
      },

      /**
       * Run the game as soon as all resources are ready.
       */
      run: function() {
         // Create the player and add it to the render context.
         this.renderContext.add(Player.create());

         // Now create some shields and bombs
         for (var i = 0; i < 3; i++) {
            this.renderContext.add(Powerup.create());
         }

         for (var i = 0; i < 3; i++) {
            this.renderContext.add(Bomb.create());
         }
      },

      /**
       * Return a reference to the playfield box
       */
      getPlayfield: function() {
         return this.renderContext.getViewport();
      }

   });
}
