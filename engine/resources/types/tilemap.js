/**
 * The Render Engine
 * TileMap
 *
 * @fileoverview A rectangular map of tiles.
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
	"class": "R.resources.types.TileMap",
	"requires": [
		"R.resources.types.Tile",
      "R.rendercontexts.CanvasContext",
		"R.math.Rectangle2D",
		"R.util.RenderUtil"
	]
});

/**
 * @class A 2d tile map, comprised of many tiles.  Tiles in a map are all the same
 *        size.
 *
 * @constructor
 * @param name {String} The name of the tilemap
 * @description A tile map is a collection of tiles, all the same dimensions.
 * @extends R.engine.BaseObject
 */
R.resources.types.TileMap = function() {
	return R.engine.BaseObject.extend(/** @scope R.resources.types.TileMap.prototype */{

      baseTile: null,
      tilemap: null,
      animatedTiles: null,
      image: null,
      width: 0,
      height: 0,
      tileScale: null,
      zIndex: 0,
      parallax: null,
      dimensions: null,

      /** @private */
      constructor: function(name, width, height) {
         this.base(name);
         this.baseTile = null;
         this.zIndex = 0;
         this.parallax = R.math.Point2D.create(1,1);

         // The tile map is a dense array
         this.tilemap = [];
         R.engine.Support.fillArray(this.tilemap, width * height, null);
         this.dimensions = R.math.Point2D.create(width, height);

         // A list of tiles which are animated and need to be updated each frame
         this.animatedTiles = [];

         // The image that will contain the rendered tile map
         this.image = null;
         this.width = width;
         this.height = height;
         this.tileScale = R.math.Vector2D.create(1, 1);
      },

      /**
       * Destroy the tilemap instance
       */
      destroy: function() {
         this.base();
         this.tilemap = [];
      },

      /**
       * Release the tilemap back into the pool for reuse
       */
      release: function() {
         this.base();
         this.tilemap = null;
      },

      /**
       * Set the dimensions of the tile map.  Setting the dimensions will clear the tile map.
       * @param x {Number|R.math.Point2D}
       * @param y {Number}
       */
      setDimensions: function(x, y) {
         this.dimensions.set(x, y);
         this.tilemap = [];
         R.engine.Support.fillArray(this.tilemap, this.dimensions.x * this.dimensions.y, null);
      },

      /**
       * Get the basis tile for the tile map.  The first tile within a tile map determines
       * the basis of all tiles.  Thus, if you drop a 32x32 tile into the tile map, all tiles
       * must be divisible by 32 along each axis.
       * @return {R.resources.types.Tile}
       */
      getBaseTile: function() {
         return this.baseTile;
      },

      getTileMap: function() {
         return this.tilemap;
      },

      /**
       * Set the tile at the given position.
       * @param tile {R.resources.types.Tile} The tile
       * @param x {Number} The X position of the tile
       * @param y {Number} The Y position of the tile
       */
      setTile: function(tile, x, y) {
         // Check to see if the tile is the same size as the last added tile
         var tbb = tile.getBoundingBox();
         Assert(this.baseTile == null || (tbb.w % this.baseTile.getBoundingBox().w == 0 && tbb.w % this.baseTile.getBoundingBox().w == 0),
               "Tiles in a TileMap must be the same size!");

         if (this.tilemap[x + y * this.width] != null) {
            this.tilemap[x + y * this.width].destroy();
         }

         var newTile = R.clone(tile);
         this.tilemap[x + y * this.width] = newTile;
         if (!this.baseTile) {
            this.baseTile = newTile;
         }
      },

      /**
       * Get the tile at the given position.
       * @param x {Number} The X position
       * @param y {Number} The Y position
       * @return {R.resources.types.Tile}
       */
      getTile: function(x, y) {
         return this.tilemap[x + y * this.width];
      },

      /**
       * Clear the tile at the given position, returning the tile that occupied the
       * position, or <code>null</code> if there was no tile.
       * @param x {Number} The X position
       * @param y {Number} The Y position
       * @return {R.resources.types.Tile}
       */
      clearTile: function(x, y) {
         var tile = this.tilemap[x + y * this.width];
         this.tilemap[x + y * this.width] = null;
         return tile;
      },

      /**
       * Set the parallax distance of the tile map from the viewer's eye.  Setting the parallax distance
       * can create the illusion of depth when layers move at different rates along the X
       * and Y axis.  The distance is a vector which specifies the amount of offset along each
       * axis, from the viewer's eye, with 1 being the middle plane.  Each value should be a floating
       * point number with numbers closer to zero meaning closer to the eye (or faster change) and
       * numbers greater than 1 meaning farther from the eye (or slower change).
       *
       * @param xOrPt {Number|R.math.Vector2D} The X offset, or a vector indicating the amount of offset
       * @param [y] {Number} The Y offset if <code>xOrPt</code> was a number
       */
      setParallax: function(xOrPt, y) {
         this.parallax.set(xOrPt, y);
      },

      /**
       * Returns the parallax distance of the tile map along each axis.
       * @return {R.math.Vector2D}
       */
      getParallax: function() {
         return this.parallax;
      },

      /**
       * Update the tile map, rendering it to the context.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the object exists within
       * @param time {Number} The current engine time, in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      update: function(renderContext, time, dt){
         if (this.baseTile == null) {
            // Nothing to render yet
            return;
         }

         var tile, t, rect = R.math.Rectangle2D.create(0,0,1,1), wp = renderContext.getWorldPosition(),
             tileWidth = this.baseTile.getBoundingBox().w, tileHeight = this.baseTile.getBoundingBox().h;

         var topLeft = R.clone(wp);
         topLeft.convolve(this.parallax);
         topLeft.sub(wp);

         // Render out all of the tiles
         for (t = 0; t < this.tilemap.length; t++) {
            tile = this.tilemap[t];
            if (!tile)
               continue;

            var x = (t % this.width) * tileWidth, y = Math.floor(t / this.height) * tileHeight;
            rect.set(x - wp.x, y - wp.y, tileWidth, tileHeight);

            rect.add(topLeft);

            // If the rect isn't visible, skip it
            if (!rect.isIntersecting(renderContext.getViewport()))
               continue;

            var f = tile.getFrame(time);
            renderContext.drawImage(rect, tile.getSourceImage(), f);
            f.destroy();
         }

         rect.destroy();
      },

      /**
       * Get the z-index of the tile map.
       * @return {Number}
       */
      getZIndex: function() {
         return this.zIndex;
      },

      /**
       * Set the z-index of the tile map.
       * @param zIndex {Number} The z-index (depth) of the tile map.
       */
      setZIndex: function(zIndex) {
         this.zIndex = zIndex;
      },

      /**
       * When editing objects, this method returns an object which
       * contains the properties with their getter and setter methods.
       * @return {Object} The properties object
       */
      getProperties: function(){
         var self = this;
         var prop = this.base(self);
         return $.extend(prop, {
            "Dimensions": [function() {
               return self.dimensions.toString()
            }, function(i) {
               var coords = i.split(",");
               self.setDimensions(coords[0],coords[1]);
            },true],
            "TileScaleX": [function(){
               return self.tileScale.x;
            }, function(i){
               self.tileScale.setX(i);
            }, true],
            "TileScaleY": [function(){
               return self.tileScale.y;
            }, function(i){
               self.tileScale.setY(i);
            }, true],
            "TileSizeX": [function(){
               return self.baseTile ? self.baseTile.getBoundingBox().w : "";
            }, null, false],
            "TileSizeY": [function(){
               return self.baseTile ? self.baseTile.getBoundingBox().h : "";
            }, null, false],
            "Zindex": [function(){
					return self.getZIndex();
				}, function(i){
					self.setZIndex(i);
				}, true],
            "Parallax": [function() {
               return self.getParallax().toString();
            }, function(i){
               var coords = i.split(",");
               self.setParallax(coords[0],coords[1]);
            }, true]
         });
      }

   }, /** @scope R.resources.types.TileMap.prototype */{
      /**
       * Gets the class name of this object.
       * @return {String} The string "R.resources.types.TileMap"
       */
      getClassName: function() {
         return "R.resources.types.TileMap";
      }
   });
};
