/**
 * The Render Engine
 * IntervalTimer
 *
 * @fileoverview An interval timer which repeats until destroyed.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
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
