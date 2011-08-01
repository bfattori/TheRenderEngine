// Load all required engine components
R.Engine.define({
   "class": "Bomb",
   "requires": [
      "R.engine.Object2D",
      "R.math.Math2D",

      "R.components.collision.Convex",
      "R.components.render.Sprite",

      "R.collision.OBBHull",

      "R.struct.Container"
   ]
});

var Bomb = function() {
   return R.engine.Object2D.extend({

      constructor: function() {
         this.base("Bomb");

         // Add the component for collisions
         this.add(R.components.collision.Convex.create("collide", Tutorial11.collisionModel));

         // Add the component for rendering
         var bombSprite = Tutorial11.spriteLoader.getSprite("sprites", "bomb");
         this.add(R.components.render.Sprite.create("draw", bombSprite));

         // Pick a random location on the playfield
         var dX = 50 + Math.floor(R.lang.Math2.random() * 100);
         var dY = 50 + Math.floor(R.lang.Math2.random() * 100);
         var rX = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         var rY = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         dX *= rX;
         dY *= rY;
         var start = R.math.Point2D.create(Tutorial11.getPlayfield().getCenter());
         start.add(R.math.Point2D.create(dX, dY));

         // Set the collision mask
         this.getComponent("collide").setCollisionMask(Bomb.COLLISION_MASK);

         // Set our bounding box so collision tests work
         this.setBoundingBox(bombSprite.getBoundingBox());

         // Create a collision hull
         this.setCollisionHull(R.collision.OBBHull.create(this.getBoundingBox()));

         // Move the bombs's origin to the center of the bounding box
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
      },

      /**
       * Play a little animation and make the bomb explode
       */
      explode: function() {
         // Set the collision mask so we don't collide again
         this.getComponent("collide").setCollisionMask(0);

         // Draw an explosion of sorts
         this.getComponent("draw").setSprite(Tutorial11.spriteLoader.getSprite("sprites", "boom"));

         // Adjust the position a bit to account for the different sprite sizes
         var pos = R.math.Point2D.create(this.getPosition());
         var offset = R.math.Point2D.create(30, 10);
         pos.sub(offset);
         this.setPosition(pos);
         pos.destroy();
         offset.destroy();

         // Generate some particles
         // We don't need to destroy this container.  The particle engine
         // will do that for us
         var p = R.struct.Container.create();
         var pt = R.math.Point2D.create(this.getPosition());
         pt.add(this.getOrigin());
         for (var x = 0; x < 40; x++) {
            var decel = R.lang.Math2.random() * 0.08;
            var r = Math.floor(R.lang.Math2.random() * 500);
            p.add(SimpleParticle.create(pt, 1000 + r, decel));
         }
         Tutorial11.pEngine.addParticles(p);
         pt.destroy();

         // Now animate the sprite explosion
         var self = this;
         R.lang.OneShotTrigger.create("explosion", 500, function() {
            // Remove the bomb from the collision model
            Tutorial11.collisionModel.removeObject(self);
            self.destroy();
         }, 10, function() {
            var mc = self.getDefaultTransformComponent();
            mc.setScale(mc.getScale() + 0.02);
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

      COLLISION_MASK: R.lang.Math2.parseBin("10")

   });
};