// Load the components and engine objects
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/components/component.keyboardinput.js");
R.Engine.requires("/engine.object2d.js");

// ### ADD THIS ###
R.Engine.requires("/components/component.vector2d.js");


R.Engine.initObject("GameObject", "Object2D", function() {

   var GameObject = Object2D.extend({

      // The width of the object
      width: 50,           // The width of the object
      height: 50,          // The height of the object
      color: "#ffff00",    // The color of the object
      moveVec: null,       // The movement vector
      shape: null,         // Our object's shape

      constructor: function() {
         this.base("GameObject");

         // Add the component to move the object
         this.add(Transform2DComponent.create("move"));
         
         // Add the component which handles keyboard input
         this.add(KeyboardInputComponent.create("input"));

         // ### ADD THIS ###
         // Add the component which draws the object
         this.add(Vector2DComponent.create("draw"));

         // Start at the center of the playfield
         var start = Tutorial6.getFieldBox().getCenter();
         
         // ### ADD THIS ###
         // Set our object's shape
         var c_draw = this.getComponent("draw");
         var shape = [[-4,-1], [-1,-1], [0,-5], [1,-1], [4,-1], [1,1],
               [4,4], [0,2], [-4,4], [-1,1]];
         
         // Scale the shape
         var s = [];
         for (var p = 0; p < shape.length; p++)
         {
            var pt = Point2D.create(shape[p][0], shape[p][1]);
            pt.mul(8);
            s.push(pt);
         }
         
         c_draw.setPoints(s);
         c_draw.setLineWidth(1.0);
         c_draw.setLineStyle(this.color);
         c_draw.setClosed(true);
         
         // Position the object
         this.setPosition(start);
			
			// Set the bounding box
			this.setBoundingBox(c_draw.getBoundingBox());
			this.setOrigin(c_draw.getBoundingBox().getCenter());
         
         // Set the velocity to zero
         this.moveVec = Vector2D.create(0,0);
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
         
         // Move the object, according to the keyboard
         this.move();

         // The the "update" method of the super class
         this.base(renderContext, time);
         
         renderContext.popTransform();
      },
      
      /**
       * Handle a "keydown" event from the <tt>KeyboardInputComponent</tt>.
       * @param charCode {Number} Unused
       * @param keyCode {Number} The key which was pressed down.
       */
      onKeyDown: function(charCode, keyCode) {
         switch (charCode) {
            case EventEngine.KEYCODE_LEFT_ARROW:
               this.moveVec.setX(-4);
               break;
            case EventEngine.KEYCODE_RIGHT_ARROW:
               this.moveVec.setX(4);
               break;
            case EventEngine.KEYCODE_UP_ARROW:
               this.moveVec.setY(-4);
               break;
            case EventEngine.KEYCODE_DOWN_ARROW:
               this.moveVec.setY(4);
               break;
         }
         return false;
      },
      
      /**
       * Handle a "keyup" event from the <tt>KeyboardInputComponent</tt>.
       * @param charCode {Number} Unused
       * @param keyCode {Number} The key which was released
       */
      onKeyUp: function(charCode, keyCode) {
         switch (charCode) {
            case EventEngine.KEYCODE_LEFT_ARROW:
            case EventEngine.KEYCODE_RIGHT_ARROW:
               this.moveVec.setX(0);
               break;
            case EventEngine.KEYCODE_UP_ARROW:
            case EventEngine.KEYCODE_DOWN_ARROW:
               this.moveVec.setY(0);
               break;
         }
         return false;
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

         // Determine if we hit a "wall" of our playfield
         var fieldBox = Tutorial6.getFieldBox().get();
         if ((pos.x + this.width > fieldBox.r) || (pos.x < 0)) {
            // Stop X movement and back off
            this.moveVec.setX(0);
            if (pos.x + this.width > fieldBox.r) {
               pos.setX(fieldBox.r - this.width - 1);
            }
            if (pos.x < 0) {
               pos.setX(1);
            }
         }  
         if ((pos.y + this.height > fieldBox.b) || (pos.y < 0)) {
            // Stop Y movement and back off
            this.moveVec.setY(0);
            if (pos.y + this.height > fieldBox.b) {
               pos.setY(fieldBox.b - this.height - 1);
            }
            if (pos.y < 0) {
               pos.setY(1);
            }
         }

         pos.add(this.moveVec);
         this.setPosition(pos);
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
