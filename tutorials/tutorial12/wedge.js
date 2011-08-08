/**
 * The Render Engine
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
   "class": "Wedge",
   "requires": [
      "R.components.render.Vector2D",
      "R.objects.PhysicsActor",
      "R.math.Math2D"
   ]
});

/**
 * @class A rigid body, represented as a triangular wedge.
 *
 * @extends R.objects.PhysicsActor
 * @constructor
 */
var Wedge = function() {
   return R.objects.PhysicsActor.extend(/** @scope Wedge.prototype */{

      /**
       * @private
       */
      constructor: function(pos) {
         this.base("Wedge");

         // The simulation is used to update the position and rotation
         // of the rigid body.  Whereas the render context is used to
         // represent (draw) the shape.
         this.setSimulation(Tutorial12.getSimulation());

         // Create the rigid body component which will simulate the wedge.
         var shape = [R.math.Point2D.create(0,0),
                      R.math.Point2D.create(150, 80),
                      R.math.Point2D.create(0, 80)];

         this.add(R.components.physics.PolyBody.create("physics", shape));

         // Set the friction and bounciness of the box
         this.getComponent("physics").setFriction(0.2);
         this.getComponent("physics").setRestitution(0.01);
         this.getComponent("physics").setDensity(1);

         // Add the component which the physics component will use to
         // render the object to the context
         this.getComponent("physics").setRenderComponent(R.components.render.Vector2D.create("draw"));
         this.setRootBody(this.getComponent("physics"));

         // Set the starting position of the box
         this.setPosition(pos);

         // Set the shape of the object
         this.setShape(shape);
      },

      /**
       * Set the shape used by the draw component.
       */
      setShape: function(shape) {
         var draw = this.getComponent("physics").getRenderComponent();
         this.setOrigin(R.math.Point2D.create(0,0));
         draw.setPoints(shape);
         draw.setFillStyle("#0000ff");
         draw.setLineWidth(2);
      }

   }, /** @scope Wedge.prototype */{ // Static

      /**
       * Get the class name of this object
       * @return {String} The string <tt>Wedge</tt>
       */
      getClassName: function() {
         return "Wedge";
      }
   });
};