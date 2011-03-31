/**
 * The Render Engine
 * LevelLoader
 *
 * @fileoverview An extension of the image resource loader for loading 2D levels
 * 				  with an associated collision map and object placement.  Includes
 * 				  a class for working with loaded levels.
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
		"R.resources.loaders.ImageLoader",
		"R.resources.types.Level"
	]
});

/**
 * @class Loads levels and makes them available to the system.  Levels are defined
 *        by a specific type of resource file.  A level is comprised of its bitmap
 *        file, a collision map, and objects that make up the level with their
 *        constructor states.
 * <pre>
 * {
 *    // A level file
 *    bitmapImage: "level1.png",
 *    bitmapWidth: 6768,
 *    bitmapHeight: 448,
 *    collisionMap: [
 *       [0, 400, 6768, 48]
 *    ],
 *    objects: {}
 * }
 * </pre>
 *
 * @constructor
 * @param name {String=LevelLoader} The name of the resource loader
 * @extends R.resources.loaders.ImageLoader
 */
R.resources.loaders.LevelLoader = function(){
	return R.resources.loaders.ImageLoader.extend(/** @scope R.resources.loaders.LevelLoader.prototype */{
	
		levels: null,
		
		/** @private */
		constructor: function(name){
			this.base(name || "LevelLoader");
			this.levels = {};
		},
		
		/**
		 * Load a level resource from a URL.
		 *
		 * @param name {String} The name of the resource
		 * @param url {String} The URL where the resource is located
		 */
		load: function(name, url, info, path){
		
			if (url) {
				var loc = window.location;
				if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.host) == -1) {
					Assert(false, "Levels must be located on this server");
				}
				
				var thisObj = this;
				
				// Get the file from the server
				R.engine.Script.loadJSON(url, function(levelInfo){
					// get the path to the resource file
					var path = url.substring(0, url.lastIndexOf("/"));
					thisObj.load(name, null, levelInfo, path + "/");
				});
			}
			else {
				info.bitmapImage = path + info.bitmapImage;
				R.debug.Console.log("Loading level: " + name + " @ " + info.bitmapImage);
				
				// Load the level image file
				this.base(name, info.bitmapImage, info.bitmapWidth, info.bitmapHeight);
				
				// Store the level info
				this.levels[name] = info;
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
		}
	});
	
}