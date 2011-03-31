// Load the components and engine objects
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/components/component.boxcollider.js");
R.Engine.requires("/engine.object2d.js");

R.Engine.initObject("TouchObject", "Object2D", function() {

	var TouchObject = Object2D.extend({

		// The width of the object
		width: 25,                      // The width of the object
		height: 25,                     // The height of the object
		color: "#ff0000",               // The color of the object
		shape: null,                    // Our object's shape

		constructor: function(touchable) {
		   this.base("TouchObject");

		   // Add the component to move the object
		   this.add(Transform2DComponent.create("move"));

		   // Add the component for collisions
		   this.add(BoxColliderComponent.create("collide", Tutorial7.collisionModel));

		   // Pick a random location on the playfield
		   var dX = 50 + Math.floor(Math2.random() * 100);
		   var dY = 50 + Math.floor(Math2.random() * 100);
		   var rX = Math2.random() * 100 < 50 ? -1 : 1;
		   var rY = Math2.random() * 100 < 50 ? -1 : 1;
		   dX *= rX;
		   dY *= rY;
		   var start = Point2D.create(Tutorial7.getFieldBox().getCenter());
		   start.add(Point2D.create(dX, dY));
			
		   // Set our object's shape
		   this.shape = Rectangle2D.create(0, 0, this.width, this.height);

		   // Position the object
		   this.getComponent("move").setPosition(start);
			
			// Set the collision mask
			this.getComponent("collide").setCollisionMask(touchable ? Math2.parseBin("11") : "10");
			this.color = touchable ? "#8c1717" : "#fcb514";

		   // Set our bounding box so collision tests work
		   this.setBoundingBox(Rectangle2D.create(this.shape));
			start.destroy();
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

		   // Generate a rectangle to represent our object
		   // Set the color to draw with
		   renderContext.setFillStyle(this.color);
		   renderContext.drawFilledRectangle(this.shape);

		   renderContext.popTransform();
		}

	}, { // Static

		/**
		 * Get the class name of this object
		 * @return {String} The string TouchObject
		 */
		getClassName: function() {
		   return "TouchObject";
		}
	});

	return TouchObject;
});