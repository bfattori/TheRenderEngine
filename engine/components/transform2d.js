/**
 * The Render Engine
 * Transform2DComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A simple component that maintains position, rotation, and scale.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of the component
 * @extends R.components.Base
 * @constructor
 * @description Create a 2d transformation component
 */
class Transform2DComponent extends BaseComponent {

  constructor(name, priority = 1.0) {
    super(name, BaseComponent.TYPE_TRANSFORM, priority);
    this.txfmOpts = {
      position: Point2D.create(0, 0),
      worldPos: Point2D.create(0, 0),
      lastPosition: Point2D.create(0, 0),
      lastRenderPosition: Point2D.create(0, 0),
      scale: Vector2D.create(1, 1),
      rotation: 0
    };
  }

  /**
   * Destroy the component instance
   */
  destroy() {
    this.txfmOpts.position.destroy();
    this.txfmOpts.worldPos.destroy();
    this.txfmOpts.lastPosition.destroy();
    this.txfmOpts.lastRenderPosition.destroy();
    this.txfmOpts.scale.destroy();
    super.destroy();
  }

  /**
   * Releases the component back into the object pool. See {@link PooledObject#release} for
   * more information.
   */
  release() {
    super.release();
    this.txfmOpts = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "Transform2DComponent"
   */
  get className() {
    return "R.components.Transform2DComponent";
  }

  /**
   * Set the position of the transform.
   *
   * @param point {Point2D} The X coordinate, or the position
   */
  set position(point) {
    this.txfmOpts.lastPosition.copy(this.txfmOpts.position);
    this.txfmOpts.position.copy(point);
    this.gameObject.markDirty();
  }

  /**
   * Returns the position of the transformation relative to the world.
   * @return {Point2D}
   */
  get position() {
    return this.txfmOpts.position;
  }

  /**
   * Returns the position of the transformation relative to the viewport.  If the world is
   * comprised of multiple viewports (wide and/or tall) the render position
   * is relative to the current viewport's position.
   * @return {R.math.Point2D}
   */
  get renderPosition() {
    this.txfmOpts.worldPos.copy(this.txfmOpts.position);
    this.txfmOpts.worldPos.sub(this.gameObject.renderContext.worldPosition);
    return this.txfmOpts.worldPos;
  }

  /**
   * Get the last position of the transformation relative to the world.
   * @return {Point2D}
   */
  get lastPosition() {
    return this.txfmOpts.lastPosition;
  }

  /**
   * Get the last position of the transformation relative to the viewport.
   * @return {Point2D}
   */
  get lastRenderPosition() {
    return this.txfmOpts.lastRenderPosition;
  }

  /**
   * Set the rotation of the transformation.
   *
   * @param rotation {Number} The rotation
   */
  set rotation(rotation) {
    this.txfmOpts.rotation = rotation;
    this.gameObject.markDirty();
  }

  /**
   * Get the rotation of the transformation.
   * @return {Number}
   */
  get rotation() {
    return this.txfmOpts.rotation;
  }

  /**
   * Get the rotation of the transformation relative to the viewport.
   * @return {Number}
   */
  get renderRotation() {
    return this.gameObject.renderContext.worldRotation + this.txfmOpts.rotation;
  }

  /**
   * Set the scale of the transform.  You can apply a uniform scale by
   * assigning only the first argument a value.  To use a non-uniform scale,
   * use both the X and Y arguments.
   *
   * @param scaleX {Number} The scale of the transformation along the X-axis with 1.0 being 100%
   * @param [scaleY] {Number} The scale of the transformation along the Y-axis. If provided, a
   *            non-uniform scale can be achieved by using a number which differs from the X-axis.
   */
  setScale(scaleX = 1.0, scaleY) {
    this.txfmOpts.scale.x = scaleX;
    this.txfmOpts.scale.y = scaleY || scaleX;
    this.gameObject.markDirty();
  }

  /**
   * Get the uniform scale of the transformation.
   * @return {Point2D}
   */
  get scale() {
    return this.txfmOpts.scale;
  }

  /**
   * Get the non-uniform scale along the X-axis of the transformation.
   * @return {Number}
   */
  get scaleX() {
    return this.txfmOpts.scale.x;
  }

  /**
   * Get the non-uniform scale along the Y-axis of the transformation.
   * @return {Number}
   */
  get scaleY() {
    return this.txfmOpts.scale.y;
  }

  /**
   * Get the uniform scale of the transformation relative to the viewport.
   * @return {Number}
   */
  get renderScale() {
//    var wS = this.gameObject.renderContext.worldScale;
//      return wS * this.txfmOpts.scale;
    return this.txfmOpts.scale;
  }

  /**
   * Get the uniform scale of the transformation relative to the viewport along the X-axis.
   * @return {Number}
   */
  get renderScaleX() {
//    var wS = this.gameObject.renderContext.worldScale.x;
//      return wS * this.txfmOpts.scale.x;
    return this.txfmOpts.scale.x;
  }

  /**
   * Get the uniform scale of the transformation relative to the viewport along the Y-axis.
   * @return {Number}
   */
  get renderScaleY() {
//    var wS = this.gameObject.renderContext.worldScale.y;
//      return wS * this.txfmOpts.scale.y;
    return this.txfmOpts.scale.y;
  }

  /**
   * Set the components of a transformation: position, rotation,
   * and scale, within the rendering context.
   *
   * @param renderContext {AbstractRenderContext} The rendering context
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(renderContext, time, dt) {
    // TODO: This should really be in a render component only
    renderContext.position = this.renderPosition;
    renderContext.rotation = this.renderRotation;
    renderContext.scale = this.scale;
  }

}
