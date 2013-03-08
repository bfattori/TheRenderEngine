// Load all required engine components
R.Engine.define({
	"class": "StarObject",
	"requires": [
		"R.objects.Object2D",
      "R.math.Math2D",
      "R.engine.Events",

      "R.components.input.Keyboard",
      "R.components.render.Vector2D"
	]
});

var StarObject = function() {
   return R.objects.Object2D.extend({

      // The width of the object
      width: 50,           // The width of the object
      height: 50,          // The height of the object
      color: "#ffff00",    // The color of the object
      moveVec: null,       // The movement vector
      shape: null,         // Our object's shape

      constructor: function() {
         this.base("StarObject");

         // Add the component which handles keyboard input
         this.add(R.components.input.Keyboard.create("input"));

         // Add the component which draws the object
         this.add(R.components.render.Vector2D.create("draw"));

         // Start at the center of the playfield
         var start = Tutorial4.getFieldRect().getCenter();

         // Set our object's shape
         var c_draw = this.getComponent("draw"),
             shape = [[-4,-1], [-1,-1], [0,-5], [1,-1], [4,-1], [1,1],
                      [3,5], [0,2.5], [-3,5], [-1,1]];

         // Scale up the shape
         var s = [];
         for (var p = 0; p < shape.length; p++)
         {
            var pt = R.math.Point2D.create(shape[p][0], shape[p][1]);
            pt.mul(8);
            s.push(pt);
         }

         c_draw.setPoints(s);
         c_draw.setLineWidth(2.0);
         c_draw.setLineStyle(this.color);
         c_draw.setClosed(true);

         // Position the object
         this.setPosition(start);

         // Set the bounding box
         this.setBoundingBox(c_draw.getBoundingBox());
         this.setOrigin(c_draw.getBoundingBox().getCenter());

         // Set the velocity to zero
         this.moveVec = R.math.Vector2D.create(0,0);

         // Wire up events
         this.addEvents(["onKeyDown", "onKeyUp"]);
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

         // Move the object, according to the keyboard
         this.move();

         // The the "update" method of the super class
         this.base(renderContext, time);

         renderContext.popTransform();
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
       * Handle a "keyup" event from <tt>R.components.input.Keyboard</tt>.
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
         var playfield = Tutorial4.getFieldRect();

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
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string MyObject
       */
      getClassName: function() {
         return "StarObject";
      }
   });
};
