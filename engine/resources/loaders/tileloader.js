/**
 * The Render Engine
 * TileLoader
 *
 * @fileoverview An extension of the sprite resource loader for handling
 *               tiles.
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
	"class": "R.resources.loaders.TileLoader",
	"requires": [
		"R.resources.loaders.SpriteLoader",
		"R.resources.types.Tile"
	]
});

/**
 * @class Loads tile resources and makes them available to the system.  Tiles are
 *        defined by an external JSON resource file.  A tile definition file 
 *        is a JSON file which can support single-line comments.  The format 
 *        describes the image which contains the bitmap, the size of the bitmap,
 *        the version of the file, and the tiles.  Tiles can be either single
 *        frames or animations.  Animations are expected to be sequentially organized
 *        in the bitmap from left to right.  Each frame of an animation must be the exact
 *        same dimensions.
 *        <p/>
 *        A frame is simply defined by the upper left corner of the tile and the
 *        width and height of the frame.  For an animation, the first four arguments are
 *        the same as a frame, followed by the frame count, the millisecond delay between
 *        frames, and the type of animation (either "loop" or "toggle").  A looped animation
 *        will play all frames, indicated by the frame count, and then start again from the
 *        beginning of the animation.  A toggled animation will play from the first to
 *        the last frame, then play from the last to the first, and then repeat.  The
 *        first and last frame will not be repeated in a toggled animation.  Thus, if
 *        the frames are A, B, C, then the toggle will play as A, B, C, B, A, B...
 *        <p/>
 *        The sparsity value is used to reduce each tile's solidity map so that the map
 *        will consist of averaged pixels, resulting in smaller solidity maps.  The 
 *        transparencyThreshold determines above what alpha value a pixel is no longer
 *        considered transparent, but solid.
 * <pre>
 * {
 *    // Tile definition file v2
 *    "bitmapImage": "bitmapFile.ext",
 *    "bitmapSize": [320, 320],
 *    "version": 2
 *    "sparsity": 1,
 *    "transparencyThreshold": 0,
 *    "tiles": {
 *        "girder": [0, 0, 32, 32],
 *        "gears": [32, 0, 32, 32, 3, 150, "loop"]
 *    }
 * }
 * </pre>
 *        <i>Note:</i> The new file structure is a bit more compact, and is indicated with
 *        the "version" key in the file, set to the value 2.  Version 1 will be deprecated
 *        and will not be supported in a future release of The Render Engine.
 *
 * @constructor
 * @param name {String=TileLoader} The name of the resource loader
 * @extends R.resources.loaders.SpriteLoader
 */
R.resources.loaders.TileLoader = function(){
	return R.resources.loaders.SpriteLoader.extend(/** @scope R.resources.loaders.TileLoader.prototype */{
	
		sparsity: 1,
		threshold: 0,
	
		/** @private */
		constructor: function(name){
			this.base(name || "TileLoader");
			this.sparsity = 1;
			this.threshold = 0;
		},
		
		/**
		 * Called after the data has been loaded, passing along the info object and name
		 * of the sprite resource.
		 * @param name {String} The name of the sprite resource
		 * @param info {Object} The sprite resource definition
		 */
		afterLoad: function(name, info) {
			this.sparsity = info.sparsity || 1;
			this.threshold = info.transparencyThreshold || 0;
		},
		
		/**
		 * Creates a {@link R.resources.types.Tile} object representing the named tile.
		 *
		 * @param resource {String} The name of a loaded tile resource
		 * @param tile {String} The name of the tile from the resource
		 * @return {R.resources.types.Tile} A {@link R.resources.types.Tile} instance
		 */
		getTile: function(resource, tile){
			var info = this.get(resource).info;
			return R.resources.types.Tile.create(tile, info.sprites[tile], this.get(resource), this);
		},
		
		/**
		 * Export all of the tiles in the specified resource, as a JavaScript object, with the
		 * tile name as the key and the corresponding {@link R.resources.types.Tile} as the value.
		 * @param resource {String} The name of the tile resource
		 * @param [tileNames] {Array} An optional array of tiles to export, by name,
		 * 		or <code>null</tt> to export all tiles
		 */
		exportAll: function(resource, tileNames){
			var o = {};
			var tiles = this.getSpriteNames(resource);
			for (var i in tiles) {
				if (!tileNames || R.engine.Support.indexOf(tileNames, tiles[i]) != -1) {
					o[tiles[i]] = this.getTile(resource, tiles[i]);
				}
			}
			return o;
		},
		
		/**
		 * Sparsity is used to reduce the size of the solidity map for each frame of every tile.
		 * The higher the sparsity, the more pixels will be averaged together to get a smaller map.
		 * This has the potential to improve performance when performing ray casting by eliminating
		 * the need to calculate collisions per pixel.
		 * @return {Number}
		 */
		getSparsity: function() {
			return this.sparsity;
		},
		
		/**
		 * Get the transparency threshold at which pixels are considered to be either transparent or
		 * solid.  Pixel alpha values above the specified threshold will be considered solid when
		 * calculating the solidity map of a tile.
		 * @return {Number} Value between 0 and 255
		 */
		getThreshold: function() {
			return this.threshold;
		},
		
		/**
		 * The name of the resource this loader will get.
		 * @returns {String} The string "tile"
		 */
		getResourceType: function(){
			return "tile";
		}
		
	}, /** @scope R.resources.loaders.TileLoader.prototype */ {
		/**
		 * Get the class name of this object.
		 * @return {String} The string "R.resources.loaders.TileLoader"
		 */
		getClassName: function(){
			return "R.resources.loaders.TileLoader";
		}
	});
	
}