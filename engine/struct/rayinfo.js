/**
 * The Render Engine
 * RayInfo
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An object which contains information about a ray.  The values of the
 *    ray structure are read directly.
 *
 * @param start {Point2D} The start point of the ray
 * @param dir {Vector2D} The direction vector
 *
 * @extends PooledObject
 * @constructor
 * @description Creates a ray info data structure for ray casting.
 */
class RayInfo extends PooledObject {

  constructor(start, dir) {
    this.ray = {
      startPoint: R.clone(start),
      direction: R.clone(dir),
      normal: R.clone(dir).normalize().neg(),
      shape: null,
      impactPoint: Point2D.create(0, 0),
      worldTime: 0,
      delta: 0,
      data: {}
    };
    super("RayInfo");
  }

  /**
   * Destroy the collision data object.
   */
  destroy() {
    this.ray.impactPoint.destroy();
    this.ray.normal.destroy();
    if (this.ray.data && this.ray.data.destroy) {
      this.ray.data.destroy();
    }
    this.ray.startPoint.destroy();
    this.ray.direction.destroy();
    super.destroy();
  }

  /**
   * Release the collision data object back into the pool for reuse.
   */
  release() {
    super.release();
    this.ray = null;
  }

  get className() {
    return "RayInfo";
  }

  /**
   * Set the point of impact along the ray.
   * @param impact {Point2D} The impact point
   * @param shape {PooledObject} The object that was impacted
   * @param [data] {Object} Optional data object
   */
  set(impact, shape, data) {
    this.ray.impactPoint = impact;
    this.ray.shape = shape;
    this.ray.data = data;
    this._update();
  }

  _update() {
    this.ray.worldTime = RenderEngine.worldTime;
    this.ray.delta = RenderEngine.deltaTime;
    var end = Vector2D.create(this.ray.startPoint).add(this.ray.direction);
    this.ray.overlap = end.sub(this.ray.impactPoint).length;
    end.destroy();
  }

  get startPoint() {
    return this.ray.startPoint;
  }

  get direction() {
    return this.ray.direction;
  }

  get normal() {
    return this.ray.normal;
  }

  get shape() {
    return this.ray.shape;
  }

  set shape(s) {
    this.ray.shape = s;
    this._update();
  }

  get impactPoint() {
    return this.ray.impactPoint;
  }

  set impactPoint(p) {
    this.ray.impactPoint = p;
    this._update();
  }

  get worldTime() {
    return this.ray.worldTime;
  }

  get delta() {
    return this.ray.delta;
  }

  get data() {
    return this.ray.data;
  }

  set data(d) {
    this.ray.data = d;
    this._update();
  }

}