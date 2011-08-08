// Load all required engine components
R.Engine.define({
   "class": "Tutorial12",
   "requires": [
      "R.engine.Game",
      "R.rendercontexts.CanvasContext",

      "R.physics.Simulation",

      "R.engine.Events",
      "R.math.Math2D"
   ],

   // Game class dependencies
   "depends": [
      "Box",
      "Ball",
      "Wedge"
   ]
});

// Load game objects
R.engine.Game.load("/ball.js");
R.engine.Game.load("/box.js");
R.engine.Game.load("/wedge.js");

/**
 * @class Tutorial Twelve - physics.  An introduction to creating a simulation,
 *        adding objects with physical attributes, and making it all work together.
 *
 * @extends R.engine.Game
 */
var Tutorial12 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      // The physical world simulation
      simulation: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function() {
         //R.Engine.setDebugMode(true);

         // Create the game's rendering context
         Tutorial12.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 600, 600);
         Tutorial12.renderContext.setBackgroundColor("#000000");

         // Create the simulation (physical world) and set the gravity.  The simulation
         // is unbounded, with it's origin the same as the render context's at 0, 0
         var gravity = R.math.Point2D.create(0, 40);
         Tutorial12.simulation = R.physics.Simulation.create("simulation", gravity);

         // Integrations are the number of sub-steps that will be made during each
         // frame to simulate the world.  The higher the number, the more accurate the
         // simulation will be, but the slower it will run
         Tutorial12.simulation.setIntegrations(6);

         // Add some boundaries to the world so that the
         // objects will be contained within the viewport
         Tutorial12.setupWorld();

         // Add the simulation to the game's context so the physical
         // world is stepped (updated) in sync with each frame generated
         Tutorial12.renderContext.add(Tutorial12.simulation);

         // Add the game's context to the scene graph
         R.Engine.getDefaultContext().add(Tutorial12.renderContext);

         // Add the rigid bodies to the simulation
         Tutorial12.addObjects();
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function() {
         this.renderContext.destroy();
      },

      /**
       * Set up the physical world.  Creates the bounds of the world by establishing
       * walls and a floor.  The actual objects have no visual respresentation but they
       * will exist in the simulation and prevent the objects from leaving the viewport.
       * @private
       */
      setupWorld: function() {
         var pos = R.math.Point2D.create(0, 0), ext = R.math.Point2D.create(0, 0);

         // Create a ground object.  This ground object differs from the world's ground
         // object in that it is used to represent a plane, relative to gravity, where
         // objects can fall no further.
         pos.set(0, Tutorial12.renderContext.getViewport().h);
         ext.set(3000, 30);
         Tutorial12.simulation.addSimpleBoxBody(pos, ext, {
            restitution: 0.1,
            friction: 3.0
         });

         // Left wall
         pos.set(-10, 100);
         ext.set(20, Tutorial12.renderContext.getViewport().h + 850);
         Tutorial12.simulation.addSimpleBoxBody(pos, ext);

         // Right wall
         pos.set(Tutorial12.renderContext.getViewport().w, 100);
         ext.set(20, Tutorial12.renderContext.getViewport().h + 850);
         Tutorial12.simulation.addSimpleBoxBody(pos, ext);

         // Clean up temporary objects
         pos.destroy();
         ext.destroy();
      },

      /**
       * Adds rigid bodies to the simulation.
       */
      addObjects: function() {
         // Put the wedge in the corner of the playfield.  The ball will be
         // placed over this to induce rolling.
         var wedge = Wedge.create(R.math.Point2D.create(0, Tutorial12.getFieldRect().h - 60));
         Tutorial12.renderContext.add(wedge);

         // Start the simulation of the object
         wedge.simulate();

         // Place the ball over the wedge
         var ball = Ball.create(R.math.Point2D.create(40, Tutorial12.getFieldRect().h - 250));
         Tutorial12.renderContext.add(ball);
         ball.simulate();

         // Create a stack of boxes
         var bpt = R.math.Point2D.create(400, Tutorial12.getFieldRect().h - 35);
         for (var b = 0; b < 10; b++) {
            var box = Box.create(bpt);
            Tutorial12.renderContext.add(box);
            box.simulate();

            bpt.y -= 32;
         }
      },

      /**
       * Returns a reference to the render context's view port
       * @return {R.math.Rectangle2D}
       */
      getFieldRect: function() {
         return Tutorial12.renderContext.getViewport();
      },

      /**
       * Returns a reference to the physics simulation (the physical world)
       */
      getSimulation: function() {
         return Tutorial12.simulation;
      }

   });
};
