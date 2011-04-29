// Load all required engine components
R.Engine.define({
   "class": "Powerup",
   "requires": [
      "R.engine.Object2D",
      "R.math.Math2D",

      "R.components.collision.Convex",
      "R.components.render.Sprite",

      "R.collision.CircleHull"
   ]
});

var Powerup = function() {
   return R.engine.Object2D.extend({

      constructor: function() {
         this.base("Powerup");

         // Add the component for collisions
         this.add(R.components.collision.Convex.create("collide", Tutorial11.collisionModel));

         // Add the component for rendering
         var shieldSprite = Tutorial11.spriteLoader.getSprite("sprites", "powerup");
         this.add(R.components.render.Sprite.create("draw", shieldSprite));

         // Set the collision mask
         this.getComponent("collide").setCollisionMask(Powerup.COLLISION_MASK);

         // Set our bounding box so collision tests work
         this.setBoundingBox(shieldSprite.getBoundingBox());

         // Create a collision hull
         this.setCollisionHull(R.collision.CircleHull.create(this.getBoundingBox()));

         // Pick a random location on the playfield
         var start = R.math.Point2D.create(Tutorial11.getPlayfield().getCenter());
         var dX = 50 + Math.floor(R.lang.Math2.random() * 100);
         var dY = 50 + Math.floor(R.lang.Math2.random() * 100);
         var rX = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         var rY = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         dX *= rX;
         dY *= rY;
         start.add(R.math.Point2D.create(dX, dY));

         // Set the origin
         this.setOrigin(this.getBoundingBox().getCenter());

         // Position the object
         this.setPosition(start);

         start.destroy();
      },

      /**
       * Update the object within the rendering context.  This calls the transform
       * component to position the object on the playfield.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();

         // The the "update" method of the super class
         this.base(renderContext, time);

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

      COLLISION_MASK: R.lang.Math2.parseBin("01")

   });
};