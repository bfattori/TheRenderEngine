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
 * @extends RenderComponent
 * @constructor
 * @description A debugging component.
 */
class DebugComponent extends RenderComponent {

  constructor(name) {
    super(name, 0.1);
    // No setter, so call directly
    this._type = BaseComponent.TYPE_POST;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "DebugComponent"
   */
  get className() {
    return "DebugComponent";
  }

}

