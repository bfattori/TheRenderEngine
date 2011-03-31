// Load all required engine components
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/resourceloaders/loader.image.js");
R.Engine.requires("/resourceloaders/loader.sound.js");
R.Engine.requires("/engine.timers.js");


// Load the game object
Game.load("/piano.js");

R.Engine.initObject("Tutorial4", "Game", function(){

   /**
    * @class Tutorial Four.  Load sounds and bitmaps from the server
    *        with the resource loader.  This tutorial does not work with
    *        Internet Explorer less than version 9 since FlashCanvas and
    *        SoundManager2 cannot load simultaneously.
    */
   var Tutorial4 = Game.extend({

      constructor: null,

      // The rendering context
      renderContext: null,

      // Engine frames per second
      engineFPS: 25,

      // The play field
      fieldBox: null,
      fieldWidth: 320,
      fieldHeight: 271,
      
      // References to the resource loaders
      imageLoader: null,
      soundLoader: null,
      loadTimeout: null,

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
         
         // The resource loaders
         this.imageLoader = ImageLoader.create();
         this.soundLoader = SoundLoader.create();
         
         // Begin the loading process
         this.imageLoader.load("keys", this.getFilePath("resources/fingerboard.png"), 220, 171);
         this.soundLoader.load("c1", this.getFilePath("resources/low_c.mp3"));
         this.soundLoader.load("d1", this.getFilePath("resources/dee.mp3"));
         this.soundLoader.load("e1", this.getFilePath("resources/eee.mp3"));
         this.soundLoader.load("f1", this.getFilePath("resources/eff.mp3"));
         this.soundLoader.load("g1", this.getFilePath("resources/gee.mp3"));
         this.soundLoader.load("a1", this.getFilePath("resources/ay.mp3"));
         this.soundLoader.load("b1", this.getFilePath("resources/bee.mp3"));
         this.soundLoader.load("c2", this.getFilePath("resources/hi_c.mp3"));
         
         // Wait until the image and sounds are loaded before proceeding
         var self = this;
         this.loadTimeout = Timeout.create("wait", 250, function() {
	         if (Tutorial4.imageLoader.isReady() && Tutorial4.soundLoader.isReady()) {
	               this.destroy();
	               Tutorial4.run();
	               return;
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
         this.renderContext.add(PianoKeys.create());
      },
   
      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.renderContext.destroy();
         this.imageLoader.destroy();
         this.soundLoader.destrow();
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

   return Tutorial4;

});