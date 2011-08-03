R.Engine.define({
   "class": "Tutorial13",
   "requires": [
      "R.engine.Game",
      "R.rendercontexts.CanvasContext",
      "R.collision.broadphase.SpatialGrid",
      "R.resources.loaders.SpriteLoader",
      "R.particles.ParticleEngine"
   ],

   // Game class dependencies
   "depends": [
      "Player",
      "Bomb",
      "Powerup",
      "ExplosionParticle",
      "FuseParticle"
   ]
});

// Load the game objects
R.engine.Game.load("/player.js");
R.engine.Game.load("/bomb.js");
R.engine.Game.load("/powerup.js");
R.engine.Game.load("/particle.js");

/**
 * @class Tutorial Thirteen.  Introduction to the particle system and using
 *    particle emitters.
 */
var Tutorial13 = function() {
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
         Tutorial13.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 480, 480);
         Tutorial13.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(Tutorial13.renderContext);

         // Create the collision model with 9x9 divisions
         Tutorial13.collisionModel = R.collision.broadphase.SpatialGrid.create(480, 480, 9);

         // Create a particle engine
         Tutorial13.pEngine = R.particles.ParticleEngine.create();
         Tutorial13.renderContext.add(Tutorial13.pEngine);

         // Load the sprites
         Tutorial13.spriteLoader = R.resources.loaders.SpriteLoader.create();
         Tutorial13.spriteLoader.load("sprites", Tutorial13.getFilePath("resources/tutorial13.sprite"));

         // Wait until the resources are ready before running the game
         R.lang.Timeout.create("resourceWait", 250, function() {
            if (Tutorial13.spriteLoader.isReady()) {
               // Destroy the timer and start the game
               this.destroy();
               Tutorial13.run();
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
         Tutorial13.spriteLoader.destroy();
         Tutorial13.collisionModel.destroy();
      },

      /**
       * Run the game as soon as all resources are ready.
       */
      run: function() {
         // Create the player and add it to the render context.
         Tutorial13.renderContext.add(Player.create());

         // Now create some shields and bombs
         for (var i = 0; i < 3; i++) {
            Tutorial13.renderContext.add(Powerup.create());
         }

         for (var i = 0; i < 3; i++) {
            Tutorial13.renderContext.add(Bomb.create());
         }

      },

      /**
       * Return a reference to the playfield rectangle
       */
      getPlayfield: function() {
         return Tutorial13.renderContext.getViewport();
      }

   });
};