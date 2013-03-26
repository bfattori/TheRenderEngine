/**
 * The Render Engine
 * PooledMathObject
 *
 * @fileoverview A library of math primitive objects, including points, vectors, rectangles,
 *                   and circles.
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
    "class":"R.math.PooledMathObject",
    "requires":[
        "R.engine.PooledObject"
    ]
});

/**
 * @class The base object class which represents a math object within
 * the engine.  All math objects should extend from this class mainly due to
 * the fact that the engine can switch between pooling the object and running
 * transiently.
 * <p/>
 * Google's Chrome browser seems to operate better with transient objects while
 * other browsers appear to run better with pooled objects.
 * <p/>
 *
 * @param name {String} The name of the object
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a math object.
 */
R.math.PooledMathObject = function () {
    "use strict";
    return R.engine.PooledObject.extend(/** @scope R.math.PooledMathObject.prototype */{

        /** @private */
        constructor:function (name) {
            if (!R.Engine.options.transientMathObject) {
                this.base(name);
            }
        },

        /**
         * Destroy this object instance (remove it from the Engine).  The object's release
         * method is called after destruction so it will be returned to the pool of objects
         * to be used again.
         */
        destroy:function () {
            if (!R.Engine.options.transientMathObject) {
                this.base();
            }
        }

    }, /** @scope R.math.PooledMathObject.prototype */ {

        /**
         * Similar to a constructor, all pooled objects implement this method.
         * The <tt>create()</tt> method will either create a new instance, if no object of the object's
         * class exists within the pool, or will reuse an existing pooled instance of
         * the object.  Either way, the constructor for the object instance is called so that
         * instance creation can be maintained in the constructor.
         * <p/>
         * Usage: <tt>var obj = [ObjectClass].create(arg1, arg2, arg3...);</tt>
         *
         * @memberof R.math.PooledMathObject
         */
        create:function () {
            if (R.Engine.options.transientMathObject) {
                return new this(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]);
            }
            else {
                return R.engine.PooledObject.create.apply(this, arguments);
            }
        },

        /**
         * Get the class name of this object
         *
         * @return {String} "R.math.PooledMathObject"
         */
        getClassName:function () {
            return "R.math.PooledMathObject";
        }

    });

}