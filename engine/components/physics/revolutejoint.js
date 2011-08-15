/**
 * The Render Engine
 * RevoluteJointComponent
 *
 * @fileoverview A revolute joint which can be used in a {@link Simulation}.
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
   "class": "R.components.physics.RevoluteJoint",
   "requires": [
      "R.components.physics.BaseMotorJoint",
      "R.physics.Simulation",
      "R.math.Point2D",
      "R.math.Math2D",
      "R.math.Vector2D"
   ]
});

/**
 * @class A revolute joint which allows two bodies to revolve around a common
 *        anchor point in a {@link R.physics.Simulation}.
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 * @param anchor {R.math.Point2D} A point, in world coordinates relative to the two
 *    bodies, to use as the joint's anchor point
 *
 * @extends R.components.physics.BaseMotorJoint
 * @constructor
 * @description Creates a revolute joint between two physical bodies.
 */
R.components.physics.RevoluteJoint = function() {
   return R.components.physics.BaseMotorJoint.extend(/** @scope R.components.physics.RevoluteJoint.prototype */{

      anchor: null,
      limits: null,

      /**
       * @private
       */
      constructor: function(name, body1, body2, anchor) {
         var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();

         this.limits = [];
         this.anchor = R.math.Point2D.create(anchor).div(R.physics.Simulation.WORLD_SIZE);
         this.base(name || "RevoluteJoint", body1, body2, jointDef);
      },

      /**
       * When simulation starts offset the anchor point by the position of rigid body 1 (the "from" body).
       * @private
       */
      startSimulation: function() {
         if (!this.getSimulation()) {
            var anchor = new Box2D.Common.Math.b2Vec2();
            anchor.Set(this.anchor.x, this.anchor.y);

            this.getJointDef().Initialize(this.getBody1().getBody(), this.getBody2().getBody(), anchor);

            if (this.limits.length != 0) {
               this.getJointDef().upperAngle = R.math.Math2D.degToRad(Math.max(this.limits[1], this.limits[0]));
               this.getJointDef().lowerAngle = R.math.Math2D.degToRad(Math.min(this.limits[0], this.limits[1]));
               this.getJointDef().enableLimit = true;
            }
         }

         this.base();
      },

      /**
       * Offset the joint's anchors by the given point
       * @param pt {R.math.Point2D} The offset amount
       */
      offset: function(pt) {
         var ofs = R.clone(pt).div(R.physics.Simulation.WORLD_SIZE);
         this.anchor.add(ofs);
         ofs.destroy();
      },

      /**
       * Clear the rotational limits.
       */
      clearLimits: function() {
         this.limits = [];
      },

      /**
       * Get the upper limiting angle, in degrees, through which the joint can rotate.
       * @return {Number} The angle, or <code>undefined</code>
       */
      getUpperLimitAngle: function() {
         return this.limits.length != 0 ? R.math.Math2D.radToDeg(this.limits[1]) : undefined;
      },

      /**
       * Set the upper limiting angle through which the joint can rotate.  Zero is the
       * "top" of the rotation, with rotation moving positively in a counter-clockwise
       * rotation.  Negative numbers will move the rotation clockwise.
       *
       * @param angle {Number} An angle in degrees
       */
      setUpperLimitAngle: function(angle) {
         this.limits[1] = R.math.Math2D.degToRad(angle);
      },

      /**
       * Get the lower limiting angle, in degrees, through which the joint can rotate.
       * @return {Number} The angle, or <code>undefined</code>
       */
      getLowerLimitAngle: function() {
         return this.limits.length != 0 ? R.math.Math2D.radToDeg(this.limits[0]) : undefined;
      },

      /**
       * Set the upper limiting angle through which the joint can rotate.  Zero is the
       * "top" of the rotation, with rotation moving positively in a counter-clockwise
       * rotation.  Negative numbers will move the rotation clockwise.
       *
       * @param angle {Number} An angle in degrees
       */
      setLowerLimitAngle: function(angle) {
         this.limits[0] = R.math.Math2D.degToRad(angle);
      },

      /**
       * During simulation, this returns the current angle of the joint
       * in degrees.  Outside of simulation it will always return zero.
       * @return {Number}
       */
      getJointAngle: function() {
         if (this.simulation) {
            return R.math.Math2D.radToDeg(this.getJoint().GetJointAngle());
         } else {
            return 0;
         }
      }

   }, { /** @scope R.components.physics.RevoluteJoint.prototype */

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.physics.RevoluteJoint"
       */
      getClassName: function() {
         return "R.components.physics.RevoluteJoint";
      }
   });
};