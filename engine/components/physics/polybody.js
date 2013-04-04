/**
 * The Render Engine
 * PolyBodyComponent
 *
 * @fileoverview A physical polygonal body component for use in a {@link R.physics.Simulation}.
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
    "class":"R.components.physics.PolyBody",
    "requires":[
        "R.components.physics.BaseBody",
        "R.math.Math2D"
    ]
});

/**
 * @class An extension of {@link R.components.BaseBody} which creates a polygonal
 *        rigid body.  The polygon must be a convex polygon.
 *
 * @param name {String} Name of the component
 * @param points {Array} An array of points defining the body shape
 *
 * @extends R.components.physics.BaseBody
 * @constructor
 * @description A polygonal rigid body component.
 */
R.components.physics.PolyBody = function () {
    return R.components.physics.BaseBody.extend(/** @scope R.components.physics.PolyBody.prototype */{

        points:null,
        center:null,
        extents:null,

        /**
         * @private
         */
        constructor:function (name, points) {
            var fixDef = new Box2D.Dynamics.b2FixtureDef();
            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();

            this.base(name, fixDef);
            this.points = points;

            // Calculate the extents of the points
            this.extents = R.math.Math2D.getBoundingBox(points);

            // Calculate the center of the points
            this.center = R.math.Math2D.getCenterOfPoints(points);
            this.setLocalOrigin(this.center);
        },

        /**
         * Destroy the object
         */
        destroy:function () {
            this.center.destroy();
            this.extents.destroy();
            this.base();
        },

        /**
         * Return the object to the pool.
         */
        release:function () {
            this.points = null;
            this.center = null;
            this.extents = null;
            this.base();
        },

        setGameObject:function (gameObject) {
            this.base(gameObject);

            var scaled = [], pt = R.math.Point2D.create(0, 0);
            for (var p = 0; p < this.points.length; p++) {
                pt.set(this.points[p]);
                pt.div(R.physics.Simulation.WORLD_SIZE);
                scaled.push(new Box2D.Common.Math.b2Vec2(pt.x, pt.y));
            }
            this.getFixtureDef().shape.SetAsArray(scaled);
            pt.destroy();
        },

        /**
         * Get a box which bounds the body, local to the body.
         * @return {R.math.Rectangle2D}
         */
        getBoundingBox:function () {
            return this.extents;
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
                renderContext.setScale(1 / this.getScale());
                renderContext.drawPolygon(this.points);
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