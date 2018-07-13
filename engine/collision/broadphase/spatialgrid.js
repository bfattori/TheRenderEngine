/**
 * The Render Engine
 * SpatialGrid
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

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
 * @extends AbstractCollisionModel
 */
class SpatialGrid extends AbstractCollisionModel {

  constructor(width, height, divisions = 2) {
    super("SpatialGrid", width, height);

    // Divide the space up into a grid
    var gX = Math.floor(width / divisions);
    var gY = Math.floor(height / divisions);

    this.divisions = divisions;
    this.xLocator = 1 / gX;
    this.yLocator = 1 / gY;

    var grid = [];
    this.root = grid;

    for (var y = 0; y < this.divisions; y++) {
      for (var x = 0; x < this.divisions; x++) {
        var rect = Rectangle2D.create(x * gX, y * gY, gX, gY);
        grid[x + (y * this.divisions)] = new SpatialGridNode(rect);
      }
    }
  }

  destroy() {
    while (this.root.length > 0) {
      this.root.shift.destroy();
    }
    super.destroy();
  }

  /**
   * Releases the spatial grid back into the object pool.  See {@link PooledObject#release}
   * for more information.
   */
  release() {
    super.release();
    this.divisions = 2;
    this.xLocator = 1;
    this.yLocator = 1;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "SpatialGrid"
   */
  get className() {
    return "SpatialGrid";
  }

  addObject(obj, point) {
    var nodes = AbstractCollisionModel.getObjectSpatialData(obj, "nodes"),
      aabb = obj.getAABB();

    if (nodes && nodes.length > 0) {
      for (var nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
        nodes[nodeIdx].removeObject(obj);
      }
    }

    // Find the nodes which contain the world box
    var grid = this.root, addTo = [];
    for (var nodeIndex = 0; nodeIndex < grid.length; nodeIndex++) {
      var spatialNode = grid[nodeIndex];
      if (spatialNode.rect.isIntersecting(aabb)) {
        spatialNode.addObject(obj);
        addTo.push(spatialNode);
      }
    }

    AbstractCollisionModel.setObjectSpatialData(obj, "nodes", addTo);
  }

  /**
   * Remove an object from the collision model.
   *
   * @param obj {BaseObject} The object to remove
   */
  removeObject(obj) {
    var nodes = AbstractCollisionModel.getObjectSpatialData(obj, "nodes");
    if (nodes && nodes.length > 0) {
      for (var nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
        nodes[nodeIdx].removeObject(obj);
      }
    }
    AbstractCollisionModel.clearObjectSpatialData(obj);
  }

  /**
   * Find the node that contains the specified point.
   *
   * @param point {Point2D} The point to locate the node for
   * @return {SpatialGridNode}
   */
  findNodePoint(point) {
    return this.root[Math.floor(point.x * this.xLocator) + (Math.floor(point.y * this.yLocator) * this.divisions)];
  }

  /**
   * Get the normalized node Id for the root node of a PCL
   * @private
   */
  getNodeId(point) {
    return Math.floor(point.x * this.xLocator) + (Math.floor(point.y * this.yLocator) * this.divisions);
  }

  /**
   * Get a node within the grid.  The X and Y coordinates are node coordinates, and
   * not world coordinates.  For example, if a grid has 5 divisions, the cells are
   * numbered 0 through 4 on each axis.
   *
   * @param x {Number} The virtual X coordinate in our grid
   * @param y {Number} The virtual Y coordinate in our grid
   * @return {SpatialGridNode}
   */
  getNode(x, y) {
    // Normalize X and Y within the bounds of the grid
    x = x < 0 ? 0 : (x > this.divisions - 1 ? this.divisions - 1 : x);
    y = y < 0 ? 0 : (y > this.divisions - 1 ? this.divisions - 1 : y);
    return this.root[x + (y * this.divisions)];
  }

  /**
   * Get the number of divisions along the horizontal and vertical axis.  The
   * divisions are uniform for both axis, so the cells of the grid won't necessarily
   * be square.
   * @return {Number}
   */
  getDivisions() {
    return this.divisions;
  }

  /**
   * @private
   */
  checkNode(nodeList, x, y, id) {
    var node = this.getNode(x, y);
    if (node.dirty) {
      nodeList.push(node);
    }
  }

  /**
   * Get the list of collision nodes with respect to the given object.  Nodes which are
   * intersected by the AABB of the object will be contained in the PCL since only
   * objects within these nodes could potentially collide.
   *
   * @param object {R.objects.Object2D} The object
   * @return {R.struct.Container} A container of {@link SpatialGridNode} instances
   */
  getPCL(object) {
    var spatialNodes = AbstractCollisionModel.getObjectSpatialData(object, "nodes");
    if (spatialNodes.length == 0) {
      // Outside the grid, return the empty container
      return R.struct.Container.EMPTY;
    }

    var pcl = R.struct.Container.create("pcl");
    pcl.addAll(spatialNodes);

    return pcl;
  }

  /**
   * Returns all objects within every node of the spatial grid.
   * @return {R.struct.Container} A container with all objects in the spatial grid
   */
  getObjects() {
    var objs = super.getObjects();
    RenderEngine.Support.forEach(this.root, function (node) {
      objs.addAll(node.getObjects());
    });
    return objs;
  }

  update(renderContext, time, dt) {
    if (!R.Engine.getDebugMode()) {
      return;
    }

    renderContext.pushTransform();

    this.base(renderContext, time, dt);

    // Draw the grid and highlight cells which contain objects
    var vp = renderContext.getViewport(), xStep = vp.w / this.divisions, yStep = vp.h / this.divisions,
      pSt = Point2D.create(0, 0), pEn = Point2D.create(0, 0),
      rect = Rectangle2D.create(0, 0, 1, 1), x, y;

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
    for (var c = 0, len = this.root.length; c < len; c++) {
      var objs = this.root[c].getObjects();
      if (this.root[c].getCount() != 0) {
        x = (c % this.divisions) * xStep;
        y = Math.floor(c / this.divisions) * yStep;
        renderContext.setFillStyle("rgba(192,192,192,0.4)");
        renderContext.drawFilledRectangle(rect.set(x, y, xStep, yStep));
      }
    }

    renderContext.popTransform();
    rect.destroy();
  }

}
