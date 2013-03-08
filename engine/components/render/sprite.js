/**
 * The Render Engine
 * SpriteComponent
 *
 * @fileoverview An extension of the render component which handles sprite
 *               resource rendering.
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
    "class":"R.components.render.Sprite",
    "requires":[
        "R.components.Render"
    ]
});

/**
 * @class A render component that renders its contents from a {@link R.resources.types.Sprite}.  Sprites
 *        are 2d graphics which are either a single frame (static) or multiple frames
 *        (animation).  The sprite's descriptor will define that for the component.
 *
 * @param name {String} The component name
 * @param [priority=0.1] {Number} The render priority
 * @param sprite {R.resources.types.Sprite} The sprite to render
 * @extends R.components.Render
 * @constructor
 * @description Create a sprite component.
 */
R.components.render.Sprite = function () {
    "use strict";
    return R.components.Render.extend(/** @scope R.components.render.Sprite.prototype */{

        currentSprite:null,

        /**
         * @private
         */
        constructor:function (name, priority, sprite) {
            if (priority instanceof R.resources.types.Sprite) {
                sprite = priority;
                priority = 0.1;
            }
            this.base(name, priority);
            this.currentSprite = sprite;
        },

        /**
         * Releases the component back into the object pool. See {@link R.engine.PooledObject#release} for
         * more information.
         */
        release:function () {
            this.base();
            this.currentSprite = null;
        },

        /**
         * Calculate the bounding box from the set of
         * points which comprise the shape to be rendered.
         * @private
         */
        calculateBoundingBox:function () {
            return this.currentSprite.getBoundingBox();
        },

        /**
         * Set the sprite the component will render.
         *
         * @param sprite {R.resources.types.Sprite} The sprite to render
         */
        setSprite:function (sprite) {
            this.currentSprite = sprite;

            if (this.getGameObject().jQ()) {
                this.getGameObject().jQ().css({
                    width:sprite.getBoundingBox().len_x(),
                    height:sprite.getBoundingBox().len_y(),
                    background:"url('" + sprite.getSourceImage().src + "') no-repeat"
                });
            }
            this.getGameObject().markDirty();
        },

        /**
         * Get the sprite the component is rendering.
         *
         * @return {R.resources.types.Sprite} A <tt>R.resources.types.Sprite</tt> instance
         */
        getSprite:function () {
            return this.currentSprite;
        },

        /**
         * Draw the sprite to the render context.  The frame, for animated
         * sprites, will be automatically determined based on the current
         * time passed as the second argument.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render to
         * @param time {Number} The engine time in milliseconds
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        execute:function (renderContext, time, dt) {

            if (!this.base(renderContext, time, dt)) {
                return;
            }

            if (this.currentSprite) {
                this.transformOrigin(renderContext, true);
                renderContext.drawSprite(this.currentSprite, time, dt, this.getGameObject());
                this.transformOrigin(renderContext, false);
            }
        }
    }, /** @scope R.components.render.Sprite.prototype */{
        /**
         * Get the class name of this object
         *
         * @return {String} "R.components.render.Sprite"
         */
        getClassName:function () {
            return "R.components.render.Sprite";
        }
    });
};