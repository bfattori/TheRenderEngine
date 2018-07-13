/**
 * The Render Engine
 * Level
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Creates an instance of a Level object.
 *
 * @constructor
 * @param name {String} The name of the object
 * @param levelResource {Object} The level resource loaded by the LevelLoader
 * @extends BaseObject
 */
class Level extends BaseObject {

  constructor(name = "Level", width, height) {
    super(name);
    this.levelOpts = {
      actors: Container.create("Actors"),
      fixtures: Container.create("Fixtures"),
      tilemaps: HashContainer.create("Tilemaps"),
      backgroundMusic: null,
      width: width,
      height: height,
      renderContext: null,
      notAdded: [],
      version: 0,
      resourceLoaders: {
        sprite: [SpriteLoader.create("LevelSpriteLoader")],
        tile: [TileLoader.create("LevelTileLoader")],
        sound: []
      }
    };

    // Add the three tile maps
    this.levelOpts.tilemaps.add("background", TileMap.create("background", width, height));
    this.levelOpts.tilemaps.add("playfield", TileMap.create("playfield", width, height));
    this.levelOpts.tilemaps.add("foreground", TileMap.create("foreground", width, height));

    // Set the z-index for each tile map
    this.getTileMap("background").zIndex = 0;
    this.getTileMap("playfield").zIndex = 1;
    this.getTileMap("foreground").zIndex = 2;
  }

  destroy() {
    if (this.levelOpts.renderContext) {
      // Remove actors and tile maps from the render context
      var itr;
      for (itr = this.levelOpts.actors.iterator; itr.hasNext();) {
        this.levelOpts.renderContext.remove(itr.next());
      }
      itr.destroy();

      for (itr = this.levelOpts.tilemaps.iterator; itr.hasNext();) {
        this.levelOpts.renderContext.remove(itr.next());
      }
      itr.destroy();
    }

    // Clean up and destroy the actors, fixtures, and tile maps
    this.levelOpts.actors.cleanUp();
    this.levelOpts.actors.destroy();
    this.levelOpts.fixtures.cleanUp();
    this.levelOpts.fixtures.destroy();
    this.levelOpts.tilemaps.cleanUp();
    this.levelOpts.tilemaps.destroy();

    // If there's background music, get rid of that too
    if (this.levelOpts.backgroundMusic) {
      this.levelOpts.backgroundMusic.destroy();
    }

    super.destroy();
  }

  release() {
    super.release();
    this.levelOpts = null;
  }

  /**
   * Gets the class name of this object.
   * @return {String} The string "Level"
   */
  get className() {
    return "Level";
  }

  /**
   * Add a new resource loader to the set of resource loaders that the
   * level has access to.  By default, there is already a sprite and
   * tile loader when a level object is created.
   *
   * @param resourceLoader {AbstractResourceLoader} The resource loader to add
   */
  addResourceLoader(resourceLoader) {
    var loaderCache;
    if (resourceLoader instanceof TileLoader) {
      loaderCache = this.levelOpts.resourceLoaders.tile;
    } else if (resourceLoader instanceof SpriteLoader) {
      loaderCache = this.levelOpts.resourceLoaders.sprite;
    } else {
      loaderCache = this.levelOpts.resourceLoaders.sound;
    }
    loaderCache.push(resourceLoader);
  }

  /**
   * Set a version number for the level.
   * @param version {Number} A version number
   */
  set version(version) {
    this.levelOpts.version = version;
  }

  /**
   * Get the version number associated with the level
   * @return {Number}
   */
  get version() {
    return this.levelOpts.version;
  }

  /**
   * Associate the level with its render context so the tile maps can
   * be rendered properly.
   * @param renderContext {RenderContext2D}
   */
  set renderContext(renderContext) {
    if (!this.levelOpts.renderContext) {
      this.levelOpts.renderContext = renderContext;
      renderContext.add(this.levelOpts.getTileMap("background"));
      renderContext.add(this.levelOpts.getTileMap("playfield"));
      renderContext.add(this.levelOpts.getTileMap("foreground"));

      while (this.levelOpts.notAdded.length > 0) {
        // Add objects which aren't a part of the render context yet
        this.levelOpts.renderContext.add(this.levelOpts.notAdded.shift());
      }
    }
  }

  /**
   * Get the width of the level, in tiles.
   * @return {Number} The width of the level in tiles
   */
  get width() {
    return this.levelOpts.width;
  }

  /**
   * Get the height of the level, in tiles.
   * @return {Number} The height of the level in tiles
   */
  get height() {
    return this.levelOpts.height;
  }

  addActor(actor) {
    this.levelOpts.actors.add(actor);
    actor.tileMap = this.getTileMap("playfield");

    if (this.levelOpts.renderContext) {
      this.levelOpts.renderContext.add(actor);
    } else {
      this.levelOpts.notAdded.push(actor);
    }
  }

  removeActor(actor) {
    this.levelOpts.actors.remove(actor);
  }

  get actors() {
    return this.levelOpts.actors;
  }

  addFixture(fixture) {
    this.levelOpts.fixtures.add(fixture);
  }

  removeFixture(fixture) {
    this.levelOpts.fixtures.remove(fixture);
  }

  getFixtures(type) {
    if (!type) {
      return this.levelOpts.fixtures;
    } else {
      return this.levelOpts.fixtures.filter(function (fixture) {
        return (fixture.type === type);
      });
    }
  }

  getTileMap(name) {
    return this.tilemaps.get(name);
  }

  set backgroundMusic(sound) {
    this.levelOpts.backgroundMusic = sound;
  }

}

