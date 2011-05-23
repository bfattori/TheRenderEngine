/**
 * The Render Engine
 * Vector2DComponent
 *
 * @fileoverview An extension of the render component which draws 2D
 *               wireframe (vector) models to the render context.
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
	"class": "R.components.render.Vector2D",
	"requires": [
		"R.components.Render",
		"R.collision.ConvexHull",
		"R.collision.OBBHull",
		"R.collision.CircleHull",
		"R.math.Math2D",
		"R.math.Point2D",
		"R.math.Vector2D",
		"R.math.Rectangle2D"
	]
});

/**
 * @class A render component that renders its contents from an <tt>Array</tt> of points.
 *
 * @param name {String} The name of the component
 * @param [priority=0.1] {Number} The priority of the component
 * @extends R.components.Render
 * @constructor
 * @description Creates a 2d vector drawing component
 */
R.components.render.Vector2D = function() {
	return R.components.Render.extend(/** @scope R.components.render.Vector2D.prototype */{

   strokeStyle: "#ffffff",     // Default to white lines
   lineWidth: 1,
   fillStyle: null,          // Default to none
   points: null,
   bBox: null,
   closedManifold: null,

   /**
    * @private
    */
   constructor: function(name, priority) {
      this.base(name, priority || 0.1);
      this.closedManifold = true;
		this.points = [];
		this.bBox = R.math.Rectangle2D.create(0,0,0,0);
   },

	/**
	 * Destroys the object instance
	 */
	destroy: function() {
		this.bBox.destroy();
		while (this.points.length > 0) {
			this.points.shift().destroy();
		}
		this.base();
	},

   /**
    * Release the component back into the object pool. See {@link PooledObject#release} for
    * more information.
    */
   release: function() {
      this.base();
      this.strokeStyle = "#ffffff";
      this.lineWidth = 1;
      this.fillStyle = null;
      this.points = null;
      this.bBox = null;
      this.closedManifold = null;
   },

   /**
    * Calculate the bounding box from the set of
    * points which comprise the shape to be rendered.
    * @private
    */
   calculateBoundingBox: function() {
      R.math.Math2D.getBoundingBox(this.points, this.bBox);
   },

   /**
    * Set the points which comprise the shape of the object to
    * be rendered to the context.
    *
    * @param pointArray {Array} An array of <tt>Point2D</tt> instances
    */
   setPoints: function(pointArray) {
		var pc = [];
		for (var p in pointArray) {
			pc.push(R.math.Point2D.create(pointArray[p]));
		}
      this.points = pc;
      this.renderState = null;
      this.calculateBoundingBox();
		
		// Get the center of the bounding box and move all of the points so none are negative
		var hP = R.math.Point2D.create(this.bBox.getHalfWidth(), this.bBox.getHalfHeight());
		for (p in this.points) {
			this.points[p].add(hP);
		}
		
		this.calculateBoundingBox();
		this.getGameObject().markDirty();
   },
	
	/**
	 * Transform all of the points by the given matrix
	 * @param matrix {Matrix}
	 */
	transformPoints: function(matrix) {
		for (var c=0; c < this.points.length; c++) {
			this.points[c].transform(matrix);
		}
		this.calculateBoundingBox();
		this.getGameObject().markDirty();
	},

	/**
	 * Get the box which would enclose the shape
	 * @return {R.math.Rectangle2D}
	 */
	getBoundingBox: function() {
		return this.bBox;
	},

	/**
	 * Get the center point from all of the points
	 * @return {R.math.Point2D}
	 */ 
	getCenter: function() {
		return R.math.Math2D.getCenterOfPoints(this.points);
	},

	/**
	 * Get a convex hull that would enclose the points.  The the LOD isn't
	 * specified, it will be assumed to be 4.
	 * @param [lod] {Number} The level of detail for the hull.
	 * @return {R.collision.ConvexHull} A convex hull
	 */
	getConvexHull: function(lod) {
		return R.collision.ConvexHull.create(this.points, lod || this.points.length - 1);
	},
	
	/**
	 * Get an Object Bounding Box (OBB) convex hull.
	 * @return {R.collision.OBBHull} A convex hull
	 */
	getOBBHull: function() {
		return R.collision.OBBHull.create(this.getBoundingBox());
	},
	
	/**
	 * Get a circular convex hull which encloses the points.
	 * @param radiusPct {Number} A percentage of the calculated radius of the points, or <tt>null</tt>
	 * @return {R.collision.CircleHull} A convex hull
	 */
	getCircleHull: function(radiusPct) {
		return R.collision.CircleHull.create(this.points, radiusPct);
	},

   /**
    * Set the color of the lines to be drawn for this shape.
    *
    * @param strokeStyle {String} The HTML color of the stroke (lines) of the shape
    */
   setLineStyle: function(strokeStyle) {
      this.strokeStyle = strokeStyle;
		this.getGameObject().markDirty();
   },

   /**
    * Returns the line style that will be used to draw this shape.
    * @return {String}
    */
   getLineStyle: function() {
      return this.strokeStyle;
   },

   /**
    * Set the width of lines used to draw this shape.
    *
    * @param lineWidth {Number} The width of lines in the shape
    */
   setLineWidth: function(lineWidth) {
      this.lineWidth = lineWidth;
		this.getGameObject().markDirty();
   },

   /**
    * Returns the width of the lines used to draw the shape.
    * @return {Number}
    */
   getLineWidth: function() {
      return this.lineWidth;
   },

   /**
    * Set the color used to fill the shape.
    *
    * @param fillStyle {String} The HTML color used to fill the shape.
    */
   setFillStyle: function(fillStyle) {
      this.fillStyle = fillStyle;
		this.getGameObject().markDirty();
   },

   /**
    * Returns the fill style of the shape.
    * @return {String}
    */
   getFillStyle: function() {
      return this.fillStyle;
   },

   /**
    * Set whether or not we draw a polygon or polyline.  <tt>true</tt>
    * to draw a polygon (the path formed by the points is a closed loop.
    *
    * @param closed {Boolean}
    */
   setClosed: function(closed) {
      this.closedManifold = closed;
		this.getGameObject().markDirty();
   },

   /**
    * Draw the shape, defined by the points, to the rendering context
    * using the specified line style and fill style.
    *
    * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render to
    * @param time {Number} The engine time in milliseconds
    * @param dt {Number} The delta between the world time and the last time the world was updated
    *          in milliseconds.
    */
   execute: function(renderContext, time, dt) {
      if (!(this.points && this.base(renderContext, time, dt))) {
         return;
      }

      // Set the stroke and fill styles
      if (this.getLineStyle() != null) {
         renderContext.setLineStyle(this.strokeStyle);
      }

      renderContext.setLineWidth(this.lineWidth);

      if (this.getFillStyle() != null) {
         renderContext.setFillStyle(this.fillStyle);
      }

		this.transformOrigin(renderContext, true);

      // Render out the points
      if (this.closedManifold) {
         renderContext.drawPolygon(this.points);
      } else {
         renderContext.drawPolyline(this.points);
      }

      if (this.fillStyle) {
         renderContext.drawFilledPolygon(this.points);
      }

		this.transformOrigin(renderContext, false);

   }
}, /** @scope R.components.render.Vector2D.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.render.Vector2D"
    */
   getClassName: function() {
      return "R.components.render.Vector2D";
   }
});
}