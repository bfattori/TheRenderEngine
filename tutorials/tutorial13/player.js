// Load all required engine components
R.Engine.define({
   "class": "Player",
   "requires": [
      "R.objects.Object2D",
      "R.engine.Events",
      "R.math.Math2D",

      "R.components.input.Keyboard",
      "R.components.collision.Convex",
      "R.components.render.Sprite",

      "R.collision.ConvexHull"
   ]
});

var Player = function() {
   return R.objects.Object2D.extend({

      moveVec: null,         // The movement vector
      dead: false,         // Dead flag
      hasShields: false,   // The shields flag
      sprites: null,         // The sprites

      constructor: function() {
         this.base("Player");

         // Add the component which handles keyboard input
         this.add(R.components.input.Keyboard.create("input"));

         // Add the component for rendering
         this.sprites = Tutorial13.spriteLoader.exportAll("sprites", ["stand","walk","dead","shield"]);
         this.add(R.components.render.Sprite.create("draw", this.sprites.stand));

         // Add the shield sprite
         this.add(R.components.render.Sprite.create("shield", this.sprites.shield));
         this.hasShields = false;

         // Don't draw the shield, just yet
         this.getComponent("shield").setDrawMode(R.components.Render.NO_DRAW);

         // Set our bounding box so collision tests work
         this.setBoundingBox(this.sprites.stand.getBoundingBox());

         // -------------------------------------------------------------------

         // Add the component for collisions
         this.add(R.components.collision.Convex.create("collide", Tutorial13.collisionModel));

         // Create a collision hull, this is required by the ConvexColliderComponent
         var points = R.math.Math2D.regularPolygon(6, 28);
         for (var i = 0; i < points.length; i++) {
            points[i].add(this.getBoundingBox().getCenter());
         }
         this.setCollisionHull(R.collision.ConvexHull.create(points, 6));

         // Set the collision flags
         this.getComponent("collide").setCollisionMask(Player.COLLISION_MASK);

         // -------------------------------------------------------------------


         // Move the player's origin to the center of the bounding box
         this.setOrigin(this.getBoundingBox().getCenter());

         // Position the object at the center of the playfield
         var start = Tutorial13.getPlayfield().getCenter();
         start.sub(R.math.Point2D.create(25, 25));
         this.setPosition(start);

         // Set the movement vector to zero
         this.moveVec = R.math.Vector2D.create(0, 0);

         // The player isn't dead
         this.dead = false;

         // Set our Z-index over everything else in the scene
         this.setZIndex(100);

         // Wire up events
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

         renderContext.popTransform();
      },

      /**
       * Callback method which is used to respond to collisions.
       *
       * @param collisionObj {BaseObject} The object we've collided with
       * @param time {Number} The time at which the collision occurred
       * @param dt {Number} The time (in milliseconds) since the last frame was drawn
       * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
       */
      onCollide: function(collisionObj, time, dt, targetMask) {
         if (targetMask == Powerup.COLLISION_MASK) {
            // Colliding with a shield powerup.  Do they already have shields?
            if (!this.hasShields) {
               // Remove the powerup and
               // turn on the shields
               collisionObj.destroy();
               this.getComponent("shield").setDrawMode(R.components.Render.DRAW);
               this.hasShields = true;
            } else {
               // Already have shields, stop movement
               var pP = this.getPosition();
               var iV = this.getComponent("collide").getCollisionData().impulseVector;
               pP.add(iV.neg());
               this.setPosition(pP);
            }

            // This was a safe collision, so check for others...
            return R.components.Collider.COLLIDE_AND_CONTINUE;
         }

         if (targetMask == Bomb.COLLISION_MASK) {

            // Does the player have shields?
            if (this.hasShields) {
               // Colliding with a bomb - remove it
               collisionObj.explode();

               // Turn off the shields
               this.getComponent("shield").setDrawMode(R.components.Render.NO_DRAW);
               this.hasShields = false;

               // The player had shields, but maybe they are touching something else
               return R.components.Collider.COLLIDE_AND_CONTINUE;
            } else {
               collisionObj.explode();

               // Deadly bomb, show the skull and crossbones
               this.setSprite("dead");
               this.dead = true;

               // Rotate back to zero
               this.setRotation(0);

               // Stop moving
               this.moveVec.set(R.math.Point2D.ZERO);

               return R.components.Collider.STOP;
            }
         }

         // No collision occurred
         return R.components.Collider.CONTINUE;
      },

      /**
       * Callback method which is lets our object know that existing
       * collisions have stopped.
       *
       * @param collisionObj {BaseObject} The object we've collided with
       * @param time {Number} The time at which the collision occurred
       * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
       */
      onCollideEnd: function(time) {
         // Not colliding anymore
      },

      /**
       * Handle a "keydown" event from the <tt>KeyboardInputComponent</tt>.  We'll use
       * this to determine which yaw angle to apply to the player.  Also, switch the
       * player's sprite to "walk".
       *
       * @param evt {Event} The event object
       * @param charCode {Number} The character code
       */
      onKeyDown: function(evt, charCode) {
         if (this.dead) {
            // Can't move if the player is dead
            return;
         }

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
       * Handle a "keyup" event from the <tt>KeyboardInputComponent</tt>.  This will
       * also switch back to the "stand" sprite for the player.
       *
       * @param evt {Event} The event object
       * @param charCode {Number} The character code
       */
      onKeyUp: function(evt, charCode) {
         if (this.dead) {
            // Can't move if the player is dead
            return;
         }

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
         if (this.moveVec.isZero()) {
            return;
         }

         var pos = this.getPosition();

         // Determine if we hit a "wall" of our playfield
         var playfield = Tutorial13.getPlayfield();
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
      },

      COLLISION_MASK: R.lang.Math2.parseBin("11")
   });

};