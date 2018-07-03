/**
 * The Render Engine
 * FleeBehavior
 *
 * @fileoverview Flee behavior, based on Craig Reynolds "Autonomous Steering Behaviors" article.
 *               The flee behavior is the opposite of the seek behavior, where the vehicle will
 *               move away from the target object.
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
    "class":"R.components.logic.behaviors.Flee",
    "requires":[
        "R.components.logic.behaviors.BaseBehavior"
    ]
});

// Add behavior options
if (R.Engine.options.behaviors === undefined) {
    R.Engine.options.behaviors = {};
}

$.extend(R.Engine.options.behaviors, {
    "fleeMinimumDistance":350
});

/**
 * @class The flee behavior component.  This is essentially opposite of seeking.  Fleeing
 *        needs to be updated dynamically.  If the argument to {@link #fleeFrom} is an
 *        object, it must be a descendant of {@link R.objects.Object2D}.
 * @param target The target to flee from or a point to flee from.
 * @param [minDist=350] The minimum distance at which the vehicle will be triggered to
 *        flee.
 * @extends R.components.logic.behaviors.BaseBehavior
 * @constructor
 */
R.components.logic.behaviors.Flee = function () {
    "use strict";
    return R.components.logic.behaviors.BaseBehavior.extend(/** @scope R.components.logic.behaviors.Flee.prototype */{

        minDist:0,
        target:null,

        /** @private */
        constructor:function (target, minDist) {
            this.base("flee");
            this.minDist = minDist || R.Engine.options.behaviors.fleeMinimumDistance;
            this.target = target;
        },

        /**
         * Update the object to flee from.
         * @param target The point or object to flee from
         */
        fleeFrom:function (target) {
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

            if (!this.target || this.target._destroyed) {
                return R.math.Vector2D.ZERO;
            }

            if (!this.getGameObject() || this.getGameObject()._destroyed) {
                return R.math.Vector2D.ZERO;
            }

            // Calculate the desired velocity to steer toward the destination
            var flee;
            if (Point2D.__POINT2D) {
                flee = R.math.Vector2D.create(this.target);
            } else {
                flee = R.math.Vector2D.create(this.target.getOriginPosition());
            }

            var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getOriginPosition()),
                offs = R.clone(flee).sub(pt), distance = offs.len(), steering = R.math.Vector2D.create(0, 0);

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

    }, /** @scope R.components.logic.behaviors.Flee.prototype */{
        getClassName:function () {
            return "R.components.logic.behaviors.Flee";
        }
    });
};
