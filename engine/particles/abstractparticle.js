/**
 * The Render Engine
 * AbstractParticle
 *
 * Copyright (c) 2019 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Base particle class.  A particle only needs to override the
 *        <tt>draw()</tt> method. The remainder of the functionality is
 *        handled by this abstract class.
 *
 * @param position {R.math.Point2D} The point at which the particle begins its life
 * @param lifetime {Number} The life of the particle, in milliseconds
 * @param [options] {Object} An options object which can contain the following:
 *      <ul>
 *          <li><tt>decay</tt> - The velocity decay rate per frame</li>
 *          <li><tt>velocity</tt> - The scalar velocity of the particle</li>
 *          <li><tt>angle</tt> - The degrees around the position at which to emit the particle</li>
 *          <li><tt>gravity</tt> - A {@link R.math.Vector2D} which indicates the gravity vector</li>
 *      </ul>
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a particle
 */
class AbstractParticle extends PooledObject {

  constructor(position = Point2D.create(0, 0), lifetime, options = {
      decay: 0,
      velocity: 1,
      angle: 0,
      gravity: Vector2D.create(0, 0)
    }) {
    super("Particle");
    this._ttl = lifetime;
    this._birth = 0;
    this._isDead = false;
    this._engine = null;
    this._position = position;

    // Handle options
    if (!this._opts) {
      this._opts = {};
    }

    this._opts = options;

    if (this._invVelocity == null) {
      this._invVelocity = R.math.Vector2D.create(0, 0);
    } else {
      this._invVelocity.set(0, 0);
    }

    if (this._velocityVector == null) {
      this._velocityVector = R.math.Vector2D.create(0, 0);
    } else {
      this._velocityVector.set(0, 0);
    }

    R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, this._opts.angle, this._velocityVector);
    this._velocityVector.mul(this._opts.velocity);
  }

  /**
   * Destroy the particle
   */
  destroy() {
    this._position.destroy();
    this._opts.gravity.destroy();
    this._invVelocity.destroy();
    this._velocityVector.destroy();
    super.destroy();
  }

  /**
   * Release the particle back into the pool.
   */
  release() {
    super.release();
    this._ttl = 0;
    this._engine = null;
    this._birth = 0;
    this._isDead = true;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "AbstractParticle"
   */
  get className() {
    return "AbstractParticle";
  }

  /**
   * Initializes the particle within the <tt>R.particles.ParticleEngine</tt>
   * @param pEngine {R.particles.ParticleEngine} The particle engine which owns the particle
   * @param time {Number} The world time when the particle was created
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  init(pEngine, time, dt) {
    this._engine = pEngine;
    this._ttl += time;
    this._birth = time;
    this._isDead = false;
  }

  /**
   * Get the current position of the particle
   * @return {R.math.Point2D}
   */
  get position() {
    return this._position;
  }

  /**
   * Set the X and Y world coordinates of the particle
   * @param x {R.math.Point2D|Number} A {@link R.math.Point2D}, or the X world coordinate
   * @param y {Number} Y world coordinate
   */
  setPosition(x, y) {
    this._position.x = x
    this._position.y = y;
  }

  /**
   * Update the particle in the render context, calling its draw method.
   * @param renderContext {R.rendercontexts.AbstractRenderContext} The context where the particle is drawn
   * @param time {Number} The world time, in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  update(renderContext, time, dt) {
    this._isDead = !(time < this._ttl);

    if (renderContext.viewport.containsPoint(this.position)) {
      this.move(renderContext, time, dt, this._ttl - time);
    }

    return !this._isDead;
  }

  /**
   * Get the time-to-live for the particle (when it will expire)
   * @return {Number} milliseconds
   */
  get ttl() {
    return this._ttl;
  }

  get timeToLive() {
    return this._ttl;
  }

  /**
   * Get the time at which the particle was created
   * @return {Number} milliseconds
   */
  get birth() {
    return this._birth;
  }

  get dead() {
    return this._isDead;
  }

  /**
   * Move the particle.  May be overridden to allow different types of movement, rather than the standard
   * linear movement.
   * @param renderContext {RenderContext2D} The context to render the particle to
   * @param time {Number} The world time, in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @param remainingTime {Number} The number of milliseconds left in the particle's life
   */
  move(renderContext, time, dt, remainingTime) {
    // Decay
    if (this._opts.decay > 0 && this._velocityVector.length > 0) {
      this._invVelocity.x = this._velocityVector.x;
      this._invVelocity.y = this._velocityVector.y;
      this._invVelocity.neg().mul(this._opts.decay);
      this._velocityVector.add(this._invVelocity);
    }

    this.position.add(this._velocityVector);
    this.draw(renderContext, time, dt, remainingTime);
  }

  /**
   * Draw a very basic particle.  Typically, this method would be overridden to handle
   * a more specific effect for a particle.
   *
   * @param renderContext {RenderContext2D} The context to render the particle to
   * @param time {Number} The world time, in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @param remainingTime {Number} The number of milliseconds left in the particle's life
   */
  draw(renderContext, time, dt, remainingTime) {
    renderContext.setFillStyle("#fff");
    renderContext.drawPoint(this.position);
  }

}
