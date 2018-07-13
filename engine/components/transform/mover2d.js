/**
 * The Render Engine
 * Mover2DComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A mover component that adds simplified physical transformations to an object.
 *        Properties include velocity, acceleration, mass, and gravity.
 *
 * @param name {String} The name of the component
 * @param priority {Number} The priority of this component between 0.0 and 1.0
 * @extends Transform2DComponent
 * @constructor
 * @description Creates a 2d mover component
 */
class Mover2DComponent extends Transform2DComponent {

  /**
   * The default velocity magnitude considered to be "at rest"
   * @type {Number}
   */
  static DEFAULT_RESTING_VELOCITY = 0.2;

  /**
   * The default adjustment made to calculations when a lag occurs between the last time
   * the component was updated and the current time.
   * @type {Number}
   */
  static DEFAULT_LAG_ADJUSTMENT = 0.01;


  /**
   * @private
   */
  constructor(name, priority = 1.0) {
    super(name, priority);
    this.moveOpts = {
      velocity: Vector2D.create(0, 0),
      angularVelocity: 0,
      _nVel: Vector2D.create(0, 0),
      acceleration: Vector2D.create(0, 0),
      lPos: Point2D.create(0, 0),
      vDecay: 0,
      maxVelocity: -1,
      gravity: Vector2D.create(0, 0),
      atRest: false,
      checkRest: true,
      mass: 1,
      restingVelocity: Mover2DComponent.DEFAULT_RESTING_VELOCITY,
      lagAdjustment: Mover2DComponent.DEFAULT_LAG_ADJUSTMENT,
      checkLag: true,
      firstFrame: true,

      // Temp vector to use in calcs
      _vec: Vector2D.create(0, 0)
    };
  }

  /**
   * Destroys the component instance
   */
  destroy() {
    this.moveOpts.velocity.destroy();
    this.moveOpts._nVel.destroy();
    this.moveOpts.acceleration.destroy();
    this.moveOpts.lPos.destroy();
    this.moveOpts.gravity.destroy();
    this.moveOpts._vec.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this.moveOpts = null;
  }

  /**
   * Get the class name of this object
   * @return {String} "Mover2DComponent"
   */
  get className() {
    return "Mover2DComponent";
  }

  /**
   * Updates the transformation of the component, setting the
   * position and rotation based on the time that has elapsed since
   * the last update.  This component handles frame rate independent
   * updates so that lag between frames doesn't affect the relative
   * position or rotation.
   *
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    if (!this.isResting()) {
      this.moveOpts.lPos.copy(this.position);
      var rot = this.rotation;

      if (this.moveOpts.firstFrame) {
        this.position.copy(this.moveOpts.lPos.add(this.moveOpts.velocity).add(this.moveOpts.acceleration).add(this.moveOpts.gravity));
        this.rotation = rot;
      } else {
        if (this.moveOpts.vDecay !== 0 && this.moveOpts.velocity.length > 0) {
          // drag
          this.moveOpts._vec.copy(this.moveOpts.velocity).neg();
          this.moveOpts._vec.mul(this.moveOpts.vDecay);
          this.moveOpts.velocity.add(this.moveOpts._vec);
        }

        // Adjust the step value for lagging frame rates
        this.moveOpts._vec.copy(this.moveOpts.velocity.add(this.moveOpts.acceleration).add(this.moveOpts.gravity));
        this.moveOpts._vec.mul(dt / RenderEngine.fpsClock);

        if (this.moveOpts.maxVelocity !== -1 && this.moveOpts._vec.length > this.moveOpts.maxVelocity) {
          this.moveOpts._vec.normalize().mul(this.moveOpts.maxVelocity);
        }

        this.position.copy(this.moveOpts.lPos.add(this.moveOpts._vec));

        // TODO: Actually implement angular velocity per time step
        var angVel = this.moveOpts.angularVelocity * (dt / RenderEngine.fpsClock);
        this.rotation = rot + angVel;
      }

      // Check rest state
      if (this.moveOpts.checkRest) {
        if (this.moveOpts.velocity.length < this.moveOpts.restingVelocity) {
          this.moveOpts.velocity.copy(Vector2D.ZERO);
          this.moveOpts.atRest = true;
        }
      }
    }

    this.moveOpts.firstFrame = false;
    super.execute(time, dt);
  }

  /**
   * Setting this to <tt>true</tt> will enable a check for time lag and adjust
   * calculations by a specified factor.
   */
  set checkLag(state) {
    this.moveOpts.checkLag = state;
  }

  /**
   * Returns <tt>true</tt> if calculations should determine time lag and adjust.
   */
  get checkLag() {
    return this.moveOpts.checkLag;
  }

  /**
   * Sets the value by which calculations will be adjusted for time lag.
   */
  set lagAdjustment(lagAdj) {
    if (lagAdj != 0) {
      this.moveOpts.lagAdjustment = lagAdj;
    }
  }

  /**
   * Get the value by which calculations are adjusted for time lag.
   */
  get lagAdjustment() {
    return this.moveOpts.lagAdjustment;
  }

  /**
   * Set the velocity vector of the component.
   */
  set velocity(vector) {
    this.moveOpts.velocity.copy(vector);
    if (!this.moveOpts.velocity.isZero()) {
      this.moveOpts.atRest = false;
    }
  }

  /**
   * Returns the velocity vector of the component
   */
  get velocity() {
    return this.moveOpts.velocity;
  }

  /**
   * Returns <tt>true</tt> if the component is in a resting state.
   */
  get atRest() {
    return this.moveOpts.atRest;
  }

  /**
   * Setting this to <tt>true</tt> will stop further movement calculations
   * from occuring.  Marks the object as being "at rest".
   */
  set atRest(state) {
    this.moveOpts.atRest = state;
  }

  /**
   * Get the magnitude at which velocity is determined to be close enough to
   * zero to be "at rest".
   */
  get restingVelocity() {
    return this.moveOpts.restingVelocity;
  }

  /**
   * Set the magnitude of velocity which determines if the object is "at rest".
   */
  set restingVelocity(mag) {
    this.moveOpts.restingVelocity = mag;
  }

  /**
   * If set to <tt>true</tt>, the component will check to see if the
   * velocity magnitude has dropped below a defined rate.  When the
   * velocity magnitude drops below the set rate, the object will be
   * marked as "at rest" and no calculations will be made until the
   * object is set into motion again.
   */
  set checkAtRest(state) {
    this.moveOpts.checkRest = state;
    if (this.moveOpts.atRest && !state) {
      this.moveOpts.atRest = false;
    }
  }

  /**
   * Determine if the component should check to see if the velocity has
   * dropped below a level which would indicate "at rest".
   */
  get checkAtRest() {
    return this.moveOpts.checkRest;
  }

  /**
   * Set the acceleration vector.  Acceleration will be constantly applied to
   * the last position.
   */
  set acceleration(vector) {
    this.moveOpts.acceleration.copy(vector);
    this.moveOpts.atRest = false;
  }

  /**
   * Get the acceleration vector.
   */
  get acceleration() {
    return this.moveOpts.acceleration;
  }

  /**
   * Set the vector of gravity.
   */
  set gravity(vector) {
    this.moveOpts.gravity.copy(vector);
    this.moveOpts.atRest = false;
  }

  /**
   * Get the gravity vector
   */
  get gravity() {
    return this.moveOpts.gravity;
  }

  /**
   * Set the mass of the object which can be subsequently used in
   * calculations like friction and energy transfer.
   */
  set mass(mass) {
    this.moveOpts.mass = mass;
  }

  /**
   * Get the mass of the object.
   */
  get mass() {
    return this.moveOpts.mass;
  }

  /**
   * Set the maximum velocity.  Setting this value to <tt>zero</tt> indicates that
   * there is no maximum velocity.
   */
  set maxVelocity(maxVel) {
    this.moveOpts.maxVelocity = maxVel;
  }

  /**
   * Get the maximum velocity.
   */
  get maxVelocity() {
    return this.moveOpts.maxVelocity;
  }

  /**
   * Set the decay rate at which the velocity will approach zero.
   * You can use this value to cause a moving object to eventually
   * stop moving. (e.g. friction)
   */
  set velocityDecay(decay) {
    this.moveOpts.vDecay = decay;
  }

  /**
   * Get the rate at which velocity will decay to zero.
   */
  get velocityDecay() {
    return this.moveOpts.vDecay;
  }

  /**
   * Set the angular velocity.
   */
  set angularVelocity(angularVelocity) {
    this.moveOpts.angularVelocity = angularVelocity;
  }

  /**
   * Returns the angular velocity.
   */
  get angularVelocity() {
    return this.moveOpts.angularVelocity;
  }
}
