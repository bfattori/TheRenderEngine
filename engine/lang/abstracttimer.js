/**
 * The Render Engine
 * AbstractTimer
 *
 * @fileoverview A collection of timer objects.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
"use strict";

/**
 * @class The base abstract class for all timer objects.
 *
 * @param name {String} The name of the timer
 * @param interval {Number} The interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the interval is reached
 *
 * @extends BaseObject
 * @constructor
 * @description Create a timer object
 */
class AbstractTimer extends BaseObject {

  constructor(name, interval, callback) {
    callback = name instanceof Number ? interval : callback;
    interval = name instanceof Number ? name : interval;
    name = name instanceof Number ? "Timer" : name;

    super(name);
    this._interval = interval;
    this._callback = callback;
    this._timerFn = null;
    this._timer = null;
    this._running = false;

    // The engine needs to know about this timer
    R.Engine.addTimer(this.getId(), this);

    this.restart();
  }

  /**
   * Releast the timer instance back into the pool
   */
  release() {
    super.release();
    this._timer = null;
    this._running = false;
    this.paused = false;
  }

  /**
   * Stop the timer and remove it from the system
   */
  destroy() {
    // The engine needs to remove this timer
    R.Engine.removeTimer(this.getId());

    this._timer = null;
    super.destroy();
  }

  /**
   * Get the class name of this object
   * @return {String} "R.lang.AbstractTimer"
   */
  get className() {
    return "AbstractTimer";
  }

  /**
   * Get the underlying system timer object.
   */
  get timer() {
    return this._timer;
  }

  /**
   * Set the underlying system timer object.
   */
  set timer(val) {
    this._timer = val;
  }

  /**
   * Returns <tt>true</tt> if the timer is currently running.
   * @return {Boolean} <tt>true</tt> if the timer is running
   */
  get running() {
    return this._running;
  }

  /**
   * Cancel the timer.
   */
  cancel() {
    this._timer = null;
    this._running = false;
  }

  /**
   * Pause the timer.  In the case where a timer was already processing,
   * a restart would begin the timing process again with the full time
   * allocated to the timer.  In the case of multi-timers (ones that retrigger
   * a callback, or restart automatically a number of times) only the remaining
   * iterations will be processed.
   */
  pause() {
    this.cancel();
    this.paused = true;
  }

  /**
   * Cancel the running timer and restart it.
   */
  restart() {
    this.cancel();
    this._running = true;
    this.paused = false;
  }

  /**
   * Set the callback function for this timer.  If the timer is
   * currently running, it will be restarted.
   *
   * @param callback {Function} A function object to call
   */
  set callback(callback) {
    this._callback = callback;
    this._timerFn = null;
    if (this._running) {
      this.restart();
    }
  }

  /**
   * Get the callback function for this timer.  When the callback is called,
   * the scope of the function will be the {@link AbstractTimer} itself.
   * @return {Function} The callback function
   */
  get callback() {
    if (this._timerFn === null) {
      var timerObj = {
        callback: this._callback,
        timer: this
      };
      this._timerFn = function () {
        this._callback.call(this.timer)
      }.bind(timerObj);

      this._timerFn.cb = this._callback;
      this._timerFn.timer = this;
    }
    return this._timerFn;
  }

  /**
   * Set the interval of this timer.  If the timer is running, it
   * will be cancelled.
   */
  set interval(val) {
    this.cancel();
    this._interval = val;
  }

  /**
   * Get the interval of this timer, in milliseconds.
   */
  get interval() {
    return this._interval;
  }
}