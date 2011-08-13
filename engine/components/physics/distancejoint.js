/**
 * The Render Engine
 * DistanceJointComponent
 *
 * @fileoverview A distance joint which can be used in a {@link Simulation}.
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
   "class": "R.components.physics.DistanceJoint",
   "requires": [
      "R.components.physics.BaseJoint",
      "R.physics.Simulation",
      "R.math.Math2D"
   ]
});

/**
 * @class A distance joint which maintains constant distance between two bodies
 *        in a {@link R.physics.Simulation}.  You can picture this as a massless
 *        rigid rod anchored at the two anchor points.
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 * @param anchor1 {R.math.Vector2D} The anchor on body 1, or <code>null</code>
 * @param anchor2 {R.math.Vector2D} The anchor on body 2, or <code>null</code>
 *
 * @extends R.components.physics.BaseJoint
 * @constructor
 * @description Creates a distance joint between two physical bodies.  The distance can
 *              be softened by adjusting the frequency and the damping ratio of the joint.
 *              Rotation is not limited by this joint.  If you do not specify anchor 1 or
 *              anchor 2, the joint will use the position of each body offset by its physical
 *              origin.
 */
R.components.physics.DistanceJoint = function() {
   return R.components.physics.BaseJoint.extend(/** @scope R.components.physics.DistanceJoint.prototype */{

      anchor1: null,
      anchor2: null,

      /**
       * @private
       */
      constructor: function(name, body1, body2, anchor1, anchor2) {
         var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();

         if (anchor1) {
            this.anchor1 = R.math.Point2D.create(anchor1).div(R.physics.Simulation.WORLD_SIZE);
         }

         if (anchor2) {
            this.anchor2 = R.math.Point2D.create(anchor2).div(R.physics.Simulation.WORLD_SIZE);
         }

         this.base(name || "DistanceJoint", body1, body2, jointDef);
      },

      /**
       * Offset the joint's anchors by the given point
       * @param pt {R.math.Point2D} The offset amount
       */
      offset: function(pt) {
         var ofs = R.clone(pt).div(R.physics.Simulation.WORLD_SIZE);

         if (this.anchor1) {
            this.anchor1.add(ofs);
         }

         if (this.anchor2) {
            this.anchor2.add(ofs);
         }
         
         ofs.destroy();
      },

      /**
       * When simulation starts set the anchor points to the position of each rigid body.
       * @private
       */
      startSimulation: function() {
         if (!this.getSimulation()) {

            var anchor1 = new Box2D.Common.Math.b2Vec2(), anchor2 = new Box2D.Common.Math.b2Vec2(),
                a1 = this.anchor1, a2 = this.anchor2;

            // If a1 or a2 were not specified, use the position of each body
            if (!a1) {
               a1 = R.math.Point2D.create(this.getBody1().getPosition());
               a1.add(this.getBody1().getLocalOrigin()).div(R.physics.Simulation.WORLD_SIZE);
            }

            if (!a2) {
               a2 = R.math.Point2D.create(this.getBody2().getPosition());
               a2.add(this.getBody2().getLocalOrigin()).div(R.physics.Simulation.WORLD_SIZE);
            }

            // Translate the anchor positions into B2 vectors
            anchor1.Set(a1.x, a1.y);
            anchor2.Set(a2.x, a2.y);

            // Initialize the joint
            this.getJointDef().Initialize(this.getBody1().getBody(), this.getBody2().getBody(),
                                          anchor1, anchor2);
         }

         this.base();
      },

      /**
       * Set the frequency which is used to determine joint softness.  According to
       * Box2d documentation the frequency should be less than half of the time step
       * used for the simulation.  In the engine, the frequency of the time step is
       * the frame rate.
       *
       * @param hz {Number} The frequency in Hertz.
       */
      setFrequency: function(hz) {
         this.getJointDef().frequencyHz = hz;
      },

      /**
       * Get the frequency from the joint definition.
       * @return {Number}
       */
      getFrequency: function() {
         return this.getJointDef().frequencyHz;
      },

      /**
       * Set the damping ratio which is used to determine joint softness.  The value
       * should be between 0.0 and 1.0, with 1.0 being extremely rigid.
       *
       * @param dampingRatio {Number} A value between 0.0 and 1.0
       */
      setDampingRatio: function(dampingRatio) {
         this.getJointDef().dampingRatio = dampingRatio;
      },

      /**
       * Get the damping ratio from the joint definition.
       * @return {Number}
       */
      getDampingRatio: function() {
         return this.getJointDef().dampingRatio;
      }

   }, { /** @scope R.components.physics.DistanceJoint.prototype */

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.physics.DistanceJoint"
       */
      getClassName: function() {
         return "R.components.physics.DistanceJoint";
      }
   });
}