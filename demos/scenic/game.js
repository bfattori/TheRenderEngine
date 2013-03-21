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
                width(40).
                rotation(10, 50).
                lifespan(Infinity).
                frequency(30).
                particleLife(2500, 800).
                particle(SmokerParticle)
            );

        }

    });
};
