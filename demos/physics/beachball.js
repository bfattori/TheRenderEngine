/**
 * The Render Engine
 * A beachball toy
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
   "class": "BeachBall",
   "requires": [
      "R.components.physics.CircleBody",
      "R.components.collision.Box"
   ],

   "depends": [
      "Toy"
   ]
});

/**
 * @class A beachball toy to play with.  Uses the circle body to physically animate
 *          the toy object.
 *
 * @constructor
 * @extends Toy
 * @description Create a beachball toy
 */
var BeachBall = function() {
   return Toy.extend(/** @scope BeachBall.prototype */{

      size: 30,

      /**
       * @private
       */
      constructor: function() {
         this.base("beachball", "ball", "over");
      },

      /**
       * Create the physical body component and assign it to the
       * toy.
       *
       * @param componentName {String} The name to assign to the component.
       * @param scale {Number} A scalar scaling value for the toy
       */
      createPhysicalBody: function(componentName, scale) {
         this.size = 30;
         this.size *= scale;
         this.add(R.components.physics.CircleBody.create(componentName, this.size));

         // Set the friction and bounciness of the beachball
         this.getComponent(componentName).setFriction(0.2);
         this.getComponent(componentName).setRestitution(0.6);
         this.getComponent(componentName).setDensity(0.1);
      },

      createColliderComponent: function(componentName, collisionModel) {
         this.add(R.components.collision.Box.create(componentName, collisionModel));
      }


   }, /** @scope BeachBall.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>BeachBall</tt>
       */
      getClassName: function() {
         return "BeachBall";
      }
   });
};