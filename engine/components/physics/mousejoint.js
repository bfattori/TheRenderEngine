/**
 * The Render Engine
 * MouseJointComponent
 *
 * @fileoverview A mouse joint which can be used to link the mouse to a {@link R.physics.Simulation}.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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
 * THE SOFTWARE.
 *
 */

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.components.physics.MouseJoint",
    "requires":[
        "R.components.physics.BaseJoint",
        "R.physics.Simulation",
        "R.math.Math2D"
    ]
});

/**
 * @class A mouse joint which allows the mouse to be used to interact within
 *        a {@link R.physics.Simulation}.  The typical usage is to query the
 *        world at the mouse position to determine what the mouse is currently
 *        over, then you begin simulation of the <code>R.components.physics.MouseJoint</code>
 *        component which links it to the body.  When movement of the object via the mouse is
 *        no longer needed, stop simulation of the joint.
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 *
 * @extends R.components.physics.BaseJoint
 * @constructor
 * @description Creates a mouse joint between a rigid body and the mouse.  This a soft constraint
 *              with a maximum force. This allows the constraint to stretch and without applying
 *              huge forces.
 */
R.components.physics.MouseJoint = function () {
    return R.components.physics.BaseJoint.extend(/** @scope R.components.physics.MouseJoint.prototype */{

        mousePos:null,

        /**
         * @private
         */
        constructor:function (name, body, simulation) {
            var jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef();
            this.base(name || "MouseJoint", simulation.getGroundBody(), body, jointDef);
            this.mousePos = new Box2D.Common.Math.b2Vec2(0, 0);
        },

        /**
         * Release the object back into the pool.
         */
        release:function () {
            this.base();
            this.mousePos = null;
        },

        /**
         * When simulation starts set the anchor points to the position of each rigid body.
         * @private
         */
        startSimulation:function () {
            if (!this.getSimulation()) {
                // The initial target is important, otherwise it's assumed to be 0,0
                this.getJointDef().target = this.getBody().getBody().GetPosition();
                this.getJointDef().maxForce = this.getBody().getMass() * R.components.physics.MouseJoint.FORCE_FACTOR;
                this.setCollideBodies(true);
            }
            this.base();
        },

        /**
         * Set the body component which will be affected by the mouse.  This should
         * be called when the joint is not being simulated.
         * @param body {R.components.physics.BaseBody} The body component
         */
        setBody:function (body) {
            this.setBody2(body);
        },

        /**
         * Get the body component linked to this joint.
         * @return {R.components.physics.BaseBody}
         */
        getBody:function () {
            return this.getBody2();
        },

        /**
         * Set the frequency which is used to determine joint softness.  According to
         * Box2d documentation the frequency should be less than half of the time step
         * used for the simulation.  In the engine, the frequency of the time step is
         * the frame rate.
         *
         * @param hz {Number} The frequency in Hertz.
         */
        setFrequency:function (hz) {
            this.getJointDef().frequencyHz = hz;
        },

        /**
         * Get the frequency from the joint definition.
         * @return {Number}
         */
        getFrequency:function () {
            return this.getJointDef().frequencyHz;
        },

        /**
         * Set the damping ratio which is used to determine joint softness.  The value
         * should be between 0.0 and 1.0, with 1.0 being extremely rigid.
         *
         * @param dampingRatio {Number} A value between 0.0 and 1.0
         */
        setDampingRatio:function (dampingRatio) {
            this.getJointDef().dampingRatio = dampingRatio;
        },

        /**
         * Get the damping ratio from the joint definition.
         * @return {Number}
         */
        getDampingRatio:function () {
            return this.getJointDef().dampingRatio;
        },

        /**
         * Set the maximum force to apply to the body when the mouse moves.
         * @param force {Number} The force to apply
         */
        setMaxForce:function (force) {
            this.getJointDef().maxForce = force;
        },

        /**
         * Get the maximum force being applied when the mouse moves.
         * @return {Number}
         */
        getMaxForce:function () {
            return this.getJointDef().maxForce;
        },

        /**
         * Updates the target position with the mouse location.
         * @private
         */
        execute:function (renderContext, time, dt) {
            // Get the mouse info from the context
            var mouseInfo = renderContext.getMouseInfo();
            if (!mouseInfo) {
                AssertWarn("No mouse info on render context for MouseJoint");
                return;
            }

            if (this.getSimulation()) {
                var p = R.clone(mouseInfo.position).div(R.physics.Simulation.WORLD_SIZE);
                this.mousePos.Set(p.x, p.y);
                this.getJoint().SetTarget(this.mousePos);
                p.destroy();
            }

            this.base(renderContext, time, dt);
        }

    }, { /** @scope R.components.physics.MouseJoint.prototype */

        /**
         * Get the class name of this object
         *
         * @return {String} "R.components.physics.MouseJoint"
         */
        getClassName:function () {
            return "R.components.physics.MouseJoint";
        },

        /** @private */
        FORCE_FACTOR:300
    });
}