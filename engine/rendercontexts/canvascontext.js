/**
 * The Render Engine
 * CanvasContext
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A <tt>canvas</tt> element represented within the engine.  A canvas
 * is a 2D context which can render lines, images, and polygons.  Transformations
 * can be saved and restored, allowing for complex, stacked transformations.
 *
 * @extends RenderContext2D
 * @constructor
 * @description Create a new instance of a canvas context.
 * @param name {String} The name of the context
 * @param width {Number} The width (in pixels) of the canvas context.
 * @param height {Number} The height (in pixels) of the canvas context.
 */
class CanvasContext extends RenderContext2D {

  constructor(name = "CanvasContext", width = null, height = null) {
    Assert((width != null && height != null), "Width and height must be specified in CanvasContext");

    this.width = width;
    this.height = height;
    this._context2D = null;

    // Create the canvas element
    let canvas = document.createElement("canvas");

    super(name, canvas);
    this.viewport = Rectangle2D.create(0, 0, width, height);

    canvas.id = this.id;

    // Adjust the element accordingly
    canvas.setAttribute("width", this.width);
    canvas.setAttribute("height", this.height);

    // Set the number of divisions along X and Y
    this.divisions = 5;
    this.dirtyBins = {};
    this.firstFrame = true;
    this.wScale = Point2D.create(1, 1);
  }

  /**
   * Releases the context back into the object pool.  See {@link PooledObject#release}
   * for more information.
   */
  release() {
    super.release();
    this._context2D = null;
  }

  destroy() {
    this.wScale.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.rendercontexts.CanvasContext"
   */
  get className() {
    return "CanvasContext";
  }

  /**
   * Set the number of divisions along the X and Y axis used to determine the
   * number of dirty rectangles for the current viewport.
   *
   * @param divisions {Number} The number of divisions along X and Y.  Defaults to 5.
   */
  setDivisions(divisions) {
    this.divisions = divisions;
  }

  /**
   * Set the scale of the world
   * @param scaleX {Number} The scale of the world along the X axis
   * @param scaleY {Number} The scale of the world along the y axis
   */
  setWorldScale(scaleX, scaleY) {
    this.worldScale = scaleX;
    this.wScale.x = scaleX;
    this.wScale.y = scaleY || scaleX;

    this.viewport.x = 0;
    this.viewport.y = 0;
    this.viewport.width = this.width * (1 / scaleX);
    this.viewport.height = this.height * (1 / this.wScale.y);
  }

  get worldScale() {
    return this.wScale;
  }

  /**
   * Gets the surface context upon which all objects are drawn.
   * @return {Object}
   */
  get context2D() {
    if (this._context2D == null) {
      this._context2D = this.surface.getContext('2d');
    }
    return this._context2D;
  }

  /**
   * Push a transform state onto the stack.
   */
  pushTransform() {
    super.pushTransform();
    this.context2D.save();
  }

  /**
   * Pop a transform state off the stack.
   */
  popTransform() {
    super.popTransform();
    this.context2D.restore();
  }


  //================================================================
  // Drawing functions

  /**
   * Reset the entire context, clearing it and preparing it for drawing.
   * @param rect {Rectangle2D}
   */
  reset(rect) {
    if (!RenderEngine.options.useDirtyRectangles) {
      var cRect = (rect != null ? rect : this.viewport);
      this.context2D.clearRect(cRect.x, cRect.y, cRect.width, cRect.height);
    }
  }

  /**
   * Set up the world for the given time before any rendering is dont.
   * @param time {Number} The render time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  setupWorld(time, dt) {
    this.setScale(this.wScale.x, this.wScale.y);

    //if (RenderEngine.getDebugMode()) {
    //    this.setLineStyle("yellow");
    //    this.setLineWidth(1);
    //    this.drawRectangle(this.getViewport());
    //}

    super.setupWorld(time, dt);
  }

  /**
   * Capture the dirty rectangles for the bin
   * @param {Object} bin
   * @param {Object} itr
   */
  captureBin(bin, itr) {
    var dBin = this.dirtyBins["Bin" + bin];
    if (!dBin) {
      dBin = this.dirtyBins["Bin" + bin] = [];
    }

    // Brute force method
    itr.reset();
    while (itr.hasNext()) {
      var obj = itr.next();
      if (obj.wasDirty) {
        dBin.push({
          p: obj.AABB.getTopLeft(),
          d: this.getImage(obj.AABB)
        });
      }
    }
    itr.reset();
  }

  /**
   * Reset the bin's dirty rectangles before drawing the dirty objects
   * in the bin.
   * @param {Object} bin
   */
  resetBin(bin) {
    var dBin = this.dirtyBins["Bin" + bin];
    while (dBin && dBin.length > 0) {
      var r = dBin.shift();
      this.putImage(r.d, r.p);
    }
  }

  /**
   * Render all of the objects in a single bin, grouped by z-index.
   * @param bin {Number} The bin number being rendered
   * @param itr {R.lang.Iterator} The iterator over all the objects in the bin
   * @param time {Number} The current render time in milliseconds from the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  renderBin(bin, itr, time, dt) {
    if (RenderEngine.options.useDirtyRectangles) {
      if (!this.firstFrame) {
        this.resetBin(bin);
      }
      this.captureBin(bin, itr);
      this.firstFrame = false;
    }
    RenderContext2D.prototype.renderBin.call(this, bin, itr, time, dt);
  }

  /**
   * Set the background color of the context.
   *
   * @param color {String} An HTML color
   */
  set backgroundColor(color) {
    this.surface.style.backgroundColor = color;
    super.backgroundColor = color;
  }

  /**
   * Set the current transform position (translation).
   *
   * @param point {Point2D} The translation
   */
  set position(point) {
    this.context2D.translate(point.x, point.y);
    super.position = point;
  }

  /**
   * Set the rotation angle of the current transform
   *
   * @param angle {Number} An angle in degrees
   */
  set rotation(angle) {
    this.context2D.rotate(Math2D.degToRad(angle));
    super.rotation = angle;
  }

  /**
   * Set the scale of the current transform.  Specifying
   * only the first parameter implies a uniform scale.
   *
   * @param scaleX {Number} The X scaling factor, with 1 being 100%
   * @param scaleY {Number} The Y scaling factor
   */
  setScale(scaleX = 1, scaleY) {
    scaleY = scaleY || scaleX;
    this.context2D.scale(scaleX, scaleY);
    super.setScale(scaleX, scaleY);
  }

  /**
   * Set the transformation using a matrix.
   *
   * @param matrix {Matrix} The transformation matrix
   */
  setTransform(matrix) {
  }

  /**
   * Set the line style for the context.
   *
   * @param lineStyle {String} An HTML color or <tt>null</tt>
   */
  set lineStyle(lineStyle) {
    this.context2D.strokeStyle = lineStyle;
    super.lineStyle = lineStyle;
  }

  /**
   * Set the line width for drawing paths.
   *
   * @param width {Number} The width of lines in pixels
   */
  set lineWidth(width) {
    this.context2D.lineWidth = width * 1.0;
    super.lineWidth = width;
  }

  /**
   * Set the fill style of the context.
   *
   * @param fillStyle {String} An HTML color, or <tt>null</tt>.
   */
  set fillStyle(fillStyle) {
    this.context2D.fillStyle = fillStyle;
    super.fillStyle = fillStyle;
  }

  /**
   * Draw an un-filled rectangle on the context.
   *
   * @param rect {Rectangle2D} The rectangle to draw
   */
  drawRectangle(rect) {
    this.context2D.strokeRect(rect.x, rect.y, rect.width, rect.height);
    super.drawRectangle(rect);
  }

  /**
   * Draw a filled rectangle on the context.
   *
   * @param rect {Rectangle2D} The rectangle to draw
   */
  drawFilledRectangle(rect) {
    this.context2D.fillRect(rect.x, rect.y, rect.width, rect.height);
    super.drawFilledRectangle(rect);
  }

  /**
   * @private
   */
  _arc(point, radiusX, startAngle, endAngle) {
    this.startPath();
    this.context2D.arc(point.x, point.y, radiusX, startAngle, endAngle, false);
    //this.endPath();
  }

  /**
   * Draw an un-filled arc on the context.  Arcs are drawn in clockwise
   * order.
   *
   * @param point {Point2D} The point around which the arc will be drawn
   * @param radiusX {Number} The radius of the arc in pixels
   * @param startAngle {Number} The starting angle of the arc in degrees
   * @param endAngle {Number} The end angle of the arc in degrees
   */
  drawArc(point, radiusX, startAngle, endAngle) {
    this._arc(point, radiusX, startAngle, endAngle);
    this.strokePath();
    super.drawArc(point, radiusX, startAngle, endAngle);
  }

  /**
   * Draw a filled arc on the context.  Arcs are drawn in clockwise
   * order.
   *
   * @param point {Point2D} The point around which the arc will be drawn
   * @param radiusX {Number} The radius of the arc in pixels
   * @param startAngle {Number} The starting angle of the arc in degrees
   * @param endAngle {Number} The end angle of the arc in degrees
   */
  drawFilledArc(point, radiusX, startAngle, endAngle) {
    this._arc(point, radiusX, startAngle, endAngle);
    this.fillPath();
    super.drawFilledArc(point, radiusX, startAngle, endAngle);
  }

  /**
   * Draw a line on the context.
   *
   * @param point1 {R.math.Point2D} The start of the line
   * @param point2 {R.math.Point2D} The end of the line
   */
  drawLine(point1, point2) {
    this.startPath();
    this.moveTo(point1);
    this.lineTo(point2);
    //this.endPath();
    this.strokePath();
    super.drawLine(point1, point2);
  }

  /**
   * Draw a point on the context.
   *
   * @param point {Point2D} The position to draw the point
   * @param [size] {Number} The size of the point to draw
   */
  drawPoint(point, size = 1.5) {
    if (RenderEngine.options.pointAsArc) {
      this._arc(point, size, 0, 360);
      this.context2D.fill();
    } else {
      this.context2D.fillRect(point.x, point.y, size, size);
    }
    super.drawPoint(point);
  }

  /**
   * Draw a sprite on the context at the current render position.
   *
   * @param sprite {SpriteResource} The sprite to draw
   */
  drawSprite(sprite) {
    this.drawSpriteAt(sprite, Point2D.ZERO);
  }

  /**
   * Draw a sprite on the context at the given position.
   *
   * @param sprite {SpriteResource} The sprite to draw
   * @param position {Point2D} The position
   */
  drawSpriteAt(sprite, position) {
    this.context2D.drawImage(
      sprite.sourceImage,
      sprite.currentFrame.x, sprite.currentFrame.y, sprite.currentFrame.width, sprite.currentFrame.height,
      position.x, position.y, sprite.currentFrame.width, sprite.currentFrame.height);
    super.drawSpriteAt(sprite, time);
  }

  /**
   * Draw an image on the context.
   *
   * @param rect {Rectangle2D} The rectangle that specifies the position and
   *             dimensions of the image rectangle.
   * @param image {Object} The image to draw onto the context
   * @param [srcRect] {Rectangle2D} <i>[optional]</i> The source rectangle within the image, if
   *                <tt>null</tt> the entire image is used
   */
  drawImage(rect, image, srcRect = null) {
    if (srcRect) {
      this.context2D.drawImage(image,
        srcRect.x, srcRect.y, srcRect.width, srcRect.height, rect.x, rect.y, rect.width, rect.height);
    } else {
      this.context2D.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    }
    super.drawImage(rect, image);
  }

  /**
   * Capture an image from the context.
   *
   * @param rect {Rectangle2D} The area to capture
   * @returns {Array} Image data capture
   */
  getImage(rect) {
    super.getImage();

    // Clamp the rectangle to be within the bounds of the context
    var p = rect.topLeft;
    var tl = Point2D.create((p.x < 0 ? 0 : (p.x > this.width ? this.width - 1 : p.x)),
      (p.y < 0 ? 0 : (p.y > this.height ? this.height - 1 : p.y)));
    var wh = Point2D.create((rect.right > this.width ? this.width - tl.x : (rect.right < 0 ? 1 : rect.width)),
      (rect.bottom > this.height ? this.height - tl.y : (rect.bottom < 0 ? 1 : rect.height)));
    var imgData = this.context2D.getImageData(tl.x, tl.y, wh.x, wh.y);
    tl.destroy();
    wh.destroy();
    return imgData;
  }

  /**
   * Useful method which returns a data URL which represents the
   * current state of the canvas context.  The URL can be passed to
   * an image element. <i>Note: Only works in Firefox and Opera!</i>
   *
   * @param {String} format The mime-type of the output, or <tt>null</tt> for
   *                 the PNG default. (unsupported)
   * @return {String} The data URL
   */
  getDataURL(format) {
    return this.surface.toDataURL();
  }

  /**
   * Draw an image, captured with {@link #getImage}, to
   * the context.
   *
   * @param imageData {Array} Image data captured
   * @param point {Point2D} The position at which to draw the image
   */
  putImage(imageData, point) {
    var x = (point.x < 0 ? 0 : (point.x > this.width ? this.width - 1 : point.x));
    var y = (point.y < 0 ? 0 : (point.y > this.height ? this.height - 1 : point.y));
    if (imageData != null) {
      this.context2D.putImageData(imageData, x, y);
    }
  }

  /**
   * Draw filled text on the context.
   *
   * @param point {Point2D} The top-left position to draw the image.
   * @param text {String} The text to draw
   */
  drawText(point, text) {
    super.drawText(point, text);
    this.context2D.font = this.normalizedFont;
    this.context2D.textBaseline = this.fontBaseline;
    this.context2D.fillText(text, point.x, point.y);
  }

  /**
   * Get a rectangle that will approximately enclose the text drawn by the render context.
   * @param text {String} The text to measure
   * @return {Rectangle2D}
   */
  getTextMetrics(text) {
    var rect = super.getTextMetrics(text);
    this.context2D.font = this.normalizedFont;
    this.context2D.textBaseline = this.fontBaseline;
    var metrics = this.context2D.measureText(text);
    // Scale the height a little to account for hanging chars
    rect.width = metrics.width;
    rect.height = parseFloat(this.fontSize) * 1.25;
    return rect;
  }

  /**
   * Draw stroked (outline) text on the context.
   *
   * @param point {R.math.Point2D}
   * @param text {String} The text to draw
   */
  strokeText(point, text) {
    super.strokeText(point, text);
    this.context2D.font = this.normalizedFont;
    this.context2D.textBaseline = this.fontBaseline;
    this.context2D.strokeText(text, point.x, point.y);
  }

  /**
   * Start a path.
   */
  startPath() {
    this.context2D.beginPath();
    super.startPath();
  }

  /**
   * End a path.
   */
  endPath() {
    this.context2D.closePath();
    super.endPath();
  }

  /**
   * Stroke a path using the current line style and width.
   */
  strokePath() {
    this.context2D.stroke();
    super.strokePath();
  }

  /**
   * Fill a path using the current fill style.
   */
  fillPath() {
    this.context2D.fill();
    super.fillPath();
  }

  /**
   * Move the current path to the point sepcified.
   *
   * @param point {Point2D} The point to move to
   */
  moveTo(point) {
    this.context2D.moveTo(point.x, point.y);
    super.moveTo(point);
  }

  /**
   * Draw a line from the current point to the point specified.
   *
   * @param point {R.math.Point2D} The point to draw a line to
   */
  lineTo(point) {
    this.context2D.lineTo(point.x, point.y);
    super.lineTo(point);
  }

  /**
   * Draw a quadratic curve from the current point to the specified point.
   *
   * @param cPoint {Point2D} The control point
   * @param point {Point2D} The point to draw to
   */
  quadraticCurveTo(cPoint, point) {
    this.context2D.quadraticCurveTo(cPoint.x, cPoint.y, point.x, point.y);
    super.quadraticCurveTo(cPoint, point);
  }

  /**
   * Draw a bezier curve from the current point to the specified point.
   *
   * @param cPoint1 {Point2D} Control point 1
   * @param cPoint2 {Point2D} Control point 2
   * @param point {Point2D} The point to draw to
   */
  bezierCurveTo(cPoint1, cPoint2, point) {
    this.context2D.bezierCurveTo(cPoint1.x, cPoint1.y, cPoint2.x, cPoint2.y, point.x, point.y);
    super.bezierCurveTo(cPoint1, cPoint2, point);
  }

  /**
   * Draw an arc from the current point to the specified point.
   *
   * @param point1 {R.math.Point2D} Arc point 1
   * @param point2 {R.math.Point2D} Arc point 2
   * @param radius {Number} The radius of the arc
   */
  arcTo(point1, point2, radius) {
    this.context2D.arcTo(point1.x, point1.y, point2.x, point2.y, radius);
    super.arcTo(point1, point2, radius);
  }

}