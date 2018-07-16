/**
 * The Render Engine
 * IntervalTimer
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An extension of {@link AbstractTimer} that wraps the <tt>window.setInterval</tt> method.
 * @param name {String} The name of the timer
 * @param interval {Number} The interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the interval is reached
 * @extends AbstractTimer
 * @constructor
 * @description Create an interval timer
 */
class IntervalTimer extends AbstractTimer {

  /**
   * Get the class name of this object
   * @return {String} "R.lang.IntervalTimer"
   */
  get className() {
    return "IntervalTimer";
  }

  /**
   * Cancel this interval timer.
   */
  cancel() {
    clearInterval(this.timer);
    super.cancel();
  }

  /**
   * Cancel and destroy the interval timer.
   */
  destroy() {
    this.cancel();
    super.destroy();
  }

  /**
   * Restart this interval timer.
   */
  restart() {
    this.timer = setInterval(this.callback, this.interval);
  }
}
