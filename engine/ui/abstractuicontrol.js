/**
 * The Render Engine
 * AbstractUIControl
 *
 * @fileoverview Abstract class that provides the foundation for rendering UI
 *               controls to a graphical context.
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
    "class":"R.ui.AbstractUIControl",
    "requires":[
        "R.objects.Object2D",
        "R.text.TextRenderer",
        "R.text.ContextText",
        "R.math.Math2D"
    ]
});

/**
 * @class Abstract class that provides the foundation for all UI controls which are
 *        rendered to a graphical context.
 *
 * @constructor
 * @param controlName {String} The name of the control
 * @param textRenderer {R.text.AbstractTextRenderer} Optional text renderer.  Defaults to
 *    {@link R.text.ContextText} renderer.
 * @extends R.objects.Object2D
 */
R.ui.AbstractUIControl = function () {
    return R.objects.Object2D.extend(/** @scope R.ui.AbstractUIControl.prototype */{

        textRenderer:null,
        styleClass:null,
        elem:null,
        focus:false,
        inControl:false,
        overControl:false,
        buttonDown:false,
        groupName:null,
        uiName:null,

        /** @private */
        constructor:function (controlName, textRenderer) {
            this.base(controlName);
            textRenderer = textRenderer || R.text.ContextText.create();
            this.textRenderer = R.text.TextRenderer.create(textRenderer, "", 1);
            this.styleClass = "ui";
            this.elem = $("<span id='" + this.getId() + "'></span>").addClass(this.styleClass).addClass("default");
            R.Engine.getDefaultContext().jQ().append(this.elem);
            this.focus = false;
            this.inControl = false;
            this.overControl = false;
            this.buttonDown = false;
            this.groupName = "";
            this.uiName = this.getId();
        },

        /**
         * Destroy the UI control.
         */
        destroy:function () {
            this.textRenderer.destroy();
            this.elem.remove();
            this.base();
        },

        /**
         * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.textRenderer = null;
            this.styleClass = null;
        },

        /**
         * After the control is added to the render context.
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context
         * @private
         */
        afterAdd:function (renderContext) {
            // We call this method so we can measure the text
            this.getTextRenderer().setRenderContext(renderContext);

            // We'll need event capturing to know when the input was clicked on
            renderContext.captureMouse();
        },

        /**
         * Add a CSS style class to the control.
         * @param cssClass {String} The name of the style class to add
         */
        addClass:function (cssClass) {
            this.elem.addClass(cssClass);
        },

        /**
         * Remove a CSS style class from the control.
         * @param cssClass {String} The name of the style class to remove
         */
        removeClass:function (cssClass) {
            this.elem.removeClass(cssClass);
        },

        /**
         * Get a reference to the text renderer for the control.
         * @return {R.text.TextRenderer}
         */
        getTextRenderer:function () {
            return this.textRenderer;
        },

        /**
         * Set the name of the UI control which uniquely identifies it among other
         * UI controls.
         * @param uiName {String} The name of the control
         */
        setControlName:function (uiName) {
            this.uiName = uiName;
        },

        /**
         * Get the unique name of this UI control.
         * @return {String}
         */
        getControlName:function () {
            return this.uiName;
        },

        /**
         * Set the control's group name.
         * @param groupName {String} The name of the control's group, or an empty string to clear the
         *    group.
         */
        setGroup:function (groupName) {
            if (this.groupName != null) {
                // Remove it from its old group
                RenderEngine.Support.arrayRemove(R.ui.AbstractUIControl.groups[this.groupName], this);
            }

            // If group name is null or the empty string, just exit here
            if (groupName == "") {
                return;
            }

            this.groupName = groupName;
            if (!R.ui.AbstractUIControl.groups[this.groupName]) {
                // Create the group if it doesn't exist
                R.ui.AbstractUIControl.groups[this.groupName] = [];
            }

            // Add this control to the group
            R.ui.AbstractUIControl.groups[this.groupName].push(this);
        },

        /**
         * Returns the name of the group this UI control belongs to.  Returns an
         * empty string if this control isn't part of a group.
         * @return {String}
         */
        getGroupName:function () {
            return this.groupName;
        },

        /**
         * Get the group of controls which are in this control's group.
         * @return {Array}
         */
        getGroup:function () {
            if (this.groupName) {
                return R.ui.AbstractUIControl.groups[this.groupName];
            } else {
                return null;
            }
        },

        /**
         * Set the focus state of the UI control.
         * @param state {Boolean} <code>true</code> if the control has focus
         */
        setFocus:function (state) {
            this.focus = state;
            if (state) {
                this.triggerEvent("focus");
            } else {
                this.triggerEvent("blur");
            }
        },

        /**
         * Returns a boolean indicating if the control has focus.
         * @return {Boolean} <code>true</code> if the control has focus
         */
        hasFocus:function () {
            return this.focus;
        },

        /**
         * [ABSTRACT] Calculate and return the width of the control in pixels.
         * @return {Number}
         */
        calcWidth:function () {
            return this.getTextRenderer().getBoundingBox().w;
        },

        /**
         * [ABSTRACT] Calculate and return the height of the control in pixels.
         * @return {Number}
         */
        calcHeight:function () {
            return this.getTextRenderer().getBoundingBox().h;
        },

        /**
         * Draw a box for the control.
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context
         * @param width {Number} The width of the box
         * @param height {Number} The height of the box
         * @param fillColor {String} The fill color for the box, or <code>null</code>
         */
        drawBox:function (renderContext, width, height, fillColor) {
            var rect = R.math.Rectangle2D.create(0, 0, width, height);
            if (fillColor) {
                renderContext.setFillStyle(fillColor);
                renderContext.drawFilledRectangle(rect);
            } else {
                renderContext.setFillStyle("transparent");
            }
            renderContext.drawRectangle(rect);
            rect.destroy();
        },

        /**
         * Parses a style class into a set of commands which set up the control for
         * rendering.
         * @private
         */
        parseStyleClass:function (renderContext) {
            // We'll handle a specific set of styles
            var sNames = "borderTopWidth,borderTopColor,marginLeft,marginTop,fontFamily,fontSize," +
                "fontWeight,fontStyle,textAlign,width,height,backgroundColor,color";
            sNames = sNames.split(",");
            var self = this, cW = 0, cH = 0, cP, offs;
            $.each(sNames, function (i, e) {
                var cS = self.elem.css(e);
                if (cS != null && cS != "") {
                    var intVal = parseInt(cS);
                    switch (e) {
                        case "width" :
                            cW = (cS == "0px" ? self.calcWidth() : intVal);
                            break;
                        case "height":
                            cH = (cS == "0px" ? self.calcHeight() : intVal);
                            break;
                        case "borderTopWidth":
                            renderContext.setLineWidth(intVal);
                            break;
                        case "borderTopColor":
                            renderContext.setLineStyle(cS);
                            break;
                        case "marginLeft":
                            if (cS != "0px") {
                                cP = R.clone(renderContext.getPosition());
                                offs = R.math.Point2D.create(intVal, 0);
                                renderContext.setPosition(cP.add(offs));
                                offs.destroy();
                            }
                            break;
                        case "marginTop":
                            if (cS != "0px") {
                                cP = R.clone(renderContext.getPosition());
                                offs = R.math.Point2D.create(0, intVal);
                                renderContext.setPosition(cP.add(offs));
                                offs.destroy();
                            }
                            break;
                        case "backgroundColor":
                            cS != "transparent" ? self.drawBox(renderContext, cW, cH, cS) :
                                self.drawBox(renderContext, cW, cH, null);
                            break;
                        case "fontFamily" :
                            self.getTextRenderer().setTextFont(cS);
                            break;
                        case "fontSize" :
                            self.getTextRenderer().setTextSize(intVal);
                            break;
                        case "fontWeight" :
                            self.getTextRenderer().setTextWeight(cS);
                            break;
                        case "fontStyle" :
                            self.getTextRenderer().setTextStyle(cS);
                            break;
                        case "textAlign" :
                            switch (cS) {
                                case "center":
                                    self.getTextRenderer().setTextAlignment(R.text.AbstractTextRenderer.ALIGN_CENTER);
                                    break;
                                case "right":
                                    self.getTextRenderer().setTextAlignment(R.text.AbstractTextRenderer.ALIGN_RIGHT);
                                    break;
                                default:
                                    self.getTextRenderer().setTextAlignment(R.text.AbstractTextRenderer.ALIGN_LEFT);
                            }
                            break;
                        case "color" :
                            self.getTextRenderer().setColor(cS);
                            break;
                    }
                }
            });
            this.getBoundingBox().set(0, 0, cW, cH);
        },

        /**
         * Returns <code>true</code> if the mouse is in the control's world bounding box.
         * @return {Boolean}
         */
        isMouseInControl:function () {
            return this.inControl;
        },

        /**
         * Called when the mouse is over the control.  Triggers the "mouseover" event, passing the
         * <code>R.struct.MouseInfo</code> structure.
         *
         * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
         */
        mouseOver:function (mouseInfo) {
            this.triggerEvent("mouseover", [mouseInfo]);
        },

        /**
         * Called when the mouse moves out of the control.  Triggers the "mouseout" event, passing the
         * <code>R.struct.MouseInfo</code> structure.
         *
         * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
         */
        mouseOut:function (mouseInfo) {
            this.triggerEvent("mouseout", [mouseInfo]);
        },

        /**
         * Called when the mouse moves over the control.  Triggers the "mousemove" event, passing the
         * <code>R.struct.MouseInfo</code> structure.
         *
         * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
         */
        mouseMove:function (mouseInfo) {
            this.triggerEvent("mousemove", [mouseInfo]);
        },

        /**
         * Called when a mouse button is pressed on the control.  Triggers the "mousedown" event, passing the
         * <code>R.struct.MouseInfo</code> structure.
         *
         * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
         */
        mouseDown:function (mouseInfo) {
            this.triggerEvent("mousedown", [mouseInfo]);
        },

        /**
         * Called when a mouse button is released on the control.  Triggers the "mouseup" event, passing the
         * <code>R.struct.MouseInfo</code> structure.
         *
         * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
         */
        mouseUp:function (mouseInfo) {
            this.triggerEvent("mouseup", [mouseInfo]);
        },

        /**
         * Called when a mouse button is pressed, then released on the control.  Triggers the
         * "click" event, passing the <code>R.struct.MouseInfo</code> structure.
         *
         * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
         */
        click:function (mouseInfo) {
            if (!this.hasFocus()) {
                this.setFocus(true);
            }
            this.triggerEvent("click", [mouseInfo]);
        },

        /**
         * [ABSTRACT] Method which draws the UI control to the render context.
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
         *    drawn.
         * @param worldTime {Number} The current world time, in milliseconds
         * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
         */
        drawControl:function (renderContext, worldTime, dt) {
        },

        /**
         * Update the input component in the render context.
         * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
         *    drawn.
         * @param worldTime {Number} The current world time, in milliseconds
         * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
         * @private
         */
        update:function (renderContext, worldTime, dt) {
            renderContext.pushTransform();
            this.base(renderContext, worldTime, dt);
            this.parseStyleClass(renderContext);
            this.drawControl(renderContext, worldTime, dt);
            renderContext.popTransform();

            // Handle events after the control is drawn
            var mInfo = renderContext.getObjectDataModel("mouseInfo");
            if (mInfo) {
                this.inControl = this.getWorldBox().containsPoint(mInfo.position);
                if (this.inControl && !this.overControl) {
                    this.overControl = true;
                    this.mouseOver(mInfo);
                } else if (!this.inControl && this.overControl) {
                    this.overControl = false;
                    this.mouseOut(mInfo);
                } else if (this.inControl && this.overControl) {
                    this.mouseMove(mInfo);
                }

                if (this.inControl && mInfo.button != R.engine.Events.MOUSE_NO_BUTTON && !this.buttonDown) {
                    this.buttonDown = true;
                    this.mouseDown(mInfo);
                }

                if (mInfo.button == R.engine.Events.MOUSE_NO_BUTTON && this.buttonDown) {
                    this.buttonDown = false;
                    this.mouseUp(mInfo);
                    if (this.inControl) {
                        this.click(mInfo);
                    }
                }

                if (mInfo.button != R.engine.Events.MOUSE_NO_BUTTON && !this.inControl && this.hasFocus()) {
                    this.setFocus(false);
                }
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
                "ControlName":[function () {
                    return self.getControlName();
                }, function (i) {
                    self.setControlName(i);
                }, true],
                "GroupName":[function () {
                    return self.getGroupName();
                }, function (i) {
                    self.setGroup(i);
                }, true]
            });
        }

    }, /** @scope R.ui.AbstractUIControl.prototype */{

        /**
         * A list of grouped controls
         * @private
         */
        groups:{},

        /**
         * Get the class name of this object
         * @return {String} The string "R.ui.AbstractUIControl"
         */
        getClassName:function () {
            return "R.ui.AbstractUIControl";
        },

        /**
         * Get a properties object with values for the given object.
         * @param obj {R.ui.AbstractUIControl} The UI control to query
         * @param [defaults] {Object} Default values that don't need to be serialized unless
         *    they are different.
         * @return {Object}
         */
        serialize:function (obj, defaults) {
            // Defaults for object properties which can be skipped if no different
            defaults = defaults || [];
            $.extend(defaults, {
                "GroupName":""
            });
            return R.objects.Object2D.serialize(obj, defaults);
        },

        /**
         * Deserialize the object back into a UI control.
         * @param obj {Object} The object to deserialize
         * @param [clazz] {Class} The object class to populate
         * @return {R.ui.AbstractUIControl} The object which was deserialized
         */
        deserialize:function (obj, clazz) {
            clazz = clazz || R.ui.AbstractUIControl.create("UIControl");
            R.objects.Object2D.deserialize(obj, clazz);
            return clazz;
        }

    });

};