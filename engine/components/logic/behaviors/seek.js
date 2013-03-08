/**
 * The Render Engine
 * SeekBehavior
 *
 * @fileoverview Seek behavior, based on Craig Reynolds "Autonomous Steering Behaviors" article.
 *               The seek behavior will move the game object toward the provided destination
 *               position.
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
    "class":"R.components.logic.behaviors.Seek",
    "requires":[
        "R.components.logic.behaviors.BaseBehavior"
    ]
});

// Add behavior options
if (R.Engine.options.behaviors === undefined) {
    R.Engine.options.behaviors = {};
}

$.extend(R.Engine.options.behaviors, {
    "seekNearDistance":10
});

/**
 * @class The seek behavior component.  Causes an object to move toward a target.
 * @param target {R.math.Point2D|R.objects.Object2D} The point, or {@link R.objects.Object2D}, toward which the vehicle should seek
 * @extends R.components.logic.behaviors.BaseBehavior
 * @constructor
 */
R.components.logic.behaviors.Seek = function () {
    "use strict";
    return R.components.logic.behaviors.BaseBehavior.extend(/** @scope R.components.logic.behaviors.Seek.prototype */{

        target:null,
        arrived:false,

        /** @private */
        constructor:function (target) {
            this.base("seek");
            this.setTarget(target);
            this.arrived = false;
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
            if (this.target.__POINT2D) {
                destPt.set(this.target);
            } else if (this.target instanceof R.objects.Object2D && !this.target.isDestroyed()) {
                destPt.set(this.target.getOriginPosition());
            } else {
                // Not a point or object, return zero steering
                return R.math.Vector2D.ZERO;
            }

            // Calculate the desired velocity to steer toward the destination
            var gO = this.getGameObject(), mC = this.getTransformComponent(), pt = R.clone(gO.getPosition()).add(gO.getOrigin()),
                offs = R.clone(destPt).sub(pt), distance = offs.len(), steering = R.math.Vector2D.create(0, 0);

            offs.normalize().mul(mC.getMaxSpeed());
            steering.set(offs.sub(mC.getVelocity()));

            offs.destroy();

            if (this.nearPoint(pt, destPt, R.Engine.options.behaviors.seekNearDistance)) {
                this.arrived = true;
            }

            pt.destroy();
            destPt.destroy();
            return steering;
        },

        /**
         * True if the object is near its destination.  You can change the "near"
         * distance, by setting <code>R.Engine.options.behaviors.seekNearDistance</code>.
         * @return {Boolean}
         */
        isArrived:function () {
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
        nearPoint:function (pt1, pt2, threshold) {
            if (pt1 && pt2) {
                var p = R.math.Vector2D.create(pt1).sub(pt2), near = p.len() < threshold;
                p.destroy();
                return near;
            }
            return false;
        }

    }, /** @scope R.components.logic.behaviors.Seek.prototype */{
        getClassName:function () {
            return "R.components.logic.behaviors.Seek";
        }
    });
};
