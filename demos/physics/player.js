/**
 * The Render Engine
 * The player object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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
   "class": "Player",
   "requires": [
      "R.components.input.Mouse",
      "R.components.collision.Box",
      "R.engine.Object2D",
      "R.math.Rectangle2D"
   ]
});

/**
 * @class The player object is a simple invisible box which surrounds the
 *          mouse pointer.  The bounding box is used to determine collisions
 *          between the mouse pointer and a physical toy object.
 *
 * @extends R.engine.Object2D
 * @constructor
 * @description Create the "player" object
 */
var Player = function() {
   return R.engine.Object2D.extend(/** @scope Player.prototype */{

      // The toy the cursor is currently over or null
      overToy: null,

      /**
       * @private
       */
      constructor: function() {
         this.base("Player");

         // Add components to move and collide the player.  Movement is controlled
         // with either the mouse, or with the Wii remote
         this.add(R.components.input.Mouse.create("input"));
         this.add(R.components.collision.Box.create("collide", PhysicsDemo.cModel));
         this.getComponent("collide").setCollisionMask(Player.COLLISION_MASK);

         // The player's bounding box
         this.setBoundingBox(20,20);
         this.setOrigin(10,10);

         // Initialize the currently selected toy to null
         this.overToy = null;

         // Add mouse event handlers
         var self = this;
         this.addEvent(["onMouseMove"]);
      },

      /**
       * Update the player within the rendering context.  The player doesn't actually have
       * any shape, so this just update the position and collision model.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      update: function(renderContext, time, dt) {
         renderContext.pushTransform();
         this.base(renderContext, time, dt);
         renderContext.popTransform();

         // Use the metrics to let us know if we're over a toy object
         R.debug.Metrics.add("overToy", this.overToy != null ? this.overToy : "");
      },

      /**
       * Set, or initialize, the position of the mover component.
       * @param point {Point2D} The position where the cursor is
       */
      setPosition: function(point) {
         this.base(point);

         // Add a metrics value to the display for cursor position
         R.debug.Metrics.add("cursorPos", point);
      },

      onMouseMove: function(evt, info) {
         // If controller zero, update the position
         this.setPosition(info.position);
      },

      /**
       * Check for collision between a toy object and the player.
       *
       * @param obj {Object2D} The object being collided with
       * @return {Number} A status value
       * @see {ColliderComponent}
       */
      onCollide: function(obj, time, dt, targetMask) {
         if (targetMask == Toy.COLLISION_MASK) {
            this.overToy = obj;
            return R.components.Collider.STOP;
         }

         return R.components.Collider.CONTINUE;
      },

      onCollideEnd: function() {
         this.overToy = null;
      }

   }, /** @scope Player.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>Player</tt>
       */
      getClassName: function() {
         return "Player";
      },

      COLLISION_MASK: 5
   });
};