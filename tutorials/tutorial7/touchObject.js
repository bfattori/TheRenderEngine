// Load all required engine components
R.Engine.define({
	"class": "TouchObject",
	"requires": [
		"R.engine.Object2D",
      "R.math.Math2D",
      "R.engine.Events",

      "R.components.collision.Box"
	]
});

var TouchObject = function() {
   return R.engine.Object2D.extend({

      // The width of the object
      width: 25,                      // The width of the object
      height: 25,                     // The height of the object
      color: "#ff0000",               // The color of the object
      shape: null,                    // Our object's shape

      constructor: function(touchable) {
         this.base("TouchObject");

         // Add the component for collisions
         this.add(R.components.collision.Box.create("collide", Tutorial7.collisionModel));

         // Pick a random location on the playfield
         var dX = 50 + Math.floor(R.lang.Math2.random() * 100);
         var dY = 50 + Math.floor(R.lang.Math2.random() * 100);
         var rX = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         var rY = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         dX *= rX;
         dY *= rY;
         var start = R.math.Point2D.create(Tutorial7.getFieldRect().getCenter());
         start.add(R.math.Point2D.create(dX, dY));

         // Set our object's shape
         this.shape = R.math.Rectangle2D.create(0, 0, this.width, this.height);

         // Position the object
         this.setPosition(start);

         // Set the collision mask
         this.getComponent("collide").setCollisionMask(touchable ? R.lang.Math2.parseBin("11") :
            R.lang.Math2.parseBin("10"));
         this.color = touchable ? "#8c1717" : "#fcb514";

         // Set our bounding box so collision tests work
         this.setBoundingBox(R.math.Rectangle2D.create(this.shape));
         start.destroy();
      },

      /**
       * Update the object within the rendering context.  This calls the transform
       * component to position the object on the playfield.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();

         // The the "update" method of the super class
         this.base(renderContext, time);

         // Generate a rectangle to represent our object
         // Set the color to draw with
         renderContext.setFillStyle(this.color);
         renderContext.drawFilledRectangle(this.shape);

         renderContext.popTransform();
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string TouchObject
       */
      getClassName: function() {
         return "TouchObject";
      }
   });
};
