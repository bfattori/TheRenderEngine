/**
 * The Render Engine
 * DebugComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
class DebugAABBComponent extends DebugComponent {

  constructor() {
    super("AABBDebug");
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.components.debug.AABB"
   */
  get className() {
    return "DebugAABBComponent";
  }

  /**
   * Draws the axis aligned bounding box of the object
   *
   * @param renderContext {RenderContext2D} The render context for the component
   */
  render(renderContext) {
    renderContext.lineWidth = 1;
    renderContext.lineStyle = "cyan";
    renderContext.drawRectangle(this.gameObject.AABB);
  }

}


