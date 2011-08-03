// Load all required engine components
R.Engine.define({
   "class": "ExplosionParticle",
   "requires": [
      "R.particles.AbstractParticle",
      "R.math.Math2D"
   ]
});

/**
 * @class An explosion particle
 *
 * @param pos {R.math.Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 * @param [ttl=2000] {Number} The Time To Live (lifespan) of the particle
 * @param [decel=0] {Number} The rate at which the particle will decelerate over time
 */
var ExplosionParticle = function() {
   return R.particles.AbstractParticle.extend(/** @scope SimpleParticle.prototype */{

      vec: null,
      decel: 0,
      invVel: null,

      constructor: function(pos, ttl, decel) {
         this.base(ttl || 2000);
         this.setPosition(pos.x, pos.y);

         // Randomly select an angle between 0 and 360 degrees
         // then get a direction vector from the angle
         var a = Math.floor(R.lang.Math2.random() * 360);
         this.vec = R.math.Math2D.getDirectionVector(R.math.Vector2D.ZERO, R.math.Vector2D.UP, a);

         // Choose a random velocity for the particle and multiply the
         // direction vector by that velocity
         var vel = 1 + (R.lang.Math2.random() * 10);
         this.vec.mul(vel);

         // Store the deceleration velocity of the particle
         this.decel = decel;
         this.invVel = R.math.Vector2D.create(0, 0);
      },

      destroy: function() {
         this.vec.destroy();
         this.invVel.destroy();
         this.base();
      },

      release: function() {
         this.base();
         this.vec = null;
         this.invVel = null;
         this.decel = 0;
      },

      /**
       * Called by the particle engine to draw the particle to the rendering
       * context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      draw: function(renderContext, time) {

         // If the particle has an assigned deceleration, determine the
         // inverse velocity (braking velocity) and apply it to the
         // vector of motion
         if (this.decel > 0 && this.vec.len() > 0) {
            this.invVel.set(this.vec).neg();
            this.invVel.mul(this.decel);
            this.vec.add(this.invVel);
         }

         // Add the vector of motion to the particle
         this.getPosition().add(this.vec);

         // Randomize the color of the particle so it appears to flicker
         var colr = "#fff";
         var s = time - this.getBirth();
         var e = this.getTTL() - this.getBirth();
         colr = 255 - Math.floor(255 * (s / e));
         colr += (-10 + (Math.floor(R.lang.Math2.random() * 20)));
         var fb = (R.lang.Math2.random() * 100);
         if (fb > 90) {
            colr = 255;
         }

         colr = "#" + (colr.toString(16) + colr.toString(16) + colr.toString(16));

         // Render the particle
         renderContext.setFillStyle(colr);
         renderContext.drawPoint(this.getPosition());
      }

   }, {
      getClassName: function() {
         return "ExplosionParticle";
      }
   });
};


// Load all required engine components
R.Engine.define({
   "class": "FuseParticle",
   "requires": [
      "R.particles.AbstractParticle",
      "R.math.Math2D"
   ]
});

/**
 * @class A fuse particle
 *
 * @param pos {R.math.Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 * @param [ttl=500] {Number} The Time To Live (lifespan) of the particle
 */
var FuseParticle = function() {
   return R.particles.AbstractParticle.extend(/** @scope SimpleParticle.prototype */{

      vec: null,

      constructor: function(pos, ttl) {
         this.base(ttl || 500);
         this.setPosition(pos);

         // Set the initial vector of motion and velocity of the particle
         var a = Math.floor(R.lang.Math2.random() * 360);
         this.vec = R.math.Math2D.getDirectionVector(R.math.Vector2D.ZERO, R.math.Vector2D.UP, a);
         var vel = 0.3 + R.lang.Math2.random();
         this.vec.mul(vel);
      },

      /**
       * Called by the particle engine to draw the particle to the rendering
       * context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      draw: function(renderContext, time, dt) {
         this.getPosition().add(this.vec);

         // Randomize the color a bit to make the particle shimmer
         var colr,rgba;
         var s = time - this.getBirth();
         var e = this.getTTL() - this.getBirth();
         colr = 255 - Math.floor(40 * (s / e));
         colr += (-10 + (Math.floor(R.lang.Math2.random() * 20)));

         rgba = "rgb(" + colr + "," + colr + ",0)";

         // Draw the particle
         renderContext.setFillStyle(rgba);
         renderContext.drawPoint(this.getPosition());
      }

   }, {
      getClassName: function() {
         return "FuseParticle";
      }
   });
};