/**
 * The Render Engine
 * SpriteComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A render component that renders its contents from a {@link SpriteResource}.  Sprites
 *        are 2d graphics which are either a single frame (static) or multiple frames
 *        (animation).  The sprite's descriptor will define that for the component.
 *
 * @param name {String} The component name
 * @param [priority=0.1] {Number} The render priority
 * @param sprite {SpriteResource} The sprite to render
 * @extends RenderComponent
 * @constructor
 * @description Create a sprite component.
 */
class SpriteComponent extends RenderComponent {

  /**
   * @private
   */
  constructor(name, priority = 0.1) {
    super(name, priority);
    this.currentSprite = null;
  }

  release() {
    super.release();
    this.currentSprite = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "SpriteComponent"
   */
  get className() {
    return "SpriteComponent";
  }

  /**
   * Calculate the bounding box from the set of
   * points which comprise the shape to be rendered.
   * @private
   */
  calculateBoundingBox() {
    return this.currentSprite.boundingBox;
  }

  /**
   * Set the sprite the component will render.
   * @param sprite {SpriteResource}
   */
  set sprite(sprite) {
    this.currentSprite = sprite;
    this.gameObject.markDirty();
  }

  /**
   * Get the sprite the component is rendering.
   *
   * @return {SpriteResource} A <tt>SpriteResource</tt> instance
   */
  get sprite() {
    return this.currentSprite;
  }

  execute(time, dt) {
    this.currentSprite.animate(time, dt);
  }

  /**
   * Draw the sprite to the render context.  The frame, for animated
   * sprites, will be automatically determined based on the current
   * time passed as the second argument.
   *
   * @param renderContext {RenderContext2D} The context to render to
   */
  render(renderContext) {

    if (!super.render(renderContext)) {
      return;
    }

    if (this.currentSprite) {
      this.transformOrigin(renderContext, true);
      renderContext.drawSprite(this.currentSprite);
      this.transformOrigin(renderContext, false);
    }
  }
}
