/**
 * The Render Engine
 * OneShotTrigger
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An extension of {@link OneShotTimeout} which is a one-shot timer that triggers a callback,
 *        at regular intervals, until the timer has expired.  When the timer expires, the
 *        trigger will automatically destroy itself.  Within the callbacks, <tt>this</tt>
 *        refers to the <tt>Timer</tt> object itself.
 *
 * @param name {String} The name of the timer
 * @param interval {Number} The full interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the full interval is reached
 * @param triggerInterval {Number} The interval between triggers, in milliseconds
 * @param triggerCallback {Function} The function to call for each trigger interval
 * @extends OneShotTimeout
 * @constructor
 * @description Create a one-shot triggering timeout
 */
class OneShotTrigger extends OneShotTimeout {

  constructor(name, interval, callback, triggerInterval, triggerCallback) {
    var timerObj = {
      interval: IntervalTimer.create(name + "_trigger", triggerInterval, triggerCallback),
      callback: callback,
      timer: this
    };

    var doneFn = function () {
      this.interval.destroy();
      this.callback.call(this.timer);
    }.bind(timerObj);

    super(name, interval, doneFn);
  }

  /**
   * Get the class name of this object
   * @return {String} "OneShotTrigger"
   */
  get className() {
    return "OneShotTrigger";
  }

}

