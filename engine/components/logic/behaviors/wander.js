// Load all required engine components
R.Engine.define({
    "class":"R.components.logic.behaviors.Wander",
    "requires":[
        "R.components.logic.behaviors.BaseBehavior"
    ]
});

// Add behavior options
if (R.Engine.options.behaviors === undefined) {
    R.Engine.options.behaviors = {};
}

$.extend(R.Engine.options.behaviors, {
    "wanderChange":1,
    "wanderRadius":30
});

/**
 * @class The wander behavior for the vehicle.  Causes the vehicle to randomly move
 *        from left to right.
 * @param amount The amount to wander in either direction
 * @param max The maximum amount of wander that can be applied in either direction
 * @extends R.components.logic.behaviors.BaseBehavior
 * @constructor
 */
R.components.logic.behaviors.Wander = function () {
    "use strict";
    return R.components.logic.behaviors.BaseBehavior.extend(/** @scope R.components.logic.behaviors.Wander.prototype */{

        wanderChange:0,
        wanderAngle:0,
        radius:0,

        /** @private */
        constructor:function (amount, max) {
            this.base("wander");
            this.wanderChange = amount || R.Engine.options.behaviors.wanderChange;
            this.wanderAngle = 0;
            this.radius = max || R.Engine.options.behaviors.wanderRadius;
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
        execute:function (time, dt) {
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

    }, /** @scope R.components.logic.behaviors.Wander.prototype */{
        getClassName:function () {
            return "R.components.logic.behaviors.Wander";
        }
    });
};
