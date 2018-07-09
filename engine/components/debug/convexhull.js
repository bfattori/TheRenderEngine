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
class DebugConvexHullComponent extends DebugComponent {

  constructor() {
    super("ConvexHullDebug");
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.components.debug.ConvexHull"
   */
  get className() {
    return "DebugConvexHullComponent";
  }

  /**
   * Draws the convex hull of the object
   *
   * @param renderContext {RenderContext2D} The render context for the component
   */
  render(renderContext) {
    if (!this._destroyed) {
      renderContext.pushTransform();
      renderContext.lineStyle = "yellow";
      var cHull = this.gameObject.collisionHull;
      if (cHull.type === ConvexHull.CONVEX_NGON) {
        renderContext.drawPolygon(cHull.vertexes);
      } else {
        renderContext.drawArc(this.gameObject.renderPosition, cHull.radius, 0, 359);
      }
      renderContext.popTransform();
    }
  }

}

