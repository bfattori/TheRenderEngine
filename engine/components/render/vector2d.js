/**
 * The Render Engine
 * Vector2DComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A render component that renders its contents from an <tt>Array</tt> of points.
 *
 * @param name {String} The name of the component
 * @param [priority=0.1] {Number} The priority of the component
 * @extends RenderComponent
 * @constructor
 * @description Creates a 2d vector drawing component
 */
class Vector2DComponent extends RenderComponent {

  constructor(name, priority = 0.1) {
    super(name, priority);
    this.vectorOpts = {
      strokeStyle: "#ffffff", // Default to white lines
      lineWidth: 1,
      fillStyle: null, // Default to none
      points: [],
      bBox: Rectangle2D.create(0, 0, 1, 1),
      closedManifold: true,
      renderState: null,
      noOffset: false,
      convexLOD: 0,
      radius: null
    }
  }

  /**
   * Destroys the object instance
   */
  destroy() {
    this.vectorOpts.bBox.destroy();
    while (this.vectorOpts.points.length > 0) {
      this.vectorOpts.points.shift().destroy();
    }
    super.destroy();
  }

  /**
   * Release the component back into the object pool. See {@link PooledObject#release} for
   * more information.
   */
  release() {
    super.release();
    this.vectorOpts = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "Vector2DComponent"
   */
  get className() {
    return "Vector2DComponent";
  }

  /**
   * Calculate the bounding box from the set of
   * points which comprise the shape to be rendered.
   * @private
   */
  calculateBoundingBox() {
    Math2D.getBoundingBox(this.vectorOpts.points, this.vectorOpts.bBox);
  }

  set noOffset(offs) {
    this.vectorOpts.noOffset = offs;
  }

  /**
   * Set the points which comprise the shape of the object to
   * be rendered to the context.
   *
   * @param pointArray {Array} An array of <tt>Point2D</tt> instances
   * @param [noOffset] {Boolean} If <code>true</code>, does not offset the points relative to
   *        their center.  For objects not drawn around a center point, this allows you to
   *        pass the points literally without translation.
   */
  set points(pointArray) {
    while (this.vectorOpts.points.length > 0) {
      this.vectorOpts.points.shift().destroy();
    }

    for (var p in pointArray) {
      this.vectorOpts.points.push(pointArray[p]);
    }

    this.vectorOpts.renderState = null;

    // Get the center of the bounding box and move all of the points so none are negative
    if (!this.vectorOpts.noOffset) {
      var hP = Point2D.create(this.vectorOpts.bBox.center);
      for (p in this.vectorOpts.points) {
        this.vectorOpts.points[p].add(hP);
      }
      hP.destroy();
    }

    this.calculateBoundingBox();
    this.gameObject.markDirty();
  }

  /**
   * Transform all of the points by the given matrix
   * @param matrix {Matrix}
   */
  transformPoints(matrix) {
    for (var c = 0; c < this.vectorOpts.points.length; c++) {
      this.vectorOpts.points[c].transform(matrix);
    }
    this.calculateBoundingBox();
    this.gameObject.markDirty();
  }

  /**
   * Get the box which would enclose the shape
   * @return {Rectangle2D}
   */
  get boundingBox() {
    return this.vectorOpts.bBox;
  }

  /**
   * Get the center point from all of the points
   * @return {Point2D}
   */
  get center() {
    return this.vectorOpts.bBox.center;
  }

  set convexLevelOfDetail(lod) {
    this.vectorOpts.convexLOD = lod;
  }

  /**
   * Get a convex hull that would enclose the points.  The the LOD isn't
   * specified, it will be assumed to be 4.
   */
  get convexHull() {
    var LOD = this.vectorOpts.convexLOD;
    if (LOD === 0) {
      LOD = this.vectorOpts.points.length - 1;
    }
    return ConvexHull.create(this.vectorOpts.points, LOD);
  }

  /**
   * Get an Object Bounding Box (OBB) convex hull.
   */
  get OBBHull() {
    return OBBHull.create(this.boundingBox);
  }

  set circleHullRadius(radius) {
    this.vectorOpts.radius = radius;
  }

  /**
   * Get a circular convex hull which encloses the points.
   */
  get circleHull() {
    return CircleHull.create(this.vectorOpts.points, this.vectorOpts.radius);
  }

  /**
   * Set the color of the lines to be drawn for this shape.
   *
   * @param strokeStyle {String} The HTML color of the stroke (lines) of the shape
   */
  set lineStyle(strokeStyle) {
    this.vectorOpts.strokeStyle = strokeStyle;
    this.gameObject.markDirty();
  }

  /**
   * Returns the line style that will be used to draw this shape.
   * @return {String}
   */
  get lineStyle() {
    return this.vectorOpts.strokeStyle;
  }

  /**
   * Set the width of lines used to draw this shape.
   *
   * @param lineWidth {Number} The width of lines in the shape
   */
  set lineWidth(lineWidth) {
    this.vectorOpts.lineWidth = lineWidth;
    this.gameObject.markDirty();
  }

  /**
   * Returns the width of the lines used to draw the shape.
   * @return {Number}
   */
  get lineWidth() {
    return this.vectorOpts.lineWidth;
  }

  /**
   * Set the color used to fill the shape.
   *
   * @param fillStyle {String} The HTML color used to fill the shape.
   */
  set fillStyle(fillStyle) {
    this.vectorOpts.fillStyle = fillStyle;
    this.gameObject.markDirty();
  }

  /**
   * Returns the fill style of the shape.
   * @return {String}
   */
  get fillStyle() {
    return this.vectorOpts.fillStyle;
  }

  /**
   * Set whether or not we draw a polygon or polyline.  <tt>true</tt>
   * to draw a polygon (the path formed by the points is a closed loop.
   */
  set closed(closed) {
    this.vectorOpts.closedManifold = closed;
    this.gameObject.markDirty();
  }

  get closed() {
    return this.vectorOpts.closedManifold;
  }

  /**
   * Draw the shape, defined by the points, to the rendering context
   * using the specified line style and fill style.
   *
   * @param renderContext {AbstractRenderContext} The context to render to
   */
  render(renderContext) {
    if (!(this.vectorOpts.points && super.render(renderContext))) {
      return;
    }

    // Set the stroke and fill styles

    if (this.vectorOpts.lineStyle != null) {
      renderContext.lineStyle = this.vectorOpts.strokeStyle;
    }

    renderContext.lineWidth = this.vectorOpts.lineWidth;

    this.transformOrigin(renderContext, true);

    // Render out the points
    if (this.vectorOpts.closedManifold) {
      renderContext.drawPolygon(this.vectorOpts.points);
    } else {
      renderContext.drawPolyline(this.vectorOpts.points);
    }

    if (this.vectorOpts.fillStyle) {
      renderContext.fillStyle = this.vectorOpts.fillStyle;
      renderContext.drawFilledPolygon(this.vectorOpts.points);
    }

    this.transformOrigin(renderContext, false);

  }
}
