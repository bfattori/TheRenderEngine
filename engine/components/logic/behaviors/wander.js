// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.Wander",
   "requires": [
      "R.components.logic.behaviors.BaseBehavior"
   ]
});


/**
 * @class The wander behavior for the vehicle.  Causes the vehicle to randomly move
 *        from left to right.
 * @param amount The amount to wander in either direction
 * @param max The maximum amount of wander that can be applied in either direction
 */
R.components.logic.behaviors.Wander = function() {
   return R.components.logic.behaviors.BaseBehavior.extend({

      wanderChange: 0,
      wanderAngle: 0,
      radius: 0,

      constructor: function(amount, max) {
         this.base("wander");
         this.wanderChange = amount || R.Engine.options.wanderChange;
         this.wanderAngle = 0;
         this.radius = max || R.Engine.options.wanderRadius;
      },

      execute: function(time, dt) {
         // Adjust the current direction of travel a little bit
         // each execution to create a wandering effect
         var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getPosition()).add(gO.getOrigin),
             wForce = R.clone(R.math.Vector2D.ZERO),
             cMiddle = R.clone(mC.getVelocity()).normalize().mul(this.radius);

         wForce.setLen(mC.getMaxSpeed());
         wForce.setAngle(this.wanderAngle);

         this.wanderAngle += Math.random() * this.wanderChange - this.wanderChange * 0.5;
         var force = R.clone(cMiddle.add(wForce));
         cMiddle.destroy();
         return force;
      }

   }, {
      getClassName: function() {
         return "R.components.logic.behaviors.Wander";
      }
   });
};
