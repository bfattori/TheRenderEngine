
R.Engine.define({
    "class": "R.particles.effects.Spray",
    "requires": [
        "R.particles.Effect",
        "R.particles.effects.SprayParticle"
    ]
});
R.particles.effects.Spray = function() {
    return R.particles.Effect.extend({

        spread: 10,
        spreadVariance: 0,
        angle: 0,
        halfAngle: 0,

        width: function(spread, spreadVariance) {
            this.spread = spread;
            this.spreadVariance = spreadVariance || 0;
            return this;
        },

        rotation: function(angle, angleVariance) {
            this.angle = angle;
            this.halfAngle = Math.floor((angleVariance || 0) / 2);
            return this;
        },

        generateParticles: function(particles, particleCount, particleLife) {
            var sprayWidth = this.spread + R.lang.Math2.randomRange(0, this.spreadVariance, true);
            var angle = this.angle + R.lang.Math2.randomRange(-this.halfAngle, this.halfAngle, true);
            for (var x = 0; x < particleCount; x++) {
                particles.add(this.particleClass.create(this.position, particleLife, angle, sprayWidth));
            }
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.Spray";
        }
    });

};
