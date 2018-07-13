/**
 * The Render Engine
 * LogicComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Logic components are sort of a catch-all of components.  They aren't
 *        any one of the specific types, so they fall under the type of LOGIC.
 *        Logic components are in the middle of the importance scale, so they
 *        are processed after input and transformations, but before collision and
 *        rendering.  This makes them ideal for additional processing, such as the
 *        {@link HostComponent}.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of the component
 * @extends BaseComponent
 * @constructor
 * @description Creates a logic component.
 */
class LogicComponent extends BaseComponent {

  constructor(name, priority = 1.0) {
    super(name, BaseComponent.TYPE_LOGIC, priority);
  }

  /**
   * Get the class name of this object
   * @return {String} "LogicComponent"
   */
  get className() {
    return "LogicComponent";
  }
}
