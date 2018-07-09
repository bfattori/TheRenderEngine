/**
 * The Render Engine
 * CircleColliderComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class An extension of the {@link ColliderComponent} which will check if the
 *        object's are colliding based on their world bounding circles.  If either of the
 *          objects does not have the {@link R.objects.Object2D#getWorldCircle} method
 *          the test will result in no collision.
 *          <p/>
 *          By default, this component will perform a simple intersection test which results
 *          in a simple <code>true</code> or <code>false</code> test.  A more detailed test
 *          can be made by setting the component to perform a circle-to-circle collision test which
 *          will result in a collision data structure if a collision occurs.  Setting the testing
 *          mode is done by calling the {@link #setTestMode} method.
 *
 * @param name {String} Name of the component
 * @param collisionModel {SpatialCollection} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends R.components.Collider
 * @constructor
 * @description Creates a collider component for circle-circle collision testing.  Each object
 *              must implement either the {@link R.objects.Object2D#getWorldBox} or
 *              {@link R.objects.Object2D#getCircle} method and return a world-oriented bounding box or
 *              circle, respectively.
 */
class CircleCollider extends ColliderComponent {

  /**
   * Get the class name of this object
   *
   * @return {String} "CircleCollider"
   */
  get className() {
    return "CircleCollider";
  }

  /**
   * If a collision occurs, calls the game object's <tt>onCollide()</tt> method,
   * passing the time of the collision, the potential collision object, and the game object
   * and target's masks.  The return value should either tell the collision tests to continue or stop.
   *
   * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @param collisionObj {GameObject} The game object with which the collision potentially occurs
   * @param objectMask {Number} The collision mask for the game object
   * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
   * @return {Number} A status indicating whether to continue checking, or to stop
   */
  testCollision(time, dt, collisionObj, objectMask, targetMask) {
    if (this.collisionData != null) {
      // Clean up old data first
      this.collisionData.destroy();
    }

    // See if a collision will occur
    var linked = this.linkedBody,
      host = this.gameObject,
      circle1 = host.worldCircle,
      circle2 = collisionObj.worldCircle;

    if (this.testMode == ColliderComponent.LOFI &&
      circle1.isIntersecting(circle2)) {

      // Intersection test passed
      return super.testCollision(time, dt, collisionObj, objectMask, targetMask);

    } else {
      var tRad = circle1.radius + circle2.radius,
        c1 = circle1.center, c2 = circle2.center;

      var distSqr = (c1.x - c2.x) * (c1.x - c2.x) +
        (c1.y - c2.y) * (c1.y - c2.y);

      if (distSqr < (tRad * tRad)) {
        // Collision occurred, how much to separate circle1 from circle2
        var diff = tRad - Math.sqrt(distSqr);

        // If we got here, there is a collision
        var sep = Vector2D.create((c2.x - c1.x) * diff, (c2.y - c1.y) * diff);
        this.collisionData = CollisionData.create(
          sep.length,
          Vector2D.create(c2.x - c1.x, c2.y - c1.y).normalize(),
          host,
          collisionObj,
          sep,
          time,
          dt);

        return super.testCollision(time, collisionObj, objectMask, targetMask);
      }
    }

    // No collision
    return ColliderComponent.CONTINUE;
  }

  render(renderContext) {
    super.render(renderContext);
    // Debug the collision box
    if (RenderEngine.debugMode && !this._destroyed) {
      var linked = this.linkedBody,
        origin = Point2D.create(linked ? linked.localOrigin : Point2D.ZERO),
        circle = Circle2D.create(this.gameObject.worldCircle);

      circle.offset(origin.neg());

      renderContext.postRender(function () {
        this.lineStyle = "yellow";
        this.lineWidth = 1;
        this.drawCircle(circle.center, circle.radius);
      });

      origin.destroy();
      circle.destroy();
    }
  }

}

