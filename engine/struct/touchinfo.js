/**
 * The Render Engine
 * TouchInfo
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class An object which contains information about touch gestures in relation to
 *        a rendering context.
 *
 * @extends MouseInfo
 * @constructor
 * @description Creates a touch data structure.
 */
class TouchInfo extends MouseInfo {

  constructor() {
    this._touches = [];
    super("TouchInfo");
  }

  release() {
    super.release();
    this._touches = null;
  }

  get className() {
    return "TouchInfo";
  }

  get touches() {
    return this._touches;
  }

  /**
   * Process the touches and pass an array of touch objects to be handled by the
   * host object.
   * @private
   */
  static processTouches(eventObj) {
    var touches = [];
    if (eventObj.touches) {
      for (var i = 0; i < eventObj.touches.length; i++) {
        touches.push(new Touch(eventObj.touches[i]));
      }
    }
    return touches;
  }

}


