"use strict";

class ParticleSpark extends ParticleSpray {

  constructor(origin) {
    super(origin);
    this._delay = 10;
    this._delayVariance = 0;
    this._lastDelayTime = 0;
    return this;
  }

  get className() {
    return "ParticleSpark";
  }

  /**
   * The delay between particle emissions.
   *
   * @param delay
   * @param [delayVariance]
   * @returns {*}
   */
  delay(delay, delayVariance) {
    this._delay = delay;
    this._delayVariance = delayVariance || 0;
    return this;
  }

  generateParticles(particles, particleCount, particleLife, options, time, dt) {

    if (this._lastDelayTime == 0) {
      this._lastDelayTime = time + this._delay + Math2.randomRange(0, this._delayVariance, true);
    }

    if (time > this._lastDelayTime) {
      super.generateParticles(particles, particleCount, particleLife, options, time, dt);
      this._lastDelayTime = time + this._delay + Math2.randomRange(0, this._delayVariance, true);
    }

  }

}
