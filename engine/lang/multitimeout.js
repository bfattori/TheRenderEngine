/**
 * The Render Engine
 * MultiTimeout
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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

