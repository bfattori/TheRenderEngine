/**
 * The Render Engine
 * OneShotTrigger
 *
 * @fileoverview An single interval timer, with sub-intervals, which self-destroys.
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

