/**
 * The Render Engine
 * ContextText
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A text renderer which draws text using the context's native text rendering.
 *
 * @constructor
 * @extends AbstractTextRenderer
 */
class ContextText extends AbstractTextRenderer {

  /** @private */
  constructor() {
    super();
    this.tInit();
  }

  /**
   * Get the class name of this object
   * @return {String} The string "ContextText"
   */
  get className() {
    return "ContextText";
  }

  /**
   * Initialize some basics
   * @private
   */
  tInit() {
    this.font = "sans-serif";
    this.alignment = RenderContext2D.FONT_ALIGN_LEFT;
    this.textWeight = RenderContext2D.FONT_WEIGHT_NORMAL;
    this.style = RenderContext2D.FONT_STYLE_NORMAL;
  }

  /**
   * Return <tt>true</tt> if the text renderer is native to the context.
   * @return {Boolean}
   */
  get native() {
    return true;
  }

  set text(text) {
    super.text = text;
    this.calculateBoundingBox();
  }

  /**
   * Calculate the bounding box for the text and set it on the host object.
   * @private
   */
  calculateBoundingBox() {
    if (this.gameObject.renderContext) {
      var ctx = this.gameObject.renderContext;
      ctx.pushTransform();
      ctx.fontStyle = this.style;
      ctx.fontAlign = this.alignment;
      ctx.fontWeight = this.textWeight;
      ctx.font = this.font;
      ctx.fontSize = Math.floor(this.size * TextRenderer.BASE_TEXT_PIXELSIZE) || TextRenderer.BASE_TEXT_PIXELSIZE;

      this.gameObject.boundingBox.copy(ctx.getTextMetrics(this.text));
      ctx.popTransform();
    }
  }

  /**
   *
   * @param renderContext {RenderContext2D}
   */
  render(renderContext) {

    if (this.text.length == 0) {
      return;
    }

    renderContext.fontStyle = this.style;
    renderContext.fontAlign = this.alignment;
    renderContext.fontWeight = this.textWeight;
    renderContext.font = this.font;
    renderContext.fontSize = Math.floor(this.size * TextRenderer.BASE_TEXT_PIXELSIZE) || TextRenderer.BASE_TEXT_PIXELSIZE;

    renderContext.fillStyle = this.color;
    renderContext.drawText(Point2D.ZERO, this.text);
  }

}
