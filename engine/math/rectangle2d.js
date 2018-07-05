/**
 * The Render Engine
 * Rectangle2D
 *
 * @fileoverview A Rectangle2D class
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
 * @class A 2D rectangle class with helpful manipulation methods.
 * @extends R.math.PooledMathObject
 * @constructor
 * @param x {Rectangle2D|Number} A rectangle to clone, or the top-left X coordinate
 * @param y {Number} The top-left Y coordinate
 * @param width {Number} the width of the rectangle
 * @param height {Number} The height of the rectangle
 * @description Create a rectangle object specifying the X and Y position and
 *    the width and height.
 */
class Rectangle2D extends PooledObject {

  /** @private */
  constructor(x, y, width, height) {
    super("Rectangle2D");

    this.topLeft = Point2D.create(x, y);
    this.dims = Point2D.create(width, height);
    this._bottomRight = Point2D.create(x + width, y + height);
    this._topRight = Point2D.create(x + width, y);
    this._bottomLeft = Point2D.create(x, y + height);
    this._center = Point2D.create(x + ((x + width) / 2), y + ((y + height) / 2));
  }

  get className() {
    return "Rectangle2D";
  }

  /**
   * Destroy the rectangle instance
   */
  destroy() {
    this.topLeft.destroy();
    this._bottomRight.destroy();
    this.dims.destroy();
    this._center.destroy();
    this._topRight.destroy();
    this._bottomLeft.destroy();
    super.destroy();
  }

  /**
   * Release the rectangle back into the pool for reuse
   */
  release() {
    super.release();
    this.topLeft = null;
    this.dims = null;
    this._bottomRight = null;
    this._center = null;
    this._topRight = null;
    this._bottomLeft = null;
  }

  static get __RECTANGLE2D() {
    return true;
  }

  get x() {
    return this.topLeft.x;
  }

  get y() {
    return this.topLeft.y;
  }

  get width() {
    return this.dims.x;
  }

  get height() {
    return this.dims.y;
  }

  get right() {
    return this.x + this.width;
  }

  get bottom() {
    return this.y + this.height;
  }

  get center() {
    this._center.set(this.x + (this.width * 0.5), this.y + (this.heigth * 0.5));
    return this._center;
  }

  get topRight() {
    this._topRight.x = this.x + this.width;
    this._topRight.y = this.y;
    return this._topRight;
  }

  get bottomLeft() {
    this._bottomLeft.x = this.x;
    this._bottomLeft.y = this.y + this.height;
    return this._bottomLeft;
  }

  get bottomRight() {
    return this._bottomRight;
  }

  set x(val) {
    this.topLeft.x = val;
  }

  set y(val) {
    this.topLeft.y = val;
  }

  set width(val) {
    this.dims.x = val;
  }

  set height(val) {
    this.dims.y = val;
  }

  set right(val) {
    this.dims.x = (val - this.topLeft.x);
  }

  set bottom(val) {
    this.dims.y = (val - this.topLeft.y);
  }

  copy(rect) {
    this.topLeft.copy(rect.topLeft);
    this.dims.copy(rect.dims);
    return this;
  }

  /**
   * Set the values of this rectangle.
   *
   * @param x {Array|Number|Rectangle2D} An optional value to initialize the X coordinate of the rectangle, or a rectangle to clone
   * @param y {Number} An optional value to initialize the Y coordinate of the rectangle
   * @param width {Number} An optional value to initialize the width of the rectangle
   * @param height {Number} An optional value to initialize the height of the rectangle
   */
  set(x, y, width, height) {
    console.warn("Calling Rectangle2D.set() is deprecated. Use properties instead.");
    if (R.isArray(x)) {
      throw error("Rectangle2D.set(ARRAY) deprecated");
    } else if (x.__RECTANGLE2D) {
      this.x = x.x;
      this.y = x.y;
      this.width = x.width;
      this.height = x.height;
    } else if (x.__POINT2D) {
      throw error("Rectangle2D.set(Point2D) deprecated");
    } else {
      this.topLeft.x = x;
      this.topLeft.y = y;
      this.dims.x = width;
      this.dims.y = height;
    }
    return this;
  }

  /**
   * Get an object with the elements containing left, top, width, height, right
   * and bottom as the elements x, y, w, h, r, and b.
   *
   * @return {Object} An object with the specified elements
   * @deprecated
   */
  get() {
    return {x: this.x, y: this.y, width: this.width, height: this.height, right: this.right, bottom: this.bottom};
  }

  /**
   * Returns <tt>true</tt> if this rectangle is equal to the specified rectangle.
   *
   * @param rect {Rectangle2D} The rectangle to compare to
   * @return {Boolean} <tt>true</tt> if the two rectangles are equal
   */
  equals(rect) {
    return (this.x === rect.x && this.y === rect.y &&
    this.width === rect.width && this.h === rect.height);
  }

  /**
   * A mutator method that offsets this rectangle by the given amount in the X and Y axis.
   * The first parameter can be either a point, or the value for the X axis.  If the X axis is
   * specified, the second parameter should be the amount to offset in the Y axis.
   *
   * @param offsetX {Point2D|int} Either a {@link Point2D} which contains the offset in X and Y, or an integer
   *                                representing the offset in the X axis.
   * @param offsetY {int} If <code>offsetPtOrX</code> is an integer value for the offset in the X axis, this should be
   *                      the offset along the Y axis.
   * @return {Rectangle2D} This rectangle
   */
  offset(offsetX, offsetY) {
    if (offsetX.__POINT2D) {
      this.x += offsetX.x;
      this.y += offsetX.y;
    } else {
      this.x += offsetX;
      this.y += offsetY;
    }
    return this;
  }

  /**
   * Shrink the size of the rectangle by the amounts given.
   * @param pixelsX {Number} The pixels to shrink the rectangle along the X axis, or both.
   * @param [pixelsY] {Number} If defined, the pixels to shrink the rectangle along the Y axis.
   */
  shrink(pixelsX, pixelsY) {
    pixelsY = pixelsY || pixelsX;

    var shrink = [pixelsX / 2, pixelsY / 2];
    this.width -= shrink[0];
    this.height -= shrink[1];
    this.x += shrink[0];
    this.y += shrink[1];
    return this;
  }

  /**
   * Grow the size of the rectangle by the amounts given.
   * @param pixelsX {Number} The pixels to grow the rectangle along the X axis, or both.
   * @param [pixelsY] {Number} If defined, the pixels to grow the rectangle along the Y axis.
   */
  grow(pixelsX, pixelsY) {
    return this.shrink((-1 * pixelsX), (-1 * pixelsY));
  }

  /**
   * Set the top left of this rectangle to the point, or coordinates specified.
   *
   * @param ptOrX {R.math.Point2D|Number} The top left {@link R.math.Point2D}, or the X coordinate
   * @param y {Number} If the top left wasn't specified as the first argument, this is the Y coordinate
   */
  setTopLeft(ptOrX, y) {
    throw error("Rectangle2D.setTopLeft() is deprecated. Use properties.");
  }

  /**
   * Set the width and height of this rectangle using the point, or coordinates specified.
   * @param ptOrX {Point2D|Number} A {@link R.math.Point2D}, or the X coordinate
   * @param [y] {Number} If the top left isn't a point, this is the Y coordinate
   */
  setDims(ptOrX, y) {
    throw error("Rectangle2D.setDims() is deprecated. Use properties.");
  }

  /**
   * Set the width of the rectangle.
   *
   * @param width {Number} The new width of the rectangle
   */
  setWidth(width) {
    throw error("Rectangle2D.setWidth() is deprecated. Use properties.");
  }

  /**
   * Set the height of the rectangle
   *
   * @param height {Number} The new height of the rectangle
   */
  setHeight(height) {
    throw error("Rectangle2D.setHeight() is deprecated. Use properties.");
  }

  /**
   * Determine if this rectangle intersects another rectangle.
   *
   * @param rect {Rectangle2D} Rectangle to compare against
   * @return {Boolean} <tt>true</tt> if the two rectangles intersect.
   */
  isIntersecting(rect) {
    return !(this.right < rect.x ||
    this.x > rect.right ||
    this.y > rect.bottom ||
    this.bottom < rect.y);
  }

  /**
   * Determine if this rectangle is contained within the specified rectangle.
   *
   * @param rect A {@link R.math.Rectangle2D} to compare against
   * @return {Boolean} <tt>true</tt> if the this rectangle is fully contained in the specified rectangle.
   */
  isContained(rect) {
    return ((this.x >= rect.x) &&
    (this.y >= rect.y) &&
    (this.right <= rect.right) &&
    (this.bottom <= rect.bottom));
  }

  /**
   * Determine if this rectangle contains the specified rectangle.
   *
   * @param rect A {@link R.math.Rectangle2D} to compare against
   * @return {Boolean} <tt>true</tt> if the rectangle is fully contained within this rectangle.
   */
  containsRect(rect) {
    return rect.isContained(this);
  }

  /**
   * Returns <tt>true</tt> if this rectangle contains the specified point.
   *
   * @param point {Point2D} The point to test
   * @return {Boolean} <tt>true</tt> if the point is within this rectangle
   */
  containsPoint(point) {
    return (point.x >= this.x &&
    point.y >= this.y &&
    point.x <= this.right &&
    point.y <= this.bottom);
  }

  /**
   * Returns a {@link R.math.Point2D} that contains the center point of this rectangle.
   *
   * @return {R.math.Point2D} The center point of the rectangle
   */
  getCenter() {
    console.warn("Rectangle2D.getCenter() use property 'center'");
    return this.center;
  }

  /**
   * Returns the half length of the width dimension of this rectangle
   * @return {Number} The half-width
   */
  get halfWidth() {
    return this.len_x() * 0.5;
  }

  /**
   * Returns the half length of the height dimension of this rectangle
   * @return {Number} The half-height
   */
  get halfHeight() {
    return this.len_y() * 0.5;
  }

  /**
   * Returns the positive length of this rectangle, along the X axis.
   *
   * @return {Number}
   */
  len_x() {
    return Math.abs(this.width);
  }

  /**
   * Returns the positive length of this rectangle, along the Y axis.
   *
   * @return {Number}
   */
  len_y() {
    return Math.abs(this.width);
  }

  /**
   * Gets a {@link Point2D} representing the top-left corner of this rectangle.
   * @return {Point2D}
   */
  getTopLeft() {
    console.warn("Rectangle2D.getTopLeft() deprecated - use property topLeft");
    return this.topLeft;
  }

  /**
   * Gets a {@link Point2D) representing the width and height of this rectangle.
         * @return {Point2D}
   */
  getDims() {
    console.warn("Rectangle2D.getDims() deprecated - use property dims");
    return this.dims;
  }

  /**
   * Gets a {@link Point2D} representing the bottom-right corner of this rectangle.
   * @return {Point2D}
   */
  getBottomRight() {
    console.warn("Rectangle2D.getBottomRight() deprecated - use property bottomRight");
    return this._bottomRight;
  }

  /**
   * Mutator method which will join this rectangle with another
   * rectangle.  Joining two rectangles will create a rectangle that
   * would enclose both rectangles.  It is best to see if two rectangles
   * are overlapping before joining them, since joining two disjoint
   * rectangles would enclose areas not contained in either.
   *
   * @param rect {Rectangle2D} The rectangle to join with
   * @return {Rectangle2D} This rectangle
   */
  join(rect) {
    var x1 = this.x;
    var x2 = this.x + this.width;
    var x3 = rect.x;
    var x4 = rect.x + rect.width;
    var y1 = this.y;
    var y2 = this.y + this.height;
    var y3 = rect.y;
    var y4 = rect.y + rect.height;

    var x = x1, w = x2;
    var y = y1, h = y2;

    if (x3 < x) {
      x = x3;
    }
    if (x4 > w) {
      w = x4;
    }
    if (y3 < y) {
      y = y3;
    }
    if (y4 > h) {
      h = y4;
    }

    this.x = x;
    this.y = y;
    this.width = w - x;
    this.height = h - y;
    return this;
  }

  /**
   * Get the rectangle as an array of points, in clockwise order
   * @returns {Array}
   */
  getPoints() {
    return [this.topLeft, this.topRight, this._bottomRight, this.bottomLeft];
  }

  /**
   * Returns a printable version of this object.
   * @return {String} Formatted like "x,y [w,h]"
   */
  toString() {
    return "Rectangle2D(" + this.topLeft + " [" + this.dims + "])";
  }

}
