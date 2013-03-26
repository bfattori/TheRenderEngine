
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
        angleVariance: 0,

        constructor: function(origin) {
            this.base(origin);
            this.spread = 10;
            this.spreadVariance = 0;
            this.angle = 0;
            this.angleVariance = 0;
            this.particle(R.particles.effects.SprayParticle);
        },

        /**
         * The width of the spray of particles effect.
         * @param spread
         * @param [spreadVariance]
         * @returns {*}
         */
        width: function(spread, spreadVariance) {
            this.spread = spread;
            this.spreadVariance = spreadVariance || 0;
            return this;
        },

        /**
         * The rotation around the origin at which particles are emitted.
         *
         * @param angle
         * @param [angleVariance]
         * @returns {*}
         */
        rotation: function(angle, angleVariance) {
            this.angle = angle;
            this.angleVariance = angleVariance || 0;
            return this;
        },

        /**
         * A method to give an effect the ability to modify a particle's options for each particle generated.
         * @param particleOptions {Object}
         * @param [time] {Number} The current world time
         * @param [dt] {Number} The number of milliseconds since the last rendered frame was generated
         */
        modifyParticleOptions: function(particleOptions, time, dt) {
            this.base(particleOptions);
            var sprayWidth = this.spread + R.lang.Math2.randomRange(0, this.spreadVariance, true);
            var halfAngle = Math.floor(sprayWidth / 2);
            particleOptions.angle = this.angle + R.lang.Math2.randomRange(-this.angleVariance, this.angleVariance * 2, true) +
                R.lang.Math2.randomRange(-halfAngle, halfAngle * 2, true);
        },

        generateParticles: function(particles, particleCount, particleLife, particleOptions, time, dt) {
            this.base(particles, particleCount, particleLife, particleOptions, time, dt);
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.Spray";
        }
    });

};
