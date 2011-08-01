// Load all required engine components
R.Engine.define({
	"class": "Player",
	"requires": [
		"R.engine.Object2D",
      "R.engine.Events",
      "R.math.Math2D",

      "R.components.input.Keyboard",
      "R.components.collision.Box",
      "R.components.render.Sprite"
	]
});

var Player = function() {
   return R.engine.Object2D.extend({

      moveVec: null,			// The movement vector
      sprites: null,			// A container for the sprites

      constructor: function() {
         this.base("Player");

         // Add the component which handles keyboard input
         this.add(R.components.input.Keyboard.create("input"));

         // Add the component for rendering
         this.sprites = Tutorial8.spriteLoader.exportAll("sprites");
         this.add(R.components.render.Sprite.create("draw", this.sprites.stand));

         // Start at the center of the playfield
         var start = Tutorial8.getFieldRect().getCenter();
         start.sub(R.math.Point2D.create(25, 25));

         // Position the object
         this.setPosition(start);

         // Set the velocity to zero and a heading angle
         this.moveVec = R.math.Vector2D.create(0,0);

         // Set our bounding box so collision tests work
         this.setBoundingBox(this.sprites.stand.getBoundingBox());

         // Move the player's origin to the center of the bounding box
         this.setOrigin(this.getBoundingBox().getCenter());

         // Wire event handlers
         this.addEvents(["onKeyDown", "onKeyUp"]);
      },

      /**
       * Destroy the sprites
       */
      destroy: function() {
         for (var s in this.sprites) {
            this.sprites[s].destroy();
         }
         this.sprites = null;
         this.base();
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

         renderContext.popTransform();
      },

      /**
       * Handle a "keydown" event from <tt>R.components.input.Keyboard</tt>.  We'll use
       * this to determine which yaw angle to apply to the player.  Also, switch the
       * player's sprite to "walk".
       *
       * @param evt {Event} The event object
       * @param charCode {Number} The character code
       */
      onKeyDown: function(evt, charCode) {
         switch (charCode) {
            case R.engine.Events.KEYCODE_LEFT_ARROW:
               this.setSprite("walk");
               this.setRotation(180);
               this.moveVec.setX(-4);
               break;
            case R.engine.Events.KEYCODE_RIGHT_ARROW:
               this.setSprite("walk");
               this.setRotation(0);
               this.moveVec.setX(4);
               break;
            case R.engine.Events.KEYCODE_UP_ARROW:
               this.setSprite("walk");
               this.setRotation(270);
               this.moveVec.setY(-4);
               break;
            case R.engine.Events.KEYCODE_DOWN_ARROW:
               this.setSprite("walk");
               this.setRotation(90);
               this.moveVec.setY(4);
               break;
         }
         return false;
      },

      /**
       * Handle a "keyup" event from <tt>R.components.input.Keyboard</tt>.  This will
       * also switch back to the "stand" sprite for the player.
       *
       * @param evt {Event} The event object
       * @param charCode {Number} The character code
       */
      onKeyUp: function(evt, charCode) {
         switch (charCode) {
            case R.engine.Events.KEYCODE_LEFT_ARROW:
            case R.engine.Events.KEYCODE_RIGHT_ARROW:
               this.setSprite("stand");
               this.moveVec.setX(0);
               break;
            case R.engine.Events.KEYCODE_UP_ARROW:
            case R.engine.Events.KEYCODE_DOWN_ARROW:
               this.setSprite("stand");
               this.moveVec.setY(0);
               break;
         }
         return false;
      },

      /**
       * Set the sprite used to draw the component on the render component
       * @param spriteName {String} The name of the sprite
       */
      setSprite: function(spriteName) {
         this.getComponent("draw").setSprite(this.sprites[spriteName]);
      },

      /**
       * Calculate and perform a move for our object.  We'll use
       * the field dimensions from our playfield to determine when to
       * "bounce".
       */
      move: function() {
         var pos = this.getPosition();

         // Determine if we hit a "wall" of our playfield
         var playfield = Tutorial8.getFieldRect().get();

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
       * @return {String} The string GameObject
       */
      getClassName: function() {
         return "Player";
      }
   });
};
