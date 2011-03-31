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

// Load all required engine components
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/resourceloaders/loader.sprite.js");
R.Engine.requires("/spatial/container.spatialgrid.js");
R.Engine.requires("/engine.timers.js");
R.Engine.requires("/physics/physics.simulation.js")
R.Engine.requires("/objects/object.physicsactor.js")
R.Engine.requires("/components/component.sprite.js")
R.Engine.requires("/components/component.collider.js");


R.Engine.requires("/physics/collision/shapes/b2BoxDef.js");

// Load game objects
Game.load("/player.js");

R.Engine.initObject("PhysicsDemo2", "Game", function(){

   /**
    * @class Another physics demonstration.  This demo shows how to
    * create more complex physical objects using joints to create a
    * ragdoll which can be tossed about the playfield.
    *
    * @extends Game
    */
   var PhysicsDemo2 = Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      // Engine frames per second
      engineFPS: 30,
      
      // The play field
      fieldBox: null,
      fieldWidth: 800,
      fieldHeight: 460,

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
         // Set the FPS of the game
         R.Engine.setFPS(this.engineFPS);
         
         this.spriteLoader = SpriteLoader.create();
         
         // Load the sprites
         this.spriteLoader.load("ragdoll", this.getFilePath("resources/ragdoll.sprite"));
         PhysicsActor.load("ragdoll", this.getFilePath("resources/ragdoll.json"));
			
         // Don't start until all of the resources are loaded
         Timeout.create("wait", 250, function() {
				if (PhysicsDemo2.spriteLoader.isReady() &&
					 PhysicsActor.isReady()) {
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
         this.fieldBox.destroy();
         this.renderContext.destroy();
      },
      
      /**
       * Run the game
       * @private
       */
      run: function(){
         // Set up the playfield dimensions
         this.fieldWidth = R.engine.Support.sysInfo().viewWidth;
			this.fieldHeight = R.engine.Support.sysInfo().viewHeight;
         this.fieldBox = Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         
         // Create the game context
			this.renderContext = CanvasContext.create("Playfield", this.fieldWidth, this.fieldHeight);
         this.renderContext.setBackgroundColor("#FFFFFF");

			// Set up the physics simulation
         this.simulation = Simulation.create("simulation", this.fieldBox);
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
         this.cModel = SpatialGrid.create(this.fieldWidth, this.fieldHeight, 8);

         // Add a few ragdoll objects
			for (var dolls = 0; dolls < 3; dolls++) {
				var ragdoll = this.createRagdoll(PhysicsActor.get("ragdoll"));
				var xPos = (Math2.random() * 800);
				ragdoll.setPosition(Point2D.create(xPos, 150));
	         ragdoll.setSimulation(this.simulation);
				this.renderContext.add(ragdoll);
				ragdoll.simulate();
			}
         
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
         actor.add(ColliderComponent.create("collide", PhysicsDemo2.cModel));
			
			// Associate the sprites with the actor's physics components
			var components = actor.getRigidBodies();			
			for (var c in components) {
				var component = components[c];
				component.setRenderComponent(SpriteComponent.create(component.getName(), sprites[component.getName().toLowerCase()]));
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
      	var pos = Point2D.create(0,0), ext = Point2D.create(0,0);
      	
      	// Ground
      	pos.set(0, this.fieldBox.get().h);
      	ext.set(2000, 30);
      	this.simulation.addSimpleBoxBody(pos, ext, {
      		restitution: 0.2,
      		friction: 3.0
      	});
			
			// Left wall
			pos.set(-10, 100);
			ext.set(20, this.fieldBox.get().h + 150);
			this.simulation.addSimpleBoxBody(pos, ext);

			// Right wall
			pos.set(this.fieldBox.get().w, 100);
			ext.set(20, this.fieldBox.get().h + 150);
			this.simulation.addSimpleBoxBody(pos, ext);
			
         // Clean up temporary objects
			pos.destroy();
			ext.destroy();
      },
      
      /**
       * Returns a reference to the render context
       * @return {RenderContext}
       */
      getRenderContext: function(){
         return this.renderContext;
      },
      
      /**
       * Returns a reference to the playfield box
       * @return {Rectangle2D}
       */
      getFieldBox: function() {
         return this.fieldBox;
      },
      
      /**
       * Returns a reference to the collision model
       * @return {SpatialContainer}
       */
      getCModel: function() {
         return this.cModel;
      }
      
   });
   
   return PhysicsDemo2;
   
});
