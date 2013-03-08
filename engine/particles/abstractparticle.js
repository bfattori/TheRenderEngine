/**
 * The Render Engine
 * AbstractParticle
 *
 * @fileoverview The particle engine and base particle class.
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
    "class":"R.particles.AbstractParticle",
    "requires":[
        "R.engine.PooledObject",
        "R.math.Point2D"
    ]
});

/**
 * @class Base particle class.  A particle only needs to implement the
 *        <tt>draw()</tt> method. The remainder of the functionality is
 *        handled by this abstract class.
 *
 * @param lifetime {Number} The life of the particle, in milliseconds
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a particle
 */
R.particles.AbstractParticle = function () {
    return R.engine.PooledObject.extend(/** @scope R.particles.AbstractParticle.prototype */{

        life:0,
        engine:null,
        birth:0,
        dead:false,
        pos:null,

        /** @private */
        constructor:function (lifetime) {
            this.base("Particle");
            this.life = lifetime;
            this.birth = 0;
            this.dead = false;

            if (this.pos == null) {
                // Once a particle has been created, then returned to the pool,
                // this point will still exist.  Instead of creating a new point
                // we'll reuse it for the life of the engine.
                this.pos = R.math.Point2D.create(0, 0);
            }
        },

        /**
         * Destroy the particle
         */
        destroy:function () {
            this.base();
        },

        /**
         * Release the particle back into the pool.
         */
        release:function () {
            this.base();
            this.life = 0;
            this.engine = null;
            this.birth = 0;
            this.dead = true;
        },

        /**
         * Initializes the particle within the <tt>R.particles.ParticleEngine</tt>
         * @param pEngine {R.particles.ParticleEngine} The particle engine which owns the particle
         * @param time {Number} The world time when the particle was created
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         * @private
         */
        init:function (pEngine, time, dt) {
            this.engine = pEngine;
            this.life += time;
            this.birth = time;
            this.dead = false;
        },

        /**
         * Get the current position of the particle
         * @return {R.math.Point2D}
         */
        getPosition:function () {
            return this.pos;
        },

        /**
         * Set the X and Y world coordinates of the particle
         * @param x {R.math.Point2D|Number} A {@link R.math.Point2D}, or the X world coordinate
         * @param y {Number} Y world coordinate
         */
        setPosition:function (x, y) {
            this.pos.set(x, y);
        },

        /**
         * Update the particle in the render context, calling its draw method.
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context where the particle is drawn
         * @param time {Number} The world time, in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        update:function (renderContext, time, dt) {
            if (time < this.life &&
                renderContext.getViewport().containsPoint(this.getPosition())) {
                // if the particle is still alive, and it isn't outside the viewport
                this.draw(renderContext, time, dt);
                return true;
            }
            else {
                return false;
            }
        },

        /**
         * Get the time-to-live for the particle (when it will expire)
         * @return {Number} milliseconds
         */
        getTTL:function () {
            return this.life;
        },

        /**
         * Get the time at which the particle was created
         * @return {Number} milliseconds
         */
        getBirth:function () {
            return this.birth;
        },


        /**
         * [ABSTRACT] Draw the particle
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render the particle to
         * @param time {Number} The world time, in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        draw:function (renderContext, time, dt) {
            // ABSTRACT
        }

    }, /** @scope R.particles.AbstractParticle.prototype */ {
        /**
         * Get the class name of this object
         *
         * @return {String} "R.particles.AbstractParticle"
         */
        getClassName:function () {
            return "R.particles.AbstractParticle";
        }
    });

}