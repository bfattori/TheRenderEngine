// Load the components and engine objects
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/components/component.convexcollider.js");
R.Engine.requires("/components/component.sprite.js");
R.Engine.requires("/engine.object2d.js");
R.Engine.requires("/collision/collision.circle.js");

R.Engine.initObject("Powerup", "Object2D", function() {

	var Powerup = Object2D.extend({

		constructor: function() {
		   this.base("Powerup");

		   // Add the component to move the object
		   this.add(Transform2DComponent.create("move"));

		   // Add the component for collisions
		   this.add(ConvexColliderComponent.create("collide", Tutorial11.collisionModel));

		   // Add the component for rendering
			var shieldSprite = Tutorial11.spriteLoader.getSprite("sprites", "powerup");
		   this.add(SpriteComponent.create("draw", shieldSprite));

			// Set the collision mask
			this.getComponent("collide").setCollisionMask(Powerup.COLLISION_MASK);

		   // Set our bounding box so collision tests work
		   this.setBoundingBox(shieldSprite.getBoundingBox());

			// Create a collision hull
			this.setCollisionHull(CircleHull.create(this.getBoundingBox()));

		   // Pick a random location on the playfield
		   var start = Point2D.create(Tutorial11.getFieldBox().getCenter());
		   var dX = 50 + Math.floor(Math2.random() * 100);
		   var dY = 50 + Math.floor(Math2.random() * 100);
		   var rX = Math2.random() * 100 < 50 ? -1 : 1;
		   var rY = Math2.random() * 100 < 50 ? -1 : 1;
		   dX *= rX;
		   dY *= rY;
		   start.add(Point2D.create(dX, dY));
			
			// Set the origin
			this.setOrigin(this.getBoundingBox().getCenter());

		   // Position the object
		   this.setPosition(start);
						
			start.destroy();
		},

		setPosition: function(pos) {
			this.getComponent("move").setPosition(pos);
			this.base(pos);			
		},

		/**
		 * We need this for the collision model.
		 * @return {Point2D}
		 */
		getPosition: function() {
			return this.getComponent("move").getPosition();
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
		}

	}, { // Static

		/**
		 * Get the class name of this object
		 * @return {String} The string TouchObject
		 */
		getClassName: function() {
		   return "Powerup";
		},
		
		COLLISION_MASK: Math2.parseBin("01")

	});

	return Powerup;
});