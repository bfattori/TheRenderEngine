
R.Engine.define({
    "class": "R.particles.effects.Explosion",
    "requires": [
        "R.particles.Effect",
        "R.particles.effects.ExplosionParticle"
    ]
});

R.particles.effects.Explosion = function() {
    return R.particles.Effect.extend({

        decayTime: R.lang.Math2.random() * 0.09,

        decay: function(decayTime, variance) {
            this.decayTime = decayTime * (variance ? R.lang.Math2.random() * variance : 1);
            return this;
        },

        generateParticles: function(particles, particleCount, particleLife) {
            for (var x = 0; x < particleCount; x++) {
                particles.add(this.particleClass.create(this.position, particleLife, this.decayTime));
            }
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.Explosion";
        }
    });
};

