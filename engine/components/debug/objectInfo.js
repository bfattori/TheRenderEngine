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
class DebugObjectInfoComponent extends DebugComponent {

  constructor(infoOptions) {
    super("ObjectInfoDebug");
    this.info = "var obj = this; return {";

    this.info += "'id': obj.id, ";
    this.info += "'pos': obj.renderPosition + ' (' + Math.floor(obj.rotation) + ')'";

    for (var opt in infoOptions) {
      if (infoOptions.hasOwnProperty(opt)) {
        var v = infoOptions[opt];
        this.info += (this.info.length > 0 ? "," : "") + "'" + opt + "': obj." + v;
      }
    }

    this.info += " };";
    this.info = new Function(this.info);
  }

  release() {
    super.release();
    this.info = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "DebugObjectInfoComponent"
   */
  get className() {
    return "DebugObjectInfoComponent";
  }

  /**
   * Draws a simple axis marker at the object's origin.
   *
   * @param renderContext {RenderContext2D} The render context for the component
   */
  render(renderContext) {
    renderContext.pushTransform();

    var pos = Point2D.create(this.gameObject.renderPosition);
    var step = Point2D.create(0, 12);
    var info = this.info.call(this.gameObject);
    pos.sub(step).sub(step);

    renderContext.font = 'Arial';
    renderContext.fontSize = 10;
    renderContext.fillStyle = 'white';
    for (var i in info) {
      var str = info[i];
      renderContext.drawText(pos, str);
      pos.add(step);
    }

    pos.destroy();
    step.destroy();

    renderContext.popTransform();
  }

}

