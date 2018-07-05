/**
 * The Render Engine
 * RenderContext2D
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class All 2D contexts should extend from this to inherit the
 * methods which abstract the drawing methods.
 * @extends AbstractRenderContext
 * @constructor
 * @description Create a new instance of a 2d render context.
 * @param name {String} The name of the context
 * @param surface {HTMLElement} The element which represents the surface of the context
 */
class RenderContext2D extends AbstractRenderContext {

  static FONT_WEIGHT_BOLD = "bold";
  static FONT_WEIGHT_NORMAL = "normal";
  static FONT_WEIGHT_LIGHT = "light";
  static FONT_STYLE_ITALIC = "italic";
  static FONT_STYLE_NORMAL = "normal";
  static FONT_STYLE_OBLIQUE = "oblique";
  static FONT_ALIGN_LEFT = "left";
  static FONT_ALIGN_RIGHT = "right";
  static FONT_ALIGN_CENTER = "center";
  static FONT_ALIGN_START = "start";
  static FONT_ALIGN_END = "end";
  static FONT_BASELINE_ALPHABETIC = "alphabetic";
  static FONT_BASELINE_TOP = "top";
  static FONT_BASELINE_HANGING = "hanging";
  static FONT_BASELINE_MIDDLE = "middle";
  static FONT_BASELINE_IDEOGRAPHIC = "ideographic";
  static FONT_BASELINE_BOTTOM = "bottom";

  static NO_ZBIN = 0xDEADBEEF;
  static ROTATION_AXIS = $V([0, 0, 1]);

  constructor(name = "RenderContext2D", surface) {
    super(name, surface);
    this.zBins = {
      "0": {
        all: Container.create("zBin"),
        vis: []
      }
    };
    this.zBins.activeBins = [0];
    this.postRenderList = [];

    this.opts = {
      font: "sans-serif",
      fontWeight: "normal",
      fontSize: "12px",
      fontAlign: "left",
      fontBaseline: "alphabetic",
      fontStyle: "normal",
      position: R.math.Point2D.create(0, 0),
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };

    this._xformStack = [];
  }

  destroy() {
    this.position.destroy();
    super.destroy();
  }

  /**
   * Releases the object back into the object pool.  See {@link PooledObject#release}
   * for more information.
   */
  release() {
    super.release();
    this.opts = {};
    this.zBins = null;
    this._xformStack = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.rendercontexts.RenderContext2D"
   */
  get className() {
    return "RenderContext2D";
  }

  /**
   * Clean up the render bins after cleaning up the contained objects.
   */
  cleanUp() {
    super.cleanUp();
    for (var b in this.zBins.activeBins) {
      this.zBins[this.zBins.activeBins[b]].all.destroy();
      this.zBins[this.zBins.activeBins[b]].all = null;
      this.zBins[this.zBins.activeBins[b]].vis = null;
    }
    this.zBins = {
      "0": {
        all: Container.create("zBin"),
        vis: []
      }
    };
    this.zBins.activeBins = [0];
  }

  /**
   * Sorts objects by their {@link Object2D#getZIndex z-index}.  Objects
   * that don't have a z-index are untouched.
   *
   * @param [sortFn] {Function} Override sort function
   */
  sort(sortFn = undefined) {
    var fn = sortFn === undefined ? RenderContext2D.sortFn : sortFn;
    super.sort(fn);
  }

  /**
   * Add an object to the context.  Only objects
   * within the context will be rendered.  If an object declared
   * an <tt>afterAdd()</tt> method, it will be called after the object
   * has been added to the context.
   *
   * @param obj {BaseObject} The object to add to the render list
   */
  add(obj) {
    super.add(obj);

    // Organize objects into bins by their zIndex so we can
    // determine dirty rectangles
    if (obj.zIndex) {
      this.swapBins(obj, RenderContext2D.NO_ZBIN, obj.zIndex);
    } else {
      this.swapBins(obj, RenderContext2D.NO_ZBIN, 0);
    }
  }

  /**
   * Remove an object from the render context.  The object is
   * not destroyed when it is removed from the container.  The removal
   * occurs after each update to avoid disrupting the flow of object
   * traversal.
   *
   * @param obj {Object} The object to remove from the container.
   * @return {Object} The object that was removed
   */
  remove(obj) {
    super.remove(obj);

    if (obj.zIndex) {
      var zBin = this.zBins[obj.zIndex];
      zBin.all.remove(obj);
      R.engine.Support.arrayRemove(zBin.vis, obj);
    } else {
      this.zBins["0"].all.remove(obj);
      R.engine.Support.arrayRemove(this.zBins["0"].vis, obj);
    }
  }

  /**
   * Swap the zBin that the object is contained within.
   * @param obj {Object2D} The object to swap
   * @param oldBin {Number} The old bin number, or <tt>RenderContext2D.NO_ZBIN</tt> to just
   *    insert into a new bin.
   * @param newBin {Number} The new bin to put the object into
   */
  swapBins(obj, oldBin, newBin) {
    var zBin;
    if (oldBin != RenderContext2D.NO_ZBIN) {
      // Remove the object from the old zBin
      zBin = this.zBins[oldBin];
      zBin.remove(obj);
    }

    // We'll need to know the sorted order of bin numbers since there may be gaps
    if (!this.zBins[newBin]) {
      this.zBins.activeBins.push(newBin);
      this.zBins.activeBins.sort();
    }

    // Add to a bin
    zBin = this.zBins[newBin];
    if (!zBin) {
      this.zBins[newBin] = {
        all: Container.create("zBin"), // List of all objects in the bin
        vis: []                        // Optimized list of only visible objects
      };

      zBin = this.zBins[newBin];
    }

    // Start objects out as "not visible"
    AbstractRenderContext.getContextData(obj).isVisible = false;

    // Add the object to the "all objects" container
    zBin.all.add(obj);
  }

  /**
   * Called to render all of the objects to the context.
   *
   * @param time {Number} The current render time in milliseconds from the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  render(time, dt) {
    // Push the world transform
    this.pushTransform();

    this.setupWorld(time, dt);

    // Run the objects in each bin
    for (var zbin in this.zBins.activeBins) {
      var bin = this.zBins[this.zBins.activeBins[zbin]];

      // Don't want to push the entire bin onto the stack
      this.processBin(this.zBins.activeBins[zbin]);
      //R.Engine.rObjs += bin.vis.length;

      var objs = bin.vis;
      this.renderBin(zbin, objs, time, dt);
    }

    // Restore the world transform
    this.popTransform();

    while (this.postRenderList.length > 0) {
      var fn = this.postRenderList.shift();
      fn.call(this);
    }

    // Safely remove any objects that were removed from
    // the context while it was rendering
    this._safeRemove();
  }

  /**
   * A rendering function to perform in world coordinates.  After the world has
   * been rendered, and all transformations have been reset to world coordinates,
   * the list of post-render functions are executed.
   * @param fn {Function} A function to execute
   */
  postRender(fn) {
    this.postRenderList.push(fn);
  }

  /**
   * Process all objects in a bin, optimizing the list down to only those that are visible.
   * TODO: Hoping to put this in a Worker thead at some point for speed
   * @param binId {String} The bin Id
   * @private
   */
  processBin(binId) {
    var bin = this.zBins[binId];

    // Spin through "all" objects to determine visibility.
    var itr = bin.all.iterator();
    while (itr.hasNext()) {
      // Check if the object is visible, so it'll be processed.
      var obj = itr.next(),
        contextModel = AbstractRenderContext.getContextData(obj);
      if (!obj.worldBox || obj.keepAlive ||
        (this.expandedViewport.isIntersecting(obj.worldBox))) {
        // If the object isn't visible, push it into the "visibility" list
        if (!contextModel.isVisible) {
          contextModel.isVisible = true;
          bin.vis.push(obj);
        }
      } else if (contextModel.isVisible) {
        // The object isn't in the viewport and is marked visible, unmark it and
        // remove from "visibility" list
        contextModel.isVisible = false;
        R.engine.Support.arrayRemove(bin.vis, obj);
      }
    }
    itr.destroy();
  }

  /**
   * Render all of the objects in a single bin, grouped by z-index.
   * @param bin {Number} The bin number being rendered
   * @param objs {Array} Array of objects
   * @param time {Number} The current render time in milliseconds from the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  renderBin(bin, objs, time, dt) {
    R.engine.Support.forEach(objs, function (e) {
      this.renderObject(e, time, dt);
    }, this);
  }

  //------------------------------------------------------------------------

  /**
   * Set the background color of the context.
   */
  set backgroundColor(color) {
    this.opts.backgroundColor = color;
  }

  /**
   * Get the color assigned to the context background.
   */
  get backgroundColor() {
    return this.opts.backgroundColor;
  }

  /**
   * Set the width of the context drawing area.
   */
  set width(width) {
    this.opts.width = width;
  }

  /**
   * Get the width of the context drawing area.
   */
  get width() {
    return this.opts.width;
  }

  /**
   * Set the height of the context drawing area
   */
  set height(height) {
    this.opts.height = height;
  }

  /**
   * Get the height of the context drawing area.
   */
  get height() {
    return this.opts.height;
  }

  /**
   * Get the bounding box for the rendering context.
   * @return {Rectangle2D}
   */
  get boundingBox() {
    if (!this.opts.bBox) {
      this.opts.bBox = Rectangle2D.create(0, 0, this.width, this.height);
    }
    return this.opts.bBox;
  }

  /**
   * Set the current transform position (translation) relative to the viewport.
   *
   * @param point {Point2D} The translation
   */
  set position(point) {
    this.opts.position.add(point);
  }

  /**
   * Get the current transform position (translation) relative to the viewport.
   *
   * @return {Point2D}
   */
  get position() {
    return this.opts.position;
  }

  /**
   * Set the rotation angle of the current transform.
   *
   * @param angle {Number} An angle in degrees
   */
  set rotation(angle) {
    this.opts.rotation = angle;
  }

  /**
   * Get the current transform rotation.
   * @return {Number}
   */
  get rotation() {
    return this.opts.rotation;
  }

  /**
   * Set the scale of the current transform.  Specifying
   * only the first parameter implies a uniform scale.
   *
   * @param scaleX {Number} The X scaling factor, with 1 being 100%
   * @param scaleY {Number} The Y scaling factor
   */
  setScale(scaleX, scaleY) {
    this.opts.scaleX = scaleX;
    this.opts.scaleY = scaleY || scaleX;
  }

  set scale(vector) {
    this.opts.scaleX = vector.x;
    this.opts.scaleY = vector.y;
  }

  /**
   * Get the X scaling factor of the current transform.
   * @return {Number}
   */
  get scaleX() {
    return this.opts.scaleX;
  }

  /**
   * Get the Y scaling factor of the current transform.
   * @return {Number}
   */
  get scaleY() {
    return this.opts.scaleY;
  }

  /**
   * Push the current transformation matrix.
   */
  pushTransform() {
    // Translation
    var p = R.clone(this.worldPosition).add(this.position);
    var tMtx = $M([
      [1, 0, p.x],
      [0, 1, p.y],
      [0, 0, 1]
    ]);

    // Rotation
    var a = this.worldRotation + this.rotation;
    var rMtx;
    if (a != 0) {
      // Rotate
      rMtx = Matrix.Rotation(Math2D.degToRad(a), RenderContext2D.ROTATION_AXIS);
    }
    else {
      // Set to identity
      rMtx = Math2D.identityMatrix();
    }

    // Scale
    var sX = this.worldScale() * this.scaleX, sY = this.worldScale * this.scaleY,
      sMtx = $M([
        [sX, 0, 0],
        [0, sY, 0],
        [0, 0, 1]
      ]), txfmMtx = tMtx.multiply(rMtx).multiply(sMtx);

    rMtx = null;
    sMtx = null;
    this._xformStack.push(txfmMtx);

    super.pushTransform();
  }

  /**
   * Pop the current transformation matrix.
   */
  popTransform() {
    // Restore the last position, (TODO: angle, and scale)
    var xform = this._xformStack.pop().col(3);
    this.position.x = xform.e(1);
    this.position.y = xform.e(2);

    super.popTransform();
  }

  /**
   * Set the font to use when rendering text to the context.
   * @param font {String} A font string similar to CSS
   */
  set font(font) {
    this.opts.font = font;
  }

  /**
   * Get the font currently being used to render text
   * @return {String}
   */
  get font() {
    return this.opts.font;
  }

  /**
   * Get the normalized font string used to describe the style. The
   * value includes style, weight, size, and font.
   * @return {String}
   */
  get normalizedFont() {
    return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + " " + this.font;
  }

  /**
   * Set the size of the font being used to render text
   * @param size {String} The font size string
   */
  set fontSize(size) {
    this.opts.fontSize = size;
  }

  /**
   * Get the font size
   * @return {String}
   */
  get fontSize() {
    return this.opts.fontSize + "px";
  }

  /**
   * Set the rendering weight of the font
   * @param weight {String}
   */
  set fontWeight(weight) {
    this.opts.fontWeight = weight;
  }

  /**
   * Get the weight of the font to be rendered to the context
   * @return {String}
   */
  get fontWeight() {
    return this.opts.fontWeight;
  }

  /**
   * Set the font alignment for the context
   * @param align {String} The font alignment
   */
  set fontAlign(align) {
    this.opts.fontAlign = align;
  }

  /**
   * Get the alignment of the font
   * @return {String}
   */
  get fontAlign() {
    return this.opts.fontAlign;
  }

  /**
   * Set the baseline of the renderable font
   * @param baseline {String} The render baseline
   */
  set fontBaseline(baseline) {
    this.opts.fontBaseline = baseline;
  }

  /**
   * Get the font baseline
   * @return {String}
   */
  get fontBaseline() {
    return this.opts.fontBaseline;
  }

  /**
   * Set the style of the renderable font
   * @param style {String} The font style
   */
  set fontStyle(style) {
    this.opts.fontStyle = style;
  }

  /**
   * Get a rectangle that will approximately enclose the text drawn by the render context.
   * @param text {String} The text to measure
   * @return {Rectangle2D}
   */
  getTextMetrics(text) {
    return Rectangle2D.create(0, 0, 1, 1);
  }

  /**
   * Get the renderable style of the font
   * @return {String}
   */
  get fontStyle() {
    return this.opts.fontStyle;
  }

  /**
   * Set the current transformation using a matrix.  Replaces the
   * current transformation at the top of the stack.
   * @param matrix {Matrix} The transformation matrix
   */
  set transform(matrix) {
    this._xformStack[this._xformStack.length - 1] = matrix;
  }

  /**
   * Get the current transformation matrix.
   * @return {Matrix}
   */
  get transform() {
    return this._xformStack[this._xformStack.length - 1];
  }

  /**
   * Set the transformation of the world.
   *
   * @param mtx3 {Number}
   */
  set renderTransform(mtx3) {
  }

  /**
   * Get the render position relative to the world
   * @return {Point2D}
   */
  get renderPosition() {
    return Point2D.ZERO;
  }

  /**
   * Get the render rotation relative to the world
   * @return {Number}
   */
  get renderRotation() {
    return 0;
  }

  /**
   * Get the render scale relative to the world
   * @return {Number}
   */
  get renderScale() {
    return 1.0;
  }

  /**
   * Set the line style for the context.
   *
   * @param lineStyle {String} An HTML color or <tt>null</tt>
   */
  set lineStyle(lineStyle) {
    this.opts.lineStyle = lineStyle;
  }

  /**
   * Get the current line style for the context.  <tt>null</tt> if
   * not set.
   * @return {String}
   */
  get lineStyle() {
    return this.opts.lineStyle;
  }

  /**
   * Set the line width for drawing paths.
   */
  set lineWidth(width) {
    this.opts.lineWidth = isNaN(width) ? 1 : width;
  }

  /**
   * Get the current line width for drawing paths.
   */
  get lineWidth() {
    return this.opts.lineWidth;
  }

  /**
   * Set the fill style of the context.
   * @param fillStyle {String} An HTML color, or <tt>null</tt>.
   */
  set fillStyle(fillStyle) {
    this.opts.fillStyle = fillStyle;
  }

  /**
   * Get the current fill style of the context.
   * @return {String}
   */
  get fillStyle() {
    return this.opts.fillStyle;
  }

  /**
   * Draw an un-filled rectangle on the context.
   *
   * @param rect {Rectangle2D} The rectangle to draw
   */
  drawRectangle(rect) {
  }

  /**
   * Draw a filled rectangle on the context.
   *
   * @param rect {Rectangle2D} The rectangle to draw
   */
  drawFilledRectangle(rect) {
  }

  /**
   * Draw an un-filled arc on the context.  Arcs are drawn in clockwise
   * order.
   *
   * @param point {Point2D} The point around which the arc will be drawn
   * @param radius {Number} The radius of the arc in pixels
   * @param startAngle {Number} The starting angle of the arc in degrees
   * @param endAngle {Number} The end angle of the arc in degrees
   */
  drawArc(point, radius, startAngle, endAngle) {
  }

  /**
   * Draw a filled arc on the context.  Arcs are drawn in clockwise
   * order.
   *
   * @param point {R.math.Point2D} The point around which the arc will be drawn
   * @param radius {Number} The radius of the arc in pixels
   * @param startAngle {Number} The starting angle of the arc in degrees
   * @param endAngle {Number} The end angle of the arc in degrees
   */
  drawFilledArc(point, radius, startAngle, endAngle) {
  }

  /**
   * Helper method to draw a circle by calling the {@link #drawArc} method
   * with predefined start and end angle of zero and 6.28 radians.
   *
   * @param point {Point2D} The point around which the circle will be drawn
   * @param radius {Number} The radius of the circle in pixels
   */
  drawCircle(point, radius) {
    this.drawArc(point, radius, 0, Math2D.TWO_PI);
  }

  /**
   * Helper method to draw a filled circle by calling the {@link #drawFilledArc} method
   * with predefined start and end angle of zero and 6.28 radians.
   *
   * @param point {Point2D} The point around which the circle will be drawn
   * @param radius {Number} The radius of the circle in pixels
   */
  drawFilledCircle(point, radius) {
    this.drawFilledArc(point, radius, 0, Math2D.TWO_PI);
  }

  /**
   * Draw a polygon or polyline using a Duff's device for
   * efficiency and loop unrolling with inversion for speed.
   *
   * @param pointArray {Array} An array of <tt>R.math.Point2D</tt> objects
   * @param closedLoop {Boolean} <tt>true</tt> to close the polygon
   * @private
   */
  _poly(pointArray, closedLoop) {
    this.startPath();
    this.moveTo(pointArray[0]);
    var p = 1;

    // Using Duff's device with loop inversion
    switch ((pointArray.length - 1) & 0x3) {
      case 3:
        this.lineSeg(pointArray[p++]);
      case 2:
        this.lineSeg(pointArray[p++]);
      case 1:
        this.lineSeg(pointArray[p++]);
    }

    if (p < pointArray.length) {
      do
      {
        this.lineSeg(pointArray[p++]);
        this.lineSeg(pointArray[p++]);
        this.lineSeg(pointArray[p++]);
        this.lineSeg(pointArray[p++]);
      } while (p < pointArray.length);
    }

    if (closedLoop) {
      this.endPath();
    }
  }

  /**
   * Draw an un-filled regular polygon with N sides.
   *
   * @param sides {Number} The number of sides, must be more than 2
   * @param center {R.math.Point2D} The center of the polygon
   * @param [radius] {Number} The radius of the polygon. Default: 100
   */
  drawRegularPolygon(sides, center, radius) {
    var poly = Math2D.regularPolygon(sides, radius);
    for (var p = 0; p < poly.length; p++) {
      poly[p].add(center);
    }
    this.drawPolygon(poly);
  }

  /**
   * Draw an un-filled polygon on the context.
   *
   * @param pointArray {Array} An array of {@link R.math.Point2D} objects
   */
  drawPolygon(pointArray) {
    this._poly(pointArray, true);
    this.strokePath();
    this.lineSeg.moveTo = false;
  }

  /**
   * Draw a non-closed poly line on the context.
   *
   * @param pointArray {Array} An array of {@link Point2D} objects
   */
  drawPolyline(pointArray) {
    this._poly(pointArray, false);
    this.strokePath();
    this.lineSeg.moveTo = false;
  }

  /**
   * Draw an filled polygon on the context.
   *
   * @param pointArray {Array} An array of {@link R.math.Point2D} objects
   */
  drawFilledPolygon(pointArray) {
    this._poly(pointArray, true);
    this.fillPath();
    this.lineSeg.moveTo = false;
  }

  /**
   * Draw an un-filled regular polygon with N sides.
   *
   * @param sides {Number} The number of sides, must be more than 2
   * @param center {Point2D} The center of the polygon
   * @param [radius] {Number} The radius of the polygon. Default: 100
   */
  drawFilledRegularPolygon(sides, center, radius) {
    var poly = Math2D.regularPolygon(sides, radius);
    for (var p = 0; p < poly.length; p++) {
      poly[p].add(center);
    }
    this.drawFilledPolygon(poly);
  }

  /**
   * Draw a line on the context.
   *
   * @param point1 {Point2D} The start of the line
   * @param point2 {Point2D} The end of the line
   */
  drawLine(point1, point2) {
  }

  /**
   * Draw a point on the context.
   *
   * @param point {Point2D} The position to draw the point
   */
  drawPoint(point) {
  }

  /**
   * Draw a sprite on the context.
   *
   * @param sprite {Sprite} The sprite to draw
   * @param time {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  drawSprite(sprite, time, dt) {
  }

  /**
   * Draw a sprite on the context at the position given.
   *
   * @param sprite {R.resources.types.Sprite} The sprite to draw
   * @param position {Point2D} The position at which to draw the sprite
   * @param time {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  drawSpriteAt(sprite, position, time, dt) {
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
  }

  /**
   * Capture an image from the context.
   *
   * @param rect {Rectangle2D} The area to capture
   * @return {ImageData} Image data capture
   */
  getImage(rect) {
  }

  /**
   * Draw an image, captured with {@link #getImage}, to
   * the context.
   *
   * @param imageData {ImageData} Image data captured
   * @param point {Point2D} The poisition at which to draw the image
   */
  putImage(imageData, point) {
  }

  /**
   * Draw text on the context.
   *
   * @param point {Point2D} The top-left position to draw the image.
   * @param text {String} The text to draw
   */
  drawText(point, text) {
  }

  /**
   * Draw outlined (stroked) text on the context.
   *
   * @param point {Point2D} The top-left position to draw the image.
   * @param text {String} The text to draw
   */
  strokeText(point, text) {
  }

  /**
   * Start a path.
   */
  startPath() {
  }

  /**
   * End a path.
   */
  endPath() {
  }

  /**
   * Stroke a path using the current line style and width.
   */
  strokePath() {
  }

  /**
   * Fill a path using the current fill style.
   */
  fillPath() {
  }

  /**
   * Move the current path to the point sepcified.
   *
   * @param point {Point2D} The point to move to
   */
  moveTo(point) {
  }

  /**
   * Draw a line from the current point to the point specified.
   *
   * @param point {Point2D} The point to draw a line to
   */
  lineTo(point) {
  }

  /**
   * Used to draw line segments for polylines.  If <tt>point</tt>
   * is <tt>null</tt>, the context will move to the next point.  Otherwise,
   * it will draw a line to the point.
   *
   * @param point {Point2D} The point to draw a line to, or null.
   */
  lineSeg(point) {
    if (point == null) {
      this.lineSeg.moveTo = true;
      return;
    }

    if (this.lineSeg.moveTo) {
      // Cannot have two subsequent nulls
      Assert((point != null), "LineSeg repeated null!", this);
      this.moveTo(point);
      this.lineSeg.moveTo = false;
    }
    else {
      this.lineTo(point);
    }
  }

  /**
   * Draw a quadratic curve from the current point to the specified point.
   *
   * @param cPoint {Point2D} The control point
   * @param point {Point2D} The point to draw to
   */
  quadraticCurveTo(cPoint, point) {
  }

  /**
   * Draw a bezier curve from the current point to the specified point.
   *
   * @param cPoint1 {Point2D} Control point 1
   * @param cPoint2 {Point2D} Control point 2
   * @param point {Point2D} The point to draw to
   */
  bezierCurveTo(cPoint1, cPoint2, point) {
  }

  /**
   * Draw an arc from the current point to the specified point.
   *
   * @param point1 {Point2D} Arc point 1
   * @param point2 {Point2D} Arc point 2
   * @param radius {Number} The radius of the arc
   */
  arcTo(point1, point2, radius) {
  }

  /**
   * Draw an element on the context
   * @param ref?
   */
  drawElement(ref) {
  }

  /**
   * Sort the objects to draw from objects with the lowest
   * z-index to the highest z-index.
   * @static
   */
  static sortFn(obj1, obj2) {
    if (obj1.zIndex && obj2.zIndex) {
      return obj1.zIndex - obj2.zIndex;
    }
    return 0
  }


}

