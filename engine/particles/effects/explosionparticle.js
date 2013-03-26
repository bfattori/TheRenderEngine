R.Engine.define({
    "class": "R.particles.effects.ExplosionParticle",
    "requires": [
        "R.particles.AbstractParticle"
    ]
});

/**
 * @class An explosion particle
 *
 * @param pos {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 * @param ttl {Number} Particle lifetime (time to live) in milliseconds
 * @param decay {Number} A floating point which indicates the speed decay
 */
R.particles.effects.ExplosionParticle = function() {
    return R.particles.AbstractParticle.extend(/** @scope R.particles.effects.ExplosionParticle.prototype */{

        constructor: function(position, ttl, options) {
            // Automatically override the angle to generate the explosion
            options.angle = Math.floor(R.lang.Math2.random() * 360);
            this.base(position, ttl || 2000, options);
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.ExplosionParticle";
        }
    });
};
