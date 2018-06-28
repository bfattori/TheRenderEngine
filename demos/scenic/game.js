// Load all required engine components
R.Engine.define({
    "class": "ScenicDisplay",
    "requires": [
        "R.engine.Game",
        "R.rendercontexts.CanvasContext",
        "R.particles.ParticleEngine",
        "R.resources.loaders.SpriteLoader"
    ],
    "depends": [
        "Smoker"
    ]
});

R.engine.Game.load("smoker.js");

/**
 * @class Tutorial Two.  Generate a simple box and
 *         bounce it around the playfield.
 */
var ScenicDisplay = function () {
    return R.engine.Game.extend({

        // The rendering context
        renderContext: null,
        pEngine: null,
        spriteLoader: null,

        /**
         * Called to set up the game, download any resources, and initialize
         * the game to its running state.
         */
        setup: function () {
            // Create the render context
            this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 480, 480);
            this.renderContext.setBackgroundColor("white");

            // Add the new rendering context to the default engine context
            R.Engine.getDefaultContext().add(this.renderContext);

            // Create the particle engine and add it to the render context
            this.pEngine = R.particles.ParticleEngine.create();
            this.renderContext.add(this.pEngine);

            // Load the sprites
            this.spriteLoader = R.resources.loaders.SpriteLoader.create();
            this.spriteLoader.load("smoke", ScenicDisplay.getFilePath("resources/smoke.sprite"));

            // Wait until the resources are ready before running the game
            R.lang.Timeout.create("resourceWait", 250, function() {
                if (ScenicDisplay.spriteLoader.isReady()) {
                    // Destroy the timer and start the game
                    this.destroy();
                    ScenicDisplay.run();
                } else {
                    // Resources aren't ready, restart the timer
                    this.restart();
                }
            });
        },

        /**
         * Adds a smoker particle effect
         */
        run: function () {
            this.pEngine.addEffect(Smoker.create(ScenicDisplay.renderContext.getViewport().getCenter()).
                quantity(1).
                width(35, 25).
                particleVelocity(0.2, 1.2).
                lifespan(Infinity).
                frequency(5).
                particleLife(5500, 1500).
                particle(SmokerParticle)
            );

            this.pEngine.addEffect(Smoker.create(R.math.Point2D.create(30,80)).
              quantity(1).
              width(35, 25).
              particleVelocity(0.2, 1.2).
              lifespan(Infinity).
              frequency(130).
              particleLife(2500, 800).
              particle(SmokerParticle)
            );

            this.pEngine.addEffect(Smoker.create(R.math.Point2D.create(350,120)).
              quantity(1).
              width(35, 25).
              particleVelocity(0.02, 0.8).
              lifespan(Infinity).
              frequency(90).
              particleLife(4500, 3000).
              particle(SmokerParticle)
            );

            this.pEngine.addEffect(Smoker.create(R.math.Point2D.create(110,220)).
              quantity(3).
              width(15, 5).
              particleVelocity(0.2, 1.2).
              lifespan(Infinity).
              frequency(15).
              particleLife(2500, 800).
              particle(SmokerParticle)
            );



        }

    });
};
