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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.math.Rectangle2D",
	"requires": [
		"R.math.PooledMathObject",
		"R.math.Point2D",
		"R.math.Math2D"
	]
});

/**
 * @class A 2D rectangle class with helpful manipulation methods.
 * @extends R.math.PooledMathObject
 * @constructor
 * @param x {R.math.Rectangle2D|Number} A rectangle to clone, or the top-left X coordinate
 * @param y {Number} The top-left Y coordinate
 * @param width {Number} the width of the rectangle
 * @param height {Number} The height of the rectangle
 * @description Create a rectangle object specifying the X and Y position and
 * 	the width and height.
 */
R.math.Rectangle2D = function() {
	return R.math.PooledMathObject.extend(/** @scope R.math.Rectangle2D.prototype */{

   topLeft: null,
	bottomRight: null,
   dims: null,
	center: null,

   /** @private */
   constructor: function(x, y, width, height) {
		this.base("Rectangle2D");

      this.topLeft = R.math.Point2D.create(0,0);
      this.bottomRight = R.math.Point2D.create(0,0);
      this.dims = R.math.Point2D.create(0,0);
		this.center = R.math.Point2D.create(0,0);
		
		
      this.set(x,y,width,height);
		this.base("Rectangle2D");
   },

	/**
	 * Destroy the rectangle instance
	 */
	destroy: function() {
		this.topLeft.destroy();
		this.bottomRight.destroy();
		this.dims.destroy();
		this.center.destroy();
		this.base();
	},

	/**
	 * Release the rectangle back into the pool for reuse
	 */
   release: function() {
      this.base();
      this.topLeft = null;
      this.dims = null;
      this.bottomRight = null;
		this.center = null;
   },

	/**
	 * @private
	 */
	_upd: function() {
		this.bottomRight.set(this.getTopLeft().x + this.getDims().x, this.getTopLeft().y + this.getDims().y);
		this.center.set(this.getTopLeft().x + (this.getDims().x * 0.5), this.getTopLeft().y + (this.getDims().y * 0.5));
	},

   /**
    * Set the values of this rectangle.
    *
    * @param x {Array|Number|R.math.Rectangle2D} An optional value to initialize the X coordinate of the rectangle, or a rectangle to clone
    * @param y {Number} An optional value to initialize the Y coordinate of the rectangle
    * @param width {Number} An optional value to initialize the width of the rectangle
    * @param height {Number} An optional value to initialize the height of the rectangle
    */
   set: function(x, y, width, height) {
		if (x.length && x.splice && x.shift) {
         this.topLeft.set(x[0],x[1]);
			this.dims.set(x[2],x[3]);
		} else if (x.setTopLeft && x.setDims) {
         this.topLeft.set(x.x,x.y);
			this.dims.set(x.w,x.h);
      } else {
         this.topLeft.set(x,y);
			this.dims.set(width,height);
      }
		this._upd();		
   },

   /**
    * Get an object with the elements containing left, top, width, height, right
    * and bottom as the elements x, y, w, h, r, and b. 
    *
    * @return {Object} An object with the specified elements
    * @deprecated
    */
   get: function() {
      return {x: this.x, y: this.y, w: this.w, h: this.h, r: this.r, b: this.b};
   },

   /**
    * Returns <tt>true</tt> if this rectangle is equal to the specified rectangle.
    *
    * @param rect {R.math.Rectangle2D} The rectangle to compare to
    * @return {Boolean} <tt>true</tt> if the two rectangles are equal
    */
   equals: function(rect) {
      return this.x == rect.x && this.y == rect.y &&
				 this.w == rect.w && this.h == rect.h;
   },

   /**
    * A mutator method that offsets this rectangle by the given amount in the X and Y axis.  
    * The first parameter can be either a point, or the value for the X axis.  If the X axis is 
    * specified, the second parameter should be the amount to offset in the Y axis.
    *
    * @param offsetPtOrX {R.math.Point2D|int} Either a {@link R.math.Point} which contains the offset in X and Y, or an integer
    *                                representing the offset in the X axis.
    * @param offsetY {int} If <code>offsetPtOrX</code> is an integer value for the offset in the X axis, this should be
    *                      the offset along the Y axis.
    * @return {R.math.Rectangle2D} This rectangle
    */
   offset: function(offsetPtOrX, offsetY) {
      var offs = R.math.Point2D.create(0,0);
      if (offsetPtOrX.__POINT2D) {
         offs.set(offsetPtOrX);
      } else {
         offs.set(offsetPtOrX, offsetY);
      }

		this.x += offs.x;
		this.y += offs.y;
		offs.destroy();
		this._upd();		
      return this;
   },

   /**
    * Set the top left of this rectangle to the point, or coordinates specified.
    *
    * @param ptOrX {R.math.Point2D|Number} The top left {@link R.math.Point2D}, or the X coordinate
    * @param y {Number} If the top left wasn't specified as the first argument, this is the Y coordinate
    */
   setTopLeft: function(ptOrX, y) {
      if (ptOrX.addScalar && ptOrX.convolveInverse) {
			this.x = ptOrX.x;
			this.y = ptOrX.y;
      } else {
			this.x = ptOrX;
			this.y = y;
      }
		this._upd();		
   },

   /**
    * Set the width and height of this rectangle using the point, or coordinates specified.
    * @param ptOrX {Point2D|Number} A {@link R.math.Point2D}, or the X coordinate
    * @param [y] {Number} If the top left isn't a point, this is the Y coordinate
    */
   setDims: function(ptOrX, y) {
      if (ptOrX.addScalar && ptOrX.convolveInverse) {
			this.w = ptOrX.x;
			this.h = ptOrX.y;
      } else {
			this.w = ptOrX;
			this.h = y;
      }
 		this._upd();		
  },

   /**
    * Set the width of the rectangle.
    *
    * @param width {Number} The new width of the rectangle
    */
   setWidth: function(width) {
		this.w = width;
		this._upd();		
   },

   /**
    * Set the height of the rectangle
    *
    * @param height {Number} The new height of the rectangle
    */
   setHeight: function(height) {
		this.h = height;
		this._upd();		
   },

   /**
    * Determine if this rectangle intersects another rectangle.
    *
    * @param rect A {@link R.math.Rectangle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the two rectangles intersect.
    */
   isIntersecting: function(rect) {
      return !(this.r < rect.x ||
               this.x > rect.r ||
               this.y > rect.b ||
               this.b < rect.y);
   },

   /**
    * Determine if this rectangle is contained within the specified rectangle.
    *
    * @param rect A {@link R.math.Rectangle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the this rectangle is fully contained in the specified rectangle.
    */
   isContained: function(rect) {
      return ((this.x >= rect.x) &&
              (this.y >= rect.y) &&
              (this.r <= rect.r) &&
              (this.b <= rect.b));
   },

   /**
    * Determine if this rectangle contains the specified rectangle.
    *
    * @param rect A {@link R.math.Rectangle2D} to compare against
    * @return {Boolean} <tt>true</tt> if the rectangle is fully contained within this rectangle.
    */
   containsRect: function(rect) {
		return rect.isContained(this);
   },

   /**
    * Returns <tt>true</tt> if this rectangle contains the specified point.
    *
    * @param point {R.math.Point} The point to test
    * @return {Boolean} <tt>true</tt> if the point is within this rectangle
    */
   containsPoint: function(point) {
      return (point.x >= this.x &&
              point.y >= this.y &&
              point.x <= this.r &&
              point.y <= this.b);
   },

   /**
    * Returns a {@link R.math.Point2D} that contains the center point of this rectangle.
    *
    * @return {R.math.Point2D} The center point of the rectangle
    */
   getCenter: function() {
		return this.center;
   },

   /**
    * Returns the half length of the width dimension of this rectangle
    * @return {Number} The half-width
    */
   getHalfWidth: function() {
      return this.len_x() * 0.5;
   },

   /**
    * Returns the half length of the height dimension of this rectangle
    * @return {Number} The half-height
    */
   getHalfHeight: function() {
      return this.len_y() * 0.5;
   },

   /**
    * Returns the positive length of this rectangle, along the X axis.
    *
    * @return {Number}
    */
   len_x: function() {
      return Math.abs(this.w);
   },

   /**
    * Returns the positive length of this rectangle, along the Y axis.
    *
    * @return {Number}
    */
   len_y: function() {
      return Math.abs(this.h);
   },

   /**
    * Gets a {@link R.math.Point2D} representing the top-left corner of this rectangle.
    * @return {R.math.Point2D}
    */
   getTopLeft: function() {
      return this.topLeft;
   },

   /**
    * Gets a {@link R.math.Point2D) representing the width and height of this rectangle.
    * @return {R.math.Point2D}
    */
   getDims: function() {
      return this.dims;
   },

   /**
    * Gets a {@link R.math.Point2D} representing the bottom-right corner of this rectangle.
    * @return {R.math.Point2D}
    */
   getBottomRight: function() {
      return this.bottomRight;
   },

	/**
	 * Mutator method which will join this rectangle with another 
	 * rectangle.  Joining two rectangles will create a rectangle that 
	 * would enclose both rectangles.  It is best to see if two rectangles
	 * are overlapping before joining them, since joining two disjoint
	 * rectangles would enclose areas not contained in either.
	 * 
	 * @param rect {R.math.Rectangle2D} The rectangle to join with
	 * @return {R.math.Rectangle2D} This rectangle
	 */
	join: function(rect) {
		var x1 = this.topLeft.x;
		var x2 = this.topLeft.x + this.dims.x;
		var x3 = rect.topLeft.x;
		var x4 = rect.topLeft.x + rect.dims.x;
		var y1 = this.topLeft.y;
		var y2 = this.topLeft.y + this.dims.y;
		var y3 = rect.topLeft.y;
		var y4 = rect.topLeft.y + rect.dims.y;
		
		var x=Math2.MAX_INT,y=x,w=-Math2.MAX_INT,h=w;
		if (x1<x) x = x1; if (x2<x) x = x2;
		if (x3<x) x = x3; if (x4<x) x = x4;
		if (x1>w) w = x1; if (x2>w) w = x2;
		if (x3>w) w = x3; if (x4>w) w = x4;
		if (y1<y) y = y1; if (y2<y) y = y2;
		if (y3<y) y = y3; if (y4<y) y = y4;
		if (y1>h) h = y1; if (y2>h) h = y2;
		if (y3>h) h = y3; if (y4>h) h = y4;
		this.topLeft.x = x; this.topLeft.y = y;
		this.dims.x = w-x; this.dims.y = h-y;
		return this;
	},

   /**
    * Returns a printable version of this object.
    * @return {String} Formatted like "x,y [w,h]"
    */
   toString: function() {
      return (this.topLeft + " [" + this.dims + "]");
   }
	
}, /** @scope R.math.Rectangle2D.prototype */{ 
   
   /**
    * Return the classname of the this object
    * @return {String} "R.math.Rectangle2D"
    */
   getClassName: function() {
      return "R.math.Rectangle2D";
   },
	
	/** @private */
	resolved: function() {
		var rp = R.math.Rectangle2D.prototype;
		
		// Define setters and getters
		rp.__defineGetter__("x", function() {
			return this.getTopLeft() != null ? this.getTopLeft().x : 0;
		});
		
		rp.__defineSetter__("x", function(val) {
			this.getTopLeft().setX(val);
			this.getCenter().set(this.getTopLeft().x + (this.getDims().x * 0.5), this.getTopLeft().y + (this.getDims().y * 0.5));
		});
		
		rp.__defineGetter__("y", function() {
			return this.getTopLeft() != null ? this.getTopLeft().y : 0;
		});
		
		rp.__defineSetter__("y", function(val) {
			this.getTopLeft().setY(val);
			this.getCenter().set(this.getTopLeft().x + (this.getDims().x * 0.5), this.getTopLeft().y + (this.getDims().y * 0.5));
		});
		
		rp.__defineGetter__("w", function() {
			return this.getDims() != null ? this.getDims().x : 0;
		});
		
		rp.__defineSetter__("w", function(val) {
			this.getDims().setX(val);
			this.getBottomRight().set(this.getTopLeft().x + this.getDims().x, this.getTopLeft().y + this.getDims().y);
			this.getCenter().set(this.getTopLeft().x + (this.getDims().x * 0.5), this.getTopLeft().y + (this.getDims().y * 0.5));
		});
		
		rp.__defineGetter__("h", function() {
			return this.getDims() != null ? this.getDims().y : 0;
		});
		
		rp.__defineSetter__("h", function(val) {
			this.getDims().setY(val);
			this.getBottomRight().set(this.getTopLeft().x + this.getDims().x, this.getTopLeft().y + this.getDims().y);
			this.getCenter().set(this.getTopLeft().x + (this.getDims().x * 0.5), this.getTopLeft().y + (this.getDims().y * 0.5));
		});
		
		rp.__defineGetter__("r", function() {
			return this.getDims() != null && this.getTopLeft() != null ? 
					 this.getTopLeft().x + this.getDims().x : 0;
		});
		
		rp.__defineGetter__("b", function() {
			return this.getDims() != null && this.getTopLeft() != null ?
					 this.getTopLeft().y + this.getDims().y : 0;
		});
	}
});

}