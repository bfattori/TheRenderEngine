"use strict";

/**
 * @class An explosion particle
 *
 * @param pos {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 * @param ttl {Number} Particle lifetime (time to live) in milliseconds
 * @param decay {Number} A floating point which indicates the speed decay
 */
class ExplosionParticle extends AbstractParticle {

  constructor(position, ttl = 2000, options) {
    // Automatically override the angle to generate the explosion
    options.angle = Math.floor(Math2.random() * 360);
    super(position, ttl, options);
  }

  get className() {
    return "ExplosionParticle";
  }

}
