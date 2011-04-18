// Load all required engine components
R.Engine.define({
	"class": "Tutorial1",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext"
	]
});

/**
 * @class Tutorial One.  Creating a render context.
 */
var Tutorial1 = function(){
	return R.engine.Game.extend({

		/**
		 * Called to set up the game and initialize it to a running state.
		 */
		setup: function(){
			// Create the render context
			var renderContext = R.rendercontexts.CanvasContext.create("Playfield", 200, 200);
			renderContext.setBackgroundColor("black");
			
			// Add the new rendering context to the default engine context
			R.Engine.getDefaultContext().add(renderContext);


		}
	});
}