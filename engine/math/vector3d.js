/**
 * The Render Engine
 * Vector3D
 *
 * @fileoverview A Vector3D class
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
	"class": "R.math.Vector3D",
	"requires": [
		"R.math.Point3D",
		"R.math.Math2D"
	]
});

/**
 * @class A 3D vector class with helpful manipulation methods.
 * 
 * @param x {R.math.Point3D|Number} If this arg is a R.math.Vector3D, its values will be
 *                           copied into the new vector.  If a number,
 *                           the X length of the vector.
 * @param y {Number} The Y length of the vector.  Only required if X
 *                   was a number.
 * @param z {Number} The Z length of the vector.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 3D Vector
 * @extends R.math.Point3D
 */
R.math.Vector3D = function(){
	return R.math.Point3D.extend(/** @scope R.math.Vector3D.prototype */{
	
		/**
		 * @private
		 */
		constructor: function(x, y, z){
			this.base(x, y, z);
		},
		
		/**
		 * A mutator method that normalizes this vector, returning a unit length vector.
		 * @return {R.math.Vector3D} This vector, normalized
		 * @see #len
		 */
		normalize: function(){
			this._vec = this._vec.toUnitVector();
			return this;
		},
		
		/**
		 * Get the magnitude/length of this vector.
		 *
		 * @return {Number} A value representing the length (magnitude) of the vector.
		 */
		len: function(){
			return this._vec.modulus();
		},
		
		/**
		 * Get the dot product of this vector and another.
		 * @param vector {R.math.Vector3D} The Point to perform the operation against.
		 * @return {Number} The dot product
		 */
		dot: function(vector){
			return this._vec.dot(vector._vec);
		},
		
		/**
		 * A mutator method that gets the cross product of this vector and another.
		 * @param vector {R.math.Vector3D} The vector to perform the operation against.
		 * @return {R.math.Vector3D} This vector
		 */
		cross: function(vector){
			this._vec = this._vec.cross(vector._vec);
			return this;
		},
		
		/**
		 * Returns the angle (in degrees) between two vectors.  This assumes that the
		 * point is being used to represent a vector, and that the supplied point
		 * is also a vector.
		 *
		 * @param vector {R.math.Vector3D} The vector to perform the angular determination against
		 * @return {Number} The angle between two vectors, in degrees
		 */
		angleBetween: function(vector){
			return R.math.Math2D.radToDeg(this._vec.angleFrom(vector._vec));
		}
		
	}, /** @scope R.math.Vector3D.prototype */{ 
		/**
		 * Return the classname of the this object
		 * @return {String} "R.math.Vector3D"
		 */
		getClassName: function(){
			return "R.math.Vector3D";
		},
		
		/** @private */
		resolved: function() {
			R.math.Vector3D.ZERO = R.math.Vector3D.create(0, 0, 0);
		},
		
		/**
		 * The "zero" vector. This vector should not be modified.
		 * @type {R.math.Vector3D}
		 * @memberOf R.math.Vector3D
		 */
		ZERO: null
	});
};