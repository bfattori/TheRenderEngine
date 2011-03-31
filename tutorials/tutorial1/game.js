// Load all required engine components
R.Engine.define({
	"class": "Tutorial1",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
		"R.math.Rectangle2D"
	]
})

/**
 * @class Tutorial One.  Render a simple filled rectangle to
 *		 the Canvas context.
 */
var Tutorial1 = function(){
	return R.engine.Game.extend({
	
		constructor: null,
		
		// The rendering context
		renderContext: null,
		
		// Engine frames per second
		engineFPS: 15,
		
		// The play field
		fieldBox: null,
		fieldWidth: 200,
		fieldHeight: 200,
		
		/**
		 * Called to set up the game, download any resources, and initialize
		 * the game to its running state.
		 */
		setup: function(){
			// Set the FPS of the game
			R.Engine.setFPS(this.engineFPS);
			
			$("#loading").remove();
			
			// Create the render context
			this.fieldBox = R.math.Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
			this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", this.fieldWidth, this.fieldHeight);
			this.renderContext.setBackgroundColor("black");
			
			// Add the new rendering context to the default engine context
			R.Engine.getDefaultContext().add(this.renderContext);
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
		getFieldBox: function(){
			return this.fieldBox;
		}
		
	});
}