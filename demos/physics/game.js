/**
 * The Render Engine
 * Simple Physics Demo
 *
 * A simple game of bouncing balls
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

R.Engine.define({
   "class": "PhysicsDemo",
   "requires": [
      "R.engine.Game",
      "R.rendercontexts.CanvasContext",
      "R.rendercontexts.HTMLDivContext",
      "R.physics.Simulation",
      "R.resources.loaders.SpriteLoader",
      "R.resources.types.Sprite",
      "R.engine.Events",
      "R.math.Math2D"
   ],

   // Game class dependencies
   "depends": [
      "Toy",
      "Crate",
      "BeachBall"
   ]
});

// Load game objects
R.engine.Game.load("/toy.js");
R.engine.Game.load("/beachball.js");
R.engine.Game.load("/crate.js");

/**
 * @class A physics demonstration to show off Box2D-JS integration.  Creates
 *          a set of "toys" and drops them into the simulation.  The "player"
 *          can drag objects around and watch them interact.
 *
 * @extends Game
 */
var PhysicsDemo = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      // Sprite resource loader
      spriteLoader: null,

      // The physical world simulation
      simulation: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function() {
         PhysicsDemo.spriteLoader = R.resources.loaders.SpriteLoader.create();

         // Load the sprites
         PhysicsDemo.spriteLoader.load("beachball", PhysicsDemo.getFilePath("resources/beachball.sprite"));
         PhysicsDemo.spriteLoader.load("crate", PhysicsDemo.getFilePath("resources/crate.sprite"));

         // Don't start until all of the resources are loaded
         R.lang.Timeout.create("wait", 250, function() {
            if (PhysicsDemo.spriteLoader.isReady()) {
               this.destroy();
               PhysicsDemo.run();
            }
            else {
               // Continue waiting
               this.restart();
            }
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function() {
         this.fieldBox.destroy();
         this.renderContext.destroy();
      },

      /**
       * Run the game
       * @private
       */
      run: function() {
         //R.Engine.setDebugMode(true);

         // Create the game context
         this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 800, 600);
         this.renderContext.setBackgroundColor("#FFFFFF");
         this.renderContext.captureMouse();

         // Set up the physics simulation
         this.simulation = R.physics.Simulation.create("simulation",
               this.renderContext.getViewport(), R.math.Point2D.create(0, 40));

         this.simulation.setIntegrations(3);
         this.setupWorld();

         // Add the simulation to the scene graph so the physical
         // world is stepped (updated) in sync with each frame generated
         this.renderContext.add(this.simulation);

         // Draw an outline around the context
         this.renderContext.jQ().css({
            border: "1px solid red",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0});

         // Add the game context to the scene graph
         R.Engine.getDefaultContext().add(this.renderContext);

         this.addToys();
      },

      /**
       * Add toys to the render context to play around with.  The types of
       * toys added depends on the check boxes in the interface.
       */
      addToys: function() {
         // Add some toys to play around with
         if ($("input.balls")[0].checked) {
            R.lang.MultiTimeout.create("ballmaker", 6, 150, function() {
               PhysicsDemo.createToy(BeachBall.create());
            });
         }

         if ($("input.crates")[0].checked) {
            R.lang.MultiTimeout.create("boxmaker", 6, 150, function() {
               PhysicsDemo.createToy(Crate.create());
            });
         }
      },

      /**
       * Clear all toys from the render context and destroy their instances.
       */
      clearToys: function() {
         var toys = this.renderContext.getObjects(function(e) {
            return e instanceof Toy;
         });
         while (toys.length > 0) {
            toys.shift().destroy();
         }
      },

      /**
       * Set up the physical world.  Creates the bounds of the world by establishing
       * walls and a floor.  The actual objects have no visual respresentation but they
       * will exist in the simulation and prevent the toys from leaving the playfield.
       * @private
       */
      setupWorld: function() {
         var pos = R.math.Point2D.create(0, 0), ext = R.math.Point2D.create(0, 0);

         // Ground
         pos.set(0, this.renderContext.getViewport().h);
         ext.set(3000, 30);
         this.simulation.addSimpleBoxBody(pos, ext, {
            restitution: 0.1,
            friction: 3.0
         });

         // Left wall
         pos.set(-10, 100);
         ext.set(20, this.renderContext.getViewport().h + 850);
         this.simulation.addSimpleBoxBody(pos, ext);

         // Right wall
         pos.set(this.renderContext.getViewport().w, 100);
         ext.set(20, this.renderContext.getViewport().h + 850);
         this.simulation.addSimpleBoxBody(pos, ext);

         // Clean up temporary objects
         pos.destroy();
         ext.destroy();
      },

      /**
       * Create a single toy and apply a force to give it some random motion.
       * @param toyObject {Toy} A toy object to add to the playfield and simulation
       * @private
       */
      createToy: function(toyObject) {
         // Set a random location
         var x = Math.floor(R.lang.Math2.random() * 700);
         var p = R.math.Point2D.create(x, 0);
         toyObject.setPosition(p);

         this.renderContext.add(toyObject);

         // Start the simulation of the object so we can apply a force
         toyObject.simulate();
         var v = R.math.Vector2D.create(1 + (R.lang.Math2.random() * 80), 2);
         toyObject.applyForce(v, p);

         // Clean up temporary objects
         v.destroy();
         p.destroy();
      },

      /**
       * Returns a reference to the playfield box
       * @return {Rectangle2D}
       */
      getFieldRect: function() {
         return this.renderContext.getViewport();
      },

      /**
       * Returns a reference to the physics simulation (the physics world)
       */
      getSimulation: function() {
         return this.simulation;
      }

   });
};
