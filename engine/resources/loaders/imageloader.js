/**
 * The Render Engine
 * ImageLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Loads images and stores the reference to those images.  Images
 *        are stored on the client-side in a simple cache for faster re-use.
 *        When loading images, you assign a name to the image.  This would allow
 *        you to re-use the image without having to load it again for another
 *        purpose.
 *        <p/>
 *        Loading images is fairly simple.  You only need to create an instance
 *        of an image loader (multiple images can be loaded by the same resource
 *        loader) and then use it to load the images:
 <pre>
 this.imageLoader = R.resourceloaders.ImageLoader.create();

 // Load an image
 this.imageLoader.load("keys", this.getFilePath("resources/fingerboard.png"), 220, 171);
 </pre>
 *        In the example above, <tt>this</tt> refers to a {@link R.engine.Game} object which
 *        implements the {@link R.engine.Game#getFilePath getFilePath()} method which is
 *        used to get a path relative to where the game is located on the server.
 *
 * @constructor
 * @param name {String=ImageLoader} The name of the resource loader
 * @extends R.resources.loaders.RemoteLoader
 */
class ImageLoader extends RemoteLoader {

  static loadAdjust = 0.05;

  /** @private */
  constructor(name = "ImageLoader") {
    super(name);

    this._imageCache = document.createElement("div");
    this._imageCache.style.backgroundColor = "black";
    this._imageCache.style.display = "none";
  }


  /**
   * Get the class name of this object
   * @return {String} The string "ImageLoader"
   */
  get className() {
    return "ImageLoader";
  }


  /**
   * Load an image resource from a URL.  Images are cached within the page
   * in an invisible object for fast retrieval.
   *
   * @param name {String} The name of the resource
   * @param url {String} The URL where the resource is located
   * @param width {Number} The width of this resource, in pixels
   * @param height {Number} The height of this resource, in pixels
   */
  load(name, url, width, height) {
    // Create an image element
    var imageInfo = null;
    if (url != null) {
      imageInfo = this.loadImageResource(name, url, width, height);
    }

    super.load(name, url, imageInfo);
  }

  /**
   * Lazy loads an image resource when the information for it becomes available.  It
   * is best to specify the width and height of the resource, but it isn't necessary
   * to load the image.
   *
   * @param name {String} The name of the resource
   * @param url {String} The URL where the resource is located
   * @param width {Number} The width of this resource, in pixels, or <tt>null</tt>
   * @param height {Number} The height of this resource, in pixels, or <tt>null</tt>
   * @return {Object} The image loaded
   */
  loadImageResource(name, url, width, height) {
    var image = document.createElement("img");
    image.setAttribute("src", url);
    if (width && height) {
      image.setAttribute("width", width);
      image.setAttribute("height", height);
    }

    // Calculate an approximate wait time based on dimensions
    OneShotTimeout.create("readyImg", (width * height) * ImageLoader.loadAdjust, function () {
      this.setReady(name, true);
    }.bind(this));

    // Append it to the container so it can load the image
    this._imageCache.appendChild(image);
    return {
      width: width,
      height: height,
      image: image
    };
  }

  /**
   * Get the image from the resource stored with the specified name, or <tt>null</tt>
   * if no such image exists.
   *
   * @param name {String} The name of the image resource
   * @return {Object} The image
   */
  get(name) {
    var imgInfo = super.get(name);
    return imgInfo ? imgInfo.image[0] : null;
  }

  /**
   * Get an {@link ImageResource} object from the resource which represents the image, or <tt>null</tt>
   * if no such image exists.
   * @param name {String} The name of the image resource
   * @return {ImageResource}
   */
  getImage(name) {
    return ImageResource.create("Image", name, this);
  }

  /**
   * Get the specific image resource by name.
   * @param name {String} The name of the resource
   * @return {ImageResource}
   */
  getResourceObject(name) {
    return this.getImage(name);
  }

  /**
   * Get the dimensions of an image from the resource stored with
   * the specified name, or <tt>null</tt> if no such image exists.
   *
   * @param name {String} The name of the image resource
   * @return {Point2D} A point which represents the width and height of the image
   */
  getDimensions(name) {
    var imgInfo = this.cachedObjects[name] ? this.cachedObjects[name].data : null;
    return imgInfo ? Point2D.create(imgInfo.width, imgInfo.height) : null;
  }

  /**
   * The name of the resource this loader will get.
   * @return {String} The string "image"
   */
  get resourceType() {
    return "image";
  }

}
