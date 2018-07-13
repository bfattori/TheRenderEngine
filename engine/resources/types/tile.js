/**
 * The Render Engine
 * TileResource
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Represents a 2d tile.  The difference between a sprite and a tile is that
 *    tiles contain a "solidity map" which allows for raycasting when testing for collisions.
 *    Otherwise, tiles and sprites are identical.
 *
 * @constructor
 * @param name {String} The name of the tile within the resource
 * @param tileObj {Object} Passed in by a {@link TileLoader}.  An array which defines the
 *    tile frame, and parameters.
 * @param tileResource {Object} The tile resource loaded by the {@link TileLoader}
 * @description A tile is a sprite with the addition of a solidity map, computed from the
 *     pixels of the sprite.
 * @extends SpriteResource
 */
class TileResource extends SpriteResource {


  static SCALE1 = Vector2D.create(1, 1);

  static ALL_MIXED = 0;
  static ALL_TRANSPARENT = 1;
  static ALL_OPAQUE = 2;

  constructor(name = "TileResource", tileObj, tileResource, tileLoader) {
    super(name, tileObj, tileResource, 2, tileLoader);
    this.tileOpts = {
      tileObj: tileObj,
      solidityMap: null,
      renderedFlag: false
    };

    if (tileResource.info.assumeOpaque) {
      // Short-circuit
      this.tileOpts.solidityMap = {
        map: null,
        status: TileResource.ALL_OPAQUE
      };
    } else {
      this.solidityMap = TileMap.computeSolidityMap(this);
    }
  }

  release() {
    super.release();
    this.tileOpts = null;
  }

  /**
   * Gets the class name of this object.
   * @return {String} The string "R.resources.types.Tile"
   */
  get className() {
    return "TileResource";
  }

  /**
   * Specialized method to allow tiles to be cloned from one another.  This method is also
   * called by {@link R#clone} when cloning objects.
   *
   * @param tile {TileResource} Tile to clone from
   */
  static clone(tile) {
    return TileResource.create(tile.name, tile.tileOpts.tileObj, tile.tileResource, tile.tileLoader);
  }

  /**
   * Set the render context the tile is being rendered onto.
   * @param renderContext {RenderContext2D} The render context
   */
  set renderContext(renderContext) {
    if (this.tileOpts.renderContext === null) {
      this.tileOpts.renderContext = renderContext;
    }
  }

  /**
   * Get the resource this sprite originated from
   * @return {Object}
   */
  get tileResource() {
    return this.tileOpts.resource;
  }

  /**
   * Get the sprite loader this sprite originated from
   * @return {SpriteLoader}
   */
  get tileLoader() {
    return this.tileOpts.loader;
  }

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
  setSolidityMap(frame = 0, solidityMap, statusFlag) {
    this.tileOpts.solidityMap = {
      map: solidityMap,
      status: statusFlag
    };
  }

  /**
   * Test if the given point, local to the tile's coordinates, would
   * result in a collision.
   * @param point {Point2D}
   * @param time {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  testPoint(point, time, dt) {
    var sMap = this.tileOpts.solidityMap;
    if (sMap.status == TileResource.ALL_OPAQUE) {
      return true;
    } else if (sMap.status == TileResource.ALL_TRANSPARENT) {
      return false;
    } else {
      return !!sMap.map[point.x + (point.y * this.boundingBox.width)];
    }
  }

  get rotation() {
    return 0;
  }

  get scale() {
    return TileResource.SCALE1;
  }

  /**
   * Mark the tile as having been rendered to the context.  This is used for
   * HTML contexts where the tile should only render once unless it's an animated tile.
   */
  markRendered() {
    this.tileOpts.renderedFlag = true;
  }

  /**
   * Returns a flag indicating if the tile has been rendered to the context.
   * @return {Boolean}
   */
  get rendered() {
    return this.tileOpts.renderedFlag;
  }

}
