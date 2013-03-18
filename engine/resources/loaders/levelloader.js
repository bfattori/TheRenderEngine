/**
 * The Render Engine
 * LevelLoader
 *
 * @fileoverview Loads 2D tilemapped levels.
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
    "class":"R.resources.loaders.LevelLoader",
    "requires":[
        "R.math.Math2D",
        "R.resources.loaders.ObjectLoader",
        "R.resources.types.Level"
    ]
});

/**
 * @class Loads 2D tilemapped levels for use in games.  Levels are comprised of multiple layers
 *        which describe backgrounds, playfield (actors and fixtures), and foregrounds.
 *        The playfield is where the player and other interactive elements will exist.
 *
 * @constructor
 * @param name {String=LevelLoader} The name of the resource loader
 * @extends R.resources.loaders.ObjectLoader
 */
R.resources.loaders.LevelLoader = function () {
    return R.resources.loaders.ObjectLoader.extend(/** @scope R.resources.loaders.LevelLoader.prototype */{

        tileLoader:null,
        queuedLevels:0,
        levels:{},

        /** @private */
        constructor:function (name) {
            this.base(name || "LevelLoader");
            this.queuedLevels = 0;
            this.levels = {};
        },

        /**
         * Load a level object from a URL.
         *
         * @param name {String} The name of the level
         * @param url {String} The URL where the resource is located
         */
        load:function (name, url /*, obj */) {
            this.base(name, url, arguments[2]);
            if (arguments[2] === undefined) {
                this.queuedLevels++;
            }
        },

        /**
         * @private
         */
        afterLoad:function (name, obj) {
            // We need to mark this as "not ready" since we'll be loading tiles
            // and other things before this object is actually ready
            this.setReady(name, false);

            // Levels actually deserialize themselves, so we just wire to the level's "loaded" event
            var self = this;
            this.levels[name] = R.resources.types.Level.deserialize(obj);
            this.levels[name].addEvent(this, "loaded", function () {
                self.queuedLevels--;
                self.setReady(name, true);
            });
        },

        /**
         * Creates a {@link R.resources.types.Level} object representing the named level.
         *
         * @param level {String} A loaded level name
         * @returns {R.resources.types.Level} A {@link R.resources.types.Level} object
         */
        getLevel:function (level) {
            return this.levels[level];
        },

        /**
         * Export all of the levels, as a JavaScript object, with the
         * level name as the key and the corresponding {@link R.resources.types.Level} as the value.
         * @param [levelNames] {Array} An optional array of levels to export, by name,
         *         or <code>null</tt> to export all levels
         */
        exportAll:function (levelNames) {
            var o = {};
            var levels = this.getResources();
            for (var i in levels) {
                if (!levelNames || R.engine.Support.indexOf(levelNames, levels[i]) != -1) {
                    o[levels[i]] = this.getLevel(i);
                }
            }
            return o;
        },

        /**
         * The name of the resource this loader will get.
         * @returns {String} The string "level"
         */
        getResourceType:function () {
            return "level";
        }

    }, /** @scope R.resources.loaders.LevelLoader.prototype */ {
        /**
         * Get the class name of this object.
         * @return {String} The string "R.resources.loaders.LevelLoader"
         */
        getClassName:function () {
            return "R.resources.loaders.LevelLoader";
        }
    });

}