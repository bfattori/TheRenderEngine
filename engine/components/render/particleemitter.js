/**
 * The Render Engine
 * ParticleEmitter component
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A {@link R.components.Render render component} that allows the developer
 *    to link a particle emitter to a game object.
 *
 * @param name {String} The name of the component
 * @param emitter {R.particles.Emitter} The particle emitter to use with the component
 * @param [priority=0.1] {Number} The render priority
 * @extends R.components.Render
 * @constructor
 * @description Creates a component which emits particles.
 */
class ParticleEmitterComponent extends RenderComponent {

  /**
   * @private
   */
  constructor(name, priority) {
    super(name, priority);
    this._emitter = null;
    this._offset = Point2D.create(0, 0);
  }

  /**
   * Destroy the particle emitter component.
   */
  destroy() {
    this.offset.destroy();
    if (this._emitter) {
      this._emitter.destroy();
    }
    super.destroy();
  }

  release() {
    super.release();
    this._emitter = null;
    this._offset = null;
  }

  /**
   * Get the class name of this object
   * @return {String} "ParticleEmitterComponent"
   */
  get className() {
    return "ParticleEmitterComponent";
  }

  /**
   * Set the particle emitter object.
   */
  set emitter(emitter) {
    this._emitter = emitter;
  }

  /**
   * Get the particle emitter assigned to this component.
   */
  get emitter() {
    return this._emitter;
  }

  /**
   * Set the active state of the particle emitter.
   * @param state {Boolean} <code>true</code> to set the emitter to generate particles
   */
  set active(state) {
    this._emitter.setActive(state);
  }

  /**
   * Set the offset, from the rendering origin, where the particles are emitted
   * from.  This will default to the rendering origin.
   * @param point {Point2D} a point
   */
  set offset(point) {
    this._offset.copy(point);
  }

  /**
   * Get the offset where the particles will be emitted, from the rendering origin.
   * @return {Point2D}
   */
  get offset() {
    return this._offset;
  }

  /**
   * Emit particles to the render context.
   *
   * @param renderContext {AbstractRenderContext} The context to render to
   */
  render(renderContext) {
    if (!super.render(renderContext)) {
      return;
    }

    if (this.emitter) {
      this.transformOrigin(renderContext, true);
      this.emitter.emit(this.getOffset(), time, dt);
      this.transformOrigin(renderContext, false);
    }
  }
}
