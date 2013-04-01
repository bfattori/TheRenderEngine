/**
 * The Render Engine
 * Math2D
 *
 * @fileoverview A static 2D math library with several helper methods.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1570 $
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

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.math.Math2D",
    "requires":[
        "R.math.Rectangle2D",
        "R.math.Point2D",
        "R.math.Vector2D"
    ],

    "includes":[
        "/../engine/libs/sylvester.js"
    ]
});

/**
 * Bin object used by convex hull method.
 * @private
 */
var Bin = Base.extend({
    B:null,
    constructor:function (size) {
        this.B = [];
        for (var i = 0; i < size; i++) {
            this.B.push({
                min:0,
                max:0
            });
        }
    }
});

/**
 * @class A static class with methods and fields that are helpful
 * when dealing with two dimensional mathematics.
 *
 * @static
 */
R.math.Math2D = /** @scope R.math.Math2D.prototype */{

    /**
     * An approximation of PI (3.14159)
     * @type {Number}
     */
    PI:3.14159,

    /**
     * An approximation of PI*2 (6.28318)
     * @type {Number}
     */
    TWO_PI:6.28318,

    /**
     * An approximation of the inverse of PI (0.31831)
     * @type {Number}
     */
    INV_PI:0.31831,

    /**
     * Convert degrees to radians.
     * @param degrees {Number} An angle in degrees
     * @return {Number} The degrees value converted to radians
     */
    degToRad:function (degrees) {
        return (0.01745 * degrees);
    },

    /**
     * Convert radians to degrees.
     * @param radians {Number} An angle in radians
     * @return {Number} The radians value converted to degrees
     */
    radToDeg:function (radians) {
        return (radians * 180 / R.math.Math2D.PI);
    },

    /**
     * Perform AAB (axis-aligned box) to AAB collision testing, returning <tt>true</tt>
     * if the two boxes overlap.
     *
     * @param box1 {R.math.Rectangle2D} The collision box of object 1
     * @param box2 {R.math.Rectangle2D} The collision box of object 2
     * @return {Boolean} <tt>true</tt> if the rectangles overlap
     */
    boxBoxCollision:function (box1, box2) {
        return box1.isIntersecting(box2);
    },

    /**
     * Perform point to AAB collision, returning <code>true</code>
     * if a collision occurs.
     *
     * @param box {R.math.Rectangle2D} The collision box of the object
     * @param point {R.math.Point2D} The point to test, in world coordinates
     * @return {Boolean} <tt>true</tt> if the point is within the rectangle
     */
    boxPointCollision:function (box, point) {
        return box.containsPoint(point);
    },

    /**
     * Check to see if a line intersects another
     *
     * @param p1 {R.math.Point2D} Start of line 1
     * @param p2 {R.math.Point2D} End of line 1
     * @param p3 {R.math.Point2D} Start of line 2
     * @param p4 {R.math.Point2D} End of line 2
     * @return {Boolean} <tt>true</tt> if the lines intersect
     */
    lineLineCollision:function (p1, p2, p3, p4) {
        var d = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
        var n1 = ((p4.x - p3.x) * (p1.y - p3.y)) - ((p4.y - p3.y) * (p1.x - p3.x));
        var n2 = ((p2.x - p1.x) * (p1.y - p3.y)) - ((p2.y - p1.y) * (p1.x - p3.x));

        if (d == 0.0) {
            if (n1 == 0.0 && n2 == 0.0) {
                return false;  //COINCIDENT;
            }
            return false;   // PARALLEL;
        }
        var ua = n1 / d;
        var ub = n2 / d;

        return (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0);
    },

    /**
     * Test to see if a line intersects a Rectangle.
     *
     * @param p1 {R.math.Point2D} The start of the line
     * @param p2 {R.math.Point2D} The end of the line
     * @param rect {R.math.Rectangle} The box to test against
     * @return {Boolean} <tt>true</tt> if the line intersects the box
     */
    lineBoxCollision:function (p1, p2, rect) {
        // Convert the line to a box itself and do a quick box box test
        var lRect = R.math.Rectangle2D.create(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        var coll = R.math.Math2D.boxBoxCollision(lRect, rect);
        lRect.destroy();
        return coll;
    },

    /**
     * A static method used to calculate a direction vector
     * from a heading angle.
     *
     * @param origin {R.math.Point2D} The origin of the shape
     * @param baseVec {R.math.Vector2D} The base vector
     * @param angle {Number} The rotation in degrees
     * @param [vec] {R.math.Vector2D} <i>optional</i>. If provided, the result will be stored in
     *        this vector rather than creating a new one.
     * @return {R.math.Vector2D} The direction vector
     */
    getDirectionVector:function (origin, baseVec, angle, vec) {
        var r = R.math.Math2D.degToRad(angle);

        var x = Math.cos(r) * baseVec.x - Math.sin(r) * baseVec.y;
        var y = Math.sin(r) * baseVec.x + Math.cos(r) * baseVec.y;

        var v = (vec ? vec.set(x, y) : R.math.Vector2D.create(x, y));
        return v.sub(origin).normalize();
    },

    /**
     * Given a {@link R.math.Rectangle2D}, generate a random point within it.
     *
     * @param rect {R.math.Rectangle2D} The rectangle
     * @return {R.math.Point2D} A random point within the rectangle
     */
    randomPoint:function (rect) {
        var r = rect.get();
        return R.math.Point2D.create(Math.floor(r.x + R.lang.Math2.random() * r.w),
            Math.floor(r.y + R.lang.Math2.random() * r.h));
    },

    /**
     * Returns <tt>true</tt> if the <tt>point</tt> lies on the line defined by
     * <tt>anchor</tt> in the direction of the normalized <tt>vector</tt>.
     *
     * @param point {R.math.Point2D} The point to test
     * @param anchor {R.math.Point2D} The anchor of the line
     * @param vector {R.math.Vector2D} The normalized direction vector for the line
     * @return {Boolean}
     */
    isPointOnLine:function (point, anchor, vector) {
        var l = Line.create(anchor._vec, vector._vec);
        return l.contains(point._vec);
    },


    /**
     * Tests if a point is Left|On|Right of an infinite line defined by
     * two endpoints.
     *
     * @param endPoint0 {R.math.Point2D} A point on the line
     * @param endPoint1 {R.math.Point2D} A second point on the line
     * @param testPoint {R.math.Point2D} The point to test
     * @return {Number} &lt;0 (to left), 0 (on), &gt;0 (to right)
     */
    pointLeftOfLine:function (endPoint0, endPoint1, testPoint) {
        var p0 = endPoint0, p1 = endPoint1, p2 = testPoint;
        return (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y);
    },

    /**
     * Calculate an approximate 2D convex hull for the given array of points.
     * <p/>
     * Copyright 2001, softSurfer (www.softsurfer.com)
     * This code may be freely used and modified for any purpose
     * providing that this copyright notice is included with it.
     * SoftSurfer makes no warranty for this code, and cannot be held
     * liable for any real or imagined damage resulting from its use.
     * Users of this code must verify correctness for their application.
     *
     * @param pts {Array} An array of {@link R.math.Point2D} instances
     * @param k {Number} The approximation accuracy (larger = more accurate)
     * @return {Array} An array of {@link R.math.Point2D} which contains the
     *     approximate hull of the given points
     */
    convexHull:function (pts, k) {

        var points = [];
        for (var pz = 0; pz < pts.length; pz++) {
            points.push(R.math.Point2D.create(pts[pz]));
        }

        var NONE = -1;
        var minmin = 0, minmax = 0,
            maxmin = 0, maxmax = 0,
            xmin = points[0].x, xmax = points[0].x,
            cP, bot = 0, top = (-1), n = points.length, // indices for bottom and top of the stack
            hull = [];

        // Get the points with (1) min-max x-coord, and (2) min-max y-coord
        for (i = 1; i < n; i++) {
            cP = points[i];
            if (cP.x <= xmin) {
                if (cP.x < xmin) {        // new xmin
                    xmin = cP.x;
                    minmin = minmax = i;
                } else {                      // another xmin
                    if (cP.y < points[minmin].y)
                        minmin = i;
                    else if (cP.y > points[minmax].y)
                        minmax = i;
                }
            }

            if (cP.x >= xmax) {
                if (cP.x > xmax) {        // new xmax
                    xmax = cP.x;
                    maxmin = maxmax = i;
                } else {                      // another xmax
                    if (cP.y < points[maxmin].y)
                        maxmin = i;
                    else if (cP.y > points[maxmax].y)
                        maxmax = i;
                }
            }
        }

        if (xmin == xmax) {      // degenerate case: all x-coords == xmin
            hull[++top] = points[minmin];           // a point, or
            if (minmax != minmin)           // a nontrivial segment
                hull[++top] = points[minmax];
            return hull;                   // one or two points
        }

        // Next, get the max and min points in the k range bins
        var bin = new Bin(k + 2);   // first allocate the bins
        bin.B[0].min = minmin;
        bin.B[0].max = minmax;        // set bin 0
        bin.B[k + 1].min = maxmin;
        bin.B[k + 1].max = maxmax;      // set bin k+1
        for (var b = 1; b <= k; b++) { // initially nothing is in the other bins
            bin.B[b].min = bin.B[b].max = NONE;
        }

        for (var b, i = 0; i < n; i++) {
            var cPP = points[i];
            cP = cPP;
            if (cP.x == xmin || cP.x == xmax) // already have bins 0 and k+1
                continue;

            // check if a lower or upper point
            if (R.math.Math2D.pointLeftOfLine(points[minmin], points[maxmin], cPP) < 0) {  // below lower line
                b = Math.floor((k * (cP.x - xmin) / (xmax - xmin) ) + 1);  // bin #
                if (bin.B[b].min == NONE)       // no min point in this range
                    bin.B[b].min = i;           // first min
                else if (cP.y < points[bin.B[b].min].y)
                    bin.B[b].min = i;           // new min
                continue;
            }

            if (R.math.Math2D.pointLeftOfLine(points[minmax], points[maxmax], cPP) > 0) {  // above upper line
                b = Math.floor((k * (cP.x - xmin) / (xmax - xmin) ) + 1);  // bin #
                if (bin.B[b].max == NONE)       // no max point in this range
                    bin.B[b].max = i;           // first max
                else if (cP.y > points[bin.B[b].max].y)
                    bin.B[b].max = i;           // new max
                continue;
            }
        }

        // Now, use the chain algorithm to get the lower and upper hulls
        // the output array hull[] will be used as the stack
        // First, compute the lower hull on the stack hull[]
        for (var i = 0; i <= k + 1; ++i) {
            if (bin.B[i].min == NONE)  // no min point in this range
                continue;

            var cPP = points[bin.B[i].min];    // select the current min point
            cP = cPP;

            while (top > 0) {        // there are at least 2 points on the stack
                // test if current point is left of the line at the stack top
                if (R.math.Math2D.pointLeftOfLine(hull[top - 1], hull[top], cPP) > 0)
                    break;         // cP is a new hull vertex
                else
                    top--;         // pop top point off stack
            }
            hull[++top] = cPP;        // push current point onto stack
        }

        // Next, compute the upper hull on the stack H above the bottom hull
        if (maxmax != maxmin)      // if distinct xmax points
            hull[++top] = points[maxmax];  // push maxmax point onto stack

        bot = top;                 // the bottom point of the upper hull stack
        for (var i = k; i >= 0; --i) {
            if (bin.B[i].max == NONE)  // no max point in this range
                continue;

            var cPP = points[bin.B[i].max];   // select the current max point
            cP = cPP;

            while (top > bot) {      // at least 2 points on the upper stack
                // test if current point is left of the line at the stack top
                if (R.math.Math2D.pointLeftOfLine(hull[top - 1], hull[top], cPP) > 0)
                    break;         // current point is a new hull vertex
                else
                    top--;         // pop top point off stack
            }
            hull[++top] = cPP;        // push current point onto stack
        }
        //if (minmax != minmin)
        //	hull[++top] = points[minmin];  // push joining endpoint onto stack

        bin = null;                  // free bins before returning

        // See if the first and last points are identical.  This will cause a problem
        // if the hull is used for SAT collisions.
        if (hull[0].equals(hull[hull.length - 1])) {
            hull.pop();
        }

        points = null;
        return hull;              // # of points on the stack
    },

    /**
     * Determine the Minkowski Difference of two convex hulls.  Useful for
     * calculating collision response.
     *
     * @param hullA {Array} An array of {@link R.math.Point2D}
     * @param hullB {Array} An array of {@link R.math.Point2D}
     * @return {Array} An array of {@link R.math.Point2D} which are the Minkowski Difference of
     *     the two hulls.
     */
    minkDiff:function (hullA, hullB) {
        var cP = 0, minkDiff = new Array(hullA.length * hullB.length);
        for (var a in hullA) {
            for (var b in hullB) {
                var ha = hullA[a].get(), hb = hullB[b].get(),
                    pt = R.math.Point2D.create(hb.x - ha.x, hb.y - ha.y);
                minkDiff[cP++] = pt;
            }
        }
        return minkDiff;
    },

    /**
     * Helper method to determine if one circle will collide with another circle
     * based on its direction of movement.  The circle's centers should be in
     * world coordinates.
     *
     * @param circle {R.math.Circle2D} The first circle
     * @param velocity {R.math.Vector2D} The first circle's velocity vector
     * @param targetCircle {R.math.Circle2D} The second circle
     * @return {R.math.Vector2D} The vector which keeps the two circles from overlapping,
     *     or <tt>null</tt> if they cannot overlap.
     */
    circleCircleCollision:function (circle, velocity, targetCircle) {

        // Early out test
        var dist = targetCircle.getCenter().dist(circle.getCenter());
        var sumRad = targetCircle.getRadius() + circle.getRadius();
        dist -= sumRad;
        if (velocity.len() < dist) {
            // No collision possible
            return null;
        }

        var norm = R.math.Vector2D.create(velocity).normalize();

        // Find C, the vector from the center of the moving
        // circle A to the center of B
        var c = R.math.Vector2D.create(targetCircle.getCenter().sub(circle.getCenter()));
        var dot = norm.dot(c);

        // Another early escape: Make sure that A is moving
        // towards B! If the dot product between the movevec and
        // B.center - A.center is less that or equal to 0,
        // A isn't isn't moving towards B
        if (dot <= 0) {
            norm.destroy();
            c.destroy();
            return null;
        }

        var lenC = c.len();
        var f = (lenC * lenC) - (dot * dot);

        // Escape test: if the closest that A will get to B
        // is more than the sum of their radii, there's no
        // way they are going collide
        var sumRad2 = sumRad * sumRad;
        if (f >= sumRad2) {
            norm.destroy();
            c.destroy();
            return null;
        }

        // We now have F and sumRadii, two sides of a right triangle.
        // Use these to find the third side, sqrt(T)
        var t = sumRad2 - f;

        // If there is no such right triangle with sides length of
        // sumRadii and sqrt(f), T will probably be less than 0.
        // Better to check now than perform a square root of a
        // negative number.
        if (t < 0) {
            norm.destroy();
            c.destroy();
            return null;
        }

        // Therefore the distance the circle has to travel along
        // movevec is D - sqrt(T)
        var distance = dot - Math.sqrt(t);

        // Get the magnitude of the movement vector
        var mag = velocity.len();

        // Finally, make sure that the distance A has to move
        // to touch B is not greater than the magnitude of the
        // movement vector.
        if (mag < distance) {
            norm.destroy();
            c.destroy();
            return null;
        }

        // Set the length of the vector which causes the circles
        // to just touch
        var moveVec = R.math.Vector2D.create(norm.mul(distance));
        norm.destroy();
        c.destroy();

        return moveVec;
    },

    /**
     * Generate an array of points which represents a regular polygon
     * with N sides.
     * @param sides {Number} The number of sides in the polygon, must be more than 2.
     * @param [radius] {Number} The radius for the polygon.  Default: 100
     * @return {Array} an array of {@link R.math.Point2D}
     */
    regularPolygon:function (sides, radius) {
        Assert(sides > 2, "Math2D.regularPolygon() must be called with sides > 2");
        radius = radius || 100;
        var rot = R.math.Math2D.TWO_PI / sides;
        var angle, p;
        var points = [];
        for (var i = 0; i < sides; i++) {
            angle = (i * rot) + ((R.math.Math2D.PI - rot) * 0.5);
            p = R.math.Point2D.create(Math.cos(angle) * radius, Math.sin(angle) * radius);
            points.push(p);
        }
        return points;
    },

    /**
     * Get a point which represents the logical center of all of the
     * given points.
     * @param points {Array} An array of {@link R.math.Point2D}
     * @return {R.math.Point2D}
     */
    getCenterOfPoints:function (points) {
        var p = R.math.Point2D.create(0, 0);
        for (var pt = 0; pt < points.length; pt++) {
            p.add(points[pt]);
        }
        p.div(points.length);
        return p;
    },

    /**
     * Calculate the smallest bounding box which contains
     * the given set of points.
     * @param points {Array} An array of {@link R.math.Point2D}
     * @param [rect] {R.math.Rectangle2D} Optional rectangle to set to the bounding box
     * @return {R.math.Rectangle2D} The bounding box of the points
     */
    getBoundingBox:function (points, rect, transformed) {
        var x1 = points[0].x, x2 = points[0].x, y1 = points[0].y, y2 = points[0].y;
        rect = rect || R.math.Rectangle2D.create(0, 0, 1, 1);
        transformed = transformed || false;

        for (var p = 1; p < points.length; p++) {
            var pt = points[p];

            if (pt.x < x1) {
                x1 = pt.x;
            }
            if (pt.x > x2) {
                x2 = pt.x;
            }
            if (pt.y < y1) {
                y1 = pt.y;
            }
            if (pt.y > y2) {
                y2 = pt.y;
            }
        }

        var w, h;
        if (x1 < 0 && x2 >= 0) { w = x2 - x1; }
        else if (x1 < 0 && x2 < 0) { w = x1 + x2; }
        else { w = x2 - x1; }

        if (y1 < 0 && y2 >= 0) { h = y2 - y1; }
        else if (y1 < 0 && y2 < 0) { h = y1 + y2; }
        else { h = y2 - y1; }

        rect.set(transformed * x1, transformed * y1, w, h);
        return rect;
    },

    /**
     * Transform a point or an array of points by the given matrix.  This method
     * transforms the points by mutating them.
     * @param points {R.math.Point2D|Array} A single point or an array of {@link R.math.Point2D}
     * @param matrix {Matrix} The matrix to transform the points with
     */
    transformPoints:function (points, matrix) {
        if (R.isArray(points)) {
            for (var pt = 0; pt < points.length; pt++) {
                points[pt].transform(matrix);
            }
            return points;
        } else {
            return points.transform(matrix);
        }
    },

    /**
     * Returns an identity matrix
     * @return {Matrix}
     */
    identityMatrix:function () {
        return $M([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]);
    },

    /**
     * Returns a matrix which can be used to translate points by
     * the given vector.
     * @param vector {R.math.Vector2D} The translation vector
     * @return {Matrix}
     */
    translationMatrix:function (vector) {
        return $M([
            [1, 0, vector.x],
            [0, 1, vector.y],
            [0, 0, 1]
        ]);
    },

    /**
     * Returns a matrix which can be used to rotate points by
     * the given angle.
     * @param angle {Number} The rotation, in degrees
     * @param [origin] {R.math.Point2D} Optional origin to rotate around
     * @return {Matrix}
     */
    rotationMatrix:function (angle, origin) {
        var rMtx;
        if (!origin) {
            rMtx = Matrix.Rotation(R.math.Math2D.degToRad(angle), $V([0, 0, 1]));
        } else {
            // Move the origin
            rMtx = $M([
                [1, 0, origin.x],
                [0, 1, origin.y],
                [0, 0, 1]
            ]);
            // Rotate
            rMtx = rMtx.multiply(Matrix.Rotation(R.math.Math2D.degToRad(angle), $V([0, 0, 1])));
            // Move the origin back
            rMtx = rMtx.multiply($M([
                [1, 0, -origin.x],
                [0, 1, -origin.y],
                [0, 0, 1]
            ]));
        }
        return rMtx;
    },

    /**
     * Returns a matrix which can be used to scale points by
     * the given amounts.  Providing neither the scale along X nor Y will
     * return the identity matrix.
     * @param scaleX {Number} Scale along the X axis, <tt>null</tt> for 1.0
     * @param scaleY {Number} Scale along the Y axis, <tt>null</tt> to use the X scaling amount
     * @return {Matrix}
     */
    scalingMatrix:function (scaleX, scaleY) {
        scaleX = scaleX || 1.0;
        scaleY = scaleY || scaleX;
        return $M([
            [scaleX, 0, 0],
            [0, scaleY, 0],
            [0, 0, 1]
        ]);
    },

    /**
     * Calculates all of the points along a line using Bresenham's algorithm.
     * This method will return an array of points which need to be cleaned up
     * when done using them.
     *
     * @param start {R.math.Point2D} The starting point for the line
     * @param end {R.math.Point2D} The ending point for the line
     * @return {Array} An array of {@link R.math.Point2D}.  Be sure to
     *    destroy the points in the array when done using them.
     */
    bresenham:function (start, end) {
        function swap(pt) {
            pt.set(pt.y, pt.x);
        }

        var points = [], steep = Math.abs(end.y - start.y) > Math.abs(end.x - start.x), swapped = false;
        if (steep) {
            // Reflect the line
            swap(start);
            swap(end);
        }

        if (start.x > end.x) {
            // Make sure the line goes downward
            var t = start.x;
            start.x = end.x;
            end.x = t;
            t = start.y;
            start.y = end.y;
            end.y = t;
            swapped = true;
        }

        var deltax = end.x - start.x, // x slope
            deltay = Math.abs(end.y - start.y), // y slope, positive because the lines always go down
            error = deltax / 2, // error is used instead of tracking the y values
            ystep, y = start.y;

        ystep = (start.y < end.y ? 1 : -1);
        for (var x = start.x; x < end.x; x++) {   // for each point
            if (steep) {
                points.push(R.math.Point2D.create(y, x));  // if it's stepp, push flipped version
            } else {
                points.push(R.math.Point2D.create(x, y));  // push normal
            }
            error -= deltay;  // change the error
            if (error < 0) {
                y += ystep;    // if the error is too much, adjust the ystep
                error += deltax;
            }
        }

        if (swapped) {
            points.reverse();
        }

        return points;
    },

    /**
     * Determine if the given <code>point</code> is within the polygon defined by the array of
     * points in <code>poly</code>.
     *
     * @param point {R.math.Point2D} The point to test
     * @param poly {Array} An array of <code>R.math.Point2D</code>
     * @return {Boolean} <code>true</code> if the point is within the polygon
     */
    pointInPoly:function (point, poly) {
        var sides = poly.length, i = 0, j = sides - 1, oddNodes = false;
        for (i = 0; i < sides; i++) {
            if ((poly[i].y < point.y && poly[j].y >= point.y) ||
                (poly[j].y < point.y && poly[i].y >= point.y)) {

                if (poly[i].x + (point.y - poly[i].y) / (poly[j].y - poly[i].y) * (poly[j].x - poly[i].x) < point.x) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    },

    /**
     * Determine if the given <code>point</code> is within the circle defined by the
     * <code>center</code> and <code>radius</code>.
     * @param point {R.math.Point2D} The point to test
     * @param center {R.math.Point2D} The center of the circle
     * @param radius {Number} The radius of the circle
     * @return {Boolean} <code>true</code> if the point is within the circle
     */
    pointInCircle:function (point, center, radius) {
        // Point to circle hull test
        var distSqr = (point.x - center.x) * (point.x - center.x) +
            (point.y - center.y) * (point.y - center.y);
        return (distSqr < (radius * radius));
    }

};
