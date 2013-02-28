/**
 * The Render Engine
 * Circle2D
 *
 * @fileoverview A Circle2D class
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
    "class":"R.math.Circle2D",
    "requires":[
        "R.math.PooledMathObject",
        "R.math.Point2D",
        "R.math.Rectangle2D",
        "R.math.Math2D"
    ]
});

/**
 * @class A 2D circle class with helpful manipulation methods.
 * @extends R.math.PooledMathObject
 * @constructor
 * @param x {Number} The center X coordinate
 * @param y {Number} The center Y coordinate
 * @param radius {Number} The radius of the circle
 * @description Create a circle object specifying the X and Y center position and
 *     the radius.
 */
R.math.Circle2D = function () {
    "use strict";
    return R.math.PooledMathObject.extend(/** @scope R.math.Circle2D.prototype */{

        center:null,
        radius:0,
        __CIRCLE2D:true,

        /** @private */
        constructor:function (x, y, radius) {
            this.__CIRCLE2D = true;
            this.center = R.math.Point2D.create(0, 0);
            this.radius = 0;
            this.set(x, y, radius);
        },

        /**
         * Destroy the instance of the circle
         */
        destroy:function () {
            if (this.center) {
                this.center.destroy();
            }
            this.base();
        },

        /**
         * Release the circle back into the pool for reuse.
         */
        release:function () {
            this.base();
            this.center = null;
            this.radius = 0;
        },

        /**
         * Set the values of this circle.
         *
         * @param x {Number|R.math.Point2D|R.math.Circle2D} An optional value to initialize the X coordinate of the circle
         * @param y {Number} An optional value to initialize the Y coordinate of the circle
         * @param radius {Number} An optional value to initialize the radius
         */
        set:function (x, y, radius) {
            if (x.__CIRCLE2D) {
                this.center.set(x.getCenter());
                this.radius = x.getRadius();
            }
            else if (x.__POINT2D) {
                this.center.set(x);
                this.radius = y;
            }
            else {
                this.center.set(x || 0, y || 0);
                this.radius = radius || 0.0;
            }
        },

        /**
         * Get an object with the elements containing centerX, centerY, and radius
         * as the elements x, y, and r.
         *
         * @return {Object} An object with the specified elements
         */
        get:function () {
            var c = this.getCenter();
            return {
                x:c.x,
                y:c.y,
                r:this.getRadius()
            };
        },

        /**
         * Returns <tt>true</tt> if this circle is equal to the specified circle.
         *
         * @param circle {R.math.Circle2D} The circle to compare to
         * @return {Boolean} <tt>true</tt> if the two circles are equal
         */
        equals:function (circle) {
            return (this.center.equals(circle.getCenter()) && this.radius == circle.getRadius());
        },

        /**
         * Offset this circle by the given amount in the X and Y axis.  The first parameter
         * can be either a {@link Point2D}, or the value for the X axis.  If the X axis is specified,
         * the second parameter should be the amount to offset in the Y axis.
         *
         * @param offsetPtOrX {R.math.Point2D|int} Either a {@link R.math.Point2D} which contains the offset in X and Y, or an integer
         *                                representing the offset in the X axis.
         * @param offsetY {int} If <code>offsetPtOrX</code> is an integer value for the offset in the X axis, this should be
         *                      the offset along the Y axis.
         */
        offset:function (offsetPtOrX, offsetY) {
            var offs = R.math.Point2D.create(0, 0);
            if (offsetPtOrX.__POINT2D) {
                offs.set(offsetPtOrX);
            }
            else {
                offs.set(offsetPtOrX, offsetY);
            }

            this.center.add(offs);
            offs.destroy();
            return this;
        },

        /**
         * Get the center point of this circle.
         * @return {R.math.Point2D} The center point
         */
        getCenter:function () {
            return this.center;
        },

        /**
         * Get the radius of this circle
         * @return {Number} The radius
         */
        getRadius:function () {
            return this.radius;
        },

        /**
         * Determine if this circle intersects another circle.
         *
         * @param circle A {@link R.math.Circle2D} to compare against
         * @return {Boolean} <tt>true</tt> if the two circles intersect.
         */
        isIntersecting:function (circle) {
            var c1 = this.getCenter();
            var c2 = circle.getCenter();
            var dX = (c1.x - c2.x) * (c1.x - c2.x);
            var dY = (c1.y - c2.y) * (c1.y - c2.y);
            var r2 = (this.getRadius() + circle.getRadius()) * (this.getRadius() + circle.getRadius());
            return (dX + dY <= r2);
        },

        /**
         * Determine if this circle is contained within the specified circle.
         *
         * @param circle {R.math.Circle2D} A circle to compare against
         * @return {Boolean} <tt>true</tt> if the this circle is fully contained in the specified circle.
         */
        isContained:function (circle) {
            var d = circle.getCenter().dist(this.getCenter());
            return (d < (this.getRadius() + circle.getRadius()));
        },

        /**
         * Determine if this circle contains the specified circle.
         *
         * @param circle {R.math.Circle2D} A circle to compare against
         * @return {Boolean} <tt>true</tt> if the rectangle is fully contained within this rectangle.
         */
        containsCircle:function (circle) {
            return circle.isContained(this);
        },

        /**
         * Returns <tt>true</tt> if this circle contains the specified point.
         *
         * @param point {R.math.Point2D} The point to test
         * @return {Boolean} <tt>true</tt> if the point is within the circle
         */
        containsPoint:function (point) {
            var c1 = this.getCenter();
            var r = this.getRadius();
            return (c1.dist(point) <= r);
        },

        /**
         * Returns a printable version of this object.
         * @return {String} Formatted like "cX,cY r#"
         */
        toString:function () {
            return this.center.toString() + " r" + Number(this.radius).toFixed(2);
        }

    }, /** @scope R.math.Circle2D.prototype */{
        /**
         * Return the classname of the this object
         * @return {String} "R.math.Circle2D"
         */
        getClassName:function () {
            return "R.math.Circle2D";
        },

        /**
         * Approximate a circle from the given rectangle
         * @param rect {R.math.Rectangle2D} The rectangle to use
         * @return {R.math.Circle2D}
         */
        approximateFromRectangle:function (rect) {
            // Determine the center & radius
            var r = Math.max(rect.getHalfWidth(), rect.getHalfHeight()),
                c = rect.getCenter();
            return R.math.Circle2D.create(c.x, c.y, r);
        }

    });

};