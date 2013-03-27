// TODO: RENDERING NEEDS CLEANING!! //

/**
 * The Render Engine
 * BitmapText
 *
 * @fileoverview A bitmap font renderer for render contexts that don't
 *               support fonts natively.
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
    "class":"R.text.BitmapText",
    "requires":[
        "R.math.Math2D",
        "R.util.RenderUtil",
        "R.text.AbstractTextRenderer"
    ]
});

/**
 * @class A text renderer which draws text from a bitmap font file.  This type of text
 *        renderer is only supported by the {@link R.rendercontexts.CanvasContext}.  For an {@link R.rendercontexts.HTMLElementContext}
 *        or a derivative, use the {@link R.text.ContextText} renderer.
 *
 * @constructor
 * @param font {Font} A resource obtained by calling {@link FontResourceLoader#get}
 * @extends R.text.AbstractTextRenderer
 * @see R.resources.loaders.BitmapFontLoader
 */
R.text.BitmapText = function () {
    return R.text.AbstractTextRenderer.extend(/** @scope R.text.BitmapText.prototype */{

        font:null,
        spacing:0,

        /** @private */
        constructor:function (font) {
            this.base();
            this.font = font;
        },

        /**
         * Release the text renderer back into the pool for reuse
         */
        release:function () {
            this.base();
            this.font = null;
            this.spacing = 0;
        },

        /**
         * Calculate the bounding box for the text and set it on the host object.
         * @private
         */
        calculateBoundingBox:function () {
            var text = this.getText(), lCount = text.length, align = this.getTextAlignment(),
                letter = (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? text.length - 1 : 0),
                kern = (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? -this.font.info.kerning : this.font.info.kerning),
                space = R.math.Point2D.create((align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? -this.font.info.space : this.font.info.space), 0),
                cW, cH = this.font.info.height, cS = 0, y = 0, pc = R.math.Point2D.create(0, 0);

            // Run the text to get its bounding box
            var weight = this.getTextWeight();
            for (var wT = 0; wT < weight; wT++) {

                pc.set(wT * 0.5, 0);

                letter = (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? text.length - 1 : 0);
                lCount = text.length;

                while (lCount-- > 0) {
                    var chr = text.charCodeAt(letter);
                    if (chr == 10) {
                        y += (cH * this.getSize()) + this.getLineSpacing();
                        pc.set(0, y);
                    }
                    else {
                        var glyph = chr - 32;
                        if (glyph == 0) {
                            // A space
                            pc.add(space);
                        }
                        else {
                            // Draw the text
                            cS = this.font.info.letters[glyph - 1];
                            cW = this.font.info.letters[glyph] - cS;
                            pc.add(R.math.Point2D.create(cW, 0).mul(kern));
                        }
                    }

                    letter += (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? -1 : 1);
                }
            }

            // Set the bounding box
            this.getGameObject().getBoundingBox().set(0, 0, pc.x * this.getSize(), cH * this.getSize());
            pc.destroy();
        },

        /**
         * Set the scaling of the text
         * @param size {Number}
         */
        setSize:function (size) {
            this.base(size);
            this.generated = false;
            this.calculateBoundingBox();
        },

        /**
         * Set the text to render.
         *
         * @param text {String} The text to render
         */
        setText:function (text) {
            // If the font only supports uppercase letters
            text = (this.font.upperCaseOnly ? String(text).toUpperCase() : text);

            // Replace special chars
            this.base(text);
            this.generated = false;
            this.calculateBoundingBox();
        },

        /**
         * @private
         */
        execute:function (renderContext, time, dt) {

            if (this.getText().length == 0) {
                return;
            }

            renderContext.pushTransform();
            var o = R.math.Point2D.create(this.getGameObject().getOrigin());
            o.neg();
            renderContext.setPosition(o);
            o.destroy();

            renderContext.setScale(this.getSize());

            var text = this.getText(), lCount = text.length, align = this.getTextAlignment(),
                letter = (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? text.length - 1 : 0),
                kern = (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? -this.font.info.kerning : this.font.info.kerning),
                space = R.math.Point2D.create((align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? -this.font.info.space : this.font.info.space), 0),
                cW, cH = this.font.info.height, cS = 0, y = 0, lineCount = 1;

            // Render the text
            var weight = this.getTextWeight();
            for (var wT = 0; wT < weight; wT++) {

                var pc = R.math.Point2D.create(wT * 0.5, 0);

                // 1st pass: The text
                letter = (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? text.length - 1 : 0);
                lCount = text.length;

                if (renderContext.get2DContext) {
                    renderContext.get2DContext().globalCompositeOperation = "source-over";
                }

                while (lCount-- > 0) {
                    var chr = text.charCodeAt(letter);
                    if (chr == 10) {
                        y += (cH * this.getSize()) + this.getLineSpacing();
                        pc.set(0, y);
                        lineCount++;
                    }
                    else {
                        var glyph = chr - 32;
                        if (glyph == 0) {
                            // A space
                            pc.add(space);
                        }
                        else {
                            // Draw the text
                            cS = this.font.info.letters[glyph - 1];
                            cW = this.font.info.letters[glyph] - cS;
                            var sRect = R.math.Rectangle2D.create(cS, 0, cW, cH);
                            var rect = R.math.Rectangle2D.create(pc.x, pc.y, cW, cH);
                            renderContext.drawImage(rect, this.font.image, sRect, this.getGameObject());
                            pc.add(R.math.Point2D.create(cW, 0).mul(kern));
                        }
                    }

                    letter += (align == R.text.AbstractTextRenderer.ALIGN_RIGHT ? -1 : 1);
                }
            }

            // 2nd pass: The color
            if (renderContext.get2DContext && !R.util.RenderUtil.isWhite(this.getColor())) {
                renderContext.get2DContext().globalCompositeOperation = "source-atop";
                renderContext.setFillStyle(this.getColor());
                renderContext.drawFilledRectangle(this.getGameObject().getBoundingBox());
                // Reset the composition operation
                renderContext.get2DContext().globalCompositeOperation = "source-over";
            }

            pc.destroy();
            space.destroy();

            renderContext.popTransform();
        }
    }, /** @scope R.text.BitmapText.prototype */ {
        /**
         * Get the class name of this object
         * @return {String} The string "R.text.BitmapText"
         */
        getClassName:function () {
            return "R.text.BitmapText";
        }
    });

};