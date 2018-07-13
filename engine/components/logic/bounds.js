/**
 * The Render Engine
 * Bounds
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class .
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of this component
 * @extends R.components.Logic
 * @constructor
 * @description Creates a <tt>R.components.Host</tt> which can contain {@link R.engine.GameObject GameObjects}.
 *              This allows a component to embed other game objects within it.  Each time the
 *              component is executed, each game object will be given a chance to update as well.
 */
class BoundsComponent extends LogicComponent {

  constructor(name, priority = 1.0) {
    super(name, priority);
    this._box = Rectangle2D.create(0, 0, 1, 1);
    this._circle = Circle2D.create(0, 0, 1);
  }

  release() {
    super.release();
    this._box = null;
    this._circle = null;
  }

  /**
   * Destroys the container which refers to the game objects.
   */
  destroy() {
    this._box.destroy();
    this._circle.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "BoundsComponent"
   */
  get className() {
    return "BoundsComponent";
  }

  set gameObject(gameObject) {
    super.gameObject = gameObject;

    gameObject.addComponentProperty("boundingBox", this.boundingBox);
    gameObject.addComponentProperty("boundingCircle", this.boundingCircle);
  }

  get boundingBox() {
    return this._box;
  }

  get boundingCircle() {
    return this._circle;
  }

  /**
   * Update each of the game objects within this component.  The order
   * in which game objects are updated is equivalent to the order in which
   * the objects were added.
   *
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    // Calculate bounding box and circle
  }
}
