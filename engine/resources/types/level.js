/**
 * The Render Engine
 * Level
 *
 * @fileoverview A class for working with loaded levels.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
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
	"class": "R.resources.types.Level",
	"requires": [
		"R.engine.PooledObject",
		"R.math.Rectangle2D"
	]
});

/**
 * @class Creates an instance of a Level object.
 *
 * @constructor
 * @param name {String} The name of the object
 * @param levelResource {Object} The level resource loaded by the LevelLoader
 * @extends R.engine.PooledObject
 */
R.resources.types.Level = function(){
	return R.engine.PooledObject.extend(/** @scope R.resources.types.Level.prototype */{
	
		// The level resource
		levelResource: null,
		
		// The level frame
		frame: null,
		
		// The map of all collision rects defined for the level
		collisionMap: null,
		
		/** @private */
		constructor: function(name, levelResource){
		
			this.levelResource = levelResource;
			this.collisionMap = [];
			
			// Run through the collision map to recreate
			// the collision rectangles
			for (var r in levelResource.info.collisionMap) {
				var rA = levelResource.info.collisionMap[r];
				this.collisionMap.push(R.math.Rectangle2D.create(rA[0], rA[1], rA[2], rA[3]));
			}
			
			return this.base(name);
		},
		
		/**
		 * Release the level back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.levelResource = null;
			this.frame = null;
			this.collisionMap = null;
		},
		
		/**
		 * Gets a potential collision list (PCL) for the point and radius specified.
		 * This routine, and the entire collision mechanism for levels, could be optimized for speed
		 * using a BSP tree, or other structure.
		 *
		 * @param point {R.math.Point2D} The position to check for a collision
		 * @param radius {Number} The distance from the point to check for collisions
		 * @return {Array} An array of {@link Rectangle2D} instances which might be possible collisions
		 */
		getPCL: function(point, radius){
			// Create a rectangle which represents the position and radius
			var cRect = R.math.Rectangle2D.create(point.x - radius, point.y - radius, radius * 2, radius * 2);
			
			// Check the collision map for possible collisions
			var pcl = [];
			for (var r in this.collisionMap) {
				if (this.collisionMap[r].isIntersecting(cRect)) {
					pcl.push(this.collisionMap[r]);
				}
			}
			cRect.destroy();
			
			return pcl;
		},
		
		/**
		 * Get the width of the level image.
		 * @return {Number} The width of the level in pixels
		 */
		getWidth: function(){
			return this.levelResource.info.bitmapWidth;
		},
		
		/**
		 * Get the height of the level image.
		 * @return {Number} The height of the level in pixels
		 */
		getHeight: function(){
			return this.levelResource.info.bitmapHeight;
		},
		
		/**
		 * Get a {@link R.math.Rectangle2D} which encloses this level.
		 * @return {R.math.Rectangle2D} A {@link Rectangle2D} which encloses the level
		 */
		getFrame: function(){
			if (!this.frame) {
				this.frame = R.math.Rectangle2D.create(0, 0, this.getWidth(), this.getHeight());
			}
			
			return this.frame;
		},
		
		/**
		 * The source image loaded by the {@link R.resources.loaders.LevelLoader} when the level was
		 * created.
		 * @return {HTMLImage} The source image of the level
		 */
		getSourceImage: function(){
			return this.levelResource.image;
		}
		
	}, /** @scope R.resources.types.Level.prototype */ {
		/**
		 * Gets the class name of this object.
		 * @return {String} The string "R.resources.types.Level"
		 */
		getClassName: function(){
			return "R.resources.types.Level";
		}
	});
	
}