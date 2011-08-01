// Load all required engine components
R.Engine.define({
	"class": "Bomb",
	"requires": [
		"R.engine.Object2D",
      "R.engine.Events",
      "R.math.Math2D",

      "R.components.collision.Box",
      "R.components.render.Sprite"
	]
});

var Bomb = function() {
   return R.engine.Object2D.extend({

      constructor: function() {
         this.base("Bomb");

         // Add the component for collisions
         this.add(R.components.collision.Box.create("collide", Tutorial9.collisionModel));

         // Add the component for rendering
         var bombSprite = Tutorial9.spriteLoader.getSprite("sprites", "bomb");
         this.add(R.components.render.Sprite.create("draw", bombSprite));

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
         this.getComponent("collide").setCollisionMask(Bomb.COLLISION_MASK);

         // Set our bounding box so collision tests work
         this.setBoundingBox(bombSprite.getBoundingBox());

         // Move the bombs's origin to the center of the bounding box
         this.setOrigin(this.getBoundingBox().getCenter());

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
      },

      /**
       * Play a little animation and make the bomb explode
       */
      explode: function() {
         // Remove the bomb from the collision model so we don't trigger another collision
         Tutorial9.collisionModel.removeObject(this);

         // Draw an explosion of sorts
         this.getComponent("draw").setSprite(Tutorial9.spriteLoader.getSprite("sprites", "boom"));

         // Adjust the position a bit to account for the different sprite sizes
         var pos = R.math.Point2D.create(this.getPosition());
         var offset = R.math.Point2D.create(30, 10);
         pos.sub(offset);
         this.setPosition(pos);
         pos.destroy();
         offset.destroy();

         var self = this;
         R.lang.OneShotTrigger.create("explosion", 500, function() {
            self.destroy();
         }, 10, function() {
            self.setScale(self.getScale() + 0.02);
         });
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string TouchObject
       */
      getClassName: function() {
         return "Bomb";
      },

      COLLISION_MASK: R.lang.Math2.parseBin("01")
   });
};
