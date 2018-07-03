"use strict";

/**
 * @class The base particle effect class.  All effects derive from this class which provides
 *        set up and construction of emitted particles.
 * @param origin {R.math.Point2D} The location at which effect particles originate.
 * @returns {*}
 * @constructor
 */
class ParticleEffect extends PooledObject {

  constructor(origin) {
    super("ParticleEffect");
    this._origin = Point2D.create(origin);
    this._opts = {
      run: false,
      ttl: 0,
      emitFrequency: 0,
      emitFrequencyVariance: 0,
      velocity: 0.2,
      velocityVariance: 0,
      particleCount: 10,
      particleCountVariance: 0,
      lastTime: 0,
      particleLifetime: 500,
      particleLifetimeVariance: 0
    };
    return this;
  }

  destroy() {
    this._origin.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this._opts = null;
  }

  get className() {
    return "ParticleEffect";
  }

  /**
   * Get the origin of the effect
   * @returns {Point2D}
   */
  get origin() {
    return this._origin;
  }

  /**
   * Set the quantity of particles which will be emitted at each frame rendering.
   *
   * @param particleCount
   * @param [particleCountVariance]
   * @returns {*}
   */
  quantity(particleCount, particleCountVariance = 1) {
    this._opts.particleCount = particleCount;
    this._opts.particleCountVariance = particleCountVariance;
    return this;
  }

  /**
   * Set the lifespan of the effect.
   */
  set lifespan(ttl) {
    this._opts.ttl = ttl;
  }

  get lifespan() {
    return this._opts.ttl;
  }

  setLifespan(ttl) {
    this.lifespan = ttl;
  }

  /**
   * Get the remaining lifespan of the effect.
   */
  getLifespan(dt) {
    this.lifespan -= dt;
    return Math.max(this.lifespan, 0);
  }

  /**
   * A flag indicating if the effect has run yet.
   * @returns {boolean}
   */
  get hasRun() {
    return this._opts.run;
  }

  /**
   * Set the frequency at which particles will be emitted.
   *
   * @param emitFrequency
   * @param [frequencyVariance]
   * @returns {*}
   */
  frequency(emitFrequency, frequencyVariance = 0) {
    this._opts.emitFrequency = emitFrequency;
    this._opts.emitFrequencyVariance = frequencyVariance;
    return this;
  }

  /**
   * Set the lifespan of each particle which is emitted.
   *
   * @param lifetime
   * @param [variance]
   * @returns {*}
   */
  particleLife(lifetime, variance = 500) {
    this._opts.particleLifetime = lifetime;
    this._opts.particleLifetimeVariance = variance;
    return this;
  }

  /**
   * Set the particle class which is emitted from the effect.
   *
   * @param particleClass
   * @returns {*}
   */
  particle(particleClass) {
    this._opts.particleClass = particleClass;
    return this;
  }

  /**
   * Set the scalar velocity at which particles move after emission.
   *
   * @param velocity
   * @param [velocityVariance]
   * @returns {*}
   */
  particleVelocity(velocity, velocityVariance = 0) {
    this._opts.velocity = velocity;
    this._opts.velocityVariance = velocityVariance;
    return this;
  }

  /**
   * Run the particle effect.
   * @param particleEngine
   * @param time
   * @param dt
   * @private
   */
  runEffect(particleEngine, time, dt) {
    var particles = Container.create("particles");
    var numParticles = this._opts.particleCount + Math2.randomRange(0, this._opts.particleCountVariance, true);
    var particleLife = this._opts.particleLifetime + Math2.randomRange(0, this._opts.particleLifetimeVariance, true);
    var emitFreq = this._opts.emitFrequency + Math2.randomRange(0, this._opts.emitFrequencyVariance, true);

    if (!this._opts.run || (this._opts.run && time - this._opts.lastTime > emitFreq)) {
      var options = {};
      this.generateParticles(particles, numParticles, particleLife, options, time, dt);
      this.lastTime = time;
    }

    particleEngine.addParticles(particles);
    this._opts.run = true;
  }

  /**
   * A method to give an effect the ability to modify a particle's options for each particle generated.
   * @param particleOptions {Object}
   * @param [time] {Number} The current world time
   * @param [dt] {Number} The number of milliseconds since the last rendered frame was generated
   */
  modifyParticleOptions(particleOptions, time, dt) {
    particleOptions.velocity = this._opts.velocity + Math2.randomRange(0, this._opts.velocityVariance);
  }

  /**
   * Generate particles for the effect.
   * @param particles {Container} The list of particles
   * @param particleCount {Number} The count of particles in the list
   * @param particleLife {Number} The lifespan of the particles
   * @param particleOptions {Object} The particle options
   * @param time {Number} The current world time
   * @param dt {Number} The time between the last world frame and current time
   */
  generateParticles(particles, particleCount, particleLife, particleOptions, time, dt) {
    for (var x = 0; x < particleCount; x++) {
      this.modifyParticleOptions(particleOptions, time, dt);
      particles.add(this._opts.particleClass.create(this.origin, particleLife, particleOptions));
    }
  }

}
