/**
 * The Render Engine
 * BoxColliderComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class An extension of the {@link ColliderComponent} which will check the
 *        object's axis-aligned bounding boxes for collision.
 *             <p/>
 *             By default, this component will perform a simple intersection test which results
 *             in a simple <code>true</code> or <code>false</code> test.  A more detailed test
 *             can be made by setting the component to perform a longest axis circle-to-circle collision
 *             test which will result in a collision data structure if a collision occurs.  Setting
 *             the testing mode is done by calling the {@link #setTestMode} method.
 *
 * @param name {String} Name of the component
 * @param collisionModel {AbstractCollisionModel} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends ColliderComponent
 * @constructor
 * @description Creates a collider component for box-box collision testing.  Each object
 *              must implement the {@link R.objects.Object2D#getWorldBox} method and return a
 *              world-oriented bounding box.
 */
class BoxCollider extends ColliderComponent {

  /**
   * Get the class name of this object
   * @return {String} "R.components.collision.Box"
   */
  get className() {
    return "BoxCollider";
  }


  /**
   * If a collision occurs, calls the host object's <tt>onCollide()</tt> method,
   * passing the time of the collision, the potential collision object, and the host
   * and target masks.  The return value should either tell the collision tests to continue or stop.
   *
   * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @param collisionObj {R.engine.GameObject} The game object with which the collision potentially occurs
   * @param objectMask {Number} The collision mask for the game object
   * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
   * @return {Number} A status indicating whether to continue checking, or to stop
   */
  testCollision(time, dt, collisionObj, objectMask, targetMask) {
    if (this.collisionData != null) {
      // Clean up old data first
      this.collisionData.destroy();
    }

    // Early out if no method(s)
    if (!this.hasMethods && !collisionObj.getWorldBox) {
      return R.components.Collider.CONTINUE;	// Can't perform test
    }

    // See if a collision will occur
    var linked = this.linkedBody,
      host = this.gameObject,
      box1 = null,
      box2 = collisionObj.worldBox;

    if (linked) {
      var invOrigin = Point2D.create(linked.localOrigin).neg();
      box1 = Rectangle2D.create(host.worldBox).offset(invOrigin);
      invOrigin.destroy();
    } else {
      box1 = host.worldBox;
    }

    if (this.testMode == ColliderComponent.LOFI) {
      if (box1.isIntersecting(box2)) {
        // Intersection test passed
        box1.destroy();
        box2.destroy();
        return super.testCollision(time, dt, collisionObj, objectMask, targetMask);
      }
    } else {
      // Separating circles method, using the
      // longest axis between width & height
      var tRad = Math.max(box1.halfWidth, box1.halfHeight) + Math.max(box2.halfWidth, box2.halfHeight),
        c1 = box1.center, c2 = box2.center;

      var distSqr = (c1.x - c2.x) * (c1.x - c2.x) +
        (c1.y - c2.y) * (c1.y - c2.y);

      if (distSqr < (tRad * tRad)) {
        // If we got here, there is a possible collision.  However, we still need to
        // compare based on the objects bounding boxes.  We will need to see if the bounding boxes
        // are indeed colliding.
        var diff = tRad - Math.sqrt(distSqr);

        // This normal is from the center points of each object, pointing back at the host
        var normalVector = Vector2D.create(c2.x - c1.x, c2.y - c1.y).normalize();
        var separationVector = Vector2D.create(normalVector).mul(diff);
        this.collisionData = CollisionData.create(
          separationVector.length,
          normalVector,
          host,
          collisionObj,
          separationVector,
          time,
          dt
        );

        return super.testCollision(time, dt, collisionObj, objectMask, targetMask);
      }
    }

    return ColliderComponent.CONTINUE;
  }

  execute(renderContext, time, dt) {
    super.execute(renderContext, time, dt);

    // Debug the collision box
    if (RenderEngine.debugMode && !this._destroyed) {
      var linked = this.linkedBody,
        origin = Point2D.create(linked ? linked.localOrigin : Point2D.ZERO),
        rect = Rectangle2D.create(this.gameObject.worldBox);

      rect.offset(origin.neg());

      renderContext.postRender(function () {
        this.lineStyle = "yellow";
        this.lineWidth = 1;
        this.drawRectangle(rect);
      });

      origin.destroy();
      rect.destroy();
    }
  }


}

