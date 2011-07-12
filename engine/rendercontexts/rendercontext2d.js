/**
 * The Render Engine
 * RenderContext2D
 *
 * @fileoverview The base 2D render context.  This context implements a number of
 *               methods which are then standard on all contexts which extend from
 *               it.
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
   "class": "R.rendercontexts.RenderContext2D",
   "requires": [
      "R.rendercontexts.AbstractRenderContext",
      "R.math.Math2D",
      "R.struct.Container"
   ]
});

/**
 * @class All 2D contexts should extend from this to inherit the
 * methods which abstract the drawing methods.
 * @extends R.rendercontexts.AbstractRenderContext
 * @constructor
 * @description Create a new instance of a 2d render context.
 * @param name {String} The name of the context
 * @param surface {HTMLElement} The element which represents the surface of the context
 */
R.rendercontexts.RenderContext2D = function() {
   return R.rendercontexts.AbstractRenderContext.extend(/** @scope R.rendercontexts.RenderContext2D.prototype */{

      width: 0,
      height: 0,
      lineStyle: null,
      fillStyle: null,
      lineWidth: 1,
      position: null,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      wPosition: null,
      wRotation: 0,
      wScale: null,
      bBox: null,
      backgroundColor: null,
      font: null,
      fontWeight: null,
      fontSize: null,
      fontAlign: null,
      fontBaseline: null,
      fontStyle: null,
      zBins: null,
      postRenderList: null,
      _xformStack: null,

      /** @private */
      constructor: function(name, surface) {
         this.base(name || "RenderContext2D", surface);
         this.wPosition = R.math.Point2D.create(0, 0);
         this.wRotation = 0;
         this.wScale = 1;
         this.zBins = {
            "0": {
               all: R.struct.Container.create(),
               vis: []
            }
         };
         this.zBins.activeBins = [0];
         this.postRenderList = [];

         // Default font settings
         this.font = "sans-serif";
         this.fontWeight = "normal";
         this.fontSize = "12px";
         this.fontAlign = "left";
         this.fontBaseline = "alphabetic";
         this.fontStyle = "normal";
         this._xformStack = [];
         this.position = R.math.Point2D.create(0, 0);
         this.rotation = 0;
         this.scaleX = 1;
         this.scaleY = 1;
      },

      /**
       * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.width = 0;
         this.height = 0;
         this.lineStyle = null;
         this.fillStyle = null;
         this.lineWidth = 1;
         this.position = null;
         this.rotation = 0;
         this.scaleX = 1;
         this.scaleY = 1;
         this.bBox = null;
         this.backgroundColor = null;
         this.wPosition = null;
         this.wRotation = 0;
         this.wScale = null;
         this.font = null;
         this.fontWeight = null;
         this.fontSize = null;
         this.fontAlign = null;
         this.fontBaseline = null;
         this.fontStyle = null;
         this.zBins = null;
         this._xformStack = null;
      },

      /**
       * Clean up the render bins after cleaning up the contained objects.
       */
      cleanUp: function() {
         this.base();
         for (var b in this.zBins.activeBins) {
            this.zBins[this.zBins.activeBins[b]].all.destroy();
            this.zBins[this.zBins.activeBins[b]].all = null;
            this.zBins[this.zBins.activeBins[b]].vis = null;
         }
         this.zBins = {
            "0": {
               all: R.struct.Container.create(),
               vis: []
            }
         };
         this.zBins.activeBins = [0];
      },

      /**
       * Sorts objects by their {@link R.engine.Object2D#getZIndex z-index}.  Objects
       * that don't have a z-index are untouched.
       */
      sort: function() {
         this.base(R.rendercontexts.RenderContext2D.sortFn);
      },

      /**
       * Add an object to the context.  Only objects
       * within the context will be rendered.  If an object declared
       * an <tt>afterAdd()</tt> method, it will be called after the object
       * has been added to the context.
       *
       * @param obj {R.engine.BaseObject} The object to add to the render list
       */
      add: function(obj) {
         this.base(obj);

         // Organize objects into bins by their zIndex so we can
         // determine dirty rectangles
         if (obj.getZIndex) {
            this.swapBins(obj, R.rendercontexts.RenderContext2D.NO_ZBIN, obj.getZIndex());
         } else {
            // If they don't have a zIndex, put them in the zeroth bin
            this.swapBins(obj, R.rendercontexts.RenderContext2D.NO_ZBIN, 0);
         }
      },

      /**
       * Remove an object from the render context.  The object is
       * not destroyed when it is removed from the container.  The removal
       * occurs after each update to avoid disrupting the flow of object
       * traversal.
       *
       * @param obj {Object} The object to remove from the container.
       * @return {Object} The object that was removed
       */
      remove: function(obj) {
         this.base(obj);

         if (obj.getZIndex) {
            // Remove the object from the zBins
            var zBin = this.zBins[obj.getZIndex()];
            zBin.all.remove(obj);
            R.engine.Support.arrayRemove(zBin.vis, obj);
         } else {
            this.zBins["0"].all.remove(obj);
            R.engine.Support.arrayRemove(this.zBins["0"].vis, obj);
         }
      },

      /**
       * Swap the zBin that the object is contained within.
       * @param obj {R.engine.Object2D} The object to swap
       * @param oldBin {Number} The old bin number, or <tt>RenderContext2D.NO_ZBIN</tt> to just
       *    insert into a new bin.
       * @param newBin {Number} The new bin to put the object into
       */
      swapBins: function(obj, oldBin, newBin) {
         var zBin;
         if (oldBin != R.rendercontexts.RenderContext2D.NO_ZBIN) {
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
               all: R.struct.Container.create(),         // List of all objects in the bin
               vis: []                                   // Optimized list of only visible objects
            };

            zBin = this.zBins[newBin];
         }

         // Start objects out as "not visible"
         this.getContextData(obj).isVisible = false;

         // Add the object to the "all objects" container
         zBin.all.add(obj);
      },

      /**
       * Called to render all of the objects to the context.
       *
       * @param time {Number} The current render time in milliseconds from the engine.
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      render: function(time, dt) {
         // Push the world transform
         this.pushTransform();

         this.setupWorld(time, dt);

         // Run the objects in each bin
         for (var zbin in this.zBins.activeBins) {
            var bin = this.zBins[this.zBins.activeBins[zbin]];

            // Don't want to push the entire bin onto the stack
            this.processBin(this.zBins.activeBins[zbin]);
            R.Engine.rObjs += bin.vis.length;

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
         if (this.safeRemoveList.length > 0) {
            this._safeRemove();
         }
      },

      /**
       * A rendering function to perform in world coordinates.  After the world has
       * been rendered, and all transformations have been reset to world coordinates,
       * the list of post-render functions are executed.
       * @param fn {Function} A function to execute
       */
      postRender: function(fn) {
         this.postRenderList.push(fn);
      },

      /**
       * Process all objects in a bin, optimizing the list down to only those that are visible.
       * TODO: Hoping to put this in a Worker thead at some point for speed
       * @param binId {String} The bin Id
       * @private
       */
      processBin: function(binId) {
         var bin = this.zBins[binId];

         // Spin through "all" objects to determine visibility.
         var itr = bin.all.iterator();
         while (itr.hasNext()) {
            // Check if the object is visible, so it'll be processed.
            var obj = itr.next(), contextModel = this.getContextData(obj);
            if (!obj.getWorldBox || (this.getExpandedViewport().isIntersecting(obj.getWorldBox()))) {
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
      },

      /**
       * Render all of the objects in a single bin, grouped by z-index.
       * @param bin {Number} The bin number being rendered
       * @param objs {Array} Array of objects
       * @param time {Number} The current render time in milliseconds from the engine.
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      renderBin: function(bin, objs, time, dt) {
         R.engine.Support.forEach(objs, function(e) {
            this.renderObject(e, time, dt);
         }, this);
      },

      //------------------------------------------------------------------------

      /**
       * Set the background color of the context.
       *
       * @param color {String} An HTML color
       */
      setBackgroundColor: function(color) {
         this.backgroundColor = color;
      },

      /**
       * Get the color assigned to the context background.
       * @return {String}
       */
      getBackgroundColor: function() {
         return this.backgroundColor;
      },

      /**
       * Set the width of the context drawing area.
       *
       * @param width {Number} The width in pixels
       */
      setWidth: function(width) {
         this.width = width;
      },

      /**
       * Get the width of the context drawing area.
       * @return {Number}
       */
      getWidth: function() {
         return this.width;
      },

      /**
       * Set the height of the context drawing area
       *
       * @param height {Number} The height in pixels
       */
      setHeight: function(height) {
         this.height = height;
      },

      /**
       * Get the height of the context drawing area.
       * @render {Number}
       */
      getHeight: function() {
         return this.height;
      },

      /**
       * Get the bounding box for the rendering context.
       * @return {R.math.Rectangle2D}
       */
      getBoundingBox: function() {
         if (!this.bBox) {
            this.bBox = R.math.Rectangle2D.create(0, 0, this.getWidth(), this.getHeight());
         }
         return this.bBox;
      },

      /**
       * Set the current transform position (translation) relative to the viewport.
       *
       * @param point {R.math.Point2D} The translation
       */
      setPosition: function(point) {
         this.position.add(point);
      },

      /**
       * Get the current transform position (translation) relative to the viewport.
       *
       * @return {R.math.Point2D}
       */
      getPosition: function() {
         return this.position;
      },

      /**
       * Set the rotation angle of the current transform.
       *
       * @param angle {Number} An angle in degrees
       */
      setRotation: function(angle) {
         this.rotation = angle;
      },

      /**
       * Get the current transform rotation.
       * @return {Number}
       */
      getRotation: function() {
         return this.rotation;
      },

      /**
       * Set the scale of the current transform.  Specifying
       * only the first parameter implies a uniform scale.
       *
       * @param scaleX {Number} The X scaling factor, with 1 being 100%
       * @param scaleY {Number} The Y scaling factor
       */
      setScale: function(scaleX, scaleY) {
         this.scaleX = scaleX;
         this.scaleY = scaleY || scaleX;
      },

      /**
       * Get the X scaling factor of the current transform.
       * @return {Number}
       */
      getScaleX: function() {
         return this.scaleX;
      },

      /**
       * Get the Y scaling factor of the current transform.
       * @return {Number}
       */
      getScaleY: function() {
         return this.scaleY;
      },

      /**
       * Push the current transformation matrix.
       */
      pushTransform: function() {
			// Translation
			var p = R.clone(this.getWorldPosition()).add(this.getPosition());
			var tMtx = $M([[1, 0, p.x], [0, 1, p.y], [0, 0, 1]]);

			// Rotation
			var a = this.getWorldRotation() + this.getRotation();
			var rMtx;
			if (a != 0) {
				// Rotate
				rMtx = Matrix.Rotation(R.math.Math2D.degToRad(a), R.rendercontexts.RenderContext2D.ROTATION_AXIS);
			}
			else {
				// Set to identity
				rMtx = R.math.Math2D.identityMatrix();
			}

			// Scale
			var sX = this.getWorldScale() * this.getScaleX(), sY = this.getWorldScale() * this.getScaleY(),
             sMtx = $M([[sX, 0, 0], [0, sY, 0], [0, 0, 1]]), txfmMtx = tMtx.multiply(rMtx).multiply(sMtx);

         rMtx = null;
         sMtx = null;
			this._xformStack.push(txfmMtx);

         this.base();
      },

      /**
       * Pop the current transformation matrix.
       */
      popTransform: function() {
         // Restore the last position, (TODO: angle, and scale)
         var xform = this._xformStack.pop().col(3);
         this.position.set(xform.e(1), xform.e(2));

         this.base();
      },

      /**
       * Set the font to use when rendering text to the context.
       * @param font {String} A font string similar to CSS
       */
      setFont: function(font) {
         this.font = font;
      },

      /**
       * Get the font currently being used to render text
       * @return {String}
       */
      getFont: function() {
         return this.font;
      },

      /**
       * Get the normalized font string used to describe the style. The
       * value includes style, weight, size, and font.
       * @return {String}
       */
      getNormalizedFont: function() {
         return this.getFontStyle() + " " + this.getFontWeight() + " " + this.getFontSize() + " " + this.getFont();
      },

      /**
       * Set the size of the font being used to render text
       * @param size {String} The font size string
       */
      setFontSize: function(size) {
         this.fontSize = size + "px";
      },

      /**
       * Get the font size
       * @return {String}
       */
      getFontSize: function() {
         return this.fontSize;
      },

      /**
       * Set the rendering weight of the font
       * @param weight {String}
       */
      setFontWeight: function(weight) {
         this.fontWeight = weight;
      },

      /**
       * Get the weight of the font to be rendered to the context
       * @return {String}
       */
      getFontWeight: function() {
         return this.fontWeight;
      },

      /**
       * Set the font alignment for the context
       * @param align {String} The font alignment
       */
      setFontAlign: function(align) {
         this.fontAlign = align;
      },

      /**
       * Get the alignment of the font
       * @return {String}
       */
      getFontAlign: function() {
         return this.fontAlign;
      },

      /**
       * Set the baseline of the renderable font
       * @param baseline {String} The render baseline
       */
      setFontBaseline: function(baseline) {
         this.fontBaseline = baseline;
      },

      /**
       * Get the font baseline
       * @return {String}
       */
      getFontBaseline: function() {
         return this.fontBaseline;
      },

      /**
       * Set the style of the renderable font
       * @param style {String} The font style
       */
      setFontStyle: function(style) {
         this.fontStyle = style;
      },

      /**
       * Get a rectangle that will approximately enclose the text drawn by the render context.
       * @param text {String} The text to measure
       * @return {R.math.Rectangle2D}
       */
      getTextMetrics: function(text) {
         return R.math.Rectangle2D.create(0, 0, 1, 1);
      },

      /**
       * Get the renderable style of the font
       * @return {String}
       */
      getFontStyle: function() {
         return this.fontStyle;
      },

      /**
       * Set the current transformation using a matrix.  Replaces the
       * current transformation at the top of the stack.
       * @param matrix {Matrix} The transformation matrix
       */
      setTransform: function(matrix) {
         this._xformStack[this._xformStack.length - 1] = matrix;
      },

      /**
       * Get the current transformation matrix.
       * @return {Matrix}
       */
      getTransform: function() {
         return this._xformStack[this._xformStack.length - 1];
      },

      /**
       * Set the transformation of the world.
       *
       * @param position {R.math.Point2D}
       * @param rotation {Number}
       * @param scale {Number}
       */
      setRenderTransform: function(mtx3) {
      },

      /**
       * Get the render position relative to the world
       * @return {R.math.Point2D}
       */
      getRenderPosition: function() {
         return R.math.Point2D.ZERO;
      },

      /**
       * Get the render rotation relative to the world
       * @return {Number}
       */
      getRenderRotation: function() {
         return 0;
      },

      /**
       * Get the render scale relative to the world
       * @return {Number}
       */
      getRenderScale: function() {
         return 1.0;
      },

      /**
       * Set the line style for the context.
       *
       * @param lineStyle {String} An HTML color or <tt>null</tt>
       */
      setLineStyle: function(lineStyle) {
         this.lineStyle = lineStyle;
      },

      /**
       * Get the current line style for the context.  <tt>null</tt> if
       * not set.
       * @return {String}
       */
      getLineStyle: function() {
         return this.lineStyle;
      },

      /**
       * Set the line width for drawing paths.
       *
       * @param [width=1] {Number} The width of lines in pixels
       */
      setLineWidth: function(width) {
         this.lineWidth = width;
      },

      /**
       * Get the current line width for drawing paths.
       * @return {Number}
       */
      getLineWidth: function() {
         return this.lineWidth;
      },

      /**
       * Set the fill style of the context.
       *
       * @param fillStyle {String} An HTML color, or <tt>null</tt>.
       */
      setFillStyle: function(fillStyle) {
         this.fillStyle = fillStyle;
      },

      /**
       * Get the current fill style of the context.
       * @return {String}
       */
      getFillStyle: function() {
         return this.fillStyle;
      },

      /**
       * Draw an un-filled rectangle on the context.
       *
       * @param rect {R.math.Rectangle2D} The rectangle to draw
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawRectangle: function(rect /*, ref */) {
      },

      /**
       * Draw a filled rectangle on the context.
       *
       * @param rect {R.math.Rectangle2D} The rectangle to draw
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawFilledRectangle: function(rect /*, ref */) {
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
         this.drawArc(point, radius, 0, R.math.Math2D.TWO_PI);
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
         this.drawFilledArc(point, radius, 0, R.math.Math2D.TWO_PI);
      },

      /**
       * Draw a polygon or polyline using a Duff's device for
       * efficiency and loop unrolling with inversion for speed.
       *
       * @param pointArray {Array} An array of <tt>R.math.Point2D</tt> objects
       * @param closedLoop {Boolean} <tt>true</tt> to close the polygon
       * @private
       */
      _poly: function(pointArray, closedLoop) {
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
      },

      /**
       * Draw an un-filled regular polygon with N sides.
       *
       * @param sides {Number} The number of sides, must be more than 2
       * @param center {R.math.Point2D} The center of the polygon
       * @param [radius] {Number} The radius of the polygon. Default: 100
       */
      drawRegularPolygon: function(sides, center, radius) {
         var poly = R.math.Math2D.regularPolygon(sides, radius);
         for (var p = 0; p < poly.length; p++) {
            poly[p].add(center);
         }
         this.drawPolygon(poly);
      },

      /**
       * Draw an un-filled polygon on the context.
       *
       * @param pointArray {Array} An array of {@link R.math.Point2D} objects
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawPolygon: function(pointArray /*, ref */) {
         this._poly(pointArray, true);
         this.strokePath();
         this.lineSeg.moveTo = false;
      },

      /**
       * Draw a non-closed poly line on the context.
       *
       * @param pointArray {Array} An array of {@link Point2D} objects
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawPolyline: function(pointArray /*, ref */) {
         this._poly(pointArray, false);
         this.strokePath();
         this.lineSeg.moveTo = false;
      },

      /**
       * Draw an filled polygon on the context.
       *
       * @param pointArray {Array} An array of {@link R.math.Point2D} objects
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawFilledPolygon: function(pointArray /*, ref */) {
         this._poly(pointArray, true);
         this.fillPath();
         this.lineSeg.moveTo = false;
      },

      /**
       * Draw an un-filled regular polygon with N sides.
       *
       * @param sides {Number} The number of sides, must be more than 2
       * @param center {R.math.Point2D} The center of the polygon
       * @param [radius] {Number} The radius of the polygon. Default: 100
       */
      drawFilledRegularPolygon: function(sides, center, radius) {
         var poly = R.math.Math2D.regularPolygon(sides, radius);
         for (var p = 0; p < poly.length; p++) {
            poly[p].add(center);
         }
         this.drawFilledPolygon(poly);
      },

      /**
       * Draw a line on the context.
       *
       * @param point1 {R.math.Point2D} The start of the line
       * @param point2 {R.math.Point2D} The end of the line
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawLine: function(point1, point2 /*, ref */) {
      },

      /**
       * Draw a point on the context.
       *
       * @param point {R.math.Point2D} The position to draw the point
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawPoint: function(point /*, ref */) {
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
      },

      /**
       * Capture an image from the context.
       *
       * @param rect {R.math.Rectangle2D} The area to capture
       * @return {ImageData} Image data capture
       */
      getImage: function(rect) {
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
      },

      /**
       * Draw text on the context.
       *
       * @param point {R.math.Point2D} The top-left position to draw the image.
       * @param text {String} The text to draw
       * @param [ref] {R.engine.GameObject} A reference game object
       */
      drawText: function(point, text /*, ref */) {
      },

      /**
       * Start a path.
       */
      startPath: function() {
      },

      /**
       * End a path.
       */
      endPath: function() {
      },

      /**
       * Stroke a path using the current line style and width.
       */
      strokePath: function() {
      },

      /**
       * Fill a path using the current fill style.
       */
      fillPath: function() {
      },

      /**
       * Move the current path to the point sepcified.
       *
       * @param point {R.math.Point2D} The point to move to
       */
      moveTo: function(point) {
      },

      /**
       * Draw a line from the current point to the point specified.
       *
       * @param point {R.math.Point2D} The point to draw a line to
       */
      lineTo: function(point) {
      },

      /**
       * Used to draw line segments for polylines.  If <tt>point</tt>
       * is <tt>null</tt>, the context will move to the next point.  Otherwise,
       * it will draw a line to the point.
       *
       * @param point {R.math.Point2D} The point to draw a line to, or null.
       */
      lineSeg: function(point) {
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
      },

      /**
       * Draw a quadratic curve from the current point to the specified point.
       *
       * @param cPoint {R.math.Point2D} The control point
       * @param point {R.math.Point2D} The point to draw to
       */
      quadraticCurveTo: function(cPoint, point) {
      },

      /**
       * Draw a bezier curve from the current point to the specified point.
       *
       * @param cPoint1 {R.math.Point2D} Control point 1
       * @param cPoint2 {R.math.Point2D} Control point 2
       * @param point {R.math.Point2D} The point to draw to
       */
      bezierCurveTo: function(cPoint1, cPoint2, point) {
      },

      /**
       * Draw an arc from the current point to the specified point.
       *
       * @param point1 {R.math.Point2D} Arc point 1
       * @param point2 {R.math.Point2D} Arc point 2
       * @param radius {Number} The radius of the arc
       */
      arcTo: function(point1, point2, radius) {
      },

      /**
       * Draw an element on the context
       * @param ref {R.engine.GameObject} A reference game object
       */
      drawElement: function(ref){
      }

   }, /** @scope R.rendercontexts.RenderContext2D.prototype */{
      /**
       * Get the class name of this object
       *
       * @return {String} "R.rendercontexts.RenderContext2D"
       */
      getClassName: function() {
         return "R.rendercontexts.RenderContext2D";
      },

      /**
       * Sort the objects to draw from objects with the lowest
       * z-index to the highest z-index.
       * @static
       */
      sortFn: function(obj1, obj2) {
         if (obj1.getZIndex && obj2.getZIndex) {
            return obj1.getZIndex() - obj2.getZIndex();
         }
         return 0
      },

      /**
       * Bold text weight
       * @type {String}
       */
      FONT_WEIGHT_BOLD: "bold",

      /**
       * Normal text weight
       * @type {String}
       */
      FONT_WEIGHT_NORMAL: "normal",

      /**
       * Light text weight
       * @type {String}
       */
      FONT_WEIGHT_LIGHT: "light",

      /**
       * Text align left
       * @type {String}
       */
      FONT_ALIGN_LEFT: "left",

      /**
       * Text align right
       * @type {String}
       */
      FONT_ALIGN_RIGHT: "right",

      /**
       * Text align center
       * @type {String}
       */
      FONT_ALIGN_CENTER: "center",

      /**
       * Text align start of stroke
       * @type {String}
       */
      FONT_ALIGN_START: "start",

      /**
       * Text align end of stroke
       * @type {String}
       */
      FONT_ALIGN_END: "end",

      /**
       * Text baseline alphabetic
       * @type {String}
       */
      FONT_BASELINE_ALPHABETIC: "alphabetic",

      /**
       * Text baseline top of em box
       * @type {String}
       */
      FONT_BASELINE_TOP: "top",

      /**
       * Text baseline hanging ideograph
       * @type {String}
       */
      FONT_BASELINE_HANGING: "hanging",

      /**
       * Text baseline middle of em square
       * @type {String}
       */
      FONT_BASELINE_MIDDLE: "middle",

      /**
       * Text baseline ideographic bottom
       * @type {String}
       */
      FONT_BASELINE_IDEOGRAPHIC: "ideographic",

      /**
       * Text baseline bottom of em square
       * @type {String}
       */
      FONT_BASELINE_BOTTOM: "bottom",

      /**
       * Text style italic
       * @type {String}
       */
      FONT_STYLE_ITALIC: "italic",

      /**
       * Text style normal
       * @type {String}
       */
      FONT_STYLE_NORMAL: "normal",

      /**
       * Text style oblique
       * @type {String}
       */
      FONT_STYLE_OBLIQUE: "oblique",

      /**
       * @private
       */
      NO_ZBIN: 0xDEADBEEF,

      /**
       * @private
       */
      ROTATION_AXIS: $V([0, 0, 1])
   });

};
