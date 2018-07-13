/**
 * The Render Engine
 * ConvexColliderComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An extension of the {@link ColliderComponent} which will check the
 *        object's convex collision hulls using the Separating Axis Theorm (SAT).  Each object must
 *        have a collision hull assigned to it with {@link R.objects.Object2D#setCollisionHull}.
 *        <p/>
 *        The SAT states that, if an axis can be found where the two object's hulls
 *        don't overlap, then the two objects cannot be colliding.  When a collision
 *        is determined, querying {@link #getCollisionData} will return a {@link R.struct.CollisionData}
 *        object which can be used to determine the collision normal, what shapes collided, the amount
 *        of overlap, and a vector to separate the objects.
 *        <p/>
 *        The data can also be manipulated to simulate physical forces such as
 *        bounciness and friction.
 *
 * @param name {String} Name of the component
 * @param collisionModel {R.spatial.AbstractSpatialContainer} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends R.components.Collider
 * @constructor
 * @description Creates a collider component for SAT collision testing.  Each object's
 *              collision will be determined using its convex collision hull.
 */
class ConvexCollider extends ColliderComponent {

  constructor(name, collisionModel, priority) {
    super(name, collisionModel, priority);

    // Convex hull colliders can only produce detailed tests
    this.testMode = ColliderComponent.HIFI;
  }

  /**
   * Get the class name of this object
   * @return {String} "ConvexCollider"
   */
  get className() {
    return "ConvexCollider";
  }

  /**
   * If a collision occurs, calls the game object's <tt>onCollide()</tt> method,
   * passing the time of the collision, the potential collision object, and the game object
   * and target's masks.  The return value should either tell the collision tests to continue or stop.
   *
   * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @param collisionObj {R.engine.GameObject} The game object with which the collision potentially occurs
   * @param objectMask {Number} The collision mask for the host object
   * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
   * @return {Number} A status indicating whether to continue checking, or to stop
   */
  testCollision(time, dt, collisionObj, objectMask, targetMask) {
    if (this.collisionData != null) {
      // Clean up old data first
      this.collisionData.destroy();
    }

    // Fast-out test if no method(s)
    var host = this.gameObject;

    // Use distance of bounding circle's to perform an early out test
    // if the objects are too far apart
    var hull1 = host.collisionHull;
    var hull2 = collisionObj.collisionHull;

    if (collisionObj._destroyed || !(hull1 && hull2)) {
      return ColliderComponent.CONTINUE;
    }

    // Possible early-out
    var tRad = hull1.radius + hull2.radius;
    var c1 = hull1.center;
    var c2 = hull2.center;
    var distSqr = (c1.x - c2.x) * (c1.x - c2.x) +
      (c1.y - c2.y) * (c1.y - c2.y);
    if (distSqr > tRad * tRad) {
      // Too far apart to be colliding
      return ColliderComponent.CONTINUE;
    }

    // Perform the test, passing along the circle data so we don't recalc
    this.collisionData = ConvexCollider.test(hull1, hull2, time, dt, distSqr, tRad);

    // If a collision occurred, there will be a data structure describing it
    if (this.collisionData != null) {
      return super.testCollision(time, dt, collisionObj, objectMask, targetMask);
    }

    return ColliderComponent.CONTINUE;
  }


  /**
   * Performs the SAT collision test for <code>shape1</code> against <code>shape2</code>.
   * Each shape is either a convex hull or a circle (AABB or box is considered a polygon).
   * If a collision is observed, the method will return a repulsion vector for the first
   * shape to not collide with the second shape.  If no collision is determined, the
   * repulsion vector will be {@link R.math.Vector2D#ZERO}.
   * <p/>
   * The resulting tests used by this component can be found at:<br/>
   * http://rocketmandevelopment.com/2010/05/19/separation-of-axis-theorem-for-collision-detection/
   *
   * @param shape1 {R.collision.ConvexHull}
   * @param shape2 {R.collision.ConvexHull}
   * @param time {Number} The world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @return {R.math.Vector2D}
   */
  static test(shape1, shape2, time, dt /*, distSqr, tRad */) {
    if (RenderEngine.debugMode) {
      var rc = shape1.gameObject.renderContext,
        c1 = Point2D.create(shape1.center),
        c2 = Point2D.create(shape2.center);

      rc.postRender(function () {
        this.lineStyle = "yellow";
        this.lineWidth = 2;
        this.drawLine(c1, c2);
      });
      c1.destroy();
      c2.destroy();
    }


    if (shape1.type === ConvexHull.CONVEX_CIRCLE && shape2.type === ConvexHull.CONVEX_CIRCLE) {
      return ConvexCollider.circleToCircleTest(shape1, shape2, time, dt, arguments[4], arguments[5]);
    }

    if (shape1.type !== ConvexHull.CONVEX_CIRCLE && shape2.type() !== ConvexHull.CONVEX_CIRCLE) {
      return ConvexCollider.polyToPolyTest(shape1, shape2, time, dt);
    }

    // One shape is a circle, the other is an polygon, do that test
    return ConvexCollider.circleToPolyTest(shape1, shape2, time, dt);
  }

  /**
   * Circle-circle test
   * @private
   */
  static circleToCircleTest(shape1, shape2, time, dt, distSqr, tRad) {
    // If we got here, we've already done 95% of the work in the early-out test above
    var c1 = shape1.center, c2 = shape2.center;

    // How much to separate shape1 from shape2
    var diff = tRad - Math.sqrt(distSqr);

    // If we got here, there is a collision
    var sep = Vector2D.create((c2.x - c1.x) * diff, (c2.y - c1.y) * diff);
    return CollisionData.create(sep.length,
      Vector2D.create(c2.x - c1.x, c2.y - c1.y).normalize(),
      shape1.gameObject,
      shape2.gameObject,
      sep,
      time,
      dt);
  }

  /**
   * @private
   */
  static _findNormalAxis(axis, vertices, index) {
    var vector1 = vertices[index];
    var vector2 = (index >= vertices.length - 1) ? vertices[0] : vertices[index + 1];
    axis.copy(-(vector2.y - vector1.y), vector2.x - vector1.x);
    axis.normalize();
  }

  /**
   * Poly-poly test
   * @private
   */
  static polyToPolyTest(shape1, shape2, time, dt) {
    var test1, test2, testNum, min1, min2, max1, max2, offset, temp;
    var axis = Vector2D.create(0, 0);
    var vectorOffset = Vector2D.create(0, 0);
    var vectors1 = shape1.vertexes;		// This time we want transformed verts
    var vectors2 = shape2.vertexes;
    var shortestDistance = 0x7FFFFFF;
    var unitVec = null;
    var overlap = 0;

    if (vectors1.length == 2) {
      // Pad to fix the test
      temp = Vector2D.create(-(vectors1[1].y - vectors1[0].y),
        vectors1[1].x - vectors1[0].x);
      vectors1.push(vectors1[1].add(temp));
      temp.destroy();
    }
    if (vectors2.length == 2) {
      temp = Vector2D.create(-(vectors2[1].y - vectors2[0].y),
        vectors2[1].x - vectors2[0].x);
      vectors2.push(vectors2[1].add(temp));
      temp.destroy();
    }

    // Find vertical offset
    var sc1 = shape1.center;
    var sc2 = shape2.center;
    vectorOffset.copy(sc1.x - sc2.x, sc1.y - sc2.y);

    // Loop to begin projection
    for (var i = 0; i < vectors1.length; i++) {
      ConvexCollider._findNormalAxis(axis, vectors1, i);

      // project polygon 1
      min1 = axis.dot(vectors1[0]);
      max1 = min1;	// Set max and min equal

      var j;
      for (j = 1; j < vectors1.length; j++) {
        testNum = axis.dot(vectors1[j]);	// Project each point
        if (testNum < min1) min1 = testNum;	// Test for new smallest
        if (testNum > max1) max1 = testNum;	// Test for new largest
      }

      // project polygon 2
      min2 = axis.dot(vectors2[0]);
      max2 = min2;	// Set 2's max and min

      for (j = 1; j < vectors2.length; j++) {
        testNum = axis.dot(vectors2[j]);	// Project the point
        if (testNum < min2) min2 = testNum;	// Test for new min
        if (testNum > max2) max2 = testNum; // Test for new max
      }

      // Test if they are touching
      test1 = min1 - max2;	// Test min1 and max2
      test2 = min2 - max1; // Test min2 and max1

      // Test for a gap
      if (test1 > 0 || test2 > 0) {
        // Clean up before returning
        axis.destroy();
        vectorOffset.destroy();
        // If either is greater than zero, there is a gap
        return null;
      }

      var dist = -(max2 - min1);
      var aDist = Math.abs(dist);
      if (aDist < shortestDistance) {
        unitVec = axis;
        overlap = dist;
        shortestDistance = aDist;
      }
    }

    if (unitVec == null) {
      // Something is wrong
      axis.destroy();
      vectorOffset.destroy();
      return null;
    }

    // If you're here, there is a collision
    var cData = CollisionData.create(overlap,
      unitVec,
      shape1.gameObject,
      shape2.gameObject,
      Vector2D.create(unitVec.x * overlap, unitVec.y * overlap),
      time,
      dt);

    // Clean up before returning
    vectorOffset.destroy();

    // Return the collision data
    return cData;
  }

  /**
   * Circle-poly test
   * @private
   */
  static circleToPolyTest(shape1, shape2, time, dt) {
    var test1, test2, test, min1, max1, min2, max2, offset, distance, temp;
    var vectorOffset = Vector2D.create(0, 0);
    var vectors, center, radius, poly;
    var testDistance = 0x7FFFFFFF;
    var shortestDistance = 0x7FFFFFFF;
    var closestVertex = Vector2D.create(0, 0);
    var normalAxis = Vector2D.create(0, 0);
    var unitVec = null;
    var overlap = 0;

    // Determine which shape is the circle and which is the polygon
    // We don't want the transformed vertexes here, we transform them later
    if (shape1.getType() != ConvexHull.CONVEX_CIRCLE) {
      vectors = shape1.getUntransformedVertexes();
      poly = shape1.center;
      center = shape2.center;
      radius = shape2.radius;
    } else {
      vectors = shape2.getUntransformedVertexes();
      poly = shape2.center;
      center = shape1.center;
      radius = shape1.radius;
    }

    // Find offset
    var pC = poly;
    var cC = center;
    vectorOffset.set(pC.x - cC.x, pC.y - cC.y);

    if (vectors.length == 2) {
      // Pad to fix the test
      temp = Vector2D.create(-(vectors[1].y - vectors[0].y),
        vectors[1].x - vectors[0].x);
      vectors.push(vectors[1].add(temp));
      temp.destroy();
    }

    // Find the closest vertex to use to find normal
    var i, j;
    for (i = 0; i < vectors.length; i++) {
      // These points have been transformed
      distance = (cC.x - (pC.x + vectors[i].x)) * (cC.x - (pC.x + vectors[i].x)) +
        (cC.y - (pC.y + vectors[i].y)) * (cC.y - (pC.y + vectors[i].y));
      if (distance < testDistance) {
        // Closest has the lowest distance
        testDistance = distance;
        closestVertex.copy(pC.x + vectors[i].x, pC.y + vectors[i].y);
      }
    }

    // Get the normal vector from the poly to the circle
    normalAxis.copy(closestVertex.x - cC.x, closestVertex.y - cC.y);
    normalAxis.normalize();	// set length to 1

    // We'll remember this so that we can use it in the collision data
    unitVec = Vector2D.create(normalAxis);

    // Project the polygon's points against the circle
    min1 = normalAxis.dot(vectors[0]);
    max1 = min1;

    for (j = 1; j < vectors.length; j++) {
      test = normalAxis.dot(vectors[j]);
      if (test < min1) min1 = test;
      if (test > max1) max1 = test;
    }

    // Project the circle
    max2 = radius;
    min2 = -radius;

    // Offset the polygon's max/min
    offset = normalAxis.dot(vectorOffset);
    min1 += offset;
    max1 += offset;

    // First test
    test1 = min1 - max2;
    test2 = min2 - max1;

    if (test1 > 0 || test2 > 0) {
      // Clean up before returning
      unitVec.destroy();
      normalAxis.destroy();
      vectorOffset.destroy();
      closestVertex.destroy();

      // Not colliding
      return null;
    }

    // Now project the circle against the polygon
    for (i = 0; i < vectors.length; i++) {
      ConvexCollider._findNormalAxis(normalAxis, vectors, i);
      min1 = normalAxis.dot(vectors[0]);
      max1 = min1;

      for (j = 1; j < vectors.length; j++) {
        test = normalAxis.dot(vectors[j]);
        if (test < min1) min1 = test;
        if (test > max1) max1 = test;
      }

      // Project the circle
      max2 = radius;
      min2 = -radius;

      // offset points
      offset = normalAxis.dot(vectorOffset);
      min1 += offset;
      max1 += offset;

      // Second Test
      test1 = min1 - max2;
      test2 = min2 - max1;

      if (test1 > 0 || test2 > 0) {
        // Clean up before returning
        unitVec.destroy();
        normalAxis.destroy();
        vectorOffset.destroy();
        closestVertex.destroy();

        // Not colliding
        return null;
      }
    }

    // The overlap is the nearest poly point to the center of the circle, minus the radius
    var c = Vector2D.create(center);
    overlap = c.sub(closestVertex).length;
    overlap -= radius;

    // If we got here, there is a collision
    var cData = CollisionData.create(overlap,
      unitVec,
      shape1.gameObject,
      shape2.gameObject,
      Vector2D.create(unitVec.x * overlap,
        unitVec.y * overlap),
      time,
      dt);

    // Clean up before returning
    c.destroy();
    vectorOffset.destroy();
    closestVertex.destroy();
    normalAxis.destroy();

    // Return the collision data
    return cData;
  }
}


