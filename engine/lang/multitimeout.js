/**
 * The Render Engine
 * MultiTimeout
 *
 * @fileoverview A multiple interval timeout timer which self-destroys.
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
 * @class An extension of {@link R.lang.Timeout} that will repeat the specified number of times before
 *        destroying itself.  The callback will be triggered with the
 *        repetition number as the only argument.  Within the callback, <tt>this</tt>
 *        refers to the <tt>Timer</tt> object itself.
 *
 * @param name {String} The name of the timer
 * @param reps {Number} The number of repetitions to restart the timer automatically
 * @param interval {Number} The interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the interval is reached
 * @extends R.lang.Timeout
 * @constructor
 * @description Creat a multi-timeout triggering timer
 */
class MultiTimeout extends Timeout {

  constructor(name, reps, interval, callback) {

    var timerObj = {
      callback: callback,
      repetitions: reps,
      totalReps: 0,
      timer: this
    };

    var cb = function () {
      if (this.repetitions-- > 0) {
        this.callback.call(this.timer, this.totalReps);
        this.totalReps++;
        this.timer.restart();
      }
      else {
        this.timer.destroy();
      }
    }.bind(timerObj);

    super(name, interval, cb);
  }

  /**
   * Get the class name of this object
   * @return {String} "MultiTimeout"
   */
  get className() {
    return "MultiTimeout";
  }


}

