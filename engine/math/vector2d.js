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
"use strict";

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
 * @extends Point2D
 */
class Vector2D extends Point2D {

  /**
   * Return the classname of the this object
   * @return {String} "R.math.Vector2D"
   */
  get className() {
    return "Vector2D";
  }

  /**
   * A mutator method that normalizes this vector, returning a unit length vector.
   * @return {Vector2D} This vector, normalized
   * @see #len
   */
  normalize() {
    var ln = this.length;
    if (ln != 0) {
      this.x /= ln;
      this.y /= ln;
    }
    return this;
  }

  /**
   * Get the magnitude/length of this vector.
   *
   * @return {Number} A value representing the length (magnitude) of the vector.
   */
  get length() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
  }

  /**
   * Set the magnitude/length of this vector without altering the angle
   * @param len {Number} The length
   */
  set length(len) {
    var angle = R.math.Math2D.degToRad(this.angle);
    this.x = Math.cos(angle) * len;
    this.y = Math.sin(angle) * len;
    if (Math.abs(this.x) < 0.00000001) this.x = 0;
    if (Math.abs(this.y) < 0.00000001) this.y = 0;
  }

  /**
   * Get the angle, in degrees, of this vector.
   * @return {Number}
   */
  get angle() {
    return R.math.Math2D.radToDeg(Math.atan2(this.y, this.x));
  }

  /**
   * Set the angle of this vector without altering the length
   * @param angle {Number} The angle
   */
  set angle(angle) {
    var len = this.length;
    this.x = Math.cos(R.math.Math2D.degToRad(angle)) * len;
    this.y = Math.sin(R.math.Math2D.degToRad(angle)) * len;
  }

  /**
   * Is the vector to the right or left of this one?
   * @param vector {Vector2D} The vectore to compare against
   * @return {Number} -1 (left) 1 (right)
   */
  getSign(vector) {
    return this.rightNormal().dot(vector) < 0 ? -1 : 1;
  }

  /**
   * Get the dot product of this vector and another.
   * @param vector {Vector2D} The Point to perform the operation against.
   * @return {Number} The dot product
   */
  dot(vector) {
    return (this.x * vector.x) + (this.y * vector.y);
  }

  /**
   * A mutator method that gets the cross product of this vector and another.
   * @param vector {Vector2D} The vector to perform the operation against.
   * @return {Vector2D} This vector
   */
  cross(vector) {
    this.x = this.y - vector.y;
    this.y = vector.x - this.x;
    // this.z = (this.x * vector.y) - (this.y * vector.x);
    return this;
  }

  truncate(max) {
    if (this.length > max) {
      this.length = max;
    }
    return this;
  }

  /**
   * Returns the angle (in degrees) between two vectors.  This assumes that the
   * point is being used to represent a vector, and that the supplied point
   * is also a vector.
   *
   * @param vector {R.math.Vector2D} The vector to perform the angular determination against
   * @return {Number} The angle between two vectors, in degrees
   */
  angleBetween(vector) {
    var t = R.clone(this).normalize(), v = R.clone(vector).normalize(),
      a = Math.acos(t.dot(v));

    t.destroy();
    v.destroy();
    return R.math.Math2D.radToDeg(a);
  }

  /**
   * Returns the signed angle (in degrees) between two vectors.  This assumes that the
   * point is being used to represent a vector, and that the supplied point
   * is also a vector.
   *
   * @param vector {Vector2D} The vector to perform the angular determination against
   * @return {Number} The angle between two vectors, in degrees
   */
  signedAngleBetween(vector) {
    var t = R.clone(this).normalize(), v = R.clone(vector).normalize(),
      a = Math.atan2(v.y, v.x) - Math.atan2(t.y, t.x);

    t.destroy();
    v.destroy();
    return R.math.Math2D.radToDeg(a);
  }

  /**
   * Returns <tt>true</tt> if this vector is parallel to <tt>vector</tt>.
   * @param vector {Vector2D} The vector to compare against
   * @return {Boolean}
   */
  isParallelTo(vector) {
    var v1 = $V([this.x, this.y, 1]), v2 = $V([vector.x, vector.y, 1]);
    return v1.isParallelTo(v2);
  }

  /**
   * Returns <tt>true</tt> if this vector is anti-parallel to <tt>vector</tt>.
   * @param vector {Vector2D} The vector to compare against
   * @return {Boolean}
   */
  isAntiparallelTo(vector) {
    var v1 = $V([this.x, this.y, 1]), v2 = $V([vector.x, vector.y, 1]);
    return v1.isAntiparallelTo(v2);
  }

  /**
   * Returns <tt>true</tt> if this vector is perpendicular to <tt>vector</tt>.
   * @param vector {Vector2D} The vector to compare against
   * @return {Boolean}
   */
  isPerpendicularTo(vector) {
    var v1 = $V([this.x, this.y, 1]), v2 = $V([vector.x, vector.y, 1]);
    return v1.isPependicularTo(v2);
  }

  /**
   * Mutator method that modifies the vector rotated <tt>angle</tt> degrees about
   * the vector defined by <tt>axis</tt>.
   *
   * @param angle {Number} The rotation angle in degrees
   * @param axis {Vector2D} The axis to rotate about
   * @return {Vector2D} This vector
   */
  rotate(angle, axis) {
    var v1 = $V([this.x, this.y, 1]);
    var v3 = v1.rotate(R.math.Math2D.degToRad(angle), axis);
    this.x = v3.elements[0];
    this.y = v3.elements[1];
    return this;
  }

  /**
   * Project this vector onto <tt>vector</tt>.
   *
   * @param vector {Vector2D} The vector to project onto
   * @return {Vector2D} new vector
   */
  projectOnto(vector) {
    var proj = R.math.Vector2D.create(0, 0), v = vector, dp = this.dot(vector);
    proj.set((dp / (v.x * v.x + v.y * v.y)) * v.x, (dp / (v.x * v.x + v.y * v.y)) * v.y);
    return proj;
  }

  /**
   * Get the right-hand normal of this vector.  The left-hand
   * normal would simply be <tt>this.rightNormal().neg()</tt>.
   * @return {Vector2D} new vector
   */
  rightNormal() {
    return R.math.Vector2D.create(-this.y, this.x).normalize();
  }

  /**
   * Get the perproduct (sign) of this vector and <tt>vector</tt>.  Returns
   * -1 if <tt>vector</tt> is to the left, or 1 if it is to the right
   * of this vector.
   * @param vector {Vector2D} The other vector
   * @return {Number}
   */
  perProduct(vector) {
    return this.dot(vector.rightNormal());
  }

  static resolved() {
    Vector2D.ZERO = Vector2D.create(0, 0);
    Vector2D.UP = Vector2D.create(0, -1);
    Vector2D.LEFT = Vector2D.create(-1, 0);
    Vector2D.DOWN = Vector2D.create(0, 1);
    Vector2D.RIGHT = Vector2D.create(1, 0);
    if (Object.freeze) {
      Object.freeze(Vector2D.ZERO);
      Object.freeze(Vector2D.UP);
      Object.freeze(Vector2D.LEFT);
      Object.freeze(Vector2D.DOWN);
      Object.freeze(Vector2D.RIGHT);
    }
  }


}
