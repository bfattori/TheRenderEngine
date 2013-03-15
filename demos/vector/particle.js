/**
 * The Render Engine
 * Example Game: Spaceroids - an Asteroids clone
 *
 * A simple particle
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

R.Engine.define({
   "class": "SimpleParticle",
   "requires": [
      "R.particles.effects.Explosion",
      "R.math.Math2D"
   ]
});

/**
 * @class A simple particle
 *
 * @param pos {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 */
var SimpleParticle = function() {
   return R.particles.effects.ExplosionParticle.extend(/** @scope SimpleParticle.prototype */{


      /**
       * Called by the particle engine to draw the particle to the rendering
       * context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      renderParticle: function(renderContext, time, dt) {
         var colr,rgba;
         if (!Spaceroids.isAttractMode) {
            var s = time - this.getBirth();
            var e = this.getTTL() - this.getBirth();
            colr = 255 - Math.floor(255 * (s / e));
            colr += (-10 + (Math.floor(R.lang.Math2.random() * 20)));
            var fb = (R.lang.Math2.random() * 100);
            if (fb > 90) {
               colr = 255;
            }

            if (R.lang.Math2.randomRange(0, 100, true) < 45) {
               // 45% chance to get some red particles in there
               rgba = "rgb(" + colr + ",0,0)";
            } else {
               rgba = "rgb(" + colr + "," + colr + "," + colr + ")";
            }
         } else {
            rgba = "rgb(255,255,255)";
         }

         renderContext.setFillStyle(rgba);
         renderContext.drawPoint(this.getPosition());
      }

   }, {
      getClassName: function() {
         return "SimpleParticle";
      }
   });
};

R.Engine.define({
   "class": "TrailParticle",
   "requires": [
      "R.particles.AbstractParticle",
      "R.math.Math2D"
   ]
});

/**
 * @class A simple particle
 *
 * @param pos {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 */
var TrailParticle = function() {
   return R.particles.AbstractParticle.extend(/** @scope TrailParticle.prototype */{

      velocityVector: null,
      clr: null,

      constructor: function(pos, rot, spread, color, ttl) {
         this.base(ttl || 2000);
         this.clr = color;
         this.setPosition(pos.x, pos.y);
         var a = rot + Math.floor((180 - (spread / 2)) + (R.lang.Math2.random() * (spread * 2)));

         if (this.velocityVector == null) {
            // Same as SimpleParticle to save cycles...
            this.velocityVector = R.math.Vector2D.create(0, 0);
         }

         R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, a, this.velocityVector);
         var vel = 1 + (R.lang.Math2.random() * 2);
         this.velocityVector.mul(vel);
      },

      release: function() {
         this.base();
         this.clr = null;
      },

      setColor: function(color) {
         this.clr = color;
      },

      /**
       * Called by the particle engine to draw the particle to the rendering
       * context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      draw: function(renderContext, time, dt) {
         this.getPosition().add(this.velocityVector);
         renderContext.setFillStyle(this.clr);
         renderContext.drawPoint(this.getPosition());
      }

   }, {
      getClassName: function() {
         return "TrailParticle";
      }
   });
};

R.Engine.define({
   "class": "RockTrailParticle",
   "requires": [
      "R.particles.AbstractParticle",
      "R.math.Math2D"
   ]
});

/**
 * @class A particle emitted by the asteroids
 */
var RockTrailParticle = function() {
   return R.particles.AbstractParticle.extend(/** @scope RockTrailParticle.prototype */{

      constructor: function(pos, ttl) {
         this.base(ttl || 2000);
         this.setPosition(pos);
      },

      release: function() {
         this.base();
         this.decay = 0;
      },

      /**
       * Called by the particle engine to draw the particle to the rendering
       * context.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      draw: function(renderContext, time, dt) {
         var colr,rgba;
         var s = time - this.getBirth();
         var e = this.getTTL() - this.getBirth();
         colr = 90 - Math.floor(90 * (s / e));
         colr += (-10 + (Math.floor(R.lang.Math2.random() * 20)));

         rgba = "rgb(" + colr + "," + colr + "," + colr + ")";

         renderContext.setFillStyle(rgba);
         renderContext.drawPoint(this.getPosition());
      }

   }, {
      getClassName: function() {
         return "RockTrailParticle";
      }
   });
};
