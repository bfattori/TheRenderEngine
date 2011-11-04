// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.ObstacleAvoidance",
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
 * @param [futureDist=60] {Number} The distance in front of the vehicle to perform checking
 */
R.components.logic.behaviors.ObstacleAvoidance = function() {
   return R.components.logic.behaviors.BaseBehavior.extend({

      radius: 0,
      futureDist: 0,
      vehicles: null,

      constructor: function(vehicles, radius, futureDist) {
         this.base("obstacleavoid");
         this.vehicles = vehicles;
         this.radius = radius || R.Engine.options.obstacleAvoidanceRadius;
         this.futureDist = futureDist || R.Engine.options.obstacleAvoidanceFutureDistance;
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

            var oPos = R.math.Vector2D.create(other.getPosition()).add(other.getOrigin()),
                gO = this.getGameObject(), mC = this.getTransformComponent(),
                fwd = R.clone(mC.getVelocity()).normalize().mul(this.futureDist),
                gPos = R.math.Vector2D.create(gO.getPosition()).add(gO.getOrigin()).add(fwd),
                diff = R.clone(gPos).sub(oPos), d = diff.len();

            if (d > 0 && d < this.radius) {
               // They are close to each other
               diff.normalize(); //.div(d);
               steering.add(diff);
               count++
            }

            oPos.destroy();
            gPos.destroy();
            fwd.destroy();
            diff.destroy();

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
         return "R.components.logic.behaviors.ObstacleAvoidance";
      }
   });
};
