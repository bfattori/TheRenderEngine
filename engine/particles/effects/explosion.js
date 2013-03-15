R.Engine.define({
    "class": "R.particles.effects.ExplosionParticle",
    "requires": [
        "R.particles.AbstractParticle",
        "R.math.Math2D"
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

        velocityVector: null,
        decay: 0,
        inverseVelocity: null,

        constructor: function(position, ttl, decay) {
            this.base(ttl || 2000);
            this.setPosition(position.x, position.y);

            var emitAngle = Math.floor(R.lang.Math2.random() * 360);

            if (this.inverseVelocity == null) {
                // Another situation where it's better to keep this value, rather than destroying
                // it after use.  Since particles are short-lived, it's better to do this than
                // create/destroy over and over.
                this.inverseVelocity = R.math.Vector2D.create(0, 0);
            }

            if (this.velocityVector == null) {
                // Same as above to save cycles...
                this.velocityVector = R.math.Vector2D.create(0, 0);
            }

            R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, emitAngle, this.velocityVector);
            var vel = 1 + (R.lang.Math2.random() * 5);
            this.velocityVector.mul(vel);
            this.decay = decay;
        },

        release: function() {
            this.base();
            this.decay = 0;
            this.renderFn = null;
        },

        /**
         * Called by the particle engine to draw the particle to the rendering
         * context.
         *
         * @param renderContext {RenderContext} The rendering context
         * @param time {Number} The engine time in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        draw: function(renderContext, time, dt) {
            if (this.decay > 0 && this.velocityVector.len() > 0) {
                this.inverseVelocity.set(this.velocityVector).neg();
                this.inverseVelocity.mul(this.decay);
                this.velocityVector.add(this.inverseVelocity);
            }

            this.getPosition().add(this.velocityVector);
            this.renderParticle(renderContext, time, dt);
        },

        renderParticle: function(renderContext, time, dt) {
            renderContext.setFillStyle("#fff");
            renderContext.drawPoint(this.getPosition());
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.ExplosionParticle";
        }
    });
};

R.Engine.define({
    "class": "R.particles.effects.Explosion",
    "requires": [
        "R.particles.Effect"
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

