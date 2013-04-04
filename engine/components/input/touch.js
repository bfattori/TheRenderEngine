/**
 * The Render Engine
 * KeyboardInputComponent
 *
 * @fileoverview An extension of the input component to handle touch inputs from
 *               devices which support them.
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
    "class":"R.components.input.Touch",
    "requires":[
        "R.components.Input",
        "R.engine.Events",
        "R.struct.Touch"
    ]
});

/**
 * @class A component which responds to touch events and notifies
 * its {@link R.engine.GameObject} by triggering one of three events.  The <tt>R.engine.GameObject</tt>
 * should add event handlers for any one of:
 * <ul>
 * <li><tt>touchstart</tt> - A touch event started</li>
 * <li><tt>touchend</tt> - A touch event ended</li>
 * <li><tt>touchmove</tt> - A movement occurred after a touch event started</li>
 * </ul>
 * Each event handler will be passed a {@link R.struct.TouchInfo TouchInfo} object which
 * contains information about the event.  The <tt>touchmove</tt> event is also passed a boolean
 * flag indicating if the touch is within the world bounding box of the game object.
 * <p/>
 * <i>Note: The rendering context that the object is contained within needs to enable touch event
 * capturing with the {@link R.rendercontexts.AbstractRenderContext#captureTouch} method.</i>
 *
 * @param name {String} The unique name of the component.
 * @param [priority] {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create an instance of a touch input component.
 */
R.components.input.Touch = function () {
    "use strict";
    return R.components.Input.extend(/** @scope R.components.input.Touch.prototype */{

        hasTouchMethods:null,

        /**
         * @private
         */
        constructor:function (name, passThru, priority) {
            this.base(name, priority);
        },

        /**
         * Destroy this instance and remove all references.
         */
        destroy:function () {
            if (this.getGameObject()) {
                delete this.getGameObject().getObjectDataModel()[R.components.input.Touch.TOUCH_DATA_MODEL];
            }
            this.base();
        },

        /**
         * Establishes the link between this component and its host object.
         * When you assign components to a host object, it will call this method
         * so that each component can refer to its host object, the same way
         * a host object can refer to a component with {@link R.engine.GameObject#getComponent}.
         *
         * @param gameObject {R.engine.GameObject} The object which hosts this component
         */
        setGameObject:function (gameObject) {
            this.base(gameObject);

            // Set some flags we can check
            var dataModel = gameObject.setObjectDataModel(R.components.input.Mouse.TOUCH_DATA_MODEL, {
                touchDown:false
            });

            // Add event pass-thru for DOM objects
            var el = gameObject.jQ();
            if (el) {
                var tI = R.struct.TouchInfo.create();

                // Wire up event handlers for the DOM element to mimic what is done for
                // canvas objects
                el.bind("touchmove", function (evt) {
                    tI.lastPosition.set(tI.position);
                    tI.position.set(evt.pageX, evt.pageY);
                    gameObject.triggerEvent("touchmove", [tI]);
                });

                el.bind("touchstart", function (evt) {
                    tI.touches = tI.processTouches(evt);
                    tI.button = R.engine.Events.MOUSE_LEFT_BUTTON;
                    tI.downPosition.set(evt.pageX, evt.pageY);
                    gameObject.triggerEvent("touchstart", [tI]);
                });

                el.bind("touchend", function (evt) {
                    tI.touches = tI.processTouches(evt);
                    tI.button = R.engine.Events.MOUSE_NO_BUTTON;
                    tI.dragVec.set(0, 0);
                    gameObject.triggerEvent("touchend", [tI]);
                });
            }

        },

        /**
         * Perform the checks on the touch info object, and also perform
         * intersection tests to be able to call touch events.
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context
         * @param time {Number} The current world time
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        execute:function (renderContext, time, dt) {
            // Objects may be in motion.  If so, we need to call the touch
            // methods for just such a case.
            var gameObject = this.getGameObject();


            // Only objects without an element will use this.  For object WITH an element,
            // this component will have intervened and wired up special handlers to fake
            // the mouseInfo object.
            if (!gameObject.getElement()) {
                var touchInfo = renderContext.getTouchInfo(),
                    bBox = gameObject.getWorldBox(),
                    touchOn = false,
                    dataModel = gameObject.getObjectDataModel(R.components.input.Touch.TOUCH_DATA_MODEL);

                if (touchInfo && bBox) {
                    touchOn = R.math.Math2D.boxPointCollision(bBox, touchInfo.position);
                }

                // Touched on object
                if (touchOn && (touchInfo.button != R.engine.Events.MOUSE_NO_BUTTON)) {
                    dataModel.touchDown = true;
                    gameObject.triggerEvent("touchstart", [touchInfo]);
                }

                // Touch position changed
                if (dataModel.touchDown && !touchInfo.position.equals(touchInfo.lastPosition)) {
                    gameObject.triggerEvent("touchmove", [touchInfo, touchOn]);
                }

                // Touch ended (and object was touched)
                if (dataModel.touchDown && touchInfo.button == R.engine.Events.MOUSE_NO_BUTTON) {
                    dataModel.touchDown = false;
                    gameObject.triggerEvent("touchend", [touchInfo]);
                }
            }
        }

    }, /** @scope R.components.input.Touch.prototype */{
        /**
         * Get the class name of this object
         *
         * @return {String} "R.components.input.Touch"
         */
        getClassName:function () {
            return "R.components.input.Touch";
        },

        /**
         * @private
         */
        TOUCH_DATA_MODEL:"TouchInputComponent"
    });
};
