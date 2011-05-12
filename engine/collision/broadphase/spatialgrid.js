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
   "class": "R.collision.broadphase.SpatialGrid",
   "requires": [
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
 *        response.  Using AABB overlapping for simple true/false determinations is
 *        one method.  Another method would be to use something like GJK to determine
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
R.collision.broadphase.SpatialGrid = function() {
   return R.collision.broadphase.AbstractCollisionModel.extend(/** @scope R.collision.broadphase.SpatialGrid.prototype */{

      divisions: 1,

      xLocator: 1,
      yLocator: 1,

      accuracy: 0,
      pclCache: null,

      /** @private */
      constructor: function(width, height, divisions) {
         this.base("SpatialGrid", width, height);

         // Divide the space up into a grid
         var gX = Math.floor(width / divisions);
         var gY = Math.floor(height / divisions);
         this.divisions = divisions;
         this.xLocator = 1 / gX;
         this.yLocator = 1 / gY;
         this.accuracy = R.collision.broadphase.SpatialGrid.HIGH_ACCURACY;

         var grid = [];
         this.setRoot(grid);

         for (var y = 0; y < this.divisions; y++) {
            for (var x = 0; x < this.divisions; x++) {
               var rect = R.math.Rectangle2D.create(x * gX, y * gY, gX, gY);
               grid[x + (y * this.divisions)] = new R.collision.broadphase.SpatialGridNode(rect);
            }
         }

         this.pclCache = {};
      },

      // Debug the collision node
      /*
       if (!this.isDestroyed() && R.Engine.getDebugMode() && this.getComponent("collider").getSpatialNode())
       {
       renderContext.setLineStyle("orange");
       renderContext.drawRectangle(this.getComponent("collider").getSpatialNode().getRect());
       }
       */


      /**
       * Releases the spatial grid back into the object pool.  See {@link PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.divisions = 1;
         this.xLocator = 1;
         this.yLocator = 1;
         this.accuracy = 0;
      },

      /**
       * Set the accuracy of the collision checks to either {@link #GOOD_ACCURACY},
       * {@link #BETTER_ACCURACY}, or {@link #HIGH_ACCURACY}.  See {@link #getPCL} for
       * an explanation of the levels of accuracy.
       *
       * @param accuracy {Number} The level of accuracy during PCL generation
       */
      setAccuracy: function(accuracy) {
         this.accuracy = (accuracy > R.collision.broadphase.SpatialGrid.BETTER_ACCURACY ||
               accuracy < R.collision.broadphase.SpatialGrid.GOOD_ACCURACY) ?
               R.collision.broadphase.SpatialGrid.BETTER_ACCURACY : accuracy;
      },

      /**
       * Get the accuracy level of collision checks.
       * @return {Number} The accuracy level
       */
      getAccuracy: function() {
         return this.accuracy;
      },

      /**
       * Find the node that contains the specified point.
       *
       * @param point {R.math.Point2D} The point to locate the node for
       * @return {R.spatial.SpatialGridNode}
       */
      findNodePoint: function(point) {
         return this.getRoot()[Math.floor(point.x * this.xLocator) + (Math.floor(point.y * this.yLocator) * this.divisions)];
      },

      /**
       * Get the normalized node Id for the root node of a PCL
       * @private
       */
      getNodeId: function(point) {
         return Math.floor(point.x * this.xLocator) + (Math.floor(point.y * this.yLocator) * this.divisions);
      },

      /**
       * Get the node within the grid.
       * @param x {Number} The virtual X coordinate in our grid
       * @param y {Number} The virtual Y coordinate in our grid
       * @return {Number}
       * @private
       */
      getNode: function(x, y) {
         // Normalize X and Y within the bounds of the grid
         x = x < 0 ? 0 : (x > this.divisions - 1 ? this.divisions - 1 : x);
         y = y < 0 ? 0 : (y > this.divisions - 1 ? this.divisions - 1 : y);
         return this.getRoot()[x + (y * this.divisions)];
      },

      /**
       * @private
       */
      checkNode: function(nodeList, x, y, id) {
         var node = this.getNode(x, y);
         if (node.getCount() != 0 && node.isDirty()) {
            nodeList.push(node);
         }
      },

      /**
       * Get the list of objects with respect to the point given.  Objects will
       * be returned from the nodes that make up the grid node containing
       * the point, and the following adjacent nodes:
       * <ul>
       * <li><b>Good Accuracy</b> - Just the node containing the point (G)</li>
       * <li><b>Better Accuracy</b> - The four polar nodes around the center (G, B)</li>
       * <li><b>High Accuracy</b> - The eight nodes around the center (G, B, H)</li>
       * </ul>
       * For example, if you had a 3x3 grid with the object in the center node, the nodes
       * marked below would be included in the result set:
       * <pre>
       *  +---+---+---+
       *  | H | B | H |
       *  +---+---+---+
       *  | B | G | B |
       *  +---+---+---+
       *  | H | B | H |
       *  +---+---+---+
       * </pre>
       *
       * @param point {R.math.Point2D} The point to begin the search at.
       * @return {R.struct.Container} A container of objects found that could be collision targets
       */
      getPCL: function(point) {
         var p = this.normalizePoint(point);

         // Get the root node
         var x = Math.floor(p.x * this.xLocator);
         var y = Math.floor(p.y * this.yLocator);

         // Iff the object is inside the grid
         if (x >= 0 && x <= this.divisions - 1 &&
               y >= 0 && y <= this.divisions - 1) {

            // Create cache nodes for each normalized point in the grid
            var id = this.getNodeId(p);
            if (this.pclCache[id] == null) {
               this.pclCache[id] = R.struct.Container.create();
            }

            var cachedPCL = this.pclCache[id];

            // Build the node set
            var nodes = [], n;

            // Start with GOOD_ACCURACY
            this.checkNode(nodes, x, y, id);

            // if our borders cross the margin, we can drop up to two nodes
            if (this.accuracy >= R.collision.broadphase.SpatialGrid.BETTER_ACCURACY) {
               // -- Polar nodes
               if (x > 0 && x < this.divisions - 1 && y > 0 && y < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y, id);
                  this.checkNode(nodes, x + 1, y, id);
                  this.checkNode(nodes, x, y - 1, id);
                  this.checkNode(nodes, x, y + 1, id);
               } else if (x == 0 && y > 0 && y < this.divisions - 1) {
                  this.checkNode(nodes, x + 1, y, id);
                  this.checkNode(nodes, x, y - 1, id);
                  this.checkNode(nodes, x, y + 1, id);
               } else if (x == this.divisions - 1 && y > 0 && y < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y, id);
                  this.checkNode(nodes, x, y - 1, id);
                  this.checkNode(nodes, x, y + 1, id);
               } else if (y == 0 && x > 0 && x < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y, id);
                  this.checkNode(nodes, x + 1, y, id);
                  this.checkNode(nodes, x, y + 1, id);
               } else if (y == this.divisions - 1 && x > 0 && x < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y, id);
                  this.checkNode(nodes, x + 1, y, id);
                  this.checkNode(nodes, x, y - 1, id);
               } else if (x == 0 && y == 0) {
                  this.checkNode(nodes, x + 1, y, id);
                  this.checkNode(nodes, x, y + 1, id);
               } else if (x == this.divisions - 1 && y == 0) {
                  this.checkNode(nodes, x - 1, y, id);
                  this.checkNode(nodes, x, y + 1, id);
               } else if (x == 0 && y == this.divisions - 1) {
                  this.checkNode(nodes, x + 1, y, id);
                  this.checkNode(nodes, x, y - 1, id);
               } else if (x == this.divisions - 1 && y == this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y, id);
                  this.checkNode(nodes, x, y - 1, id);
               }
            }

            // For highest number of checks, we'll include all eight surrounding nodes
            if (this.accuracy == R.collision.broadphase.SpatialGrid.HIGH_ACCURACY) {
               // -- Corner nodes
               if (x > 0 && x < this.divisions - 1 && y > 0 && y < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y - 1, id);
                  this.checkNode(nodes, x + 1, y + 1, id);
                  this.checkNode(nodes, x - 1, y + 1, id);
                  this.checkNode(nodes, x + 1, y - 1, id);
               } else if (x == 0 && y > 0 && y < this.divisions - 1) {
                  this.checkNode(nodes, x + 1, y + 1, id);
                  this.checkNode(nodes, x + 1, y - 1, id);
               } else if (x == this.divisions - 1 && y > 0 && y < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y + 1, id);
                  this.checkNode(nodes, x - 1, y - 1, id);
               } else if (y == 0 && x > 0 && x < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y + 1, id);
                  this.checkNode(nodes, x + 1, y + 1, id);
               } else if (y == this.divisions - 1 && x > 0 && x < this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y - 1, id);
                  this.checkNode(nodes, x + 1, y - 1, id);
               } else if (x == 0 && y == 0) {
                  this.checkNode(nodes, x + 1, y + 1, id);
               } else if (x == this.divisions - 1 && y == 0) {
                  this.checkNode(nodes, x - 1, y + 1, id);
               } else if (x == 0 && y == this.divisions - 1) {
                  this.checkNode(nodes, x + 1, y - 1, id);
               } else if (x == this.divisions - 1 && y == this.divisions - 1) {
                  this.checkNode(nodes, x - 1, y - 1, id);
               }
            }

            // If there are any nodes which changed, update the PCL cache
            if (nodes.length != 0) {
               R.Engine.pclRebuilds++;

               cachedPCL.clear();
               for (var d = 0; d < nodes.length; d++) {
                  nodes[d].clearDirty();
                  cachedPCL.append(nodes[d].getObjects());
               }
            }/* else {
               cachedPCL.clear();
            }*/

            return cachedPCL;
         }

         p.destroy();

         // Outside the grid, return the empty container
         return R.struct.Container.EMPTY;
      },

      /**
       * Returns all objects within every node of the spatial grid.
       * @return {R.struct.Container} A container with all objects in the spatial grid
       */
      getObjects: function() {
         var objs = this.base();
         R.engine.Support.forEach(this.getRoot(), function(node) {
            objs.addAll(node.getObjects());
         });
         return objs;
      }

      /* pragma:DEBUG_START */
      ,update: function(renderContext, time, dt) {
         if (!R.Engine.getDebugMode()) {
            return;
         }
         
         renderContext.pushTransform();

         this.base(renderContext, time, dt);

         // Draw the grid and highlight cells which contain objects
         var vp = renderContext.getViewport(), xStep = vp.w / this.divisions, yStep = vp.h / this.divisions,
               pSt = R.math.Point2D.create(0,0), pEn = R.math.Point2D.create(0,0),
               rect = R.math.Rectangle2D.create(0,0,1,1), x, y;

         // Grid
         for (x = 0, y = 0; x < vp.w; ) {
            renderContext.setLineStyle("gray");
            renderContext.drawLine(pSt.set(x, 0), pEn.set(x, vp.h));
            renderContext.drawLine(pSt.set(0, y), pEn.set(vp.w, y));
            x += xStep; y += yStep;
         }
         pSt.destroy();
         pEn.destroy();

         // Occupied Cells
         for (var c = 0, len = this.getRoot().length; c < len; c++) {
            if (this.getRoot()[c].getCount() != 0) {
               x = (c % this.divisions) * xStep;
               y = Math.floor(c / this.divisions) * yStep;
               renderContext.setLineStyle("silver");
               renderContext.drawRectangle(rect.set(x, y, xStep, yStep));
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
      getClassName: function() {
         return "R.collision.broadphase.SpatialGrid";
      },

      /**
       * Collision checks are limited to the exact node where the
       * object being tested resides.
       * @type {Number}
       */
      GOOD_ACCURACY: 0,

      /**
       * Collision checks are performed in the node where the object
       * being tested resides, and in the four surrounding polar nodes.
       * @type {Number}
       * @deprecated
       */
      BEST_ACCURACY: 1,

      /**
       * Collision checks are performed in the node where the object
       * being tested resides, and in the four surrounding polar nodes.
       * @type {Number}
       */
      BETTER_ACCURACY: 1,

      /**
       * Collision checks are performed in the node where the object
       * being tested resides, and in the eight surrounding nodes.
       * @type {Number}
       */
      HIGH_ACCURACY: 2
   });

};