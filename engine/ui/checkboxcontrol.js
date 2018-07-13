/**
 * The Render Engine
 * CheckboxControl
 *
 * @fileoverview A check box control.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
    "class":"R.ui.CheckboxControl",
    "requires":[
        "R.ui.AbstractUIControl"
    ]
});

/**
 * @class UI checkbox control.
 *
 * @constructor
 * @param [checked] {Boolean} Whether the checkbox is checked, or not.
 * @extends R.ui.AbstractUIControl
 */
R.ui.CheckboxControl = function () {
    return R.ui.AbstractUIControl.extend(/** @scope R.ui.CheckboxControl.prototype */{

        checked:false,

        /** @private */
        constructor:function (checked) {
            this.base("Checkbox");
            this.addClass("checkboxcontrol");
            this.setChecked(checked || false);
        },

        /**
         * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.checked = false;
        },

        /**
         * Respond to a "click" action on the checkbox.
         * @param mouseInfo {R.struct.MouseInfo} A mouse info structure
         */
        click:function (mouseInfo) {
            this.setChecked(!this.isChecked());
            this.base(mouseInfo);
        },

        /**
         * Set the "checked" state of the control.  Triggers the "change"
         * event on the control.
         * @param state {Boolean} <code>true</code> to mark the control as "checked"
         */
        setChecked:function (state) {
            this.checked = state;
            this.triggerEvent("change");
        },

        /**
         * Get the "checked" state of the control.
         * @return {String}
         */
        isChecked:function () {
            return this.checked;
        },

        /**
         * Draw the input component within the
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
         *    drawn.
         * @param worldTime {Number} The current world time, in milliseconds
         * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
         */
        drawControl:function (renderContext, worldTime, dt) {
            // Draw a check mark if the control is "checked"
            if (this.checked) {
                renderContext.pushTransform();
                renderContext.setLineWidth(2);
                var bBox = this.getBoundingBox(), topLeft = R.clone(bBox.getTopLeft()),
                    topRight = R.clone(bBox.getTopLeft()), bottomRight = R.clone(bBox.getBottomRight()),
                    bottomLeft = R.clone(bBox.getTopLeft());
                renderContext.setLineStyle(this.getTextRenderer().getTextColor());
                topLeft.x += 2;
                topLeft.y += 2;
                bottomRight.x -= 2;
                bottomRight.y -= 2;
                renderContext.drawLine(topLeft, bottomRight);
                topRight.x += bBox.w - 2;
                topRight.y += 2;
                bottomLeft.y += bBox.h - 2;
                bottomLeft.x += 2;
                renderContext.drawLine(topRight, bottomLeft);
                topRight.destroy();
                bottomLeft.destroy();
                topLeft.destroy();
                bottomRight.destroy();
                renderContext.popTransform();
            }
        },

        /**
         * Returns a bean which represents the read or read/write properties
         * of the object.
         *
         * @return {Object} The properties object
         */
        getProperties:function () {
            var self = this;
            var prop = this.base(self);
            return $.extend(prop, {
                "Checked":[function () {
                    return self.isChecked();
                }, {
                    "toggle":true,
                    "fn":function (s) {
                        self.setChecked(s);
                    }
                }, true]
            });
        }

    }, /** @scope R.ui.CheckboxControl.prototype */{

        /**
         * Get the class name of this object
         * @return {String} The string "R.ui.CheckboxControl"
         */
        getClassName:function () {
            return "R.ui.CheckboxControl";
        },

        /**
         * Get a properties object with values for the given object.
         * @param obj {R.ui.CheckboxControl} The checkbox control to query
         * @param [defaults] {Object} Default values that don't need to be serialized unless
         *    they are different.
         * @return {Object}
         */
        serialize:function (obj, defaults) {
            // Defaults for object properties which can be skipped if no different
            defaults = defaults || [];
            $.extend(defaults, {
                "Checked":false
            });
            return R.ui.AbstractUIControl.serialize(obj, defaults);
        },

        /**
         * Deserialize the object back into a checkbox control.
         * @param obj {Object} The object to deserialize
         * @param [clazz] {Class} The object class to populate
         * @return {R.ui.CheckboxControl} The object which was deserialized
         */
        deserialize:function (obj, clazz) {
            clazz = clazz || R.ui.CheckboxControl.create();
            R.ui.AbstractUIControl.deserialize(obj, clazz);
            return clazz;
        }
    });

};