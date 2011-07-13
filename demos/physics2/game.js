/**
 * The Render Engine
 * Physics Demo 2
 *
 * Demonstration of loading and using a jointed set of rigid bodies in the
 * form of a "ragdoll".
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
	"class": "PhysicsDemo2",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
		"R.collision.broadphase.SpatialGrid",
		"R.physics.Simulation",
      "R.objects.PhysicsActor",
		"R.resources.loaders.SpriteLoader",
		"R.engine.Events",
		"R.math.Math2D",

      "R.components.render.Sprite",
      "R.components.Collider"
	],

	// Game class dependencies
	"depends": [
		"Player"
	]
});

// Load game objects
R.engine.Game.load("/player.js");

/**
 * @class Another physics demonstration.  This demo shows how to
 * create more complex physical objects using joints to create a
 * ragdoll which can be tossed about the playfield.
 *
 * @extends Game
 */
var PhysicsDemo2 = function() {
   return R.engine.Game.extend({

      // The rendering context
      renderContext: null,

      // Sprite resource loader
      spriteLoader: null,

      // The collision model
      cModel: null,

      // The physical world simulation
      simulation: null,

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         this.spriteLoader = R.resources.loaders.SpriteLoader.create();

         // Load the sprites
         this.spriteLoader.load("ragdoll", this.getFilePath("resources/ragdoll.sprite"));
         R.objects.PhysicsActor.load("ragdoll", this.getFilePath("resources/ragdoll.json"));

         // Don't start until all of the resources are loaded
         R.lang.Timeout.create("wait", 250, function() {
            if (PhysicsDemo2.spriteLoader.isReady() &&
                  R.objects.PhysicsActor.isReady()) {
               this.destroy();
               PhysicsDemo2.run();
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
      teardown: function(){
         this.spriteLoader.destroy();
      },

      /**
       * Run the game
       * @private
       */
      run: function(){
         // Create the game context
         this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 800, 460);
         this.renderContext.setBackgroundColor("#FFFFFF");

         // Set up the physics simulation
         this.simulation = R.physics.Simulation.create("simulation",
               this.renderContext.getViewport(), R.math.Point2D.create(0,40));

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

         // Create the collision model with 8x8 divisions
         this.cModel = R.collision.broadphase.SpatialGrid.create(800, 460, 8);

         // Add a rag doll object
         var ragdoll = this.createRagdoll(R.objects.PhysicsActor.get("ragdoll"));
         var xPos = (R.lang.Math2.random() * 800);
         ragdoll.setPosition(R.math.Point2D.create(xPos, 150));
         ragdoll.setSimulation(this.simulation);
         this.renderContext.add(ragdoll);
         ragdoll.simulate();

         // Add the player object
         var player = Player.create();
         this.getRenderContext().add(player);
      },

      /**
       * Create a ragdoll object by associating the sprites with the actor that was loaded.
       * @param actor {PhysicsActor} The physics actor object
       */
      createRagdoll: function(actor) {
         // Load the sprites
         var sprites = PhysicsDemo2.spriteLoader.exportAll("ragdoll");

         // Add components to draw and collide with the player
         actor.add(R.components.Collider.create("collide", PhysicsDemo2.cModel));

         // Associate the sprites with the actor's physics components
         var components = actor.getRigidBodies();
         for (var c in components) {
            var component = components[c];
            component.setRenderComponent(R.components.render.Sprite.create(
                  component.getName(), sprites[component.getName().toLowerCase()]));
         }

         actor.setBoundingBox(actor.getRootBody().getBoundingBox());
         return actor;
      },

      /**
       * Set up the physical world.  Creates the bounds of the world by establishing
       * walls and a floor.  The actual objects have no visual respresentation but they
       * will exist in the simulation and prevent the toys from leaving the playfield.
       * @private
       */
      setupWorld: function() {
         var pos = R.math.Point2D.create(0,0), ext = R.math.Point2D.create(0,0);

         // Ground
         pos.set(0, this.renderContext.getViewport().h);
         ext.set(3000, 30);
         this.simulation.addSimpleBoxBody(pos, ext, {
            restitution: 0.2,
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
       * Returns a reference to the playfield box
       * @return {Rectangle2D}
       */
      getFieldRect: function() {
         return this.renderContext.getViewport();
      },

      /**
       * Returns a reference to the collision model
       * @return {SpatialContainer}
       */
      getCModel: function() {
         return this.cModel;
      },

      /**
       * Returns a reference to the game's rendering context
       * @return {SpatialContainer}
       */
      getRenderContext: function() {
         return this.renderContext;
      }

   });
};
