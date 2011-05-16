/**
 * The Render Engine
 * CollisionData
 *
 * @fileoverview Data object which holds collision relevant information.
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
	"class": "R.struct.CollisionData",
	"requires": [
		"R.engine.PooledObject"
	]
});

/**
 * @class An object which contains information about a collision.  The values of the
 *    collision data are read directly.
 *
 * @param o {Number} Overlap
 * @param u {R.math.Vector2D} The collision normal
 * @param s1 {R.engine.GameObject} Game object 1
 * @param s2 {R.engine.GameObject} Game object 2
 * @param i {R.math.Vector2D} Impulse vector to separate shapes
 * @param wt {Number} World time
 * @param dt {Number} Time since last frame redraw (delta time)
 *
 * @extends R.engine.PooledObject
 * @constructor
 * @description Creates a collision data structure.
 */
R.struct.CollisionData = function() {
	return R.engine.PooledObject.extend({

      /**
       * The overlap in pixels
       * @type {Number}
       */
      overlap: 0,

      /**
       * The collision normal
       * @type {R.math.Vector2D}
       */
		unitVector: null,

      /**
       * The game object which collided
       * @type {R.engine.GameObject}
       */
		shape1: null,

      /**
       * The game object that was collided with
       * @type {R.engine.GameObject}
       */
		shape2: null,

      /**
       * A vector which can be used to move the two objects apart so they aren't colliding
       * @type {R.math.Vector2D}
       */
		impulseVector: null,

      /**
       * The world time at the time of the collision
       * @type {Number}
       */
      worldTime: 0,

      /**
       * The time delta between the world time and the last time the engine was updated
       * @type {Number}
       */
      delta: 0,

      /** @private */
		constructor: function(o,u,s1,s2,i,wt,dt) {
			this.overlap = o;
			this.unitVector = u;
			this.shape1 = s1;
			this.shape2 = s2;
			this.impulseVector = i;
         this.worldTime = wt;
         this.delta = dt;

         //if (Object.freeze) {
         //   Object.freeze(this);
         //}

			this.base("CollisionData");
		},

      /**
       * Destroy the collision data object.
       */
		destroy: function() {
			this.impulseVector.destroy();
			this.unitVector.destroy();
			this.base();
		},

      /**
       * Release the collision data object back into the pool for reuse.
       */
		release: function() {
			this.base();
			this.overlap = 0;
			this.unitVector = null;
			this.shape1 = null;
			this.shape2 = null;
			this.impulseVector = null;
         this.worldTime = 0;
         this.delta = 0;
		}
	}, {
      getClassName: function() {
         return "R.struct.CollisionData";
      }
   });
};