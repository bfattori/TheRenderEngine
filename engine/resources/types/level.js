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
	"class": "R.resources.types.Level",
	"requires": [
		"R.engine.PooledObject",
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
 * @extends R.engine.PooledObject
 */
R.resources.types.Level = function(){
	return R.engine.PooledObject.extend(/** @scope R.resources.types.Level.prototype */{
	
      actors: null,
      fixtures: null,
      tilemaps: null,
      backgroundMusic: null,
      width: 0,
      height: 0,

		/** @private */
		constructor: function(name, width, height){
			this.base(name);
         this.actors = R.struct.Container.create("Actors");
         this.fixtures = R.struct.Container.create("Fixtures");
         this.tilemaps = R.struct.HashContainer.create("Tilemaps");
         this.backgroundMusic = null;
         this.width = width;
         this.height = height;

         // Add the three tilemaps
         this.tilemaps.add("background", R.resources.types.TileMap.create("background", width, height));
         this.tilemaps.add("playfield", R.resources.types.TileMap.create("playfield", width, height));
         this.tilemaps.add("foreground", R.resources.types.TileMap.create("foreground", width, height));
		},

      destroy: function() {
         this.actors.cleanUp();
         this.actors.destroy();
         this.fixtures.cleanUp();
         this.fixtures.destroy();
         this.tilemaps.cleanUp();
         this.tilemaps.destroy();

         if (this.backgroundMusic) {
            this.backgroundMusic.destroy();
         }

         this.base();
      },

		/**
		 * Release the level back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.actors = null;
			this.fixtures = null;
         this.tilemaps = null;
         this.backgroundMusic = null;
         this.width = 0;
         this.height = 0;
   	},

		/**
		 * Get the width of the level, in tiles.
		 * @return {Number} The width of the level in tiles
		 */
		getWidth: function(){
			return this.width;
		},
		
		/**
		 * Get the height of the level, in tiles.
		 * @return {Number} The height of the level in tiles
		 */
		getHeight: function(){
			return this.height;
		},
		
      addActor: function(actor) {
         this.actors.add(actor);
      },

      removeActor: function(actor) {
         this.actors.remove(actor);
      },

      getActors: function() {
         return this.actors;
      },

      addFixture: function(fixture) {
         this.fixtures.add(fixture);
      },

      removeFixture: function(fixture) {
         this.fixtures.remove(fixture);
      },

      getFixtures: function(type) {
         if (!type) {
            return this.fixtures;
         } else {
            return this.fixtures.filter(function(fixture) {
               return (fixture.getType() == type);
            });
         }
      },

      getTilemap: function(name) {
         return this.tilemaps.get(name);
      },

      setBackgroundMusic: function(sound) {
         this.backgroundMusic = sound;
      }

	}, /** @scope R.resources.types.Level.prototype */ {
		/**
		 * Gets the class name of this object.
		 * @return {String} The string "R.resources.types.Level"
		 */
		getClassName: function(){
			return "R.resources.types.Level";
		},

      /**
       * Generate an object which represents the level as a complete
       * entity, including resource locations.
       * @param level {R.resources.types.Level}
       * @return {Object}
       */
      valueOf: function(level) {
         function getCanonicalName(obj) {
            return obj.getSpriteResource().resourceName + ":" + obj.getName();
         }

         var lvl = {
            name: level.getName(),
            resources: {
               sprites: [],
               tiles: [],
               sounds: []
            },
            actors: [],
            fixtures: [],
            tilemaps: {
               background: null,
               playfield: null,
               foreground: null
            }
         };

         // Get all of the resource URLs
         var resourceURL, obj, t, itr;

         // SPRITES & ACTORS
         for (itr = level.getActors().iterator(); itr.hasNext(); ) {
            obj = itr.next();
            resourceURL = obj.getSprite().getSpriteLoader().getPathUrl(obj.getSprite().getSpriteResource().resourceName);
            if (R.engine.Support.indexOf(lvl.resources.sprites, resourceURL) == -1) {
               lvl.resources.sprites.push(resourceURL);
            }

            // Do the actors at the same time
            lvl.actors.push(R.objects.SpriteActor.valueOf(obj));
         }
         itr.destroy();

         // FIXTURES
         for (itr = level.getFixtures().iterator(); itr.hasNext(); ) {
            lvl.fixtures.push(R.engine.Object2D.valueOf(itr.next()));
         }

         // TILES & TILEMAPS
         $.each(["background", "playfield", "foreground"], function(e) {
            var tile;
            obj = level.getTilemap(e);
            for (t = 0; t < obj.getTileMap().length; t++) {
               tile = obj.getTileMap()[t];
               if (tile) {
                  resourceURL = tile.getTileLoader().getPathUrl(tile.getTileResource().resourceName);
                  if (R.engine.Support.indexOf(lvl.resources.tiles, resourceURL) == -1) {
                     lvl.resources.tiles.push(resourceURL);
                  }
               }
            }

            // Do the tilemap at the same time
            lvl.tilemaps[e].props = obj.getProperties();

            var tmap = [].concat(obj.getTileMap()), tmap2 = [];

            // Quick run through to convert to zeros (empty) and tiles
            for (tile = 0; tile < tmap.length; tile++) {
               tmap[tile] = tmap[tile] != null ? tmap[tile].getTileResource().resourceName + ":" + tmap[tile].getName() : 0;
            }

            // Second pass, collapse all empties into RLE
            var eCount = 0;
            for (tile = 0; tile < tmap.length; tile++) {
               if (tmap[tile] == 0) {
                  eCount++;
               } else {
                  if (eCount > 0) {
                     tmap2.push("e:" + eCount);
                     eCount = 0;
                  }
                  tmap2.push(tmap[tile]);
               }
            }

            // Capture any remaining empties
            if (eCount > 0) {
               tmap2.push("e:" + eCount);
            }

            lvl.tilemaps[e].map = tmap2;
         });

         // SOUNDS
         // ...

         return lvl;
      }
	});
	
}