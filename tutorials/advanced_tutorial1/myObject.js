// Load the components and engine objects
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/components/component.host.js");
R.Engine.requires("/textrender/text.vector.js");
R.Engine.requires("/engine.object2d.js");

R.Engine.initObject("MyObject", "Object2D", function() {

   var MyObject = Object2D.extend({

      constructor: function() {
         this.base("MyObject");

	      this.add(HostComponent.create("host", 0.5));
	
			// The inner host object
			var Local = Object2D.extend({
	
				update: function(renderContext, time) {
					renderContext.pushTransform();
					this.base(renderContext, time);
					renderContext.popTransform();
				}
	
			});
			var local = Local.create();
	
			// Add the inner host to our object
			this.getComponent("host").add("local", local);
	
			// Add the offset and text drawing components to the inner host
			local.add(Transform2DComponent.create("offset"));
	      local.add(VectorText.create("text"));

         // Add components to move and draw the player
         this.add(Transform2DComponent.create("move"));

         // Get the field center point
         var fCenter = MyFirstGame.getFieldBox().getCenter();

         // Position the object
         this.setPosition(fCenter);

         // Set the text of the inner host component
         var t_comp = this.getInnerHost().getComponent("text");
         t_comp.setText("Hello World!");
         t_comp.setColor("red");

			// Set the offset for the text drawing position
			var w2 = this.getInnerHost().getBoundingBox().getHalfWidth();
			this.getInnerHost().getComponent("offset").setPosition(Point2D.create(-w2, 0));

         // Scale the text up a bit
         this.getComponent("move").setScale(2);
      },
		
		/**
		 * Get the inner host object.
		 * @return {HostObject} The inner host object
		 */
		getInnerHost: function() {
			return this.getComponent("host").get("local");	
		},

      /**
       * Update the object within the rendering context.  This calls each of
       * the components to perform their function, drawing and positioning the
       * text on the context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();
         this.base(renderContext, time);
			
			// Get the current rotation of the object and add
         // 24 degrees to it each update
         this.setRotation(this.getRotation() + 24);
			
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
       * Set the rotation angle
       * @param deg {Number} The rotation angle
       */
      setRotation: function(deg) {
         this.getComponent("move").setRotation(deg);
      },
		
		/**
		 * Get the rotation angle from the transform component
		 * @return {Number}
		 */
		getRotation: function() {
			return this.getComponent("move").getRotation();
		}

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string MyObject
       */
      getClassName: function() {
         return "MyObject";
      }
   });

return MyObject;

});
