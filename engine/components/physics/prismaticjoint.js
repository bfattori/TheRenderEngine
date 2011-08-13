/**
 * The Render Engine
 * PrismaticJointComponent
 *
 * @fileoverview A prismatic joint which can be used in a {@link Simulation}.
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
   "class": "R.components.physics.PrismaticJoint",
   "requires": [
      "R.components.physics.BaseMotorJoint",
      "R.physics.Simulation",
      "R.math.Math2D"
   ]
});

/**
 * @class A prismatic joint which allows movement in one degree of freedom: translation along
 *        an axis anchored in the first body.  The joint limits relative rotations.
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 * @param anchor {R.math.Point2D} A point, in world coordinates relative to the two
 *    bodies, to use as the joint's anchor point
 * @param [axis] {R.math.Vector2D} The axis of translation.  If <code>null</code> the
 *        "up" vector is applied.
 *
 * @extends R.components.physics.BaseMotorJoint
 * @constructor
 * @description Creates a prismatic joint between two physical bodies.
 */
R.components.physics.PrismaticJoint = function() {
   return R.components.physics.BaseMotorJoint.extend(/** @scope R.components.physics.RevoluteJoint.prototype */{

      anchor: null,
      limits: null,
      axis: null,

      /**
       * @private
       */
      constructor: function(name, body1, body2, anchor, axis) {
         var jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();

         this.limits = [];
         this.anchor = R.math.Point2D.create(anchor).div(R.physics.Simulation.WORLD_SIZE);

         if (axis) {
            this.axis = R.math.Vector2D.create(axis);
         } else {
            this.axis = R.clone(R.math.Vector2D.UP);
         }

         this.base(name || "PrismaticJoint", body1, body2, jointDef);
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
       * When simulation starts offset the anchor point by the position of rigid body 1 (the "from" body).
       * @private
       */
      startSimulation: function() {
         if (!this.getSimulation()) {
            var anchor = new Box2D.Common.Math.b2Vec2(), axis = new Box2D.Common.Math.b2Vec2();
            anchor.Set(this.anchor.x, this.anchor.y);
            axis.Set(this.axis.x, this.axis.y);

            this.getJointDef().Initialize(this.getBody1().getBody(), this.getBody2().getBody(), anchor, axis);

            if (this.limits.length != 0) {
               this.getJointDef().upperTranslation = this.limits[1];
               this.getJointDef().lowerTranslation = this.limits[0];
               this.getJointDef().enableLimit = true;
            }
         }

         this.base();
      },

      /**
       * Clear the translation limits.
       */
      clearLimits: function() {
         this.limits = [];
      },

      /**
       * Get the upper limit of translation, in meters, through which the joint can travel.
       * @return {Number}
       */
      getUpperLimit: function() {
         return this.limits[1];
      },

      /**
       * Set the upper limit of translation through which the joint can travel.
       *
       * @param limit {Number} The limit, in meters
       */
      setUpperLimit: function(limit) {
         this.limits[1] = limit;
      },

      /**
       * Get the lower limit of translation, in meters, through which the joint can travel.
       * @return {Number}
       */
      getLowerLimit: function() {
         return this.limits[0];
      },

      /**
       * Set the lower limit of translation through which the joint can travel.
       *
       * @param limit {Number} The limit, in meters
       */
      setLowerLimit: function(limit) {
         this.limits[0] = limit;
      }

   }, { /** @scope R.components.physics.PrismaticJoint.prototype */

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.physics.PrismaticJoint"
       */
      getClassName: function() {
         return "R.components.physics.PrismaticJoint";
      }
   });
};