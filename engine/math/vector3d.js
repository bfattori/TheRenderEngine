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
 * @class A 3D vector class with helpful manipulation methods.
 *
 * @param x {Point3D|Number} If this arg is a R.math.Vector3D, its values will be
 *                           copied into the new vector.  If a number,
 *                           the X length of the vector.
 * @param y {Number} The Y length of the vector.  Only required if X
 *                   was a number.
 * @param z {Number} The Z length of the vector.  Only required if X
 *                   was a number.
 * @constructor
 * @description Create a new 3D Vector
 * @extends Point3D
 */
class Vector3D extends Point3D {

  constructor(x, y, z) {
    super(x, y, z);
  }

  /**
   * Return the classname of the this object
   * @return {String} "R.math.Vector3D"
   */
  get className() {
    return "Vector3D";
  }

  /** @private */
  static resolved() {
    Vector3D.ZERO = Vector3D.create(0, 0, 0);
    Object.freeze(Vector3D.ZERO);
  }

  /**
   * A mutator method that normalizes this vector, returning a unit length vector.
   * @return {R.math.Vector3D} This vector, normalized
   * @see #len
   */
  normalize() {
    var ln = this.length;
    if (ln != 0) {
      this.x /= ln;
      this.y /= ln;
      this.z /= ln;
    }
    return this;
  }

  /**
   * Get the magnitude/length of this vector.
   *
   * @return {Number} A value representing the length (magnitude) of the vector.
   */
  get length() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this._zed * this._zed));
  }

  /**
   * Get the dot product of this vector and another.
   * @param vector {Vector3D} The Point to perform the operation against.
   * @return {Number} The dot product
   */
  dot(vector) {
    return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
  }

  /**
   * A mutator method that gets the cross product of this vector and another.
   * @param vector {Vector3D} The vector to perform the operation against.
   * @return {Vector3D} This vector
   */
  cross(vector) {
    this.x = this.y - vector.y;
    this.y = vector.x - this.x;
    this.z = (this.x * vector.y) - (this.y * vector.x);
    return this;
  }

  /**
   * Returns the angle (in degrees) between two vectors.  This assumes that the
   * point is being used to represent a vector, and that the supplied point
   * is also a vector.
   *
   * @param vector {Vector3D} The vector to perform the angular determination against
   * @return {Number} The angle between two vectors, in degrees
   */
  angleBetween(vector) {
    var v1 = $V([this.x, this.y, this.z]), v2 = $V([vector.x, vector.y, vector.z]);
    return Math2D.radToDeg(v1.angleFrom(v2));
  }

}
