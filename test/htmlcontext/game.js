// Load all required engine components
R.Engine.define({
   "class": "HTMLContextTest",
   "requires": [
      "R.engine.Game",
      "R.rendercontexts.HTMLDivContext"
   ],

   // Game class dependencies
   "depends": [
      "Player"
   ]
});

R.engine.Game.load("box.js");

/**
 * @class HTML Context testing.
 */
var HTMLContextTest = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function() {

         // Create the render context
         this.renderContext = R.rendercontexts.HTMLDivContext.create("Playfield", 480, 480);

         this.renderContext.setBackgroundColor("#000000");
         R.Engine.getDefaultContext().add(this.renderContext);

         for (var x = 0; x < 5; x++) {
            this.renderContext.add(Player.create());
         }
      }

   });
}