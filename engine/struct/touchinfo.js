/**
 * The Render Engine
 * MouseInfo
 *
 * @fileoverview Data object which holds mouse information.
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
    "class":"R.struct.TouchInfo",
    "requires":[
        "R.struct.MouseInfo",
        "R.struct.Touch"
    ]
});

/**
 * @class An object which contains information about touch gestures in relation to
 *        a rendering context.
 *
 * @extends R.struct.MouseInfo
 * @constructor
 * @description Creates a touch data structure.
 */
R.struct.TouchInfo = function () {
    return R.struct.MouseInfo.extend(/** @scope R.struct.TouchInfo.prototype */{

        /**
         * All touches.  See {@link R.struct.Touch} for more info.
         * @type {Array}
         */
        touches:null,

        /** @private */
        constructor:function () {
            this.touches = [];
            this.base("TouchInfo");
        },

        /**
         * Release the collision data object back into the pool for reuse.
         */
        release:function () {
            this.base();
            this.touches = null;
        }

    }, {
        getClassName:function () {
            return "R.struct.TouchInfo";
        },

        /**
         * Process the touches and pass an array of touch objects to be handled by the
         * host object.
         * @private
         */
        processTouches:function (eventObj) {
            var touches = [];
            if (eventObj.touches) {
                for (var i = 0; i < eventObj.touches.length; i++) {
                    touches.push(new R.struct.Touch(eventObj.touches[i]));
                }
            }
            return touches;
        }

    });
};

