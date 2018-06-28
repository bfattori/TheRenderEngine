
R.Engine.define({
    "class": "Smoker",
    "requires": [
        "R.particles.effects.Spray"
    ]
});

var Smoker = function() {
    return R.particles.effects.Spray.extend({

        generateParticles: function(particles, particleCount, particleLife, particleOptions, time, dt) {
            this.base(particles, particleCount, particleLife, particleOptions, time, dt);

            // Set a sprite on the particle
            for (var itr = particles.iterator(); itr.hasNext(); ) {
                var particle = itr.next();
                particle.setSprite(ScenicDisplay.spriteLoader.getSprite("smoke",
                    Smoker.PARTICLE_NAMES[R.lang.Math2.randomRange(0,3,true)]));
            }
            itr.destroy();
        }
    }, {
        PARTICLE_NAMES: ["smoke1", "smoke2", "smoke3", "smoke4"]
    });
};

R.Engine.define({
    "class": "SmokerParticle",
    "requires": [
        "R.particles.effects.SprayParticle"
    ]
});

var SmokerParticle = function() {
    return R.particles.effects.SprayParticle.extend({

        sprite: null,

        setSprite: function(sprite) {
            this.sprite = sprite;
        },

        draw: function(renderContext, time, dt, remainingTime) {
            if (this.sprite) {
                renderContext.drawSpriteAt(this.sprite, this.getPosition(), time, dt);
            }
        }

    }, {
        getClassName: function() {
            return "SmokerParticle";
        }

    });
};
