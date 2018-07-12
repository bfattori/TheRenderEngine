/**
 * The Render Engine
 * DefaultContext
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A reference to the <tt>document.body</tt> element as a rendering context.
 * Aside from being The Render Engine's default rendering context, the context
 * is essentially a wrapper for the HTML document.  Wrapping, in this way, allows
 * us to update not only this context, but all other contexts during an engine frame.
 *
 * @extends AbstractRenderContext
 * @constructor
 * @description Create an instance of a document rendering context.  This context
 * represents the HTML document body.  Theoretically, only one of these
 * contexts should ever be created.
 */
class DefaultRenderContext extends AbstractRenderContext {

  constructor() {
    super("DefaultRenderContext", document.body);

    // Special case
    this.setObjectDataModel("DOMPosition", Point2D.ZERO);
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "DefaultRenderContext"
   */
  get className() {
    return "DefaultRenderContext";
  }

  /**
   * Reset the context, clearing it and preparing it for drawing.
   */
  reset(rect) {
  }
}
