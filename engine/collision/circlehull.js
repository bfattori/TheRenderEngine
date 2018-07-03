/**
 * The Render Engine
 * CircleHull
 *
 * @fileoverview A collision shape which represents a circular hull.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1573 $
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
 * @class A circular convex hull.
 *
 * @param center {Rectangle2D|Point2D} Either the circle's center point, or a rectangle to use
 *          to approximate the bounding circle.
 * @param radius {Number} The circle's radius if the first argument is a <tt>Point2D</tt>, or a
 *          percentage of the calculated radius if the first argument is an <tt>Array</tt>.
 *
 * @extends R.collision.ConvexHull
 * @constructor
 * @description Creates a circular hull.
 */
class CircleHull extends ConvexHull {

  constructor(center, radius) {
    // Approximate with a rectangle
    var rect;
    if (center instanceof Rectangle2D) {
      rect = center;
    } else {
      var p = center;
      rect = Rectangle2D.create(p.x - radius, p.y - radius, p.x + radius, p.y + radius);
    }
    super(rect.getPoints());
    rect.destroy();
  }

  /**
   * Get the class name of this object
   * @return {String} "R.collision.CircleHull"
   */
  get className() {
    return "CircleHull";
  }

  /**
   * Return the type of convex hull this represents.
   * @return {Number} {@link ConvexHull#CONVEX_CIRCLE}
   */
  get type() {
    return ConvexHull.CONVEX_CIRCLE;
  }

}

