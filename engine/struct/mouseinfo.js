/**
 * The Render Engine
 * MouseInfo
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An object which contains information about the mouse in relation to
 *        a rendering context.
 *
 * @extends PooledObject
 * @constructor
 * @description Creates a mouse data structure.
 */
class MouseInfo extends PooledObject {

  constructor(name = "MouseInfo") {
    this.mouse = {
      position: Point2D.create(0, 0),
      lastPosition: Point2D.create(0, 0),
      downPosition: Point2D.create(0, 0),
      button: Events.MOUSE_NO_BUTTON,
      moveVec: Vector2D.create(0, 0),
      dragVec: Vector2D.create(0, 0),
      lastOver: null,
      moveTimer: null
    };
    super(name);
  }

  destroy() {
    this.mouse.position.destroy();
    this.mouse.lastPosition.destroy();
    this.mouse.downPosition.destroy();
    this.mouse.moveVec.destroy();
    this.mouse.dragVec.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this.mouse = null;
  }

  get className() {
    return "MouseInfo";
  }

  get position() {
    return this.mouse.position;
  }

  set position(p) {
    this.mouse.position = p;
  }

  get lastPosition() {
    return this.mouse.lastPosition;
  }

  set lastPosition(l) {
    this.mouse.lastPosition = l;
  }

  get downPosition() {
    return this.mouse.downPosition;
  }

  set downPosition(d) {
    this.mouse.downPosition = d;
  }

  get button() {
    return this.mouse.button;
  }

  set button(b) {
    this.mouse.button = b;
  }

  get moveVec() {
    return this.mouse.moveVec;
  }

  set moveVec(m) {
    this.mouse.moveVec = m;
  }

  get dragVec() {
    return this.mouse.dragVec;
  }

  set dragVec(d) {
    this.mouse.dragVec = d;
  }

  get lastOver() {
    return this.mouse.lastOver;
  }

  set lastOver(l) {
    this.mouse.lastOver = l;
  }

  get moveTimer() {
    return this.mouse.moveTimer;
  }

  set moveTimer(m) {
    this.mouse.moveTimer = m;
  }
}
