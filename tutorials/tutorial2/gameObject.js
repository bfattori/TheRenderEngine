// Load the components and engine objects
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/engine.object2d.js");

R.Engine.initObject("GameObject", "Object2D", function() {

   var GameObject = Object2D.extend({

		// The width of the object
		width: 50,				// The width of the object
		height: 50,				// The height of the object
		color: "#ffff00",		// The color of the object
		velocity: null,		// The velocity of our object
		shape: null,			// Our object's shape

      constructor: function() {
         this.base("GameObject");

         // Add the component to move the object
         this.add(Transform2DComponent.create("move"));

         // Pick a random position to start at
			var fBox = Tutorial2.getFieldBox().get();
         var start = Point2D.create(50 + (Math.floor(Math2.random() * fBox.w - this.width)), 
												50 + (Math.floor(Math2.random() * fBox.h - this.height)));

			// Pick a random velocity for each axis
			this.velocity = Point2D.create(1 + Math.floor(Math2.random() * 3), 
								 					 1 + Math.floor(Math2.random() * 3));
			
			// Set our object's shape
			this.shape = Rectangle2D.create(0, 0, this.width, this.height);
			
         // Position the object
         this.setPosition(start);
      },
		
      /**
       * Update the object within the rendering context.  This calls the transform
       * components to position the object on the playfield.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
			renderContext.pushTransform();
			
			// The the "update" method of the super class
			this.base(renderContext, time);
			
			// Update the object's position
			this.move();
			
			// Draw the object on the render context
			this.draw(renderContext);

			renderContext.popTransform();
      },

      /**
       * Get the position of the object from the transform component.
       * @return {Point2D}
       */
      getPosition: function() {
         return this.getComponent("move").getPosition();
      },

      /**
       * Set the position of the object through transform component
       * @param point {Point2D} The position to draw the text in the playfield
       */
      setPosition: function(point) {
         this.base(point);
         this.getComponent("move").setPosition(point);
      },

		/**
		 * Calculate and perform a move for our object.  We'll use
		 * the field dimensions from our playfield to determine when to
		 * "bounce".
		 */
		move: function() {
			var pos = this.getPosition();
			pos.add(this.velocity);
			this.setPosition(pos);
			
			// Determine if we hit a "wall" of our playfield
			var fieldBox = Tutorial2.getFieldBox().get();
			if ((pos.x + this.width > fieldBox.r) || (pos.x < 0)) {
				// Reverse the X velocity
				this.velocity.setX(this.velocity.get().x * -1);
			}	
			if ((pos.y + this.height > fieldBox.b) || (pos.y < 0)) {
				// Reverse the Y velocity
				this.velocity.setY(this.velocity.get().y * -1);
			}
		},

		/**
		 * Draw our game object onto the specified render context.
		 * @param renderContext {RenderContext} The context to draw onto
		 */
		draw: function(renderContext) {
			// Generate a rectangle to represent our object
			var pos = this.getPosition();
			
			// Set the color to draw with
			renderContext.setFillStyle(this.color);
         renderContext.drawFilledRectangle(this.shape);
		}

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string MyObject
       */
      getClassName: function() {
         return "GameObject";
      }
   });

return GameObject;

});
