/**
 * The Render Engine
 * BoxColliderComponent
 *
 * @fileoverview A collision component which determines collisions via
 *               bounding box comparisons.
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
    "class":"R.components.collision.Box",
    "requires":[
        "R.components.Collider",
        "R.math.Point2D",
        "R.math.Rectangle2D"
    ]
});

/**
 * @class An extension of the {@link R.components.Collider} which will check the
 *        object's axis-aligned bounding boxes for collision.
 *             <p/>
 *             By default, this component will perform a simple intersection test which results
 *             in a simple <code>true</code> or <code>false</code> test.  A more detailed test
 *             can be made by setting the component to perform a longest axis circle-to-circle collision
 *             test which will result in a collision data structure if a collision occurs.  Setting
 *             the testing mode is done by calling the {@link #setTestMode} method.
 *
 * @param name {String} Name of the component
 * @param collisionModel {R.spatial.AbstractSpatialContainer} The collision model
 * @param priority {Number} Between 0.0 and 1.0, with 1.0 being highest
 *
 * @extends R.components.Collider
 * @constructor
 * @description Creates a collider component for box-box collision testing.  Each object
 *              must implement the {@link R.objects.Object2D#getWorldBox} method and return a
 *              world-oriented bounding box.
 */
R.components.collision.Box = function () {
    "use strict";
    return R.components.Collider.extend(/** @scope R.components.collision.Box.prototype */{

        hasMethod:false,

        /**
         * Releases the component back into the pool for reuse.  See {@link PooledObject#release}
         * for more information.
         */
        release:function () {
            this.base();
            this.hasMethod = false;
        },

        /**
         * Establishes the link between this component and its game object.
         * When you assign components to a game object, it will call this method
         * so that each component can refer to its game object, the same way
         * a game object can refer to a component with {@link R.engine.GameObject#getComponent}.
         *
         * @param gameObject {R.engine.GameObject} The object which hosts this component
         */
        setGameObject:function (gameObject) {
            this.base(gameObject);
            this.hasMethod = (gameObject.getWorldBox != undefined);
            /* pragma:DEBUG_START */
            // Test if the host has getWorldBox
            AssertWarn(this.hasMethod, "Object " + gameObject.toString() + " does not have getWorldBox() method");
            /* pragma:DEBUG_END */
        },

        /**
         * If a collision occurs, calls the host object's <tt>onCollide()</tt> method,
         * passing the time of the collision, the potential collision object, and the host
         * and target masks.  The return value should either tell the collision tests to continue or stop.
         *
         * @param time {Number} The engine time (in milliseconds) when the potential collision occurred
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         * @param collisionObj {R.engine.GameObject} The game object with which the collision potentially occurs
         * @param objectMask {Number} The collision mask for the game object
         * @param targetMask {Number} The collision mask for <tt>collisionObj</tt>
         * @return {Number} A status indicating whether to continue checking, or to stop
         */
        testCollision:function (time, dt, collisionObj, objectMask, targetMask) {
            if (this.getCollisionData() != null) {
                // Clean up old data first
                this.getCollisionData().destroy();
                this.setCollisionData(null);
            }

            // Early out if no method(s)
            if (!this.hasMethods && !collisionObj.getWorldBox) {
                return R.components.Collider.CONTINUE;	// Can't perform test
            }

            // See if a collision will occur
            var linked = this.getLinkedBody(),
                host = this.getGameObject(),
                box1 = linked ? R.math.Rectangle2D.create(host.getWorldBox()).offset(R.math.Point2D.create(linked.getLocalOrigin()).neg()) : host.getWorldBox(),
                box2 = collisionObj.getWorldBox();

            if (this.getTestMode() == R.components.Collider.SIMPLE_TEST) {
                if (box1.isIntersecting(box2)) {
                    // Intersection test passed
                    return this.base(time, dt, collisionObj, objectMask, targetMask);
                }
            } else {
                // We'll approximate using the separating circles method, using the
                // longest axis between width & height
                var tRad = Math.max(box1.getHalfWidth(), box1.getHalfHeight()) + Math.max(box2.getHalfWidth(), box2.getHalfHeight()),
                    c1 = box1.getCenter(), c2 = box2.getCenter();

                var distSqr = (c1.x - c2.x) * (c1.x - c2.x) +
                    (c1.y - c2.y) * (c1.y - c2.y);

                if (distSqr < (tRad * tRad)) {
                    // If we got here, there is a possible collision.  However, we still need to
                    // compare based on the objects bounding boxes.  We will need to see if the bounding boxes
                    // are indeed colliding. Remember, this happens before rendering so the position
                    // is probably _ahead_ of the actual rendered position.
                    var diff = tRad - Math.sqrt(distSqr);

                    // This normal is from the center points of each object, pointing back at the host
                    var normalVector = R.math.Vector2D.create(c2.x - c1.x, c2.y - c1.y).normalize();
                    var separationVector = normalVector.mul(diff);
                    this.setCollisionData(R.struct.CollisionData.create(
                        separationVector.len(),
                        normalVector,
                        host,
                        collisionObj,
                        separationVector,
                        time,
                        dt
                    ));

                    return this.base(time, dt, collisionObj, objectMask, targetMask);
                }
            }

            return R.components.Collider.CONTINUE;
        }

        /* pragma:DEBUG_START */, execute:function (renderContext, time, dt) {
            this.base(renderContext, time, dt);
            // Debug the collision box
            if (R.Engine.getDebugMode() && !this.isDestroyed()) {
                var linked = this.getLinkedBody(),
                    origin = R.math.Point2D.create(linked ? linked.getLocalOrigin() : R.math.Point2D.ZERO),
                    rect = R.math.Rectangle2D.create(this.getGameObject().getWorldBox());

                rect.offset(origin.neg());

                renderContext.postRender(function () {
                    this.setLineStyle("yellow");
                    this.setLineWidth(1);
                    this.drawRectangle(rect);
                });

                origin.destroy();
            }
        }
        /* pragma:DEBUG_END */


    }, { /** @scope R.components.collision.Box.prototype */

        /**
         * Get the class name of this object
         * @return {String} "R.components.collision.Box"
         */
        getClassName:function () {
            return "R.components.collision.Box";
        }

    });
}