/**
 * The Render Engine
 * 2D platformer mover
 *
 * @fileoverview A transform component for movement around a tile map as a "platformer".
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

// The class this file defines and its required classes
R.Engine.define({
   "class": "R.components.transform.PlatformMover2D",
   "requires": [
      "R.components.Transform2D",
      "R.math.Math2D"
   ]
});

/**
 * @class A transform component to move around a tile map like the old "platformer" games
 *
 * @param name {String} Name of the component
 * @param tileMap {R.resources.types.TileMap} The tile map to move around in
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends R.components.Transform2D
 * @constructor
 * @description Creates a transform component.
 */
R.components.transform.PlatformMover2D = function() {
   return R.components.Transform2D.extend(/** @scope R.components.transform.PlatformMover2D.prototype */{

      tileMap: null,
      moveDir: null,
      gravity: null,
      tileSize: null,

      /** @private */
      constructor: function(name, tileMap, priority) {
         this.base(name, priority || 1.0);
         this.tileMap = tileMap;
         this.moveDir = R.math.Vector2D.create(0,0);
         this.gravity = R.math.Vector2D.create(0,0.2);
         if (tileMap instanceof R.resources.types.TileMap) {
            this.tileSize = Math.max(tileMap.getBaseTile().getBoundingBox().w,
                                     tileMap.getBaseTile().getBoundingBox().h);
         }
      },

      destroy: function() {
         this.moveDir.destroy();
         this.gravity.destroy();
         this.base();
      },

      /**
       * Releases the component back into the pool for reuse.  See {@link PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.tileMap = null;
         this.moveDir = null;
         this.tileSize = null;
      },

      setTileMap: function(tileMap) {
         this.tileMap = tileMap;
         this.tileSize = Math.max(tileMap.getBaseTile().getBoundingBox().w,
                                  tileMap.getBaseTile().getBoundingBox().h);
      },

      /**
       * This method is called by the game object to run the component,
       * updating its state.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the component will render within.
       * @param time {Number} The global engine time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      execute: function(renderContext, time, dt) {
         if (this.tileMap) {
            var oldPos = R.clone(this.getPosition()), newPos = this.getPosition(), collision, dir;

            // If movement along the X coordinate isn't zero, we want to test for collisions along the axis
            if (this.moveDir.x != 0) {
               // We want to cast a ray along the X axis of movement
               newPos.x += this.getGameObject().getBoundingBox().w;
               newPos.y += this.getGameObject().getBoundingBox().getHalfHeight();
               dir = R.math.Vector2D.create(this.moveDir.x, 0).normalize().mul(this.tileSize);
               collision = R.resources.types.TileMap.castRay(this.tileMap, newPos, dir);

               // There's something ahead of us, stop movement
               if (collision) {
                  newPos = oldPos;
                  this.moveDir.setX(0);
               }
            }

            // Add in gravity
            dir = R.clone(this.gravity).normalize().mul(this.tileSize);
            collision = R.resources.types.TileMap.castRay(this.tileMap, newPos, dir)
            // There's nothing in gravity's direction, add gravity
            if (!collision) {
               this.moveDir.add(this.gravity);
            } else {
               this.moveDir.setY(0);
            }

            this.setPosition(newPos.add(this.moveDir));
         }
         dir.destroy();
         
         this.base(renderContext, time, dt);
      }

   }, { /** @scope R.components.transform.PlatformMover2D.prototype */

      /**
       * Get the class name of this object
       * @return {String} "R.components.transform.PlatformMover2D"
       */
      getClassName: function() {
         return "R.components.transform.PlatformMover2D";
      }

   });
}