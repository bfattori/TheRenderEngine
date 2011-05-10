/**
 * The Render Engine
 * AccumulatorParticleEngine
 *
 * @fileoverview An extension to the standard particle engine which accumulates and
 *    fades out particles for a more dramatic effect.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1571 $
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
   "class": "R.particles.AccumulatorParticleEngine",
   "requires": [
      "R.particles.ParticleEngine",
      "R.struct.Container",
      "R.rendercontexts.CanvasContext"
   ]
});

/**
 * @class An updated particle engine with an accumulator buffer so that
 *        effects such as bloom, glow, and tail can be achieved.  A note
 *        of caution, using the accumulator particle engine <em>will be
 *        slow</em> compared with the basic particle engine.
 *
 * @extends R.engine.BaseObject
 * @constructor
 * @description Create a particle engine
 */
R.particles.AccumulatorParticleEngine = function() {
   return R.particles.ParticleEngine.extend(/** @scope R.particles.AccumulatorParticleEngine.prototype */{

      accumulator: null,      // The accumulated frame
      fadeRate: 0,             // The rate at which particles fade out

      /** @private */
      constructor: function(fadeRate) {
         this.base("AccumulatorParticleEngine");
         this.accumulator = null;
         this.fadeRate = fadeRate || 0.5;
      },

      /**
       * Destroy the particle engine
       */
      destroy: function() {
         this.base();
      },

      /**
       * Releases the particle engine back into the pool.
       */
      release: function() {
         this.base();
         this.accumulator = null;
         this.fadeRate = 0;
      },

      /**
       * Set the rate at which the particles fade out
       * @param fadeRate {Number} A value between 0 and 1
       */
      setFadeRate: function(fadeRate) {
         this.fadeRate = fadeRate;
         this.accumulator = null;
      },

      /**
       * Clear the accumulator
       */
      reset: function() {
         if (this.accumulator) {
            this.accumulator.reset();
         }
      },

      /**
       * Update the particles within the render context.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the particles will be rendered within.
       * @param time {Number} The global time within the engine.
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      update: function(renderContext, time, dt) {
         if (R.Engine.options.disableParticleEngine) {
            return;
         }

         // Is there an accumulator already?
         var vp = renderContext.getViewport();
         if (!this.accumulator) {
            // Create the accumulator buffer, at the size of the renderContext
            this.accumulator = R.rendercontexts.CanvasContext.create("APEContext", vp.w, vp.h);
         }

         // Fade the accumulator at a set rate
         this.accumulator.get2DContext().globalCompositeOperation = "source-atop";
         this.accumulator.setFillStyle("rgba(0,0,0," + this.fadeRate + ")");
         this.accumulator.drawFilledRectangle(vp);
         this.accumulator.get2DContext().globalCompositeOperation = "source-over";

         // Render particles to the accumulator
         this.base(this.accumulator, time, dt);

         // Render the contents of the accumulator to the render context
         renderContext.drawImage(vp, this.accumulator.getSurface());
      },

      /**
       * Get the properties object for the particle engine
       * @return {Object}
       */
      getProperties: function() {
         var self = this;
         var prop = this.base(self);
         return $.extend(prop, {
            "FadeRate" : [function() {
               return self.fadeRate;
            },
               null, false]
         });
      }


   }, /** @scope R.particles.AccumulatorParticleEngine.prototype */{
      /**
       * Get the class name of this object
       *
       * @return {String} "R.particles.AccumulatorParticleEngine"
       */
      getClassName: function() {
         return "R.particles.AccumulatorParticleEngine";
      }
   });
};