/**
 * The Render Engine
 * MouseInputComponent
 *
 * @fileoverview An extension of the input component which handles
 *               mouse input.
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
   "class": "R.components.input.Mouse",
   "requires": [
      "R.components.Input",
      "R.engine.Events",
      "R.lang.Timeout",
      "R.math.Point2D",
      "R.math.Vector2D",
      "R.math.Math2D"
   ]
});

/**
 * @class A component which responds to mouse events and notifies
 * the host object when one of the events occurs.  The <tt>R.engine.GameObject</tt> should
 * add event handlers for any of the following:
 * <ul>
 * <li><tt>mouseover</tt> - The mouse moved over the host object, or the object moved under the mouse</li>
 * <li><tt>mouseout</tt> - The mouse moved out of the host object (after being over it)</li>
 * <li><tt>mousedown</tt> - A mouse button was depressed, while over the object</li>
 * <li><tt>mouseup</tt> - A mouse button was released</li>
 * <li><tt>mousemove</tt> - The mouse was moved</li>
 * </ul>
 * Each event is passed a {@link R.struct.MouseInfo MouseInfo} object which contains information about
 * the mouse event. Objects which wish to be notified via the <tt>mouseover</tt> event handler will need
 * to define their bounding box.
 * <p/>
 * <i>Note: The rendering context that the object is contained within needs to enable mouse event
 * capturing with the {@link R.rendercontexts.AbstractRenderContext#captureMouse} method.</i>
 *
 * @param name {String} The unique name of the component.
 * @param priority {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create a mouse input component.
 */
R.components.input.Mouse = function() {
   return R.components.Input.extend(/** @scope R.components.input.Mouse.prototype */{

      /**
       * @private
       */
      constructor: function(name, priority) {
         this.base(name, priority);
      },

      /**
       * Destroy the component.
       */
      destroy: function() {
         if (this.getGameObject()) {
            delete this.getGameObject().getObjectDataModel()[R.components.input.Mouse.MOUSE_DATA_MODEL];
         }
         this.base();
      },

      /**
       * Deprecated in favor of {@link #setGameObject}
       * @deprecated
       */
      setHostObject: function(hostobj) {
         this.setGameObject(hostobj);
      },

      /**
       * Set the game object this component exists within.  Additionally, this component
       * sets some readable flags on the game object and establishes (if not already set)
       * a mouse listener on the render context.
       *
       * @param gameObject {R.engine.GameObject} The object which hosts the component
       * @private
       */
      setGameObject: function(gameObject) {
         this.base(gameObject);

         // Set some flags we can check
         var dataModel = gameObject.setObjectDataModel(R.components.input.Mouse.MOUSE_DATA_MODEL, {
            mouseOver: false,
            mouseDown: false
         });
      },

      /**
       * Perform the checks on the mouse info object, and also perform
       * intersection tests to be able to call mouse events.
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context
       * @param time {Number} The current world time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      execute: function(renderContext, time, dt) {
         // Objects may be in motion.  If so, we need to call the mouse
         // methods for just such a case.
         var gameObject = this.getGameObject(),
               mouseInfo = renderContext.getMouseInfo(),
               bBox = gameObject.getWorldBox(),
               mouseOver = false,
               dataModel = gameObject.getObjectDataModel(R.components.input.Mouse.MOUSE_DATA_MODEL);

         if (mouseInfo && bBox) {
            mouseOver = R.math.Math2D.boxPointCollision(bBox, mouseInfo.position);
         }

         // Mouse position changed
         if (!mouseInfo.position.equals(mouseInfo.lastPosition)) {
            gameObject.triggerEvent("mousemove", [mouseInfo]);
         }

         // Mouse is over object
         if (mouseOver && !dataModel.mouseOver) {
            dataModel.mouseOver = true;
            gameObject.triggerEvent("mouseover", [mouseInfo]);
         }

         // Mouse was over object
         if (!mouseOver && dataModel.mouseOver === true) {
            dataModel.mouseOver = false;
            gameObject.triggerEvent("mouseout", [mouseInfo]);
         }

         // Whether the mouse is over the object or not, we'll still record that the
         // mouse button was pressed.
         if (!dataModel.mouseDown && (mouseInfo.button != R.engine.Events.MOUSE_NO_BUTTON)) {
            dataModel.mouseDown = true;

            // BAF: 06/17/2011 - https://github.com/bfattori/TheRenderEngine/issues/8
            // Mouse down can only be triggered if the mouse went down while over the object
            if (mouseOver) {
               gameObject.triggerEvent("mousedown", [mouseInfo]);
            }
         }

         // Mouse button released (and mouse was down)
         if (dataModel.mouseDown && (mouseInfo.button == R.engine.Events.MOUSE_NO_BUTTON)) {
            dataModel.mouseDown = false;
            gameObject.triggerEvent("mouseup", [mouseInfo]);
         }
      }
      
   }, /** @scope R.components.input.Mouse.prototype */{
      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.input.Mouse"
       */
      getClassName: function() {
         return "R.components.input.Mouse";
      },

      /**
       * @private
       */
      MOUSE_DATA_MODEL: "MouseInputComponent"
   });
};