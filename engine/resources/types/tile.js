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
 *    tiles contain a "solidity map" which allows for raycasting when testing for collisions.
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
      tileObj: null,
      renderContext: null,
      renderedFlag: false,

      /** @private */
      constructor: function(name, tileObj, tileResource, tileLoader) {
         this.base(name, tileObj, tileResource, 2, tileLoader);
         this.tileObj = tileObj;
         this.solidityMap = null;
         this.renderedFlag = false;

         if (tileResource.info.assumeOpaque) {
            // Short-circuit
            this.solidityMap = {
               map: null,
               status: R.resources.types.Tile.ALL_OPAQUE
            };
         } else {
            this.solidityMap = R.resources.types.TileMap.computeSolidityMap(this);
         }
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
         this.solidityMap = null;
         this.tileObj = null;
         this.renderedFlag = false;
         this.base();
      },

      /**
       * Set the render context the tile is being rendered onto.  This allows tiles to
       * be rendered properly on HTML contexts.
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context
       */
      setRenderContext: function(renderContext) {
         if (this.renderContext == null) {
            this.renderContext = renderContext;
            if (renderContext instanceof R.rendercontexts.HTMLElementContext) {
               // Add the tile to the context
               renderContext.add(this);
            }
         }
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
       * @param frame {Number} The frame number
       * @param solidityMap {Array} An array of bits which indicate if a pixel is opaque or transparent
       * @param statusFlag {Number} Flag used to assist in short-circuit testing
       */
      setSolidityMap: function(frame, solidityMap, statusFlag) {
         this.solidityMap = {
            map: solidityMap,
            status: statusFlag
         };
      },

      /**
       * Test if the given point, local to the tile's coordinates, would
       * result in a collision.
       * @param point {R.math.Point2D}
       * @param time {Number} The current world time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      testPoint: function(point, time, dt) {
         var sMap = this.solidityMap;
         if (sMap.status == R.resources.types.Tile.ALL_OPAQUE) {
            return true;
         } else if (sMap.status == R.resources.types.Tile.ALL_TRANSPARENT) {
            return false;
         } else {
            return !!sMap.map[point.x + (point.y * this.getBoundingBox().w)];
         }
      },

      getRotation: function() {
         return 0;
      },

      getScale: function() {
         return R.resources.types.Tile.SCALE1;
      },

      /**
       * Mark the tile as having been rendered to the context.  This is used for
       * HTML contexts where the tile should only render once unless it's an animated tile.
       */
      markRendered: function() {
         this.renderedFlag = true;
      },

      /**
       * Returns a flag indicating if the tile has been rendered to the context.
       * @return {Boolean}
       */
      hasRendered: function() {
         return this.renderedFlag;
      }

   }, /** @scope R.resources.types.Tile.prototype */{
      /**
       * Gets the class name of this object.
       * @return {String} The string "R.resources.types.Tile"
       */
      getClassName: function() {
         return "R.resources.types.Tile";
      },

      SCALE1: R.math.Vector2D.create(1,1),

      /**
       * Specialized method to allow tiles to be cloned from one another.  This method is also
       * called by {@link R#clone} when cloning objects.
       *
       * @param tile {R.resources.types.Tile} Tile to clone from
       */
      clone: function(tile) {
         return R.resources.types.Tile.create(tile.getName(), tile.tileObj, tile.getTileResource(), tile.getTileLoader());
      },

      /**
       * All pixels are mixed, either transparent or opaque.  Must perform
       * full ray testing on the solidity map.
       * @type {Number}
       */
      ALL_MIXED: 0,

      /**
       * All pixels are transparent to collisions.  Short-circuit test for ray casting.
       * @type {Number}
       */
      ALL_TRANSPARENT: 1,

      /**
       * All pixels are opaque to collisions.  Short-circuit test for ray casting.
       * @type {Number}
       */
      ALL_OPAQUE: 2
   });

};
