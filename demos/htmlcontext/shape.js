// Load all required engine components
R.Engine.define({
   "class": "Shape",
   "requires": [
      "R.engine.Object2D",
      "R.math.Math2D",
      "R.util.RenderUtil",

      "R.components.render.DOM"
   ]
});

var Shape = function() {
   return R.engine.Object2D.extend({

      spinRate: null,

      constructor: function(sides) {
         this.base("shape");

         // Get a temp canvas context to render a shape into
         var tContext = R.util.RenderUtil.getTempContext(R.rendercontexts.CanvasContext, 80, 80);

         // Draw a shape to the temp context and extract it to a data URL
         var color = "#" + (Math.floor(80 + Math.random() * 175)).toString(16) +
                           (Math.floor(80 + Math.random() * 175)).toString(16) +
                           (Math.floor(80 + Math.random() * 175)).toString(16);

         tContext.setFillStyle(color);
         // Math.floor(3 + R.lang.Math2.random() * 12)
         tContext.drawFilledRegularPolygon(sides, R.math.Point2D.create(40, 40), 40);
         var src = tContext.getDataURL("image/png");

         this.setPosition(R.math.Math2D.randomPoint(R.math.Rectangle2D.create(20,20,340,340)));

         // Set the spin rate to a random value
         this.spinRate = 1 + R.lang.Math2.random() * 5;

         // Add the DOM render component.  This is what
         // causes the transformations to be updated each frame
         // for a simple DOM object.
         this.add(R.components.render.DOM.create("draw"));

         // The representation of this object in the HTML context
         // Set the image source to be that which we generated above
         this.setElement($("<img>").css({
            width: 80,
            height: 80,
            position: "absolute"
         }).attr({
            src: src,
            width: 80,
            height: 80
         }));

         this.setBoundingBox(R.math.Rectangle2D.create(0, 0, 80, 80));
         this.setOrigin(40, 40);
      },

      update: function(renderContext, time, dt) {
         renderContext.pushTransform();

         this.setRotation(this.getRotation() + this.spinRate);

         this.base(renderContext, time, dt);
         renderContext.popTransform();
      }

   }, {
      getClassName: function() {
         return "Shape";
      }
   });
}