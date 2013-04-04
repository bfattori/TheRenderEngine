/**
 * The Render Engine
 * BoxBodyComponent
 *
 * @fileoverview A physical rectangular body component for use in a {@link Simulation}.
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
    "class":"R.components.physics.BoxBody",
    "requires":[
        "R.components.physics.BaseBody",
        "R.math.Math2D"
    ]
});

/**
 * @class An extension of the {@link R.components.BaseBody} which creates a rectangular
 *        rigid body.
 *
 * @param name {String} Name of the component
 * @param extents {R.math.Vector2D} The full extents of the body along X and Y
 *
 * @extends R.components.physics.BaseBody
 * @constructor
 * @description A rectangular rigid body component.
 */
R.components.physics.BoxBody = function () {
    return R.components.physics.BaseBody.extend(/** @scope R.components.physics.BoxBody.prototype */{

        extents:null,

        /**
         * @private
         */
        constructor:function (name, extents) {
            var fixDef = new Box2D.Dynamics.b2FixtureDef();
            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();

            this.base(name, fixDef);
            this.extents = R.clone(extents);
            this.extents.div(R.physics.Simulation.WORLD_SIZE);
            this.setLocalOrigin(extents.x / 2, extents.y / 2);
        },

        /**
         * Destroy the object
         */
        destroy:function () {
            this.extents.destroy();
            this.base();
        },

        /**
         * Return the object to the pool.
         */
        release:function () {
            this.extents = null;
            this.base();
        },

        setGameObject:function (gameObject) {
            this.base(gameObject);

            this.getFixtureDef().shape.SetAsBox(this.extents.x / 2, this.extents.y / 2);	// Half width and height
        },

        /**
         * Get a box which bounds the body, local to the body.
         * @return {R.math.Rectangle2D}
         */
        getBoundingBox:function () {
            var box = this.base();
            var e = R.clone(this.getExtents()).mul(R.physics.Simulation.WORLD_SIZE);
            box.set(0, 0, e.x, e.y);
            e.destroy();
            return box;
        },

        /**
         * Set the extents of the box's body.  Calling this method after the
         * simulation of the body has started has no effect.
         *
         * @param extents {R.math.Point2D} The extents of the body along X and Y
         */
        setExtents:function (extents) {
            this.extents = R.clone(extents).div(R.physics.Simulation.WORLD_SIZE);
            this.getFixtureDef().SetAsBox(this.extents.x / 2, this.extents.y / 2);
            if (this.simulation) {
                this.updateFixture();
            }
        },

        /**
         * Get the extents of the box's body.
         * @return {R.math.Point2D}
         */
        getExtents:function () {
            return this.extents;
        }

        /* pragma:DEBUG_START */
        /**
         * Adds shape debugging
         * @private
         */, execute:function (renderContext, time, dt) {
            this.base(renderContext, time, dt);
            if (R.Engine.getDebugMode()) {
                renderContext.pushTransform();
                renderContext.setLineStyle("blue");
                var ext = R.clone(this.extents).mul(R.physics.Simulation.WORLD_SIZE);
                var hx = ext.x / 2;
                var hy = ext.y / 2;
                var rect = R.math.Rectangle2D.create(-hx, -hy, hx * 2, hy * 2);
                renderContext.drawRectangle(rect);
                rect.destroy();
                ext.destroy();
                renderContext.popTransform();
            }
        }
        /* pragma:DEBUG_END */


    }, { /** @scope R.components.physics.BoxBody.prototype */

        /**
         * Get the class name of this object
         *
         * @return {String} "R.components.physics.BoxBody"
         */
        getClassName:function () {
            return "R.components.physics.BoxBody";
        }

    });
};