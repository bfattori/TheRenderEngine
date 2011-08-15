/**
 * The Render Engine
 * BaseMotorJointComponent
 *
 * @fileoverview Base motor joint is used as the class from which motor joints originate.
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
   "class": "R.components.physics.BaseMotorJoint",
   "requires": [
      "R.components.physics.BaseJoint",
      "R.physics.Simulation",
      "R.math.Math2D"
   ]
});

/**
 * @class The base motor joint for all joints which can be driven by a motor.
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 * @param anchor {R.math.Point2D} A point, in world coordinates relative to the two
 *    bodies, to use as the joint's anchor point
 *
 * @extends R.components.physics.BaseJoint
 * @constructor
 * @description Creates a revolute joint between two physical bodies.
 */
R.components.physics.BaseMotorJoint = function() {
   return R.components.physics.BaseJoint.extend(/** @scope R.components.physics.BaseMotorJoint.prototype */{

      mForce: null,
      mSpeed: null,

      /**
       * @private
       */
      constructor: function(name, body1, body2, jointDef) {
         this.mForce = null;
         this.mSpeed = 0;
         this.base(name || "BaseMotorJoint", body1, body2, jointDef);
      },

      /**
       * When simulation starts offset the anchor point by the position of rigid body 1 (the "from" body).
       * @private
       */
      startSimulation: function() {
         if (!this.getSimulation()) {
            if (this.mForce != null) {
               if (this.getJointDef().type == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint)
                  this.getJointDef().maxMotorTorque = this.mForce;
               else
                  this.getJointDef().maxMotorForce = this.mForce;
               
               this.getJointDef().motorSpeed = this.mSpeed;
               this.getJointDef().enableMotor = true;
            }
         }

         this.base();
      },

      /**
       * Clear the motor force.
       */
      clearForce: function() {
         this.mForce = null;
      },

      /**
       * Get the force which will be applied when the joint is used as a motor.
       * @return {Number}
       */
      getMotorForce: function() {
         if (this.simulation) {
            return this.getJoint().GetMotorTorque(1 / R.Engine.getFPS());
         } else {
            return this.mTorque;
         }
      },

      /**
       * Set the force which is applied via the motor, or to resist forces applied to it.  You can
       * use this value to simulate joint friction by setting the motor speed to zero
       * and applying a small amount of force.  During simulation, the force is applied directly
       * to the joint.  In joints where torque is used, the force is applied to the torque instead.
       *
       * @param force {Number} The amount of force to apply
       */
      setMotorForce: function(force) {
         if (this.simulation) {
            // Apply directly to the joint
            if (this.getJointDef().type == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint)
               this.getJoint().SetMotorTorque(force);
            else
               this.getJoint().SetMotorForce(force);
         } else {
            // Apply to the joint definition
            this.mForce = force;
         }
      },

      /**
       * Get the speed of the motor.  During simulation, the value returned is the
       * joint's speed, not the speed set for the motor.
       * @return {Number}
       */
      getMotorSpeed: function() {
         if (this.simulation) {
            return this.getJoint().GetJointSpeed();
         } else {
            return this.mSpeed;
         }
      },

      /**
       * Set the speed of the motor applied to the joint.
       *
       * @param speed {Number} The speed of the motor
       */
      setMotorSpeed: function(speed) {
         if (this.simulation) {
            this.getJoint().SetMotorSpeed(speed);
         } else {
            this.mSpeed = speed;
         }
      },

      /**
       * During simulation, get the reaction force vector of the joint.  Outside
       * of simulation, the vector will be zero.
       * @return {R.math.Vector2D}
       */
      getReactionForce: function() {
         if (this.simulation) {
            var vec = this.getJoint().GetReactionForce(1 / R.Engine.getFPS());
            return R.math.Vector2D.create(vec.x, vec.y);
         } else {
            return R.math.Vector2D.ZERO;
         }
      },

      /**
       * During simulation, get the reaction torque.  Outside of simulation, the
       * torque is zero.
       * @return {Number}
       */
      getReactionTorque: function() {
         if (this.simulation) {
            return this.getJoint().GetReactionTorque(1 / R.Engine.getFPS());
         } else {
            return 0;
         }
      }

   }, { /** @scope R.components.physics.BaseMotorJoint.prototype */

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.physics.BaseMotorJoint"
       */
      getClassName: function() {
         return "R.components.physics.BaseMotorJoint";
      }
   });
};