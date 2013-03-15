R.Engine.define({
    "class": "R.particles.effects.SprayParticle",
    "requires": [
        "R.particles.AbstractParticle",
        "R.math.Math2D"
    ]
});

/**
 * @class A spray particle
 *
 * @param position {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 * @param angle {Number} The angle, about the point, at which to emit particles.
 * @param spread {Number} The spread, or range, about the angle which to emit particles
 * @param ttl {Number} The lifetime of the particle in milliseconds
 */
R.particles.effects.SprayParticle = function() {
    return R.particles.AbstractParticle.extend(/** @scope TrailParticle.prototype */{

        velocityVector: null,

        constructor: function(position, ttl, angle, spread) {
            this.base(ttl || 2000);
            this.setPosition(position.x, position.y);
            var a = angle + Math.floor((180 - (spread / 2)) + (R.lang.Math2.random() * (spread * 2)));

            if (this.velocityVector == null) {
                this.velocityVector = R.math.Vector2D.create(0, 0);
            }

            R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, a, this.velocityVector);
            var vel = 1 + (R.lang.Math2.random() * 2);
            this.velocityVector.mul(vel);
        },

        release: function() {
            this.base();
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
            this.getPosition().add(this.velocityVector);
            this.renderParticle(renderContext, time, dt);
        },

        renderParticle: function(renderContext, time, dt) {
            renderContext.setFillStyle("#fff");
            renderContext.drawPoint(this.getPosition());
        }

    }, {
        getClassName: function() {
            return "R.particles.effects.SprayParticle";
        }
    });
};

R.Engine.define({
    "class": "R.particles.effects.Spray",
    "requires": [
        "R.particles.Effect"
    ]
});
R.particles.effects.Spray = function() {
    return R.particles.Effect.extend({

        spread: 10,
        spreadVariance: 0,
        angle: 0,
        angleVariance: 0,

        width: function(spread, spreadVariance) {
            this.spread = spread;
            this.spreadVariance = spreadVariance || 0;
            return this;
        },

        rotation: function(angle, angleVariance) {
            this.angle = angle;
            this.angleVariance = angleVariance;
            return this;
        },

        generateParticles: function(particles, particleCount, particleLife) {
            var sprayWidth = this.spread + R.lang.Math2.randomRange(0, this.spreadVariance, true);
            var halfAngle = Math.floor(this.angleVariance / 2);
            var angle = this.angle + R.lang.Math2.randomRange(-halfAngle, halfAngle, true);
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
