/**
 * The Render Engine
 * ConvexHull
 *
 * @fileoverview A collision shape which represents a convex hull.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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
 * @class A convex hull with which to perform collision testing.  A convex hull
 *        is a simplification of the points which either comprise an object, or
 *        the points around an object.  There are two simplified hull types which
 *        can also be used: {@link R.collision.OBBHull} and {@link R.collision.CircleHull}
 *
 * @param points {Array} An array of {@link R.math.Point2D} which make up the shape to
 *       create the hull from.
 * @param [lod] {Number} The level of detail for the hull.  Larger numbers make for a more
 *       complex hull.  Points will not be created if the number of points availble is
 *       less than the LOD.  Default: 4
 *
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a polygonal convex hull which has, at most, <tt>lod</tt> vertexes.
 */
class ConvexHull extends PooledObject {

  /**
   * An N-gon convex hull shape (3 or more vertexes)
   * @type {Number}
   */
  static CONVEX_NGON = 1;

  /**
   * A circular convex hull shape (center and radius)
   * @type {Number}
   */
  static CONVEX_CIRCLE = 2;

  constructor(points, lod) {
    super("ConvexHull");
    lod = lod || 4;

    // Calculate the center and radius based on the given points
    var cX = 0, cY = 0;
    var x1 = Math2.MAX_INT, x2 = -Math2.MAX_INT;
    var y1 = Math2.MAX_INT, y2 = -Math2.MAX_INT;
    for (var p = 0; p < points.length; p++) {
      cX += points[p].x;
      cY += points[p].y;
    }
    this._center = Point2D.create(cX / points.length, cY / points.length);
    this.oCenter = Point2D.create(this.center);

    // Back through the points again to find the point farthest from the center
    // to create our smallest radius which encloses our shape
    var dist = -1;
    var rVec = Vector2D.create(0, 0);
    var d = Vector2D.create(0, 0);
    for (p = 0; p < points.length; p++) {
      d.set(points[p]);
      d.sub(this.center);
      if (d.len() > dist) {
        dist = d.len();
        rVec.set(d);
      }
    }
    d.destroy();
    this._radius = rVec.len();
    rVec.destroy();

    // Create the simplified hull
    this._vertexes = Math2D.convexHull(points, lod);
    this.oVerts = [];
    this.uVerts = [];
    for (p in this.vertexes) {
      this.oVerts.push(Vector2D.create(this._vertexes[p]));
      this.uVerts.push(Vector2D.create(this._vertexes[p]).sub(this.center));
    }

    this._gameObject = null;
  }

  /**
   * Destroy the object
   */
  destroy() {
    // Destroy the center
    this.oCenter.destroy();
    this._center.destroy();

    // Destroy the verts
    while (this._vertexes.length > 0) {
      this._vertexes.shift().destroy();
    }

    while (this.oVerts.length > 0) {
      this.oVerts.shift().destroy();
    }

    while (this.uVerts.length > 0) {
      this.uVerts.shift().destroy();
    }

    super.destroy();
  }

  /**
   * Return the object to the pool
   */
  release() {
    super.release();

    // Free the matrices
    this.txfm = null;

    // Free the verts and center
    this.hostObj = null;
    this._center = null;
    this.oCenter = null;
    this._vertexes = null;
    this.oVerts = null;
    this.uVerts = null;
  }

  /**
   * Get the class name of this object
   * @return {String} "ConvexHull"
   */
  get className() {
    return "ConvexHull";
  }


  get gameObject() {
    return this._gameObject;
  }

  /**
   * Set the object which is using this collision hull.
   */
  set gameObject(val) {
    this._gameObject = val;
  }

  get center() {
    var txfm = this.hostObj.getTransformationMatrix();
    this._center.set(this.oCenter);
    this._center.transform(txfm);
    return this._center;
  }

  /**
   * Get the radius (distance to farthest point in shape, from center)
   * @return {Number}
   */
  get radius() {
    return this._radius;
  }

  /**
   * Get the array of vertexes in the convex hull
   * @return {Array} of {@link R.math.Point2D}
   */
  get vertexes() {
    var txfm = this.hostObj.getTransformationMatrix();

    // Transform the vertexes
    for (var p = 0; p < this._vertexes.length; p++) {
      this._vertexes[p].set(this.oVerts[p]);
      this._vertexes[p].transform(txfm);
    }
    return this._vertexes;
  }

  /**
   * Get the array of untransformed vertexes in the convex hull
   * @return {Array} of {@link R.math.Point2D}
   */
  getUntransformedVertexes() {
    return this.uVerts;
  }

  /**
   * Return the type of convex hull this represents.
   * @return {Number} {@link #CONVEX_NGON}
   */
  get type() {
    return ConvexHull.CONVEX_NGON;
  }

}