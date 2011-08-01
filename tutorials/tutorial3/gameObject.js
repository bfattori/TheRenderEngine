// Load all required engine components
R.Engine.define({
	"class": "GameObject",
	"requires": [
		"R.engine.Object2D",
      "R.math.Math2D",
      "R.engine.Events",

      "R.components.input.Keyboard"
	]
});

var GameObject = function() {
   return R.engine.Object2D.extend({

      // The width of the object
      width: 50,				// The width of the object
      height: 50,				// The height of the object
      color: "#ffff00",		// The color of the object
      moveVec: null,			// The movement vector
      shape: null,			// Our object's shape

      constructor: function() {
         this.base("GameObject");

         // Add the component which handles keyboard input
         this.add(R.components.input.Keyboard.create("input"));

         // Set our object's shape
         this.shape = R.math.Rectangle2D.create(0, 0, 50, 50);

         // Start at the center of the playfield
         var start = Tutorial3.getFieldRect().getCenter();
         start.sub(R.math.Point2D.create(25, 25));

         // Position the object
         this.setPosition(start);

         // Set the velocity to zero
         this.moveVec = R.math.Vector2D.create(0,0);

         // Set event handlers
         this.addEvents({
            "keydown": function(evt, which) {
               this.onKeyDown(which);
            },
            "keyup": function(evt, which) {
               this.onKeyUp(which);
            }
         });
      },

      /**
       * Update the object within the rendering context.  This calls the transform
       * components to position the object on the playfield.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();

         // The the "update" method of the super class
         this.base(renderContext, time);

         // Move the object, according to the keyboard
         this.move();

         // Draw the object on the render context
         this.draw(renderContext);

         renderContext.popTransform();
      },

      /**
       * Handle a "keydown" event from <tt>R.components.input.Keyboard</tt>.
       * @param charCode {Number} The character code
       */
      onKeyDown: function(charCode) {
         switch (charCode) {
            case R.engine.Events.KEYCODE_LEFT_ARROW:
               this.moveVec.setX(-4);
               break;
            case R.engine.Events.KEYCODE_RIGHT_ARROW:
               this.moveVec.setX(4);
               break;
            case R.engine.Events.KEYCODE_UP_ARROW:
               this.moveVec.setY(-4);
               break;
            case R.engine.Events.KEYCODE_DOWN_ARROW:
               this.moveVec.setY(4);
               break;
         }
         return false;
      },

      /**
       * Handle a "keyup" event from <tt>R.components.input.Keyboard</tt>.
       * @param charCode {Number} The character code
       */
      onKeyUp: function(charCode) {
         switch (charCode) {
            case R.engine.Events.KEYCODE_LEFT_ARROW:
            case R.engine.Events.KEYCODE_RIGHT_ARROW:
               this.moveVec.setX(0);
               break;
            case R.engine.Events.KEYCODE_UP_ARROW:
            case R.engine.Events.KEYCODE_DOWN_ARROW:
               this.moveVec.setY(0);
               break;
         }
         return false;
      },

      /**
       * Calculate and perform a move for our object.  We'll use
       * the field dimensions from our playfield to determine when to
       * "bounce".
       */
      move: function() {
         var pos = this.getPosition();

         // Determine if we hit a "wall" of our playfield
         var playfield = Tutorial3.getFieldRect();

         if ((pos.x + this.width > playfield.r) || (pos.x < 0)) {
            // Stop X movement and back off
            this.moveVec.setX(0);
            if (pos.x + this.width > playfield.r) {
               pos.setX(playfield.r - this.width - 1);
            }
            if (pos.x < 0) {
               pos.setX(1);
            }
         }
         if ((pos.y + this.height > playfield.b) || (pos.y < 0)) {
            // Stop Y movement and back off
            this.moveVec.setY(0);
            if (pos.y + this.height > playfield.b) {
               pos.setY(playfield.b - this.height - 1);
            }
            if (pos.y < 0) {
               pos.setY(1);
            }
         }

         pos.add(this.moveVec);
         this.setPosition(pos);
      },

      /**
       * Draw our game object onto the specified render context.
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to draw onto
       */
      draw: function(renderContext) {
         // Generate a rectangle to represent our object
         var pos = this.getPosition();

         // Set the color to draw with
         renderContext.setFillStyle("#ffff00");
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
};
