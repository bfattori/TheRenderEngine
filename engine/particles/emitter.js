/**
 * The Render Engine
 * ParticleEmitter
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Particle emitter class.  Emits particles at a regular
 *    interval as long as it is active.  The function that is passed to generate
 *    the particles will be called with three arguments: an offset position, the
 *    current world time, and the delta from when the last frame was drawn.  The function
 *    can either return a single particle or an <code>Array</code> of particles.
 *    Within the scope of the function, "this" refers to the {@link R.particles.Emitter}
 *    object.
 *    <pre>
 *       // Create the particle emitter which returns the type of particle
 *       // we want to emit.  5 is the delay between particle emissions and
 *       // 350 is the life of the particle (both in milliseconds)
 *       var emitter = R.particles.Emitter.create(function(offset) {
 *          // Create a particle
 *          return FuseParticle.create(offset, 350);
 *       }, 5);
 *
 *       // Assign the emitter to the particle engine which will draw it
 *       emitter.setParticleEngine(Tutorial13.pEngine);
 *    </pre>
 *
 * @param emitFunc {Function} A function that emits new particles.
 * @param interval {Number} The time between emissions
 * @param [active] {Boolean} A flag indicating whether the emitter should emit particles
 * @extends PooledObject
 * @constructor
 * @description Create a particle emitter
 */
class ParticleEmitter extends PooledObject {

  constructor(emitFunc, interval, active = true) {
    super("ParticleEmitter");
    this._opts = {
      emitFn: emitFunc,
      interval: interval,
      active: active,
      nextEmit: 0,
      engine: null
    };
  }

  /**
   * Release the particle back into the pool.
   */
  release() {
    super.release();
    this._opts = {};
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "ParticleEmitter"
   */
  get className() {
    return "ParticleEmitter";
  }

  /**
   * Set the active state of the particle emitter
   * @param state {Boolean} <code>true</code> to enable emission of particles, <code>false</code> to
   *    disable emission.
   */
  set active(state) {
    this._opts.active = state;
  }

  /**
   * Method to check if the emitter is active.
   * @return {Boolean}
   */
  get active() {
    return this._opts.active;
  }

  /**
   * Set the interval at which particles are emitted.
   * @param interval {Number} The number of milliseconds between emissions
   */
  set interval(interval) {
    this._opts.interval = interval;
  }

  /**
   * Return the interval at which particles are emitted.
   * @return {Number}
   */
  get interval() {
    return this._opts.interval;
  }

  /**
   * Set the particle engine the particle emitter should emit particles to.
   * @param particleEngine {ParticleEngine}
   */
  set particleEngine(particleEngine) {
    this._opts.engine = particleEngine;
  }

  /**
   * Emit a particle to the particle engine, if the emitter is active.
   * @param offset {Point2D} Offset from the particle's position to render at
   * @param time {Number} The world time, in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @private
   */
  emit(offset, time, dt) {
    if (this.active && time > this._opts.nextEmit) {
      this._opts.nextEmit = time + this.interval;
      var particles = this._opts.emitFn.call(this, offset, time, dt);
      if (R.isArray(particles)) {
        this._opts.engine.addParticles(particles);
      } else {
        this._opts.engine.addParticle(particles);
      }
    }
  }

}
