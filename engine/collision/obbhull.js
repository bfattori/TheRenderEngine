/**
 * The Render Engine
 * AABBHull
 *
 * @fileoverview A collision shape which represents an object's bounding box
 *                   as the convex hull.
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
    "class":"R.collision.OBBHull",
    "requires":[
        "R.collision.ConvexHull",
        "R.math.Point2D"
    ]
});

/**
 * @class A rectangular convex hull.
 *
 * @param boundingBox {Rectangle2D} The object's bounding box
 *
 * @extends R.collision.ConvexHull
 * @constructor
 * @description Creates an Object Bounding Box hull.
 */
R.collision.OBBHull = function () {
    "use strict";
    return R.collision.ConvexHull.extend(/** @scope R.collision.OBBHull.prototype */{

        /** @private */
        constructor:function (rect) {
            var points = [
                R.math.Point2D.create(0, 0),
                R.math.Point2D.create(rect.w, 0),
                R.math.Point2D.create(rect.w, rect.h),
                R.math.Point2D.create(0, rect.h)
            ];
            this.base(points);
        }

    }, /** @scope R.collision.OBBHull.prototype */{
        /**
         * Get the class name of this object
         * @return {String} "R.collision.OBBHull"
         */
        getClassName:function () {
            return "R.collision.OBBHull";
        }
    });

}