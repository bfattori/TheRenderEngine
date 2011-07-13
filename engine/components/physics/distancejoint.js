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
		"R.math.Point2D",
		"R.math.Vector2D",
		"R.math.Rectangle2D",
		"R.math.Math2D"
	]
});

/**
 * @class A distance joint which maintains constant distance between two bodies
 * 		 in a {@link R.physics.Simulation}.  
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 *
 * @extends R.components.physics.BaseJoint
 * @constructor
 * @description Creates a distance joint between two physical bodies.  The distance can
 * 				 be softened by adjusting the frequency and the damping ratio of the joint.
 * 				 Rotation is not limited by this joint.  The anchors for the joint are the
 * 				 rigid body center's.
 */
R.components.physics.DistanceJoint = function() {
	return R.components.physics.BaseJoint.extend(/** @scope R.components.physics.DistanceJoint.prototype */{

   /**
    * @private
    */
	constructor: function(name, body1, body2) {
		var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();
		this.base(name || "DistanceJoint", body1, body2, jointDef);	
	},
	
	/**
	 * When simulation starts set the anchor points to the position of each rigid body.
	 * @private
	 */
	startSimulation: function() {
		if (!this.getSimulation()) {
         var a1 = R.math.Point2D.create(this.getBody1().getPosition());
			var a2 = R.math.Point2D.create(this.getBody2().getPosition());
			a1.add(this.getBody1().getLocalOrigin()).div(R.physics.Simulation.WORLD_SIZE);
			a2.add(this.getBody2().getLocalOrigin()).div(R.physics.Simulation.WORLD_SIZE);

			this.getJointDef().localAnchorA.Set(a1.x, a1.y);
			this.getJointDef().localAnchorB.Set(a2.x, a2.y);
			a1.destroy();
			a2.destroy();
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