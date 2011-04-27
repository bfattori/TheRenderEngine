// Load all required engine components
R.Engine.define({
   "class": "Player",
   "requires": [
      "R.engine.Object2D",
      "R.math.Math2D",

      "R.components.render.DOM"
   ]
});

var Player = function() {
   return R.engine.Object2D.extend({

      spinRate: null,

      constructor: function() {
         this.base("box");

         this.setPosition(R.math.Math2D.randomPoint(HTMLContextTest.renderContext.getViewport()));

         // Set the spin rate to a random value
         this.spinRate = 1 + R.lang.Math2.random() * 5;

         // Add the DOM render component.  This is what
         // causes the transformations to be updated each frame
         // for a simple DOM object.
         this.add(R.components.render.DOM.create("draw"));

         // The representation of this object in the HTML context
         this.setElement($("<div>").css({
            width: 100,
            height: 100,
            border: "1px solid white",
            position: "absolute"
         }));

         this.setBoundingBox(R.math.Rectangle2D.create(0, 0, 100, 100));
         this.setOrigin(50, 50);
      },

      update: function(renderContext, time) {
         renderContext.pushTransform();

         this.setRotation(this.getRotation() + this.spinRate);

         this.base(renderContext, time);
         renderContext.popTransform();
      }

   }, {
      getClassName: function() {
         return "Player";
      }
   });
}