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
 * @class An object which contains information about a collision.  
 * 	The following is the data available:
 * <ul>
 * <li>overlap - {Number} The amount of overlap in pixels</li>
 * <li>unitVector - {@link R.math.Vector2D} The collision normal</li>
 * <li>shape1 - {@link R.collision.ConvexHull} The convex hull which collided (use {@link R.collision.ConvexHull#getHostObj getHostObj} to
 * 	get the object which is using the hull)</li>
 * <li>shape2 - {@link R.collision.ConvexHull} The convex hull that was collided with (use {@link R.collision.ConvexHull#getHostObj getHostObj} to
 * 	get the object which is using the hull)</li>
 * <li>impulseVector - {@link R.math.Vector2D} A vector which can be used to just separate shape1 from shape2</li>
 * </ul>
 *
 * @extends R.engine.PooledObject
 * @constructor
 * @description Creates a collision data structure.
 */
R.struct.CollisionData = function() {
	return R.engine.PooledObject.extend({
		
		overlap: 0,
		unitVector: null,
		shape1: null,
		shape2: null,
		impulseVector: null,

      /** @private */
		constructor: function(o,u,s1,s2,i) {
			this.overlap = o;
			this.unitVector = u;
			this.shape1 = s1;
			this.shape2 = s2;
			this.impulseVector = i;
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
		}
	});
};