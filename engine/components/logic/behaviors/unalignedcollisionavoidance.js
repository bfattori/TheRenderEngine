// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.UnalignedCollisionAvoidance",
   "requires": [
      "R.components.logic.behaviors.BaseBehavior"
   ]
});

/**
 * @class The flee behavior component.  This is essentially opposite of seeking.  Fleeing
 *        needs to be updated dynamically.  If the argument to {@link #fleeFrom} is an
 *        object, it must be a descendant of {@link R.engine.Object2D}.
 * @param vehicles {Array} The vehicle list to compare against
 * @param [radius=150] {Number} The radius around each vehicle to use in collision detection
 * @param [checkLength=60] {Number} The distance in front of the vehicle to perform checking
 */
R.components.logic.behaviors.UnalignedCollisionAvoidance = function() {
   return R.components.logic.behaviors.BaseBehavior.extend({

      radius: 0,
      vehicles: null,
      checkLength: 0,

      constructor: function(vehicles, radius, checkLength) {
         this.base("unalignedcollision");
         this.vehicles = vehicles;
         this.radius = radius || R.Engine.options.unalignedAvoidanceCollisionRadius;
         this.checkLength = checkLength || R.Engine.options.unalignedAvoidanceFutureDistance;
      },

      execute: function(time, dt) {
         // No vehicles? nothing to do
         if (!this.vehicles) {
            return R.math.Vector2D.ZERO;
         }

         if (!this.getGameObject() || this.getGameObject().isDestroyed()) {
            return R.math.Vector2D.ZERO;
         }

         var steering = R.math.Vector2D.create(0,0), count = 0;

         for (var i = 0; i < this.vehicles.length; i++) {
            var other = this.vehicles[i];
            if (other === this.getGameObject()) {
               // If this is our game object, skip it...
               continue;
            }

            if (other.isDestroyed() || this.getGameObject().isDestroyed()) {
               return R.math.Vector2D.ZERO;
            }

            var oMC = other.getComponentByClass("R.components.transform.BehaviorMover2D"), oPos = R.math.Vector2D.create(other.getPosition()).add(other.getOrigin()),
                oVel = R.clone(oMC.getVelocity()), gO = this.getGameObject(), mC = this.getTransformComponent(),
                gPos = R.clone(gO.getPosition()).add(gO.getOrigin()),
                fwd = R.clone(mC.getVelocity()).normalize(), future = R.clone(oVel).normalize().mul(this.checkLength),
                diff = R.clone(oPos).add(future).sub(gPos);

            var dot = diff.dot(fwd);
            if (dot > 0) {
               // They may meet in the future
               var ray = R.clone(fwd).mul(this.checkLength), proj = R.clone(fwd).mul(dot),
                   pC = R.clone(proj), dist = pC.sub(diff).len();

               if (dist > 0 && dist < this.radius && proj.len() < ray.len()) {
                  // They will merge
                  var force = R.clone(fwd).mul(mC.getMaxSpeed()), angle = force.getAngle();
                  angle += R.math.Math2D.radToDeg(diff.getSign(mC.getVelocity()) * R.math.Math2D.PI / 4);
                  force.setAngle(angle);
                  steering.add(force);
                  force.destroy();
               }

               ray.destroy();
               proj.destroy();
               pC.destroy();
            }

            oPos.destroy();
            oVel.destroy();
            gPos.destroy();
            fwd.destroy();
            diff.destroy();
            future.destroy();
         }

         if (count > 0) {
            steering.div(count);
         }

         if (steering.len() > 0) {
            steering.normalize().mul(mC.getMaxSpeed()).sub(mC.getVelocity()).truncate(mC.getMaxForce());
         }

         return steering;
      }

   }, {
      getClassName: function() {
         return "R.components.logic.behaviors.UnalignedCollisionAvoidance";
      }
   });
};
