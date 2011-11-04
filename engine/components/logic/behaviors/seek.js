// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.Seek",
   "requires": [
      "R.components.logic.behaviors.BaseBehavior"
   ]
});

/**
 * @class The seek behavior component for vehicles.  Causes a vehicle to move toward a target.
 * @param name The name of the component
 * @param destination The point toward which the vehicle should seek
 */
R.components.logic.behaviors.Seek = function() {
   return R.components.logic.behaviors.BaseBehavior.extend({

      destPt: null,
      arrived: false,

      constructor: function(destination) {
         this.base("seek");
         this.destPt = R.math.Vector2D.create(destination);
         this.arrived = false;
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
         // Calculate the desired velocity to steer toward the destination
         var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getPosition()).add(gO.getOrigin()),
             offs = R.clone(this.destPt).sub(pt), distance = offs.len(), steering = R.math.Vector2D.create(0,0);

         offs.normalize().mul(mC.getMaxSpeed());
         steering.set(offs.sub(mC.getVelocity()));

         offs.destroy();

         if (this.nearPoint(pt, this.destPt, R.Engine.options.seekNearDistance)) {
            this.arrived = true;
         }

         pt.destroy();
         return steering;
      },

      /**
       * True if the vehicle has "arrived" at it's destination
       * @return {Boolean}
       */
      isArrived: function() {
         return this.arrived;
      },

      /**
       * Determine if the first point is near the second point, within the
       * set threshold.
       * @param pt1
       * @param pt2
       * @param threshold
       * @private
       */
      nearPoint: function(pt1, pt2, threshold) {
         if (pt1 && pt2) {
            var p = R.math.Vector2D.create(pt1).sub(pt2), near = p.len() < threshold;
            p.destroy();
            return near;
         }
         return false;
      }

   }, {
      getClassName: function() {
         return "R.components.logic.behaviors.Seek";
      }
   });
};
