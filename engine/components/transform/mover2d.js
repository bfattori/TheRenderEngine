/**
 * The Render Engine
 * Mover2DComponent
 *
 * @fileoverview An extension of the transform 2D component which adds physical
 *               movement properties such as mass, gravity, and velocity.
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
   "class": "R.components.transform.Mover2D",
   "requires": [
      "R.components.Transform2D",
      "R.engine.Events",
      "R.lang.Timeout",
      "R.math.Point2D",
      "R.math.Vector2D"
   ]
});

/**
 * @class A mover component that adds simplified physical transformations to an object.
 *        Properties include velocity, acceleration, mass, and gravity.
 *
 * @param name {String} The name of the component
 * @param priority {Number} The priority of this component between 0.0 and 1.0
 * @extends R.components.Transform2D
 * @constructor
 * @description Creates a 2d mover component
 */
R.components.transform.Mover2D = function() {
   return R.components.Transform2D.extend(/** @scope R.components.transform.Mover2D.prototype */{

      velocity: null,
      _nVel: null,
      vDecay: 0,
      angularVelocity: 0,
      lPos: null,
      maxVelocity: 0,
      acceleration: null,
      gravity: null,
      mass: null,
      atRest: null,
      checkRest: null,
      restingVelocity: null,
      lagAdjustment: null,
      checkLag: null,
      _vec: null,
      firstFrame: false,

      /**
       * @private
       */
      constructor: function(name, priority) {
         this.base(name, priority || 1.0);
         this.velocity = R.math.Vector2D.create(0, 0);
         this.angularVelocity = 0;
         this._nVel = R.math.Vector2D.create(0, 0);
         this.acceleration = R.math.Vector2D.create(0, 0);
         this.lPos = R.math.Point2D.create(0, 0);
         this.vDecay = 0;
         this.maxVelocity = -1;
         this.gravity = R.math.Vector2D.create(0, 0);
         this.atRest = false;
         this.checkRest = true;
         this.mass = 1;
         this.restingVelocity = R.components.transform.Mover2D.DEFAULT_RESTING_VELOCITY;
         this.lagAdjustment = R.components.transform.Mover2D.DEFAULT_LAG_ADJUSTMENT;
         this.checkLag = true;
         this.firstFrame = true;

         // Temp vector to use in calcs
         this._vec = R.math.Vector2D.create(0, 0);
      },

      /**
       * Destroys the component instance
       */
      destroy: function() {
         this.velocity.destroy();
         this._nVel.destroy();
         this.acceleration.destroy();
         this.lPos.destroy();
         this.gravity.destroy();
         this._vec.destroy();
         this.base();
      },

      /**
       * Releases the component back into the object pool. See {@link R.engine.PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.velocity = null;
         this._nVel = null;
         this.vDecay = 0;
         this.angularVelocity = 0;
         this.lPos = null;
         this.maxVelocity = -1;
         this.acceleration = null;
         this.gravity = null;
         this.atRest = null;
         this.checkRest = null;
         this.mass = null;
         this.restingVelocity = null;
         this.lagAdjustment = null;
         this.checkLag = null;
         this._vec = null;
         this.firstFrame = true;
      },

      /**
       * Updates the transformation of the component, setting the
       * position and rotation based on the time that has elapsed since
       * the last update.  This component handles frame rate independent
       * updates so that lag between frames doesn't affect the relative
       * position or rotation.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context for the component
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      execute: function(renderContext, time, dt) {
         if (!this.isResting()) {
            this.lPos.set(this.getPosition());
            var rot = this.getRotation();

            // If we've just come into the world, we can short circuit with a
            // quick addition of the velocity.
            if (this.firstFrame) {
               this.setPosition(this.lPos.add(this.velocity).add(this.acceleration).add(this.gravity));
               this.setRotation(rot);
            } else {
               if (this.getVelocityDecay() != 0 && this.velocity.len() > 0) {
                  // We need to decay the velocity by the amount
                  // specified until velocity is zero, or less than zero
                  this._vec.set(this.velocity).neg();
                  this._vec.mul(this.getVelocityDecay());
                  this.velocity.add(this._vec);
               }

               // Adjust the step value for lagging frame rates
               this._vec.set(this.velocity.add(this.acceleration).add(this.gravity));
               this._vec.mul(dt / R.Engine.fpsClock);

               if (this.maxVelocity != -1 && this._vec.len() > this.maxVelocity) {
                  this._vec.normalize().mul(this.maxVelocity);
               }

               this.setPosition(this.lPos.add(this._vec));

               // TODO: Actually implement angular velocity per time step
               var angVel = this.angularVelocity * (dt / R.Engine.fpsClock);
               this.setRotation(rot + angVel);
            }

            // Check rest state
            if (this.getCheckRestState()) {
               if (this.getVelocity().len() < this.getRestingVelocity()) {
                  this.setVelocity(R.math.Vector2D.ZERO);
                  this.atRest = true;
               }
            }
         }

         this.firstFrame = false;
         this.base(renderContext, time, dt);
      },

      /**
       * Setting this to <tt>true</tt> will enable a check for time lag and adjust
       * calculations by a specified factor.
       *
       * @param state {Boolean} <tt>true</tt> to check for lag
       */
      setCheckLag: function(state) {
         this.checkLag = state;
      },

      /**
       * Returns <tt>true</tt> if calculations should determine time lag and adjust.
       * @return {Boolean}
       */
      isCheckLag: function() {
         return this.checkLag;
      },

      /**
       * Sets the value by which calculations will be adjusted for time lag.
       *
       * @param lagAdj {Number} The adjustment value
       */
      setLagAdjustment: function(lagAdj) {
         if (lagAdj != 0) {
            this.lagAdjustment = lagAdj;
         }
      },

      /**
       * Get the value by which calculations are adjusted for time lag.
       * @return {Number} The adjustment value
       */
      getLagAdjustment: function() {
         return this.lagAdjustment;
      },

      /**
       * Set the velocity vector of the component.
       *
       * @param vector {Number|R.math.Vector2D} The velocity vector, or the X velocity
       * @param [y] {Number} If <tt>vector</tt> is a number, this is the Y velocity
       */
      setVelocity: function(vector, y) {
         this.velocity.set(vector, y);
         if (!this.velocity.isZero()) {
            this.atRest = false;
         }
      },

      /**
       * Returns the velocity vector of the component
       * @return {R.math.Vector2D}
       */
      getVelocity: function() {
         return this.velocity;
      },

      /**
       * Returns <tt>true</tt> if the component is in a resting state.
       * @return {Boolean}
       */
      isResting: function() {
         return this.atRest;
      },

      /**
       * Setting this to <tt>true</tt> will stop further movement calculations
       * from occuring.  Marks the object as being "at rest".
       *
       * @param state {Boolean} <tt>true</tt> to stop movement
       */
      setResting: function(state) {
         this.atRest = state;
      },

      /**
       * Get the magnitude at which velocity is determined to be close enough to
       * zero to be "at rest".
       * @return {Number} The resting velocity magnitude
       */
      getRestingVelocity: function() {
         return this.restingVelocity;
      },

      /**
       * Set the magnitude of velocity which determines if the object is "at rest".
       *
       * @param mag {Number} The velocity magnitude which is "at rest"
       */
      setRestingVelocity: function(mag) {
         this.restingVelocity = mag;
      },

      /**
       * If set to <tt>true</tt>, the component will check to see if the
       * velocity magnitude has dropped below a defined rate.  When the
       * velocity magnitude drops below the set rate, the object will be
       * marked as "at rest" and no calculations will be made until the
       * object is set into motion again.
       *
       * @param state {Boolean} <tt>true</tt> to check to see if the velocity
       *                        has reached a "resting state".
       */
      setCheckRestState: function(state) {
         this.checkRest = state;
         if (this.isResting() && !state) {
            this.setResting(false);
         }
      },

      /**
       * Determine if the component should check to see if the velocity has
       * dropped below a level which would indicate "at rest".
       * @return {Boolean} <tt>true</tt> if the component will check for the "resting state"
       */
      getCheckRestState: function() {
         return this.checkRest;
      },

      /**
       * Set the acceleration vector.  Acceleration will be constantly applied to
       * the last position.
       *
       * @param vector {Number|R.math.Vector2D} The acceleration vector, or acceleration along X
       * @param [y] {Number} If <tt>vector</tt> is a number, the acceleration along Y
       */
      setAcceleration: function(vector, y) {
         this.acceleration.set(vector, y);
         this.atRest = false;
      },

      /**
       * Get the acceleration vector.
       * @return {R.math.Vector2D} The acceleration vector
       */
      getAcceleration: function() {
         return this.acceleration;
      },

      /**
       * Set the vector of gravity.
       * @param vector {Number|R.math.Vector2D} The gravity vector, or gravity along X
       * @param [y] {Number} If <tt>vector</tt> is a number, the gravity along Y
       */
      setGravity: function(vector, y) {
         this.gravity.set(vector, y);
         this.atRest = false;
      },

      /**
       * Get the gravity vector
       * @return {R.math.Vector2D} The gravity vector
       */
      getGravity: function() {
         return this.gravity;
      },

      /**
       * Set the mass of the object which can be subsequently used in
       * calculations like friction and energy transfer.
       *
       * @param mass {Number} The mass of the object
       */
      setMass: function(mass) {
         this.mass = mass;
      },

      /**
       * Get the mass of the object.
       * @return {Number} The mass of the object
       */
      getMass: function() {
         return this.mass;
      },

      /**
       * Set the maximum velocity.  Setting this value to <tt>zero</tt> indicates that
       * there is no maximum velocity.
       * @param maxVel {Number} The maximum velocity
       */
      setMaxVelocity: function(maxVel) {
         this.maxVelocity = maxVel;
      },

      /**
       * Get the maximum velocity.
       * @return {Number} The maximum velocity
       */
      getMaxVelocity: function() {
         return this.maxVelocity;
      },

      /**
       * Set the decay rate at which the velocity will approach zero.
       * You can use this value to cause a moving object to eventually
       * stop moving. (e.g. friction)
       *
       * @param decay {Number} The rate at which velocity decays
       */
      setVelocityDecay: function(decay) {
         this.vDecay = decay;
      },

      /**
       * Get the rate at which velocity will decay to zero.
       * @return {Number} The velocity decay rate
       */
      getVelocityDecay: function() {
         return this.vDecay;
      },

      /**
       * Set the angular velocity.
       * @param angularVelocity {Number} The angle of change
       */
      setAngularVelocity: function(angularVelocity) {
         this.angularVelocity = angularVelocity;
      },

      /**
       * Returns the angular velocity.
       * @return {Number}
       */
      getAngularVelocity: function() {
         return this.angularVelocity;
      }
   }, /** @scope R.components.transform.Mover2D.prototype */{
      /**
       * Get the class name of this object
       * @return {String} "R.components.transform.Mover2D"
       */
      getClassName: function() {
         return "R.components.transform.Mover2D";
      },

      /**
       * The default velocity magnitude considered to be "at rest"
       * @type {Number}
       */
      DEFAULT_RESTING_VELOCITY: 0.2,

      /**
       * The default adjustment made to calculations when a lag occurs between the last time
       * the component was updated and the current time.
       * @type {Number}
       */
      DEFAULT_LAG_ADJUSTMENT: 0.01
   });
};