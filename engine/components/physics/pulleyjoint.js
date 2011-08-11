/**
 * The Render Engine
 * PulleyJointComponent
 *
 * @fileoverview A pulley joint which can be used in a {@link Simulation}.
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
   "class": "R.components.physics.PulleyJoint",
   "requires": [
      "R.components.physics.BaseJoint",
      "R.physics.Simulation",
      "R.math.Math2D"
   ]
});

/**
 * @class A pulley joint which links two bodies together via a pulley in a {@link R.physics.Simulation}.
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 * @param anchor1 {R.math.Point2D} A point, in world coordinates relative to the two
 *    bodies, to use as one of the joint's anchor points
 * @param anchor2 {R.math.Point2D} A point, in world coordinates relative to the two
 *    bodies, to use as one of the joint's anchor points
 * @param [ratio=1] {Number} The ratio between the two anchors.
 *
 * @extends R.components.physics.BaseJoint
 * @constructor
 * @description Creates a pulley joint between two physical bodies.
 */
R.components.physics.PulleyJoint = function() {
   return R.components.physics.BaseJoint.extend(/** @scope R.components.physics.PulleyJoint.prototype */{

      anchor1: null,
      anchor2: null,
      ratio: 0,

      /**
       * @private
       */
      constructor: function(name, body1, body2, anchor1, anchor2, ratio) {
         var jointDef = new Box2D.Dynamics.Joints.b2PulleyJointDef();

         this.anchor1 = R.math.Point2D.create(anchor1).div(R.physics.Simulation.WORLD_SIZE);
         this.anchor2 = R.math.Point2D.create(anchor2).div(R.physics.Simulation.WORLD_SIZE);
         this.ratio = ratio || 1;

         this.base(name || "PulleyJoint", body1, body2, jointDef);
      },

      /**
       * When simulation starts offset the anchor point by the position of rigid body 1 (the "from" body).
       * @private
       */
      startSimulation: function() {
         if (!this.getSimulation()) {
            var sim = this.getGameObject().getSimulation();

            var anchor1 = new Box2D.Common.Math.b2Vec2(), anchor2 = new Box2D.Common.Math.b2Vec2();
            anchor1.Set(this.anchor1.x, this.anchor1.y);
            anchor2.Set(this.anchor2.x, this.anchor2.y);

            this.getJointDef().Initialize(this.getBody1().getBody(), this.getBody2().getBody(),
                                          sim.getGroundBody(), sim.getGroundBody(),
                                          anchor1, anchor2, this.ratio);
         }

         this.base();
      }

   }, { /** @scope R.components.physics.PulleyJoint.prototype */

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.physics.PulleyJoint"
       */
      getClassName: function() {
         return "R.components.physics.PulleyJoint";
      }
   });
};