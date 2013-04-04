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

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.collision.ConvexHull",
    "requires":[
        "R.engine.PooledObject",
        "R.math.Rectangle2D",
        "R.math.Point2D",
        "R.math.Vector2D",
        "R.math.Math2D"
    ]
});

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
R.collision.ConvexHull = function () {
    "use strict";
    return R.engine.PooledObject.extend(/** @scope R.collision.ConvexHull.prototype */{

        oCenter:null,
        oVerts:null,
        uVerts:null,
        center:null,
        vertexes:null,
        hostObj:null,

        radius:-1,

        /** @private */
        constructor:function (points, lod) {
            this.base("ConvexHull");
            lod = lod || 4;

            // Calculate the center and radius based on the given points
            var cX = 0, cY = 0;
            var x1 = R.lang.Math2.MAX_INT, x2 = -R.lang.Math2.MAX_INT;
            var y1 = x1, y2 = x2;
            for (var p = 0; p < points.length; p++) {
                cX += points[p].x;
                cY += points[p].y;
            }
            this.center = R.math.Point2D.create(cX / points.length, cY / points.length);
            this.oCenter = R.math.Point2D.create(this.center);

            // Back through the points again to find the point farthest from the center
            // to create our smallest radius which encloses our shape
            var dist = -1;
            var rVec = R.math.Vector2D.create(0, 0);
            var d = R.math.Vector2D.create(0, 0);
            for (p = 0; p < points.length; p++) {
                d.set(points[p]);
                d.sub(this.center);
                if (d.len() > dist) {
                    dist = d.len();
                    rVec.set(d);
                }
            }
            d.destroy();
            this.radius = rVec.len();
            rVec.destroy();

            // Create the simplified hull
            this.vertexes = R.math.Math2D.convexHull(points, lod);
            this.oVerts = [];
            this.uVerts = [];
            for (p in this.vertexes) {
                this.oVerts.push(R.math.Vector2D.create(this.vertexes[p]));
                this.uVerts.push(R.math.Vector2D.create(this.vertexes[p]).sub(this.center));
            }
        },

        /**
         * Destroy the object
         */
        destroy:function () {
            // Destroy the center
            this.oCenter.destroy();
            this.center.destroy();

            // Destroy the verts
            for (var v in this.vertexes) {
                this.vertexes[v].destroy();
                this.oVerts[v].destroy();
                this.uVerts[v].destroy();
            }

            this.base();
        },

        /**
         * Return the object to the pool
         */
        release:function () {
            this.base();

            // Free the matrices
            this.txfm = null;

            // Free the verts and center
            this.hostObj = null;
            this.center = null;
            this.oCenter = null;
            this.vertexes = null;
            this.oVerts = null;
            this.uVerts = null;
        },

        /**
         * Set the object which is using this collision hull.
         *
         * @param hostObj {R.objects.Object2D} The object which is using the hull
         */
        setGameObject:function (gameObject) {
            this.hostObj = gameObject;
        },

        /**
         * Deprecated in favor of {@link #getGameObject}.
         * @deprecated
         */
        getHostObject:function () {
            return this.getGameObject();
        },

        /**
         * Get the object which is using this collision hull.
         * @return {R.objects.Object2D}
         */
        getGameObject:function () {
            return this.hostObj;
        },

        /**
         * Get the point at the center of the convex hull
         * @return {R.math.Point2D}
         */
        getCenter:function () {
            var txfm = this.hostObj.getTransformationMatrix();

            // Transform the center of the hull
            this.center.set(this.oCenter);
            this.center.transform(txfm);
            return this.center;
        },

        /**
         * Get the radius (distance to farthest point in shape, from center)
         * @return {Number}
         */
        getRadius:function () {
            return this.radius;
        },

        /**
         * Get the array of vertexes in the convex hull
         * @return {Array} of {@link R.math.Point2D}
         */
        getVertexes:function () {
            var txfm = this.hostObj.getTransformationMatrix();

            // Transform the vertexes
            for (var p = 0; p < this.vertexes.length; p++) {
                this.vertexes[p].set(this.oVerts[p]);
                this.vertexes[p].transform(txfm);
            }
            return this.vertexes;
        },

        /**
         * Get the array of untransformed vertexes in the convex hull
         * @return {Array} of {@link R.math.Point2D}
         */
        getUntransformedVertexes:function () {
            return this.uVerts;
        },

        /**
         * Return the type of convex hull this represents.
         * @return {Number} {@link #CONVEX_NGON}
         */
        getType:function () {
            return R.collision.ConvexHull.CONVEX_NGON;
        }

    }, /** @scope R.collision.ConvexHull.prototype */{

        /**
         * Get the class name of this object
         * @return {String} "R.collision.ConvexHull"
         */
        getClassName:function () {
            return "R.collision.ConvexHull";
        },

        /**
         * An N-gon convex hull shape (3 or more vertexes)
         * @type {Number}
         */
        CONVEX_NGON:1,

        /**
         * A circular convex hull shape (center and radius)
         * @type {Number}
         */
        CONVEX_CIRCLE:2
    });

};