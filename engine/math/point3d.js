/**
 * The Render Engine
 * Point3D
 *
 * @fileoverview A Point3D class
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
	"class": "R.math.Point3D",
	"requires": [
		"R.math.PooledMathObject",
		"R.math.Math2D",
		"R.math.Point2D"
	]
});

/**
 * @class A 3D point class with helpful methods for manipulation
 *
 * @param x {R.math.Point3D|Number} If this arg is a R.math.Point3D, its values will be
 *                           copied into the new point.
 * @param y {Number} The Y coordinate of the point.  Only required if X
 *                   was a number.
 * @param z {Number} The Z coordinate of the point.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 3D point.
 * @extends R.math.PooledMathObject
 */
R.math.Point3D = function(){
	return R.math.PooledMathObject.extend(/** @scope R.math.Point3D.prototype */{
	
		_vec: null,
		
		/**
		 * @private
		 */
		constructor: function(x, y, z){
			this.base("Point3D");
			this._vec = $V([0, 0, 0]);
			this.set(x, y, z);
		},
		
		/**
		 * Release the point back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.x = 0;
			this.y = 0;
			this.z = 0;
		},
		
		/**
		 * @private
		 */
		_getVec: function(){
			return this._vec;
		},
		
		/**
		 * Returns a simplified version of a R.math.Point3D.  The simplified version is
		 * an array with three elements: X, Y, Z.
		 * @return {Array}
		 */
		simplify: function(){
			return [this.x, this.y, this.z];
		},
		
		/**
		 * Returns <tt>true</tt> if this point is equal to the specified point.
		 *
		 * @param point {R.math.Point3D} The point to compare to
		 * @return {Boolean} <tt>true</tt> if the two points are equal
		 */
		equals: function(point){
			return this._vec.eql(point._vec);
		},
		
		/**
		 * Set the position of a 3D point.
		 *
		 * @param x {R.math.Point3D|Number|Array} If this arg is a R.math.Point3D, its values will be
		 *                           copied into the new point.
		 * @param y {Number} The Y coordinate of the point.  Only required if X
		 *                   was a number.
		 * @param z {Number} The Z coordinate of the point.  Only required if X
		 * 						was a number.
		 */
		set: function(x, y, z){
			if (x.length && x.splice && x.shift) {
				// An array
				this._vec.setElements(x);
			}
			else 
				if (x instanceof R.math.Point3D) {
					this._vec.setElements([x.x, x.y, x.z]);
				}
				else {
					AssertWarn((y != null), "Undefined Y value for point initialized to zero.");
					AssertWarn((z != null), "Undefined Z value for point initialized to zero.");
					this._vec.setElements([x, y || 0, z || 0]);
				}
			return this;
		},
		
		/**
		 * Get the elements of this point as an object with elements x, y, and z.
		 * @return {Object}
		 * @deprecated
		 */
		get: function(){
			return {
				x: this.x,
				y: this.x,
				z: this.z
			};
		},
		
		/**
		 * Set the X coordinate.
		 *
		 * @param x {Number} The X coordinate
		 */
		setX: function(x){
			this.set(x, this.y, this.z);
		},
		
		/**
		 * Set the Y coordinate.
		 *
		 * @param y {Number} The Y coordinate
		 */
		setY: function(y){
			this.set(this.x, y, this.z);
		},
		
		/**
		 * Set the Z coordinate.
		 *
		 * @param z {Number} The Z coordinate
		 */
		setZ: function(z){
			this.set(this.x, this.y, z);
		},
		
		/**
		 * A method that mutates this point by adding the point to it.
		 *
		 * @param point {R.math.Point3D} A point
		 * @return {R.math.Point3D} This point
		 */
		add: function(point){
			this.x += point.x;
			this.y += point.y;
			this.z += point.z;
			return this;
		},
		
		/**
		 * A mutator method that adds the scalar value to each component of this point.
		 * @param scalar {Number} A number
		 * @return {R.math.Point3D} This point
		 */
		addScalar: function(scalar){
			this.x += scalar;
			this.y += scalar;
			this.z += scalar;
			return this;
		},
		
		/**
		 * A mutator method that subtracts the specified point from this point.
		 * @param point {R.math.Point3D} a point
		 * @return {R.math.Point3D} This point
		 */
		sub: function(point){
			this.x -= point.x;
			this.y -= point.y;
			this.z -= point.z;
			return this;
		},
		
		/**
		 * A mutator method that multiplies the components of this point with another.
		 * @param point {R.math.Point3D} A point
		 * @return {R.math.Point3D} This point
		 */
		convolve: function(point){
			this.x *= point.x;
			this.y *= point.y;
			this.z *= point.z;
			return this;
		},
		
		/**
		 * A mutator method that divides the components of this point by another.  The point
		 * cannot contain zeros for its components.
		 * @param point {R.math.Point3D} A point
		 * @return {R.math.Point3D} This point
		 */
		convolveInverse: function(point){
			Assert((point.x != 0 && point.y != 0 && point.z != 0), "Division by zero in Point3D.convolveInverse");
			this.x /= point.x;
			this.y /= point.y;
			this.z /= point.z;
			return this;
		},
		
		/**
		 * A mutator method that multiplies the components of this point by a scalar value.
		 * @param scalar {Number} A number
		 * @return {R.math.Point3D} This point
		 */
		mul: function(scalar){
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		},
		
		/**
		 * A mutator method that divides the components of this point by a scalar value.
		 * @param scalar {Number} A number - cannot be zero
		 * @return {R.math.Point3D} This point
		 */
		div: function(scalar){
			Assert((scalar != 0), "Division by zero in Point3D.divScalar");
			this.x /= scalar;
			this.y /= scalar;
			this.z /= scalar;
			return this;
		},
		
		/**
		 * A mutator method that negates this point, inversing it's components.
		 * @return {R.math.Point3D} This point
		 */
		neg: function(){
			this.x *= -1;
			this.y *= -1;
			this.z *= -1;
			return this;
		},
		
		/**
		 * Returns true if the point is the zero point.
		 * @return {Boolean} <tt>true</tt> if the point's elements are all zero.
		 */
		isZero: function(){
			return this.x == 0 && this.y == 0 && this.z == 0;
		},
		
		/**
		 * Returns the distance between this and another point.
		 * @param point {R.math.Point3D} The point to compare against
		 * @return {Number} The distance between the two points
		 */
		dist: function(point){
			return this._vec.distanceFrom(point._vec);
		},
		
		/**
		 * Project this point from 3 dimensions to 2 dimensions, using one of three projection
		 * types: {@link R.math.Math2D#ISOMETRIC_PROJECTION} <i>(default)</i>, {@link R.math.Math2D#DIMETRIC_SIDE_PROJECTION}, or
		 * {@link R.math.Math2D#DIMETRIC_TOP_PROJECTION}.
		 * <p/>
		 * Reference: http://www.compuphase.com/axometr.htm
		 *
		 * @param projectionType {Number} One of the three projection types in {@link R.math.Math2D}
		 * @return {R.math.Point2D} This point, projected into 2 dimensions
		 */
		project: function(projectionType){
			projectionType = projectionType || R.math.Math2D.ISOMETRIC_PROJECTION;
			var pt = Point2D.create(0, 0), j = this;
			switch (projectionType) {
				case R.math.Math2D.ISOMETRIC_PROJECTION:
					pt.set(j.x - j.z, j.y + ((j.x + j.z) / 2));
					break;
				case R.math.Math2D.DIMETRIC_SIDE_PROJECTION:
					pt.set(j.x + (j.z / 2), j.y + (j.z / 4));
					break;
				case R.math.Math2D.DIMETRIC_TOP_PROJECTION:
					pt.set(j.x + (j.z / 4), j.y + (j.z / 2));
					break;
			}
			return pt;
		},
		
		/**
		 * Returns a printable version of this object fixed to two decimal places.
		 * @return {String} Formatted as "x,y"
		 */
		toString: function(){
			return Number(this.x).toFixed(2) + "," + Number(this.y).toFixed(2) + "," + Number(this.z).toFixed(2);
		}
		
	}, /** @scope R.math.Point3D.prototype */{ 
		/**
		 * Return the classname of the this object
		 * @return {String} "R.math.Point3D"
		 */
		getClassName: function(){
			return "R.math.Point3D";
		},
		
		/** @private */
		resolved: function() {
         var pp = R.math.Point3D.prototype;
         if (R.engine.Support.sysInfo().browser != "msie") {
            // Define setters and getters
            pp.__defineGetter__("x", function(){
               return this._getVec().e(1);
            });

            pp.__defineSetter__("x", function(val){
               var v = this._getVec();
               v.setElements([val, v.e(2), v.e(3)]);
            });

            pp.__defineGetter__("y", function(){
               return this._getVec().e(2);
            });

            pp.__defineSetter__("y", function(val){
               var v = this._getVec();
               v.setElements([v.e(1), val, v.e(3)]);
            });

            pp.__defineGetter__("z", function(){
               return this._getVec().e(3);
            });

            pp.__defineSetter__("z", function(val){
               var v = this._getVec();
               v.setElements([v.e(1), v.e(2), val]);
            });
         } else {
            Object.defineProperty(pp, "x", {
               get: function() {
                  return this._getVec().e(1);
               },
               set: function(x) {
                  var v = this._getVec();
                  v.setElements([x, v.e(2), v.e(3)]);
               }
            });
            Object.defineProperty(pp, "y", {
               get: function() {
                  return this._getVec().e(2);
               },
               set: function(y) {
                  var v = this._getVec();
                  v.setElements([v.e(1), y, v.e(3)]);
               }
            });
            Object.defineProperty(pp, "z", {
               get: function() {
                  return this._getVec().e(3);
               },
               set: function(z) {
                  var v = this._getVec();
                  v.setElements([v.e(1), v.e(2), z]);
               }
            });

         }

			R.math.Point3D.ZERO = R.math.Point3D.create(0, 0, 0);
		},
		
		/**
		 * The "zero" point
		 * @type {R.math.Point3D}
		 * @memberOf R.math.Point3D
		 */
		ZERO: null 
	});
};