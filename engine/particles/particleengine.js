/**
 * The Render Engine
 * ParticleEngine
 *
 * @fileoverview The particle engine class.
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
    "class":"R.particles.ParticleEngine",
    "requires":[
        "R.engine.BaseObject",
        "R.struct.Container"
    ]
});

/**
 * @class The particle engine is a system for updating and expiring
 *        particles within a game environment.  This is registered with the
 *        render context so it will be updated at regular intervals.  The maximum
 *        number of supported particles can be configured, but defaults to 250.
 *        It is possible to run multiple particle engines within a render context.
 *        <p/>
 *        Particles should be simple objects which don't need to perform many
 *        calculations before being drawn.  All particles are rendered in world
 *        coordinates to speed up processing.
 *        <p/>
 *        A word of caution: <em>Using a particle engine will potentially slow down your frame
 *        rate depending on the amount of particles per frame.</em> While care has
 *        been taken to make the particle engine run as fast as possible, it is
 *        not uncommon to see a significant drop in frame rate when using a lot of
 *        particles.
 *        <p/>
 *        You can modify the maximum number of particles the engine will allow
 *        with the <code>R.Engine.options["maxParticles"]</code> setting.  Each
 *        browser has been tailored for the best performance, but this values
 *        can be changed in your game with either {@link #setMaximum} or by
 *        changing the engine option.
 *
 * @extends R.engine.BaseObject
 * @constructor
 * @description Create a particle engine
 */
R.particles.ParticleEngine = function () {
    return R.engine.BaseObject.extend(/** @scope R.particles.ParticleEngine.prototype */{

        particles:null,
        particleEffects: null,
        liveParticles:0,
        lastTime:0,
        maximum:0,
        force:0,

        /** @private */
        constructor:function () {
            this.base("ParticleEngine");
            this.particles = R.struct.Container.create();
            this.particleEffects = R.struct.Container.create();
            this.maximum = R.Engine.options["maxParticles"];
            this.liveParticles = 0;
        },

        /**
         * Destroy the particle engine and all contained particles
         */
        destroy:function () {
            this.reset();
            this.particles.destroy();
            this.particleEffects.destroy();
            this.base();
        },

        /**
         * Releases the particle engine back into the pool.
         */
        release:function () {
            this.base();
            this.particles = null;
            this.particleEffects = null;
            this.lastTime = 0;
            this.maximum = 0;
            this.liveParticles = 0;
        },

        /**
         * Add a group of particles at one time.  This reduces the number of calls
         * to {@link #addParticle} which resorts the array of particles each time.
         * @param particles {Array|R.struct.Container} A container of particles to add at one time
         */
        addParticles:function (particles) {
            if (R.isArray(particles)) {
                // If the particles are an Array, convert to a LinkedList first
                particles = R.struct.Container.fromArray(particles);
            }

            if (R.Engine.options.disableParticleEngine) {
                particles.destroy();
                return;
            }

            // If the new particles exceed the size of the engine's
            // maximum, truncate the remainder
            if (particles.size() > this.maximum) {
                var discard = particles.reduce(this.maximum);
                discard.cleanUp();
                discard.destroy();
            }

            // Initialize all of the new particles
            for (var i = particles.iterator(); i.hasNext();) {
                // TODO: Why this.lastTime??
                i.next().init(this, this.lastTime);
            }
            i.destroy();

            // The maximum number of particles to animate
            var total = this.liveParticles + particles.size();
            if (total > this.maximum) {
                total = this.maximum;
            }

            // If we can fit the entire set of particles without overflowing,
            // add all the particles and be done.
            if (particles.size() <= this.maximum - this.liveParticles) {
                this.particles.addAll(particles);
            } else {
                // There isn't enough space to put all of the particles into
                // the container.  So, we'll only add what we can.
                var maxLeft = this.maximum - total;
                var easySet = particles.subset(0, maxLeft);
                this.particles.addAll(easySet);
                easySet.destroy();
            }
            particles.destroy();
            this.liveParticles = this.particles.size();
        },

        /**
         * Add a single particle to the engine.  If many particles are being
         * added at one time, use {@link #addParticles} instead to add a
         * {@link R.struct.Container} of particles.
         *
         * @param particle {R.particles.AbstractParticle} A particle to animate
         */
        addParticle:function (particle) {
            if (R.Engine.options.disableParticleEngine) {
                particle.destroy();
                return;
            }

            if (this.particles.size() < this.maximum) {
                // TODO: Why this.lastTime?
                particle.init(this, this.lastTime);
                this.particles.add(particle);
                this.liveParticles = this.particles.size();
            } else {
                // nowhere to put it
                particle.destroy();
            }
        },

        /**
         * Set the absolute maximum number of particles the engine will allow.  The
         * engine is configured with a maximum number in <code>R.Engine.options["maxParticles"]</code>.
         * You can override this value using configurations also.
         *
         * @param maximum {Number} The maximum particles the particle engine allows
         */
        setMaximum:function (maximum) {
            var oldMax = this.maximum;
            this.maximum = maximum;

            // Kill off particles if the size is reduced
            if (this.maximum < oldMax) {
                var discard = this.particles.reduce(this.maximum);
                discard.cleanUp();
                discard.destroy();
            }
        },

        /**
         * Get the maximum number of particles allowed in the particle engine.
         * @return {Number}
         */
        getMaximum:function () {
            return this.maximum;
        },

        /**
         * Update a particle, removing it and nulling its reference
         * if it is dead.  Only live particles are updated
         * @private
         */
        runParticle:function (particle, renderContext, time, dt) {
            if (!particle.update(renderContext, time, dt)) {
                this.particles.remove(particle);
                particle.destroy();
            }
        },

        /**
         * Run a particle effect
         * @param particleEffect
         * @return {R.particles.Effect} The instance of the effect
         */
        addEffect: function(particleEffect) {
            this.particleEffects.add(particleEffect);
            return particleEffect;
        },

        /**
         * Update the particles within the render context, and for the specified time.
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

            this.lastTime = time;

            // Run all queued effects
            var dead = R.struct.Container.create();
            for (var effectItr = this.particleEffects.iterator(); effectItr.hasNext(); ) {
                var effect = effectItr.next();
                if (!effect.hasRun() || effect.getLifespan(dt) > 0) {
                    effect.runEffect(this, time, dt);
                } else {
                    // Dead effect - these are cleaned up later
                    dead.add(effect);
                }
            }

            R.debug.Metrics.add("particles", this.liveParticles, false, "#");

            // If there are no live particles, don't do anything
            if (this.liveParticles == 0) {
                return;
            }

            renderContext.pushTransform();

            for (var itr = this.particles.iterator(); itr.hasNext();) {
                this.runParticle(itr.next(), renderContext, time, dt);
            }
            itr.destroy();

            renderContext.popTransform();
            this.liveParticles = this.particles.size();

            // Remove dead effects
            for (var deadItr = dead.iterator(); deadItr.hasNext(); ) {
                var deadEffect = deadItr.next();
                this.particleEffects.remove(deadEffect);
            }
            dead.destroy();
        },

        /**
         * Get the properties object for the particle engine
         * @return {Object}
         */
        getProperties:function () {
            var self = this;
            var prop = this.base(self);
            return $.extend(prop, {
                "Particles":[function () {
                    return self.particles.size();
                },
                    null, false]
            });
        },

        /**
         * Reset the particle engine.  Destroys all active particles and effects.
         */
        reset: function() {
            this.particles.cleanUp();
            this.particleEffects.cleanUp();
        }

    }, /** @scope R.particles.ParticleEngine.prototype */{
        /**
         * Get the class name of this object
         *
         * @return {String} "R.particles.ParticleEngine"
         */
        getClassName:function () {
            return "R.particles.ParticleEngine";
        }
    });

};