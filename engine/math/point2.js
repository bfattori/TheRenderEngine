/**
 * The Render Engine
 * Point2
 *
 * @fileoverview A simplified Point2D class
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
   "class": "R.math.Point2",
   "requires": []
});

/**
 * @class A simplified 2D point that can be cast to a {@link R.math.Point2D} if needed.
 *			 <tt>R.math.Point2</tt> is not pooled, and as such doesn't have the <tt>create()</tt>
 *			 constructor.
 *
 * @param x {Number} The X coordinate of the point.
 * @param y {Number} The Y coordinate of the point.
 * @constructor
 * @description Create a new 2D point.
 */
R.math.Point2 = function() {
	return R.make(/** @scope R.math.Point2.prototype */{
		p: null,
		__POINT2D: null,
		
		/** @private */
		constructor: function(x,y){
   		this.p = [0,0];
   		this.__POINT2D = true;
   		this.set(x,y);
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
		 * Update the coordinates of the point
		 * @param x {Number|R.math.Point2|R.math.Point2D|R.math.Vector2D}
		 * @param [y] {Number} If <tt>x</tt> is a number, this is the Y coordinate
		 */
		set: function(x, y){
			if (!isNaN(x)) {
				this.p[0] = x; this.p[1] = y;
			} else {
				this.p[0] = x.x; this.p[1] = x.y;
			}
		},

		/**
		 * Cast this object to the specified object.
		 * @param clazz {Function} The function to cast to
		 * @return {Object}
		 */
		castTo: function(clazz) {
			return clazz.create ? clazz.create(this.x, this.y) : new clazz(this.x, this.y);
		},

		/**
		 * Returns <tt>true</tt> if this point is equal to the specified point.
		 *
		 * @param point {R.math.Point2} The point to compare to
		 * @return {Boolean} <tt>true</tt> if the two points are equal
		 */
		equals: function(point){
			return (this.x == point.x && this.y == point.y);
		},

		/**
		 * A method that mutates this point by adding the point to it.
		 *
		 * @param point {R.math.Point2D} A point
		 * @return {R.math.Point2D} This point
		 */
		add: function(point){
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
			this.x -= point.x;
			this.y -= point.y;
			return this;
		},

		/**
		 * A mutator methor that multiplies the components of this point by a scalar value.
		 * @param scalar {Number} A number
		 * @return {R.math.Point2D} This point
		 */
		mul: function(scalar){
			this.x *= scalar;
			this.y *= scalar;
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
		 * Returns a printable version of this object fixed to two decimal places.
		 * @return {String} Formatted as "x,y"
		 */
		toString: function(){
			return Number(this.x).toFixed(2) + "," + Number(this.y).toFixed(2);
		}
	
	}, { // Define setters and getters

		"x": [ function(){ return this.p[0]; }, 
				 function(val){ this.p[0] = val; } ],
				 
		"y": [ function(){ return this.p[1]; }, 
				 function(val){ this.p[1] = val; } ]

	});

};
      
