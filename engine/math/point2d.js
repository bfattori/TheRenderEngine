/**
 * The Render Engine
 * Point2D
 *
 * @fileoverview A Point2D class
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
	"class": "R.math.Point2D",
	"requires": [
		"R.math.PooledMathObject",
		"R.math.Math2D"
	]
});

/**
 * @class A 2D point class with helpful methods for manipulation
 *
 * @param x {R.math.Point2D|Number} If this arg is a R.math.Point2D, its values will be
 *                           copied into the new point.
 * @param y {Number} The Y coordinate of the point.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 2D point.
 * @extends R.math.PooledMathObject
 */
R.math.Point2D = function(){
	return R.math.PooledMathObject.extend(/** @scope R.math.Point2D.prototype */{

      x: 0,
      y: 0,
      __POINT2D: true,

		/**
		 * @private
		 */
		constructor: function(x, y){
			this.base("Point2D");
         this.__POINT2D = true;
			return this.set(x, y);
		},
		
		/**
		 * Release this point into the pool for reuse.
		 */
		release: function(){
			this.base();
			this.x = 0;
			this.y = 0;
		},
		
		/**
		 * Returns a simplified version of a R.math.Point2D.  The simplified version is
		 * an array with two elements: X, Y.
		 * @return {Array}
		 */
		simplify: function(){
			return [this.x, this.y];
		},
		
		/**
		 * Returns <tt>true</tt> if this point is equal to the specified point.
		 *
		 * @param point {R.math.Point2D} The point to compare to
		 * @return {Boolean} <tt>true</tt> if the two points are equal
		 */
		equals: function(point){
			return (this.x == point.x && this.y == point.y);
		},
		
		/**
		 * Set the position of a 2D point.
		 *
		 * @param x {R.math.Point2D|Number|Array} If this arg is a R.math.Point2D, its values will be
		 *                           copied into the new point.
		 * @param y {Number} The Y coordinate of the point.  Only required if X
		 *                   was a number.
		 */
		set: function(x, y){
			if (x.length && x.splice && x.shift) {
				// An array
				this.x = x[0]; this.y = x[1];
			}
			else 
				if (x.__POINT2D) {   // Instead of an "instanceof" check
					this.x = x.x; this.y = x.y;
				}
				else {
					AssertWarn((y != null), "Undefined Y value for point initialized to zero.");
					this.x = x; this.y = y || 0;
				}
			return this;
		},
		
		/**
		 * Set the X coordinate.
		 *
		 * @param x {Number} The X coordinate
		 */
		setX: function(x){
			this.x = x;
		},
		
		/**
		 * Set the Y coordinate.
		 *
		 * @param y {Number} The Y coordinate
		 */
		setY: function(y){
			this.y = y;
		},
		
		/**
		 * A method that mutates this point by adding the point to it.
		 *
		 * @param point {R.math.Point2D} A point
		 * @return {R.math.Point2D} This point
		 */
		add: function(point){
         Assert(point != null, "Adding undefined point");
			this.x += point.x;
			this.y += point.y;
			return this;
		},
		
		/**
		 * A mutator method that adds the scalar value to each component of this point.
		 * @param scalar {Number} A number
		 * @return {R.math.Point2D} This point
		 */
		addScalar: function(scalar){
         Assert(scalar != null, "Adding undefined scalar");
			this.x += scalar;
			this.y += scalar;
			return this;
		},
		
		/**
		 * A mutator method that subtracts the specified point from this point.
		 * @param point {Point2D} a point
		 * @return {R.math.Point2D} This point
		 */
		sub: function(point){
         Assert(point != null, "Subtracting undefined point");
			this.x -= point.x;
			this.y -= point.y;
			return this;
		},
		
		/**
		 * A mutator method that multiplies the components of this point with another.
		 * @param point {R.math.Point2D} A point
		 * @return {R.math.Point2D} This point
		 */
		convolve: function(point){
         Assert(point != null, "Convolving undefined point");
			this.x *= point.x;
			this.y *= point.y;
			return this;
		},
		
		/**
		 * A mutator method that divides the components of this point by another.  The point
		 * cannot contain zeros for its components.
		 * @param point {R.math.Point2D} A point
		 * @return {R.math.Point2D} This point
		 */
		convolveInverse: function(point){
         Assert(point != null, "Inverse convolving undefined point");
			Assert((point.x != 0 && point.y != 0), "Division by zero in Point2D.convolveInverse");
			this.x /= point.x;
			this.y /= point.y;
			return this;
		},
		
		/**
		 * A mutator methor that multiplies the components of this point by a scalar value.
		 * @param scalar {Number} A number
		 * @return {R.math.Point2D} This point
		 */
		mul: function(scalar){
         Assert(scalar != null, "Multiplying undefined scalar");
			this.x *= scalar;
			this.y *= scalar;
			return this;
		},
		
		/**
		 * A mutator method that divides the components of this point by a scalar value.
		 * @param scalar {Number} A number - cannot be zero
		 * @return {R.math.Point2D} This point
		 */
		div: function(scalar){
         Assert(scalar != null, "Dividing undefined scalar");
			Assert((scalar != 0), "Division by zero in Point2D.divScalar");
			this.x /= scalar;
			this.y /= scalar;
			return this;
		},
		
		/**
		 * A mutator method that negates this point, inversing it's components.
		 * @return {R.math.Point2D} This point
		 */
		neg: function(){
			this.x *= -1;
			this.y *= -1;
			return this;
		},
		
		/**
		 * Returns true if the point is the zero point.
		 * @return {Boolean} <tt>true</tt> if the point's elements are both zero.
		 */
		isZero: function(){
			return this.x == 0 && this.y == 0;
		},
		
		/**
		 * Returns the distance between this and another point.
		 * @param point {R.math.Point2D} The point to compare against
		 * @return {Number} The distance between the two points
		 */
		dist: function(point){
         Assert(point != null, "Cannot solve distance to undefined point");
         return Math.sqrt((point.x - this.x) * (point.x - this.x) +
                          (point.y - this.y) * (point.y - this.y));
		},

		/**
		 * Mutator method which transforms this point by the specified matrix
		 * @param matrix {Matrix} The matrix to transform this point by.  <tt>Matrix</tt>
       * is defined in the Sylvester library.
       *
		 * @return {R.math.Point2D} This point
		 */
		transform: function(matrix){
			var v = matrix.multiply({ modulus: true, elements: [this.x, this.y, 1] });
         this.x = v.elements[0]; this.y = v.elements[1];
			return this;
		},

      jitter: function(amt) {
         var j = R.math.Point2D.create(R.lang.Math2.randomRange(-amt,amt,true),
             R.lang.Math2.randomRange(-amt,amt,true));

         this.add(j);
         j.destroy();
         return this;
      },

		/**
		 * Returns a printable version of this object fixed to two decimal places.
		 * @return {String} Formatted as "x,y"
		 */
		toString: function(){
			return Number(this.x).toFixed(2) + "," + Number(this.y).toFixed(2);
		}
		
	}, /** @scope R.math.Point2D.prototype */{ 
		/**
		 * Return the classname of the this object
		 * @return {String} "R.math.Point2D"
		 */
		getClassName: function(){
			return "R.math.Point2D";
		},
		
		/** @private */
		resolved: function() {
			R.math.Point2D.ZERO = R.math.Point2D.create(0, 0);
         if (Object.freeze) {
            Object.freeze(R.math.Point2D.ZERO);
         }
		},

		/**
		 * The "zero" point. This point should not be modified.
		 * @type {Point2D}
		 */
		ZERO: null 
	});
};