/**
 * The Render Engine
 * RemoteLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A base loader which implements the {@link #exists} method to
 *        synchronously check for the existence of a file.
 *
 * @constructor
 * @param name {String=RemoteLoader} The name of the resource loader
 * @extends AbstractResourceLoader
 */
class RemoteLoader extends AbstractResourceLoader {

  static STATUS_OK = 200;
  static STATUS_CACHED = 304;
  static STATUS_NOT_FOUND = 404;
  static STATUS_SERVER_ERROR = 500;

  constructor(name = "RemoteLoader") {
    super(name);
    this._pathUrls = {};
  }

  /**
   * Get the class name of this object.
   * @return {String} The string "RemoteLoader"
   */
  get className() {
    return "RemoteLoader";
  }

  /**
   * Performs a synchronous check for a file on the server.  While this approach will
   * work in most cases, there is the possibility that the server will become unavailable
   * before the request is made.  In this case, the application will hang until the
   * request is satisfied (which may be never).
   *
   * @param url {String} The URL to check
   * @return {Boolean} <tt>true</tt> if the file exists on the server or is in
   *          the cache.
   */
  static exists(url) {
    var stat = jQuery.ajax({
      type: "GET",
      url: url,
      async: false,
      dataType: "text"
    }).status;

    // If it returns OK or Cache not modified...
    return (stat === RemoteLoader.STATUS_OK || stat === RemoteLoader.STATUS_CACHED);
  }

  /**
   * The name of the resource this loader will get.
   * @returns {String} The string "remote"
   */
  get resourceType() {
    return "remote";
  }

  /**
   * Load an resource from a remote URL.
   *
   * @param name {String} The name of the resource
   * @param url {String} The URL where the resource is located
   * @param data {Object} The loaded data to cache
   */
  load(name, url, data, isReady) {
    super.load(name, data, isReady);
    this.setPathUrl(name, url);
  }

  /**
   * Set the path where a resource is located.
   * @param name {String} the name of the resource
   * @param url {String} The URL where the resource is located
   */
  setPathUrl(name, url) {
    // If the URL contains the game host or path, remove that
    url = url.replace(RenderEngine.game.gamePath, "");
    this._pathUrls[name] = url;
  }

  /**
   * Get the URL where the resource is located.
   * @param name {String} The name of the resource
   * @return {String}
   */
  getPathUrl(name) {
    return this._pathUrls[name];
  }

}
