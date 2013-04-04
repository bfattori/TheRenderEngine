/**
 * The Render Engine
 * DebugComponent
 *
 * @fileoverview A debugging component.
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
    "class":"R.components.debug.ConvexHull",
    "requires":[
        "R.components.Debug"
    ]
});

/**
 * @class A debugging component to render helpful debug widgets alongside an object.
 *
 * @param name {String} Name of the component
 *
 * @extends R.components.Render
 * @constructor
 * @description A debugging component.
 */
R.components.debug.ConvexHull = function () {
    "use strict";
    return R.components.Debug.extend(/** @scope R.components.debug.ConvexHull.prototype */{

        /**
         * @private
         */
        constructor:function () {
            this.base("ConvexHullDebug");
        },

        /**
         * Draws the convex hull of the object
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context for the component
         * @param time {Number} The current engine time in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        execute:function (renderContext, time, dt) {
            if (!this.isDestroyed()) {
                renderContext.pushTransform();
                renderContext.setLineStyle("yellow");
                var cHull = this.getGameObject().getCollisionHull();
                if (cHull.getType() == R.collision.ConvexHull.CONVEX_NGON) {
                    renderContext.drawPolygon(cHull.getVertexes());
                } else {
                    renderContext.drawArc(this.getGameObject().getRenderPosition(), cHull.getRadius(), 0, 359);
                }
                renderContext.popTransform();
            }
        }

    }, /** @scope R.components.debug.ConvexHull.prototype */{ // Statics

        /**
         * Get the class name of this object
         *
         * @return {String} "R.components.debug.ConvexHull"
         */
        getClassName:function () {
            return "R.components.debug.ConvexHull";
        }

    });
};

