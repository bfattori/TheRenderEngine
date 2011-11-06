// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.UnalignedCollisionAvoidance",
   "requires": [
      "R.components.logic.behaviors.BaseBehavior"
   ]
});

   // Add behavior options
   if (R.Engine.options.behaviors === undefined) {
      R.Engine.options.behaviors = {};
   }

   $.extend(R.Engine.options.behaviors, {
      "unalignedAvoidanceCollisionRadius": 150,
      "unalignedAvoidanceFutureDistance": 60
   });

/**
 * @class The unaligned collision avoidance behavior component. This component will actively avoid other moving
 *        objects by examining their future position.
 * @param vehicles {Array} The vehicle list to compare against
 * @param [radius=150] {Number} The radius around each vehicle to use in collision detection
 * @param [checkLength=60] {Number} The distance in front of the vehicle to perform checking
 * @extends R.components.logic.behaviors.BaseBehavior
 * @constructor
 */
R.components.logic.behaviors.UnalignedCollisionAvoidance = function() {
   return R.components.logic.behaviors.BaseBehavior.extend(/** @scope R.components.logic.behaviors.UnalignedCollisionAvoidance.prototype */{

      radius: 0,
      vehicles: null,
      checkLength: 0,

      /** @private */
      constructor: function(vehicles, radius, checkLength) {
         this.base("unalignedcollision");
         this.vehicles = vehicles;
         this.radius = radius || R.Engine.options.behaviors.unalignedAvoidanceCollisionRadius;
         this.checkLength = checkLength || R.Engine.options.behaviors.unalignedAvoidanceFutureDistance;
      },

      /**
       * This method is called by the game object to run the component,
       * updating its state.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the component will render within.
       * @param time {Number} The global engine time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
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

   }, /** @scope R.components.logic.behaviors.UnalignedCollisionAvoidance.prototype */{
      getClassName: function() {
         return "R.components.logic.behaviors.UnalignedCollisionAvoidance";
      }
   });
};
