/**
 * The Render Engine
 * Emitter
 *
 * @fileoverview A particle emitter class
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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
	"class": "R.particles.Emitter",
	"requires": [
		"R.engine.PooledObject"
	]
});

/**
 * @class Particle emitter class.  A particle emitter emits particles at a regular
 *    interval as long as it is active.  The function that is passed to generate
 *    the particles will be called with three arguments: an offset position, the
 *    current world time, and the delta from when the last frame was drawn.  The function
 *    can either return a single particle or an <code>Array</code> of particles.
 *    Within the scope of the function, "this" refers to the {@link R.particles.Emitter}
 *    object.
 *
 * @param emitFunc {Function} A function that emits new particles.
 * @param interval {Number} The time between emissions
 * @param [active] {Boolean} A flag indicating whether the emitter should emit particles
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a particle emitter
 */
R.particles.Emitter = function(){
	return R.engine.PooledObject.extend(/** @scope R.particles.Emitter.prototype */{

		active: true,
		emitFn: null,
		interval: null,
      nextEmit: 0,
      engine: null,

		/** @private */
		constructor: function(emitFunc, interval, active){
			this.base("ParticleEmitter");
			this.emitFn = emitFunc;
			this.interval = interval;
         this.active = active === undefined ? true : active;
         this.nextEmit = 0;
         this.engine = null;
		},

		/**
		 * Release the particle back into the pool.
		 */
		release: function(){
			this.base();
			this.interval = null;
			this.emitFn = null;
			this.active = true;
         this.nextEmit = 0;
         this.engine = null;
		},

      /**
       * Set the active state of the particle emitter
       * @param state {Boolean} <code>true</code> to enable emission of particles, <code>false</code> to
       *    disable emission.
       */
      setActive: function(state) {
         this.active = state;
      },

      /**
       * Method to check if the emitter is active.
       * @return {Boolean}
       */
      isActive: function() {
         return this.active;
      },

      /**
       * Set the interval at which particles are emitted.
       * @param interval {Number} The number of milliseconds between emissions
       */
      setInterval: function(interval) {
         this.interval = interval;
      },

      /**
       * Return the interval at which particles are emitted.
       * @return {Number}
       */
      getInterval: function() {
         return this.interval;
      },

      /**
       * Set the particle engine the particle emitter should emit particles to.
       * @param particleEngine {R.particles.ParticleEngine}
       */
      setParticleEngine: function(particleEngine) {
         this.engine = particleEngine;
      },

		/**
		 * Emit a particle to the particle engine, if the emitter is active.
		 * @param offset {R.math.Point2D} Offset from the particle's position to render at
		 * @param time {Number} The world time, in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       * @private
		 */
		emit: function(offset, time, dt){
         if (this.active && time > this.nextEmit) {
            this.nextEmit = time + this.interval;
            var particles = this.emitFn.call(this, offset, time, dt);
            if (particles.length) {
               this.engine.addParticles(particles);
            } else {
               this.engine.addParticle(particles);
            }
         }
		}

	}, /** @scope R.particles.Emitter.prototype */ {
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.particles.Emitter"
		 */
		getClassName: function(){
			return "R.particles.Emitter";
		}
	});

}