/**
 * The Render Engine
 * CollisionData
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class An object which contains information about a collision.  The values of the
 *    collision data are read-only.
 *
 * @param o {Number} Overlap
 * @param u {Vector2D} The collision normal
 * @param s1 {GameObject} Game object 1
 * @param s2 {GameObject} Game object 2
 * @param i {Vector2D} Impulse vector to separate shapes
 * @param wt {Number} World time
 * @param dt {Number} Time since last frame redraw (delta time)
 *
 * @extends PooledObject
 * @constructor
 * @description Creates a collision data structure.
 */
class CollisionData extends PooledObject {

  /** @private */
  constructor(overlap, unitVec, shape1, shape2, impulseVec, worldTime, deltaTime) {
    this.cdata = {
      overlap: overlap,
      unitVector: unitVec,
      shape1: shape1,
      shape2: shape2,
      impulseVector: impulseVec,
      worldTime: worldTime,
      delta: deltaTime
    };
    super("CollisionData");
  }

  /**
   * Destroy the collision data object.
   */
  destroy() {
    if (this.cdata.impulseVector) {
      this.cdata.impulseVector.destroy();
    }
    if (this.cdata.unitVector) {
      this.cdata.unitVector.destroy();
    }
    super.destroy();
  }

  /**
   * Release the collision data object back into the pool for reuse.
   */
  release() {
    super.release();
    this.cdata = null;
  }

  get className() {
    return "CollisionData";
  }

  get overlap() {
    return this.cdata.overlap;
  }

  get unitVector() {
    return this.cdata.unitVector;
  }

  get shape1() {
    return this.cdata.shape1;
  }

  get shape2() {
    return this.cdata.shape2;
  }

  get impulseVector() {
    return this.cdata.impulseVector;
  }

  get worldTime() {
    return this.cdata.worldTime;
  }

  get deltaTime() {
    return this.cdata.delta;
  }

}
