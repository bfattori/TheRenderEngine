/**
 * The Render Engine
 * 2D platformer mover
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A transform component to move around a tile map like the old "platformer" games
 *
 * @param name {String} Name of the component
 * @param tileMap {R.resources.types.TileMap} The tile map to move around in
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends R.components.Transform2D
 * @constructor
 * @description Creates a transform component.
 */
class PlatformMover2DComponent extends Transform2DComponent {

  constructor(name, priority = 1.0) {
    super(name, priority);
    this._tileMap = null;
    this._moveVec = Vector2D.create(0, 0);
    this._gravity = Vector2D.create(0, 0.2);
    this._tileSize = 0;
  }

  destroy() {
    this._moveVec.destroy();
    this._gravity.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this._tileMap = null;
    this._moveVec = null;
    this._tileSize = null;
  }

  /**
   * Get the class name of this object
   * @return {String} "R.components.transform.PlatformMover2D"
   */
  get className() {
    return "PlatformMover2DComponent";
  }

  set tileMap(tileMap) {
    if (!tileMap.baseTile) {
      return;
    }

    this._tileMap = tileMap;
    this._tileSize = Math.max(tileMap.baseTile.boundingBox.width, tileMap.baseTile.boundingBox.height);
  }

  get tileMap() {
    return this._tileMap;
  }

  get tileSize() {
    return this._tileSize;
  }

  get moveVector() {
    return this._moveVec;
  }

  set moveVector(point) {
    this._moveVec.copy(point);
  }

  get gravity() {
    return this._gravity;
  }

  set gravity(point) {
    this._gravity.copy(point);
  }

  /**
   * This method is called by the game object to run the component,
   * updating its state.
   *
   * @param time {Number} The global engine time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    if (this._tileMap) {
      var bBox = this.gameObject.boundingBox, oldPos = R.clone(this.position),
        newPos = R.clone(oldPos), testPt = R.clone(bBox.center),
        mNormal = R.clone(this._moveVec).normalize(), rayInfo,
        dir = Vector2D.create(0, 0);

      // If movement along the X coordinate isn't zero, we want to test for collisions along the axis.
      // We'll cast a ray in the direction of movement, one tile width long, from the center of the
      // bounding box
      if (this._moveVec.x != 0) {
        // We want to cast a ray along the X axis of movement
        testPt.x = (newPos.x + testPt.x) + (bBox.halfWidth * mNormal.x);
        dir.x = this._moveVec.x;
        dir.y = 0;
        dir.normalize().mul(this._tileSize);
        rayInfo = RayInfo.create(testPt, dir);

        TileMap.castRay(this._tileMap, rayInfo);

        // There's something in the direction of horizontal movement, can't go that way
        if (rayInfo.shape) {
          this._moveVec.x = 0;
          newPos.x -= rayInfo.data.x;
        }

        rayInfo.destroy();
      }

      // Add in gravity
      if (!this._gravity.equals(Vector2D.ZERO)) {
        this._moveVec.add(this._gravity);

        // We'll cast two rays, one from the left side of the bounding box,
        // the other from the right. If either collides, zero out gravity.
        // -- First one
        testPt.x = newPos.x + 1;
        testPt.y = newPos.y + bBox.height;
        dir.copy(this._moveVec).normalize().mul(3);
        rayInfo = RayInfo.create(testPt, dir);
        TileMap.castRay(this.tileMap, rayInfo);

        // If a collision occurs, stop gravity and adjust position
        if (rayInfo.shape) {
          this._moveVec.y = 0;
          newPos.y -= rayInfo.data.y;
        } else {
          // -- Second one
          testPt.x = newPos.x + bBox.width - 1;
          testPt.y = newPos.y + bBox.height;
          rayInfo = RayInfo.create(testPt, dir);
          TileMap.castRay(this.tileMap, rayInfo, renderContext);

          if (rayInfo.shape) {
            this._moveVec.setY(0);
            newPos.y -= rayInfo.data.y;
          }
        }

        rayInfo.destroy();
      }

      this.position = newPos.add(this.moveVec);

      dir.destroy();
      oldPos.destroy();
      newPos.destroy();
      testPt.destroy();
    }

    super.execute(time, dt);
  }

}