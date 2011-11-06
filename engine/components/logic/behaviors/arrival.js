// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.Arrival",
   "requires": [
      "R.components.logic.behaviors.BaseBehavior"
   ]
});

/**
 * @class The arrival behavior component. Causes the vehicle to seek the destination, but slow as it
 *        approaches it.
 * @param destination The point to seek
 * @param [slowingDistance] The distance (in pixels) at which slowing should occur.  The velocity
 *        will be scaled as it nears the destination and stop when it is at, or almost at, the
 *        destination.
 */
R.components.logic.behaviors.Arrival = function() {
   return R.components.logic.behaviors.BaseBehavior.extend({

      slowDist: 0,
      arrived: false,
      destPt: null,

      constructor: function(destination, slowingDistance) {
         this.base("arrival");
         this.arrived = false;
         this.destPt = R.math.Vector2D.create(destination);
         this.slowDist = slowingDistance || R.Engine.options.arrivalSlowingDistance;
      },

      destroy: function() {
         this.base();
         this.destPt.destroy();
      },

      reset: function() {
         this.arrived = false;
         this.base();
      },

      execute: function(time, dt) {
         var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getPosition()).add(gO.getOrigin()),
             offs = R.clone(this.destPt).sub(pt), distance = offs.len(), steering = R.math.Vector2D.create(0,0);

         if (!this.getGameObject() || this.getGameObject().isDestroyed()) {
            return steering;
         }

         if (distance > 5) {
            offs.normalize();

            if (distance < this.slowDist) {
               offs.mul(mC.getMaxSpeed() * (distance / R.Engine.options.arrivalSlowingDistance));
            } else {
               offs.mul(mC.getMaxSpeed());
            }
            steering.set(offs.sub(mC.getVelocity()));
         } else {
            steering.set(R.math.Vector2D.ZERO);
            this.arrived = true;
         }

         offs.destroy();
         pt.destroy();

         return steering;
      },

      /**
       * True if the vehicle has "arrived" at it's destination
       * @return {Boolean}
       */
      isArrived: function() {
         return this.arrived;
      }

   }, {
      getClassName: function() {
         return "R.components.logic.behaviors.Arrival";
      }
   });
};
