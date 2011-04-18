// Load all required engine components
R.Engine.define({
	"class": "Tutorial5",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.resources.loaders.BitmapFontLoader",
      "R.math.Math2D",

      "R.text.TextRenderer",
      "R.text.VectorText",
      "R.text.BitmapText",
      "R.text.ContextText"
	]
});

/**
 * @class This tutorial shows how to use the text renderers.
 */
var Tutorial5 = function() {
   return R.engine.Game.extend({

      // The bitmap font loader
      fontLoader: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         this.fontLoader = R.resources.loaders.BitmapFontLoader.create();
         this.fontLoader.load("century", "century_gothic_36.font");

         // Don't start until all of the resources are loaded
         var self = this;
         this.loadTimeout = R.lang.Timeout.create("wait", 250, function() {
            if (Tutorial5.fontLoader.isReady("century")) {
               this.destroy();
               Tutorial5.run();
            } else {
               this.restart();
            }
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.fontLoader.destroy();
      },

      /**
       * Run the game
       */
      run: function(){
         // Create the render context
         var renderContext = R.rendercontexts.CanvasContext.create("Playfield",
               400, 320);
         renderContext.setBackgroundColor("black");

         // Add the render context
         R.Engine.getDefaultContext().add(renderContext);

         // Vector Text
         var vText = R.text.TextRenderer.create(R.text.VectorText.create(),
               "Vector Text Renderer", 2.5);
         vText.setPosition(R.math.Point2D.create(20, 40));
         vText.setTextWeight(1);
         vText.setColor("#ffffff");
         renderContext.add(vText);

         // Bitmap Text
         var bText = R.text.TextRenderer.create(
               R.text.BitmapText.create(this.fontLoader.get("century")),
               "Bitmap Text Renderer", 1.5);
         bText.setPosition(R.math.Point2D.create(10, 120));
         bText.setTextWeight(1);
         bText.setColor("#ff0000");
         renderContext.add(bText);

         // Native Context Text
         var cText = R.text.TextRenderer.create(R.text.ContextText.create(),
               "Context Native Text Renderer", 2.5);
         cText.setPosition(R.math.Point2D.create(10, 260));
         cText.setTextFont("Verdana");
         cText.setColor("#8888ff");
         renderContext.add(cText);
      }
   });
};
