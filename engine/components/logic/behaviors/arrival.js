/**
 * The Render Engine
 * ArrivalBehavior
 *
 * @fileoverview Arrival behavior, based on Craig Reynolds "Autonomous Steering Behaviors" article.
 *               The arrival behavior is similar to the seek behavior, where a vehicle will navigate
 *               to a target.  However, the arrival behavior will slow as it approaches the target.
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
    "class":"R.components.logic.behaviors.Arrival",
    "requires":[
        "R.components.logic.behaviors.BaseBehavior"
    ]
});

// Add behavior options
if (R.Engine.options.behaviors === undefined) {
    R.Engine.options.behaviors = {};
}

$.extend(R.Engine.options.behaviors, {
    "arrivalSlowingDistance":50
});


/**
 * @class The arrival behavior component. Causes the vehicle to seek the destination, but slow as it
 *        approaches it.
 * @param destination The point to seek
 * @param [slowingDistance] The distance (in pixels) at which slowing should occur.  The velocity
 *        will be scaled as it nears the destination and stop when it is at, or almost at, the
 *        destination.
 * @extends R.components.logic.behaviors.BaseBehavior
 * @constructor
 */
R.components.logic.behaviors.Arrival = function () {
    "use strict";
    return R.components.logic.behaviors.BaseBehavior.extend(/** @scope R.components.logic.behaviors.Arrival.prototype */{

        slowDist:0,
        arrived:false,
        target:null,

        /** @private */
        constructor:function (target, slowingDistance) {
            this.base("arrival");
            this.arrived = false;
            this.setTarget(target);
            this.slowDist = slowingDistance || R.Engine.options.behaviors.arrivalSlowingDistance;
        },

        destroy:function () {
            this.base();
            this.destPt.destroy();
        },

        reset:function () {
            this.arrived = false;
            this.base();
        },

        /**
         * Set the target to seek.
         * @param target {R.math.Point2D|R.objects.Object2D} The point, or object,
         *    to seek.
         */
        setTarget:function (target) {
            this.target = target;
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
            var destPt = R.math.Vector2D.create(0, 0);
            if (Point2D.__POINT2D) {
                destPt.set(this.target);
            } else if (this.target instanceof R.objects.Object2D && !this.target.isDestroyed()) {
                destPt.set(this.target.getOriginPosition());
            } else {
                // Not a point or object, return zero steering
                return R.math.Vector2D.ZERO;
            }

            var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getOriginPosition()),
                offs = R.clone(destPt).sub(pt), distance = offs.len(), steering = R.math.Vector2D.create(0, 0);

            if (!this.getGameObject() || this.getGameObject().isDestroyed()) {
                return steering;
            }

            if (distance > 5) {
                offs.normalize();

                if (distance < this.slowDist) {
                    offs.mul(mC.getMaxSpeed() * (distance / this.slowDist));
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
            destPt.destroy();

            return steering;
        },

        /**
         * True if the vehicle has "arrived" at it's destination
         * @return {Boolean}
         */
        isArrived:function () {
            return this.arrived;
        }

    }, /** @scope R.components.logic.behaviors.Arrival.prototype */{
        getClassName:function () {
            return "R.components.logic.behaviors.Arrival";
        }
    });
};
