/**
 * The Render Engine
 * OneShotTimeout
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An extension of {@link Timeout} which is a one-shot timer that cannot
 *        be restarted and will self-destroy after it completes its interval.  Within
 *        the callback, <tt>this</tt> refers to the <tt>Timer</tt> object itself.
 *
 * @param name {String} The name of the timer
 * @param interval {Number} The interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the interval is reached
 * @constructor
 * @extends Timeout
 * @description Create a one-shot timeout
 */
class OneShotTimeout extends Timeout {

  constructor(name, interval, callback) {

    var timerObj = {
      callback: callback,
      timer: this
    };

    var cb = function () {
      this.callback.call(this.timer);
      this.timer.destroy();
    }.bind(timerObj);

    super(name, interval, cb);
  }

  /**
   * Get the class name of this object
   * @return {String} "OneShotTimeout"
   */
  get className() {
    return "OneShotTimeout";
  }

  /**
   * This timer cannot be restarted.
   * @private
   */
  restart() {
    if (!this.paused && this.running) {
      return;
    }

    super.restart();
  }
}

