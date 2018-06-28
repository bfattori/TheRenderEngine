/**
 * The Render Engine
 * AbstractSpatialContainer
 *
 * @fileoverview An abstract broad-phase collision model.
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
    "class":"R.collision.broadphase.AbstractCollisionModel",
    "requires":[
        "R.engine.BaseObject",
        "R.struct.Container"
    ]
});

/**
 * @class An abstract class to represent broad-phase collision models.  Broad-phase models
 *        contain game-world objects and can report on potential objects within a defined
 *        space of that container.
 *
 * @param name {String} The name of the model
 * @param width {Number} The total width of the model's space
 * @param height {Number} The total height of the model's space
 * @extends R.engine.BaseObject
 * @constructor
 * @description Abstract class for all broad-phase collision models
 */
R.collision.broadphase.AbstractCollisionModel = function () {
    "use strict";
    return R.engine.BaseObject.extend(/** @scope R.collision.broadphase.AbstractCollisionModel.prototype */{

        root:null,
        width:0,
        height:0,
        pcl:null,

        /** @private */
        constructor:function (name, width, height) {
            this.base(name || "BroadPhaseCollisionModel");
            this.width = width;
            this.height = height;
            this.pcl = R.struct.Container.create("PCL");
        },

        /**
         * Release the spatial container back into the pool for reuse
         */
        release:function () {
            this.base();
            this.root = null;
            this.width = 0;
            this.height = 0;
            this.pcl.destroy();
            this.pcl = null;
        },

        /**
         * Get the width of the model's world space.
         * @return {Number} The width
         */
        getWidth:function () {
            return this.width;
        },

        /**
         * Get the height of the model's world space.
         * @return {Number} The height
         */
        getHeight:function () {
            return this.height;
        },

        /**
         * Get the root object of the model.
         * @return {Object} The root
         */
        getRoot:function () {
            return this.root;
        },

        /**
         * Set the root object of the model.
         *
         * @param root {Object} The root object of this model
         */
        setRoot:function (root) {
            this.root = root;
        },

        /**
         * [ABSTRACT] Reset the collision model, removing any references to objects
         * from all collision nodes.
         */
        reset:function () {
        },

        /**
         * [ABSTRACT] Find the node that contains the specified point.
         *
         * @param point {R.math.Point2D} The point to locate the node for
         * @return {R.spatial.AbstractSpatialNode}
         */
        findNodePoint:function (point) {
            return null;
        },

        /**
         * Normalize a point to keep it within the boundaries of the collision model.
         * @param point {R.math.Point2D} The point
         * @return {R.math.Point2D} The normalized point
         */
        normalizePoint:function (point) {
            // Keep it within the boundaries
            var p = R.math.Point2D.create(point);
            p.x = p.x < 0 ? 0 : p.x > this.getWidth() ? this.getWidth() : p.x;
            p.y = p.y < 0 ? 0 : p.y > this.getHeight() ? this.getHeight() : p.y;
            return p;
        },

        /**
         * Add an object to the node which corresponds to the position of the object provided
         * provided.  Adding an object at a specific point will remove it from whatever
         * node it was last in.
         *
         * @param obj {R.engine.BaseObject} The object to add to the collision model
         * @param point {R.math.Point2D} The world position where the object is
         */
        addObject:function (obj, point) {
            var p = this.normalizePoint(point);

            // See if the object is already in a node and remove it
            var oldNode = this.getObjectSpatialData(obj, "lastNode");
            if (oldNode != null) {
                if (!oldNode.contains(p)) {
                    // The object is no longer in the same node
                    oldNode.removeObject(obj);
                } else {
                    // The object hasn't left the node
                    p.destroy();
                    return;
                }
            }

            // Find the node by position and add the object to it
            var node = this.findNodePoint(p);
            if (node != null) {
                node.addObject(obj);

                // Update the collision data on the object
                this.setObjectSpatialData(obj, "lastNode", node);
            }

            p.destroy();
        },

        /**
         * Remove an object from the collision model.
         *
         * @param obj {R.engine.BaseObject} The object to remove
         */
        removeObject:function (obj) {
            var oldNode = this.getObjectSpatialData(obj, "lastNode");
            if (oldNode != null) {
                oldNode.removeObject(obj);
            }
            this.clearObjectSpatialData(obj);
        },

        /**
         * Get the spatial data for the game object.  If <tt>key</tt> is provided, only the
         * data for <tt>key</tt> will be returned.  If the data has not yet been assigned,
         * an empty object will be created to contain the data.
         *
         * @param obj {R.engine.BaseObject} The object which has the data
         * @param [key] {String} Optional key which contains the data, or <tt>null</tt> for the
         *     entire data model.
         */
        getObjectSpatialData:function (obj, key) {
            var mData = obj.getObjectDataModel(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL);
            if (mData == null) {
                mData = obj.setObjectDataModel(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL, {});
            }
            return key ? mData[key] : mData;
        },

        /**
         * Set a key, within the game object's spatial data, to a specific value.  This allows a
         * collision system, or model, to store related information directly on a game object.
         * The data can be retrieved, as needed, from within the collision system or model.
         *
         * @param obj {R.engine.BaseObject} The object to receive the data
         * @param key {String} The key to set the data for
         * @param value {Object} The value to assign to the key
         */
        setObjectSpatialData:function (obj, key, value) {
            var mData = this.getObjectSpatialData(obj);
            mData[key] = value;
        },

        /**
         * Clear all of the spatial data on the given game object.
         *
         * @param obj {R.engine.BaseObject} The object which has the data model
         */
        clearObjectSpatialData:function (obj) {
            obj.setObjectDataModel(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL, null);
        },

        /**
         * Returns a potential collision list (PCL) of objects that are contained
         * within the defined sub-space of the container.
         *
         * @param object {R.objects.Object2D} The object
         * @return {R.struct.Container} A container of {@link R.collision.broadphase.SpatialGridNode} instances
         */
        getPCL:function (object) {
            return this.pcl;
        },

        /**
         * Returns all objects within the collision model.
         * @return {R.struct.Container} A container of all objects in the model
         */
        getObjects:function () {
            return R.struct.Container.create("allObjs");
        },

        /**
         * Returns all objects within the spatial container of a particular
         * class type.
         *
         * @param clazz {Object} A class type to restrict the collection to
         * @return {Array} An array of objects in the container, filtered by class
         */
        getObjectsOfType:function (clazz) {
            return this.getObjects().filter(function (obj) {
                return (obj instanceof clazz);
            }, this);
        },

        /**
         * Query the collision model using a testing function.  All objects in the
         * model will be passed through the function, and if the function returns
         * <code>true</code>, indicating it passed the test, it will be included
         * in the list.
         * @param testFn {Function} The testing function
         * @return {Array} An array of objects in the container which pass the test
         */
        query:function (testFn) {
            return this.getObjects().filter(testFn, this);
        },

        /**
         * Query the collision model for objects near a point.  Specify the point
         * and the radius from that point to test.  The test will be performed
         * against the position of the object being tested, not its boundaries.
         * @param point {R.math.Point2D}
         * @param radius {Number}
         * @return {Array} An array of objects in the container which satisfy the query
         */
        queryNear:function (point, radius) {
            return this.query(function (obj) {
                var pos = obj.getPosition();
                var distSqr = (point.x - pos.x) * (point.x - pos.x) +
                    (point.y - pos.y) * (point.y - pos.y);
                return (distSqr < radius);
            });
        },

        /**
         * Cast a ray through the collision model, looking for collisions along the
         * ray.  If a collision is found, a {@link R.struct.CollisionData} object
         * will be returned or <code>null</code> if otherwise.  If the object being
         * tested has a convex hull, that will be used to test for collision with
         * the ray.  Otherwise, its world box will be used.
         * <p/>
         * If a collision occurs, the value stored in {@link R.struct.CollisionData#shape1}
         * is the object which was collided with.  The value in {@link R.struct.CollisionData#impulseVector}
         * is the point at which the intersection was determined.
         *
         * @param fromPoint {R.math.Point2D} The origination of the ray
         * @param direction {R.math.Vector2D} A vector whose magnitude specifies the direction and
         *    length of the ray being cast.  The ray will be truncated at {@link #MAX_RAY_LENGTH}.
         * @param [testFn] {Function} A test function which will be executed when a collision occurs.  The
         *    argument to the function will be a {@link R.struct.CollisionData}.  Returning <code>true</code> will indicate
         *    that the raycast testing should stop, <code>false</code> to continue testing.
         * @return {R.struct.CollisionData} The collision info, or <code>null</code> if
         *    no collision would occur.
         */
        castRay:function (fromPoint, direction, testFn) {
            // Get all of the points along the line and test them against the
            // collision model.  At the first collision, we stop performing any more checks.
            var begin = R.math.Point2D.create(fromPoint), end = R.math.Point2D.create(fromPoint),
                dir = R.math.Vector2D.create(direction), line,
                pt = 0, test, node, itr, object, wt = R.Engine.worldTime, dt = R.Engine.lastTime,
                vec = R.math.Vector2D.create(direction).neg(), didIntersect = false;

            // Create the collision structure only once
            var collision = R.struct.CollisionData.create(0, vec, null, null, null, wt, dt);

            // Make sure the length isn't greater than the max
            if (dir.len() > R.collision.broadphase.AbstractCollisionModel.MAX_RAY_LENGTH) {
                dir.normalize().mul(R.collision.broadphase.AbstractCollisionModel.MAX_RAY_LENGTH);
            }

            // Use Bresenham's algorithm to calculate the points along the line
            end.add(dir);
            line = R.math.Math2D.bresenham(begin, end);

/*
            if (R.Engine.getDebugMode() && arguments[3]) {
                var start = R.math.Point2D.create(begin), finish = R.math.Point2D.create(end);

                arguments[3].postRender(function () {
                    this.setLineStyle("yellow");
                    this.setLineWidth(1);
                    this.drawLine(start, end);
                    start.destroy();
                    end.destroy();
                });
            }

*/

            while (!collision.shape1 && pt < line.length) {
                test = line[pt++];

                // If the point is outside our boundaries, we can move to the next point
                if (test.x < 0 || test.y < 0 || test.x > this.width || test.y > this.height) {
                    continue;
                }

                // Find the node for the current point
                node = this.findNodePoint(test);

                // Get all of the objects in the node
                for (itr = node.getObjects().iterator(); itr.hasNext();) {
                    object = itr.next();
                    didIntersect = null;

                    // If the object has a collision hull, we'll test against that
                    // otherwise we'll use its world box
                    if (object.getCollisionHull) {
                        var hull = object.getCollisionHull();

                        didIntersect = (hull.getType() == R.collision.ConvexHull.CONVEX_CIRCLE) ?
                          R.math.Math2D.pointInCircle(test, hull.getCenter(), hull.getRadius()) :
                          R.math.Math2D.pointInPoly(test, hull.getVertexes());


                        if (didIntersect) {
                            // If we find a collision, prep collision info
                            didIntersect.destroy();
                            collision.shape1 = object;
                            collision.impulseVector = R.math.Vector2D.create(test);

                            if (!testFn || testFn(collision.shape1)) {
                                // No test function, or the test returned true,
                                // return the collision
                                break;
                            } else {
                                // Move onto another test
                                collision.shape1 = null;
                                collision.impulseVector.destroy();
                            }
                        }
                    }
                }

                itr.destroy();
            }

            // Clean up
            begin.destroy();
            end.destroy();
            dir.destroy();
            vec.destroy();

            // Destroy the points in the line
            while (line.length > 0) {
                line.shift().destroy();
            }

            // Clean up the collision structure if there's no collisions
            if (collision.shape1 == null) {
                collision.destroy();
                collision = null;
            }

            return collision;
        }

    }, /** @scope R.collision.broadphase.AbstractCollisionModel.prototype */ {
        /**
         * Get the class name of this object
         *
         * @return {String} "R.collision.broadphase.AbstractCollisionModel"
         */
        getClassName:function () {
            return "R.collision.broadphase.AbstractCollisionModel";
        },

        /** @private */
        DATA_MODEL:"BroadPhaseCollisionData",

        /**
         * The maximum length of a cast ray (1000)
         * @type {Number}
         */
        MAX_RAY_LENGTH:1000
    });

};