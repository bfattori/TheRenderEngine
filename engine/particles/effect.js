R.Engine.define({
    "class": "R.particles.Effect",
    "requires": [
        "R.engine.PooledObject"
    ]
});

R.particles.Effect = function() {
    return R.engine.PooledObject.extend({

        particleCount: 30,
        particleCountVariance: 1,
        particleLifetime: 1000,
        particleLifetimeVariance: 500,
        position: null,
        particleClass: null,
        ttl: 0,
        run: false,
        emitFrequency: 0,
        emitFrequencyVariance: 0,
        lastTime: 0,
        position: null,

        constructor: function(origin) {
            this.position = R.math.Point2D.create(origin);
            this.run = false;
            this.ttl = 0;
            this.emitFrequency = 0;
            this.emitFrequencyVariance = 0;
            this.lastTime = 0;
            return this;
        },

        release: function() {
            this.run = false;
            this.lastTime = 0;
            this.emitFrequency = 0;
            this.emitFrequencyVariance = 0;
            this.ttl = 0;
        },

        quantity: function(particleCount, particleCountVariance) {
            this.particleCount = particleCount;
            this.particleCountVariance = particleCountVariance || 1;
            return this;
        },

        lifespan: function(ttl) {
            this.ttl = ttl;
            return this;
        },

        frequency: function(emitFrequency, frequencyVariance) {
            this.emitFrequency = emitFrequency;
            this.emitFrequencyVariance = frequencyVariance || 0;
            return this;
        },

        particleLife: function(lifetime, variance) {
            this.particleLifetime = lifetime;
            this.particleLifetimeVariance = variance || 500;
            return this;
        },

        particle: function(particleClass) {
            this.particleClass = particleClass;
            return this;
        },

        runEffect: function(particleEngine, time, dt) {
            var p = R.struct.Container.create();
            var numParticles = this.particleCountVariance == 1 ? this.particleCount :
                Math.floor(this.particleCount * R.lang.Math2.randomRange(0, this.particleCountVariance));
            var particleLife = this.particleLifetime + R.lang.Math2.randomRange(0, this.particleLifetimeVariance, true);
            var emitFreq = this.emitFrequency + R.lang.Math2.randomRange(0, this.emitFrequencyVariance, true);

            if (!this.run || (this.run && time - this.lastTime > emitFreq)) {
                this.generateParticles(p, numParticles, particleLife, time, dt);
                this.lastTime = time;
            }

            particleEngine.addParticles(p);
            this.run = true;
        },

        generateParticles: function(particles, particleCount, particleLife) {
            // ABSTRACT
        },

        getLifespan: function(dt) {
            this.ttl -= dt;
            return Math.max(this.ttl, 0);
        },

        hasRun: function() {
            return this.run;
        }

    }, {
        getClassName: function() {
            return "R.particles.Effect";
        }
    });
};