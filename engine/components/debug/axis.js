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
 * @extends DebugComponent
 * @constructor
 * @description A debugging component.
 */
class DebugAxisComponent extends DebugComponent {

  constructor() {
    super("AxisDebug");
    this._up = Vector2D.create(Vector2D.UP).mul(this.size);
    this._left = Vector2D.create(Vector2D.LEFT).mul(this.size);
  }

  destroy() {
    this._up.destroy();
    this._left.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.components.debug.Axis"
   */
  get className() {
    return "DebugAxisComponent";
  }

  /**
   * Draws a simple axis marker at the object's origin.
   *
   * @param renderContext {RenderContext2D} The render context for the component
   */
  render(renderContext) {

    var up = Point2D.create(this.gameObject.renderPosition);
    var left = Point2D.create(this.gameObject.renderPosition);

    renderContext.lineWidth = 1.5;
    renderContext.lineStyle = "red";
    renderContext.drawLine(up, up.add(this._up));
    renderContext.lineStyle = "#08f";
    renderContext.drawLine(left, left.add(this._left));

    up.destroy();
    left.destroy();
  }

}


