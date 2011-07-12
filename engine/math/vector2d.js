/**
 * The Render Engine
 * Vector2D
 *
 * @fileoverview A Vector2D class
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
	"class": "R.math.Vector2D",
	"requires": [
		"R.math.Math2D",
      "R.math.Point2D"
	]
});

/**
 * @class A 2D vector class with helpful manipulation methods.
 * 
 * @param x {R.math.Vector2D|Number} If this arg is a Vector2D, its values will be
 *                           copied into the new vector.  If a number,
 *                           the X length of the vector.
 * @param y {Number} The Y length of the vector.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 2D Vector
 * @extends R.math.Point2D
 */
R.math.Vector2D = function(){
	return R.math.Point2D.extend(/** @scope R.math.Vector2D.prototype */{
	
		/**
		 * @private
		 */
		constructor: function(x, y){
			return this.base(x, y);
		},

		/**
		 * A mutator method that normalizes this vector, returning a unit length vector.
		 * @return {R.math.Vector2D} This vector, normalized
		 * @see #len
		 */
		normalize: function(){
         var ln = this.len();
         if (ln != 0) {
            this.x /= ln;
            this.y /= ln;
         }
			return this;
		},
		
		/**
		 * Get the magnitude/length of this vector.
		 *
		 * @return {Number} A value representing the length (magnitude) of the vector.
		 */
		len: function(){
         return Math.sqrt((this.x * this.x) + (this.y * this.y));
		},
		
		/**
		 * Get the dot product of this vector and another.
		 * @param vector {R.math.Vector2D} The Point to perform the operation against.
		 * @return {Number} The dot product
		 */
		dot: function(vector){
         Assert(vector != null, "Dot product to undefined vector");
         return (this.x * vector.x) + (this.y * vector.y);
		},
		
		/**
		 * A mutator method that gets the cross product of this vector and another.
		 * @param vector {R.math.Vector2D} The vector to perform the operation against.
		 * @return {R.math.Vector2D} This vector
		 */
		cross: function(vector){
         Assert(vector != null, "Cross multiply with undefined vector");
         this.x = this.y - vector.y;
         this.y = vector.x - this.x;
         // this.z = (this.x * vector.y) - (this.y * vector.x);
			return this;
		},
		
		/**
		 * Returns the angle (in degrees) between two vectors.  This assumes that the
		 * point is being used to represent a vector, and that the supplied point
		 * is also a vector.
		 *
		 * @param vector {R.math.Vector2D} The vector to perform the angular determination against
		 * @return {Number} The angle between two vectors, in degrees
		 */
		angleBetween: function(vector){
         Assert(vector != null, "Angle between undefined vector");
         var v1 = $V([this.x,this.y,1]), v2 = $V([vector.x,vector.y,1]);
			return R.math.Math2D.radToDeg(v1.angleFrom(v2));
		},
		
		/**
		 * Returns <tt>true</tt> if this vector is parallel to <tt>vector</tt>.
		 * @param vector {R.math.Vector2D} The vector to compare against
		 * @return {Boolean}
		 */
		isParallelTo: function(vector){
         Assert(vector != null, "Parallel to undefined vector");
         var v1 = $V([this.x,this.y,1]), v2 = $V([vector.x,vector.y,1]);
			return v1.isParallelTo(v2);
		},
		
		/**
		 * Returns <tt>true</tt> if this vector is anti-parallel to <tt>vector</tt>.
		 * @param vector {R.math.Vector2D} The vector to compare against
		 * @return {Boolean}
		 */
		isAntiparallelTo: function(vector){
         Assert(vector != null, "Anti-parallel to undefined vector");
         var v1 = $V([this.x,this.y,1]), v2 = $V([vector.x,vector.y,1]);
			return v1.isAntiparallelTo(v2);
		},
		
		/**
		 * Returns <tt>true</tt> if this vector is perpendicular to <tt>vector</tt>.
		 * @param vector {R.math.Vector2D} The vector to compare against
		 * @return {Boolean}
		 */
		isPerpendicularTo: function(vector){
         Assert(vector != null, "Perpendicular to undefined vector");
         var v1 = $V([this.x,this.y,1]), v2 = $V([vector.x,vector.y,1]);
			return v1.isPependicularTo(v2);
		},
		
		/**
		 * Mutator method that modifies the vector rotated <tt>angle</tt> degrees about
		 * the vector defined by <tt>axis</tt>.
		 *
		 * @param angle {Number} The rotation angle in degrees
		 * @param axis {R.math.Vector2D} The axis to rotate about
		 * @return {R.math.Vector2D} This vector
		 */
		rotate: function(angle, axis){
         var v1 = $V([this.x,this.y,1]);
			var v3 = v1.rotate(R.math.Math2D.degToRad(angle), axis);
         this.x = v3.elements[0]; this.y = v3.elements[1];
			return this;
		},
		
		/**
		 * Project this vector onto <tt>vector</tt>.
		 *
		 * @param vector {R.math.Vector2D} The vector to project onto
		 * @return {R.math.Vector2D}
		 */
		projectOnto: function(vector){
         Assert(vector != null, "Project onto undefined vector");
			var proj = R.math.Vector2D.create(0, 0), v = vector, dp = this.dot(vector);
			proj.set((dp / (v.x * v.x + v.y * v.y)) * v.x, (dp / (v.x * v.x + v.y * v.y)) * v.y);
			return proj;
		},
		
		/**
		 * Get the right-hand normal of this vector.  The left-hand
		 * normal would simply be <tt>this.rightNormal().neg()</tt>.
		 * @return {R.math.Vector2D}
		 */
		rightNormal: function(){
			return R.math.Vector2D.create(-this.y, this.x).normalize();
		},

		/**
		 * Get the perproduct (sign) of this vector and <tt>vector</tt>.  Returns
       * -1 if <tt>vector</tt> is to the left, or 1 if it is to the right
       * of this vector.
		 * @param vector {R.math.Vector2D} The other vector
		 * @return {Number}
		 */
		perProduct: function(vector){
         Assert(vector != null, "Per-product with undefined vector");
			return this.dot(vector.rightNormal());
		}
		
	}, /** @scope R.math.Vector2D.prototype */{ 
		/**
		 * Return the classname of the this object
		 * @return {String} "R.math.Vector2D"
		 */
		getClassName: function(){
			return "R.math.Vector2D";
		},

		/** @private */
		resolved: function() {
			R.math.Vector2D.ZERO = R.math.Vector2D.create(0, 0);
			R.math.Vector2D.UP = R.math.Vector2D.create(0, -1);
			R.math.Vector2D.LEFT = R.math.Vector2D.create(-1, 0);
			R.math.Vector2D.DOWN = R.math.Vector2D.create(0, 1);
			R.math.Vector2D.RIGHT = R.math.Vector2D.create(1, 0);
         if (Object.freeze) {
            Object.freeze(R.math.Vector2D.ZERO);
            Object.freeze(R.math.Vector2D.UP);
            Object.freeze(R.math.Vector2D.LEFT);
            Object.freeze(R.math.Vector2D.DOWN);
            Object.freeze(R.math.Vector2D.RIGHT);
         }

		},

		/**
		 * The "zero" vector. This vector should not be modified.
		 * @type {R.math.Vector2D}
		 * @memberOf R.math.Vector2D
		 */
		ZERO:	null,

		/**
		 * The normalized "up" vector. This vector should not be modified.
		 * @type {R.math.Vector2D}
		 * @memberOf R.math.Vector2D
		 */
		UP: null,

		/**
		 * The normalized "left" vector. This vector should not be modified.
		 * @type {R.math.Vector2D}
		 * @memberOf R.math.Vector2D
		 */
		LEFT: null,
		
		/**
		 * The normalized "down" vector. This vector should not be modified.
		 * @type {R.math.Vector2D}
		 * @memberOf R.math.Vector2D
		 */
		DOWN: null,
		
		/**
		 * The normalized "right" vector. This vector should not be modified.
		 * @type {R.math.Vector2D}
		 * @memberOf R.math.Vector2D
		 */
		RIGHT: null
	});
	
};