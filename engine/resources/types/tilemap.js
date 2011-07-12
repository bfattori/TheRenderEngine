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
      "R.engine.GameObject",
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
 * @extends R.engine.GameObject
 */
R.resources.types.TileMap = function() {
	return R.engine.GameObject.extend(/** @scope R.resources.types.TileMap.prototype */{

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
      isHTMLContext: false,
      isRendered: false,

      /** @private */
      constructor: function(name, width, height) {
         this.base(name);
         this.baseTile = null;
         this.zIndex = 0;
         this.parallax = R.math.Point2D.create(1,1);
         this.isHTMLContext = false;
         this.isRendered = false;

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
         this.isRendered = false;
      },

      afterAdd: function(renderContext) {
         this.isHTMLContext = !!(renderContext instanceof R.rendercontexts.HTMLElementContext);
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

      /**
       * Get the internal representation of the tile map.
       * @return {Array}
       * @private
       */
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

         this.tilemap[x + y * this.width] = tile;
         if (!this.baseTile) {
            this.baseTile = tile;
         }
      },

      /**
       * Get the tile at the given position.  The position is a tile location between
       * zero and the dimensions of the tile map along the X and Y axis.  For a tile map
       * that is 200 x 200, X and Y would be between 0 and 200.
       *
       * @param x {Number} The X position
       * @param y {Number} The Y position
       * @return {R.resources.types.Tile}
       */
      getTile: function(x, y) {
         return this.tilemap[x + y * this.width];
      },

      /**
       * Get the tile at the given point.  The point is a world location which will be
       * transformed into a tile location.  The point will be adjusted to reflect the
       * position within the tile.
       *
       * @param point {R.math.Point2D} The point to retrieve the tile for
       * @return {R.resources.types.Tile} The tile, or <code>null</code>
       */
      getTileAtPoint: function(point) {
         if (!this.baseTile) {
            return null;
         }

         var bw = this.baseTile.getBoundingBox().w, bh = this.baseTile.getBoundingBox().h,
             x = Math.floor(point.x / bw), y = Math.floor(point.y / bh),
             tile = this.getTile(x, y);

         // If there's no tile at this location, return null
         if (tile == null) {
            return tile;
         }

         // Adjust the point to be within the tile's bounding box and return the tile
         point.set((tile.getBoundingBox().w - bw) + (point.x % bw),
                   (tile.getBoundingBox().h - bh) + (point.y % bh));
         return tile;
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

         renderContext.pushTransform();
         renderContext.setPosition(R.math.Point2D.ZERO);
         renderContext.setScale(1);

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

            // In an HTML context we only want to render static (non-animated) tiles one time.
            // However, animated tiles will need to animate each frame.  For a graphical context,
            // we'll render all tiles each frame.
            if (!this.isHTMLContext || ((tile.isAnimation() || !this.isRendered) && this.isHTMLContext)) {

               var x = (t % this.width) * tileWidth, y = Math.floor(t / this.height) * tileHeight;
               rect.set(x - wp.x, y - wp.y, tileWidth, tileHeight);

               rect.add(topLeft);

               // If the rect isn't visible, skip it
               if (!this.isHTMLContext && !rect.isIntersecting(renderContext.getViewport()))
                  continue;

               // Get the frame and draw the tile
               var f = tile.getFrame(time),z
                   obj = renderContext.drawImage(rect, tile.getSourceImage(), f,
                     (tile.isAnimation() ? tile : null));

               if (this.isHTMLContext && !tile.getElement()) {
                  // In an HTML context, set the element for the tile so animated tiles can be updated
                  tile.setElement(obj);
               }

               f.destroy();
            }

         }

         // Mark the tilemap as "rendered to the context"
         this.isRendered = true;

         rect.destroy();
         topLeft.destroy();

         renderContext.popTransform();
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
               self.setDimensions(parseInt(coords[0]),parseInt(coords[1]));
            },true],
            "TileScaleX": [function(){
               return self.tileScale.x;
            }, function(i){
               self.tileScale.setX(parseFloat(i));
            }, true],
            "TileScaleY": [function(){
               return self.tileScale.y;
            }, function(i){
               self.tileScale.setY(parseFloat(i));
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
					self.setZIndex(parseInt(i));
				}, true],
            "Parallax": [function() {
               return self.getParallax().toString();
            }, function(i){
               var coords = i.split(",");
               self.setParallax(parseFloat(coords[0]),parseFloat(coords[1]));
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
      },

      /** @private */
      solidityMaps: {},

      /**
       * Compute the solidity map for a tile, based on the alpha value of each pixel in the
       * tile image.  The resource defines what the alpha threshold is.
       * @param tile {R.resources.types.tile} The tile to compute the map for
       */
      computeSolidityMap: function(tile) {
         // Is there a solidity map for this tile already?
         var uniqueId = tile.getTileResource().resourceName + tile.getName();
         if (R.resources.types.TileMap.solidityMaps[uniqueId]) {
            return R.resources.types.TileMap.solidityMaps[uniqueId];
         }

         // Is the tile a single frame, or animated?
         var count = tile.getFrameCount();
         var fSpeed = tile.getFrameSpeed() == -1 ? 0 : tile.getFrameSpeed();

         // The alpha value above which pixels will be considered solid
         var threshold = tile.getTileResource().info.transparencyThreshold;

         // The solidity map is only calculated for the first frame
         var sMap = {
            map: null,
            status: R.resources.types.Tile.ALL_MIXED
         };

         // Get the image data for the frame
         var fr = tile.getFrame(0,0);
         var imgData = R.util.RenderUtil.extractImageData(tile.getSourceImage(), fr).data;

         // Compute the map, based on the alpha values
         var tmpMap = [], opaque = 0;
         for (var y = 0; y < fr.h; y++) {
            for (var x = 0; x < fr.w; x++) {
               opaque += imgData[(x + y * fr.w) + 3] > threshold ? 1 : 0;
            }
         }

         // Determine if either of the short-circuit cases apply
         if (opaque == 0) {
            sMap.status = R.resources.types.Tile.ALL_TRANSPARENT;
         } else if (opaque == fr.h * fr.w) {
            sMap.status = R.resources.types.Tile.ALL_OPAQUE;
         }

         // If the map is mixed, store the map for raycast tests
         if (sMap.status == R.resources.types.Tile.ALL_MIXED) {
            sMap.map = tmpMap;
         }

         // Store the solidity map
         R.resources.types.TileMap.solidityMaps[uniqueId] = sMap;
         return R.resources.types.TileMap.solidityMaps[uniqueId];
      },

      /**
       * Cast a ray through the tile map, looking for collisions along the
       * ray.  If a collision is found, a {@link R.struct.CollisionData} object
       * will be returned or <code>null</code> if otherwise.
       * <p/>
       * If a collision occurs, the value stored in {@link R.struct.CollisionData#shape1}
       * is the tile which was collided with.  The value in {@link R.struct.CollisionData#impulseVector}
       * is a vector to separate the game object from the tile.
       *
       * @param tileMap {R.resources.types.TileMap} The tile map to test against
       * @param rayInfo {R.start.rayInfo} The ray info structure that defines the ray to test
       * @return {R.struct.rayInfo} The ray info structure passed into the cast method.  If
       *    a collision occurred, the shape and impact point will be set.
       */
      castRay: function(tileMap, rayInfo) {
         // Get all of the points along the line and test them against the
         // collision model.  At the first collision, we stop performing any more checks.
         var begin = R.math.Point2D.create(rayInfo.startPoint), end = R.math.Point2D.create(rayInfo.startPoint),
             line, pt = 0, tile, test = R.math.Vector2D.create(0,0);


         // Make sure the length isn't greater than the max
         if (rayInfo.direction.len() > R.resources.types.TileMap.MAX_RAY_LENGTH) {
            rayInfo.direction.normalize().mul(R.resources.types.TileMap.MAX_RAY_LENGTH);
         }

         end.add(rayInfo.direction);

         /* pragma:DEBUG_START */
         if (R.Engine.getDebugMode() && arguments[2])
         {
            var f = R.clone(begin), t = R.clone(end);

            arguments[2].postRender(function() {
               this.setLineStyle("orange");
               this.setLineWidth(2);
               this.drawLine(f, t);
               f.destroy();
               t.destroy();
            });
         }
         /* pragma:DEBUG_END */

         // Use Bresenham's algorithm to calculate the points along the line
         line = R.math.Math2D.bresenham(begin, end);

         while (!tile && pt < line.length) {
            test.set(line[pt]);

            // Find the tile for the current point
            tile = tileMap.getTileAtPoint(test);

            if (tile && tile.testPoint(test)) {
               // A collision occurs at the adjusted point within the tile
               rayInfo.set(line[pt], tile, R.clone(test));
            }

            pt++;
         }

         // Clean up a bit
         begin.destroy();
         end.destroy();
         test.destroy();

         // Destroy the points in the line
         while (line.length > 0) {
            line.shift().destroy();
         }

         return rayInfo;
      },

      /**
       * Serialize the tile map into an object.
       * @param tilemap {R.resources.types.TileMap} The tile map to serialize
       * @return {Object}
       */
      serialize: function(tilemap, defaults) {
         defaults = defaults || [];
         var propObj = { properties: R.engine.PooledObject.serialize(tilemap, defaults)},
             tmap = [].concat(tilemap.getTileMap()), tmap2 = [], tile;

         // First pass, convert to zeros (empty) and tile references
         for (tile = 0; tile < tmap.length; tile++) {
            tmap[tile] = tmap[tile] != null ? tmap[tile].getTileResource().resourceName + ":" + tmap[tile].getName() : 0;
         }

         // Second pass, collapse tiles using RLE
         var rle = 0, lastTile = null;
         for (tile = 0; tile < tmap.length; tile++) {
            if (tmap[tile] !== lastTile) {
               if (lastTile !== null) {
                  tmap2.push((lastTile == 0 ? "e:" : lastTile + ":") + rle);
               }
               rle = 0;
               lastTile = tmap[tile];
            }
            rle++;
         }

         // Capture remaining tiles
         tmap2.push((lastTile == 0 ? "e:" : lastTile + ":") + rle);

         propObj.map = tmap2;
         return propObj;
      },

      /**
       * Deserialize the object back into a tile map.
       * @param obj {Object} The object to deserialize
       * @param [clazz] {Class} The object class to populate
       */
      deserialize: function(obj, tileLoaders, clazz) {
         // Searches the tile loaders for the resource and tile,
         // returning the first instance of the tile found
         function findTile(res, name) {
            var tile = null;
            for (var tl = 0; tl < tileLoaders.length; tl++) {
               tile = tileLoaders[tl].getTile(res, name);
               if (tile != null) break;
            }
            return tile;
         }

         // Extract the properties and map from the object
         var props = obj.properties, map = obj.map;
         clazz = clazz || R.resources.types.TileMap.create(props.name,1,1);
         R.engine.PooledObject.deserialize(props, clazz);

         // Repopulate the map
         var ptr = 0;
         for (var tile = 0; tile < map.length; tile++) {
            // Check for empties
            if (map[tile].indexOf("e:") == 0) {
               // Skip empties
               ptr += parseInt(map[tile].split(":")[1]);
            } else {
               // Populate tiles
               var tileDesc = map[tile].split(":"), resource = tileDesc[0],
                   tileName = tileDesc[1], qty = parseInt(tileDesc[2]);

               var t = findTile(resource, tileName);
               if (t != null && clazz.baseTile == null) {
                  clazz.baseTile = t;
               }

               for (var c = 0; c < qty; c++) {
                  // We want to clone animated tiles.  Static tiles can all
                  // refer to the same tile to save memory
                  if (t && t.isAnimation()) {
                     t = R.clone(t);
                  }

                  clazz.tilemap[ptr++] = t;
               }
            }
         }

         return clazz;
      },

      /**
       * The maximum length of a cast ray (1000)
       * @type {Number}
       */
      MAX_RAY_LENGTH: 1000

   });
};
