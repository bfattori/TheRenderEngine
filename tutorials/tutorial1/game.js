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
			// Create the render context
			var renderContext = R.rendercontexts.HTMLDivContext.create("Playfield", 200, 200);
			renderContext.setBackgroundColor("black");

			// Add the new rendering context to the default engine context
			R.Engine.getDefaultContext().add(renderContext);

         // Draw some text on the context
         renderContext.setFillStyle("#ffffff");
         renderContext.drawText(R.math.Point2D.create(50, 75), "Hello World!");
		}
	});
};