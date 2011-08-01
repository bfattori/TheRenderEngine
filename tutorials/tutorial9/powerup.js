// Load all required engine components
R.Engine.define({
	"class": "Powerup",
	"requires": [
		"R.engine.Object2D",
      "R.engine.Events",
      "R.math.Math2D",

      "R.components.collision.Box",
      "R.components.render.Sprite"
	]
});

var Powerup = function() {
   return R.engine.Object2D.extend({

      constructor: function() {
         this.base("Powerup");

         // Add the component for collisions
         this.add(R.components.collision.Box.create("collide", Tutorial9.collisionModel));

         // Add the component for rendering
         var shieldSprite = Tutorial9.spriteLoader.getSprite("sprites", "powerup");
         this.add(R.components.render.Sprite.create("draw", shieldSprite));

         // Pick a random location on the playfield
         var dX = 50 + Math.floor(R.lang.Math2.random() * 100);
         var dY = 50 + Math.floor(R.lang.Math2.random() * 100);
         var rX = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         var rY = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         dX *= rX;
         dY *= rY;
         var start = R.math.Point2D.create(Tutorial9.getPlayfield().getCenter());
         start.add(R.math.Point2D.create(dX, dY));

         // Position the object
         this.setPosition(start);

         // Set the collision mask
         this.getComponent("collide").setCollisionMask(Powerup.COLLISION_MASK);

         // Set our bounding box so collision tests work
         this.setBoundingBox(shieldSprite.getBoundingBox());
         start.destroy();
      },

      /**
       * Update the object within the rendering context.  This calls the transform
       * component to position the object on the playfield.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time, dt) {
         renderContext.pushTransform();

         // The the "update" method of the super class
         this.base(renderContext, time, dt);

         renderContext.popTransform();
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string TouchObject
       */
      getClassName: function() {
         return "Powerup";
      },

      COLLISION_MASK: R.lang.Math2.parseBin("10")
   });
};
