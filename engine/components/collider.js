/**
 * The Render Engine
 * ColliderComponent
 *
 * @fileoverview The base collision component.
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
   "class": "R.components.Collider",
   "requires": [
      "R.components.Base",
      "R.struct.CollisionData"
   ]
});

/**
 * @class Creates a collider component which tests the collision model for
 *              potential collisions. Each frame, the component will update a potential
 *              collision list (PCL) for the host object, using its current position
 *              obtained from {@link R.engine.Object2D#getPosition}. Each object which meets
 *              certain criteria will be passed to an <tt>onCollide()</tt> method which
 *              must be implemented by the host object.  By design, an object cannot
 *              collide with itself.
 *              <p/>
 *              The event handler will be passed the potential collision object
 *              as its first argument, the time the collision was detected as the second,
 *              and the target's collision mask as the third.
 *              The host must determine if the collision is valid for itself, and then
 *              return a value which indicates whether the component should contine to
 *              check for collisions, or if it should stop.
 *              <p/>
 *              If the <tt>onCollide()</tt> method is not implemented on the host, no
 *              collision events will be passed.
 *              <p/>
 *              Additionally, the host can implement <tt>onCollideEnd()</tt> to be notified
 *              when collisions have stopped.  The time the collisions stopped will be the
 *              only argument.
 *
 * @param name {String} Name of the component
 * @param collisionModel {SpatialCollection} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends R.components.Base
 * @constructor
 * @description A collider component is responsible for handling potential collisions by
 *        updating the associated collision model and checking for possible collisions.
 */
R.components.Collider = function() {
   return R.components.Base.extend(/** @scope R.components.Collider.prototype */{

      collisionModel: null,
      collideSame: false,
      hasCollideMethods: null,
      didCollide: false,
      testMode: null,
      cData: null,

      /**
       * @private
       */
      constructor: function(name, collisionModel, priority) {
         this.base(name, R.components.Base.TYPE_COLLIDER, priority || 1.0);
         this.collisionModel = collisionModel;
         this.collideSame = false;
         this.hasCollideMethods = [false,false];	// onCollide, onCollideEnd
         this.didCollide = false;
         this.testMode = R.components.Collider.SIMPLE_TEST;
         this.cData = null;
      },

      /**
       * Destroy the component instance.
       */
      destroy: function() {
         if (this.cData != null) {
            this.cData.destroy();
         }
         this.base();
      },

      /**
       * Deprecated in favor of {@link #setGameObject}.
       * @deprecated
       */
      setHostObject: function(hostObj) {
         this.setGameObject(hostObj);
      },

      /**
       * Establishes the link between this component and its game object.
       * When you assign components to a game object, it will call this method
       * so that each component can refer to its game object, the same way
       * a game object can refer to a component with {@link R.engine.GameObject#getComponent}.
       *
       * @param gameObject {R.engine.GameObject} The object which hosts this component
       */
      setGameObject: function(gameObject) {
         this.base(gameObject);
         this.setCollisionMask(0x7FFFFFFF);
         this.hasCollideMethods = [gameObject.onCollide != undefined, gameObject.onCollideEnd != undefined];
      },

      // TODO: Should destroy() remove the object from the collision model??

      /**
       * Releases the component back into the pool for reuse.  See {@link R.engine.PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.collisionModel = null;
         this.collideSame = false;
         this.hasCollideMethods = null;
         this.didCollide = false;
         this.testMode = null;
         this.cData = null;
      },

      /**
       * Set the type of testing to perform when determining collisions.  You can specify
       * either {@link R.components.Collider#SIMPLE_TEST} or {@link R.components.Collider#DETAILED_TEST}.
       *
       * @param mode {Number} The testing mode to use
       */
      setTestMode: function(mode) {
         this.testMode = mode;
      },

      /**
       * Determine the type of testing this component will perform. either {@link #SIMPLE_TEST}
       * or {@link #DETAILED_TEST}
       * @return {Number}
       */
      getTestMode: function() {
         return this.testMode;
      },

      /**
       * Returns the collision data object, or <code>null</code>.
       * @return {R.struct.CollisionData}
       */
      getCollisionData: function() {
         return this.cData;
      },

      /**
       * Set the collision data object
       * @param cData {R.struct.CollisionData} The collision data, or <code>null</code> to clear it
       */
      setCollisionData: function(cData) {
         this.cData = cData;
      },

      /**
       * Get the collision model being used by this component.
       * @return {R.collision.broadphase.AbstractCollisionModel} The collision model
       */
      getCollisionModel: function() {
         return this.collisionModel;
      },

      /**
       * Set the collision model which the host object participates in.
       * @param collisionModel {R.collision.broadphase.AbstractCollisionModel} The collision model, or <tt>null</tt> for none
       */
      setCollisionModel: function(collisionModel) {
         this.collisionModel = collisionModel;
      },

      /**
       * Set whether or not an object can collide with an object with the same mask.  By default,
       * this is <tt>false</tt>.  If you have objects which should collide, and they have the
       * same mask, this should be set to <tt>true</tt>.
       * @param state {Boolean} <tt>true</tt> if an object can collide with objects with the same mask
       */
      setCollideSame: function(state) {
         this.collideSame = state;
      },

      /**
       * Returns <tt>true</tt> if an object can collide with an object with the same mask.
       * Default: <tt>false</tt>
       * @return {Boolean}
       */
      getCollideSame: function() {
         return this.collideSame;
      },

      /**
       * Returns a set of flags which can result in a collision between two objects.
       * The flags are bits within a 31-bit Integer that correspond to possible collisions.
       * @return {Number}
       */
      getCollisionMask: function() {
         return this.collisionModel ? this.collisionModel.getObjectSpatialData(this.getGameObject(), "collisionMask") :
               0;
      },

      /**
       * Get the object type that this collider component will respond to.  If
       * the value is <tt>null</tt>, all objects are potential collision objects.
       * @return {BaseObject} The only object type to collide with, or <tt>null</tt> for any object
       * @deprecated see {@link #getCollisionFlags}
       */
      getObjectType: function() {
         return null;
      },

      /**
       * Collision masks allow objects to be considered colliding or not depending on ANDing
       * the results.  The flags occupy the lowest 31 bits, so there can be a number of
       * combinations which result in a collision.
       *
       * @param collisionMask {Number} A 31-bit integer
       */
      setCollisionMask: function(collisionMask) {
         if (this.collisionModel) {
            this.collisionModel.setObjectSpatialData(this.getGameObject(), "collisionMask", collisionMask);
         }
      },

      /**
       * Set the object type that this component will respond to.  Setting this to <tt>null</tt>
       * will trigger a potential collision when <i>any object</i> comes into possible contact
       * with the component's host based on the collision model.  If the object isn't of this type,
       * no collision tests will be performed.  This allows the developer to fine tune which
       * object the collision component is responsible for.  As such, multiple collision components
       * could be used to handle different types of collisions.
       *
       * @param objType {BaseObject} The object type to check for
       * @deprecated see {@link #setCollisionFlags}
       */
      setObjectType: function(objType) {
      },

      /**
       * Update the collision model that this component was initialized with.
       * As objects move about the world, the objects will move to different
       * areas (or nodes) within the collision model.  It is necessary to
       * update this model frequently so collisions can be determined.
       */
      updateModel: function() {
         var obj = this.getGameObject();
         this.getCollisionModel().addObject(obj, obj.getPosition());
      },

      /**
       * Get the collision node the host object is within, or <tt>null</tt> if it
       * is not within a node.
       * @return {R.spatial.AbstractSpatialNode}
       */
      getSpatialNode: function() {
         return this.collisionModel.getObjectSpatialData(this.getGameObject(), "lastNode");
      },

      /**
       * Updates the object within the collision model and determines if
       * the host object should to be alerted whenever a potential collision
       * has occurred.  If a potential collision occurs, an array (referred to
       * as a Potential Collision List, or PCL) will be created which
       * contains objects that might be colliding with the host object.  It
       * is up to the host object to make the final determination that a
       * collision has occurred.  If no collisions have occurred, that will be reported
       * as well.
       * <p/>
       * The list of objects within the PCL will be passed to the <tt>onCollide()</tt>
       * method (if declared) on the host object.  If a collision occurred and was
       * handled, the <tt>onCollide()</tt> method should return {@link CollisionComponent#STOP},
       * otherwise, it should return {@link CollisionComponent#CONTINUE} to continue
       * checking objects from the PCL against the host object.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context for the component
       * @param time {Number} The current engine time in milliseconds
       */
      execute: function(renderContext, time) {

         if (!this.collisionModel) {
            return;
         }

         var host = this.getGameObject();

         // Update the collision model
         this.updateModel();

         // If the host object needs to know about collisions...
         var pcl = null;

         // onCollide
         if (this.hasCollideMethods[0]) {
            // Get the host's collision mask once
            var hostMask = this.collisionModel.getObjectSpatialData(host, "collisionMask");

            // Get the PCL and check for collisions
            pcl = this.getCollisionModel().getPCL(host.getPosition(), time);
            var status = R.components.Collider.CONTINUE;
            var collisionsReported = 0;
            this.didCollide = false;

            pcl.forEach(function(obj) {
               var targetMask = this.collisionModel.getObjectSpatialData(obj, "collisionMask");
               if (obj !== this.getGameObject() && // Cannot collide with itself
                     (hostMask & targetMask) <= hostMask &&
                     status == R.components.Collider.CONTINUE ||
                     status == R.components.Collider.COLLIDE_AND_CONTINUE) {

                  // Test for a collision
                  status = this.testCollision(time, obj, hostMask, targetMask);

                  // If they don't return  any value, assume CONTINUE
                  status = (status == undefined ? R.components.Collider.CONTINUE : status);

                  // Count actual collisions
                  collisionsReported += (status == R.components.Collider.STOP ||
                        status == R.components.Collider.COLLIDE_AND_CONTINUE ? 1 : 0);
               }
            }, this);
         }

         // onCollideEnd
         if (!this.isDestroyed() && this.hasCollideMethods[1] &&
               this.didCollide && collisionsReported == 0) {
            host.onCollideEnd(time);
         }
      },

      /**
       * Call the host object's <tt>onCollide()</tt> method, passing the time of the collision,
       * the potential collision object, and the game object and target's masks.  The return value should
       * indicate if the collision tests should continue or stop.
       * <p/>
       *
       * For <tt>R.components.Collider</tt> the collision test is up to the game object to determine.
       *
       * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
       * @param collisionObj {R.engine.GameObject} The game object with which the collision potentially occurs
       * @param hostMask {Number} The collision mask for the host object
       * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
       * @return {Number} A status indicating whether to continue checking, or to stop
       */
      testCollision: function(time, collisionObj, hostMask, targetMask) {
         if (hostMask == targetMask && !this.collideSame) {
            return R.components.Collider.CONTINUE;
         }

         var test = this.getGameObject().onCollide(collisionObj, time, targetMask);
         this.didCollide |= (test == R.components.Collider.STOP || R.components.Collider.COLLIDE_AND_CONTINUE);
         return test;
      }

   }, /** @scope R.components.Collider.prototype */{ // Statics

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.Collider"
       */
      getClassName: function() {
         return "R.components.Collider";
      },

      /**
       * When <tt>onCollide()</tt> is called on the host object, it should
       * return this value if there was no collision and the host
       * wishes to be notified about other potential collisions.
       * @type {Number}
       */
      CONTINUE: 0,

      /**
       * When <tt>onCollide()</tt> is called on the host object, it should
       * return this if a collision occurred and no more collisions should be reported.
       * @type {Number}
       */
      STOP: 1,

      /**
       * When <tt>onCollide()</tt> is called on the host object, it should
       * return this value if a collision occurred and the host wishes to be notified
       * about other potential collisions.
       * @type {Number}
       */
      COLLIDE_AND_CONTINUE: 2,

      /**
       * For box and circle collider components, this will perform a simple
       * intersection test.
       * @type {Number}
       */
      SIMPLE_TEST: 1,

      /**
       * For box and circle collider components, this will perform a more complex
       * test which will result in a {@link R.struct.CollisionData} structure.
       * @type {Number}
       */
      DETAILED_TEST: 2

   });
};