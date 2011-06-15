/**
 * The Render Engine
 * RayInfo
 *
 * @fileoverview Data object which holds ray cast relevant information.
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
	"class": "R.struct.RayInfo",
	"requires": [
		"R.engine.PooledObject"
	]
});

/**
 * @class An object which contains information about a collision.  The values of the
 *    collision data are read directly.
 *
 * @param o {Number} Overlap
 * @param n {R.math.Vector2D} The collision normal
 * @param s1 {R.engine.BaseObject} Collision object
 * @param i {R.math.Vector2D} Impact point
 * @param start {R.math.Point2D} The start point of the ray
 * @param end {R.math.Point2D} The end point of the ray
 * @param wt {Number} World time
 * @param dt {Number} Time since last frame redraw (delta time)
 *
 * @extends R.engine.PooledObject
 * @constructor
 * @description Creates a collision data structure.
 */
R.struct.RayInfo = function() {
	return R.engine.PooledObject.extend(/** @scope R.struct.RayInfo.prototype */{

      /**
       * The overlap in pixels
       * @type {Number}
       */
      overlap: 0,

      /**
       * The collision normal
       * @type {R.math.Vector2D}
       */
		normal: null,

      /**
       * The object that was collided with
       * @type {R.engine.GameObject}
       */
		shape: null,

      /**
       * The point along the ray at which the collision occurred
       * @type {R.math.Point2D}
       */
		impactPoint: null,

      /**
       * The starting point of the ray
       * @type {R.math.Point2D}
       */
      startPoint: null,

      /**
       * The direction and magnitude of the ray
       * @type {R.math.Vector2D}
       */
      direction: null,

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

      /**
       * A data object which can contain additional information about the ray
       * @type {Object}
       */
      data: null,

      /** @private */
		constructor: function(start, dir) {
			this.startPoint = R.clone(start);
         this.direction = R.clone(dir);
			this.normal = R.clone(dir).normalize().neg();
			this.shape = null;
			this.impactPoint = R.math.Point2D.create(0,0);
         this.worldTime = 0;
         this.delta = 0;
         this.data = {};
			this.base("RayInfo");
		},

      /**
       * Destroy the collision data object.
       */
		destroy: function() {
         if (this.impactPoint) {
			   this.impactPoint.destroy();
         }
         if (this.normal) {
			   this.normal.destroy();
         }
         if (this.data && this.data.destroy) {
            this.data.destroy();
         }
         this.startPoint.destroy();
         this.direction.destroy();
			this.base();
		},

      /**
       * Release the collision data object back into the pool for reuse.
       */
		release: function() {
			this.base();
			this.overlap = 0;
			this.normal = null;
			this.shape = null;
			this.impactPoint = null;
         this.startPoint = null;
         this.direction = null;
         this.worldTime = 0;
         this.delta = 0;
		},

      /**
       * Set the point of impact along the ray.
       * @param impact {R.math.Point2D} The impact point
       * @param shape {R.engine.PooledObject} The object that was impacted
       * @param [data] {Object} Optional data object
       */
      set: function(impact, shape, data) {
         this.worldTime = R.Engine.worldTime;
         this.delta = R.Engine.lastTime;
         this.impactPoint.set(impact);
         this.shape = shape;
         var end = R.math.Vector2D.create(this.startPoint).add(this.direction);
         this.overlap = end.sub(impact).len();
         end.destroy();
         this.data = data;
      }

	}, {
      getClassName: function() {
         return "R.struct.RayInfo";
      }
   });
};