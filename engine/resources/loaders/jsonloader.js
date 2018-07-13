/**
 * The Render Engine
 * JSONLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Loads JSON objects from a specified URL.  The object uses a sligtly modified
 *          format which allows for single-line comments in the object definition.  The
 *          object must follow the rest of the JSON spec, with key names in quotes.
 *
 * @constructor
 * @param name {String=ObjectLoader} The name of the resource loader
 * @extends RemoteLoader
 */
class JSONLoader extends RemoteLoader {

  constructor(name = "ObjectLoader") {
    super(name);
    this._objects = {};
  }

  /**
   * Get the class name of this object.
   * @return {String} The string "R.resources.loaders.ObjectLoader"
   */
  get className() {
    return "JSONLoader";
  }

  /**
   * Load a JSON object from a URL.
   *
   * @param name {String} The name of the resource
   * @param url {String} The URL where the resource is located
   * @param [obj] {Object}
   */
  load(name, url, obj) {
    if (obj === undefined) {
      var loc = window.location;
      if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.hostname) == -1) {
        Assert(false, "Objects must be located on this server");
      }

      var thisObj = this;

      // Get the file from the server
      RenderEngine.loadJSON(url, function (data) {
        // 2nd pass - store the object
        if (data) {
          thisObj.load(name, url, data);
        } else {
          console.error("File at '" + url + "' returned no data.");
        }
      });
    }
    else {
      // The object has been loaded and is ready for use
      super.load(name, url, obj, true);
      this.afterLoad(name, obj);
    }
  }

  /**
   * [ABSTRACT] Allow a subclass to handle the data, potentially loading additional
   * resources and preparing for use.
   * @param name {String} The name of the object
   * @param obj {Object} The object which was loaded
   */
  afterLoad(name, obj) {
  }

  /**
   * The name of the resource this loader will get.
   * @returns {String} The string "json"
   */
  get resourceType() {
    return "json";
  }

}
