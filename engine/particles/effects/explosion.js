
R.Engine.define({
    "class": "R.particles.effects.Explosion",
    "requires": [
        "R.particles.Effect",
        "R.particles.effects.ExplosionParticle"
    ]
});

R.particles.effects.Explosion = function() {
    return R.particles.Effect.extend({

        decayRate: 0,

        constructor: function(origin) {
            this.base(origin);
            this.decayRate = R.lang.Math2.random() * 0.09;
            return this;
        },

        decay: function(decayRate, decayRateVariance) {
            this.decayRate = decayRate * (decayRateVariance ? R.lang.Math2.random() * decayRateVariance : 1);
            return this;
        },

        generateParticles: function(particles, particleCount, particleLife, options, time, dt) {
            options.decay = this.decayRate;
            this.base(particles, particleCount, particleLife, options, time, dt);
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.Explosion";
        }
    });
};

