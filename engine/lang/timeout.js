/**
 * The Render Engine
 * Timeout
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An extension of {@link AbstractTimer} that wraps the <tt>window.setTimeout</tt> method.
 *
 * @param name {String} The name of the timer
 * @param interval {Number} The interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the interval is reached
 * @extends AbstractTimer
 * @constructor
 * @description Create a timeout timer
 */
class Timeout extends AbstractTimer {

  /**
   * Get the class name of this object
   * @return {String} "R.lang.Timeout"
   */
  get className() {
    return "Timeout";
  }

  /**
   * Cancel this timeout timer.
   */
  cancel() {
    clearTimeout(this.timer);
    super.cancel();
  }

  /**
   * Cancel and destroy the timeout
   */
  destroy() {
    this.cancel();
    super.destroy();
  }

  /**
   * Restart this timeout timer
   */
  restart() {
    this.timer = setTimeout(this.callback, this.interval);
  }

}