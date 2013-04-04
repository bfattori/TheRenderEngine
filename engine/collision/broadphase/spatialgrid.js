/**
 * The Render Engine
 * SpatialGrid
 *
 * @fileoverview A simple collision model which divides a finite space up into
 *               a coarse grid to assist in quickly finding objects within that
 *               space.
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
    "class":"R.collision.broadphase.SpatialGrid",
    "requires":[
        "R.collision.broadphase.AbstractCollisionModel",
        "R.collision.broadphase.SpatialGridNode",
        "R.math.Math2D",
        "R.math.Rectangle2D",
        "R.math.Point2D"
    ]
});

/**
 * @class A structure which divides a finite space up into a coarse grid to
 *        perform "broad phase" collision determinations within the space.
 *        After the PCL (potential collision list) is built, a "narrow phase"
 *        collision model would need to be employed to determine accurate collision
 *        response.  Using world box overlapping for simple true/false determinations is
 *        one method.  Another method would be to use something like SAT to determine
 *        by how much two objects' convex hulls are overlapped.
 *        <p/>
 *        A spatial grid is defined by the size of the space and the number of
 *        divisions within that space.  A smaller PCL will result from a larger
 *        number of divisions, but the amount of data required to store the cells
 *        also increases.  Also, larger numbers of divisions means that as objects
 *        move, the determination of which cell the object is within increases as
 *        well.
 *
 * @constructor
 * @description Create an instance of a spatial grid model
 * @param width {Number} The width of the area
 * @param height {Number} The height of the area
 * @param divisions {Number} The number of divisions along both axis
 * @extends R.spatial.AbstractSpatialContainer
 */
R.collision.broadphase.SpatialGrid = function () {
    "use strict";
    return R.collision.broadphase.AbstractCollisionModel.extend(/** @scope R.collision.broadphase.SpatialGrid.prototype */{

        divisions:1,

        xLocator:1,
        yLocator:1,

        /** @private */
        constructor:function (width, height, divisions) {
            this.base("SpatialGrid", width, height);

            // Divide the space up into a grid
            var gX = Math.floor(width / divisions);
            var gY = Math.floor(height / divisions);
            this.divisions = divisions;
            this.xLocator = 1 / gX;
            this.yLocator = 1 / gY;

            var grid = [];
            this.setRoot(grid);

            for (var y = 0; y < this.divisions; y++) {
                for (var x = 0; x < this.divisions; x++) {
                    var rect = R.math.Rectangle2D.create(x * gX, y * gY, gX, gY);
                    grid[x + (y * this.divisions)] = new R.collision.broadphase.SpatialGridNode(rect);
                }
            }
        },

        /**
         * Releases the spatial grid back into the object pool.  See {@link PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.divisions = 1;
            this.xLocator = 1;
            this.yLocator = 1;
            this.accuracy = 0;
        },

        addObject: function (obj, point) {
            var nodes = this.getObjectSpatialData(obj, "nodes"), aabb = obj.getAABB();
            if (nodes && nodes.length > 0) {
                for (var nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
                    nodes[nodeIdx].removeObject(obj);
                }
            }

            // Find the nodes which contain the world box
            var grid = this.getRoot(), addTo = [];
            for (var nodeIndex = 0; nodeIndex < grid.length; nodeIndex++) {
                var spatialNode = grid[nodeIndex], spatialRect = spatialNode.getRect();
                if (spatialRect.isIntersecting(aabb)) {
                    spatialNode.addObject(obj);
                    addTo.push(spatialNode);
                }
            }

            this.setObjectSpatialData(obj, "nodes", addTo);
        },

        /**
         * Remove an object from the collision model.
         *
         * @param obj {R.engine.BaseObject} The object to remove
         */
        removeObject:function (obj) {
            var nodes = this.getObjectSpatialData(obj, "nodes");
            if (nodes && nodes.length > 0) {
                for (var nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
                    nodes[nodeIdx].removeObject(obj);
                }
            }
            this.clearObjectSpatialData(obj);
        },

        /**
         * Find the node that contains the specified point.
         *
         * @param point {R.math.Point2D} The point to locate the node for
         * @return {R.spatial.SpatialGridNode}
         */
        findNodePoint:function (point) {
            return this.getRoot()[Math.floor(point.x * this.xLocator) + (Math.floor(point.y * this.yLocator) * this.divisions)];
        },

        /**
         * Get the normalized node Id for the root node of a PCL
         * @private
         */
        getNodeId:function (point) {
            return Math.floor(point.x * this.xLocator) + (Math.floor(point.y * this.yLocator) * this.divisions);
        },

        /**
         * Get a node within the grid.  The X and Y coordinates are node coordinates, and
         * not world coordinates.  For example, if a grid has 5 divisions, the cells are
         * numbered 0 through 4 on each axis.
         *
         * @param x {Number} The virtual X coordinate in our grid
         * @param y {Number} The virtual Y coordinate in our grid
         * @return {R.collision.broadphase.SpatialGridNode}
         */
        getNode:function (x, y) {
            // Normalize X and Y within the bounds of the grid
            x = x < 0 ? 0 : (x > this.divisions - 1 ? this.divisions - 1 : x);
            y = y < 0 ? 0 : (y > this.divisions - 1 ? this.divisions - 1 : y);
            return this.getRoot()[x + (y * this.divisions)];
        },

        /**
         * Get the number of divisions along the horizontal and vertical axis.  The
         * divisions are uniform for both axis, so the cells of the grid won't necessarily
         * be square.
         * @return {Number}
         */
        getDivisions:function () {
            return this.divisions;
        },

        /**
         * @private
         */
        checkNode:function (nodeList, x, y, id) {
            var node = this.getNode(x, y);
            if (node.isDirty()) {
                nodeList.push(node);
            }
        },

        /**
         * Get the list of collision nodes with respect to the given object.  Nodes which are
         * intersected by the AABB of the object will be contained in the PCL since only
         * objects within these nodes could potentially collide.
         *
         * @param object {R.objects.Object2D} The object
         * @return {R.struct.Container} A container of {@link R.collision.broadphase.SpatialGridNode} instances
         */
        getPCL:function (object) {
            var spatialNodes = this.getObjectSpatialData(object, "nodes");
            if (spatialNodes.length == 0) {
                // Outside the grid, return the empty container
                return R.struct.Container.EMPTY;
            }

            var pcl = R.struct.Container.create("pcl");
            pcl.addAll(spatialNodes);

            return pcl;
        },

        /**
         * Returns all objects within every node of the spatial grid.
         * @return {R.struct.Container} A container with all objects in the spatial grid
         */
        getObjects:function () {
            var objs = this.base();
            R.engine.Support.forEach(this.getRoot(), function (node) {
                objs.addAll(node.getObjects());
            });
            return objs;
        }

        /* pragma:DEBUG_START */

        ,update:function (renderContext, time, dt) {
            if (!R.Engine.getDebugMode()) {
                return;
            }

            renderContext.pushTransform();

            this.base(renderContext, time, dt);

            // Draw the grid and highlight cells which contain objects
            var vp = renderContext.getViewport(), xStep = vp.w / this.divisions, yStep = vp.h / this.divisions,
                pSt = R.math.Point2D.create(0, 0), pEn = R.math.Point2D.create(0, 0),
                rect = R.math.Rectangle2D.create(0, 0, 1, 1), x, y;

            // Grid
            for (x = 0, y = 0; x < vp.w;) {
                renderContext.setLineStyle("gray");
                renderContext.drawLine(pSt.set(x, 0), pEn.set(x, vp.h));
                renderContext.drawLine(pSt.set(0, y), pEn.set(vp.w, y));
                x += xStep;
                y += yStep;
            }
            pSt.destroy();
            pEn.destroy();

            // Occupied Cells
            for (var c = 0, len = this.getRoot().length; c < len; c++) {
                var objs = this.getRoot()[c].getObjects();
                if (this.getRoot()[c].getCount() != 0) {
                    x = (c % this.divisions) * xStep;
                    y = Math.floor(c / this.divisions) * yStep;
                    renderContext.setFillStyle("rgba(192,192,192,0.4)");
                    renderContext.drawFilledRectangle(rect.set(x, y, xStep, yStep));
                }
            }

            renderContext.popTransform();
        }
        /* pragma:DEBUG_END */

    }, /** @scope R.collision.broadphase.SpatialGrid.prototype */{
        /**
         * Get the class name of this object
         *
         * @return {String} "R.collision.broadphase.SpatialGrid"
         */
        getClassName:function () {
            return "R.collision.broadphase.SpatialGrid";
        }
    });

};