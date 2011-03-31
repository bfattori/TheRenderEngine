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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.lang.AbstractTimer",
	"requires": [
		"R.engine.BaseObject"
	]
});

/**
 * @class The base abstract class for all timer objects.
 *
 * @param name {String} The name of the timer
 * @param interval {Number} The interval for the timer, in milliseconds
 * @param callback {Function} The function to call when the interval is reached
 *
 * @extends R.engine.BaseObject
 * @constructor
 * @description Create a timer object
 */
R.lang.AbstractTimer = function(){
	return R.engine.BaseObject.extend(/** @scope R.lang.AbstractTimer.prototype */{
	
		timer: null,
		
		running: false,
		paused: false,
		timerFn: null,
		
		/**
		 * @private
		 */
		constructor: function(name, interval, callback){
			callback = name instanceof Number ? interval : callback;
			interval = name instanceof Number ? name : interval;
			name = name instanceof Number ? "Timer" : name;
			
			Assert((typeof callback == "function"), "Callback must be a function in Timer");
			
			this.base(name);
			this.interval = interval;
			this.callback = callback;
			this.timerFn = null;
			
			// The engine needs to know about this timer
			R.Engine.addTimer(this.getId(), this);
			
			this.restart();
		},
		
		/**
		 * Releast the timer instance back into the pool
		 */
		release: function(){
			this.base();
			this.timer = null;
			this.running = false;
			this.paused = false;
		},
		
		/**
		 * Stop the timer and remove it from the system
		 */
		destroy: function(){
			// The engine needs to remove this timer
			R.Engine.removeTimer(this.getId());
			
			this.timer = null;
			this.base();
		},
		
		/**
		 * Get the underlying system timer object.
		 * @return {Object}
		 */
		getTimer: function(){
			return this.timer;
		},
		
		/**
		 * Set the underlying system timer object.
		 *
		 * @param timer {Object} The timer object
		 */
		setTimer: function(timer){
			this.timer = timer;
		},
		
		/**
		 * Returns <tt>true</tt> if the timer is currently running.
		 * @return {Boolean} <tt>true</tt> if the timer is running
		 */
		isRunning: function(){
			return this.running;
		},
		
		/**
		 * Cancel the timer.
		 */
		cancel: function(){
			this.timer = null;
			this.running = false;
		},
		
		/**
		 * Pause the timer.  In the case where a timer was already processing,
		 * a restart would begin the timing process again with the full time
		 * allocated to the timer.  In the case of multi-timers (ones that retrigger
		 * a callback, or restart automatically a number of times) only the remaining
		 * iterations will be processed.
		 */
		pause: function(){
			this.cancel();
			this.paused = true;
		},
		
		/**
		 * Cancel the running timer and restart it.
		 */
		restart: function(){
			this.cancel();
			this.running = true;
			this.paused = false;
		},
		
		/**
		 * Set the callback function for this timer.  If the timer is
		 * currently running, it will be restarted.
		 *
		 * @param callback {Function} A function object to call
		 */
		setCallback: function(callback){
			Assert((typeof callback == "function"), "Callback must be a function in Timer.setCallback");
			this.callback = callback;
			this.timerFn = null;
			if (this.isRunning) {
				this.restart();
			}
		},
		
		/**
		 * Get the callback function for this timer.  When the callback is called,
		 * the scope of the function will be the {@link Timer} itself.
		 * @return {Function} The callback function
		 */
		getCallback: function(){
			if (this.timerFn === null) {
				this.timerFn = function(){
					arguments.callee.cb.call(arguments.callee.timer);
				};
				this.timerFn.cb = this.callback;
				this.timerFn.timer = this;
			}
			return this.timerFn;
		},
		
		/**
		 * Set the interval of this timer.  If the timer is running, it
		 * will be cancelled.
		 *
		 * @param interval {Number} The interval of this timer, in milliseconds
		 */
		setInterval: function(interval){
			this.cancel();
			this.interval = interval;
		},
		
		/**
		 * Get the interval of this timer, in milliseconds.
		 * @return {Number} The interval
		 */
		getInterval: function(){
			return this.interval;
		}
	}, /** @scope R.lang.AbstractTimer.prototype */ {
		/**
		 * Get the class name of this object
		 * @return {String} "R.lang.AbstractTimer"
		 */
		getClassName: function(){
			return "R.lang.AbstractTimer";
		}
	});
	
}