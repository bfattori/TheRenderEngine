/**
 * The Render Engine
 * ParticleEmitter component
 *
 * @fileoverview An extension of the render component which allows the
 *    developer to attach a particle emitter to a game object.
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
    "class":"R.components.render.ParticleEmitter",
    "requires":[
        "R.components.Render",
        "R.particles.Emitter",
        "R.math.Point2D"
    ]
});

/**
 * @class A {@link R.components.Render render component} that allows the developer
 *    to link a particle emitter to a game object.
 *
 * @param name {String} The name of the component
 * @param emitter {R.particles.Emitter} The particle emitter to use with the component
 * @param [priority=0.1] {Number} The render priority
 * @extends R.components.Render
 * @constructor
 * @description Creates a component which emits particles.
 */
R.components.render.ParticleEmitter = function () {
    "use strict";
    return R.components.Render.extend(/** @scope R.components.render.ParticleEmitter.prototype */{

        emitter:null,
        offset:null,

        /**
         * @private
         */
        constructor:function (name, emitter, priority) {
            this.base(name, priority);
            this.emitter = emitter;
            this.offset = R.math.Point2D.create(0, 0);
        },

        /**
         * Destroy the particle emitter component.
         */
        destroy:function () {
            this.offset.destroy();
            if (this.emitter) {
                this.emitter.destroy();
            }
            this.base();
        },

        /**
         * Releases the component back into the object pool. See {@link R.engine.PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.emitter = null;
            this.offset = null;
        },

        /**
         * Set the particle emitter object.
         * @param emitter {R.particles.Emitter} The particle emitter
         */
        setEmitter:function (emitter) {
            this.emitter = emitter;
        },

        /**
         * Get the particle emitter assigned to this component.
         * @return {R.particles.Emitter}
         */
        getEmitter:function () {
            return this.emitter;
        },

        /**
         * Set the active state of the particle emitter.
         * @param state {Boolean} <code>true</code> to set the emitter to generate particles
         */
        setActive:function (state) {
            this.emitter.setActive(state);
        },

        /**
         * Set the offset, from the rendering origin, where the particles are emitted
         * from.  This will default to the rendering origin.
         * @param ptOrX {Number|R.math.Point2D} The X offset, or a point
         * @param [y] {Number} The Y offset if <code>ptOrX</code> is a number
         */
        setOffset:function (ptOrX, y) {
            this.offset.set(ptOrX, y);
        },

        /**
         * Get the offset where the particles will be emitted, from the rendering origin.
         * @return {R.math.Point2D}
         */
        getOffset:function () {
            return this.offset;
        },

        /**
         * Emit particles to the render context.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render to
         * @param time {Number} The engine time in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        execute:function (renderContext, time, dt) {
            if (!this.base(renderContext, time, dt)) {
                return;
            }

            if (this.emitter) {
                this.transformOrigin(renderContext, true);
                this.emitter.emit(this.getOffset(), time, dt);
                this.transformOrigin(renderContext, false);
            }
        }
    }, /** @scope R.components.render.ParticleEmitter.prototype */{
        /**
         * Get the class name of this object
         * @return {String} "R.components.render.ParticleEmitter"
         */
        getClassName:function () {
            return "R.components.render.ParticleEmitter";
        }
    });
};
