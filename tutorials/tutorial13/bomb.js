// Load all required engine components
R.Engine.define({
   "class": "Bomb",
   "requires": [
      "R.engine.Object2D",
      "R.math.Math2D",

      "R.components.collision.Convex",
      "R.components.render.Sprite",
      "R.components.render.ParticleEmitter",
      "R.particles.Emitter",

      "R.collision.OBBHull",

      "R.struct.Container"
   ]
});

var Bomb = function() {
   return R.engine.Object2D.extend({

      constructor: function() {
         this.base("Bomb");

         // Add the component for collisions
         this.add(R.components.collision.Convex.create("collide", Tutorial13.collisionModel));

         // Add the component for rendering
         var bombSprite = Tutorial13.spriteLoader.getSprite("sprites", "bomb");
         this.add(R.components.render.Sprite.create("draw", bombSprite));

         // Add the particle emitter component
         this.add(R.components.render.ParticleEmitter.create("particles"));

         // Pick a random location on the playfield
         var dX = 50 + Math.floor(R.lang.Math2.random() * 100);
         var dY = 50 + Math.floor(R.lang.Math2.random() * 100);
         var rX = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         var rY = R.lang.Math2.random() * 100 < 50 ? -1 : 1;
         dX *= rX;
         dY *= rY;
         var start = R.math.Point2D.create(Tutorial13.getPlayfield().getCenter());
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

         // Set up the particle emitter
         this.setupEmitter();

         start.destroy();
      },

      /**
       * Set up the particle emitter which will be at the end of the fuse.
       */
      setupEmitter: function() {
         // Create the particle emitter which returns the type of particle
         // we want to emit.  5 is the delay between particle emissions and
         // 350 is the life of the particle (both in milliseconds). An emitter
         // only emits one particle per cycle.
         var emitter = R.particles.Emitter.create(function(offset) {
            // Create a particle
            return FuseParticle.create(offset, 350);
         }, 5);

         // Assign the emitter to the particle engine which will draw it
         emitter.setParticleEngine(Tutorial13.pEngine);

         // Assign the particle emitter to the emitter component and set the offset
         // to the approximate location of the end of the fuse
         this.getComponent("particles").setEmitter(emitter);
         this.getComponent("particles").setOffset(R.clone(this.getPosition()).add(R.math.Point2D.create(4,-15)));
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
         this.getComponent("draw").setSprite(Tutorial13.spriteLoader.getSprite("sprites", "boom"));

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
            p.add(ExplosionParticle.create(pt, 1000 + r, decel));
         }
         Tutorial13.pEngine.addParticles(p);
         pt.destroy();

         // Now animate the sprite explosion
         var self = this;
         R.lang.OneShotTrigger.create("explosion", 500, function() {
            // Remove the bomb from the collision model
            Tutorial13.collisionModel.removeObject(self);
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