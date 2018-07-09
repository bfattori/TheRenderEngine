/**
 * The Render Engine
 * DebugComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A debugging component to render helpful debug widgets alongside an object.
 *
 * @param name {String} Name of the component
 *
 * @extends R.components.Render
 * @constructor
 * @description A debugging component.
 */
class DebugWorldBoxComponent extends DebugComponent {

  constructor() {
    super("WorldBoxDebug");
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "DebugWorldBoxComponent"
   */
  get className() {
    return "DebugWorldBoxComponent";
  }

  /**
   * Draws the world box of the object
   *
   * @param renderContext {RenderContext2D} The render context for the component
   */
  render(renderContext) {
    renderContext.lineWidth = 1;
    renderContext.lineStyle = "#ff0";
    renderContext.drawRectangle(this.gameObject.worldBox);
  }

}


