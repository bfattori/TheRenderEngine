/**
 * The Render Engine
 * TileLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Loads tile resources and makes them available to the system.  Tiles are
 *        defined by an external JSON resource file.  A tile definition file
 *        is a JSON file which is nearly identical to sprite sheets.  The format
 *        describes the image which contains the sprites, the dimensions of the image,
 *        the version of the file, and the tile definitions.  Tiles can be either single
 *        frames or animations.  Animations are expected to be sequentially organized
 *        in the bitmap from left to right.  Each frame of an animation must be the exact
 *        same dimensions.
 *        <p/>
 *        A frame is simply defined by the upper left corner of the tile and the
 *        width and height of the frame.  For an animation, the first four entries are
 *        the same as a frame, followed by the frame count, the millisecond delay between
 *        frames, and the type of animation (either "loop" or "toggle").  A looped animation
 *        will play all frames, indicated by the frame count, and then start again from the
 *        beginning of the animation.  A toggled animation will play from the first to
 *        the last frame, then play from the last to the first, and then repeat.  The
 *        first and last frame will not be repeated in a toggled animation.  Thus, if
 *        the frames are A, B, C, then the toggle will play as A, B, C, B, A, B...
 *        <p/>
 *        The sparsity value is used to produce each tile's solidity map so that the map
 *        will consist of averaged pixels, resulting in a simplified map for collisions.
 *        The transparencyThreshold determines above what alpha value a pixel is no longer
 *        considered transparent, but solid.  Setting the assumeOpaque flag will short-circuit
 *        all solidity map calculations and assume all tiles to be completely opaque.
 *
 * <pre>
 * {
 *    // Tile definition file v2
 *    "bitmapImage": "bitmapFile.ext",
 *    "bitmapSize": [320, 320],
 *    "version": 2
 *    "sparsity": 1,
 *    "transparencyThreshold": 0,
 *    "assumeOpaque": false,
 *    "tiles": {
 *        "girder": [0, 0, 32, 32],
 *        "gears": [32, 0, 32, 32, 3, 150, "loop"]
 *    }
 * }
 * </pre>
 *
 * @constructor
 * @param name {String=TileLoader} The name of the resource loader
 * @extends SpriteLoader
 */
class TileLoader extends SpriteLoader {

  constructor(name = "TileLoader") {
    super(name);
    this._tiles = {};
  }

  /**
   * Get the class name of this object.
   * @return {String} The string "TileLoader"
   */
  get className() {
    return "TileLoader";
  }

  /**
   * Called after the data has been loaded, passing along the info object and name
   * of the sprite resource.
   * @param name {String} The name of the sprite resource
   * @param info {Object} The sprite resource definition
   */
  afterLoad(name, info) {
    super.afterLoad(name, info);
  }

  /**
   * Creates a {@link TileResource} object representing the named tile.
   *
   * @param resource {String} The name of a loaded tile resource
   * @param tile {String} The name of the tile from the resource
   * @return {TileResource} A {@link TileResource} instance
   */
  getTile(resource, tile) {
    var info = this.get(resource).info;
    if (info != null && info.sprites[tile]) {
      var aTile = this._tiles[tile];
      if (!aTile) {
        // We want to make sure we only create a tile singleton, not instances for each tile
        aTile = this._tiles[tile] = TileResource.create(tile, info.sprites[tile], this.get(resource), this);
      }
      return aTile;
    } else {
      return null;
    }
  }

  /**
   * Export all of the tiles in the specified resource, as a JavaScript object, with the
   * tile name as the key and the corresponding {@link TileResource} as the value.
   * @param resource {String} The name of the tile resource
   * @param [tileNames] {Array} An optional array of tiles to export, by name,
   *         or <code>null</tt> to export all tiles
   */
  exportAll(resource, tileNames) {
    var o = {};
    var tiles = this.getSpriteNames(resource);
    for (var i in tiles) {
      if (!tileNames || RenderEngine.Support.indexOf(tileNames, tiles[i]) != -1) {
        o[tiles[i]] = this.getTile(resource, tiles[i]);
      }
    }
    return o;
  }

  /**
   * Sparsity is used to reduce the size of the solidity map for each frame of every tile.
   * The higher the sparsity, the more pixels will be averaged together to get a smaller map.
   * This has the potential to improve performance when performing ray casting by eliminating
   * the need to calculate collisions per pixel.
   * @param resource {String} The name of the tile resource
   * @return {Number}
   */
  getSparsity(resource) {
    return this.get(resource).info.sparsity;
  }

  /**
   * Get the transparency threshold at which pixels are considered to be either transparent or
   * solid.  Pixel alpha values above the specified threshold will be considered solid when
   * calculating the solidity map of a tile.
   * @param resource {String} The name of the tile resource
   * @return {Number} Value between 0 and 255
   */
  getThreshold(resource) {
    return this.get(resource).info.transparencyThreshold;
  }

  /**
   * Get the state of the flag indicating if all tiles should be considered fully opaque.
   * @param resource {String} The name of the tile resource
   * @return {Boolean}
   */
  getOpacityFlag(resource) {
    return this.get(resource).info.assumeOpaque;
  }

  /**
   * The name of the resource this loader will get.
   * @returns {String} The string "tile"
   */
  get resourceType() {
    return "tile";
  }

}
