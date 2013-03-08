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
    "class":"R.struct.MouseInfo",
    "requires":[
        "R.engine.PooledObject",
        "R.math.Point2D",
        "R.math.Vector2D",
        "R.engine.Events"
    ]
});

/**
 * @class An object which contains information about the mouse in relation to
 *        a rendering context.
 *
 * @extends R.engine.PooledObject
 * @constructor
 * @description Creates a mouse data structure.
 */
R.struct.MouseInfo = function () {
    return R.engine.PooledObject.extend(/** @scope R.struct.MouseInfo.prototype */{

        /**
         * The current mouse position
         * @type {R.math.Point2D}
         */
        position:null,

        /**
         * The last mouse position
         * @type {R.math.Point2D}
         */
        lastPosition:null,

        /**
         * The position at which a mouse button was pressed
         * @type {R.math.Point2D}
         */
        downPosition:null,

        /**
         * The currently pressed mouse button.  See {@link R.engine.Events}
         * @type {Number}
         */
        button:-1,

        /**
         * A vector indicating the direction and amount of mouse movement.
         * @type {R.math.Vector2D}
         */
        moveVec:null,

        /**
         * A normalized vector indicating the direction of mouse movement after a
         * button was pressed and held.
         * @type {R.math.Vector2D}
         */
        dragVec:null,

        /**
         * The game object the mouse is currently over
         * @type {R.engine.GameObject}
         */
        lastOver:null,

        /** @private */
        moveTimer:null,

        /** @private */
        constructor:function () {
            this.position = R.math.Point2D.create(0, 0);
            this.lastPosition = R.math.Point2D.create(0, 0);
            this.downPosition = R.math.Point2D.create(0, 0);
            this.button = R.engine.Events.MOUSE_NO_BUTTON;
            this.moveVec = R.math.Vector2D.create(0, 0);
            this.dragVec = R.math.Vector2D.create(0, 0);
            this.lastOver = null;
            this.moveTimer = null;
            this.base(arguments[0] || "MouseInfo");
        },

        /**
         * Destroy the collision data object.
         */
        destroy:function () {
            this.position.destroy();
            this.lastPosition.destroy();
            this.downPosition.destroy();
            this.moveVec.destroy();
            this.dragVec.destroy();
            this.base();
        },

        /**
         * Release the collision data object back into the pool for reuse.
         */
        release:function () {
            this.base();
            this.position = null;
            this.lastPosition = null;
            this.downPosition = null;
            this.button = -1
            this.moveVec = null;
            this.dragVec = null;
            this.lastOver = null;
            this.moveTimer = null;
        }

    }, {
        getClassName:function () {
            return "R.struct.MouseInfo";
        }
    });
};

