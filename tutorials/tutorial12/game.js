R.Engine.define({
	"class": "Tutorial12",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
		"R.rendercontexts.HTMLDivContext",
		"R.text.VectorText",
		"R.text.BitmapText",
		"R.text.ContextText",
		"R.text.TextRenderer",
		"R.resources.loaders.BitmapFontLoader",
		"R.lang.Timeout",
      "R.math.Rectangle2D",
      "R.math.Point2D"
	]
});

/**
 * @class Text rendering tutorial
 */
var Tutorial12 = function() {
   return R.engine.Game.extend({
   
      // The rendering context
      renderContext: null,

      // The font resource loader
      fontLoader: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function() {
         // Load the bitmap fonts used in the tutorial
			Tutorial12.fontLoader = R.resources.loaders.BitmapFontLoader.create();
			Tutorial12.fontLoader.load("lucida", "lucida_sans_36.font");
			Tutorial12.fontLoader.load("console", "press_start_24.font");
			Tutorial12.fontLoader.load("times", "times_36.font");
			
         // Don't start until all of the resources are loaded
         R.lang.Timeout.create("wait", 250, function(){
            if (Tutorial12.fontLoader.isReady("lucida") &&
                Tutorial12.fontLoader.isReady("console") &&
                Tutorial12.fontLoader.isReady("times")) {
                  Tutorial12.run();
                  this.destroy();
            } else {
               // Continue waiting
               this.restart();
            }
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         Tutorial12.renderContext.destroy();
         Tutorial12.fontLoader.destroy();
      },
      
      /**
       * Run the tutorial
       */
      run: function(){
         // Create the render context
         Tutorial12.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 760, 400);

         // This should also work in an HTML context
         // this.renderContext = R.rendercontexts.HTMLDivContext.create("Playfield", 760, 400);
	      Tutorial12.renderContext.setBackgroundColor("#000000");

         // Add the render context to the default context
         R.Engine.getDefaultContext().add(Tutorial12.renderContext);

         // The text to render
         var textStr = "ABCxyz123!@#$%^&*()[]+=_-",
             pos = R.math.Point2D.create(0,0);

		 	// Vector Text ----
			var vector1 = R.text.TextRenderer.create(R.text.VectorText.create(), textStr, 1.2);
			vector1.setPosition(pos.set(20, 20));
			vector1.setTextWeight(1);
			vector1.setColor("#ffffff");
			Tutorial12.renderContext.add(vector1);

			var vector2 = R.text.TextRenderer.create(R.text.VectorText.create(), textStr, 2);
			vector2.setPosition(pos.set(20, 43));
			vector2.setTextWeight(1);
			vector2.setColor("#ffffff");
			Tutorial12.renderContext.add(vector2);

			var vector3 = R.text.TextRenderer.create(R.text.VectorText.create(), textStr, 2.5);
			vector3.setPosition(pos.set(20, 80));
			vector3.setTextWeight(1);
			vector3.setColor("#ffffff");
			Tutorial12.renderContext.add(vector3);
			
			// Bitmap Text ----
			var bitmap1 = R.text.TextRenderer.create(R.text.BitmapText.create(Tutorial12.fontLoader.get("console")),
               textStr, 0.8);
			bitmap1.setPosition(pos.set(10, 135));
			bitmap1.setTextWeight(1);
			bitmap1.setColor("#ffff00");
			Tutorial12.renderContext.add(bitmap1);
			
			var bitmap2 = R.text.TextRenderer.create(R.text.BitmapText.create(Tutorial12.fontLoader.get("lucida")),
               textStr, 1);
			bitmap2.setPosition(pos.set(10, 160));
			bitmap2.setTextWeight(1);
			bitmap2.setColor("#ffff00");
			Tutorial12.renderContext.add(bitmap2);

			var bitmap3 = R.text.TextRenderer.create(R.text.BitmapText.create(Tutorial12.fontLoader.get("times")),
               textStr, 1.2);
			bitmap3.setPosition(pos.set(10, 195));
			bitmap3.setTextWeight(1);
			bitmap3.setColor("#ffff00");
			Tutorial12.renderContext.add(bitmap3);
			
			// Context Render ----
	      var context1 = R.text.TextRenderer.create(R.text.ContextText.create(), textStr, 12);
	      context1.setPosition(pos.set(10, 260));
	      context1.setColor("#8888ff");
	      Tutorial12.renderContext.add(context1);

	      var context2 = R.text.TextRenderer.create(R.text.ContextText.create(), textStr, 24);
	      context2.setPosition(pos.set(10, 288));
			context2.setTextFont("Times New Roman");
	      context2.setColor("#8888ff");
	      Tutorial12.renderContext.add(context2);

	      var context3 = R.text.TextRenderer.create(R.text.ContextText.create(), textStr, 36);
	      context3.setPosition(pos.set(10, 320));
			context3.setTextFont("Courier New");
			context3.setTextWeight(R.rendercontexts.RenderContext2D.FONT_WEIGHT_BOLD);
	      context3.setColor("#8888ff");
	      Tutorial12.renderContext.add(context3);

         pos.destroy();
      },
      
      /**
       * Return a reference to the render context
       */
      getRenderContext: function(){
         return this.renderContext;
      }
   });
};
