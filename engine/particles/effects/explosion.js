"use strict";
class ParticleExplosion extends ParticleEffect {

  constructor(origin) {
    super(origin);
    this._decayRate = Math2.random() * 0.09;
  }

  get className() {
    return "ParticleExplosion";
  }

  decay(decayRate, decayRateVariance) {
    this._decayRate = decayRate * (decayRateVariance ? Math2.random() * decayRateVariance : 1);
    return this;
  }

  generateParticles(particles, particleCount, particleLife, options, time, dt) {
    options.decay = this._decayRate;
    this.base(particles, particleCount, particleLife, options, time, dt);
  }

}

