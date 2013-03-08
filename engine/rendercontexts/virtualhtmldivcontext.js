/**
 * The Render Engine
 * VirtualHTMLDivContext
 *
 * @fileoverview An extension of the HTML div context used to represent a game world larger than
 *    the viewport.
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
    "class":"R.rendercontexts.VirtualHTMLDivContext",
    "requires":[
        "R.rendercontexts.HTMLDivContext",
        "R.math.Math2D"
    ]
});

/**
 * @class A HTML element render context whose world boundary is larger than the actual
 *        viewport.  This allows the world to be rendered as if viewed through a
 *        window into a larger world.  You can set the world position with simple
 *        scroll methods, or cause the world to transition to a specific point over
 *        a given duration.
 *
 * @constructor
 * @param name {String} The name of the object
 * @param windowWidth {Number} The width of the viewable window, in pixels
 * @param windowHeight {Number} The height of the viewable window, in pixels
 * @param worldWidth {Number} The width of the world, in pixels
 * @param worldHeight {Number} The height of the world, in pixels
 * @extends R.rendercontexts.CanvasContext
 */
R.rendercontexts.VirtualHTMLDivContext = function () {
    return R.rendercontexts.HTMLDivContext.extend(/** @scope R.rendercontexts.VirtualHTMLDivContext.prototype */{

        scrollFromPt:null,
        scrollToPt:null,
        moving:false,
        expireTime:0,
        duration:0,

        /** @private */
        constructor:function (name, windowWidth, windowHeight, worldWidth, worldHeight) {
            // Create an element for us to use as our window
            this.base(name || "VirtualHTMLDivContext", windowWidth, windowHeight);
            this.setWorldBoundary(R.math.Rectangle2D.create(0, 0, worldWidth, worldHeight));

            // To force the element to have scrollable space, we create a div element
            // within the context's element which is the size of the world
            var shim = $("<div></div>").css({
                width:worldWidth,
                height:worldHeight,
                position:"relative",
                left:0,
                top:0
            });
            this.jQ().append(shim);

            this.scrollToPt = R.math.Point2D.create(0, 0);
            this.scrollFromPt = R.math.Point2D.create(0, 0);
            this.moving = false;
            this.expireTime = 0;
            this.duration = 0;
        },

        /**
         * Set the horizontal world position in pixels.
         *
         * @param x {Number} The horizontal scroll in pixels
         */
        setHorizontalScroll:function (x) {
            var maxX = this.getWorldBoundary().w - this.getViewport().w;
            x = (x < 0 ? 0 : (x > maxX ? maxX : x));
            this.getWorldPosition().setX(x);
            this.getViewport().getTopLeft().setX(x);
            this.jQ().scrollLeft(x);
        },

        /**
         * Set the vertical world position in pixels.
         *
         * @param y {Number} The vertical scroll in pixels
         */
        setVerticalScroll:function (y) {
            var maxY = this.getWorldBoundary().h - this.getViewport().h;
            y = (y < 0 ? 0 : (y > maxY ? maxY : y));
            this.getWorldPosition().setY(y);
            this.getViewport().getTopLeft().setY(y);
            this.jQ().scrollTop(x);
        },

        /**
         * Set the current world position to a specific point.
         * @param pt {R.math.Point2D} The point to set the scroll to.
         */
        setScroll:function (pt) {
            this.setHorizontalScroll(pt.x);
            this.setVerticalScroll(pt.y);
        },

        /**
         * Scroll to the given point, or location, over the given duration.
         * @param duration {Number} The number of milliseconds for the transition to occur
         * @param ptOrX {Number|R.math.Point2D} The X coordinate, or point, to scroll to
         * @param [y] {Number} The Y coordinate, if <tt>ptOrX</tt> is a number
         */
        scrollTo:function (duration, ptOrX, y) {
            this.scrollFromPt.set(this.getWorldPosition());
            this.scrollToPt.set(ptOrX, y);
            this.moving = true;
            this.expireTime = R.Engine.worldTime + duration;
            this.duration = duration;
        },

        /**
         * Get the horizontal scroll amount in pixels.
         * @return {Number} The horizontal scroll
         */
        getHorizontalScroll:function () {
            return this.getWorldPosition().x;
        },

        /**
         * Get the vertical scroll amount in pixels.
         * @return {Number} The vertical scroll
         */
        getVerticalScroll:function () {
            return this.getWorldPosition().y;
        },

        /**
         * If a transition was initiated with {@link #scrollTo},
         * this will update the viewport accordingly.
         *
         * @param worldTime {Number} The current world time
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        setupWorld:function (worldTime, dt) {
            if (this.moving) {
                if (worldTime < this.expireTime) {
                    // Moving
                    var sc = R.math.Point2D.create(this.scrollToPt).sub(this.scrollFromPt)
                            .mul((this.duration - (this.expireTime - worldTime)) / this.duration),
                        sp = R.math.Point2D.create(this.scrollFromPt).add(sc);
                    this.setScroll(sp);
                    sc.destroy();
                    sp.destroy();
                } else {
                    // Arrived
                    this.moving = false;
                    this.expireTime = 0;
                    this.setScroll(this.scrollToPt);
                }
            }
            this.base(worldTime, dt);
        }

    }, /** @scope R.rendercontexts.VirtualHTMLDivContext.prototype */ {

        /**
         * Get the class name of this object
         * @return {String} The string "R.rendercontexts.VirtualHTMLDivContext"
         */
        getClassName:function () {
            return "R.rendercontexts.VirtualHTMLDivContext";
        }
    });

};
