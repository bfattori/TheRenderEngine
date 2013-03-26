// Load all required engine components
R.Engine.define({
   "class": "EmptyGame",
   "requires": [
      "R.engine.Game"
   ]
});

/*
 * This is the bare minimum "game" that The Render Engine can run.
 */
var EmptyGame = function() {
   return R.engine.Game.extend({
      setup: function() {
         $("body", document)
            .append($("<i>" + R.Engine.toString() + "</i><span> is " +
                      (R.Engine.running ? "running" : "not running") + "...</span>"));
      }
   });
};