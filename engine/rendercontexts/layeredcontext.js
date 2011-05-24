/**
 * The Render Engine
 * LayeredContext
 *
 * @fileoverview A render context which is comprised of multiple layered contexts.
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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.rendercontexts.LayeredContext",
	"requires": [
		"R.rendercontexts.RenderContext2D"
	]
});

/**
 * @class A single context which is comprised of multiple contexts.  Each context is
 *    a layer within the context that can be moved and updated independent of the
 *    layered context itself.
 *
 * @extends R.rendercontexts.RenderContext2D
 * @constructor
 * @description Create a new instance of a layered context.
 * @param name {String} The name of the context
 * @param baseLayer {R.rendercontexts.AbstractRenderContext} The base layer context
 */
R.rendercontexts.LayeredContext = function(){
	return R.rendercontexts.RenderContext2D.extend(/** @scope R.rendercontexts.LayeredContext.prototype */{

      activeLayer: null,
      layers: null,

		/** @private */
		constructor: function(name, baseLayer){
			this.base(name || "LayeredContext", baseLayer.getSurface());
			//this.setViewport(baseLayer.getViewport());
         this.activeLayer = baseLayer;
         this.layers = R.struct.HashContainer().create();
         this.layers.add(baseLayer.getName(), baseLayer);
		},

      /**
       * Add a new layer to the rendering context.  The order in which layers
       * are added is how they will be rendered.  You can set the active (current)
       * layer by calling {@link #setActiveLayer}.  All renderig methods will
       * be proxied to the active layer.
       *
       * @param layer {R.rendercontexts.RenderContext2D} The new layer
       */
      addLayer: function(layer) {
         this.layers.add(layer.getName(), layer);
         this.base(layer);
      },

      /**
       * Remove a layer from the rendering context.
       *
       * @param layer {R.rendercontexts.RenderContext2D} The layer to remove
       */
      removeLayer: function(layer) {
         this.layers.remove(layer);
         this.base(layer);
      },

      /**
       * Set the currently active layer.  All rendering methods will be
       * proxied to the active layer.
       * @param layerName {String} The name of the layer (rendering context)
       */
      setActiveLayer: function(layerName) {
         this.activeLayer = this.layers.get(layerName);
      },

      /**
       * Get the currently active layer.
       * @return {R.rendercontexts.RenderContext2D}
       */
      getActiveLayer: function() {
         return this.activeLayer;
      },

      /**
       * Get a layer by name.
       * @param layerName {String} The name of the layer to get
       * @return {R.rendercontexts.RenderContext2D}
       */
      getLayer: function(layerName) {
         return this.layers.get(layerName);
      },

      //================================================================
      // Drawing functions

      add: function(obj) {
         this.activeLayer.add(obj);
      },

      remove: function(obj) {
         this.activeLayer.remove(obj);
      },

      removeAtIndex: function(idx) {
         this.activeLayer.removeAtIndex(idx);
      },

      /**
       * Set the world scale of the rendering context.  All objects should
       * be adjusted by this scale when the context renders.
       *
       * @param scale {Number} The uniform scale of the world
       */
      setWorldScale: function(scale) {
         this.activeLayer.setWorldScale(scale);
      },

      /**
       * Set the world rotation of the rendering context.  All objects
       * should be adjusted by this rotation when the context renders.
       * @param rotation {Number} The rotation angle
       */
      setWorldRotation: function(rotation) {
         this.activeLayer.setWorldRotation(rotation);
      },

      /**
       * Set the world position of the rendering context.  All objects
       * should be adjuest by this position when the context renders.
       * @param point {R.math.Point2D|Number} The world position or X coordinate
       * @param [y] {Number} If <tt>point</tt> is a number, this is the Y coordinate
       */
      setWorldPosition: function(point, y) {
         this.activeLayer.setWorldPosition(point, y);
      },

      /**
       * Gets an array representing the rendering scale of the world.
       * @return {Array} The first element is the X axis, the second is the Y axis
       */
      getWorldScale: function() {
         return this.activeLayer.getWorldScale();
      },

      /**
       * Gets the world rotation angle.
       * @return {Number}
       */
      getWorldRotation: function() {
         return this.activeLayer.getWorldRotation();
      },

      /**
       * Get the world render position.
       * @return {R.math.Point2D}
       */
      getWorldPosition: function() {
         return this.activeLayer.getWorldPosition();
      },

      /**
       * Set the world boundaries.  Set the world boundaries bigger than the viewport
       * to create a virtual world.  By default, the world boundary matches the viewport.
       * @param rect {R.math.Rectangle2D}
       */
      setWorldBoundary: function(rect) {
         this.activeLayer.setWorldBoundary(rect);
      },

      /**
       * get the world boundaries.
       * @return {R.math.Rectangle2D}
       */
      getWorldBoundary: function(rect) {
         return this.activeLayer.getWorldBoundary();
      },

      /**
       * Set the viewport of the render context.  The viewport is a window
       * upon the world so that not all of the world is rendered at one time.
       * @param rect {R.math.Rectangle2D} A rectangle defining the viewport
       */
      setViewport: function(rect) {
         this.activeLayer.setViewport(rect);
      },

      /**
       * Get the viewport of the render context.
       * @return {R.math.Rectangle2D}
       */
      getViewport: function() {
         return this.activeLayer.getViewport();
      },

      /**
       * Push a transform state onto the stack.
       */
      pushTransform: function() {
         this.activeLayer.pushTransform();
      },

      /**
       * Pop a transform state off the stack.
       */
      popTransform: function() {
         this.activeLayer.popTransform();
      },

      /**
       * Reset the entire context, clearing it and preparing it for drawing.
       */
      reset: function(rect) {
         this.activeLayer.reset();
      },

      /**
       * Set the background color of the context.
       *
       * @param color {String} An HTML color
       */
      setBackgroundColor: function(color) {
         this.activeLayer.setBackgroundColor(color);
      },

      /**
       * Get the color assigned to the context background.
       * @return {String}
       */
      getBackgroundColor: function() {
         return this.activeLayer.getBackgroundColor();
      },

      /**
       * Set the width of the context drawing area.
       *
       * @param width {Number} The width in pixels
       */
      setWidth: function(width) {
         this.activeLayer.setWidth(width);
      },

      /**
       * Get the width of the context drawing area.
       * @return {Number}
       */
      getWidth: function() {
         return this.activeLayer.getWidth();
      },

      /**
       * Set the height of the context drawing area
       *
       * @param height {Number} The height in pixels
       */
      setHeight: function(height) {
         this.activeLayer.setHeight(height);
      },

      /**
       * Get the height of the context drawing area.
       * @render {Number}
       */
      getHeight: function() {
         return this.activeLayer.getHeight();
      },

      /**
       * Get the bounding box for the rendering context.
       * @return {R.math.Rectangle2D}
       */
      getBoundingBox: function() {
         return this.activeLayer.getBoundingBox();
      },

      /**
       * Set the current transform position (translation).
       *
       * @param point {R.math.Point2D} The translation
       */
      setPosition: function(point) {
         this.activeLayer.setPosition(point);
      },

      /**
       * Get the current transform position (translation)
       * @return {R.math.Point2D}
       */
      getPosition: function() {
         return this.getCurrentLayer.getPosition();
      },

      /**
       * Set the rotation angle of the current transform
       *
       * @param angle {Number} An angle in degrees
       */
      setRotation: function(angle) {
         this.activeLayer.setRotation(angle);
      },

      /**
       * Get the current transform rotation.
       * @return {Number}
       */
      getRotation: function() {
         return this.activeLayer.getRotation();
      },

      /**
       * Set the scale of the current transform.  Specifying
       * only the first parameter implies a uniform scale.
       *
       * @param scaleX {Number} The X scaling factor, with 1 being 100%
       * @param scaleY {Number} The Y scaling factor
       */
      setScale: function(scaleX, scaleY) {
         this.activeLayer.setScale(scaleX, scaleY);
      },

      /**
       * Get the X scaling factor of the current transform.
       * @return {Number}
       */
      getScaleX: function() {
         return this.activeLayer.getScaleX();
      },

      /**
       * Get the Y scaling factor of the current transform.
       * @return {Number}
       */
      getScaleY: function() {
         return this.activeLayer.getScaleY();
      },

      /**
       * Set the font to use when rendering text to the context.
       * @param font {String} A font string similar to CSS
       */
      setFont: function(font) {
         this.activeLayer.setFont(font);
      },

      /**
       * Get the font currently being used to render text
       * @return {String}
       */
      getFont: function() {
         return this.activeLayer.getFont();
      },

      /**
       * Get the normalized font string used to describe the style. The
       * value includes style, weight, size, and font.
       * @return {String}
       */
      getNormalizedFont: function() {
         return this.activeLayer.getNormalizedFont();
      },

      /**
       * Set the size of the font being used to render text
       * @param size {String} The font size string
       */
      setFontSize: function(size) {
         this.activeLayer.setFontSize(size);
      },

      /**
       * Get the font size
       * @return {String}
       */
      getFontSize: function() {
         return this.activeLayer.getFontSize();
      },

      /**
       * Set the rendering weight of the font
       * @param weight {String}
       */
      setFontWeight: function(weight) {
         this.activeLayer.setFontWeight(weight);
      },

      /**
       * Get the weight of the font to be rendered to the context
       * @return {String}
       */
      getFontWeight: function() {
         return this.activeLayer.getFontWeight();
      },

      /**
       * Set the font alignment for the context
       * @param align {String} The font alignment
       */
      setFontAlign: function(align) {
         this.activeLayer.setFontAlign(align);
      },

      /**
       * Get the alignment of the font
       * @return {String}
       */
      getFontAlign: function() {
         return this.activeLayer.getFontAlign();
      },

      /**
       * Set the baseline of the renderable font
       * @param baseline {String} The render baseline
       */
      setFontBaseline: function(baseline) {
         this.activeLayer.setFontBaseline(baseline);
      },

      /**
       * Get the font baseline
       * @return {String}
       */
      getFontBaseline: function() {
         return this.activeLayer.getFontBaseline();
      },

      /**
       * Set the style of the renderable font
       * @param style {String} The font style
       */
      setFontStyle: function(style) {
         this.activeLayer.setFontStyle(style);
      },

      /**
       * Get a rectangle that will approximately enclose the text drawn by the render context.
       * @param text {String} The text to measure
       * @return {R.math.Rectangle2D}
       */
      getTextMetrics: function(text) {
         return this.currentLayerR.getTextMetrics(text);
      },

      /**
       * Get the renderable style of the font
       * @return {String}
       */
      getFontStyle: function() {
         return this.activeLayer.getFontStyle();
      },

      /**
       * Set the transformation using a matrix.
       *
       * @param matrix {Matrix} The transformation matrix
       */
      setTransform: function(matrix) {
         this.activeLayer.setTransform(matrix);
      },

      /**
       * Set the transformation of the world.
       *
       * @param position {R.math.Point2D}
       * @param rotation {Number}
       * @param scale {Number}
       */
      setRenderTransform: function(mtx3) {
         this.activeLayer.setRenderTransform(mtx3);
      },

      /**
       * Get the render position relative to the world
       * @return {R.math.Point2D}
       */
      getRenderPosition: function() {
         return this.activeLayer.getRenderPosition();
      },

      /**
       * Get the render rotation relative to the world
       * @return {Number}
       */
      getRenderRotation: function() {
         return this.activeLayer.getRenderRotation();
      },

      /**
       * Get the render scale relative to the world
       * @return {Number}
       */
      getRenderScale: function() {
         return this.activeLayer.getRenderScale();
      },

      /**
       * Set the line style for the context.
       *
       * @param lineStyle {String} An HTML color or <tt>null</tt>
       */
      setLineStyle: function(lineStyle) {
         this.activeLayer.setLineStyle(lineStyle);
      },

      /**
       * Get the current line style for the context.  <tt>null</tt> if
       * not set.
       * @return {String}
       */
      getLineStyle: function() {
         return this.activeLayer.getLineStyle();
      },

      /**
       * Set the line width for drawing paths.
       *
       * @param [width=1] {Number} The width of lines in pixels
       */
      setLineWidth: function(width) {
         this.activeLayer.setLineWidth(width);
      },

      /**
       * Get the current line width for drawing paths.
       * @return {Number}
       */
      getLineWidth: function() {
         return this.activeLayer.getLineWidth();
      },

      /**
       * Set the fill style of the context.
       *
       * @param fillStyle {String} An HTML color, or <tt>null</tt>.
       */
      setFillStyle: function(fillStyle) {
         this.activeLayer.setFillStyle(fillStyle);
      },

      /**
       * Get the current fill style of the context.
       * @return {String}
       */
      getFillStyle: function() {
         return this.activeLayer.getFillStyle();
      },

      /**
       * Draw an un-filled rectangle on the context.
       *
       * @param rect {R.math.Rectangle2D} The rectangle to draw
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawRectangle: function(rect /*, ref */) {
         this.activeLayer.drawRectangle(rect, arguments[1]);
      },

      /**
       * Draw a filled rectangle on the context.
       *
       * @param rect {R.math.Rectangle2D} The rectangle to draw
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawFilledRectangle: function(rect /*, ref */) {
         this.activeLayer.drawFilledRectangle(rect, arguments[1]);
      },

      /**
       * Draw an un-filled arc on the context.  Arcs are drawn in clockwise
       * order.
       *
       * @param point {R.math.Point2D} The point around which the arc will be drawn
       * @param radius {Number} The radius of the arc in pixels
       * @param startAngle {Number} The starting angle of the arc in degrees
       * @param endAngle {Number} The end angle of the arc in degrees
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawArc: function(point, radius, startAngle, endAngle /*, ref */) {
         this.activeLayer.drawArc(point, radius, startAngle, endAngle, arguments[4]);
      },

      /**
       * Draw a filled arc on the context.  Arcs are drawn in clockwise
       * order.
       *
       * @param point {R.math.Point2D} The point around which the arc will be drawn
       * @param radius {Number} The radius of the arc in pixels
       * @param startAngle {Number} The starting angle of the arc in degrees
       * @param endAngle {Number} The end angle of the arc in degrees
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawFilledArc: function(point, radius, startAngle, endAngle /*, ref */) {
         this.activeLayer.drawFilledArc(point,radius,startAngle,endAngle,arguments[4]);
      },

      /**
       * Helper method to draw a circle by calling the {@link #drawArc} method
       * with predefined start and end angle of zero and 6.28 radians.
       *
       * @param point {R.math.Point2D} The point around which the circle will be drawn
       * @param radius {Number} The radius of the circle in pixels
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawCircle: function(point, radius /*, ref */) {
         this.activeLayer.drawCircle(point, radius, arguments[2]);
      },

      /**
       * Helper method to draw a filled circle by calling the {@link #drawFilledArc} method
       * with predefined start and end angle of zero and 6.28 radians.
       *
       * @param point {R.math.Point2D} The point around which the circle will be drawn
       * @param radius {Number} The radius of the circle in pixels
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawFilledCircle: function(point, radius /*, ref */) {
         this.activeLayer.drawFilledCircle(point, radius, arguments[2]);
      },

      /**
       * Draw an un-filled regular polygon with N sides.
       *
       * @param sides {Number} The number of sides, must be more than 2
       * @param center {R.math.Point2D} The center of the polygon
       * @param [radius] {Number} The radius of the polygon. Default: 100
       */
      drawRegularPolygon: function(sides, center, radius) {
         this.activeLayer.drawRegularPolygon(sides, center, radius);
      },

      /**
       * Draw an un-filled polygon on the context.
       *
       * @param pointArray {Array} An array of {@link R.math.Point2D} objects
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawPolygon: function(pointArray /*, ref */) {
         this.activeLayer.drawPolygon(pointArray, arguments[1]);
      },

      /**
       * Draw a non-closed poly line on the context.
       *
       * @param pointArray {Array} An array of {@link Point2D} objects
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawPolyline: function(pointArray /*, ref */) {
         this.activeLayer.drawPolyline(pointArray, arguments[1]);
      },

      /**
       * Draw an filled polygon on the context.
       *
       * @param pointArray {Array} An array of {@link R.math.Point2D} objects
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawFilledPolygon: function(pointArray /*, ref */) {
         this.activeLayer.drawFilledPolygon(pointArray, arguments[1]);
      },

      /**
       * Draw an un-filled regular polygon with N sides.
       *
       * @param sides {Number} The number of sides, must be more than 2
       * @param center {R.math.Point2D} The center of the polygon
       * @param [radius] {Number} The radius of the polygon. Default: 100
       */
      drawFilledRegularPolygon: function(sides, center, radius) {
         this.activeLayer.drawFilledRegularPolygon(sides, center, radius);
      },

      /**
       * Draw a line on the context.
       *
       * @param point1 {R.math.Point2D} The start of the line
       * @param point2 {R.math.Point2D} The end of the line
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawLine: function(point1, point2 /*, ref */) {
         this.activeLayer.drawLine(point1, point2, arguments[2]);
      },

      /**
       * Draw a point on the context.
       *
       * @param point {R.math.Point2D} The position to draw the point
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawPoint: function(point /*, ref */) {
         this.activeLayer.drawPoint(point, arguments[1]);
      },

      /**
       * Draw a sprite on the context.
       *
       * @param sprite {R.resources.types.Sprite} The sprite to draw
       * @param time {Number} The current world time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawSprite: function(sprite, time, dt /*, ref */) {
         this.activeLayer.drawSprite(sprite, time, dt, arguments[3]);
      },

      /**
       * Draw an image on the context.
       *
       * @param rect {R.math.Rectangle2D} The rectangle that specifies the position and
       *             dimensions of the image rectangle.
       * @param image {Object} The image to draw onto the context
       * @param [srcRect] {R.math.Rectangle2D} <i>[optional]</i> The source rectangle within the image, if
       *                <tt>null</tt> the entire image is used
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawImage: function(rect, image, srcRect /*, ref */) {
         this.activeLayer.drawImage(rect, image, srcRect, arguments[3]);
      },

      /**
       * Capture an image from the context.
       *
       * @param rect {R.math.Rectangle2D} The area to capture
       * @return {ImageData} Image data capture
       */
      getImage: function(rect) {
         return this.activeLayer.getImage(rect);
      },

      /**
       * Draw an image, captured with {@link #getImage}, to
       * the context.
       *
       * @param imageData {ImageData} Image data captured
       * @param point {R.math.Point2D} The poisition at which to draw the image
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      putImage: function(imageData, point /*, ref */) {
         this.activeLayer.putImage(imageData, point, arguments[2]);
      },

      /**
       * Draw text on the context.
       *
       * @param point {R.math.Point2D} The top-left position to draw the image.
       * @param text {String} The text to draw
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawText: function(point, text /*, ref */) {
         this.activeLayer.drawText(point, text, arguments[2]);
      },

      /**
       * Start a path.
       */
      startPath: function() {
         this.activeLayer.startPath();
      },

      /**
       * End a path.
       */
      endPath: function() {
         this.activeLayer.endPath();
      },

      /**
       * Stroke a path using the current line style and width.
       */
      strokePath: function() {
         this.activeLayer.strokePath();
      },

      /**
       * Fill a path using the current fill style.
       */
      fillPath: function() {
         this.activeLayer.fillPath();
      },

      /**
       * Move the current path to the point sepcified.
       *
       * @param point {R.math.Point2D} The point to move to
       */
      moveTo: function(point) {
         this.activeLayer.moveTo(point);
      },

      /**
       * Draw a line from the current point to the point specified.
       *
       * @param point {R.math.Point2D} The point to draw a line to
       */
      lineTo: function(point) {
         this.activeLayer.lineTo(point);
      },

      /**
       * Used to draw line segments for polylines.  If <tt>point</tt>
       * is <tt>null</tt>, the context will move to the next point.  Otherwise,
       * it will draw a line to the point.
       *
       * @param point {R.math.Point2D} The point to draw a line to, or null.
       */
      lineSeg: function(point) {
         this.activeLayer.lineSeg(point);
      },

      /**
       * Draw a quadratic curve from the current point to the specified point.
       *
       * @param cPoint {R.math.Point2D} The control point
       * @param point {R.math.Point2D} The point to draw to
       */
      quadraticCurveTo: function(cPoint, point) {
         this.activeLayer.quadraticCurveTo(cPoint, point);
      },

      /**
       * Draw a bezier curve from the current point to the specified point.
       *
       * @param cPoint1 {R.math.Point2D} Control point 1
       * @param cPoint2 {R.math.Point2D} Control point 2
       * @param point {R.math.Point2D} The point to draw to
       */
      bezierCurveTo: function(cPoint1, cPoint2, point) {
         this.activeLayer.bezierCurveT(cPoint2, cPoint2, point);
      },

      /**
       * Draw an arc from the current point to the specified point.
       *
       * @param point1 {R.math.Point2D} Arc point 1
       * @param point2 {R.math.Point2D} Arc point 2
       * @param radius {Number} The radius of the arc
       */
      arcTo: function(point1, point2, radius) {
         this.activeLayer.arcTo(point1, point2, radius);
      }

	}, /** @scope R.rendercontexts.LayeredContext.prototype */ {

		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.rendercontexts.LayeredContext"
		 */
		getClassName: function(){
			return "R.rendercontexts.LayeredContext";
		}
	});

}