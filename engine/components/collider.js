/**
 * The Render Engine
 * ColliderComponent
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Creates a collider component which tests the collision model for
 *              potential collisions. Each frame, the component will update a potential
 *              collision list (PCL) using the game objects current position
 *              obtained from {@link Object2D#getPosition}. Each object which meets
 *              certain criteria will be passed to an <tt>onCollide()</tt> method which
 *              must be implemented by the game object.  By design, an object cannot
 *              collide with itself.  However, this can be changed with the {@link #setCollideSame}
 *              method.
 *              <p/>
 *              The event handler will be passed the target object
 *              as its first argument, the time the collision was detected and the time
 *              since the last frame was generated as the second and third,
 *              finally the target's collision mask as the fourth argument.  Example:
 *              <pre>
 *                 onCollide: function(obj, time, dt, targetMask) {
 *                   if (targetMask == SomeObject.COLLISION_MASK) {
 *                      obj.explode();
 *                      return ColliderComponent.STOP;
 *                   }
 *
 *                   return ColliderComponent.CONTINUE;
 *                 }
 *              </pre>
 *              The game object must determine if the collision is valid for itself, and then
 *              return a value which indicates whether the component should contine to
 *              check for collisions, or if it should stop.
 *              <p/>
 *              If the <tt>onCollide()</tt> method is not implemented on the game object, no
 *              collision events will be passed to the game object.
 *              <p/>
 *              Additionally, a game object can implement <tt>onCollideEnd()</tt> to be notified
 *              when collisions have stopped.  The time the collisions stopped and the time since
 *              the last frame was generated will be the only arguments.
 *
 * @param name {String} Name of the component
 * @param collisionModel {AbstractCollisionModel} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends BaseComponent
 * @constructor
 * @description A collider component is responsible for handling potential collisions by
 *        updating the associated collision model and checking for possible collisions.
 */
class ColliderComponent extends BaseComponent {

  /**
   * When <tt>onCollide()</tt> is called on the host object, it should
   * return this value if there was no collision and the host
   * wishes to be notified about other potential collisions.
   * @type {Number}
   */
  static CONTINUE = 0;

  /**
   * When <tt>onCollide()</tt> is called on the host object, it should
   * return this if a collision occurred and no more collisions should be reported.
   * @type {Number}
   */
  static STOP = 1;

  /**
   * When <tt>onCollide()</tt> is called on the host object, it should
   * return this value if a collision occurred and the host wishes to be notified
   * about other potential collisions.
   * @type {Number}
   */
  static COLLIDE_AND_CONTINUE = 2;

  /**
   * For box and circle collider components, this will perform a simple
   * intersection test.
   * @type {Number}
   */
  static LOFI = 1;

  /**
   * For box and circle collider components, this will perform a more complex
   * test which will result in a {@link CollisionData} structure.
   * @type {Number}
   */
  static HIFI = 2;

  /**
   * @private
   */
  constructor(name, collisionModel, priority = 1.0) {
    super(name, BaseComponent.TYPE_COLLIDER, priority);
    this.colliderOpts = {
      collisionModel: collisionModel,
      collideSame: false,
      hasCollideMethods: [false, false],	// onCollide, onCollideEnd
      didCollide: false,
      testMode: ColliderComponent.LOFI,
      collisionData: null,
      physicalBody: null,
      collideObjectType: null
    };
  }

  /**
   * Destroy the component instance.
   */
  destroy() {
    if (this.colliderOpts.collisionData != null) {
      this.colliderOpts.collisionData.destroy();
    }
    // TODO: Should destroy() remove the object from the collision model??
    super.destroy();
  }

  release() {
    super.release();
    this.colliderOpts = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "ColliderComponent"
   */
  get className() {
    return "ColliderComponent";
  }

  /**
   * Establishes the link between this component and its game object.
   * When you assign components to a game object, it will call this method
   * so that each component can refer to its game object, the same way
   * a game object can refer to a component with {@link GameObject#getComponent}.
   *
   * @param gameObject {GameObject} The object which hosts this component
   */
  set gameObject(gameObject) {
    super.gameObject = gameObject;
    this.colliderOpts.collisionMask = 0x7FFFFFFF;
    this.colliderOpts.hasCollideMethods = [!!gameObject.onCollide, !!gameObject.onCollideEnd];
  }

  /**
   * Set the type of testing to perform when determining collisions.  You can specify
   * either {@link ColliderComponent#LOFI} or {@link ColliderComponent#HIFI}.
   *
   * @param mode {Number} The testing mode to use
   */
  set testMode(mode) {
    this.colliderOpts.testMode = mode;
  }

  /**
   * Determine the type of testing this component will perform. either {@link #LOFI}
   * or {@link #HIFI}
   * @return {Number}
   */
  get testMode() {
    return this.colliderOpts.testMode;
  }

  /**
   * Returns the collision data object, or <code>null</code>.
   * @return {CollisionData}
   */
  get collisionData() {
    return this.colliderOpts.collisionData;
  }

  /**
   * Set the collision data object
   * @param cData {CollisionData} The collision data, or <code>null</code> to clear it
   */
  set collisionData(cData) {
    this.colliderOpts.collisionData = cData;
  }

  /**
   * Get the collision model being used by this component.
   * @return {AbstractCollisionModel} The collision model
   */
  get collisionModel() {
    return this.colliderOpts.collisionModel;
  }

  /**
   * Set the collision model which the host object participates in.
   * @param collisionModel {AbstractCollisionModel} The collision model, or <tt>null</tt> for none
   */
  set collisionModel(collisionModel) {
    this.colliderOpts.collisionModel = collisionModel;
  }

  /**
   * Set whether or not an object can collide with an object with the same mask.  By default,
   * this is <tt>false</tt>.  If you have objects which should collide, and they have the
   * same mask, this should be set to <tt>true</tt>.
   * @param state {Boolean} <tt>true</tt> if an object can collide with objects with the same mask
   */
  set collideSame(state) {
    this.colliderOpts.collideSame = state;
  }

  /**
   * Returns <tt>true</tt> if an object can collide with an object with the same mask.
   * Default: <tt>false</tt>
   * @return {Boolean}
   */
  get collideSame() {
    return this.colliderOpts.collideSame;
  }

  /**
   * Returns a set of flags which can result in a collision between two objects.
   * The flags are bits within a 31-bit Integer that correspond to possible collisions.
   * @return {Number}
   */
  get collisionMask() {
    return this.colliderOpts.collisionModel ? this.colliderOpts.collisionModel.getObjectSpatialData(this.gameObject, "collisionMask") :
      0;
  }

  /**
   * Collision masks allow objects to be considered colliding or not depending on ANDing
   * the results.  The flags occupy the lowest 31 bits, so there can be a number of
   * combinations which result in a collision.
   *
   * @param collisionMask {Number} A 31-bit integer
   */
  set collisionMask(collisionMask) {
    if (this.colliderOpts.collisionModel) {
      this.colliderOpts.collisionModel.setObjectSpatialData(this.gameObject, "collisionMask", collisionMask);
    }
  }

  /**
   * Get the object type that this collider component will respond to.  If
   * the value is <tt>null</tt>, all objects are potential collision objects.
   * @return {BaseObject} The only object type to collide with, or <tt>null</tt> for any object
   * @deprecated see {@link #getCollisionFlags}
   */
  get objectType() {
    return this.colliderOpts.collideObjectType;
  }

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
  set objectType(objType) {
    this.colliderOpts.collideObjectType = objType;
  }

  /**
   * Link a rigid physical body to the collision component.  When using a physical body to represent
   * a component, it is oftentimes useful to use the body shape as the collision shape.
   * @param physicalBody {R.components.physics.BaseBody}
   */
  set linkedBody(physicalBody) {
    this.colliderOpts.physicalBody = physicalBody;
  }

  /**
   * Get the linked physical body.
   * @return {R.components.physics.BaseBody}
   */
  get linkedBody() {
    return this.colliderOpts.physicalBody;
  }

  /**
   * Update the collision model that this component was initialized with.
   * As objects move about the world, the objects will move to different
   * areas (or nodes) within the collision model.  It is necessary to
   * update this model frequently so collisions can be determined.
   */
  updateModel() {
    this.colliderOpts.collisionModel.addObject(this.gameObject, this.gameObject.position);
  }

  /**
   * Get the collision node the host object is within, or <tt>null</tt> if it
   * is not within a node.
   * @return {AbstractCollisionNode}
   */
  get spatialNode() {
    return this.colliderOpts.collisionModel.getObjectSpatialData(this.gameObject, "lastNode");
  }

  /**
   * Updates the object within the collision model and determines if
   * the game object should to be alerted whenever a potential collision
   * has occurred.  If a potential collision occurs, an array (referred to
   * as a Potential Collision List, or PCL) will be created which
   * contains objects that might be colliding with the game object.  It
   * is up to the game object to make the final determination that a
   * collision has occurred.  If no collisions have occurred, that will be reported
   * as well.
   * <p/>
   * Each object within the PCL will be tested and, if a collision occurs, is
   * passed to the <tt>onCollide()</tt> method (if declared) of the game object.
   * If a collision occurred and was handled, the <tt>onCollide()</tt> method should return
   * {@link CollisionComponent#STOP}, otherwise, it should return {@link CollisionComponent#CONTINUE} to continue
   * checking objects from the PCL against the game object.
   *
   * @param renderContext {AbstractRenderContext} The render context for the component
   * @param time {Number} The current engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(renderContext, time, dt) {
    if (!this.colliderOpts.collisionModel) {
      return;
    }

    // Update the collision model
    this.updateModel();

    // No reason to update collisions if the object hasn't changed
    if (!this.gameObject.dirty) {
      return;
    }

    // onCollide
    var pclNodes = null;
    if (this.colliderOpts.hasCollideMethods[0]) {
      // Get the host's collision mask once
      var hostMask = this.collisionModel.getObjectSpatialData(this.gameObject, "collisionMask");

      // Get the PCL and check for collisions
      pclNodes = this.collisionModel.getPCL(this.gameObject, time, dt);
      var status = ColliderComponent.CONTINUE;
      var collisionsReported = 0;

      pclNodes.forEach(function (node) {
        for (var itr = node.objects.iterator(); itr.hasNext();) {
          if (this._destroyed) {
            break;
          }

          var obj = itr.next(),
            targetMask = this.collisionModel.getObjectSpatialData(obj, "collisionMask");

          if (obj !== this.gameObject && // Cannot collide with itself
            (hostMask & targetMask) <= hostMask &&
            status == ColliderComponent.CONTINUE ||
            status == ColliderComponent.COLLIDE_AND_CONTINUE) {

            // Test for a collision
            status = this.testCollision(time, dt, obj, hostMask, targetMask);

            // If they don't return  any value, assume CONTINUE
            status = (status == undefined ? ColliderComponent.CONTINUE : status);

            // Count actual collisions
            collisionsReported += (status == ColliderComponent.STOP ||
            ColliderComponent.COLLIDE_AND_CONTINUE ? 1 : 0);
          }
        }
        itr.destroy();
      }, this);
      pclNodes.destroy();
    }

    // onCollideEnd
    if (!this._destroyed && this.colliderOpts.didCollide && collisionsReported == 0) {
      if (this.colliderOpts.hasCollideMethods[1]) {
        this.gameObject.onCollideEnd(time, dt);
      }
      this.colliderOpts.didCollide = false;
    }
  }

  /**
   * Call the game object's <tt>onCollide()</tt> method, passing the time of the collision,
   * the delta since the last time the world was updated,
   * the potential collision object, and the game object and target's masks.  The return value should
   * indicate if the collision tests should continue or stop.
   * <p/>
   *
   * For <tt>R.components.Collider</tt> the collision test is up to the game object to determine.
   *
   * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @param collisionObj {R.engine.GameObject} The game object with which the collision potentially occurs
   * @param hostMask {Number} The collision mask for the host object
   * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
   * @return {Number} A status indicating whether to continue checking, or to stop
   */
  testCollision(time, dt, collisionObj, hostMask, targetMask) {
    if (hostMask == targetMask && !this.colliderOpts.collideSame) {
      return ColliderComponent.CONTINUE;
    }

    var test = this.gameObject.onCollide(collisionObj, time, dt, targetMask);
    if (collisionObj.onCollide) {
      collisionObj.onCollide(this.gameObject, time, dt, targetMask);
    }

    this.didCollide |= (test == ColliderComponent.STOP || ColliderComponent.COLLIDE_AND_CONTINUE);
    return test;
  }

}


