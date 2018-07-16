/**
 * The Render Engine
 * TextRenderer
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A 2d text rendering object.  The object hosts the given text
 *        renderer, and a way to position and size the text.  It is up
 *        to the renderer provided to present the text within the render
 *        context.
 *
 * @constructor
 * @description Create an instance of one of the text renderers.
 * @param renderer {AbstractTextRenderer} The text renderer to use
 * @param text {String} The text to render
 * @param size {Number} The size of the text to render
 * @see VectorText
 * @see ContextText
 */
class TextRenderer extends Object2D {

  /**
   * Draw the text to the context.
   * @type {Number}
   */
  static DRAW_TEXT = 0;

  /**
   * Don't draw the text to the context.
   * @type {Number}
   */
  static NO_DRAW = 1;

  /**
   * The size of a text element, in pixels
   * @type {Number}
   */
  static BASE_TEXT_PIXELSIZE = 1;


  constructor(renderer, text = "", size = 1) {
    Assert((AbstractTextRenderer.isInstance(renderer)), "Text renderer must extend AbstractTextRenderer");

    super("TextRenderer");

    // Add components to move and draw the text
    this.renderer = renderer;
    if (renderer.native) {
      this.add(this.renderer);
    } else {
      this.add(Billboard2DComponent.create("billboard", this.renderer));
    }

    renderer.text = text;
    renderer.size = size;
    this._drawMode = TextRenderer.DRAW_TEXT;
  }

  /**
   * Release the text renderer back into the pool for reuse
   */
  release() {
    super.release();
    this.drawMode = TextRenderer.DRAW_TEXT;
    this.renderer = null;
  }

  /**
   * Get the class name of this object
   * @return {String} The string "TextRenderer"
   */
  get className() {
    return "TextRenderer";
  }

  /**
   * Called to render the text to the context.
   *
   * @param renderContext {RenderContext2D} The context to render the text into
   */
  render(renderContext) {

    if (this.drawMode === TextRenderer.DRAW_TEXT) {
      renderContext.pushTransform();
      super.render(renderContext);
      renderContext.popTransform();
    }
  }

  regen() {
    if (!this.renderer.native) {
      this.getComponent("billboard").regenerate();
    }
  }

  /**
   * Set the text for this object to render.  This method
   * <i>must</i> be implemented by a text renderer.
   *
   * @param text {String} The text to render.
   */
  set text(text) {
    this.renderer.text = text;
    this.regen();
  }

  /**
   * Get the text for this object to render.  This method
   * <i>must</i> be implemented by a text renderer.
   *
   * @return {String} The text to draw
   */
  get text() {
    return this.renderer.text;
  }

  /**
   * Set the size of the text to render.
   *
   * @param size {Number} Defaults to 1
   */
  set size(size) {
    this.renderer.size = size;
    this.regen();
  }

  /**
   * Get the size of the text to render.
   * @return {Number} The size/scale of the text
   */
  get size() {
    return this.renderer.size;
  }

  /**
   * Set the weight (boldness) of the text.  This method
   * is optional for a text renderer.
   *
   * @param weight {Object} The boldness of the given text renderer
   */
  set textWeight(weight) {
    this.renderer.textWeight = weight;
    this.regen();
  }

  /**
   * Get the weight of the text.  This method is optional
   * for a text renderer.
   * @return {Object} The boldness of the given text renderer
   */
  get textWeight() {
    return this.renderer.textWeight;
  }

  /**
   * Set the font for the text.  This method is optional
   * for a text renderer.
   * @param font {String} The text font
   */
  set font(font) {
    this.renderer.font = font;
    this.regen();
  }

  /**
   * Get the font for the text.  This method is optional
   * for a text renderer.
   * @return {String} The text font
   */
  get font() {
    return this.renderer.font;
  }

  /**
   * Set the style of the text.  This method is optional
   * for a text renderer.
   * @param style {String} The text style
   */
  set style(style) {
    this.renderer.style = style;
    this.regen();
  }

  /**
   * Get the style for text.  This method is optional
   * for a text renderer.
   * @return {String} The text style
   */
  get style() {
    return this.renderer.style;
  }

  /**
   * Set the horizontal alignment of the text.  This method is optional
   * for a text renderer
   */
  set alignment(alignment) {
    this.renderer.alignment = alignment;
    this.regen();
  }

  /**
   * Get the horizontal alignment of the text. This method is optional
   * for a text renderer.
   */
  get alignment() {
    return this.renderer.alignment;
  }

  /**
   * Set the color of the text to render.
   *
   * @param color {String} The color of the text
   */
  set color(color) {
    this.renderer.color = color;
    this.regen();
  }

  /**
   * Get the color of the text to render
   * @return {String} The text color
   */
  get color() {
    return this.renderer.color;
  }

  /**
   * Set the text drawing mode to either {@link #DRAW_TEXT} or {@link #NO_DRAW}.
   *
   * @param drawMode {Number} The drawing mode for the text.
   */
  set drawMode(drawMode) {
    this._drawMode = drawMode;
  }

  /**
   * Get the current drawing mode for the text.
   * @return {Number} The text drawing mode
   */
  get drawMode() {
    return this._drawMode;
  }
}


