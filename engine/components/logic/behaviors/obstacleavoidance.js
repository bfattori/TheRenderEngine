/**
 * The Render Engine
 * ObstacleAvoidanceBehavior
 *
 * @fileoverview Obstacle avoidance behavior, based on Craig Reynolds "Autonomous Steering Behaviors" article.
 *               This behavior will avoid the objects which are provided to it.  It will actively try to
 *               steer around the obstacles.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE
 */

// Load all required engine components
R.Engine.define({
    "class":"R.components.logic.behaviors.ObstacleAvoidance",
    "requires":[
        "R.components.logic.behaviors.BaseBehavior"
    ]
});

// Add behavior options
if (R.Engine.options.behaviors === undefined) {
    R.Engine.options.behaviors = {};
}

$.extend(R.Engine.options.behaviors, {
    "obstacleAvoidanceRadius":60,
    "obstacleAvoidanceFutureDistance":40
});

/**
 * @class The obstacle avoidance behavior component.  This behavior will actively steer around
 *        the list of obstacles provided to it.
 * @param obstacles {Array} The obstacle list to compare against
 * @param [radius=150] {Number} The radius around each vehicle to use in collision detection
 * @param [futureDist=60] {Number} The distance in front of the vehicle to perform checking
 * @extends R.components.logic.behaviors.BaseBehavior
 * @constructor
 */
R.components.logic.behaviors.ObstacleAvoidance = function () {
    "use strict";
    return R.components.logic.behaviors.BaseBehavior.extend(/** @scope R.components.logic.behaviors.ObstacleAvoidance.prototype */{

        radius:0,
        futureDist:0,
        vehicles:null,

        /** @private */
        constructor:function (obstacles, radius, futureDist) {
            this.base("obstacleavoid");
            this.vehicles = obstacles;
            this.radius = radius || R.Engine.options.behaviors.obstacleAvoidanceRadius;
            this.futureDist = futureDist || R.Engine.options.behaviors.obstacleAvoidanceFutureDistance;
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
            // No vehicles? nothing to do
            if (!this.vehicles) {
                return R.math.Vector2D.ZERO;
            }

            if (!this.getGameObject() || this.getGameObject().isDestroyed()) {
                return R.math.Vector2D.ZERO;
            }

            var steering = R.math.Vector2D.create(0, 0), count = 0;

            for (var i = 0; i < this.vehicles.length; i++) {
                var other = this.vehicles[i];
                if (other === this.getGameObject()) {
                    // If this is our game object, skip it...
                    continue;
                }

                if (other.isDestroyed() || this.getGameObject().isDestroyed()) {
                    return R.math.Vector2D.ZERO;
                }

                var oPos = R.math.Vector2D.create(other.getOriginPosition()),
                    gO = this.getGameObject(), mC = this.getTransformComponent(),
                    fwd = R.clone(mC.getVelocity()).normalize().mul(this.futureDist),
                    gPos = R.math.Vector2D.create(gO.getOriginPosition()).add(fwd),
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

    }, /** @scope R.components.logic.behaviors.ObstacleAvoidance.prototype */{
        getClassName:function () {
            return "R.components.logic.behaviors.ObstacleAvoidance";
        }
    });
};
