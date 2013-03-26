R.Engine.define({
    "class": "R.particles.effects.Spark",
    "requires": [
        "R.particles.effects.Spray",
        "R.math.Vector2D"
    ]
});

R.particles.effects.Spark = function() {
    return R.particles.effects.Spray.extend({

        _delay: 10,
        _delayVariance: 0,
        _lastDelayTime: 0,

        constructor: function(origin) {
            this.base(origin);
            this._delay = 10;
            this._delayVariance = 0;
            this._lastDelayTime = 0;
            return this;
        },

        /**
         * The delay between particle emissions.
         *
         * @param delay
         * @param [delayVariance]
         * @returns {*}
         */
        delay: function(delay, delayVariance) {
            this._delay = delay;
            this._delayVariance = delayVariance || 0;
            return this;
        },

        generateParticles: function(particles, particleCount, particleLife, options, time, dt) {

            if (this._lastDelayTime == 0) {
                this._lastDelayTime = time + this._delay + R.lang.Math2.randomRange(0, this._delayVariance, true);
            }

            if (time > this._lastDelayTime) {
                this.base(particles, particleCount, particleLife, options, time, dt);
                this._lastDelayTime = time + this._delay + R.lang.Math2.randomRange(0, this._delayVariance, true);
            }

        }

    }, {
        getClassName: function() {
            return "R.particles.effects.Spark";
        }
    });

};
