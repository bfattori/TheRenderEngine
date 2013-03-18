/**
 * The Render Engine
 * LogicComponent
 *
 * @fileoverview The base logic component.
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
    "class":"R.components.Logic",
    "requires":[
        "R.components.Base"
    ]
});

/**
 * @class Logic components are sort of a catch-all of components.  They aren't
 *        any one of the specific types, so they fall under the type of LOGIC.
 *        Logic components are in the middle of the importance scale, so they
 *        are processed after input and transformations, but before collision and
 *        rendering.  This makes them ideal for additional processing, such as the
 *        {@link R.components.HostComponent}.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of the component
 * @extends R.components.Base
 * @constructor
 * @description Creates a logic component.
 */
R.components.Logic = function () {
    "use strict";
    return R.components.Base.extend(/** @scope R.components.Logic.prototype */{

        /**
         * @private
         */
        constructor:function (name, priority) {
            this.base(name, R.components.Base.TYPE_LOGIC, priority || 1.0);
        }
    }, /** @scope R.components.Logic.prototype */{
        /**
         * Get the class name of this object
         * @return {String} "R.components.Logic"
         */
        getClassName:function () {
            return "R.components.Logic";
        }
    });
}