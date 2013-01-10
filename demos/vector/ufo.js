/**
 * The Render Engine
 * Example Game: Spaceroids - an Asteroids clone
 *
 * The UFO object (both big and small)
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
   "class": "SpaceroidsUFO",
   "requires": [
      "R.components.transform.Mover2D",
      "R.components.render.Vector2D",
      "R.components.collision.Convex",
      "R.objects.Object2D"
   ]
});

/**
 * @class The UFO object.  Creates both the large and small
 *    UFO.  The smaller one fires at a faster rater,
 *    moves quicker, and will avoid collisions with asteroids.
 */
var SpaceroidsUFO = function() {
   return R.objects.Object2D.extend({

      isSmall: false,
      alive: false,
      shape: null,

      constructor: function() {
         this.base("UFO", R.components.transform.Mover2D.create("move"));

         // Add the drawing components for ship and thrust
         this.add(R.components.render.Vector2D.create("draw"));

         // Set up collision component (convex hull [SAT])
         this.add(R.components.collision.Convex.create("collider", Spaceroids.collisionModel));
         this.getComponent("collider").setCollisionMask(SpaceroidsUFO.COLLISION_MASK);
         this.alive = true;
         this.setZIndex(1);
      },

      destroy: function() {
         Spaceroids.collisionModel.removeObject(this);
         this.base();
      },

      release: function() {
         this.base();
         this.isSmall = false;
         this.alive = false;
         this.shape = null;
      },

      /**
       * Update the ufo within the rendering context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      update: function(renderContext, time, dt) {
         renderContext.pushTransform();
         this.move(time, dt);
         this.base(renderContext, time, dt);
         renderContext.popTransform();
      },

      /**
       * Set up the UFO object on the playfield.  The UFO always
       * starts from either the left or right side of the playfield
       * @param isSmall {Boolean} If <code>true</code> the UFO will be the
       *    smaller, more "intelligent" one.
       */
      setup: function(isSmall) {
         this.isSmall = isSmall;

         // Set the position and velocity
         var c_mover = this.getComponent("move");
         var c_draw = this.getComponent("draw");

         // The UFO shape
         var shape = SpaceroidsUFO.points;

         // Scale the shape
         var s = [];
         for (var p = 0; p < shape.length; p++) {
            var pt = R.math.Point2D.create(shape[p][0], shape[p][1]);
            pt.mul(isSmall ? 4 : 10);
            s.push(pt);
         }

         // Assign the shape to the vector component
         c_draw.setPoints(s);
         c_draw.setLineStyle("white");

         this.setOrigin(c_draw.getCenter());
         this.setCollisionHull(c_draw.getConvexHull());
         this.setBoundingBox(c_draw.getBoundingBox());

         // Save the shape so we can draw lives remaining
         this.shape = s;

         // Pick a side to start on
         var pick = R.lang.Math2.randomRange(0, 100, true);
         var startX = pick < 50 ? 0 - (this.getBoundingBox().w + 3) : Spaceroids.renderContext.getViewport().w + 3,
             startY;

         // Test the collision nodes along the side chosen and look for an open one to enter at
         var cm = Spaceroids.collisionModel, cells = [], divs = cm.getDivisions(), x, y;
         x = pick < 50 ? 0 : divs - 1;
         for (y = 0; y < divs; y++) {
            cells.push(cm.getNode(x, y));
         }

         var cell;
         for (var itr = R.lang.Iterator.create(cells); itr.hasNext(); ) {
            cell = itr.next();
            if (cell.getCount() == 0) {
               break;
            } else {
               cell = null;
            }
         }

         if (cell) {
            startY = cell.getRect().getCenter().y;
            var stepX = pick < 50 ? 1 : -1, stepY = pick > 50 ? 1 : -1,
                spd = (isSmall ? 2 : 1) * stepX,
                yvel = (isSmall ? 2 : 1) * stepY;
            c_mover.setPosition(startX, startY);
            c_mover.setVelocity(spd, 0);
         }
      },

      /**
       * Both UFOs move in the same way, but the velocity of the smaller UFO
       * allows it to adapt more quickly to avoid hitting asteroids.
       * @param time
       * @param dt
       */
      move: function(time, dt) {
         var c_mover = this.getComponent("move"), cm = Spaceroids.collisionModel,
             testFn = function(obj) {
                // Testing function to only return asteroids
                var mask = Spaceroids.collisionModel.getObjectSpatialData(obj, "collisionMask");
                return (mask == SpaceroidsRock.COLLISION_MASK);
             };

         // Cast a ray in the direction of movement
         var dir = R.math.Vector2D.create(c_mover.getVelocity()).normalize(),
             ray = R.math.Vector2D.create(dir).mul(250),
             collision = cm.castRay(c_mover.getPosition(), ray, testFn, Spaceroids.renderContext);

         if (collision != null) {
            // There's a rock in our path, avoid it.
            var diff = R.math.Vector2D.create(c_mover.getPosition()).sub(collision.shape1.getPosition()),
                dist = collision.impulseVector.sub(c_mover.getPosition()).len();

            if (dist < collision.shape1.getCollisionHull().getRadius() + 80) {
               var force = R.math.Vector2D.create(dir).rightNormal().mul(diff.perProduct(dir)).mul(0.5);
               c_mover.getVelocity().add(force);
               force.destroy();
            }

            diff.destroy();
            collision.destroy();
         }

         dir.destroy();
         ray.destroy();
      },

      /**
       * Called to determine if the UFO can see the player and shoot at it.
       * For the smaller UFO, the player's direction of travel and speed are
       * used to shoot at a point where the bullet would intercept the player.
       */
      shoot: function() {
         // Determine if we can see the player

         // If we can, shoot at them.  If we're the small UFO, we
         // need to adjust for their vector of motion
         // to try to intercept them.  The big UFO just shoots blindly.
         var b = SpaceroidsBullet.create(this);
         this.getRenderContext().add(b);
         Spaceroids.soundLoader.get("shoot").play({volume: 10});

         // If we launch a shot, we have to wait for a bit before shooting again

      },

      /**
       * Called when a bullet collides with another object or leaves
       * the playfield so the player can fire more bullets.
       */
      removeBullet: function() {
         // Clean up
         //this.bullets--;
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
         Spaceroids.soundLoader.get("ufo" + this.size == 4 ? "small" : "big").stop();

         // Make some particles
         var p = R.struct.Container.create();
         for (var x = 0; x < 12; x++) {
            p.add(SimpleParticle.create(this.getPosition(), 1000));
         }
         Spaceroids.pEngine.addParticles(p);

         // Play the explosion sound
         Spaceroids.soundLoader.get("explode").play({volume: 80});
      }

   }, { // Static

      /**
       * Get the class name of this object
       *
       * @type String
       */
      getClassName: function() {
         return "SpaceroidsUFO";
      },

      /** The ufo shape
       * @private
       */
      points: [
         [1, -1],
         [1, -2],
         [-1, -2],
         [-1, -1],
         [1, -1],
         [2, 0],
         [1, 1],
         [-1, 1],
         [-2, 0],
         [-1, -1]
      ],

      COLLISION_MASK: R.lang.Math2.parseBin("011")

   });
};