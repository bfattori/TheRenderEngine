/**
 * The Render Engine
 * BaseRigidBody
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class The base component which initializes rigid bodies
 *        for use in a {@link Simulation}.
 *
 * @param name {String} Name of the component
 * @param fixtureDef {Box2D.Dynamics.b2FixtureDef} The fixture definition.
 *
 * @extends Transform2DComponent
 * @constructor
 * @description All physical body components should extend from this component type
 *              to inherit such values as density and friction, and gain access to position and rotation.
 */
class BaseRigidBody extends Transform2DComponent {

  static DEFAULT_RESTITUTION = 0.48;
  static DEFAULT_DENSITY = 1.0;
  static DEFAULT_FRICTION = 0.5;

  constructor(name = "BaseRigidBody", fixtureDef) {
    super(name);
    this.bodyOpts = {
      bodyDef: new Box2D.Dynamics.b2BodyDef(),
      fixtureDef: fixtureDef,
      simulation: null,
      rotVec: Vector2D.create(0, 0),
      bodyPos: Point2D.create(0, 0),
      origin: Point2D.create(0, 0),
      scaledPoint: Point2D.create(0, 0),
      renderComponent: null,

      // 0: Active, 1: Sleeping
      _states: [false, false]

    };

    this.bodyOpts.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    this.bodyOpts.fixtureDef.restitution = BaseRigidBody.DEFAULT_RESTITUTION;
    this.bodyOpts.fixtureDef.density = BaseRigidBody.DEFAULT_DENSITY;
    this.bodyOpts.fixtureDef.friction = BaseRigidBody.DEFAULT_FRICTION;
  }

  /**
   * Destroy the object
   */
  destroy() {
    if (this.bodyOpts.simulation) {
      this.bodyOpts.stopSimulation();
    }

    if (this.bodyOpts.renderComponent != null) {
      this.bodyOpts.renderComponent.destroy();
    }

    this.bodyOpts.rotVec.destroy();
    this.bodyOpts.bodyPos.destroy();
    this.bodyOpts.origin.destroy();
    this.bodyOpts.scaledPoint.destroy();

    super.destroy();
  }

  /**
   * Releases the object back into the pool
   */
  release() {
    super.release();
    this.bodyOpts = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "BaseRigidBody"
   */
  get className() {
    return "BaseRigidBody";
  }

  /**
   * Start simulating the body.  If the body isn't a part of the simulation,
   * it is added and simulation occurs.  Position and rotation will be updated.
   */
  startSimulation() {
    if (!this.bodyOpts.simulation) {
      this.bodyOpts.simulation = this.gameObject.simulation;
      this.bodyOpts.body = this.bodyOpts.simulation.addBody(this.bodyDef, this.fixtureDef);

      // Add something to the body so we can get back to this object
      this.bodyOpts.body.__$backRef$__ = this;
    }
  }

  /**
   * Stop simulating the body.  If the body is a part of a simulation,
   * it is removed and simulation stops.  The position and rotation of
   * the body will not be updated.
   */
  stopSimulation() {
    if (this.bodyOpts.simulation) {
      this.bodyOpts.simulation.removeBody(this.body);
      this.bodyOpts.simulation = null;
    }
  }

  /**
   * Set the associated render component for this body.  This is typically used by the
   * {@link PhysicsActor} to link a body to a renderer so that each body can have an
   * associated renderer applied.
   *
   * @param renderComponent {RenderComponent} The render component to associate with this body
   */
  set renderComponent(renderComponent) {
    this.bodyOpts.renderComponent = renderComponent;
    if (renderComponent != null) {
      this.bodyOpts.renderComponent.gameObject = this.gameObject;
    }
  }

  /**
   * Get the associated render component for this body.
   * @return {RenderComponent} or <code>null</code>
   */
  get renderComponent() {
    return this.bodyOpts.renderComponent;
  }

  /**
   * Set the origin of the rigid body.  By default, the origin is the top left corner of
   * the bounding box for the body.  Most times the origin should be set to the center
   * of the body.
   */
  set localOrigin(pt) {
    this.bodyOpts.origin.copy(pt);
  }

  /**
   * Get the local origin of the body.
   */
  get localOrigin() {
    return this.bodyOpts.origin;
  }

  /**
   * Get the center of the body.
   * @return {Point2D}
   */
  get center() {
    return this.position;
  }

  /**
   * [ABSTRACT] Get a box which bounds the body.
   * @return {Rectangle2D}
   */
  get boundingBox() {
    return Rectangle2D.create(0, 0, 1, 1);
  }

  /**
   * Get the Box2d fixture definition object.
   * @return {Box2D.Dynamics.b2FixtureDef}
   */
  get fixtureDef() {
    return this.bodyOpts.fixtureDef;
  }

  /**
   * Get the Box2d body definition object.
   * @return {b2BodyDef}
   */
  get bodyDef() {
    return this.bodyOpts.bodyDef;
  }

  /**
   * Get the Box2d body object which was added to the simulation.
   * @return {b2Body}
   */
  get body() {
    return this.bodyOpts.body;
  }

  /**
   * Update the fixture on a simulated body. Doing so may cause a hiccup in simulation
   * @protected
   */
  updateFixture() {
    if (this.bodyOpts.simulation) {
      // Destroy the current fixture, then recreate it ()
      this.body.DestroyFixture(this.fixtureDef);
      this.body.CreateFixture(this.fixtureDef);
    }
  }

  /**
   * Set the resitution (bounciness) of the body.  The value should be between
   * zero and one.  Values higher than one are accepted, but produce objects which
   * are unrealistically bouncy.
   *
   * @param restitution {Number} A value between 0.0 and 1.0
   */
  set restitution(restitution) {
    this.bodyOpts.fixtureDef.restitution = restitution;
    this.updateFixture();
  }

  /**
   * Get the resitution (bounciness) value for the body.
   * @return {Number}
   */
  get restitution() {
    return this.bodyOpts.fixtureDef.restitution;
  }

  /**
   * Set the density of the body.
   *
   * @param density {Number} The density of the body
   */
  set density(density) {
    this.bodyOpts.fixtureDef.density = density;
    this.updateFixture();
  }

  /**
   * Get the density of the body.
   * @return {Number}
   */
  get density() {
    return this.bodyOpts.fixtureDef.density;
  }

  /**
   * Set the friction of the body.  Lower values slide easily across other bodies.
   * Higher values will cause a body to stop moving as it slides across other bodies.
   * However, even a body which has high friction will keep sliding across a body
   * with no friction.
   *
   * @param friction {Number} The friction of the body
   */
  set friction(friction) {
    this.bodyOpts.fixtureDef.friction = friction;
    this.updateFixture();
  }

  /**
   * Get the friction of the body.
   * @return {Number}
   */
  get friction() {
    return this.bodyOpts.fixtureDef.friction;
  }

  /**
   * Set the initial position of the body.  Once a body is in motion, updating
   * its position should be avoided since it doesn't fit with physical simulation.
   * To change an object's position, try applying forces or impulses to the body.
   *
   * @param point {Point2D} The initial position of the body
   */
  set position(point) {
    if (!this.bodyOpts.simulation) {
      this.bodyOpts.scaledPoint.copy(point).div(Simulation.WORLD_SIZE);
      this.bodyDef.position.Set(this.bodyOpts.scaledPoint.x, this.bodyOpts.scaledPoint.y);
    } else {
      this.bodyOpts.scaledPoint.copy(point).div(Simulation.WORLD_SIZE);
      var bv = new Box2D.Common.Math.b2Vec2(this.bodyOpts.scaledPoint.x, this.bodyOpts.scaledPoint.y);
      this.body.SetPosition(bv);
    }
  }

  /**
   * Get the position of the body during simulation.  This value is updated
   * as the simulation is stepped.
   * @return {Point2D}
   */
  get position() {
    if (this.bodyOpts.simulation) {
      var bp = this.body.GetPosition();
      this.bodyOpts.scaledPoint.copy(bp.x, bp.y).mul(Simulation.WORLD_SIZE);
      this.bodyOpts.bodyPos.copy(this.bodyOpts.scaledPoint);
    } else {
      this.bodyOpts.scaledPoint.copy(this.bodyDef.position.x, this.bodyDef.position.y).mul(Simulation.WORLD_SIZE);
      this.bodyOpts.bodyPos.copy(this.bodyOpts.scaledPoint);
    }
    return this.bodyOpts.bodyPos;
  }

  /**
   * Get the rotation of the body.  This value is updated as the simulation is stepped.
   * @return {Number}
   */
  get rotation() {
    if (this.bodyOpts.simulation) {
      return Math2D.radToDeg(this.body.GetAngle());
    } else {
      return this.bodyDef.angle;
    }
  }

  /**
   * Set the angle of rotation for the body, in degrees.
   * @param angle {Number} The rotation angle in degrees
   */
  set rotation(angle) {
    if (this.bodyOpts.simulation) {
      this.body.SetAngle(Math2D.degToRad(angle));
    } else {
      this.bodyDef.angle = Math2D.degToRad(angle);
    }
  }

  /**
   * Apply a force at a world point. If the force is not applied at the center of mass,
   * it will generate a torque and affect the angular velocity. This wakes up the body.
   * Forces are comprised of a force vector and
   * a position.  The force vector is the direction in which the force is
   * moving, while the position is where on the body the force is acting.
   * Forces act upon a body from world coordinates.
   *
   * @param forceVector {Vector2D} The force vector
   * @param position {Point2D} The position where the force is acting upon the body
   */
  applyForce(forceVector, position) {
    var fv = new Box2D.Common.Math.b2Vec2(forceVector.x, forceVector.y);
    var dv = new Box2D.Common.Math.b2Vec2(position.x, position.y);
    this.body.ApplyForce(fv, dv);
  }

  /**
   * Apply an impulse at a point. This immediately modifies the velocity. It also modifies
   * the angular velocity if the point of application is not at the center of mass. This wakes
   * up the body.  Impulses are comprised of an impulse vector and
   * a position.  The impulse vector is the direction of the impulse, while the position
   * is where on the body the impulse will be applied.
   * Impulses act upon a body locally, adjusting its velocity.
   *
   * @param impulseVector {Vector2D} The impulse vectory
   * @param position {Point2D} the position where the impulse is originating from in the body
   */
  applyImpulse(impulseVector, position) {
    var iv = new Box2D.Common.Math.b2Vec2(impulseVector.x, impulseVector.y);
    var dv = new Box2D.Common.Math.b2Vec2(position.x, position.y);
    this.body.ApplyImpulse(iv, dv);
  }

  /**
   * Apply torque to the body. This affects the angular velocity without affecting the
   * linear velocity of the center of mass.
   *
   * @param torque {Number} The amount of torque to apply to the body
   */
  applyTorque(torque) {
    this.body.ApplyTorque(torque);
  }

  /**
   * Get the total mass of the body.  If the body is not simulating, this
   * returns <code>Infinity</code>.
   *
   * @return {Number} The mass of the body, or <code>Infinity</code>
   */
  get mass() {
    if (this.bodyOpts.simulation) {
      return this.body.GetMass();
    } else {
      return this.bodyDef.massData.mass;
    }
  }

  /**
   * Set the total mass of the body in kilograms.
   * @param mass {Number} The mass of the body in kg
   */
  set mass(mass) {
    if (this.bodyOpts.simulation) {
      var mData = new Box2D.Dynamics.b2MassData();
      this.body.GetMassData(mData);
      mData.mass = mass;
      this.body.SetMassData(mData);
      mData = null;
    } else {
      this.bodyDef.massData.mass = mass;
    }
  }

  /**
   * Get the linear damping of the body.
   */
  get linearDamping() {
    if (this.bodyOpts.simulation) {
      return this.body.GetLinearDamping();
    } else {
      return this.bodyDef.linearDamping;
    }
  }

  /**
   * Get the angular damping of the body.
   */
  get angularDamping() {
    if (this.bodyOpts.simulation) {
      return this.body.GetAngularDamping();
    } else {
      return this.bodyDef.angularDamping;
    }
  }

  /**
   * Sets the linear and angular damping of a body. Damping is used to reduce the
   * world velocity of bodies.  Damping differs from friction in that friction
   * only occurs when two surfaces are in contact.  Damping is not a replacement
   * for friction.  A value between 0 and <code>Infinity</code> can be used, but
   * normally the value is between 0 and 1.0.
   */
  setDamping(linear, angular) {
    if (this.bodyOpts.simulation) {
      this.body.SetLinearDamping(linear);
      this.body.SetAngularDamping(linear);
    } else {
      this.bodyDef.linearDamping = linear;
      this.bodyDef.angularDamping = angular;
    }
  }

  set linearDamping(l) {
    if (this.bodyOpts.simulation) {
      this.body.SetLinearDamping(l);
    } else {
      this.bodyDef.linearDamping = l;
    }
  }

  set angularDamping(a) {
    if (this.bodyOpts.simulation) {
      this.body.SetAngularDamping(a);
    } else {
      this.bodyDef.angularDamping = a;
    }
  }

  /**
   * Set a body to be static or dynamic.  A static body will not move around.
   * @param state {Boolean} <code>true</code> to set the body as static, <code>false</code> for
   *        dynamic.
   */
  set static(state) {
    this.bodyDef.type = state ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;
  }

  /**
   * Returns <code>true</code> if the body is static.  A body is static if it
   * isn't updated part of the simulation during contacts.
   * @return {Boolean}
   */
  get static() {
    if (this.bodyOpts.simulation) {
      return this.body.GetType() === Box2D.Dynamics.b2Body.b2_staticBody;
    } else {
      return this.bodyDef.type === Box2D.Dynamics.b2Body.b2_staticBody;
    }
  }

  /**
   * Returns <code>true</code> if the body is sleeping.  A body is sleeping if it
   * has settled to the point where no movement is being calculated.  If you want
   * to perform an action upon a body, other than applying force, torque, or impulses,
   * you must call {@link #wakeUp}.
   * @return {Boolean}
   */
  get sleeping() {
    if (this.bodyOpts.simulation) {
      return !this.body.IsAwake();
    } else {
      return !this.bodyDef.awake;
    }
  }

  /**
   * Returns <code>true</code> if the body is active.  An active body is updated during
   * the simulation and can be collided with.
   * @return {Boolean}
   */
  get active() {
    if (this.bodyOpts.simulation) {
      return this.body.IsActive();
    } else {
      return this.bodyDef.active;
    }
  }

  /**
   * Wake up a body, adding it back into the collection of bodies being simulated.
   * If the body is not being simulated, this does nothing.
   */
  wakeUp() {
    if (this.bodyOpts.simulation) {
      this.body.SetAwake(true);
    }
  }

  /**
   * Sets the active state of a body.  Setting the active flag to <tt>false</tt> will
   * remove the object from simulation.  Setting it to true will add it back into the
   * simulation.
   * @param active {Boolean} The activity flag
   */
  set active(active) {
    if (this.bodyOpts.simulation) {
      this.bod().SetActive(active);
    } else {
      this.bodyDef.active = active;
    }
  }

  /**
   * Checks a couple of flags on the body and triggers events when they change.  Fires
   * the <code>active</code> event on the game object when this body changes its "active" state.
   * Fires the <code>sleeping</code> event on the game object when this body changes its
   * "sleeping" state.  Both events are passed the body which changed state, and a flag
   * indicating the current state.
   *
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    super.execute(time, dt);

    // Check the sleeping and active states so we can trigger events
    var activeChange = false, sleepChange = false;
    if (!this.bodyOpts._states[0] && this.active) {
      this.bodyOpts._states[0] = true;
      activeChange = true;
    } else if (this.bodyOpts._states[0] && !this.active) {
      this.bodyOpts._states[0] = false;
      activeChange = true;
    }

    if (!this.bodyOpts._states[1] && this.sleeping) {
      this.bodyOpts._states[1] = true;
      sleepChange = true;
    } else if (this.bodyOpts._states[1] && !this.sleeping) {
      this.bodyOpts._states[1] = false;
      sleepChange = true;
    }

    if (activeChange)
      this.gameObject.triggerEvent("active", [this, this.bodyOpts._states[0]]);

    if (sleepChange)
      this.gameObject.triggerEvent("sleeping", [this, this.bodyOpts._states[1]]);
  }

}

