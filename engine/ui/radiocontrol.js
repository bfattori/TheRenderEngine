/**
 * The Render Engine
 * RadioControl
 *
 * @fileoverview A radio box control.
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
    "class":"R.ui.RadioControl",
    "requires":[
        "R.ui.AbstractUIControl"
    ]
});

/**
 * @class UI checkbox control.
 *
 * @constructor
 * @param group {String} The name of the group this control is a part of.
 * @param value {String} The value of this radio within the group
 * @param [checked] {Boolean} Whether the checkbox is checked, or not.
 * @extends R.ui.AbstractUIControl
 */
R.ui.RadioControl = function () {
    return R.ui.AbstractUIControl.extend(/** @scope R.ui.RadioControl.prototype */{

        checked:false,
        value:null,

        /** @private */
        constructor:function (group, value, checked) {
            this.base("Radio");
            this.addClass("radiocontrol");
            this.value = value;
            this.setGroup(group);
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
            // Check this control
            this.setChecked(true);
            this.base(mouseInfo);
        },

        /**
         * Set the "checked" state of the control.  Triggers the "change"
         * event on the control.
         * @param state {Boolean} <code>true</code> to mark the control as "checked"
         */
        setChecked:function (state) {
            if (state && !this.isChecked()) {
                // Get the group of controls
                var group = this.getGroup();

                // Un-check all of the controls
                for (var r = 0; r < group.length; r++) {
                    if (group[r] != this) {
                        group[r].setChecked(false);
                    }
                }
            }

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
         * Set the value of this radio control.
         * @param value {String} The value of the control
         */
        setValue:function (value) {
            this.value = value;
        },

        /**
         * Get the value of this radio control.
         * @return {String}
         */
        getValue:function () {
            return this.value;
        },

        /**
         * Get the value of the selected control within the entire group.
         * @return {String} The checked radio control's value, or <code>null</code> if no
         *    control has been checked.
         */
        getGroupValue:function () {
            // Get the group of controls
            var group = this.getGroup();

            // Return the value of the checked control
            for (var r = 0; r < group.length; r++) {
                if (group[r].isChecked()) {
                    return group[r].getValue();
                }
            }
            return null;
        },

        /**
         * Override drawing the box and draw a circle instead.
         */
        drawBox:function (renderContext, width, height, fillColor) {
            var rect = R.math.Rectangle2D.create(0, 0, width, height);
            if (fillColor) {
                renderContext.setFillStyle(fillColor);
                renderContext.drawFilledCircle(rect.getCenter(), rect.getHalfWidth());
            } else {
                renderContext.setFillStyle("transparent");
            }
            renderContext.drawCircle(rect.getCenter(), rect.getHalfWidth());
            rect.destroy();
        },

        /**
         * Draw the input component within the
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
         *    drawn.
         * @param worldTime {Number} The current world time, in milliseconds
         * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
         */
        drawControl:function (renderContext, worldTime, dt) {
            // Draw a dot if the control is "checked"
            if (this.checked) {
                renderContext.pushTransform();
                renderContext.setLineWidth(2);
                var bBox = R.clone(this.getBoundingBox());
                renderContext.setFillStyle(this.getTextRenderer().getTextColor());
                bBox.x += 4;
                bBox.w -= 8;
                bBox.y += 4;
                bBox.h -= 8;
                bBox._upd();
                renderContext.drawFilledCircle(bBox.getCenter(), bBox.getHalfWidth());
                bBox.destroy();
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
                "Value":[function () {
                    return self.getValue();
                }, function (i) {
                    self.setValue(i);
                }, true],
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

    }, /** @scope R.ui.RadioControl.prototype */{

        /**
         * Get the class name of this object
         * @return {String} The string "R.ui.RadioControl"
         */
        getClassName:function () {
            return "R.ui.RadioControl";
        },

        /**
         * Get a properties object with values for the given object.
         * @param obj {R.ui.RadioControl} The radio control to query
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
         * Deserialize the object back into a radio control.
         * @param obj {Object} The object to deserialize
         * @param [clazz] {Class} The object class to populate
         * @return {R.ui.RadioControl} The object which was deserialized
         */
        deserialize:function (obj, clazz) {
            clazz = clazz || R.ui.RadioControl.create();
            R.ui.AbstractUIControl.deserialize(obj, clazz);
            return clazz;
        }
    });

};