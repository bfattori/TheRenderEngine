/**
 * The Render Engine
 * AbstractTextRenderer
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Abstract class that provides the basic interface for all
 *        text render objects used by the {@link R.text.TextRenderer}.
 *
 * @constructor
 * @param componentName {String} The name of the renderer
 * @param priority {Number} The priority of the rendering order. Default: <tt>0.1</tt>
 * @extends BaseComponent
 */
class AbstractTextRenderer extends BaseComponent {

  /**
   * Align text with the left edge of the string at the point specified.
   * @type Number
   */
  static ALIGN_LEFT = 0;

  /**
   * Align text with the right edge of the string at the point specified
   * @type Number
   */
  static ALIGN_RIGHT = 1;

  /**
   * Align text with the center of the string at the point specified
   * @type Number
   */
  static ALIGN_CENTER = 2;

  constructor(componentName = "AbstractTextRenderer", priority = 0.1) {
    super(componentName, BaseComponent.TYPE_RENDERING, priority);

    this.txtOpts = {
      text: "",
      size: 1,
      weight: 1,
      font: null,
      style: null,
      alignment: AbstractTextRenderer.ALIGN_LEFT,
      lineSpacing: 7
    };
  }

  /**
   * Get the class name of this object
   * @return {String} The string "AbstractTextRenderer"
   */
  get className() {
    return "AbstractTextRenderer";
  }


  /**
   * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
   * for more information.
   */
  release() {
    super.release();
    this.txtOpts = null;
  }

  /**
   * Return <tt>true</tt> if the text renderer is native to the context.
   * @return {Boolean}
   */
  get native() {
    return false;
  }

  /**
   * Get the text being rendered
   * @return {String} The text this renderer will draw
   */
  get text() {
    return this.txtOpts.text;
  }

  /**
   * Set the text to be rendered
   *
   * @param text {String} The text to render
   */
  set text(text) {
    this.txtOpts.text = text;
  }

  /**
   * Set the font of the text to be renderer
   * @param font {String} The font name
   */
  set font(font) {
    this.txtOpts.font = font;
  }

  /**
   * Get the font of the text to be rendered
   * @return {String} The font name
   */
  get font() {
    return this.txtOpts.font;
  }

  /**
   * Set the weight of the text to render.  Higher weights
   * are bolder text.
   *
   * @param weight {Number} The weight of the text.
   */
  set textWeight(weight) {
    this.txtOpts.weight = weight;
  }

  /**
   * Get the weight of the text to render.
   * @return {Number} The weight of the text
   */
  get textWeight() {
    return this.txtOpts.weight;
  }

  /**
   * Set the style of the text, usually italics or normal, for the text renderer.
   * @param style {Object} The style of the text
   */
  set style(style) {
    this.txtOpts.style = style;
  }

  /**
   * Get the style of the text for the renderer.
   * @return {Object} The style of the text
   */
  get style() {
    return this.txtOpts.style;
  }

  /**
   * Set the alignment of the text.
   *
   * @param alignment {Object} The alignment for the text renderer
   */
  set alignment(alignment) {
    this.txtOpts.alignment = alignment;
    // Adjust the origin, based on the alignment
    var boundingBox = this.gameObject.boundingBox;
    var center = boundingBox.center;
    var textOrigin = Point2D.create(0, 0);
    if (this.txtOpts.alignment === AbstractTextRenderer.ALIGN_RIGHT) {
      textOrigin.x = center.x + boundingBox.halfWidth;
    }
    else if (this.txtOpts.alignment === AbstractTextRenderer.ALIGN_LEFT) {
      textOrigin.x = center.x - boundingBox.halfWidth;
    }
    else {
      textOrigin.x = center.x;
    }

    this.gameObject.setOrigin(textOrigin.x, textOrigin.y);
    textOrigin.destroy();
  }

  /**
   * Get the alignment of the text.
   * @return {Object} The alignment of the text renderer
   */
  get alignment() {
    return this.txtOpts.alignment;
  }

  /**
   * Set the scaling of the text
   * @param size {Number}
   */
  set size(size) {
    this.txtOpts.size = size;
  }

  /**
   * Get the scaling of the text
   * @return {Number}
   */
  get size() {
    return this.txtOpts.size;
  }

  /**
   * Set the color of the text to render.
   *
   * @param color {String} The color of the text to render
   */
  set color(color) {
    this.txtOpts.color = color;
  }

  /**
   * Get the color of the text to render.
   * @return {String} The text color
   */
  get color() {
    return this.txtOpts.color;
  }

  /**
   * Set the line spacing between lines of text in a multi-line text string.
   * Multi-line text is separated by the carriage return (0xA).
   *
   * @param lineSpacing {Number} Line spacing (default: 7)
   */
  set lineSpacing(lineSpacing) {
    this.txtOpts.lineSpacing = lineSpacing;
  }

  /**
   * Get the space between lines in multi-line text.
   * @return {Number}
   */
  get lineSpacing() {
    return this.txtOpts.lineSpacing;
  }

}


