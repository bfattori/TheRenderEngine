// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.BaseBehavior",
   "requires": [
      "R.components.Logic"
   ]
});

/**
 * @class The seek behavior component for vehicles.  Causes a vehicle to move toward a target.
 */
R.components.logic.behaviors.BaseBehavior = function() {
   return R.components.Logic.extend({

      transformComponent: null,

      constructor: function(name) {
         this.base(name);
      },

      reset: function() {
         this.transformComponent = null;
         this.base();
      },

      setTransformComponent: function(component) {
         this.transformComponent = component;
      },

      getTransformComponent: function() {
         return this.transformComponent;
      }

   }, {
      getClassName: function() {
         return "R.components.logic.behaviors.BaseBehavior";
      }
   });
};
