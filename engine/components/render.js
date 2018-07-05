/**
 * The Render Engine
 * RenderComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class The base component class for components which render
 *        to an {@link AbstractRenderContext render context}.  Rendering
 *             consists of anything which alters the visual state of the render context.
 *
 * @param name {String} The name of the component
 * @param priority {Number} The priority of the component between 0.0 and 1.0
 * @constructor
 * @extends BaseComponent
 * @description Creates a render component.
 */
class RenderComponent extends BaseComponent {


  /**
   * The component should render itself to the rendering context.
   * @type {Number}
   */
  static DRAW = 0;

  /**
   * The component <i>should not</i> render itself to the rendering context.
   * @type {Number}
   */
  static NO_DRAW = 1;

  /**
   * @private
   */
  constructor(name, priority = 1.0) {
    super(name, BaseComponent.TYPE_RENDERING, priority);
    this.renderOpts = {
      oldDisplay: null,
      origin: Point2D.create(0, 0)
    };
  }

  /**
   * Destroy the component instance
   */
  destroy() {
    this.renderOpts.origin.destroy();
    super.destroy();
  }

  /**
   * Releases the component back into the object pool. See {@link PooledObject#release}
   * for more information.
   */
  release() {
    super.release();
    this.renderOpts = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "RenderComponent"
   */
  get className() {
    return "RenderComponent";
  }

  /**
   * Set the draw mode of the component.  Currently this determines
   * if the component should render itself to the context or not.
   *
   * @param drawMode {Number} One of {@link #DRAW} or
   *                 {@link #NO_DRAW}.
   */
  set drawMode(drawMode) {
    this.renderOpts.drawMode = drawMode;
  }

  /**
   * Get the drawing mode of the component.
   * @return {Number}
   */
  get drawMode() {
    return this.renderOpts.drawMode;
  }

  /**
   * Adjust the local transformation to accommodate the origin.
   *
   * @param renderContext {AbstractRenderContext} The render context
   * @param before {Boolean} <code>true</code> if the transform is occurring before rendering
   */
  transformOrigin(renderContext, before) {
    if (this.gameObject.origin.isZero()) {
      return;
    }

    if (!this.renderOpts.origin.equals(this.gameObject.origin)) {
      this.renderOpts.origin.copy(this.gameObject.origin);
    }

    if (before === true) {
      renderContext.pushTransform();
      renderContext.position = this.renderOpts.origin.neg();  //Set-flip
      this.renderOpts.origin.neg();                           //Flip back
    } else {
      renderContext.popTransform();
    }
  }

  /**
   * Handles whether or not the component should draw to the
   * render context.
   *
   * @param renderContext {AbstractRenderContext} The rendering context
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(renderContext, time, dt) {
    if (this._destroyed || (RenderEngine.options.useDirtyRectangles && !this.gameObject.dirty)) {
      // Objects that aren't dirty don't need to re-render
      return false;
    }

    // Check visibility
    if ((this.renderOpts.drawMode === RenderComponent.NO_DRAW) ||
      this.gameObject.worldBox &&
      (!renderContext.expandedViewport.isIntersecting(this.gameObject.worldBox))) {
      return false;
    }

    // The object is visible
    //RenderEngine.vObj++;
    return true;
  }

}

