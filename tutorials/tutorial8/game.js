R.Engine.define({
   "class": "Tutorial8",
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
 * @class Tutorial Eight.  Upgrading collision to use convex hulls which
 *        are more accurate, plus give you feedback on the collision itself
 *        so an appropriate response can occur.
 */
var Tutorial8 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      collisionModel: null,
      spriteLoader: null,

      pEngine: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function() {
         // Create the render context
         Tutorial8.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 480, 480);
         Tutorial8.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(Tutorial8.renderContext);

         // Create the collision model with 9x9 divisions
         Tutorial8.collisionModel = R.collision.broadphase.SpatialGrid.create(480, 480, 9);

         // Load the sprites
         Tutorial8.spriteLoader = R.resources.loaders.SpriteLoader.create();
         Tutorial8.spriteLoader.load("sprites", Tutorial8.getFilePath("resources/tutorial11.sprite"));

         // Wait until the resources are ready before running the game
         R.lang.Timeout.create("resourceWait", 250, function() {
            if (Tutorial8.spriteLoader.isReady()) {
               // Destroy the timer and start the game
               this.destroy();
               Tutorial8.run();
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
      teardown: function() {
         Tutorial8.spriteLoader.destroy();
         Tutorial8.collisionModel.destroy();
      },

      /**
       * Run the game as soon as all resources are ready.
       */
      run: function() {
         // Create the player and add it to the render context.
         Tutorial8.renderContext.add(Player.create());

         // Now create some shields and bombs
         for (var i = 0; i < 3; i++) {
            Tutorial8.renderContext.add(Powerup.create());
         }

         for (var i = 0; i < 3; i++) {
            Tutorial8.renderContext.add(Bomb.create());
         }

      },

      /**
       * Return a reference to the playfield rectangle
       */
      getPlayfield: function() {
         return Tutorial8.renderContext.getViewport();
      }

   });
};