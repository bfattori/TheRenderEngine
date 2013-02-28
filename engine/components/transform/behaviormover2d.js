/**
 * The Render Engine
 * BehaviorMover2D
 *
 * @fileoverview A component which moves game objects using behavior components.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1573 $
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
 * THE SOFTWARE.
 *
 */
R.Engine.define({
    "class":"R.components.transform.BehaviorMover2D",
    "requires":[
        "R.components.Transform2D",
        "R.struct.HashContainer"
    ]
});

// Add behavior options
if (R.Engine.options.behaviors === undefined) {
    R.Engine.options.behaviors = {};
}

$.extend(R.Engine.options.behaviors, {
    "behaviorLagForceRatio":5,
    "behaviorDefaultBlending":1.0
});

/**
 * @class A 2d transform component driven by different behaviors.  Behaviors are located in the
 *        <code>R.components.logic</code> package.
 *
 * @param name The name of the component
 * @param maxForce The maximum force that can be applied to the vehicle
 * @param maxSpeed The top speed of the vehicle
 * @extends R.components.Transform2D
 * @constructor
 */
R.components.transform.BehaviorMover2D = function () {
    "use strict";
    return R.components.Transform2D.extend(/** @scope R.components.transform.BehaviorMover2D.prototype */{

        velocity:null,
        maxForce:0,
        maxSpeed:0,
        stopped:false,
        behaviors:null,

        /** @private */
        constructor:function (name, maxForce, maxSpeed) {
            this.base(name);
            this.stopped = true;
            this.velocity = R.clone(R.math.Vector2D.ZERO);
            this.maxForce = maxForce || R.components.transform.BehaviorMover2D.MAX_FORCE;
            this.maxSpeed = maxSpeed || R.components.transform.BehaviorMover2D.MAX_SPEED;
            this.behaviors = R.struct.HashContainer.create();
        },

        /**
         * Add a behavior to this component.
         * @param name {String} The name of the behavior
         * @param behavior {R.components.Logic} A behavior component to add
         * @param weight {Number} The blending weight of the component amongst all other components
         */
        addBehavior:function (name, behavior, weight) {
            Assert((behavior instanceof R.components.logic.behaviors.BaseBehavior), "Cannot add non-behavior component to BehaviorMover2D!");
            this.behaviors.add(name, {
                b:behavior,
                w:weight || R.Engine.options.behaviors.behaviorDefaultBlending
            });
            behavior.setGameObject(this.getGameObject());
            behavior.setTransformComponent(this);
        },

        /**
         * Get the behavior component, by name.
         * @param name {String}
         * @return {R.components.Logic} The behavior component
         */
        getBehavior:function (name) {
            var b = this.behaviors.get(name);
            return b ? b.b : null;
        },

        /**
         * Remove a behavior, by name.
         * @param name {String} The behavior component to remove
         * @return {R.components.Logic} The component which was removed
         */
        removeBehavior:function (name) {
            var behavior = this.behaviors.removeHash(name);
            if (behavior) {
                behavior = behavior.b;
                behavior.setGameObject(null);
                behavior.setTransformComponent(null);
            }
            return behavior;
        },

        /**
         * Run the behaviors and combine the steering vector from all, weighted by
         * each behavior.
         * @param time {Number} The world time
         * @param dt {Number} The time since the last frame was generated
         * @private
         */
        runBehaviors:function (time, dt) {
            var acc = R.math.Vector2D.create(0, 0), itr = this.behaviors.iterator(),
                steer = R.clone(R.math.Vector2D.ZERO);
            while (itr.hasNext()) {
                var behavior = itr.next();
                var bStr = behavior.b.execute(time, dt);
                steer.set(bStr).mul(behavior.w);
                acc.add(steer);
                if (bStr !== R.math.Vector2D.ZERO) {
                    // Clean up the steering for the behavior
                    bStr.destroy();
                }
            }
            return acc;
        },

        /**
         * Execute this component, calculating motion based on the behaviors.
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
         * @param time {Number} The world time
         * @param dt {Number} The time since the last frame was generated
         */
        execute:function (renderContext, time, dt) {
            if (this.stopped) {
                return;
            }

            // Run the behaviors
            var acceleration = this.runBehaviors(time, dt);

            // Allow the max force to exceed the baseline if the simulation is lagging
            acceleration.truncate(this.maxForce * ((dt / R.Engine.fpsClock) * R.Engine.options.behaviors.behaviorLagForceRatio));

            // Add acceleration to velocity
            this.velocity.add(acceleration);
            this.velocity.truncate(this.maxSpeed);

            // Adjust for time lag
            this.velocity.mul(dt / R.Engine.fpsClock);

            // Move the vehicle
            this.setPosition(this.getPosition().add(this.velocity));

            // Rotate the vehicle to match the direction of travel
            var ang = R.math.Vector2D.UP.signedAngleBetween(this.velocity);
            this.setRotation(ang);

            this.base(renderContext, time, dt);
        },

        /**
         * Stop or start behavior processing.
         * @param state {Boolean} Set to <code>true</code> to stop behaviors from executing
         */
        setStopped:function (state) {
            this.stopped = state;
        },

        /**
         * Get the current velocity of the mover component.
         * @return {R.math.Vector2D}
         */
        getVelocity:function () {
            return this.velocity;
        },

        /**
         * Set the velocity, directly.
         * @param vel {R.math.Vector2D|Number} The velocity vector, or X component
         * @param y {Number} The Y component, if <tt>vel</tt> is the X component
         */
        setVelocity:function (vel, y) {
            this.velocity.set(vel, y).truncate(this.maxSpeed);
        },

        /**
         * Get the maximum speed of this mover component.
         * @return {Number}
         */
        getMaxSpeed:function () {
            return this.maxSpeed;
        },

        /**
         * Get the maximum force that can be applied to this mover component.
         * @return {Number}
         */
        getMaxForce:function () {
            return this.maxForce;
        },

        /**
         * Set the maximum speed which can be applied to this mover component.
         * @param speed {Number} The maximum speed
         */
        setMaxSpeed:function (speed) {
            this.maxSpeed = speed;
        }

    }, /** @scope R.components.transform.BehaviorMover2D.prototype */{
        getClassName:function () {
            return "R.components.transform.BehaviorMover2D";
        },

        MAX_FORCE:10,
        MAX_SPEED:3
    });
};
