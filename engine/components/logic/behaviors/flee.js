// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.Flee",
   "requires": [
      "R.components.logic.behaviors.BaseBehavior"
   ]
});

/**
 * @class The flee behavior component.  This is essentially opposite of seeking.  Fleeing
 *        needs to be updated dynamically.  If the argument to {@link #fleeFrom} is an
 *        object, it must be a descendant of {@link R.engine.Object2D}.
 * @param target The target to flee from or a point to flee from.
 * @param [minDist=350] The minimum distance at which the vehicle will be triggered to
 *        flee.
 */
R.components.logic.behaviors.Flee = function() {
   return R.components.logic.behaviors.BaseBehavior.extend({

      minDist: 0,
      target: null,

      constructor: function(target, minDist) {
         this.base("flee");
         this.minDist = minDist || R.Engine.options.fleeMinimumDistance;
         this.target = target;
      },

      /**
       * Update the object to flee from.
       * @param target The point or object to flee from
       */
      fleeFrom: function(target) {
         this.target = target;
      },

      execute: function(time, dt) {

         if (!this.target || this.target.isDestroyed()) {
            return R.math.Vector2D.ZERO;
         }

         if (!this.getGameObject() || this.getGameObject().isDestroyed()) {
            return R.math.Vector2D.ZERO;
         }

         // Calculate the desired velocity to steer toward the destination
         var flee;
         if (this.target.__POINT2D) {
            flee = R.math.Vector2D.create(this.target);
         } else {
            flee = R.math.Vector2D.create(this.target.getPosition()).add(this.target.getOrigin());
         }

         var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getPosition()).add(gO.getOrigin()),
             offs = R.clone(flee).sub(pt), distance = offs.len(), steering = R.math.Vector2D.create(0,0);

         offs.normalize();
         if (distance > 0 && distance < this.minDist) {
            offs.mul(mC.getMaxSpeed());
            steering.set(offs.sub(mC.getVelocity())).mul(distance / this.minDist);
         }

         offs.destroy();
         flee.destroy();
         pt.destroy();
         return steering.neg();
      }

   }, {
      getClassName: function() {
         return "R.components.logic.behaviors.Flee";
      }
   });
};
