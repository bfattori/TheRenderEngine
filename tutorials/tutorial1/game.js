// Load all required engine components
R.Engine.define({
	"class": "Tutorial1",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.HTMLDivContext",
         
      "R.math.Math2D"
	]
});

/**
 * @class Tutorial One.  Hello World.
 */
var Tutorial1 = function(){
	return R.engine.Game.extend({

		/**
		 * Called to set up the game and initialize it to a running state.
		 */
		setup: function(){
			// Create the render context.  We give it a width and height of 200 pixels and
         // set the background color to black so we can see it against the white browser
         // background.
			var renderContext = R.rendercontexts.HTMLDivContext.create("Playfield", 200, 200);
			renderContext.setBackgroundColor("black");

			// Add the new rendering context to the default engine context. Doing this
         // will cause "renderContext" to be updated whenever the engine's default
         // context is updated.
			R.Engine.getDefaultContext().add(renderContext);

         // Draw some text on the context by calling its drawText() method directly.
         // In a later tutorial, you'll use text renderers which is the proper way to
         // render text.
         renderContext.setFillStyle("#ffffff");
         renderContext.drawText(R.math.Point2D.create(50, 75), "Hello World!");
		}
	});
};