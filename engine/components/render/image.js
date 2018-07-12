/**
 * The Render Engine
 * ImageComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A {@link RenderComponent} that draws an image to the render context.
 *        Images used by this component are loaded via an {@link ImageLoader}
 *        so that client-side caching can be used.
 *
 * @param name {String} The name of the component
 * @param [priority=0.1] {Number} The render priority
 * @param image {ImageResource} The image object, acquired with {@link ImageLoader#getImage}.
 * @extends RenderComponent
 * @constructor
 * @description Creates a component which renders images from an {@link ImageLoader}.
 */
class ImageComponent extends RenderComponent {

  /**
   * @private
   */
  constructor(name, priority = 0.1) {
    super(name, priority);
    this.currentImage = null;
  }

  release() {
    super.release();
    this.currentImage = null;
  }

  /**
   * Get the class name of this object
   * @return {String} "ImageComponent"
   */
  get className() {
    return "ImageComponent";
  }

  /**
   * Calculates the bounding box which encloses the image.
   * @private
   */
  calculateBoundingBox() {
    return this.currentImage.boundingBox;
  }

  /**
   * Set the image the component will render from the {@link R.resources.loaders.ImageLoader}
   * specified when creating the component.  This allows the user to change
   * the image on the fly.
   */
  set image(image) {
    this.currentImage = image;
    this.gameObject.markDirty();
  }

  /**
   * Get the image the component is rendering.
   */
  get image() {
    return this.currentImage;
  }

  /**
   * Draw the image to the render context.
   *
   * @param renderContext {RenderContext2D} The context to render to
   */
  render(renderContext) {

    if (!super.render(renderContext)) {
      return;
    }

    if (this.currentImage) {
      this.transformOrigin(renderContext, true);
      renderContext.drawImage(this.currentImage.boundingBox, this.currentImage.image);
      this.transformOrigin(renderContext, false);
    }
  }
}
