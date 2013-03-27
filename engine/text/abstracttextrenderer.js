/**
 * The Render Engine
 * AbstractTextRenderer
 *
 * @fileoverview Abstract class that provides basic interface for all
 *               text render objects used by the text renderer.
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
    "class":"R.text.AbstractTextRenderer",
    "requires":[
        "R.components.Base"
    ]
});

/**
 * @class Abstract class that provides the basic interface for all
 *        text render objects used by the {@link R.text.TextRenderer}.
 *
 * @constructor
 * @param componentName {String} The name of the renderer
 * @param priority {Number} The priority of the rendering order. Default: <tt>0.1</tt>
 * @extends R.components.Base
 */
R.text.AbstractTextRenderer = function () {
    return R.components.Base.extend(/** @scope R.text.AbstractTextRenderer.prototype */{

        text:null,
        color:"#000000",
        alignment:null,
        weight:null,
        size:1,
        font:null,
        style:null,
        lineSpacing:7,

        /** @private */
        constructor:function (componentName, priority) {
            this.base(componentName || "TextRenderObject", R.components.Base.TYPE_RENDERING, priority || 0.1);

            this.text = "";
            this.size = 1;
            this.weight = 1;
            this.font = null;
            this.style = null;
            this.alignment = R.text.AbstractTextRenderer.ALIGN_LEFT;
            this.lineSpacing = 7;
        },

        /**
         * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.text = null;
            this.color = "#000000";
            this.size = 1;
            this.weight = null;
            this.font = null;
            this.style = null;
            this.alignment = null;
            this.lineSpacing = 7;
        },

        /**
         * Return <tt>true</tt> if the text renderer is native to the context.
         * @return {Boolean}
         */
        isNative:function () {
            return false;
        },

        /**
         * Get the text being rendered
         * @return {String} The text this renderer will draw
         */
        getText:function () {
            return this.text;
        },

        /**
         * Set the text to be rendered
         *
         * @param text {String} The text to render
         */
        setText:function (text) {
            this.text = text;
        },

        /**
         * Set the font of the text to be renderer
         * @param font {String} The font name
         */
        setTextFont:function (font) {
            this.font = font;
        },

        /**
         * Get the font of the text to be rendered
         * @return {String} The font name
         */
        getTextFont:function () {
            return this.font;
        },

        /**
         * Set the weight of the text to render.  Higher weights
         * are bolder text.
         *
         * @param weight {Number} The weight of the text.
         */
        setTextWeight:function (weight) {
            this.weight = weight;
        },

        /**
         * Get the weight of the text to render.
         * @return {Number} The weight of the text
         */
        getTextWeight:function () {
            return this.weight;
        },

        /**
         * Set the style of the text, usually italics or normal, for the text renderer.
         * @param style {Object} The style of the text
         */
        setTextStyle:function (style) {
            this.style = style;
        },

        /**
         * Get the style of the text for the renderer.
         * @return {Object} The style of the text
         */
        getTextStyle:function () {
            return this.style;
        },

        /**
         * Set the alignment of the text.
         *
         * @param alignment {Object} The alignment for the text renderer
         */
        setTextAlignment:function (alignment) {
            this.alignment = alignment;
            // Adjust the origin, based on the alignment
            var boundingBox = this.getGameObject().getBoundingBox();
            var center = boundingBox.getCenter();
            var textOrigin = R.math.Point2D.create(0, 0);
            if (this.alignment === R.text.AbstractTextRenderer.ALIGN_RIGHT) {
                textOrigin.set(center.x + boundingBox.getHalfWidth(), 0);
            }
            else if (this.alignment === R.text.AbstractTextRenderer.ALIGN_LEFT) {
                textOrigin.set(center.x - boundingBox.getHalfWidth(), 0);
            }
            else {
                textOrigin.set(center.x, 0);
            }

            this.getGameObject().setOrigin(textOrigin);
        },

        /**
         * Get the alignment of the text.
         * @return {Object} The alignment of the text renderer
         */
        getTextAlignment:function () {
            return this.alignment;
        },

        /**
         * Set the scaling of the text
         * @param size {Number}
         */
        setSize:function (size) {
            this.size = size;
        },

        /**
         * Get the scaling of the text
         * @return {Number}
         */
        getSize:function () {
            return this.size;
        },

        /**
         * Set the color of the text to render.
         *
         * @param color {String} The color of the text to render
         */
        setColor:function (color) {
            this.color = color;
        },

        /**
         * Get the color of the text to render.
         * @return {String} The text color
         */
        getColor:function () {
            return this.color;
        },

        /**
         * Set the line spacing between lines of text in a multi-line text string.
         * Multi-line text is separated by the carriage return (0xA).
         *
         * @param lineSpacing {Number} Line spacing (default: 7)
         */
        setLineSpacing:function (lineSpacing) {
            this.lineSpacing = lineSpacing;
        },

        /**
         * Get the space between lines in multi-line text.
         * @return {Number}
         */
        getLineSpacing:function () {
            return this.lineSpacing;
        }

    }, /** @scope R.text.AbstractTextRenderer.prototype */{

        /**
         * Get the class name of this object
         * @return {String} The string "R.text.AbstractTextRenderer"
         */
        getClassName:function () {
            return "R.text.AbstractTextRenderer";
        },

        /**
         * Align text with the left edge of the string at the point specified.
         * @type Number
         */
        ALIGN_LEFT:0,

        /**
         * Align text with the right edge of the string at the point specified
         * @type Number
         */
        ALIGN_RIGHT:1,

        /**
         * Align text with the center of the string at the point specified
         * @type Number
         */
        ALIGN_CENTER:2

    });

};