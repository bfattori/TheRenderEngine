"use strict";

class ParticleSpray extends ParticleEffect {

  constructor(origin) {
    super(origin);
    this._spread = 10;
    this._spreadVariance = 0;
    this._angle = 0;
    this._angleVariance = 0;
    this.particle(SprayParticle);
  }

  get className() {
    return "ParticleSpray";
  }

  /**
   * The width of the spray of particles effect.
   * @param spread
   * @param [spreadVariance]
   * @returns {*}
   */
  width(spread, spreadVariance) {
    this._spread = spread;
    this._spreadVariance = spreadVariance || 0;
    return this;
  }

  /**
   * The rotation around the origin at which particles are emitted.
   *
   * @param angle
   * @param [angleVariance]
   * @returns {*}
   */
  rotation(angle, angleVariance) {
    this._angle = angle;
    this._angleVariance = angleVariance || 0;
    return this;
  }

  /**
   * A method to give an effect the ability to modify a particle's options for each particle generated.
   * @param particleOptions {Object}
   * @param [time] {Number} The current world time
   * @param [dt] {Number} The number of milliseconds since the last rendered frame was generated
   */
  modifyParticleOptions(particleOptions, time, dt) {
    super.modifyParticleOptions(particleOptions);
    var sprayWidth = this._spread + Math2.randomRange(0, this._spreadVariance, true);
    var halfAngle = Math.floor(sprayWidth / 2);
    particleOptions.angle = this._angle + Math2.randomRange(-this._angleVariance, this._angleVariance * 2, true) +
      Math2.randomRange(-halfAngle, halfAngle * 2, true);
  }

}
