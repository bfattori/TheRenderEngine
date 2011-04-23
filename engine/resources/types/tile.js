/**
 * The Render Engine
 * Tile
 *
 * @fileoverview A single tile, similar to a sprite but with a solidity map for collision.
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
	"class": "R.resources.types.Tile",
	"requires": [
		"R.resources.types.Sprite",
		"R.math.Rectangle2D",
		"R.util.RenderUtil"
	]
});

/**
 * @class Represents a 2d tile.  The difference between a sprite and a tile is that
 *    tiles contain a "sparsity map" which allows for raycasting when testing for collisions.
 *    Otherwise, tiles and sprites are identical.
 *
 * @constructor
 * @param name {String} The name of the tile within the resource
 * @param tileObj {Object} Passed in by a {@link R.resources.loaders.TileLoader}.  An array which defines the
 *    tile frame, and parameters.
 * @param tileResource {Object} The tile resource loaded by the {@link R.resources.loaders.TileLoader}
 * @description A tile is a sprite with the addition of a solidity map, computed from the
 * 	pixels of the sprite.
 * @extends R.resources.types.Sprite
 */
R.resources.types.Tile = function() {
	return R.resources.types.Sprite.extend(/** @scope R.resources.types.Tile.prototype */{

      solidityMap: null,
      status: null,
      sparsity: null,

      /** @private */
      constructor: function(name, tileObj, tileResource, tileLoader) {
         this.base(name, tileObj, spriteResource, 2, spriteLoader);
         this.solidityMap = [];
         R.resources.types.Tile.computeSolidityMap(this);
      },

      /**
       * Destroy the sprite instance
       */
      destroy: function() {
         this.base();
      },

      /**
       * Release the sprite back into the pool for reuse
       */
      release: function() {
         this.base();
      },

      /**
       * Get the resource this sprite originated from
       * @return {Object}
       */
      getTileResource: function() {
         return this.resource;
      },

      /**
       * Get the sprite loader this sprite originated from
       * @return {R.resources.loaders.SpriteLoader}
       */
      getTileLoader: function() {
         return this.loader;
      },

      /**
       * Set the solidity map for the tile, used during raycasts.  The status
       * flag is used to indicate if the pixels of the map need to be tested.
       * A solidity map will be computed for each frame of the tile, if the tile
       * is animated.
       *
       * @param solidityMap {Array} An array of bits which indicate if a pixel is opaque or transparent
       * @param statusFlag {Number} Flag used to assist in short-circuit testing
       */
      setSolidityMap: function(frame, solidityMap, statusFlag) {
         this.solidityMap[frame] = {
            map: solidityMap,
            status: statusFlag
         };
      },

      /**
       * Test if the given point, local to the tile's coordinates, would
       * result in a collision.
       * @param point {R.math.Point2D}
       */
      testPoint: function(point, time) {
         // Get the frame for the current time
         var fSpeed = tile.getFrameSpeed() == -1 ? 0 : tile.getFrameSpeed(),
             frame = (time / fSpeed) % this.getFrameCount();

         var sMap = this.solidityMap[frame];
         if (sMap.s == R.resources.types.Tile.ALL_OPAQUE) {
            return true;
         } else if (sMap.s == R.resources.types.Tile.ALL_TRANSPARENT) {
            return false;
         } else {
            return !!sMap.m[point.x + (point.y * this.getBoundingBox().w)];
         }
      }

   }, /** @scope R.resources.types.Tile.prototype */{
      /**
       * Gets the class name of this object.
       * @return {String} The string "R.resources.types.Tile"
       */
      getClassName: function() {
         return "R.resources.types.Tile";
      },

      /**
       * Compute the solidity map for a tile, based on the alpha value of each pixel in the
       * tile image.  The resource defines what the alpha threshold is.
       * @param tile {R.resources.types.tile} The tile to compute the map for
       */
      computeSolidityMap: function(tile) {
         // Is the tile a single frame, or animated?
         var count = tile.getFrameCount();
         var fSpeed = tile.getFrameSpeed() == -1 ? 0 : tile.getFrameSpeed();

         // The alpha value above which pixels will be considered solid
         var threshold = tile.getTileLoader().getThreshold();

         // For each frame, we'll need to compute a solidity map
         for (var f = 0; f < count; f++) {
            // Create the entry for each frame
            tile.solidityMap.push({
               m: null,
               s: R.resources.types.Tile.ALL_MIXED
            });

            // Get the image data for the frame
            var fr = tile.getFrame(f * tile.getFrameSpeed());
            var imgData = R.util.RenderUtil.extractImageData(tile.getSourceImage(), fr).data;

            // Compute the map, based on the alpha values
            var tmpMap = [], opaque = 0;
            for (var y = 0; y < fr.h; y++) {
               for (var x = 0; x < fr.w; x++) {
                  var pix = imgData[(x + y * fr.w) + 3] > threshold ? 1 : 0;
                  opaque += pix;
               }
            }

            // Determine if either of the short-circuit cases apply
            if (opaque == 0) {
               tile.solidityMap[f].s = R.resources.types.Tile.ALL_TRANSPARENT;
            } else if (opaque == fr.h * fr.w) {
               tile.solidityMap[f].s = R.resources.types.Tile.ALL_OPAQUE;
            }

            // If the map is mixed, store the map for raycast tests
            if (tile.solidityMap[f].s == R.resources.types.Tile.ALL_MIXED) {
               tile.solidityMap[f].m = tmpMap;
            }
         }
      },

      /**
       * All pixels are mixed, either transparent or opaque.  Must perform
       * full ray testing on the solidity map.
       * @type {Number}
       */
      ALL_MIXED: 0,

      /**
       * All pixels are transparent to collisions.  Short-circuit test for raycasting.
       * @type {Number}
       */
      ALL_TRANSPARENT: 1,

      /**
       * All pixels are opaque to collisions.  Short-circuit test for raycasting.
       * @type {Number}
       */
      ALL_OPAQUE: 2
   });

};
