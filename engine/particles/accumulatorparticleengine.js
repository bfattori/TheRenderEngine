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
    "class":"R.particles.AccumulatorParticleEngine",
    "requires":[
        "R.particles.ParticleEngine",
        "R.struct.Container",
        "R.rendercontexts.CanvasContext",
        "R.util.RenderUtil"
    ]
});

/**
 * @class An updated particle engine with an accumulator buffer so that
 *        effects such as bloom, glow, and tail can be achieved.  A note
 *        of caution, using the accumulator particle engine <em>will be
 *        slower</em> compared with the basic particle engine.
 *        <p/>
 *        Because of the effect used by the accumulator particle engine,
 *        background imagery will be darkened slightly.
 *
 * @extends R.particles.ParticleEngine
 * @constructor
 * @description Create a particle engine
 */
R.particles.AccumulatorParticleEngine = function () {
    return R.particles.ParticleEngine.extend(/** @scope R.particles.AccumulatorParticleEngine.prototype */{

        accumulator:null, // The accumulated frame
        fadeRate:0, // The rate at which particles fade out
        blur:false,
        radius:1,
        hasBackground:false,

        /** @private */
        constructor:function (fadeRate) {
            this.base("AccumulatorParticleEngine");
            this.accumulator = null;
            this.fadeRate = fadeRate || 0.5;
            this.blur = false;
            this.radius = 1;
            this.hasBackground = false;
        },

        /**
         * Destroy the particle engine
         */
        destroy:function () {
            this.accumulator.destroy();
            this.base();
        },

        /**
         * Releases the particle engine back into the pool.
         */
        release:function () {
            this.base();
            this.accumulator = null;
            this.fadeRate = 0;
            this.blur = false;
            this.radius = 1;
            this.hasBackground = false;
        },

        /**
         * Set the rate at which the particles fade out
         * @param fadeRate {Number} A value between 0 and 1
         */
        setFadeRate:function (fadeRate) {
            this.fadeRate = fadeRate;
            this.accumulator = null;
        },

        /**
         * Enable blurring of the particles in the accumulator
         * @param state {Boolean} <code>true</code> to enable (default: false)
         */
        setBlur:function (state) {
            this.blur = state;
        },

        /**
         * Set the blurring radius around the pixel.  Higher numbers result in lower frame rates.
         * @param radius {Number} The radius of the blur (default: 1)
         */
        setBlurRadius:function (radius) {
            this.radius = radius;
        },

        /**
         * Set this value to <code>true</code> if the particle engine is atop a background image.
         * This will have the effect of slightly darkening the background image.  If the background
         * is solid black, you can set this to <code>false</code>.
         * @param state {Boolean} The background state
         */
        setBackgroundState:function (state) {
            this.hasBackground = state;
        },

        /**
         * Clear the accumulator
         */
        reset:function () {
            if (this.accumulator) {
                this.accumulator.reset();
            }
            this.base();
        },

        /**
         * Update the particles within the render context.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the particles will be rendered within.
         * @param time {Number} The global time within the engine.
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        update:function (renderContext, time, dt) {
            if (R.Engine.options.disableParticleEngine) {
                return;
            }

            // Is there an accumulator already?
            if (!this.accumulator) {
                // Create the accumulator buffer, at the size of the renderContext
                this.accumulator = R.rendercontexts.CanvasContext.create("APEContext",
                    renderContext.getViewport().w, renderContext.getViewport().h);
            }

            if (!this.blur) {
                // Fade the accumulator at a set rate
                this.accumulator.get2DContext().globalAlpha = this.fadeRate;
                this.accumulator.get2DContext().globalCompositeOperation = this.hasBackground ? "xor" : "source-atop";
                this.accumulator.setFillStyle("rgb(0,0,0)");
                this.accumulator.drawFilledRectangle(renderContext.getViewport());
                this.accumulator.get2DContext().globalCompositeOperation = "source-over";
            } else {
                var vp = R.math.Rectangle2D.create(renderContext.getViewport()),
                    ox = vp.x, oy = vp.y;
                this.accumulator.get2DContext().globalAlpha = 0.5;
                for (var y = -this.radius; y <= this.radius; y++) {
                    for (var x = -this.radius; x <= this.radius; x++) {
                        vp.y = oy + y;
                        vp.x = ox + x;
                        this.accumulator.drawImage(vp, this.accumulator.getSurface());
                    }
                }
                vp.destroy();
            }

            this.accumulator.get2DContext().globalAlpha = 1.0;

            // Render particles to the accumulator
            this.base(this.accumulator, time, dt);

            // Render the contents of the accumulator to the render context
            renderContext.drawImage(renderContext.getViewport(), this.accumulator.getSurface());
        },

        /**
         * Get the properties object for the particle engine
         * @return {Object}
         */
        getProperties:function () {
            var self = this;
            var prop = this.base(self);
            return $.extend(prop, {
                "FadeRate":[function () {
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
        getClassName:function () {
            return "R.particles.AccumulatorParticleEngine";
        }
    });
};