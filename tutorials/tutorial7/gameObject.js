// Load all required engine components
R.Engine.define({
	"class": "GameObject",
	"requires": [
		"R.engine.Object2D",
      "R.math.Math2D",
      "R.engine.Events",

      "R.components.input.Keyboard",
      "R.components.collision.Box"
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

         // Add the component for collisions
         this.add(R.components.collision.Box.create("collide", Tutorial7.collisionModel));

         // Set the collision flags
         this.getComponent("collide").setCollisionMask(R.lang.Math2.parseBin("01"));

         // Start at the center of the playfield
         var start = Tutorial7.getFieldRect().getCenter();
         start.sub(R.math.Point2D.create(25, 25));

         // Set our object's shape
         this.shape = R.math.Rectangle2D.create(0, 0, this.width, this.height);

         // Position the object
         this.setPosition(start);

         // Set the velocity to zero
         this.moveVec = R.math.Vector2D.create(0,0);

         // Set our bounding box so collision tests work
         this.setBoundingBox(this.shape);

         // Wire up event handlers
         this.addEvents(["onKeyDown", "onKeyUp"]);
      },

      /**
       * Update the object within the rendering context.  This calls the transform
       * components to position the object on the playfield.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The time (in milliseconds) since the last frame was drawn
       */
      update: function(renderContext, time, dt) {
         renderContext.pushTransform();

         // The the "update" method of the super class
         this.base(renderContext, time, dt);

         // Move the object, according to the keyboard
         this.move();

         // Draw the object on the render context
         this.draw(renderContext);

         renderContext.popTransform();
      },

      /**
       * Callback method which is used to respond to collisions.
       *
       * @param collisionObj {R.engine.BaseObject} The object we've collided with
       * @param time {Number} The time at which the collision occurred
       * @param dt {Number} The time (in milliseconds) since the last frame was drawn
       * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
       */
      onCollide: function(collisionObj, time, dt, targetMask) {
         if (targetMask == 3) {
            // Colliding with a "red" box
            this.color = "#0000ff";
            return R.components.Collider.STOP;
         }

         return R.components.Collider.CONTINUE;
      },

      /**
       * Callback method which is lets our object know that existing
       * collisions have stopped.
       *
       * @param collisionObj {R.engine.BaseObject} The object we've collided with
       * @param time {Number} The time at which the collision occurred
       * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
       */
      onCollideEnd: function(time) {
         // Not colliding anymore
         this.color = "#ffff00";
      },

      /**
       * Handle a "keydown" event from <tt>R.components.input.Keyboard</tt>.
       * @param evt {Event} The event object
       * @param charCode {Number} The character code
       */
      onKeyDown: function(evt, charCode) {
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
       * Handle a "keyup" event from the <tt>R.components.input.Keyboard</tt>.
       * @param evt {Event} The event object
       * @param charCode {Number} The character code
       */
      onKeyUp: function(evt, charCode) {
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
         var playfield = Tutorial7.getFieldRect();

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
         // Set the color to draw with
         renderContext.setFillStyle(this.color);
         renderContext.drawFilledRectangle(this.shape);
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string GameObject
       */
      getClassName: function() {
         return "GameObject";
      }
   });
};
