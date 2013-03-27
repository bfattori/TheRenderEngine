/**
 * The Render Engine
 * VectorText
 *
 * @fileoverview A simple text renderer which draws text using lines.  It has a
 *               limited character set.
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
    "class":"R.text.VectorText",
    "requires":[
        "R.math.Point2D",
        "R.math.Rectangle2D",
        "R.text.AbstractTextRenderer"
    ]
});

/**
 * @class A text renderer which draws text with simple vectors.  This type of text
 *        renderer is only supported by the {@link R.rendercontexts.CanvasContext CanvasContext}.
 *        For an {@link R.rendercontexts.HTMLElementContext HTMLElementContext}
 *        or a derivative, use the {@link R.text.ContextText} renderer.
 *
 * @constructor
 * @param componentName {String} The name of the text component
 * @param priority {Number} The priority of the component
 * @extends R.text.AbstractTextRenderer
 */
R.text.VectorText = function () {
    return R.text.AbstractTextRenderer.extend(/** @scope R.text.VectorText.prototype */{

        rText:null,
        spacing:0,

        /** @private */
        constructor:function (componentName, priority) {
            this.base(componentName, priority);
            this.rText = [];
            this.setTextWeight(1.5);
        },

        /**
         * Release the text renderer back into the pool for reuse
         */
        release:function () {
            this.base();
            this.rText = null;
            this.spacing = 0;
            this.setTextWeight(1.5);
        },

        /**
         * Calculate the bounding box for the text and set it on the host object.
         * @private
         */
        calculateBoundingBox:function () {
            var x1 = R.lang.Math2.MAX_INT;
            var x2 = -R.lang.Math2.MAX_INT;
            var y1 = R.lang.Math2.MAX_INT;
            var y2 = -R.lang.Math2.MAX_INT;
            for (var p = 0; p < this.rText.length; p++) {
                var pt = this.rText[p];

                if (pt != null) {
                    if (pt.x < x1) {
                        x1 = pt.x;
                    }
                    if (pt.x > x2) {
                        x2 = pt.x;
                    }
                    if (pt.y < y1) {
                        y1 = pt.y;
                    }
                    if (pt.y > y2) {
                        y2 = pt.y;
                    }
                }
            }

            this.getGameObject().getBoundingBox().set(0, 0, ((Math.abs(x1) + x2) * this.getSize()) + 2, ((Math.abs(y1) + y2) * this.getSize()) + 2);
            this.setTextAlignment(this.getTextAlignment());
        },

        /**
         * Set the scaling of the text
         * @param size {Number}
         */
        setSize:function (size) {
            this.base(size);
            this.calculateBoundingBox();
        },

        /**
         * Set the text to render.
         *
         * @param text {String} The text to vectorize
         */
        setText:function (text) {
            // We only have uppercase letters
            text = String(text).toUpperCase();
            this.base(text);

            if (this.rText.length > 0) {
                for (var r in this.rText) {
                    if (this.rText[r])
                        this.rText[r].destroy();
                }
            }

            this.rText = [];
            var spacing = 11.5;

            // Replace special chars
            text = text.replace(/&COPY;/g, "a").replace(/&REG;/g, "b");

            var lCount = text.length;
            var letter = 0;
            var kern = R.math.Point2D.create(spacing, 0);
            var lineHeight = this.getSize() * 5;
            var y = 0;

            // Vectorize the text
            var pc = R.math.Point2D.create(0, y);
            while (lCount-- > 0) {
                var ltr = [];
                var chr = text.charCodeAt(letter);
                if (chr == 10) {
                    // Support multi-line text
                    y += (this.getSize() * 10) + this.getLineSpacing();
                    pc.set(0, y);
                }
                else {
                    var glyph = R.text.VectorText.chars[chr - 32];
                    if (glyph.length == 0) {
                        pc.add(kern);
                    }
                    else {

                        for (var p = 0; p < glyph.length; p++) {
                            if (glyph[p] != null) {
                                this.rText.push(R.math.Point2D.create(glyph[p]).add(pc));
                            }
                            else {
                                this.rText.push(null);
                            }
                        }
                        this.rText.push(null);
                        pc.add(kern);
                    }
                }
                letter += 1;
            }
            pc.destroy();
            kern.destroy();
            this.calculateBoundingBox();
        },

        /**
         * @private
         */
        execute:function (renderContext, time, dt) {

            if (this.rText.length == 0) {
                return;
            }

            renderContext.pushTransform();
            var o = R.math.Point2D.create(this.getGameObject().getOrigin());
            o.neg();
            renderContext.setPosition(o);
            o.destroy();
            renderContext.setScale(this.getSize());
            // Set the stroke and fill styles
            if (this.getColor() != null) {
                renderContext.setLineStyle(this.getColor());
            }

            renderContext.setLineWidth(this.getTextWeight());
            renderContext.drawPolyline(this.rText);
            renderContext.popTransform();
        }


    }, /** @scope R.text.VectorText.prototype */ {

        /**
         * Get the class name of this object
         * @return {String} The string "R.text.VectorText"
         */
        getClassName:function () {
            return "R.text.VectorText";
        },

        /**
         * @private
         */
        chars:null,

        /**
         * @private
         */
        _precalc:function () {
            R.text.VectorText.chars = [];
            var lb = function (glyph) {
                var x1 = R.lang.Math2.MAX_INT;
                var x2 = -R.lang.Math2.MAX_INT;
                var y1 = R.lang.Math2.MAX_INT;
                var y2 = -R.lang.Math2.MAX_INT;
                for (var p = 0; p < glyph.length; p++) {
                    var pt = glyph[p];

                    if (pt != null) {
                        if (pt.x < x1) {
                            x1 = pt.x;
                        }
                        if (pt.x > x2) {
                            x2 = pt.x;
                        }
                        if (pt.y < y1) {
                            y1 = pt.y;
                        }
                        if (pt.y > y2) {
                            y2 = pt.y;
                        }
                    }
                }

                // Get the center of the bounding box and move all of the points so none are negative
                var b = R.math.Rectangle2D.create(0, 0, Math.abs(x1) + x2, Math.abs(y1) + y2);
                var hP = R.math.Point2D.create(b.getHalfWidth() + 1, b.getHalfHeight() + 1);
                for (p in glyph) {
                    if (glyph[p]) {
                        glyph[p].add(hP);
                    }
                }
            };

            // Convert the character set into adjusted points
            for (var c in R.text.VectorText.charSet) {
                var chr = R.text.VectorText.charSet[c], newChr = [];

                // Convert to points
                for (var p in chr) {
                    if (chr[p]) {
                        newChr.push(R.math.Point2D.create(chr[p][0], chr[p][1]));
                    }
                    else {
                        newChr.push(null);
                    }
                }

                // Adjust the origin of each point to zero
                lb(newChr);
                R.text.VectorText.chars.push(newChr);
            }
        },

        /**
         * @private
         */
        resolved:function () {
            R.text.VectorText._precalc();
        },

        /**
         * The character set
         * @private
         */
        charSet:[
            [],
            // Space
            [
                [0, -5],
                [0, 3.5],
                null,
                [0, 4.5],
                [-0.5, 4.75],
                [0, 5],
                [0.5, 4.75],
                [0, 4.5]
            ],
            // !
            [
                [-1, -4],
                [-2, -4],
                [-2, -5],
                [-1, -5],
                [-1, -4],
                [-2, -2],
                null,
                [2, -4],
                [1, -4],
                [1, -5],
                [2, -5],
                [2, -4],
                [1, -2]
            ],
            // "
            [
                [-1, -3],
                [-1, 3],
                null,
                [1, -3],
                [1, 3],
                null,
                [-3, -1],
                [3, -1],
                null,
                [-3, 1],
                [3, 1]
            ],
            // #
            [
                [5, -4],
                [-3, -4],
                [-5, -3],
                [-3, 0],
                [3, 0],
                [5, 3],
                [3, 4],
                [-5, 4],
                null,
                [0, -5],
                [0, 5]
            ],
            // $
            [
                [-3, -3],
                [-1, -3],
                [-1, -1],
                [-3, -1],
                [-3, -3],
                null,
                [2, 2],
                [4, 2],
                [4, 4],
                [2, 4],
                [2, 2],
                null,
                [3, -4],
                [-3, 4]
            ],
            // %
            [
                [3, 5],
                [0, -1],
                [-1, -3],
                [0, -4],
                [1, -3],
                [0, -1],
                [-2, 1],
                [-2, 3],
                [-1, 4],
                [1, 4],
                [3, 1]
            ],
            // &
            [
                [-1, -4],
                [-2, -4],
                [-2, -5],
                [-1, -5],
                [-1, -4],
                [-2, -2]
            ],
            // '
            [
                [1, -5],
                [-1, -3],
                [-1, 3],
                [1, 5]
            ],
            // (
            [
                [-1, -5],
                [1, -3],
                [1, 3],
                [-1, 5]
            ],
            // )
            [
                [-3, -3],
                [3, 3],
                null,
                [3, -3],
                [-3, 3],
                null,
                [-3, 0],
                [3, 0],
                null,
                [0, -3],
                [0, 3]
            ],
            // *
            [
                [-4, 0],
                [4, 0],
                null,
                [0, -4],
                [0, 4]
            ],
            // +
            [
                [1, 4],
                [0, 4],
                [0, 3],
                [1, 3],
                [1, 4],
                [0, 5]
            ],
            // ,
            [
                [-4, 1],
                [4, 1]
            ],
            // -
            [
                [0, 4],
                [1, 4],
                [1, 3],
                [0, 3],
                [0, 4]
            ],
            // .
            [
                [5, -5],
                [-5, 5]
            ],
            // /
            //15
            [
                [5, -5],
                [-1, -5],
                [-1, 5],
                [5, 5],
                [5, -5],
                null,
                [5, -5],
                [-1, 5]
            ],
            // 0
            [
                [1, -4],
                [3, -5],
                [3, 5]
            ],
            // 1
            [
                [-5, -3],
                [0, -5],
                [5, -3],
                [-5, 5],
                [5, 5]
            ],
            // 2
            [
                [-5, -5],
                [5, -5],
                [0, -1],
                [5, 2],
                [0, 5],
                [-5, 3]
            ],
            // 3
            [
                [-2, -3],
                [-5, 0],
                [5, 0],
                null,
                [5, -5],
                [5, 5]
            ],
            // 4
            [
                [5, -5],
                [-5, -5],
                [-5, 0],
                [3, 0],
                [5, 2],
                [3, 5],
                [-5, 5]
            ],
            // 5
            [
                [-5, -5],
                [-5, 5],
                [5, 5],
                [5, 0],
                [-5, 0]
            ],
            // 6
            [
                [-5, -5],
                [5, -5],
                [-2, 5]
            ],
            // 7
            [
                [0, 0],
                [-4, -2],
                [0, -5],
                [4, -2],
                [-4, 2],
                [0, 5],
                [4, 2],
                [0, 0]
            ],
            // 8
            [
                [4, 0],
                [-4, 0],
                [-4, -5],
                [4, -5],
                [4, 0],
                [-4, 5]
            ],
            // 9
            //25
            [
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
                [0, 1],
                null,
                [0, 4],
                [1, 4],
                [1, 3],
                [0, 3],
                [0, 4]
            ],
            // :
            [
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
                [0, 1],
                null,
                [1, 4],
                [0, 4],
                [0, 3],
                [1, 3],
                [1, 4],
                [0, 5]
            ],
            // ;
            [
                [4, -5],
                [-2, 0],
                [4, 5]
            ],
            // <
            [
                [-4, -2],
                [4, -2],
                null,
                [-4, 2],
                [4, 2]
            ],
            // =
            [
                [-4, -5],
                [2, 0],
                [-4, 5]
            ],
            // >
            [
                [-3, -3],
                [0, -5],
                [3, -3],
                [0, -1],
                [0, 2],
                null,
                [0, 4],
                [1, 4],
                [1, 3],
                [0, 3],
                [0, 4]
            ],
            // ?
            [
                [3, 5],
                [-3, 5],
                [-5, 3],
                [-5, -3],
                [-3, -5],
                [3, -5],
                [5, -3],
                [5, 2],
                [3, 3],
                [0, 3],
                [0, 0],
                [3, 0]
            ],
            // @
            //32
            [
                [-5, 5],
                [0, -5],
                [5, 5],
                [2, 2],
                [-2, 2]
            ],
            // A
            [
                [-4, 5],
                [-4, -5],
                [3, -5],
                [5, -3],
                [3, 0],
                [-4, 0],
                null,
                [3, 0],
                [5, 3],
                [3, 5],
                [-4, 5]
            ],
            // B
            [
                [5, -3],
                [0, -5],
                [-5, -3],
                [-5, 3],
                [0, 5],
                [5, 3]
            ],
            // C
            [
                [-4, 5],
                [-4, -5],
                [2, -5],
                [4, -3],
                [4, 3],
                [2, 5],
                [-4, 5]
            ],
            // D
            [
                [5, -5],
                [0, -5],
                [-3, -3],
                [0, 0],
                [-3, 3],
                [0, 5],
                [5, 5]
            ],
            // E
            [
                [-4, 5],
                [-4, 0],
                [0, 0],
                [-4, 0],
                [-4, -5],
                [4, -5]
            ],
            // F
            [
                [5, -5],
                [-4, -5],
                [-4, 5],
                [5, 5],
                [5, 1],
                [2, 1]
            ],
            // G
            [
                [-4, 5],
                [-4, -5],
                null,
                [-4, 0],
                [4, 0],
                null,
                [4, -5],
                [4, 5]
            ],
            // H
            [
                [-3, 5],
                [3, 5],
                null,
                [0, 5],
                [0, -5],
                null,
                [-3, -5],
                [3, -5]
            ],
            // I
            [
                [3, -5],
                [3, 3],
                [0, 5],
                [-3, 3]
            ],
            // J
            [
                [-4, 5],
                [-4, -5],
                null,
                [-4, 0],
                [5, -5],
                null,
                [-4, 0],
                [5, 5]
            ],
            // K
            [
                [-4, -5],
                [-4, 5],
                [5, 5]
            ],
            // L
            [
                [-4, 5],
                [-4, -5],
                [0, 0],
                [5, -5],
                [5, 5]
            ],
            // M
            [
                [-4, 5],
                [-4, -5],
                [5, 5],
                [5, -5]
            ],
            // N
            [
                [5, -5],
                [-2, -5],
                [-2, 5],
                [5, 5],
                [5, -5]
            ],
            // O
            [
                [-4, 5],
                [-4, -5],
                [3, -5],
                [5, -3],
                [3, 0],
                [-4, 0]
            ],
            // P
            [
                [-5, 0],
                [0, -5],
                [5, 0],
                [0, 5],
                [-5, 0],
                null,
                [3, 3],
                [5, 5]
            ],
            // Q
            [
                [-4, 5],
                [-4, -5],
                [3, -5],
                [5, -3],
                [3, 0],
                [-4, 0],
                null,
                [3, 0],
                [5, 5]
            ],
            // R
            [
                [5, -5],
                [-3, -5],
                [-5, -3],
                [-3, 0],
                [3, 0],
                [5, 3],
                [3, 5],
                [-5, 5]
            ],
            // S
            [
                [-4, -5],
                [4, -5],
                null,
                [0, -5],
                [0, 5]
            ],
            // T
            [
                [-4, -5],
                [-4, 3],
                [-3, 5],
                [3, 5],
                [5, 3],
                [5, -5]
            ],
            // U
            [
                [-5, -5],
                [0, 5],
                [5, -5]
            ],
            // V
            [
                [-5, -5],
                [-3, 5],
                [0, -3],
                [3, 5],
                [5, -5]
            ],
            // W
            [
                [-4, -5],
                [5, 5],
                null,
                [5, -5],
                [-4, 5]
            ],
            // X
            [
                [-5, -5],
                [0, -2],
                [5, -5],
                null,
                [0, -2],
                [0, 5]
            ],
            // Y
            [
                [-4, -5],
                [5, -5],
                [-4, 5],
                [5, 5]
            ],
            // Z
            //58
            [
                [2, -5],
                [-1, -5],
                [-1, 5],
                [2, 5]
            ],
            // [
            [
                [-5, -5],
                [5, 5]
            ],
            // \
            [
                [-2, -5],
                [1, -5],
                [1, 5],
                [-2, 5]
            ],
            // ]
            [
                [-3, 2],
                [0, -1],
                [3, 2]
            ],
            // ^
            [
                [-5, 5],
                [5, 5]
            ],
            // _
            [
                [1, -4],
                [2, -4],
                [2, -5],
                [1, -5],
                [1, -4],
                [2, -2]
            ],
            // `
            //64
            [
                [5, -3],
                [0, -5],
                [-5, -3],
                [-5, 3],
                [0, 5],
                [5, 3],
                [5, -3],
                null,
                [3, -1],
                [0, -3],
                [-3, -1],
                [-3, 1],
                [0, 3],
                [3, 1]
            ],
            // &copy;
            [
                [5, -3],
                [0, -5],
                [-5, -3],
                [-5, 3],
                [0, 5],
                [5, 3],
                [5, -3],
                null,
                [-3, 2],
                [-3, -2],
                [2, -2],
                [3, -1],
                [2, 0],
                [-3, 0],
                null,
                [2, 0],
                [3, 2]
            ]
        ] // &reg;
    });

};