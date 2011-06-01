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
      renderState: 0,
      tileScale: null,

      /** @private */
      constructor: function(name, width, height) {
         this.base(name);
         this.baseTile = null;

         // The tile map is a dense array
         this.tilemap = [];
         R.engine.Support.fillArray(this.tilemap, width * height, null);

         // A list of tiles which are animated and need to be updated each frame
         this.animatedTiles = [];

         // The image that will contain the rendered tile map
         this.image = null;
         this.width = width;
         this.height = height;
         this.tileScale = R.math.Vector2D.create(1, 1);

         this.renderState = R.resources.types.TileMap.REDRAW;
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
       * Force the tile map to be redrawn, including all static sprites.
       */
      forceRedraw: function() {
         this.renderState = R.resources.types.TileMap.REDRAW;
      },

      /**
       * Set the tile at the given position.
       * @param tile {R.resources.types.Tile} The tile
       * @param x {Number} The X position of the tile
       * @param y {Number} The Y position of the tile
       */
      setTile: function(tile, x, y) {
         // Check to see if the tile is the same size as the last added tile
         Assert(this.baseTile == null || tile.getBoundingBox().equals(this.baseTile.getBoundingBox()),
               "Tiles in a TileMap must be the same size!");

         this.tilemap[x + y * this.width] = tile;
         this.baseTile = tile;

         // See if the tile is animated, and if so, store it in a special list
         if (tile.isAnimation()) {
            var aTile = {
               x: x,
               y: y,
               tile: tile
            };
            this.animatedTiles.push(aTile);
         }

         this.forceRedraw();
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

         // See if the tile is in the animated tiles list
         var found = false, t;
         for (t = 0; t < this.animatedTiles.length; t++) {
            if (this.animatedTiles[t].x == x && this.animatedTiles[t].y == y) {
               found = true;
               break;
            }
         }

         if (found) {
            // Remove the animated tile
            this.animatedTiles.splice(t, 1);
         }

         return tile;
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

         var tile, f, tl, d, t, rect = R.math.Rectangle2D.create(0,0,1,1),
               tileWidth = this.baseTile.getBoundingBox().w, tileHeight = this.baseTile.getBoundingBox().h;

         // If the image is null, render the tilemap to an image first
         if (this.renderState == R.resources.types.TileMap.REDRAW || this.image == null) {
            this.image = R.rendercontexts.CanvasContext.create("TileMap_" + this.getName(),
                      tileWidth * this.width, tileHeight * this.height);

            // Render out all of the static tiles
            for (t = 0; t < this.tilemap.length; t++) {
               tile = this.tilemap[t];
               var x = (t % this.width) * tileWidth, y = Math.floor(t / this.height) * tileHeight;

               rect.set(x, y, tileWidth, tileHeight);

               f = tile.getFrame(0);
               tl = f.getTopLeft();
               d = f.getDims();
               this.image.get2DContext().drawImage(tile.getSourceImage(), tl.x, tl.y, d.x, d.y, rect.x, rect.y, d.x, d.y);
               f.destroy();
            }

            this.renderState = 0;
         }

         // Render all of the animated tiles
         for (t = 0; t < this.animatedTiles.length; t++) {
            tile = this.animatedTiles[t];
            rect.set(tile.x * this.width, tile.y * this.height, tileWidth, tileHeight);
            f = tile.tile.getFrame(time);
            tl = f.getTopLeft();
            d = f.getDims();
            this.image.get2DContext().drawImage(tile.getSourceImage(), tl.x, tl.y, d.x, d.y, rect.x, rect.y, d.x, d.y);
            f.destroy();
         }

         // Draw the visible slice of the tile map
         var wp = renderContext.getWorldPosition(), vp = renderContext.getViewport();
         rect.set(wp.x, wp.y, vp.w, vp.h);
			renderContext.drawImage(vp, this.image, rect);
         rect.destroy();
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
            }, null, false]
         });
      }

   }, /** @scope R.resources.types.TileMap.prototype */{
      /**
       * Gets the class name of this object.
       * @return {String} The string "R.resources.types.TileMap"
       */
      getClassName: function() {
         return "R.resources.types.TileMap";
      },

      /**
       * Set the tile map to regenerate its image
       */
      REDRAW: 1
   });
};
