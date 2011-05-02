/**
 * The Render Engine
 * Example Game: Spaceroids - an Asteroids clone
 *
 * The player object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1572 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

R.Engine.define({
   "class": "SpaceroidsPlayer",
   "requires": [
      "R.components.transform.Mover2D",
      "R.components.render.Vector2D",
      "R.components.input.Keyboard",
      "R.components.collision.Convex",
      "R.engine.Object2D",
      "R.struct.Container",
      "R.math.Math2D",
      "R.engine.Events"
   ]
});

/**
 * @class The player object.  Creates the player and assigns the
 *        components which handle collision, drawing, drawing the thrust
 *        and moving the object.
 */
var SpaceroidsPlayer = function() {
   return R.engine.Object2D.extend({

      size: 4,
      rotDir: 0,
      thrusting: false,
      bullets: 0,
      players: 3,
      alive: false,
      playerShape: null,
      nukes: null,
      nuking: null,

      rec: false,

      constructor: function() {
         this.base("Player", R.components.transform.Mover2D.create("move"));
         this.rec = false;

         // Add components to draw the player and perform input
         this.add(R.components.input.Keyboard.create("input"));

         if (Spaceroids.rec) {
            this.getComponent("input").startRecording();
         }

         // Add the drawing components for ship and thrust
         this.add(R.components.render.Vector2D.create("draw"));
         this.add(R.components.render.Vector2D.create("thrust"));

         // Set up collision component (convex hull [SAT])
         this.add(R.components.collision.Convex.create("collider", Spaceroids.collisionModel));
         this.getComponent("collider").setCollisionMask(SpaceroidsPlayer.COLLISION_MASK);

         this.players--;

         this.alive = true;
         this.rotDir = 0;
         this.thrusting = false;
         this.getComponent("move").setCheckRestState(false);
         this.getComponent("move").setCheckLag(false);
         this.nukes = 0;	// Have to earn your nukes
         this.nuking = false;
         this.setZIndex(1);
      },

      destroy: function() {
         Spaceroids.collisionModel.removeObject(this);
         this.base();
      },

      release: function() {
         this.base();
         this.size = 4;
         this.rotDir = 0;
         this.thrusting = false;
         this.bullets = 0;
         this.players = 3;
         this.alive = false;
         this.playerShape = null;
         this.nukes = null;
         this.nuking = null;
      },

      /**
       * Update the player within the rendering context.  This draws
       * the shape to the context, after updating the transform of the
       * object.  If the player is thrusting, draw the thrust flame
       * under the ship.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      update: function(renderContext, time, dt) {
         var c_mover = this.getComponent("move");
         var p = R.math.Point2D.create(c_mover.getPosition());
         c_mover.setPosition(Spaceroids.wrap(p, this.getBoundingBox()));
         c_mover.setRotation(c_mover.getRotation() + this.rotDir);
         p.destroy();

         if (this.thrusting) {
            var r = c_mover.getRotation();
            var dir = R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, r);

            c_mover.setAcceleration(dir.mul(0.1));

            // Particle trail
            var inv = R.math.Point2D.create(this.getPosition()).add(dir.neg().mul(1.5));
            var colr = SpaceroidsPlayer.TRAIL_COLORS[Math.floor(R.lang.Math2.random() * 3)];
            Spaceroids.pEngine.addParticle(TrailParticle.create(inv, this.getRotation(), 20, colr, 600));
            inv.destroy();
            dir.destroy();
         } else {
            c_mover.setAcceleration(R.math.Point2D.ZERO);
         }

         renderContext.pushTransform();
         this.base(renderContext, time, dt);
         renderContext.popTransform();

         // Draw the remaining lives
         renderContext.setLineStyle("white");
         var posX = 170;
         for (var l = 0; l <= this.players; l++) {
            renderContext.pushTransform();
            renderContext.setScale(0.7);
            var dp = R.math.Point2D.create(posX, 60);
            renderContext.setPosition(dp);
            renderContext.drawPolygon(this.playerShape);
            renderContext.popTransform();
            posX -= 20;
            dp.destroy();
         }

         // If they have nukes, draw them too
         if (this.nukes > 0) {
            renderContext.pushTransform();
            renderContext.setLineStyle("yellow");
            var dr = R.math.Rectangle2D.create(70, 35, 6, 6);
            for (var n = 0; n < this.nukes; n++) {
               renderContext.drawRectangle(dr);
               dr.offset(-8, 0);
            }
            renderContext.popTransform();
            dr.destroy();
         }
      },

      /**
       * Set up the player object on the playfield.  The width and
       * heigh of the playfield are used to determine the center point
       * where the player starts.
       *
       * @param pWidth {Number} The width of the playfield in pixels
       * @param pHeight {Number} The height of the playfield in pixels
       */
      setup: function() {

         // Randomize the position and velocity
         var c_mover = this.getComponent("move");
         var c_draw = this.getComponent("draw");
         var c_thrust = this.getComponent("thrust");

         // The player shapes
         var shape = SpaceroidsPlayer.points;

         // Scale the shape
         var s = [];
         for (var p = 0; p < shape.length; p++) {
            var pt = R.math.Point2D.create(shape[p][0], shape[p][1]);
            pt.mul(this.size);
            s.push(pt);
         }

         // Assign the shape to the vector component
         c_draw.setPoints(s);
         c_draw.setLineStyle("white");

         this.setOrigin(c_draw.getCenter());
         this.setCollisionHull(c_draw.getConvexHull());
         this.setBoundingBox(c_draw.getBoundingBox());

         // Save the shape so we can draw lives remaining
         this.playerShape = s;

         var thrust = SpaceroidsPlayer.thrust;
         s = [];
         for (var p = 0; p < thrust.length; p++) {
            var pt = R.math.Point2D.create(thrust[p][0], thrust[p][1]);
            pt.mul(this.size);
            s.push(pt);
         }
         c_thrust.setPoints(s);
         c_thrust.setLineStyle("white");
         c_thrust.setClosed(false);
         c_thrust.setDrawMode(R.components.Render.NO_DRAW);

         // Put us in the middle of the playfield
         c_mover.setPosition(Spaceroids.renderContext.getBoundingBox().getCenter());
         c_mover.setVelocityDecay(0.03);
      },

      /**
       * Called when the player shoots a bullet to create a bullet
       * in the playfield and keep track of the active number of bullets.
       */
      shoot: function() {
         var b = SpaceroidsBullet.create(this);
         this.getRenderContext().add(b);
         this.bullets++;
         Spaceroids.soundLoader.get("shoot").play({volume: 15});
      },

      /**
       * Called when a bullet collides with another object or leaves
       * the playfield so the player can fire more bullets.
       */
      removeBullet: function() {
         // Clean up
         this.bullets--;
      },

      /**
       * Called after a player has been killed.  If the node where the player
       * was last located does not contain any objects, the player will respawn.
       * Otherwise, the routine will wait until the area is clear to respawn
       * the player.
       */
      respawn: function() {
         // Are there rocks in our area?
         if (this.getComponent("collider").getSpatialNode()) {
            if (this.getComponent("collider").getSpatialNode().getObjects().size() > 1) {
               // There's something around us, hold off...
               var pl = this;
               R.lang.OneShotTimeout.create("respawn", 250, function() {
                  pl.respawn();
               });
               return;
            }
         }

         // Nothing in the vicinity, go ahead...
         this.getComponent("draw").setDrawMode(R.components.Render.DRAW);
         this.alive = true;
      },

      /**
       * Returns the state of the player object.
       * @type Boolean
       */
      isAlive: function() {
         return this.alive;
      },

      /**
       * Kills the player, creating the particle explosion and removing a
       * life from the extra lives.  Afterwards, it determines if the
       * player can respawn (any lives left) and either calls the
       * respawn method or signals that the game is over.
       */
      kill: function() {
         this.alive = false;

         this.getComponent("draw").setDrawMode(R.components.Render.NO_DRAW);
         this.getComponent("thrust").setDrawMode(R.components.Render.NO_DRAW);
         Spaceroids.soundLoader.get("thrust").stop();

         // Make some particles
         var p = R.struct.Container.create();
         for (var x = 0; x < SpaceroidsPlayer.KILL_PARTICLES; x++) {
            p.add(TrailParticle.create(this.getPosition(), this.getRotation(), 45, "#ffffaa", 2000));
            p.add(SimpleParticle.create(this.getPosition(), 3000));
         }
         Spaceroids.pEngine.addParticles(p);

         // Reset the player so we can respawn
         this.getComponent("move").setVelocity(R.math.Point2D.ZERO);
         this.getComponent("move").setPosition(Spaceroids.renderContext.getBoundingBox().getCenter());
         this.getComponent("move").setRotation(0);
         this.rotDir = 0;
         this.thrusting = false;

         // Play the explosion sound
         Spaceroids.soundLoader.get("death").play({volume: 80});

         // Remove one of the players
         if (this.players-- > 0) {
            // Set a timer to spawn another player
            var pl = this;
            R.lang.OneShotTimeout.create("respawn", 3000, function() {
               pl.respawn();
            });
         } else {
            // No more players, game over
            Spaceroids.gameOver();
         }

      },

      /**
       * Randomly jump the player somewhere when they get into a tight spot.
       * The point is NOT guaranteed to be free of a collision.
       */
      hyperSpace: function() {

         if (this.hyperjump) {
            // Prevent hyperjumping while already hyperjumping (duh)
            return;
         }

         // Hide the player
         this.alive = false;
         this.getComponent("thrust").setDrawMode(R.components.Render.NO_DRAW);
         Spaceroids.soundLoader.get("thrust").stop();
         this.thrusting = false;
         this.hyperjump = true;

         var self = this;
         OneShotTrigger.create("hyper", 250, function() {
            self.getComponent("draw").setDrawMode(R.components.Render.NO_DRAW);
         }, 10, function() {
            self.setScale(self.getScale() - 0.09);
         });

         // Give it some time and move the player somewhere random
         R.lang.OneShotTimeout.create("hyperspace", 800, function() {
            self.getComponent("move").setVelocity(Point2D.ZERO);
            var randPt = R.math.Math2D.randomPoint(Spaceroids.renderContext.getBoundingBox());
            self.getComponent("move").setPosition(randPt);
            self.setScale(1);
            self.getComponent("draw").setDrawMode(R.components.Render.DRAW);
            self.alive = true;
            self.hyperjump = false;
            randPt.destroy();
         });
      },

      /**
       * Returns true if the player has initiated their nuke
       */
      isNuking: function() {
         return this.nuking;
      },

      /**
       * Nuke everything on the screen, causing any rocks to split if they
       * are above the smallest size.
       */
      nuke: function() {
         if (this.nukes-- <= 0 || this.nuking) {
            return;
         }

         // Add a shield of protection around the player and
         // cause the nearby rocks to gravitate toward the player
         this.nuking = true;

         // Get all of the asteroids and adjust their direction
         // So they are pulled toward the player gradually
         var self = this;

         // Make some particles for the effect
         var t = R.lang.MultiTimeout.create("particles", 3, 280, function(rep) {
            var n = R.struct.Container.create();
            for (var x = 0; x < 60; x++) {
               n.add(TrailParticle.create(self.getPosition(), self.getRotation(), 350, SpaceroidsPlayer.NUKE_COLORS[rep], 1500));
            }
            Spaceroids.pEngine.addParticles(n);
         });

         // Timing is everything
         var t = R.lang.Timeout.create("nukerocks", 850, function() {
            this.destroy();

            var rocks = Spaceroids.collisionModel.getObjectsOfType(SpaceroidsRock);
            rocks.forEach(function(r) {
               r.kill();
            });
            rocks.destroy();

            self.nuking = false;
         });

      },

      /**
       * Called by the keyboard input component to handle a key down event.
       *
       * @param event {Event} The event object
       */
      onKeyDown: function(charCode, keyCode, ctrlKey, altKey, shiftKey, event) {
         if (!this.alive) {
            return;
         }

         if (event.keyCode == R.engine.Events.keyCodeForChar("a")) {
            this.hyperSpace();
         }

         if (event.keyCode == R.engine.Events.keyCodeForChar("z")) {
            if (this.bullets < 5) {
               this.shoot();
            }
         }

         switch (event.keyCode) {
            case R.engine.Events.KEYCODE_LEFT_ARROW:
               this.rotDir = -3;
               break;
            case R.engine.Events.KEYCODE_RIGHT_ARROW:
               this.rotDir = 3;
               break;
            case R.engine.Events.KEYCODE_UP_ARROW:
               this.getComponent("thrust").setDrawMode(R.components.Render.DRAW);
               if (!this.thrusting) {
                  Spaceroids.soundLoader.get("thrust").play({volume: 30});
               }
               this.thrusting = true;
               break;
            case R.engine.Events.KEYCODE_ENTER:
               this.nuke();
               break;
         }

         return false;
      },

      /**
       * Called by the keyboard input component to handle a key up event.
       *
       * @param event {Event} The event object
       */
      onKeyUp: function(charCode, keyCode, ctrlKey, altKey, shiftKey, event) {
         if (!this.alive) {
            return;
         }

         switch (event.keyCode) {
            case R.engine.Events.KEYCODE_LEFT_ARROW:
            case R.engine.Events.KEYCODE_RIGHT_ARROW:
               this.rotDir = 0;
               break;
            case R.engine.Events.KEYCODE_UP_ARROW:
               this.getComponent("thrust").setDrawMode(R.components.Render.NO_DRAW);
               this.thrusting = false;
               Spaceroids.soundLoader.get("thrust").stop();
               break;

         }

         return false;
      }

   }, { // Static

      /**
       * Get the class name of this object
       *
       * @type String
       */
      getClassName: function() {
         return "SpaceroidsPlayer";
      },

      /** The player shape
       * @private
       */
      points: [
         [-2,  2],
         [0, -3],
         [ 2,  2],
         [ 0, 1]
      ],

      /** The player's thrust shape
       * @private
       */
      thrust: [
         [-1,  2],
         [0,  3],
         [ 1,  2]
      ],


      TRAIL_COLORS: ["red", "orange", "yellow", "white", "lime"],
      NUKE_COLORS: ["#1111ff", "#8833ff", "#ffff00"],
      KILL_PARTICLES: 40,

      COLLISION_MASK: R.lang.Math2.parseBin("010")

   });
};