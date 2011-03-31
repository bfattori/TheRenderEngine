// Load the components and engine objects
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/components/component.convexcollider.js");
R.Engine.requires("/components/component.sprite.js");
R.Engine.requires("/engine.object2d.js");
R.Engine.requires("/engine.timers.js");
R.Engine.requires("/engine.container.js");
R.Engine.requires("/collision/collision.OBB.js");

R.Engine.initObject("Bomb", "Object2D", function() {

	var Bomb = Object2D.extend({

		constructor: function() {
		   this.base("Bomb");

		   // Add the component to move the object
		   this.add(Transform2DComponent.create("move"));

		   // Add the component for collisions
		   this.add(ConvexColliderComponent.create("collide", Tutorial11.collisionModel));

		   // Add the component for rendering
			var bombSprite = Tutorial11.spriteLoader.getSprite("sprites", "bomb");
		   this.add(SpriteComponent.create("draw", bombSprite));

		   // Pick a random location on the playfield
		   var dX = 50 + Math.floor(Math2.random() * 100);
		   var dY = 50 + Math.floor(Math2.random() * 100);
		   var rX = Math2.random() * 100 < 50 ? -1 : 1;
		   var rY = Math2.random() * 100 < 50 ? -1 : 1;
		   dX *= rX;
		   dY *= rY;
		   var start = Point2D.create(Tutorial11.getFieldBox().getCenter());
		   start.add(Point2D.create(dX, dY));
			
			// Set the collision mask
			this.getComponent("collide").setCollisionMask(Bomb.COLLISION_MASK);

		   // Set our bounding box so collision tests work
		   this.setBoundingBox(bombSprite.getBoundingBox());
			
			// Create a collision hull
			this.setCollisionHull(OBBHull.create(this.getBoundingBox()));

			// Move the bombs's origin to the center of the bounding box
			this.setOrigin(this.getBoundingBox().getCenter());

		   // Position the object
		   this.setPosition(start);
						
			start.destroy();
		},

		/**
		 * We need this for the collision model.
		 * @return {Point2D}
		 */
		getPosition: function() {
			return this.getComponent("move").getPosition();
		},

		setPosition: function(pos) {
			this.getComponent("move").setPosition(pos);
			this.base(pos);
		},

		/**
		 * We need this for the world bounding box calculations
		 * @return {Point2D}
		 */
		getRenderPosition: function() {
			return this.getPosition();
		},

		/**
		 * Update the object within the rendering context.  This calls the transform
		 * component to position the object on the playfield.
		 *
		 * @param renderContext {RenderContext} The rendering context
		 * @param time {Number} The engine time in milliseconds
		 */
		update: function(renderContext, time) {
		   renderContext.pushTransform();

		   // The the "update" method of the super class
		   this.base(renderContext, time);

		   renderContext.popTransform();
		},
		
		/**
		 * Play a little animation and make the bomb explode
		 */
		explode: function() {
			// Set the collision mask so we don't collide again
			this.getComponent("collide").setCollisionMask(0);
			
			// Draw an explosion of sorts
			this.getComponent("draw").setSprite(Tutorial11.spriteLoader.getSprite("sprites", "boom"));
			
			// Adjust the position a bit to account for the different sprite sizes
			var pos = Point2D.create(this.getPosition());
			var offset = Point2D.create(30, 10);
			pos.sub(offset);
		   this.getComponent("move").setPosition(pos);
			pos.destroy();
			offset.destroy();

			// Generate some particles
			// We don't need to destroy this container.  The particle engine
			// will do that for us
	      var p = Container.create();
			var pt = Point2D.create(this.getPosition());
			pt.add(this.getOrigin());
	      for (var x = 0; x < 40; x++)
	      {
	         var decel = Math2.random() * 0.08;
				var r = Math.floor(Math2.random() * 500);
	         p.add(SimpleParticle.create(pt, 2000 + r, decel));
	      }
	      Tutorial11.pEngine.addParticles(p);
			pt.destroy();
			
			// Now animate the sprite explosion
			var self = this;
			OneShotTrigger.create("explosion", 500, function() {
				// Remove the bomb from the collision model
				Tutorial11.collisionModel.removeObject(self);
				self.destroy();
			}, 10, function() {
				var mc = self.getComponent("move");
				mc.setScale(mc.getScale() + 0.02);
			});
		}

	}, { // Static

		/**
		 * Get the class name of this object
		 * @return {String} The string TouchObject
		 */
		getClassName: function() {
		   return "Bomb";
		},
		
		COLLISION_MASK: Math2.parseBin("10")
		
	});

	return Bomb;
});