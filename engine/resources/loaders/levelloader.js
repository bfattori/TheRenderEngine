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
	"class": "R.resources.loaders.LevelLoader",
	"requires": [
		"R.math.Math2D",
		"R.resources.loaders.ObjectLoader",
      "R.resources.loaders.TileLoader",
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
R.resources.loaders.LevelLoader = function(){
	return R.resources.loaders.ObjectLoader.extend(/** @scope R.resources.loaders.LevelLoader.prototype */{

      tileLoader: null,

		/** @private */
		constructor: function(name){
			this.base(name || "LevelLoader");
         this.tileLoader = R.resources.loaders.TileLoader.create("LevelTileLoader");
		},

      /*

      {
         path: "/resources/level1/",
         backgrounds: [
            { map: "map1",
              tileset: "bkgtiles.png" }],
         playfield: {
            map: "map2",
            tileset: "playtiles.png"},
         foregrounds: [],
         maps: {
            map1: {
               size: [100,80],
               data: [0,0,0,1,2,4,0,0,5...]
            }
            map2: {
               size: [100,80],
               data: [0,0,0,1,2,4,0,0,5...]
            },
            cMap: {
               size: [100,80],
               data: [0,0,0,0,0,0,1,0,0,1...]
            },
            tMap: [{pos:[10,10],action:"foo();"},{pos:[4,0],action:"die();"},...],
            actors: [
               { name: "actor1",pos:[32,5],type:"grub" },
               { name: "actor2",pos:[86,30],type:"shooter" },...
            ]
         }
      }

       */

      afterLoad: function(name, obj) {
         // We need to mark this as "not ready" since we'll be loading tiles
         // and other things before this object is actually ready
         this.setReady(name, false);

         var path = obj.path, tilemaps = [];

         // Load all of the tile maps
         // BACKGROUNDS
         for (var bgMap = 0; bgMap < obj.backgrounds.length; bgMap++) {
            var bg = obj.backgrounds[bgMap];
            this.tileLoader.load(bg.map, path + bg.tileset);
            tilemaps.push(bg.map);
         }

         // FOREGROUNDS
         for (var fgMap = 0; fgMap < obj.foregrounds.length; fgMap++) {
            var fg = obj.foregrounds[bgMap];
            this.tileLoader.load(fg.map, path + fg.tileset);
            tilemaps.push(fg.map);
         }

         // PLAYFIELD
         for (var pfMaps = 0; pfMaps < obj.playfield.tilesets.length; pfMaps++) {
            var pf = obj.playfield.tilesets[pfMaps], name = obj.playfield.map + "_" + pfMaps;
            this.tileLoader.load(name, path + pf);
            tilemaps.push(name);
         }

         // Have the level remember what tilemaps it needs to load
         obj.tilemapsToLoad = tilemaps;

         var self = this;
         if (!R.resources.loaders.LevelLoader.checkTimer) {
            R.resources.loaders.LevelLoader.checkTimer = setTimeout(function() {
               self.checkReady();
            }, 500);
         }
      },

      checkReady: function() {
         // Run through all the levels that aren't yet ready and see if their
         // tilemaps are loaded.  Once all tilemaps are loaded, the level is
         // ready to use.
         var resources = this.getResources(), count = resources.length;
         if (resources.length == 0) {
            return;
         }

         var cached = this.getCachedObjects();
         for (var r = 0; r < resources.length; r++) {
            if (this.isReady(resources[r])) {
               break;
            }

            var allSet = true;
            for (var tSet = 0; tSet < cached[resources[r]].data.tilemapsToLoad.length; tSet++) {
               if (!this.tileLoader.isReady(cached[resources[r]].data.tilemapsToLoad[tSet])) {
                  allSet = false;
                  break;
               }
               count--;
            }

            this.setReady(resources[r], true);
         }

         if (count > 0) {
            var self = this;
            R.resources.loaders.LevelLoader.checkTimer = setTimeout(function() {
               self.checkReady();
            }, 500);
         }
      },

		/**
		 * Get the level resource with the specified name from the cache.  The
		 * object returned contains the bitmap as <tt>image</tt> and
		 * the level definition as <tt>info</tt>.
		 *
		 * @param name {String} The name of the object to retrieve
		 * @return {Object} The level resource specified by the name
		 */
		get: function(name){
			var bitmap = this.base(name);
			var level = {
				image: bitmap,
				info: this.levels[name]
			};
			return level;
		},
		
		/**
		 * Creates a {@link R.resources.types.Level} object representing the named level.
		 *
		 * @param level {String} A loaded level name
		 * @returns {R.resources.types.Level} A {@link R.resources.types.Level} object
		 */
		getLevel: function(level){
			return R.resources.types.Level.create(level, this.get(level));
		},
		
		/**
		 * The name of the resource this loader will get.
		 * @returns {String} The string "level"
		 */
		getResourceType: function(){
			return "level";
		}
		
	}, /** @scope R.resources.loaders.LevelLoader.prototype */ {
		/**
		 * Get the class name of this object.
		 * @return {String} The string "R.resources.loaders.LevelLoader"
		 */
		getClassName: function(){
			return "R.resources.loaders.LevelLoader";
		},

      /** @private */
      checkTimer: null
	});
	
}