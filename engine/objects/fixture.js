/**
 * The Render Engine
 * Fixture object
 *
 * @fileoverview A fixture is a box which either defines a solid area or a trigger.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1562 $
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
    "class":"R.objects.Fixture",
    "requires":[
        "R.objects.Object2D",
        "R.components.Render",
        "R.math.Point2D",
        "R.math.Rectangle2D"
    ]
});

/**
 * @class A fixture is a simple rectangular area used to define either
 *             a solid area, or a trigger for a callback.
 * @param rect {R.math.Rectangle2D} The box which defines the area of the fixture
 *    @param visible {Boolean} <code>true</tt> to render a visible rectangle for the fixture
 * @constructor
 * @extends R.objects.Object2D
 */
R.objects.Fixture = function () {
    return R.objects.Object2D.extend({

        editing:false,
        boxRect:null,
        type:null,
        action:null,
        visible:false,

        /** @private */
        constructor:function (rect, visible) {
            this.base("Fixture");
            this.editing = false;
            this.visible = visible;
            this.setPosition(R.math.Point2D.create(rect.getTopLeft()));
            rect.setTopLeft(0, 0);
            this.setBoundingBox(rect);
            this.type = R.objects.Fixture.TYPE_COLLIDER;
            this.action = "";
        },

        /**
         * Get the properties object for this collision box.
         * @return {Object}
         */
        getProperties:function () {
            var self = this;
            var prop = this.base(self);
            return $.extend(prop, {
                "Width":[function () {
                    return self.boxRect.get().w;
                }, function (i) {
                    self.setWidth(i);
                }, true],
                "Height":[function () {
                    return self.boxRect.get().h;
                }, function (i) {
                    self.setHeight(i);
                }, true],
                "Type":[function () {
                    return self.type == R.objects.Fixture.TYPE_COLLIDER ? "TYPE_COLLIDER" : "TYPE_TRIGGER";
                }, function (i) {
                    self.setType(i == "TYPE_COLLIDER" ? R.objects.Fixture.TYPE_COLLIDER : R.objects.Fixture.TYPE_TRIGGER);
                }, false],
                "Action":[function () {
                    return self.action.substring(0, 25);
                }, typeof LevelEditor !== "undefined" && self.type == R.objects.Fixture.TYPE_TRIGGER ?
                { "editor":function () {
                    LevelEditor.showScriptDialog(this, "Action", self.action);
                }, "fn":function (i) {
                    self.setAction(i);
                } } : null,
                    (typeof LevelEditor !== "undefined" && self.type == R.objects.Fixture.TYPE_TRIGGER)]
            });
        },

        /**
         * Update the player within the rendering context.  This draws
         * the shape to the context, after updating the transform of the
         * object.  If the player is thrusting, draw the thrust flame
         * under the ship.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
         * @param time {Number} The engine time in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        update:function (renderContext, time, dt) {
            renderContext.pushTransform();
            this.base(renderContext, time, dt);

            if (this.visible) {
                var color = this.type == R.objects.Fixture.TYPE_COLLIDER ? "0,255,255" : "255,0,0";

                if (this.editing) {
                    renderContext.setFillStyle("rgba(" + color + ",0.85)");
                } else {
                    renderContext.setFillStyle("rgba(" + color + ",0.4)");
                }

                renderContext.drawFilledRectangle(this.boxRect);

                if (this.editing) {
                    renderContext.setLineStyle("white");
                    renderContext.setLineWidth(2);
                } else {
                    renderContext.setLineWidth(1);
                }

                renderContext.drawText(this.boxRect.topLeft(), this.type == R.objects.Fixture.TYPE_COLLIDER ?
                    "solid" : "trigger");
                renderContext.drawRectangle(this.boxRect);
            }

            renderContext.popTransform();
        },

        /**
         * Get the type of collision box object being represented.
         * @return {Number}
         */
        getType:function () {
            return this.type;
        },

        /**
         * Set the type of collision box this will be.
         * @param type {Number} One of either: {@link #TYPE_COLLIDER} or {@link #TYPE_TRIGGER}.
         */
        setType:function (type) {
            this.type = type;
            if (type == R.objects.CollisionBox.TYPE_TRIGGER) {
                this.setName("TriggerBlock");
            } else {
                this.setName("CollisionBlock");
            }
        },

        /**
         * Sets the script which will be called when the block is triggered.
         * @param action {String} The action script
         */
        setAction:function (action) {
            this.action = action;
        },

        /**
         * Set the size of the collision box
         * @param width {Number} The width of the box in pixels
         * @param height {Number} The height of the box in pixels
         */
        setBoxSize:function (width, height) {
            this.boxRect.setDims(width, height);
            this.setBoundingBox(this.boxRect);
        },

        /**
         * Set the width of the collision box
         * @param width {Number} The width of the box in pixels
         */
        setWidth:function (width) {
            this.boxRect.setWidth(width);
            this.setBoundingBox(this.boxRect);
        },

        /**
         * Set the height of the collision box
         * @param height {Number} The height of the box in pixels
         */
        setHeight:function (height) {
            this.boxRect.setHeight(height);
            this.setBoundingBox(this.boxRect);
        },

        /**
         * Set the editing mode of the object, used by the LevelEditor
         * @private
         */
        setEditing:function (state) {
            this.editing = state;
        },

        /**
         * Queried by the LevelEditor to determine if an object is editable
         * @private
         */
        isEditable:function () {
            return true;
        },

        /**
         * Set the visibility state of the fixture.
         * @param state {Boolean}
         * @private
         */
        setVisible:function (state) {
            this.visible = state;
        }

    }, /** @scope R.objects.Fixture.prototype */{ // Static
        /**
         * Get the class name of this object
         * @return The string <tt>R.objects.Fixture</tt>
         * @type String
         */
        getClassName:function () {
            return "R.objects.Fixture";
        },

        /**
         * This type of box impedes movement through it
         * @type {Number}
         */
        TYPE_COLLIDER:1,

        /**
         * This type of box triggers an action
         * @type {Number}
         */
        TYPE_TRIGGER:2
    });

}