/**
 * The Render Engine
 * HTMLDivContext
 *
 * @fileoverview A render context which wraps a DIV element.
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
    "class":"R.rendercontexts.HTMLDivContext",
    "requires":[
        "R.rendercontexts.HTMLElementContext",
        "R.math.Rectangle2D"
    ]
});

/**
 * @class A simple extension of the {@link R.rendercontexts.HTMLElementContext} which uses a DIV
 * element to represent the context.  This is just a convenience method.
 * <p/>
 *
 * @extends R.rendercontexts.HTMLElementContext
 * @constructor
 * @description Create a new instance of a context drawn on a <tt>div</tt> element.
 * @param name {String} The name of the context
 * @param contextWidth {Number} The width (in pixels) of the context.
 * @param contextHeight {Number} The height (in pixels) of the context.
 */
R.rendercontexts.HTMLDivContext = function () {
    return R.rendercontexts.HTMLElementContext.extend(/** @scope R.rendercontexts.HTMLDivContext.prototype */{

        /** @private */
        constructor:function (name, contextWidth, contextHeight) {
            var ctx = $("<div>").css({
                width:contextWidth,
                height:contextHeight,
                position:"absolute",
                overflow:"hidden"
            });
            this.base(name || "HTMLDivContext", ctx);
            this.setViewport(R.math.Rectangle2D.create(0, 0, contextWidth, contextHeight));
        }

    }, /** @scope R.rendercontexts.HTMLDivContext.prototype */ {

        /**
         * Get the class name of this object
         *
         * @return {String} "R.rendercontexts.HTMLDivContext"
         */
        getClassName:function () {
            return "R.rendercontexts.HTMLDivContext";
        }
    });

}