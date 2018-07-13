/**
 * The Render Engine
 * KeyboardInputComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A component which responds to keyboard events and notifies
 * its {@link GameObject} when one of the events occurs.  The <tt>GameObject</tt>
 * should add event handlers for any of the following:
 * <ul>
 * <li><tt>keydown</tt> - A key was pressed down</li>
 * <li><tt>keyup</tt> - A key was released</li>
 * <li><tt>keypress</tt> - A key was pressed and released</li>
 * </ul>
 * Each event handler will be passed six arguments.  The first argument is the event object.
 * The second argument is the character code, a number which represents the key that was pressed.
 * The third argument is the <tt>keyCode</tt>, a number which represents special keys that were
 * pressed, such as the arrow keys and function keys.  See {@link Events} for key codes of
 * the non-alphabetic keys. The fourth, fifth, and sixth arguments are boolean flags indicating if
 * the Control, Alt, or Shift keys, respectively, were pressed.
 *
 * @param name {String} The unique name of the component.
 * @param priority {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create an instance of a keyboard input component.
 */
class KeyboardComponent extends InputComponent {

  static RECORD_PART = ["shiftKey", "ctrlKey", "altKey", "keyCode"];

  constructor(name, priority) {
    super(name, priority);

    // Add the event handlers
    var ctx = RenderEngine.defaultContext

    ctx.addEvent("keydown", function (evt) {
      return this._keyDownListener(evt);
    }.bind(this));

    ctx.addEvent("keyup", function (evt) {
      return this._keyUpListener(evt);
    }.bind(this));

    ctx.addEvent("keypress", function (evt) {
      return this._keyPressListener(evt);
    }.bind(this));
  }

  /**
   * Destroy this instance and remove all references.
   * @private
   */
  destroy() {
    var ctx = RenderEngine.defaultContext;

    // Clean up event handlers
    ctx.removeEvent("keydown");
    ctx.removeEvent("keyup");
    ctx.removeEvent("keypress");

    super.destroy();
  }

  release() {
    super.release();
    this.hasInputMethods = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "KeyboardComponent"
   */
  get className() {
    return "KeyboardComponent";
  }

  /** @private */
  static playEvent(e) {
    var evt = document.createEvent("KeyboardEvent");
    evt.initKeyEvent(e.type, true, false, null, e.ctrlKey, false, e.shiftKey, false, e.keyCode, 0);
    RenderEngine.defaultContext.surface.dispatchEvent(evt);
  }

  /** @private */
  _keyDownListener(eventObj) {
    this.record(eventObj, KeyboardComponent.RECORD_PART);
    return this.gameObject.triggerEvent("keydown", eventObj, [eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey]);
  }

  /** @private */
  _keyUpListener(eventObj) {
    this.record(eventObj, KeyboardComponent.RECORD_PART);
    return this.gameObject.triggerEvent("keyup", eventObj, [eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey]);
  }

  /** @private */
  _keyPressListener(eventObj) {
    this.record(eventObj, KeyboardComponent.RECORD_PART);
    return this.gameObject.triggerEvent("keypress", eventObj, [eventObj.which, eventObj.keyCode, eventObj.ctrlKey, eventObj.altKey, eventObj.shiftKey]);
  }

}

