/**
 * The Render Engine
 * SpriteLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Loads sprite resources and makes them available to the system.  Sprites are
 *        defined by an external JSON resource file.  A sprite definition file
 *        is a JSON file which can support single-line comments.  The format
 *        describes the image which contains the bitmap, the size of the bitmap,
 *        the version of the file, and the sprites.  Sprites can be either single
 *        frames or animations.  Animations are expected to be sequentially organized
 *        in the bitmap from left to right.  Each frame of an animation must be the exact
 *        same size.
 *        <p/>
 *        A frame is simply defined by the upper left corner of the sprite and the
 *        width and height of the frame.  For an animation, the first four arguments are
 *        the same as a frame, followed by the frame count, the millisecond delay between
 *        frames, and the type of animation (either "loop" or "toggle").  A looped animation
 *        will play all frames, indicated by the frame count, and then start again from the
 *        beginning of the animation.  A toggled animation will play from the first to
 *        the last frame, then play from the last to the first, and then repeat.  The
 *        first and last frame will not be repeated in a toggled animation.  Thus, if
 *        the frames are A, B, C, then the toggle will play as A, B, C, B, A, B...
 * <pre>
 * {
 *    // Sprite definition file v2
 *    "bitmapImage": "bitmapFile.ext",
 *    "bitmapSize": [320, 320],
 *    "version": 2
 *    "sprites": {
 *        "stand": [0, 0, 32, 32],
 *        "walk": [32, 0, 32, 32, 3, 150, "loop"]
 *    }
 * }
 * </pre>
 *
 * @constructor
 * @param name {String=SpriteLoader} The name of the resource loader
 * @extends ImageLoader
 */
class SpriteLoader extends ImageLoader {

  constructor(name = "SpriteLoader") {
    super(name);
    this._sprites = {};
    this._queuedSprites = 0;
  }

  /**
   * Get the class name of this object.
   * @return {String} The string "SpriteLoader"
   */
  get className() {
    return "SpriteLoader";
  }

  /**
   * Load a sprite resource from a URL.
   *
   * @param name {String} The name of the resource
   * @param url {String} The URL where the resource is located
   * @param [info] {Object}
   * @param [path] {String}
   */
  load(name, url, info, path) {
    if (!info) {
      var loc = window.location;
      if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.hostname) == -1) {
        Assert(false, "Sprites must be located on this server");
      }

      this._queuedSprites++;

      // Get the file from the server
      RenderEngine.loadJSON(url, function (spriteInfo) {
        // get the path to the resource file
        var path = url.substring(0, url.lastIndexOf("/"));
        this.load(name, url, spriteInfo, path + "/");
        this.afterLoad(name, spriteInfo, path + "/");
      });
    }
    else {
      info.bitmapImage = path + info.bitmapImage;
      //console.info("Loading sprite: " + name + " @ " + info.bitmapImage);

      // Load the sprite image file
      super.load(name, info.bitmapImage, info.bitmapSize[0], info.bitmapSize[1]);

      // Store the sprite info
      this._sprites[name] = info;

      // Since the path that is stored by ImageLoader is the path to the image
      // and not the descriptor, we need to override the value
      this.setPathUrl(name, url);

      this._queuedSprites--;
    }
  }

  /**
   * Called after the data has been loaded, passing along the info object and name
   * of the sprite resource.
   * @param name {String} The name of the sprite resource
   * @param info {Object} The sprite resource definition
   */
  afterLoad(name, info) {
  }

  /**
   * Get the sprite resource with the specified name from the cache.  The
   * object returned contains the bitmap as <tt>image</tt> and
   * the sprite definition as <tt>info</tt>.
   *
   * @param name {String} The name of the object to retrieve
   * @return {Object} An object representing the sprite
   */
  get(name) {
    var bitmap = super.get(name);
    return {
      resourceName: name,
      image: bitmap,
      info: this._sprites[name]
    };
  }

  /**
   * Check to see if a named resource is "ready for use".
   * @param name {String} The name of the resource to check ready status for,
   *             or <tt>null</tt> for all resources in loader.
   * @return {Boolean} <tt>true</tt> if the resource is loaded and ready to use
   */
  isReady(name) {
    // If sprites are queued, we can't be totally ready
    if (this._queuedSprites > 0) {
      return false;
    }

    return super.isReady(name);
  }

  /**
   * Creates a {@link R.resources.types.Sprite} object representing the named sprite.
   *
   * @param resource {String} The name of a loaded sprite resource
   * @param sprite {String} The name of the sprite from the resource
   * @return {R.resources.types.Sprite} A {@link R.resources.types.Sprite} instance
   */
  getSprite(resource, sprite) {
    var info = this.get(resource).info;
    return SpriteResource.create(sprite, info.sprites[sprite], this.get(resource), info.version, this);
  }

  /**
   * Get the names of all the sprites available in a resource.
   *
   * @param resource {String} The name of the resource
   * @return {Array} All of the sprite names in the given loaded resource
   */
  getSpriteNames(resource) {
    var s = [];
    var spr = this._sprites[resource].sprites;
    for (var i in spr) {
      s.push(i);
    }
    return s;
  }

  /**
   * Export all of the sprites in the specified resource, as a JavaScript object, with the
   * sprite name as the key and the corresponding {@link R.resources.types.Sprite} as the value.
   * @param resource {String} The name of the sprite resource
   * @param [spriteNames] {Array} An optional array of sprites to export, by name,
   *         or <code>null</tt> to export all sprites
   */
  exportAll(resource, spriteNames) {
    var o = {};
    var sprites = this.getSpriteNames(resource);
    for (var i in sprites) {
      if (!spriteNames || RenderEngine.Support.indexOf(spriteNames, sprites[i]) != -1) {
        o[sprites[i]] = this.getSprite(resource, sprites[i]);
      }
    }
    return o;
  }

  /**
   * The name of the resource this loader will get.
   * @returns {String} The string "sprite"
   */
  get resourceType() {
    return "sprite";
  }

}
