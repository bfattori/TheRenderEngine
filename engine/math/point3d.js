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
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
"use strict";

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
class Point3D extends Point2D {

  constructor(x, y, z) {
    super(x, y);
    this.zed = z;
    return this.set(x, y, z);
  }

  get className() {
    return "Point3D";
  }

  static get __POINT3D() {
    return true;
  }

  get z() {
    return this.zed;
  }

  set z(val) {
    this.zed = val;
  }

  /**
   * Release the point back into the pool for reuse
   */
  release() {
    super.release();
    this.zed = 0;
  }

  /**
   * Returns a simplified version of a R.math.Point3D.  The simplified version is
   * an array with three elements: X, Y, Z.
   * @return {Array}
   */
  simplify() {
    return [this.x, this.y, this.z];
  }

  /**
   * Returns <tt>true</tt> if this point is equal to the specified point.
   *
   * @param point {Point3D} The point to compare to
   * @return {Boolean} <tt>true</tt> if the two points are equal
   */
  equals(point) {
    return super.equals(point) && this.zed === point.z;
  }

  copy(pt) {
    super.copy(pt);
    this.z = pt.z;
    return this;
  }

  /**
   * Set the position of a 3D point.
   *
   * @param x {Point3D|Number|Array} If this arg is a R.math.Point3D, its values will be
   *                           copied into the new point.
   * @param y {Number} The Y coordinate of the point.  Only required if X
   *                   was a number.
   * @param z {Number} The Z coordinate of the point.  Only required if X
   *                         was a number.
   */
  set(x, y = 0, z = 0) {
    console.warn("Calling Point3D.set() is deprecated. Use the X, Y and Z properties instead.")
    super.set(x, y);
    if (R.isArray(x)) {
      // An array
      throw new error("deprecated Point2D.set(ARRAY)");
    }
    else if (x.__POINT3D) {
      this.z = x.z;
    }
    else {
      this.z = z;
    }
    return this;
  }

  /**
   * Set the X coordinate.
   *
   * @param x {Number} The X coordinate
   */
  setX(x) {
    console.warn("Calling Point3D.setX() is deprecated, use properties");
    this.x = x;
  }

  /**
   * Set the Y coordinate.
   *
   * @param y {Number} The Y coordinate
   */
  setY(y) {
    console.warn("Calling Point3D.setY() is deprecated, use properties");
    this.y = y;
  }

  /**
   * Set the Z coordinate.
   *
   * @param z {Number} The Z coordinate
   */
  setZ(z) {
    console.warn("Calling Point3D.setZ() is deprecated, use properties");
    this.z = z;
  }

  /**
   * A method that mutates this point by adding the point to it.
   *
   * @param point {Point3D} A point
   * @return {Point3D} This point
   */
  add(point) {
    super.add(point);
    this.z += point.z;
    return this;
  }

  /**
   * A mutator method that adds the scalar value to each component of this point.
   * @param scalar {Number} A number
   * @return {Point3D} This point
   */
  addScalar(scalar) {
    super.addScalar(scalar);
    this.z += scalar;
    return this;
  }

  /**
   * A mutator method that subtracts the specified point from this point.
   * @param point {Point3D} a point
   * @return {Point3D} This point
   */
  sub(point) {
    super.sub(point);
    this.z -= point.z;
    return this;
  }

  /**
   * A mutator method that multiplies the components of this point with another.
   * @param point {Point3D} A point
   * @return {Point3D} This point
   */
  convolve(point) {
    super.convolve(point);
    this.z *= point.z;
    return this;
  }

  /**
   * A mutator method that divides the components of this point by another.  The point
   * cannot contain zeros for its components.
   * @param point {Point3D} A point
   * @return {Point3D} This point
   */
  convolveInverse(point) {
    super.convolveInverse(point);
    this.z /= point.z;
    return this;
  }

  /**
   * A mutator method that multiplies the components of this point by a scalar value.
   * @param scalar {Number} A number
   * @return {Point3D} This point
   */
  mul(scalar) {
    super.mul(scalar);
    this.z *= scalar;
    return this;
  }

  /**
   * A mutator method that divides the components of this point by a scalar value.
   * @param scalar {Number} A number - cannot be zero
   * @return {Point3D} This point
   */
  div(scalar) {
    super.div(scalar);
    this.z /= scalar;
    return this;
  }

  /**
   * A mutator method that negates this point, inversing it's components.
   * @return {Point3D} This point
   */
  neg() {
    super.neg();
    this.z *= -1;
    return this;
  }

  inv() {
    super.inv();
    this.z *= -1;
    return this;
  }

  /**
   * Returns true if the point is the zero point.
   * @return {Boolean} <tt>true</tt> if the point's elements are all zero.
   */
  isZero() {
    return (super.isZero() && this.z === 0);
  }

  /**
   * Returns the distance between this and another point.
   * @param point {Point3D} The point to compare against
   * @return {Number} The distance between the two points
   */
  dist(point) {
    return Math.sqrt((point.x - this.x) * (point.x - this.x) +
      (point.y - this.y) * (point.y - this.y) +
      (point.z - this.z) * (point.z - this.z));
  }

  /**
   * Returns a printable version of this object fixed to two decimal places.
   * @return {String} Formatted as "x,y"
   */
  toString() {
    return "Point3D(" + Number(this.x).toFixed(2) + "," + Number(this.y).toFixed(2) + "," + Number(this.z).toFixed(2) + ")";
  }

  /** @private */
  static resolved() {
    Point3D.ZERO = Point3D.create(0, 0, 0);
    Object.freeze(Point3D.ZERO);
  }
}