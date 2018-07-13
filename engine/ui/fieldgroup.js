/**
 * The Render Engine
 * FieldGroup
 *
 * @fileoverview A group of UI controls.
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
    "class":"R.ui.FieldGroup",
    "requires":[
        "R.ui.AbstractUIControl",
        "R.struct.Container"
    ]
});

/**
 * @class A physical grouping of UI controls.
 *
 * @constructor
 * @param label {String} The label for the field group.
 * @extends R.ui.AbstractUIControl
 */
R.ui.FieldGroup = function () {
    return R.ui.AbstractUIControl.extend(/** @scope R.ui.FieldGroup.prototype */{

        label:null,
        labelPosition:0,
        controls:null,

        /** @private */
        constructor:function (label, textRenderer) {
            this.base("FieldGroup", textRenderer);
            this.addClass("fieldgroup");
            this.setLabel(label || "");
            this.labelPosition = R.ui.FieldGroup.LABEL_TOPLEFT;
            this.controls = R.struct.Container.create("UIControls");
        },

        /**
         * Destroy the text input control, releasing its event handlers.
         */
        destroy:function () {
            this.base();
            this.controls.cleanUp();
        },

        /**
         * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.label = null;
            this.labelPosition = R.ui.FieldGroup.LABEL_TOPLEFT;
            this.controls = null;
        },

        /**
         * Set the label for the field group, or an empty string to show no label.
         * @param label {String} The label
         */
        setLabel:function (label) {
            this.label = label;
        },

        /**
         * Get the field group label.
         * @return {String}
         */
        getLabel:function () {
            return this.label;
        },

        /**
         * Add a control to this field group.
         * @param uiControl {R.ui.AbstractUIControl} The control to add
         */
        addControl:function (uiControl) {
            Assert(uiControl instanceof R.ui.AbstractUIControl, "You can only add UI controls to a field group");
            this.controls.add(uiControl);
        },

        /**
         * Remove a control from this field group.
         * @param uiControl {R.ui.AbstractUIControl} The control to remove
         * @return {R.ui.AbstractUIControl} The control removed
         */
        removeControl:function (uiControl) {
            return this.controls.remove(uiControl);
        },

        /**
         * Get the first control, within the field group, which has the specified name,
         * or <code>null</code> if no control with the name is in the group.
         * @param controlName {String} The name of the control to get
         * @return {R.ui.AbstractUIControl} The control, or <code>null</code>
         */
        getControlByName:function (controlName) {
            var controls = this.controls.filter(function (c) {
                return (c.getControlName() === controlName);
            });
            if (controls.length != 0) {
                return controls[0];
            } else {
                return null;
            }
        },

        /**
         * Draw the field group within the context.
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
         *    drawn.
         * @param worldTime {Number} The current world time, in milliseconds
         * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
         */
        drawControl:function (renderContext, worldTime, dt) {
            // Draw the current input text.  The text baseline is the bottom of the font,
            // so we need to move that down by the height of the control (with some padding to look right)
            renderContext.pushTransform();

            if (this.label != "") {
                this.getTextRenderer().setText(this.label);

                // Draw the label
                var labelPos = R.math.Point2D.create(0, 0), wBox = R.clone(this.getWorldBox()),
                    textWidth = this.getTextRenderer().getBoundingBox().w,
                    textHeight = this.getTextRenderer().getBoundingBox().h;
                switch (this.labelPosition) {
                    case R.ui.FieldGroup.LABEL_TOPLEFT:
                        labelPos.x = wBox.x + 10;
                        labelPos.y = wBox.y + 1;
                        break;
                    case R.ui.FieldGroup.LABEL_TOPRIGHT:
                        labelPos.x = (wBox.x + wBox.w) - (textWidth + 10);
                        labelPos.y = wBox.y + 1;
                        break;
                    case R.ui.FieldGroup.LABEL_BOTTOMLEFT:
                        labelPos.x = wBox.x + 10;
                        labelPos.y = (wBox.y + wBox.h) + textHeight - 2;
                        break;
                    case R.ui.FieldGroup.LABEL_BOTTOMRIGHT:
                        labelPos.x = (wBox.x + wBox.w) - (textWidth + 10);
                        labelPos.y = (wBox.y + wBox.h) + textHeight - 2;
                        break;
                }

                renderContext.pushTransform();
                renderContext.setPosition(labelPos);
                this.getTextRenderer().update(renderContext, worldTime, dt);
                renderContext.popTransform();

                labelPos.destroy();
                wBox.destroy();
            }

            // Render the controls in the group
            var itr = this.controls.iterator();
            while (itr.hasNext()) {
                var control = itr.next();
                if (control.getRenderContext() == null) {
                    control.setRenderContext(renderContext);
                }
                control.update(renderContext, worldTime, dt);
            }
            itr.destroy();

            renderContext.popTransform();
        }

    }, /** @scope R.ui.FieldGroup.prototype */{

        LABEL_TOPLEFT:0,

        LABEL_TOPRIGHT:1,

        LABEL_BOTTOMLEFT:2,

        LABEL_BOTTOMRIGHT:3,

        /**
         * Get the class name of this object
         * @return {String} The string "R.ui.FieldGroup"
         */
        getClassName:function () {
            return "R.ui.FieldGroup";
        },

        /**
         * Get a properties object with values for the given object.
         * @param obj {R.ui.FieldGroup} The field group to query
         * @param [defaults] {Object} Default values that don't need to be serialized unless
         *    they are different.
         * @return {Object}
         */
        serialize:function (obj, defaults) {
            var fg = R.ui.AbstractUIControl.serialize(obj, defaults),
                itr = obj.controls.iterator();

            fg.CONTROLS = {};
            while (itr.hasNext()) {
                var control = itr.next();
                fg.CONTROLS[control.getControlName()] = control.constructor.serialize(control);
            }
            itr.destroy();
            return fg;
        },

        /**
         * Deserialize the object back into a field group.
         * @param obj {Object} The object to deserialize
         * @param [clazz] {Class} The object class to populate
         * @return {R.ui.ButtonControl} The object which was deserialized
         */
        deserialize:function (obj, clazz) {
            // Get the controls for the group
            var controls;
            if (obj.CONTROLS) {
                controls = obj.CONTROLS;
                delete obj.CONTROLS;
            }

            // Now we can deserialize the class
            clazz = clazz || R.ui.FieldGroup.create();
            R.ui.AbstractUIControl.deserialize(obj, clazz);

            // Re-populate the controls into the form
            for (var c in controls) {
                // Grab the classname field so we can recreate the object
                var control = controls[c], controlClazz = R.classForName(control.CLASSNAME),
                    uiControl = controlClazz.deserialize(control);

                // Add the control which was deserialized
                clazz.addControl(uiControl);
            }

            return clazz;
        }
    });

};