R.Engine.define({
    "class": "R.particles.Effect",
    "requires": [
        "R.engine.PooledObject"
    ]
});

/**
 * @class The base particle effect class.  All effects derive from this class which provides
 *        set up and construction of emitted particles.
 * @param origin {R.math.Point2D} The location at which effect particles originate.
 * @returns {*}
 * @constructor
 */
R.particles.Effect = function() {
    return R.engine.PooledObject.extend({

        particleCount: 0,
        particleCountVariance: 0,
        particleLifetime: 0,
        particleLifetimeVariance: 0,
        origin: null,
        particleClass: null,
        ttl: 0,
        run: false,
        emitFrequency: 0,
        emitFrequencyVariance: 0,
        lastTime: 0,
        velocity: 0,
        velocityVariance: 0,

        constructor: function(origin) {
            this.origin = R.math.Point2D.create(origin);
            this.run = false;
            this.ttl = 0;
            this.emitFrequency = 0;
            this.emitFrequencyVariance = 0;
            this.velocity = 0.2;
            this.velocityVariance = 0;
            this.particleCount = 10;
            this.particleCountVariance = 0;
            this.lastTime = 0;
            this.particleLifetime = 500;
            this.particleLifetimeVariance = 0;
            return this;
        },

        release: function() {
            this.run = false;
            this.lastTime = 0;
            this.emitFrequency = 0;
            this.emitFrequencyVariance = 0;
            this.ttl = 0;
        },

        /**
         * Get the origin of the effect
         * @returns {R.math.Point2D}
         */
        getOrigin: function() {
            return this.origin;
        },

        /**
         * Set the quantity of particles which will be emitted at each frame rendering.
         *
         * @param particleCount
         * @param [particleCountVariance]
         * @returns {*}
         */
        quantity: function(particleCount, particleCountVariance) {
            this.particleCount = particleCount;
            this.particleCountVariance = particleCountVariance || 1;
            return this;
        },

        /**
         * Set the lifespan of the effect.
         *
         * @param ttl
         * @returns {*}
         */
        lifespan: function(ttl) {
            this.ttl = ttl;
            return this;
        },

        /**
         * Set the frequency at which particles will be emitted.
         *
         * @param emitFrequency
         * @param [frequencyVariance]
         * @returns {*}
         */
        frequency: function(emitFrequency, frequencyVariance) {
            this.emitFrequency = emitFrequency;
            this.emitFrequencyVariance = frequencyVariance || 0;
            return this;
        },

        /**
         * Set the lifespan of each particle which is emitted.
         *
         * @param lifetime
         * @param [variance]
         * @returns {*}
         */
        particleLife: function(lifetime, variance) {
            this.particleLifetime = lifetime;
            this.particleLifetimeVariance = variance || 500;
            return this;
        },

        /**
         * Set the particle class which is emitted from the effect.
         *
         * @param particleClass
         * @returns {*}
         */
        particle: function(particleClass) {
            this.particleClass = particleClass;
            return this;
        },

        /**
         * Set the scalar velocity at which particles move after emission.
         *
         * @param velocity
         * @param [velocityVariance]
         * @returns {*}
         */
        particleVelocity: function(velocity, velocityVariance) {
            this.velocity = velocity;
            this.velocityVariance = velocityVariance || 0;
            return this;
        },

        /**
         * Run the particle effect.
         * @param particleEngine
         * @param time
         * @param dt
         * @private
         */
        runEffect: function(particleEngine, time, dt) {
            var particles = R.struct.Container.create();
            var numParticles = this.particleCount + R.lang.Math2.randomRange(0, this.particleCountVariance, true);
            var particleLife = this.particleLifetime + R.lang.Math2.randomRange(0, this.particleLifetimeVariance, true);
            var emitFreq = this.emitFrequency + R.lang.Math2.randomRange(0, this.emitFrequencyVariance, true);

            if (!this.run || (this.run && time - this.lastTime > emitFreq)) {
                var options = {};
                this.generateParticles(particles, numParticles, particleLife, options, time, dt);
                this.lastTime = time;
            }

            particleEngine.addParticles(particles);
            this.run = true;
        },

        /**
         * A method to give an effect the ability to modify a particle's options for each particle generated.
         * @param particleOptions {Object}
         * @param [time] {Number} The current world time
         * @param [dt] {Number} The number of milliseconds since the last rendered frame was generated
         */
        modifyParticleOptions: function(particleOptions, time, dt) {
            particleOptions.velocity = this.velocity + R.lang.Math2.randomRange(0, this.velocityVariance);
        },

        /**
         * Generate particles for the effect.
         * @param particles {R.struct.Container} The list of particles
         * @param particleCount {Number} The count of particles in the list
         * @param particleLife {Number} The lifespan of the particles
         * @param particleOptions {Object} The particle options
         * @param time {Number} The current world time
         * @param dt {Number} The time between the last world frame and current time
         */
        generateParticles: function(particles, particleCount, particleLife, particleOptions, time, dt) {
            for (var x = 0; x < particleCount; x++) {
                this.modifyParticleOptions(particleOptions, time, dt);
                particles.add(this.particleClass.create(this.origin, particleLife, particleOptions));
            }
        },

        /**
         * Get the lifespan of the effect relative to the delta time.
         * @param dt
         * @returns {number}
         */
        getLifespan: function(dt) {
            this.ttl -= dt;
            return Math.max(this.ttl, 0);
        },

        /**
         * A flag indicating if the effect has run yet.
         * @returns {boolean}
         */
        hasRun: function() {
            return this.run;
        }

    }, {
        getClassName: function() {
            return "R.particles.Effect";
        }
    });
};