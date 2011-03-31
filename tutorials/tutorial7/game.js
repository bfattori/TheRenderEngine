// Load all required engine components
R.Engine.requires("/rendercontexts/context.canvascontext.js");

// Load the collision model
R.Engine.requires("/spatial/container.spatialgrid.js");

// Load the game object
Game.load("/gameObject.js");
Game.load("/touchObject.js");

R.Engine.initObject("Tutorial7", "Game", function(){

   /**
    * @class Tutorial Seven.  Collision tutorial.
    */
   var Tutorial7 = Game.extend({

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

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         R.Engine.setFPS(this.engineFPS);
			
			$("#loading").remove();

         // Create the render context
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.renderContext = CanvasContext.create("Playfield",
                                                   this.fieldWidth, this.fieldHeight);
         this.renderContext.setBackgroundColor("black");

         // Add the new rendering context to the default engine context
         R.Engine.getDefaultContext().add(this.renderContext);
			
			// Create the collision model with 5x5 divisions
			this.collisionModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 5);
			
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
         this.renderContext.destroy();
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

   return Tutorial7;

});