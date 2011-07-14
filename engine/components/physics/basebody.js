/**
 * The Render Engine
 * BaseBodyComponent
 *
 * @fileoverview The base component type for all physical bodies which can be used
 *               in a {@link Simulation}.
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
   "class": "R.components.physics.BaseBody",
   "requires": [
      "R.components.Transform2D",
      "R.math.Point2D",
      "R.math.Vector2D",
      "R.math.Rectangle2D",
      "R.physics.Simulation"
   ]
});

/**
 * @class The base component which initializes rigid bodies
 *        for use in a {@link R.physics.Simulation}.
 *
 * @param name {String} Name of the component
 * @param fixtureDef {Box2D.Dynamics.b2FixtureDef} The fixture definition.
 *
 * @extends R.components.Transform2D
 * @constructor
 * @description All physical body components should extend from this component type
 *              to inherit such values as density and friction, and gain access to position and rotation.
 */
R.components.physics.BaseBody = function() {
   return R.components.Transform2D.extend(/** @scope R.components.physics.BaseBody.prototype */{

      bodyDef: null,
      fixtureDef: null,
      simulation: null,
      body: null,
      rotVec: null,
      bodyPos: null,
      renderComponent: null,
      origin: null,

      scaledPoint: null,
      _states: null,

      /**
       * @private
       */
      constructor: function(name, fixtureDef) {
         this.base(name || "BaseBody");

         this.bodyDef = new Box2D.Dynamics.b2BodyDef();
         this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

         this.fixtureDef = fixtureDef;
         this.fixtureDef.restitution = R.components.physics.BaseBody.DEFAULT_RESTITUTION;
         this.fixtureDef.density = R.components.physics.BaseBody.DEFAULT_DENSITY;
         this.fixtureDef.friction = R.components.physics.BaseBody.DEFAULT_FRICTION;
         this.simulation = null;
         this.rotVec = R.math.Vector2D.create(0, 0);
         this.bodyPos = R.math.Point2D.create(0, 0);
         this.origin = R.math.Point2D.create(0, 0);
         this.scaledPoint = R.math.Point2D.create(0, 0);

         // 0: Active, 1: Sleeping
         this._states = [false, false];
      },

      /**
       * Destroy the object
       */
      destroy: function() {
         if (this.simulation) {
            this.stopSimulation();
         }

         if (this.renderComponent != null) {
            this.renderComponent.destroy();
         }

         this.rotVec.destroy();
         this.bodyPos.destroy();
         this.origin.destroy();
         this.scaledPoint.destroy();

         this.base();
      },

      /**
       * Releases the object back into the pool
       */
      release: function() {
         this.base();

         this.rotVec = null;
         this.bodyPos = null;
         this.origin = null;
         this._states = null;
      },

      /**
       * Start simulating the body.  If the body isn't a part of the simulation,
       * it is added and simulation occurs.  Position and rotation will be updated.
       */
      startSimulation: function() {
         if (!this.simulation) {
            this.simulation = this.getGameObject().getSimulation();
            this.body = this.simulation.addBody(this.getBodyDef(), this.getFixtureDef());

            // Add something to the body so we can get back to this object
            this.body.__$backRef$__ = this;
         }
      },

      /**
       * Stop simulating the body.  If the body is a part of a simulation,
       * it is removed and simulation stops.  The position and rotation of
       * the body will not be updated.
       */
      stopSimulation: function() {
         if (this.simulation) {
            this.simulation.removeBody(this.getBody());
            this.simulation = null;
         }
      },

      /**
       * Set the associated render component for this body.  This is typically used by the
       * {@link PhysicsActor} to link a body to a renderer so that each body can have an
       * associated renderer applied.
       *
       * @param renderComponent {R.components.Render} The render component to associate with this body
       */
      setRenderComponent: function(renderComponent) {
         this.renderComponent = renderComponent;
         if (renderComponent != null) {
            this.renderComponent.setGameObject(this.getGameObject());
         }
      },

      /**
       * Get the associated render component for this body.
       * @return {R.components.Render} or <code>null</code>
       */
      getRenderComponent: function() {
         return this.renderComponent;
      },

      /**
       * Set the origin of the rigid body.  By default, the origin is the top left corner of
       * the bounding box for the body.  Most times the origin should be set to the center
       * of the body.
       *
       * @param x {Number|R.math.Point2D} The X coordinate or a <tt>Point2D</tt>
       * @param y {Number} The Y coordinate or <tt>null</tt> if X is a <tt>Point2D</tt>
       */
      setLocalOrigin: function(x, y) {
         this.origin.set(x, y);
      },

      /**
       * Get the local origin of the body.
       * @return {R.math.Point2D}
       */
      getLocalOrigin: function() {
         return this.origin;
      },

      /**
       * Get the center of the body.
       * @return {R.math.Point2D}
       */
      getCenter: function() {
         return R.clone(this.getPosition()).add(this.getLocalOrigin());
      },

      /**
       * [ABSTRACT] Get a box which bounds the body.
       * @return {R.math.Rectangle2D}
       */
      getBoundingBox: function() {
         return R.math.Rectangle2D.create(0, 0, 1, 1);
      },

      /**
       * Get the Box2d fixture definition object.
       * @return {Box2D.Dynamics.b2FixtureDef}
       */
      getFixtureDef: function() {
         return this.fixtureDef;
      },

      /**
       * Get the Box2d body definition object.
       * @return {b2BodyDef}
       */
      getBodyDef: function() {
         return this.bodyDef;
      },

      /**
       * Get the Box2d body object which was added to the simulation.
       * @return {b2Body}
       */
      getBody: function() {
         return this.body;
      },

      /**
       * Update the fixture on a simulated body. Doing so may cause a hiccup in simulation
       * @protected
       */
      updateFixture: function() {
         if (this.simulation) {
            // Destroy the current fixture, then recreate it ()
            this.getBody().DestroyFixture(this.fixtureDef);
            this.getBody().CreateFixture(this.fixtureDef);
         }
      },

      /**
       * Set the resitution (bounciness) of the body.  The value should be between
       * zero and one.  Values higher than one are accepted, but produce objects which
       * are unrealistically bouncy.
       *
       * @param restitution {Number} A value between 0.0 and 1.0
       */
      setRestitution: function(restitution) {
         this.fixtureDef.restitution = restitution;
         this.updateFixture();
      },

      /**
       * Get the resitution (bounciness) value for the body.
       * @return {Number}
       */
      getRestitution: function() {
         return this.fixtureDef.restitution;
      },

      /**
       * Set the density of the body.
       *
       * @param density {Number} The density of the body
       */
      setDensity: function(density) {
         this.fixtureDef.density = density;
         this.updateFixture();
      },

      /**
       * Get the density of the body.
       * @return {Number}
       */
      getDensity: function() {
         return this.fixtureDef.density;
      },

      /**
       * Set the friction of the body.  Lower values slide easily across other bodies.
       * Higher values will cause a body to stop moving as it slides across other bodies.
       * However, even a body which has high friction will keep sliding across a body
       * with no friction.
       *
       * @param friction {Number} The friction of the body
       */
      setFriction: function(friction) {
         this.fixtureDef.friction = friction;
         this.updateFixture();
      },

      /**
       * Get the friction of the body.
       * @return {Number}
       */
      getFriction: function() {
         return this.fixtureDef.friction;
      },

      /**
       * Set the initial position of the body.  Once a body is in motion, updating
       * its position should be avoided since it doesn't fit with physical simulation.
       * To change an object's position, try applying forces or impulses to the body.
       *
       * @param point {R.math.Point2D} The initial position of the body
       */
      setPosition: function(point) {
         if (!this.simulation) {
            this.scaledPoint.set(point).div(R.physics.Simulation.WORLD_SIZE);
            this.getBodyDef().position.Set(this.scaledPoint.x, this.scaledPoint.y);
         } else {
            this.scaledPoint.set(point).div(R.physics.Simulation.WORLD_SIZE);
            var bv = new Box2D.Common.Math.b2Vec2(this.scaledPoint.x, this.scaledPoint.y);
            this.getBody().SetPosition(bv);
         }
      },

      /**
       * Get the position of the body during simulation.  This value is updated
       * as the simulation is stepped.
       * @return {R.math.Point2D}
       */
      getPosition: function() {
         if (this.simulation) {
            var bp = this.getBody().GetPosition();
            this.scaledPoint.set(bp.x, bp.y).mul(R.physics.Simulation.WORLD_SIZE);
            this.bodyPos.set(this.scaledPoint);
         } else {
            this.scaledPoint.set(this.getBodyDef().position.x, this.getBodyDef().position.y).mul(R.physics.Simulation.WORLD_SIZE);
            this.bodyPos.set(this.scaledPoint);
         }
         return this.bodyPos;
      },

      /**
       * Get the rotation of the body.  This value is updated as the simulation is stepped.
       * @return {Number}
       */
      getRotation: function() {
         if (this.simulation) {
            return R.math.Math2D.radToDeg(this.getBody().GetAngle());
         } else {
            return this.getBodyDef().angle;
         }
      },

      /**
       * Set the angle of rotation for the body, in degrees.
       * @param angle {Number} The rotation angle in degrees
       */
      setRotation: function(angle) {
         if (this.simulation) {
            this.getBody().SetAngle(R.math.Math2D.degToRad(angle));
         } else {
            this.getBodyDef().angle = R.math.Math2D.degToRad(angle);
         }
      },

      /**
       * Apply a force at a world point. If the force is not applied at the center of mass,
       * it will generate a torque and affect the angular velocity. This wakes up the body.
       * Forces are comprised of a force vector and
       * a position.  The force vector is the direction in which the force is
       * moving, while the position is where on the body the force is acting.
       * Forces act upon a body from world coordinates.
       *
       * @param forceVector {R.math.Vector2D} The force vector
       * @param position {R.math.Point2D} The position where the force is acting upon the body
       */
      applyForce: function(forceVector, position) {
         var fv = new Box2D.Common.Math.b2Vec2(forceVector.x, forceVector.y);
         var dv = new Box2D.Common.Math.b2Vec2(position.x, position.y);
         this.getBody().ApplyForce(fv, dv);
      },

      /**
       * Apply an impulse at a point. This immediately modifies the velocity. It also modifies
       * the angular velocity if the point of application is not at the center of mass. This wakes
       * up the body.  Impulses are comprised of an impulse vector and
       * a position.  The impulse vector is the direction of the impulse, while the position
       * is where on the body the impulse will be applied.
       * Impulses act upon a body locally, adjusting its velocity.
       *
       * @param impulseVector {R.math.Vector2D} The impulse vectory
       * @param position {R.math.Point2D} the position where the impulse is originating from in the body
       */
      applyImpulse: function(impulseVector, position) {
         var iv = new Box2D.Common.Math.b2Vec2(impulseVector.x, impulseVector.y);
         var dv = new Box2D.Common.Math.b2Vec2(position.x, position.y);
         this.getBody().ApplyImpulse(iv, dv);
      },

      /**
       * Apply torque to the body. This affects the angular velocity without affecting the
       * linear velocity of the center of mass.
       *
       * @param torque {Number} The amount of torque to apply to the body
       */
      applyTorque: function(torque) {
         this.getBody().ApplyTorque(torque);
      },

      /**
       * Get the total mass of the body.  If the body is not simulating, this
       * returns <code>Infinity</code>.
       *
       * @return {Number} The mass of the body, or <code>Infinity</code>
       */
      getMass: function() {
         if (this.simulation) {
            return this.getBody().GetMass();
         } else {
            return this.getBodyDef().massData.mass;
         }
      },

      /**
       * Set the total mass of the body in kilograms.
       * @param mass {Number} The mass of the body in kg
       */
      setMass: function(mass) {
         if (this.simulation) {
            var mData = new Box2D.Dynamics.b2MassData();
            this.getBody().GetMassData(mData);
            mData.mass = mass;
            this.getBody().SetMassData(mData);
            mData = null;
         } else {
            this.getBodyDef().massData.mass = mass;
         }
      },

      /**
       * Get the linear damping of the body.
       * @return {Number}
       */
      getLinearDamping: function() {
         if (this.simulation) {
            return this.getBody().GetLinearDamping();
         } else {
            return this.getBodyDef().linearDamping;
         }
      },

      /**
       * Get the angular damping of the body.
       * @return {Number}
       */
      getAngularDamping: function() {
         if (this.simulation) {
            return this.getBody().GetAngularDamping();
         } else {
            return this.getBodyDef().angularDamping;
         }
      },

      /**
       * Sets the linear and angular damping of a body. Damping is used to reduce the
       * world velocity of bodies.  Damping differs from friction in that friction
       * only occurs when two surfaces are in contact.  Damping is not a replacement
       * for friction.  A value between 0 and <code>Infinity</code> can be used, but
       * normally the value is between 0 and 1.0.
       *
       * @param linear {Number} The amount of linear damping
       * @param angular {Number} The amount of angular damping
       */
      setDamping: function(linear, angular) {
         if (this.simulation) {
            this.getBody().SetLinearDamping(linear);
            this.getBody().SetAngularDamping(linear);
         } else {
            this.getBodyDef().linearDamping = linear;
            this.getBodyDef().angularDamping = angular;
         }
      },

      /**
       * Returns <code>true</code> if the body is static.  A body is static if it
       * isn't updated part of the simulation during contacts.
       * @return {Boolean}
       */
      isStatic: function() {
         if (this.simulation) {
            return this.getBody().GetType() == Box2D.Dynamics.b2Body.b2_staticBody;
         } else {
            return this.getBodyDef().type == Box2D.Dynamics.b2Body.b2_staticBody;
         }
      },

      /**
       * Returns <code>true</code> if the body is sleeping.  A body is sleeping if it
       * has settled to the point where no movement is being calculated.  If you want
       * to perform an action upon a body, other than applying force, torque, or impulses,
       * you must call {@link #wakeUp}.
       * @return {Boolean}
       */
      isSleeping: function() {
         if (this.simulation) {
            return !this.getBody().IsAwake();
         } else {
            return !this.getBodyDef().awake;
         }
      },

      /**
       * Returns <code>true</code> if the body is active.  An active body is updated during
       * the simulation and can be collided with.
       * @return {Boolean}
       */
      isActive: function() {
         if (this.simulation) {
            return this.getBody().IsActive();
         } else {
            return this.getBodyDef().active;
         }
      },

      /**
       * Wake up a body, adding it back into the collection of bodies being simulated.
       * If the body is not being simulated, this does nothing.
       */
      wakeUp: function() {
         if (this.simulation) {
            this.getBody().SetAwake(true);
         }
      },

      /**
       * Sets the active state of a body.  Setting the active flag to <tt>false</tt> will
       * remove the object from simulation.  Setting it to true will add it back into the
       * simulation.
       * @param active {Boolean} The activity flag
       */
      setActive: function(active) {
         if (this.simulation) {
            this.getBody().SetActive(active);
         } else {
            this.getBodyDef().active = active;
         }
      },

      /**
       * Checks a couple of flags on the body and triggers events when they change.  Fires
       * the <code>active</code> event on the game object when this body changes its "active" state.
       * Fires the <code>sleeping</code> event on the game object when this body changes its
       * "sleeping" state.  Both events are passed the body which changed state, and a flag
       * indicating the current state.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      execute: function(renderContext, time, dt) {
         this.base(renderContext, time, dt);

         // Check the sleeping and active states so we can trigger events
         var activeChange = false, sleepChange = false;
         if (!this._states[0] && this.isActive()) {
            this._states[0] = true;
            activeChange = true;
         } else if (this._states[0] && !this.isActive()) {
            this._states[0] = false;
            activeChange = true;
         }

         if (!this._states[1] && this.isSleeping()) {
            this._states[1] = true;
            sleepChange = true;
         } else if (this._states[1] && !this.isSleeping()) {
            this._states[1] = false;
            sleepChange = true;
         }

         if (activeChange)
            this.getGameObject().triggerEvent("active", [this, this._states[0]]);

         if (sleepChange)
            this.getGameObject().triggerEvent("sleeping", [this, this._states[1]]);
      }

   }, { /** @scope R.components.physics.BaseBody.prototype */

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.physics.BaseBody"
       */
      getClassName: function() {
         return "R.components.physics.BaseBody";
      },

      /**
       * The default restitution (bounciness) of a body
       * @type {Number}
       */
      DEFAULT_RESTITUTION: 0.48,

      /**
       * The default density of a body
       */
      DEFAULT_DENSITY: 1.0,

      /**
       * The default friction of a body
       * @type {Number}
       */
      DEFAULT_FRICTION: 0.5

   });
};