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
		"R.components.physics.BaseJoint",
      "R.physics.Simulation",
		"R.math.Point2D",
		"R.math.Math2D",
		"R.math.Vector2D"
	]
});

/**
 * @class A revolute joint which allows two bodies to revolve around a common
 * 		 anchor point in a {@link R.physics.Simulation}.  
 *
 * @param name {String} Name of the component
 * @param body1 {R.components.physics.BaseBody} The first body for the joint
 * @param body2 {R.components.physics.BaseBody} The second body for the joint
 * @param anchor {R.math.Point2D} A point, in world coordinates relative to the two 
 * 	bodies, to use as the joint's anchor point
 *
 * @extends R.components.physics.BaseJoint
 * @constructor
 * @description Creates a revolute joint between two physical bodies.
 */
R.components.physics.RevoluteJoint = function() {
	return R.components.physics.BaseJoint.extend(/** @scope R.components.physics.RevoluteJoint.prototype */{

	anchor: null,

   /**
    * @private
    */
	constructor: function(name, body1, body2, anchor) {
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
		
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
		}
		
		this.base();
	},
	
	/**
	 * Get the upper limiting angle, in degrees, through which the joint can rotate.
	 * @return {Number}
	 */
	getUpperLimitAngle: function() {
		return R.math.Math2D.radToDeg(this.getJointDef().upperAngle);
	},
	
	/**
	 * Set the upper limiting angle through which the joint can rotate.
	 * 
	 * @param angle {Number} An angle in degrees
	 */
	setUpperLimitAngle: function(angle) {
		this.getJointDef().upperAngle = R.math.Math2D.degToRad(angle);
		this.getJointDef().enableLimit = true;	
	},
	
	/**
	 * Get the lower limiting angle, in degrees, through which the joint can rotate.
	 * @return {Number}
	 */
	getLowerLimitAngle: function() {
		return R.math.Math2D.radToDeg(this.getJointDef().lowerAngle);	
	},
	
	/**
	 * Set the upper limiting angle through which the joint can rotate.
	 * 
	 * @param angle {Number} An angle in degrees
	 */
	setLowerLimitAngle: function(angle) {
		this.getJointDef().lowerAngle = R.math.Math2D.degToRad(angle);	
		this.getJointDef().enableLimit = true;	
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
	},
	
	/**
	 * Get the torque which will be applied when the joint is used as a motor.
	 * @return {Number} 
	 */
	getMotorTorque: function() {
		if (this.simulation) {
			return this.getJoint().GetMotorTorque(1 / R.Engine.getFPS());
		} else {
			this.getJointDef().motorTorque;	
		}
	},
	
	/**
	 * Set the torque which is applied via the motor, or to resist forces applied to it.  You can
	 * use this value to simulate joint friction by setting the motor speed to zero
	 * and applying a small amount of torque.  During simulation, the torque is applied directly
	 * to the joint.
	 * 
	 * @param torque {Number} The amount of torque to apply
	 */
	setMotorTorque: function(torque) {
		if (this.simulation) {
			// Apply directly to the joint
			this.getJoint().SetMotorTorque(torque);
		} else {
			// Apply to the joint definition
			this.getJointDef().motorTorque = torque;
			this.getJointDef().enableMotor = true;	
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
			return this.getJointDef().motorSpeed;	
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
			this.getJointDef().motorSpeed = speed;	
			this.getJointDef().enableMotor = true;	
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
}