R.Engine.define({
    "class": "R.particles.effects.SprayParticle",
    "requires": [
        "R.particles.AbstractParticle"
    ]
});

/**
 * @class A spray particle
 *
 * @param position {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 * @param rotation {Number} The angle, about the point, at which to emit particles.
 * @param spread {Number} The spread, or range, about the angle which to emit particles
 * @param ttl {Number} The lifetime of the particle in milliseconds
 */
R.particles.effects.SprayParticle = function() {
    return R.particles.AbstractParticle.extend(/** @scope TrailParticle.prototype */{

    }, {
        getClassName: function() {
            return "R.particles.effects.SprayParticle";
        }
    });
};
