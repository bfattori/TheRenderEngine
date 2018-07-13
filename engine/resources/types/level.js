/**
 * The Render Engine
 * Level
 *
 * @fileoverview A class for working with loaded levels.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
    "class":"R.resources.types.Level",
    "requires":[
        "R.engine.BaseObject",
        "R.resources.loaders.SpriteLoader",
        "R.resources.loaders.TileLoader",
        "R.resources.types.Sound",
        "R.resources.types.TileMap"
    ]
});

/**
 * @class Creates an instance of a Level object.
 *
 * @constructor
 * @param name {String} The name of the object
 * @param levelResource {Object} The level resource loaded by the LevelLoader
 * @extends R.engine.BaseObject
 */
R.resources.types.Level = function () {
    return R.engine.BaseObject.extend(/** @scope R.resources.types.Level.prototype */{

        editing:false,
        actors:null,
        fixtures:null,
        tilemaps:null,
        backgroundMusic:null,
        width:0,
        height:0,
        renderContext:null,
        notAdded:null,
        version:0,
        resourceLoaders:null,

        /** @private */
        constructor:function (name, width, height) {
            this.base(name);
            this.actors = R.struct.Container.create("Actors");
            this.fixtures = R.struct.Container.create("Fixtures");
            this.tilemaps = R.struct.HashContainer.create("Tilemaps");
            this.backgroundMusic = null;
            this.width = width;
            this.height = height;
            this.renderContext = null;
            this.notAdded = [];
            this.version = 0;
            this.resourceLoaders = {
                sprite:[R.resources.loaders.SpriteLoader.create("LevelSpriteLoader")],
                tile:[R.resources.loaders.TileLoader.create("LevelTileLoader")],
                sound:[]
            };

            // Add the three tile maps
            this.tilemaps.add("background", R.resources.types.TileMap.create("background", width, height));
            this.tilemaps.add("playfield", R.resources.types.TileMap.create("playfield", width, height));
            this.tilemaps.add("foreground", R.resources.types.TileMap.create("foreground", width, height));

            // Set the z-index for each tile map
            this.getTileMap("background").setZIndex(0);
            this.getTileMap("playfield").setZIndex(1);
            this.getTileMap("foreground").setZIndex(2);
        },

        destroy:function () {
            if (this.renderContext) {
                // Remove actors and tile maps from the render context
                var itr;
                for (itr = this.actors.iterator(); itr.hasNext();) {
                    this.renderContext.remove(itr.next());
                }
                itr.destroy();

                for (itr = this.tilemaps.iterator(); itr.hasNext();) {
                    this.renderContext.remove(itr.next());
                }
                itr.destroy();
            }

            // Clean up and destroy the actors, fixtures, and tile maps
            this.actors.cleanUp();
            this.actors.destroy();
            this.fixtures.cleanUp();
            this.fixtures.destroy();
            this.tilemaps.cleanUp();
            this.tilemaps.destroy();

            // If there's background music, get rid of that too
            if (this.backgroundMusic) {
                this.backgroundMusic.destroy();
            }

            this.base();
        },

        /**
         * Release the level back into the pool for reuse
         */
        release:function () {
            this.base();
            this.actors = null;
            this.fixtures = null;
            this.tilemaps = null;
            this.backgroundMusic = null;
            this.renderContext = null;
            this.width = 0;
            this.height = 0;
            this.version = 0;
        },

        /**
         * Add a new resource loader to the set of resource loaders that the
         * level has access to.  By default, there is already a sprite and
         * tile loader when a level object is created.
         *
         * @param resourceLoader {R.resources.loaders.AbstractResourceLoader} The resource loader to add
         */
        addResourceLoader:function (resourceLoader) {
            var loaderCache;
            if (resourceLoader instanceof R.resources.loaders.TileLoader) {
                loaderCache = this.resourceLoaders.tile;
            } else if (resourceLoader instanceof R.resources.loaders.SpriteLoader) {
                loaderCache = this.resourceLoaders.sprite;
            } else {
                loaderCache = this.resourceLoaders.sound;
            }
            loaderCache.push(resourceLoader);
        },

        /**
         * Set a version number for the level.
         * @param version {Number} A version number
         */
        setVersion:function (version) {
            this.version = version;
        },

        /**
         * Get the version number associated with the level
         * @return {Number}
         */
        getVersion:function () {
            return this.version;
        },

        /**
         * Associate the level with its render context so the tile maps can
         * be rendered properly.
         * @param renderContext {R.rendercontexts.AbstractRenderContext}
         */
        setRenderContext:function (renderContext) {
            if (!this.renderContext) {
                this.renderContext = renderContext;
                renderContext.add(this.getTileMap("background"));
                renderContext.add(this.getTileMap("playfield"));
                renderContext.add(this.getTileMap("foreground"));

                while (this.notAdded.length > 0) {
                    // Add objects which aren't a part of the render context yet
                    this.renderContext.add(this.notAdded.shift());
                }
            }
        },

        /**
         * Get the width of the level, in tiles.
         * @return {Number} The width of the level in tiles
         */
        getWidth:function () {
            return this.width;
        },

        /**
         * Get the height of the level, in tiles.
         * @return {Number} The height of the level in tiles
         */
        getHeight:function () {
            return this.height;
        },

        addActor:function (actor) {
            this.actors.add(actor);
            actor.setTileMap(this.getTileMap("playfield"));

            if (this.renderContext) {
                this.renderContext.add(actor);
            } else {
                this.notAdded.push(actor);
            }
        },

        removeActor:function (actor) {
            this.actors.remove(actor);
        },

        getActors:function () {
            return this.actors;
        },

        addFixture:function (fixture) {
            this.fixtures.add(fixture);
        },

        removeFixture:function (fixture) {
            this.fixtures.remove(fixture);
        },

        getFixtures:function (type) {
            if (!type) {
                return this.fixtures;
            } else {
                return this.fixtures.filter(function (fixture) {
                    return (fixture.getType() == type);
                });
            }
        },

        getTileMap:function (name) {
            return this.tilemaps.get(name);
        },

        setBackgroundMusic:function (sound) {
            this.backgroundMusic = sound;
        },

        /**
         * Set the editing mode of the level, used by the LevelEditor
         * @private
         */
        setEditing:function (state) {
            this.editing = state;
        }

    }, /** @scope R.resources.types.Level.prototype */ {
        /**
         * Gets the class name of this object.
         * @return {String} The string "R.resources.types.Level"
         */
        getClassName:function () {
            return "R.resources.types.Level";
        },

        /**
         * Generate an object which represents the level as a complete
         * entity, including resource locations.
         * @param level {R.resources.types.Level}
         * @return {Object}
         */
        serialize:function (level) {
            function getCanonicalName(obj) {
                return obj.getSpriteResource().resourceName + ":" + obj.getName();
            }

            var lvl = {
                name:level.getName(),
                version:level.getVersion(),
                width:level.getWidth(),
                height:level.getHeight(),
                resourceURLs:{
                    sprites:[],
                    tiles:[],
                    sounds:[]
                },
                actors:[],
                fixtures:[],
                tilemaps:{
                    background:null,
                    playfield:null,
                    foreground:null
                }
            };

            // Get all of the resource URLs
            var resourceName, resourceURL, obj, t, itr;

            // SPRITES & ACTORS
            for (itr = level.getActors().iterator(); itr.hasNext();) {
                obj = itr.next();
                resourceName = obj.getSprite().getSpriteResource().resourceName;
                resourceURL = obj.getSprite().getSpriteLoader().getPathUrl(resourceName);
                if (RenderEngine.Support.filter(lvl.resourceURLs.sprites,function (e) {
                    return (e && e[resourceName]);
                }).length == 0) {
                    var o = {};
                    o[resourceName] = resourceURL;
                    lvl.resourceURLs.sprites.push(o);
                }

                // Do the actors at the same time
                lvl.actors.push(R.objects.SpriteActor.serialize(obj));
            }
            itr.destroy();

            // FIXTURES
            for (itr = level.getFixtures().iterator(); itr.hasNext();) {
                lvl.fixtures.push(R.objects.Object2D.serialize(itr.next()));
            }
            itr.destroy();

            // TILES & TILEMAPS
            $.each(["background", "playfield", "foreground"], function (i, e) {
                var tile;
                obj = level.getTileMap(e);
                for (t = 0; t < obj.getTileMap().length; t++) {
                    tile = obj.getTileMap()[t];
                    if (tile) {
                        resourceName = tile.getTileResource().resourceName;
                        resourceURL = tile.getTileLoader().getPathUrl(resourceName);
                        if (RenderEngine.Support.filter(lvl.resourceURLs.tiles,function (e) {
                            return (e && e[resourceName]);
                        }).length == 0) {
                            var o = {};
                            o[resourceName] = resourceURL;
                            lvl.resourceURLs.tiles.push(o);
                        }
                    }
                }

                // Do the tile map at the same time
                lvl.tilemaps[e] = R.resources.types.TileMap.serialize(obj);
            });

            // SOUNDS
            // ...

            return lvl;
        },

        deserialize:function (obj) {
            // Create the level
            var level = R.resources.types.Level.create(obj.name, obj.width, obj.height);

            // Pull together all of the resources
            var loader;
            for (var resType in obj.resourceURLs) {
                if (resType === "sprites") {
                    loader = level.resourceLoaders.sprite[0];
                } else if (resType === "tiles") {
                    loader = level.resourceLoaders.tile[0];
                } else {
                    loader = level.resourceLoaders.sound[0];
                }
                for (var res in obj.resourceURLs[resType]) {
                    for (var rName in obj.resourceURLs[resType][res]) {
                        loader.load(rName, R.Engine.getGame().getFilePath(obj.resourceURLs[resType][res][rName]));
                    }
                }
            }

            // Now that we've started the resource loading, we need to wait until
            // all resources are loaded before we can finish loading the level
            R.lang.Timeout.create("lvlResourceWait", 250, function () {
                if (level.resourceLoaders.sprite[0].isReady() &&
                    level.resourceLoaders.tile[0].isReady()) {
                    this.destroy();
                    R.resources.types.Level.finishDeserialize(level, obj);
                } else {
                    this.restart();
                }
            });

            return level;
        },

        /**
         * @private
         */
        finishDeserialize:function (level, obj) {
            // Deserialize the tile maps
            for (var tilemap in obj.tilemaps) {
                R.resources.types.TileMap.deserialize(obj.tilemaps[tilemap], level.resourceLoaders.tile,
                    level.getTileMap(tilemap));
            }

            // Deserialize the actors
            for (var actor in obj.actors) {
                var spriteActor = R.objects.SpriteActor.deserialize(obj.actors[actor], level.resourceLoaders.sprite);
                level.addActor(spriteActor);
            }

            // Deserialize the fixtures


            // Done
            level.triggerEvent("loaded");
        }
    });

};