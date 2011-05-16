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
	"class": "R.collision.broadphase.AbstractCollisionModel",
	"requires": [
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
R.collision.broadphase.AbstractCollisionModel = function(){
	return R.engine.BaseObject.extend(/** @scope R.collision.broadphase.AbstractCollisionModel.prototype */{
	
		root: null,
		width: 0,
		height: 0,
		pcl: null,
		
		/** @private */
		constructor: function(name, width, height){
			this.base(name || "BroadPhaseCollisionModel");
			this.width = width;
			this.height = height;
			this.pcl = R.struct.Container.create();
		},
		
		/**
		 * Release the spatial container back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.root = null;
			this.width = 0;
			this.height = 0;
			this.pcl = null;
		},
		
		/**
		 * Get the width of the model's world space.
		 * @return {Number} The width
		 */
		getWidth: function(){
			return this.width;
		},
		
		/**
		 * Get the height of the model's world space.
		 * @return {Number} The height
		 */
		getHeight: function(){
			return this.height;
		},
		
		/**
		 * Get the root object of the model.
		 * @return {Object} The root
		 */
		getRoot: function(){
			return this.root;
		},
		
		/**
		 * Set the root object of the model.
		 *
		 * @param root {Object} The root object of this model
		 */
		setRoot: function(root){
			this.root = root;
		},
		
		/**
		 * [ABSTRACT] Find the node that contains the specified point.
		 *
		 * @param point {R.math.Point2D} The point to locate the node for
		 * @return {R.spatial.AbstractSpatialNode}
		 */
		findNodePoint: function(point){
			return null;
		},

      /**
       * Normalize a point to keep it within the boundaries of the collision model.
       * @param point {R.math.Point2D} The point
       * @return {R.math.Point2D} The normalized point
       */
      normalizePoint: function(point) {
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
		addObject: function(obj, point){
         var p = this.normalizePoint(point);

			// See if the object is already in a node and remove it
			var oldNode = this.getObjectSpatialData(obj, "lastNode");
			if (oldNode != null) {
				if (!oldNode.contains(p)) {
					// The object is no longer in the same node
					oldNode.removeObject(obj);
				}
				else {
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
		 * Get the spatial data for the game object.  If <tt>key</tt> is provided, only the
		 * data for <tt>key</tt> will be returned.  If the data has not yet been assigned,
		 * an empty object will be created to contain the data.
		 *
		 * @param obj {R.engine.BaseObject} The object which has the data
		 * @param [key] {String} Optional key which contains the data, or <tt>null</tt> for the
		 * 	entire data model.
		 */
		getObjectSpatialData: function(obj, key){
			var mData = obj.getObjectDataModel(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL);
			if (mData == null) {
				obj.setObjectDataModel(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL, {});
				mData = obj.getObjectDataModel(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL);
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
		setObjectSpatialData: function(obj, key, value){
			var mData = this.getObjectSpatialData(obj);
			mData[key] = value;
		},
		
		/**
		 * Clear all of the spatial data on the given game object.
		 *
		 * @param obj {R.engine.BaseObject} The object which has the data model
		 */
		clearObjectSpatialData: function(obj){
			obj.setObjectDataMode(R.collision.broadphase.AbstractCollisionModel.DATA_MODEL, null);
		},
		
		/**
		 * Remove an object from the collision model.
		 *
		 * @param obj {R.engine.BaseObject} The object to remove
		 */
		removeObject: function(obj){
			var oldNode = this.getObjectSpatialData(obj, "lastNode");
			if (oldNode != null) {
				oldNode.removeObject(obj);
			}
			obj[R.collision.broadphase.AbstractCollisionModel.DATA_MODEL] = null;
		},
		
		/**
		 * Returns a potential collision list (PCL) of objects that are contained
		 * within the defined sub-space of the container.
		 *
	    * @param point {R.math.Point2D} The point to begin the search at.
		 * @return {R.struct.Container} An empty PCL
		 */
		getPCL: function(point){
			return this.pcl;
		},
		
		/**
		 * Returns all objects within the collision model.
		 * 
		 * @return {R.struct.Container} A container of all objects in the model
		 */
		getObjects: function(clazz){
			return R.struct.Container.create();
		},
		
		/**
		 * Returns all objects within the spatial container of a particular
		 * class type.
		 * 
		 * @param clazz {Object} A class type to restrict the collection to
		 * @return {Array} An array of objects in the container, filtered by class
		 */
		getObjectsOfType: function(clazz){
			return this.getObjects().filter(function(obj){
				return (obj instanceof clazz);
			}, this);
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
       * @param direction {R.math.Vector2D} A unit vector specifying the direction of the ray being cast
       * @return {R.struct.CollisionData} The collision info, or <code>null</code> if
       *    no collision would occur.
       */
      castRay: function(fromPoint, direction) {
         // Get all of the points along the line and test them against the
         // collision model.  At the first collision, we stop performing any more checks.
         var end = R.math.Point2D.create(fromPoint)
               .add(direction.mul(R.collision.broadphase.AbstractCollisionModel.MAX_RAY_LENGTH)),
            line = R.math.Math2D.bresenham(fromPoint, end), collision = null, pt = 0, test, node, itr, object,
            wt = R.Engine.worldTime, dt = R.Engine.lastTime, vec = R.math.Vector2D.create(direction).neg(),
            did = false;

         while (!collision && pt < line.length) {
            test = line[pt];

            // If the point is outside our boundaries, we can get out of here now
            if (test.x < 0 || test.y < 0 || test.x > this.width || test.y > this.height()) {
               break;
            }

            // Find the node for the current point
            node = this.findNodePoint(test);

            // Get all of the objects in the node
            for (itr = node.getObjects().iterator(); itr.hasNext(); ) {
               object = itr.next();

               // If the object has a convex hull, we'll test against that
               // otherwise we'll use its world box
               if (object.getConvexHull) {
                  var hull = object.getConvexHull();
                  if (hull.getType() == R.collision.ConvexHull.CONVEX_CIRCLE) {
                     // Point to circle hull test
                     var rad = hull.getRadius(), c = hull.getCenter();
                     var distSqr = (test.x - c.x) * (test.x - c.x) +
                                   (test.y - c.y) * (test.y - c.y);
                     if (distSqr < (rad * rad)) {
                        did = true;
                     }
                  } else {
                     // Point to polygon hull test
                     if (R.math.Math2D.pointInPoly(test, hull.getVertexes())) {
                        did = true;
                     }
                  }
               } else if (object.getWorldBox && object.getWorldBox().containsPoint(test)) {
                  did = true;
               }

               // Stop if we found a collision
               if (did) {
                  collision = R.struct.CollisionData.create(0, vec, object, null,
                                                            R.math.Point2D.create(test), wt, dt);
                  break;
               }
            }
         }

         // Destroy the points in the line
         while (line.length > 0) {
            line.shift().destroy();
         }

         return collision;
      }
		
	}, /** @scope R.collision.broadphase.AbstractCollisionModel.prototype */ {
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.collision.broadphase.AbstractCollisionModel"
		 */
		getClassName: function(){
			return "R.collision.broadphase.AbstractCollisionModel";
		},
		
		/** @private */
		DATA_MODEL: "BroadPhaseCollisionData",

      /**
       * The maximum length of a cast ray
       */
      MAX_RAY_LENGTH: 500
	});
	
};