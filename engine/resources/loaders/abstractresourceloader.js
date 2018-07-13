/**
 * The Render Engine
 * AbstractResourceLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class  A resource loader is a generalized interface used by all resource
 *         loaders.  It is designed to provide a common set of routines for
 *         loading resources (fonts, images, game data, etc...) from some
 *         location.  Additionally, objects are cached by this base class,
 *         although some classes make use of other methods to enhance the
 *         caching, such as the {@link R.resources.loaders.ImageLoader} class.
 *
 * @param [name=ResourceLoader] {String} The name of the resource loader.
 * @constructor
 * @extends BaseObject
 * @description Create a resource loader
 */
class AbstractResourceLoader extends BaseObject {

  constructor(name = "ResourceLoader") {
    super(name);
    this._cache = {};
    this._loadTimeout = null;
    this._length = 0;
  }

  release() {
    super.release();
    this._cache = null;
    this._loadTimeout = null;
    this._length = 0;
  }

  /**
   * Destroy the resource loader and all cached resources.
   */
  destroy() {
    this.clear();
    super.destroy();
  }

  /**
   * Get the class name of this object
   * @return {String} "AbstractResourceLoader"
   */
  get className() {
    return "AbstractResourceLoader";
  }

  get length() {
    return this._length;
  }

  /**
   * Load an object via this resource loader, and add it to the cache.  When
   * all resources being loaded by this resource loader are ready, fires the
   * <code>isready</code> event.
   *
   * @param name {String} The name to refer to the loaded object
   * @param data {Object} The data to store in the cache
   * @param isReady {Boolean} A flag that states whether or not a resource
   *                          is ready to use.
   */
  load(name, data, isReady) {
    var obj = {data: data, ready: isReady || false};
    this._cache[name] = obj;
    this._length++;
    //console.info("Loading " + this.getResourceType() + ": " + name);

    // The event trigger when all resources are loaded and ready
    if (!this._loadTimeout) {
      this._loadTimeout = Timeout.create("LoadTimeout", 100, function () {
        if (this.ready) {
          this.destroy();
          this.fireReadyEvent();
        } else {
          this.restart();
        }
      }.bind(this));
    }
    return obj.data;
  }

  /**
   * Set the "ready" state of the resource.  When a resource has been completely
   * loaded, set the resource "ready" state to <tt>true</tt> to allow objects
   * waiting for those resources to utilize them.  Fires the <code>resourceready</code>
   * event, with the name of the resource, when the resource is ready to use.
   *
   * @param name {String} The name of the resource
   * @param isReady {Boolean} <tt>true</tt> to set the resource to "ready for use"
   */
  setReady(name, isReady) {
    this._cache[name].ready = isReady;
    if (isReady) {
      this.triggerEvent("resourceready", [name]);
      //console.info(this.getResourceType() + " " + name + " ready...");
    }
  }

  /**
   * Check to see if a named resource is, or all resources are, "ready for use".
   * @param name {String} The name of the resource to check ready status for,
   *             or <tt>null</tt> for all resources in loader.
   * @return {Boolean} <tt>true</tt> if the resource is loaded and ready to use
   */
  isReady(name) {
    if (name) {
      return this._cache[name] ? this._cache[name].ready : false;
    } else {
      // Check the status of all loader elements
      var rList = this.resources;
      if (rList.length === 0) {
        // Early out, no resources to load
        return true;
      }
      for (var r in rList) {
        if (!this.isReady(rList[r])) {
          return false;
        }
      }
      return true;
    }
  }

  /**
   * Fires an event when all of the resources being loaded by this loader are
   * ready for use.
   * @private
   */
  fireReadyEvent() {
    this.triggerEvent("isready");
    this._loadTimeout = null;
  }

  /**
   * Unload an object from this resource loader.  Removes the object
   * from the cache.
   *
   * @param name {String} The name of the object to remove
   */
  unload(name) {
    if (this._cache[name].data.destroy) {
      // Make sure that cached objects have a chance to clean up
      this._cache[name].data.destroy();
    }

    this._cache[name] = null;
    delete this._cache[name];
    this._length--;
  }

  /**
   * Get the object with the specified name from the cache.
   *
   * @param name {String} The name of the object to retrieve
   * @return {Object} The object stored within the cache
   */
  get(name) {
    if (this._cache[name]) {
      return this._cache[name].data;
    } else {
      return null;
    }
  }

  /**
   * Get the specific resource supported by the resource loader.
   * @param name {String} The name of the resource
   * @return {Object}
   */
  getResourceObject(name) {
    return this.get(name);
  }

  /**
   * Set the data associated with the name.  The ready state is set
   * to <tt>false</tt>, so it will be up to the developer to call
   * {@link #setReady} on the object if the object is truly ready for use.
   * @param name {String} The name of the cache record
   * @param data {Object} Data to store
   */
  set(name, data) {
    var obj = {data: data, ready: false};
    this._cache[name] = obj;
  }

  /**
   * Returns the cache.  You should not manipulate the cache directly.
   * instead, call methods to update the cache.
   * @return {Object} The cache
   */
  get cachedObjects() {
    return this._cache;
  }

  /**
   * Clear the objects contained in the cache.
   */
  clear() {
    for (var o in this._cache) {
      this._cache[o] = null;
    }

    this._cache = {};
    this._length = 0;
  }

  /**
   * Get the names of all the resources available in this resource loader.
   * @return {Array} An array of resource names
   */
  get resources() {
    var n = [];
    for (var i in this._cache) {
      n.push(i);
    }
    return n;
  }

  /**
   * Export all of the resources in this loader, as a JavaScript object, with the
   * resource name as the key and the corresponding object as the value.
   * @param [resourceNames] {Array} An optional array of resources to export, by name,
   *       or <code>null</tt> to export all resources
   */
  exportAll(resourceNames) {
    var o = {};
    var resources = this.resources;
    for (var i in resources) {
      if (!resourceNames || RenderEngine.Support.indexOf(resourceNames, resources[i]) != -1) {
        o[resources[i]] = this.getResourceObject(resources[i]);
      }
    }
    return o;
  }

  /**
   * The name of the resource this loader will get.
   * @return {String} The string "default"
   */
  get resourceType() {
    return "default";
  }
}

