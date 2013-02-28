/**
 * The Render Engine
 * SpriteLoader
 *
 * @fileoverview An extension of the image resource loader for handling
 *               sprites.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1556 $
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
    "class":"R.resources.loaders.SpriteLoader",
    "requires":[
        "R.resources.loaders.ImageLoader",
        "R.resources.types.Sprite"
    ]
});

/**
 * @class Loads sprite resources and makes them available to the system.  Sprites are
 *        defined by an external JSON resource file.  A sprite definition file
 *        is a JSON file which can support single-line comments.  The format
 *        describes the image which contains the bitmap, the size of the bitmap,
 *        the version of the file, and the sprites.  Sprites can be either single
 *        frames or animations.  Animations are expected to be sequentially organized
 *        in the bitmap from left to right.  Each frame of an animation must be the exact
 *        same dimensions.
 *        <p/>
 *        A frame is simply defined by the upper left corner of the sprite and the
 *        width and height of the frame.  For an animation, the first four arguments are
 *        the same as a frame, followed by the frame count, the millisecond delay between
 *        frames, and the type of animation (either "loop" or "toggle").  A looped animation
 *        will play all frames, indicated by the frame count, and then start again from the
 *        beginning of the animation.  A toggled animation will play from the first to
 *        the last frame, then play from the last to the first, and then repeat.  The
 *        first and last frame will not be repeated in a toggled animation.  Thus, if
 *        the frames are A, B, C, then the toggle will play as A, B, C, B, A, B...
 * <pre>
 * {
 *    // Sprite definition file v2
 *    "bitmapImage": "bitmapFile.ext",
 *    "bitmapSize": [320, 320],
 *    "version": 2
 *    "sprites": {
 *        "stand": [0, 0, 32, 32],
 *        "walk": [32, 0, 32, 32, 3, 150, "loop"]
 *    }
 * }
 * </pre>
 *        <i>Note:</i> The new file structure is a bit more compact, and is indicated with
 *        the "version" key in the file, set to the value 2.  Version 1 will be deprecated
 *        and will not be supported in a future release of The Render Engine.
 *
 * @constructor
 * @param name {String=SpriteLoader} The name of the resource loader
 * @extends R.resources.loaders.ImageLoader
 */
R.resources.loaders.SpriteLoader = function () {
    return R.resources.loaders.ImageLoader.extend(/** @scope R.resources.loaders.SpriteLoader.prototype */{

        sprites:null,

        queuedSprites:0,

        /** @private */
        constructor:function (name) {
            this.base(name || "SpriteLoader");
            this.sprites = {};
            this.queuedSprites = 0;
        },

        /**
         * Load a sprite resource from a URL.
         *
         * @param name {String} The name of the resource
         * @param url {String} The URL where the resource is located
         */
        load:function (name, url /*, info, path */) {
            if (!arguments[2]) {
                var loc = window.location;
                if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.hostname) == -1) {
                    Assert(false, "Sprites must be located on this server");
                }

                this.queuedSprites++;
                var thisObj = this;

                // Get the file from the server
                R.engine.Script.loadJSON(url, function (spriteInfo) {
                    // get the path to the resource file
                    var path = url.substring(0, url.lastIndexOf("/"));
                    thisObj.load(name, url, spriteInfo, path + "/");
                    thisObj.afterLoad(name, spriteInfo, path + "/");
                });
            }
            else {
                var info = arguments[2], path = arguments[3];
                info.bitmapImage = path + info.bitmapImage;
                R.debug.Console.info("Loading sprite: " + name + " @ " + info.bitmapImage);

                // Load the sprite image file
                if (!info.version || info.version == 1) {
                    this.base(name, info.bitmapImage, info.bitmapWidth, info.bitmapHeight);
                } else if (info.version == 2) {
                    this.base(name, info.bitmapImage, info.bitmapSize[0], info.bitmapSize[1]);
                }

                // Store the sprite info
                this.sprites[name] = info;

                // Since the path that is stored by ImageLoader is the path to the image
                // and not the descriptor, we need to override the value
                this.setPathUrl(name, url);

                this.queuedSprites--;
            }
        },

        /**
         * Called after the data has been loaded, passing along the info object and name
         * of the sprite resource.
         * @param name {String} The name of the sprite resource
         * @param info {Object} The sprite resource definition
         */
        afterLoad:function (name, info) {
        },

        /**
         * Get the sprite resource with the specified name from the cache.  The
         * object returned contains the bitmap as <tt>image</tt> and
         * the sprite definition as <tt>info</tt>.
         *
         * @param name {String} The name of the object to retrieve
         * @return {Object} An object with two keys: "image" and "info"
         */
        get:function (name) {
            var bitmap = this.base(name);
            var sprite = {
                resourceName:name,
                image:bitmap,
                info:this.sprites[name]
            };
            return sprite;
        },

        /**
         * Check to see if a named resource is "ready for use".
         * @param name {String} The name of the resource to check ready status for,
         *             or <tt>null</tt> for all resources in loader.
         * @return {Boolean} <tt>true</tt> if the resource is loaded and ready to use
         */
        isReady:function (name) {
            // If sprites are queued, we can't be totally ready
            if (this.queuedSprites > 0) {
                return false;
            }

            return this.base(name);
        },

        /**
         * Creates a {@link R.resources.types.Sprite} object representing the named sprite.
         *
         * @param resource {String} The name of a loaded sprite resource
         * @param sprite {String} The name of the sprite from the resource
         * @return {R.resources.types.Sprite} A {@link R.resources.types.Sprite} instance
         */
        getSprite:function (resource, sprite) {
            var info = this.get(resource).info;
            return R.resources.types.Sprite.create(sprite, info.sprites[sprite], this.get(resource), info.version || 1, this);
        },

        /**
         * Get the names of all the sprites available in a resource.
         *
         * @param resource {String} The name of the resource
         * @return {Array} All of the sprite names in the given loaded resource
         */
        getSpriteNames:function (resource) {
            var s = [];
            var spr = this.sprites[resource].sprites;
            for (var i in spr) {
                s.push(i);
            }
            return s;
        },

        /**
         * Export all of the sprites in the specified resource, as a JavaScript object, with the
         * sprite name as the key and the corresponding {@link R.resources.types.Sprite} as the value.
         * @param resource {String} The name of the sprite resource
         * @param [spriteNames] {Array} An optional array of sprites to export, by name,
         *         or <code>null</tt> to export all sprites
         */
        exportAll:function (resource, spriteNames) {
            var o = {};
            var sprites = this.getSpriteNames(resource);
            for (var i in sprites) {
                if (!spriteNames || R.engine.Support.indexOf(spriteNames, sprites[i]) != -1) {
                    o[sprites[i]] = this.getSprite(resource, sprites[i]);
                }
            }
            return o;
        },

        /**
         * The name of the resource this loader will get.
         * @returns {String} The string "sprite"
         */
        getResourceType:function () {
            return "sprite";
        }

    }, /** @scope R.resources.loaders.SpriteLoader.prototype */ {
        /**
         * Get the class name of this object.
         * @return {String} The string "R.resources.loaders.SpriteLoader"
         */
        getClassName:function () {
            return "R.resources.loaders.SpriteLoader";
        }
    });

}