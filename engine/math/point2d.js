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
class Point2D extends PooledObject {
    /**
     * @private
     */
    constructor(x, y) {
        super("Point2D");
        this.data = this.data || [0, 0];
        this.x = x;
        this.y = y;
    }

    static get __POINT2D() {
        return true;
    }

    get x() {
        return this.data[0];
    }

    get y() {
        return this.data[1];
    }

    set x(val) {
        this.data[0] = val;
    }

    set y(val) {
        this.data[1] = val;
    }

    /**
     * Release this point into the pool for reuse.
     */
    release() {
        super.release();
        this.x = 0;
        this.y = 0;
    }

    /**
     * Returns a simplified version of a R.math.Point2D.  The simplified version is
     * an array with two elements: X, Y.
     * @return {Array}
     */
    simplify() {
        return [this.x, this.y];
    }

    /**
     * Returns <tt>true</tt> if this point is equal to the specified point.
     *
     * @param point {Point2D} The point to compare to
     * @return {Boolean} <tt>true</tt> if the two points are equal
     */
    equals(point) {
        return (this.x == point.x && this.y == point.y);
    }

    copy(pt) {
        this.x = pt.x;
        this.y = pt.y;
        return this;
    }

    /**
     * Set the position of a 2D point.
     *
     * @param x {Point2D|Number|Array} If this arg is a R.math.Point2D, its values will be
     *                           copied into the new point.
     * @param y {Number} The Y coordinate of the point.  Only required if X
     *                   was a number.
     */
    set(x, y) {
        console.warn("Calling Point2D.set() is deprecated. Use the X and Y properties instead.")
        if (R.isArray(x)) {
            // An array
            throw new error("deprecated Point2D.set(ARRAY)");
        }
        else if (x.__POINT2D) {   // Instead of an "instanceof" check
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y || 0;
        }
        return this;
    }

    /**
     * Set the X coordinate.
     *
     * @param x {Number} The X coordinate
     */
    setX(x) {
        console.warn("Calling Point2D.setX() is deprecated, use properties");
        this.x = x;
        return this;
    }

    /**
     * Set the Y coordinate.
     *
     * @param y {Number} The Y coordinate
     */
    setY(y) {
        console.warn("Calling Point2D.setY() is deprecated, use properties");
        this.y = y;
        return this;
    }

    /**
     * A method that mutates this point by adding the point to it.
     *
     * @param point {Point2D} A point
     * @return {Point2D} This point
     */
    add(point) {
        this.x += point.x;
        this.y += point.y;
        return this;
    }

    /**
     * A mutator method that adds the scalar value to each component of this point.
     * @param scalar {Number} A number
     * @return {Point2D} This point
     */
    addScalar(scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    }

    /**
     * A mutator method that subtracts the specified point from this point.
     * @param point {Point2D} a point
     * @return {Point2D} This point
     */
    sub(point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }

    /**
     * A mutator method that multiplies the components of this point with another.
     * @param point {Point2D} A point
     * @return {Point2D} This point
     */
    convolve(point) {
        this.x *= point.x;
        this.y *= point.y;
        return this;
    }

    /**
     * A mutator method that divides the components of this point by another.  The point
     * cannot contain zeros for its components.
     * @param point {Point2D} A point
     * @return {Point2D} This point
     */
    convolveInverse(point) {
        this.x /= point.x;
        this.y /= point.y;
        return this;
    }

    /**
     * A mutator methor that multiplies the components of this point by a scalar value.
     * @param scalar {Number} A number
     * @return {Point2D} This point
     */
    mul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * A mutator method that divides the components of this point by a scalar value.
     * @param scalar {Number} A number - cannot be zero
     * @return {Point2D} This point
     */
    div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    /**
     * A mutator method that negates this point, inversing it's components.
     * @return {Point2D} This point
     */
    neg() {
        this.x *= -1;
        this.y *= -1;
        return this;
    }

    /**
     * A mutator method that inverts this point, negating both units.
     * @return {Point2D} This point
     */
    inv() {
        this.neg();
        return this;
    }

    /**
     * Returns true if the point is the zero point.
     * @return {Boolean} <tt>true</tt> if the point's elements are both zero.
     */
    isZero() {
        return (this.x === 0 && this.y === 0);
    }

    /**
     * Returns the distance between this and another point.
     * @param point {Point2D} The point to compare against
     * @return {Number} The distance between the two points
     */
    dist(point) {
        return Math.sqrt((point.x - this.x) * (point.x - this.x) +
          (point.y - this.y) * (point.y - this.y));
    }

    /**
     * Mutator method which transforms this point by the specified matrix
     * @param matrix {Matrix} The matrix to transform this point by.  <tt>Matrix</tt>
     * is defined in the Sylvester library.
     *
     * @return {Point2D} This point
     */
    transform(matrix) {
        var v = matrix.multiply({ modulus:true, elements:[this.x, this.y, 1] });
        this.x = v.elements[0];
        this.y = v.elements[1];
        return this;
    }

    jitter(amt) {
        var j = Point2D.create(R.lang.Math2.randomRange(-amt, amt, true),
          R.lang.Math2.randomRange(-amt, amt, true));

        this.add(j);
        j.destroy();
        return this;
    }

    /**
     * Returns a printable version of this object fixed to two decimal places.
     * @return {String} Formatted as "x,y"
     */
    toString() {
        return "Point2D(" + Number(this.x).toFixed(2) + "," + Number(this.y).toFixed(2) + ")";
    }

    get className() {
        return "Point2D";
    }

    /** @private */
    static resolved() {
        Point2D.ZERO = Point2D.create(0, 0);
        Object.freeze(Point2D.ZERO);
    }
}
