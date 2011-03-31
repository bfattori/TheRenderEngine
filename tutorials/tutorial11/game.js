// Load all required engine components
R.Engine.requires("/rendercontexts/context.canvascontext.js");

// Load the collision model
R.Engine.requires("/spatial/container.spatialgrid.js");

// Load the sprite resource loader
R.Engine.requires("/resourceloaders/loader.sprite.js");

// Load the timers
R.Engine.requires("/engine.timers.js");

// Load the particle engine
R.Engine.requires("/engine.particles.js");


// Load the game objects
Game.load("/player.js");
Game.load("/bomb.js");
Game.load("/powerup.js");
Game.load("/particle.js");

R.Engine.initObject("Tutorial11", "Game", function(){

   /**
    * @class Tutorial Eleven.  Upgrading collision to use convex hulls which
    * 		 are more accurate, plus give you feedback on the collision itself
    * 		 so an appropriate response can occur.  Additionally, we introduce
    * 		 the particle engine for more interesting explosions.
    */
   var Tutorial11 = Game.extend({

      constructor: null,

      // The rendering context
      renderContext: null,

      // Engine frames per second
      engineFPS: 30,

      // The play field
      fieldBox: null,
      fieldWidth: 480,
      fieldHeight: 480,
		
		collisionModel: null,
		spriteLoader: null,
		
		pEngine: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         R.Engine.setFPS(this.engineFPS);
			
         // Create the render context
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.renderContext = CanvasContext.create("Playfield",
                                                   this.fieldWidth, this.fieldHeight);
         this.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(this.renderContext);
			
			// Create the collision model with 9x9 divisions
			this.collisionModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 9);

			// Create a particle engine
			this.pEngine = ParticleEngine.create();
			this.renderContext.add(this.pEngine);			
         
         // Load the sprites
			this.spriteLoader = SpriteLoader.create();
         this.spriteLoader.load("sprites", this.getFilePath("resources/tutorial11.sprite"));
			
			// Wait until the resources are ready before running the game
			Timeout.create("resourceWait", 250, function() {
				if (Tutorial11.spriteLoader.isReady()) {
					// Destroy the timer and start the game
					this.destroy();
					Tutorial11.run();
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
         this.renderContext.destroy();
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
       * Return a reference to the render context
       */
      getRenderContext: function(){
         return this.renderContext;
      },

      /**
       * Return a reference to the playfield box
       */
      getFieldBox: function() {
         return this.fieldBox;
      }

   });

   return Tutorial11;

});