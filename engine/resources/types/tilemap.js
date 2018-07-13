/**
 * The Render Engine
 * TileMap
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A 2d tile map, comprised of many tiles.  Tiles in a map are all the same
 *        size.
 *
 * @constructor
 * @param name {String} The name of the tilemap
 * @description A tile map is a collection of tiles, all the same dimensions.
 * @extends GameObject
 */
class TileMap extends GameObject {

  static solidityMaps = {};
  static MAX_RAY_LENGTH = 1000;

  constructor(name = "TileMap", width, height) {
    super(name);
    this.mapOpts = {
      baseTile: null,
      zIndex: 0,
      parallax: Point2D.create(1, 1),
      isHTMLContext: false,
      isRendered: false,
      tilemapImage: null,
      alwaysRender: false,
      tilemap: [],
      // A list of tiles which are animated and need to be updated each frame
      animatedTiles: [],
      dimensions: Point2D.create(width, height),
      // The image that will contain the rendered tile map
      image: null,
      width: width,
      height: height,
      tileScale: Vector2D.create(1, 1)
    };

    // The tile map is a dense array
    RenderEngine.Support.fillArray(this.tilemap, width * height, null);
  }

  /**
   * Destroy the tilemap instance
   */
  destroy() {
    this.mapOpts.parallax.destroy();
    this.mapOpts.dimensions.destroy();
    this.mapOpts.tileScale.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this.mapOpts = null;
  }

  /**
   * Gets the class name of this object.
   * @return {String} The string "TileMap"
   */
  get className() {
    return "TileMap";
  }

  /**
   * Compute the solidity map for a tile, based on the alpha value of each pixel in the
   * tile image.  The resource defines what the alpha threshold is.
   * @param tile {TileResource} The tile to compute the map for
   */
  static computeSolidityMap(tile) {
    // Is there a solidity map for this tile already?
    var uniqueId = tile.tileResource.resourceName + tile.name;
    if (TileMap.solidityMaps[uniqueId]) {
      return TileMap.solidityMaps[uniqueId];
    }

    // Is the tile a single frame, or animated?
    var count = tile.frameCount;
    var fSpeed = tile.frameSpeed === -1 ? 0 : tile.frameSpeed;

    // The alpha value above which pixels will be considered solid
    var threshold = tile.tileResource.info.transparencyThreshold;

    // The solidity map is only calculated for the first frame
    var sMap = {
      map: null,
      status: TileResource.ALL_MIXED
    };

    // Get the image data for the frame
    var fr = tile.getFrame(0, 0);
    var imgData = RenderUtil.extractImageData(tile.sourceImage, fr).data;

    // Compute the map, based on the alpha values
    var tmpMap = [], opaque = 0;
    for (var y = 0; y < fr.h; y++) {
      for (var x = 0; x < fr.w; x++) {
        opaque += imgData[(x + y * fr.w) + 3] > threshold ? 1 : 0;
      }
    }

    // Determine if either of the short-circuit cases apply
    if (opaque === 0) {
      sMap.status = TileResource.ALL_TRANSPARENT;
    } else if (opaque === fr.h * fr.w) {
      sMap.status = TileResource.ALL_OPAQUE;
    }

    // If the map is mixed, store the map for raycast tests
    if (sMap.status === TileResource.ALL_MIXED) {
      sMap.map = tmpMap;
    }

    // Store the solidity map
    TileMap.solidityMaps[uniqueId] = sMap;
    return TileMap.solidityMaps[uniqueId];
  }

  /**
   * Cast a ray through this tile map, looking for collisions along the ray.
   */
  castRay(rayInfo) {
    TileMap.castRay(this, rayInfo);
  }

  /**
   * Cast a ray through the tile map, looking for collisions along the
   * ray.  If a collision is found, a {@link CollisionData} object
   * will be returned or <code>null</code> if otherwise.
   * <p/>
   * If a collision occurs, the value stored in {@link CollisionData#shape1}
   * is the tile which was collided with.  The value in {@link CollisionData#impulseVector}
   * is a vector to separate the game object from the tile.
   *
   * @param tileMap {TileMap} The tile map to test against
   * @param rayInfo {RayInfo} The ray info structure that defines the ray to test
   * @return {RayInfo} The ray info structure passed into the cast method.  If
   *    a collision occurred, the shape and impact point will be set.
   */
  static castRay(tileMap, rayInfo) {
    // Get all of the points along the line and test them against the
    // collision model.  At the first collision, we stop performing any more checks.
    var begin = Point2D.create(rayInfo.startPoint), end = Point2D.create(rayInfo.startPoint),
      line, pt = 0, tile, test = Vector2D.create(0, 0);


    // Make sure the length isn't greater than the max
    if (rayInfo.direction.length > TileMap.MAX_RAY_LENGTH) {
      rayInfo.direction.normalize().mul(TileMap.MAX_RAY_LENGTH);
    }

    end.add(rayInfo.direction);

    /* pragma:DEBUG_START */
    //if (R.Engine.getDebugMode() && arguments[2]) {
    //    var f = R.clone(begin), t = R.clone(end);
    //
    //    arguments[2].postRender(function () {
    //        this.setLineStyle("orange");
    //        this.setLineWidth(2);
    //        this.drawLine(f, t);
    //        f.destroy();
    //        t.destroy();
    //    });
    //}
    /* pragma:DEBUG_END */

    // Use Bresenham's algorithm to calculate the points along the line
    line = Math2D.bresenham(begin, end);

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
  }

  /**
   * Set the dimensions of the tile map.  Setting the dimensions will clear the tile map.
   * @param pt {Point2D}
   */
  set dimensions(pt) {
    this.mapOpts.dimensions.copy(pt);
    this.mapOpts.tilemap = [];
    RenderEngine.Support.fillArray(this.mapOpts.tilemap, this.mapOpts.dimensions.x * this.mapOpts.dimensions.y, null);
  }

  /**
   * Get the basis tile for the tile map.  The first tile within a tile map determines
   * the basis of all tiles.  Thus, if you drop a 32x32 tile into the tile map, all tiles
   * must be divisible by 32 along each axis.
   * @return {TileResource}
   */
  get baseTile() {
    return this.mapOpts.baseTile;
  }

  /**
   * Get the internal representation of the tile map.
   * @return {Array}
   * @private
   */
  get tileMap() {
    return this.mapOpts.tilemap;
  }

  /**
   * Set the tile at the given position.
   * @param tile {TileResource} The tile
   * @param x {Number} The X position of the tile
   * @param y {Number} The Y position of the tile
   */
  setTile(tile, x, y) {
    // Check to see if the tile is the same size as the last added tile
    var tbb = tile.boundingBox;
    Assert(this.baseTile == null || (tbb.width % this.baseTile.boundingBox.width === 0 && tbb.height % this.baseTile.boundingBox.height === 0),
      "Tiles in a TileMap must be the same size!");

    this.mapOpts.tilemap[x + y * this.mapOpts.width] = tile;
    if (!this.mapOpts.baseTile) {
      this.mapOpts.baseTile = tile;
    }
  }

  /**
   * Get the tile at the given position.  The position is a tile location between
   * zero and the dimensions of the tile map along the X and Y axis.  For a tile map
   * that is 200 x 200, X and Y would be between 0 and 200.
   *
   * @param x {Number} The X position
   * @param y {Number} The Y position
   * @return {TileResource}
   */
  getTile(x, y) {
    return this.mapOpts.tilemap[x + y * this.mapOpts.width];
  }

  /**
   * Get the tile at the given point.  The point is a world location which will be
   * transformed into a tile location.  The point will be adjusted to reflect the
   * position within the tile.
   *
   * @param point {Point2D} The point to retrieve the tile for
   * @return {TileResource} The tile, or <code>null</code>
   */
  getTileAtPoint(point) {
    if (!this.mapOpts.baseTile) {
      return null;
    }

    var baseWidth = this.mapOpts.baseTile.boundingBox.width, baseHeight = this.mapOpts.baseTile.boundingBox.height,
      x = Math.floor(point.x / baseWidth), y = Math.floor(point.y / baseHeight),
      tile = this.getTile(x, y);

    // If there's no tile at this location, return null
    if (tile === null) {
      return tile;
    }

    // Adjust the point to be within the tile's bounding box and return the tile
    point.set((tile.boundingBox.width - baseWidth) + (point.x % baseWidth),
      (tile.boundingBox.height - baseHeight) + (point.y % baseHeight));
    return tile;
  }

  /**
   * Clear the tile at the given position, returning the tile that occupied the
   * position, or <code>null</code> if there was no tile.
   * @param x {Number} The X position
   * @param y {Number} The Y position
   * @return {TileResource}
   */
  clearTile(x, y) {
    var tile = this.mapOpts.tilemap[x + y * this.mapOpts.width];
    this.mapOpts.tilemap[x + y * this.mapOpts.width] = null;
    return tile;
  }

  set alwaysRender(state) {
    this.mapOpts.alwaysRender = state;
    this.mapOpts.isRendered = false;
  }

  get alwaysRender() {
    return this.mapOpts.alwaysRender;
  }

  /**
   * Set the parallax distance of the tile map from the viewer's eye.  Setting the parallax distance
   * can create the illusion of depth when layers move at different rates along the X
   * and Y axis.  The distance is a vector which specifies the amount of offset along each
   * axis, from the viewer's eye, with 1 being the middle plane.  Each value should be a floating
   * point number with numbers closer to zero meaning closer to the eye (or faster change) and
   * numbers greater than 1 meaning farther from the eye (or slower change).
   *
   * @param point {Vector2D} A vector indicating the amount of offset
   */
  set parallax(point) {
    this.mapOpts.parallax.copy(point);
  }

  /**
   * Returns the parallax distance of the tile map along each axis.
   * @return {Vector2D}
   */
  get parallax() {
    return this.mapOpts.parallax;
  }

  renderStaticTiles(renderContext) {
    // Render static tiles to an image and set that as the background for the
    // render context.  First we need to calculate the width and height of the tilemap
    var baseTileSize = this.baseTile.boundingBox, tileWidth = baseTileSize.width, tileHeight = baseTileSize.height;
    var renderWidth = tileWidth * this.mapOpts.width, renderHeight = tileHeight * this.mapOpts.height;
    var tempContext;

    if (!this.alwaysRender) {
      tempContext = RenderUtil.getTempContext(CanvasContext, renderWidth, renderHeight);
    } else {
      tempContext = renderContext;
    }

    var tile, t, rect = Rectangle2D.create(0, 0, 1, 1), topLeft = Point2D.create(0, 0);

    // Render out all of the tiles
    for (t = 0; t < this.mapOpts.tilemap.length; t++) {
      tile = this.mapOpts.tilemap[t];
      if (!tile)
        continue;

      rect.x = (t % this.mapOpts.width) * tileWidth;
      rect.y = Math.floor(t / this.mapOpts.height) * tileHeight;
      rect.width = tileWidth;
      rect.height = tileHeight;

      // Get the frame and draw the tile
      var f = tile.getFrame(0, 0),
        obj = tempContext.drawImage(rect, tile.sourceImage, f,
          (tile.isAnimation() ? tile : null));

      f.destroy();
    }

    if (!this.alwaysRender) {
      renderContext.style.backgroundImage = "url(" + tempContext.getDataURL('image/png') + ")";
      tempContext.destroy();
      tempContext = null;
      this.mapOpts.isRendered = true;
    }

    rect.destroy();
    topLeft.destroy();
  }

  render(renderContext) {
    if (this.mapOpts.baseTile === null) {
      return;
    }

    if (!this.mapOpts.isRendered) {
      this.renderStaticTiles(renderContext, time, dt);
    }

    renderContext.pushTransform();
    renderContext.position = Point2D.ZERO;
    renderContext.scale = 1;

    var tile, t, rect = Rectangle2D.create(0, 0, 1, 1), wp = renderContext.worldPosition,
      tileWidth = this.mapOpts.baseTile.boundingBox.width, tileHeight = this.mapOpts.baseTile.boundingBox.height;

    var topLeft = R.clone(wp);
    topLeft.convolve(this.mapOpts.parallax);
    topLeft.sub(wp);

    // Render out all of the tiles
    for (t = 0; t < this.mapOpts.tilemap.length; t++) {
      tile = this.mapOpts.tilemap[t];
      if (!tile || (tile && !tile.isAnimation()))
        continue;

      rect.x = (t % this.mapOpts.width) * tileWidth;
      rect.y = Math.floor(t / this.mapOpts.height) * tileHeight;
      rect.width = tileWidth;
      rect.height = tileHeight;
      rect.add(topLeft);

      // Get the frame and draw the tile
      var f = tile.getFrame(time, dt),
        obj = renderContext.drawImage(rect, tile.sourceImage, f,
          (tile.isAnimation() ? tile : null));

      f.destroy();
    }


    rect.destroy();
    topLeft.destroy();

    renderContext.popTransform();
  }

  /**
   * Get the z-index of the tile map.
   * @return {Number}
   */
  get zIndex() {
    return this.mapOpts.zIndex;
  }

  /**
   * Set the z-index of the tile map.
   * @param zIndex {Number} The z-index (depth) of the tile map.
   */
  set zIndex(zIndex) {
    this.mapOpts.zIndex = zIndex;
  }

  /**
   * When editing objects, this method returns an object which
   * contains the properties with their getter and setter methods.
   * @return {Object} The properties object
   */
  getProperties() {
    var prop = super.getProperties();
    return prop;
    //return $.extend(prop, {
    //    "Dimensions":[function () {
    //        return self.dimensions.toString()
    //    }, function (i) {
    //        var coords = i.split(",");
    //        self.setDimensions(parseInt(coords[0]), parseInt(coords[1]));
    //    }, true],
    //    "TileScaleX":[function () {
    //        return self.tileScale.x;
    //    }, function (i) {
    //        self.tileScale.setX(parseFloat(i));
    //    }, true],
    //    "TileScaleY":[function () {
    //        return self.tileScale.y;
    //    }, function (i) {
    //        self.tileScale.setY(parseFloat(i));
    //    }, true],
    //    "TileSizeX":[function () {
    //        return self.baseTile ? self.baseTile.getBoundingBox().w : "";
    //    }, null, false],
    //    "TileSizeY":[function () {
    //        return self.baseTile ? self.baseTile.getBoundingBox().h : "";
    //    }, null, false],
    //    "Zindex":[function () {
    //        return self.getZIndex();
    //    }, function (i) {
    //        self.setZIndex(parseInt(i));
    //    }, true],
    //    "Parallax":[function () {
    //        return self.getParallax().toString();
    //    }, function (i) {
    //        var coords = i.split(",");
    //        self.setParallax(parseFloat(coords[0]), parseFloat(coords[1]));
    //    }, true]
    //});
  }

}
