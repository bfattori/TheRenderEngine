/**
 * The Render Engine
 * InputComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A component which can read an input device and make those inputs
 *        available to a {@link GameObject}.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The component's priority
 * @extends BaseComponent
 * @constructor
 * @description Create an input component.
 */
class InputComponent extends BaseComponent {

  /** @private */
  constructor(name, priority = 1.0) {
    super(name, BaseComponent.TYPE_INPUT, priority);
    this.inputOpts = {
      recording: false,
      playback: false,
      script: null,
      lastInputTime: 0
    };
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "InputComponent"
   */
  get className() {
    return "InputComponent";
  }

  /** @private */
  startRecording() {
    console.debug("RECORDING INPUT");
    this.inputOpts.recording = true;
    this.inputOpts.lastInputTime = RenderEngine.worldTime;
    this.inputOpts.script = [];
  }

  /** @private */
  stopRecording() {
    console.debug("RECORDING STOPPED");
    this.inputOpts.recording = false;
  }

  /** @private */
  get script() {
    return this.inputOpts.script;
  }

  /** @private */
  set script(script) {
    this.inputOpts.script = script;
  }

  /** @private */
  playEvent() {
  }

  /** @private */
  playScript(script) {
    this.inputOpts.recording = false;
    this.inputOpts.playback = true;
    this.script = script;

    var scriptObj = {
      script: script,
      playEvent: this.playEvent.bind(this),
      evt: null
    }, popCall;

    popCall = function () {
      if (this.script.length == 0) {
        return;
      }
      if (this.evt != null) {
        console.log("PLAYBACK:", this.evt.type);
        this.playEvent(this.evt);
      }
      this.evt = this.script.shift();
      setTimeout(popCall, this.evt.delay);
    }.bind(scriptObj);

    popCall();
  }

  /** @private */
  record(eventObj, parts, time, dt) {
    // TODO: Now with engine time and delta we should be able
    // to accurately record and playback demos
    if (!this.inputOpts.recording) {
      return;
    }
    var evtCall = {};
    for (var x in parts) {
      evtCall[parts[x]] = eventObj[parts[x]];
    }
    evtCall.delay = RenderEngine.worldTime - this.inputOpts.lastInputTime;
    this.inputOpts.lastInputTime = RenderEngine.worldTime;
    evtCall.type = eventObj.type;
    this.script.push(evtCall);
  }

}