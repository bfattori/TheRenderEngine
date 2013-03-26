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
 * @class Base particle class.  A particle only needs to override the
 *        <tt>draw()</tt> method. The remainder of the functionality is
 *        handled by this abstract class.
 *
 * @param position {R.math.Point2D} The point at which the particle begins its life
 * @param lifetime {Number} The life of the particle, in milliseconds
 * @param [options] {Object} An options object which can contain the following:
 *      <ul>
 *          <li><tt>decay</tt> - The velocity decay rate per frame</li>
 *          <li><tt>velocity</tt> - The scalar velocity of the particle</li>
 *          <li><tt>angle</tt> - The degrees around the position at which to emit the particle</li>
 *          <li><tt>gravity</tt> - A {@link R.math.Vector2D} which indicates the gravity vector</li>
 *      </ul>
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
        options:null,
        inverseVelocity: null,
        velocityVector: null,

        /** @private */
        constructor:function (position, lifetime, options) {
            this.base("Particle");
            this.life = lifetime;
            this.birth = 0;
            this.dead = false;
            this.setPosition(position);

            // Handle options
            if (!this.options) {
                this.options = {};
            }
            this.options.decay = options.decay || 0;
            this.options.velocity = options.velocity || 1;
            this.options.angle = options.angle || 0;
            if (this.options.gravity == null) {
                this.options.gravity = R.math.Vector2D.create(0, 0);
            } else {
                this.options.gravity.set(0, 0);
            }

            if (options.gravity) {
                this.options.gravity.set(options.gravity);
            }

            if (this.inverseVelocity == null) {
                this.inverseVelocity = R.math.Vector2D.create(0, 0);
            } else {
                this.inverseVelocity.set(0, 0);
            }

            if (this.velocityVector == null) {
                this.velocityVector = R.math.Vector2D.create(0, 0);
            } else {
                this.velocityVector.set(0, 0);
            }

            R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, this.options.angle, this.velocityVector);
            this.velocityVector.mul(this.options.velocity);
        },

        /**
         * Destroy the particle
         */
        destroy:function () {
            this.base();
            this.pos.destroy();
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
            if (this.pos == null) {
                this.pos = R.math.Point2D.create(x, y);
            } else {
                this.pos.set(x, y);
            }
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
                this.move(renderContext, time, dt, this.life - time);
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
         * Move the particle.  May be overridden to allow different types of movement, rather than the standard
         * linear movement.
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render the particle to
         * @param time {Number} The world time, in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         * @param remainingTime {Number} The number of milliseconds left in the particle's life
         */
        move:function (renderContext, time, dt, remainingTime) {
            // Decay
            if (this.options.decay > 0 && this.velocityVector.len() > 0) {
                this.inverseVelocity.set(this.velocityVector).neg();
                this.inverseVelocity.mul(this.options.decay);
                this.velocityVector.add(this.inverseVelocity);
            }

            this.getPosition().add(this.velocityVector);
            this.draw(renderContext, time, dt, remainingTime);
        },

        /**
         * Draw a very basic particle.  Typically, this method would be overridden to handle
         * a more specific effect for a particle.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render the particle to
         * @param time {Number} The world time, in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         * @param remainingTime {Number} The number of milliseconds left in the particle's life
         */
        draw:function(renderContext, time, dt, remainingTime) {
            renderContext.setFillStyle("#fff");
            renderContext.drawPoint(this.getPosition());
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

};