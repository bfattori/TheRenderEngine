/**
 * The Render Engine
 * HashContainer
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A hash container is a logical collection of objects.  A hash container
 *        is a container with a backing object for faster lookups.  Objects within
 *        the container must have unique names. When the container is destroyed, none of the
 *        objects within the container are destroyed with it.  Call {@link #cleanUp} to
 *        destroy all of the objects in the container.
 *
 * @param containerName {String} The name of the container. Default: Container
 * @extends Container
 * @constructor
 * @description Create a hashed container object.
 */
class HashContainer extends Container {

  /**
   * @private
   */
  constructor(containerName) {
    super(containerName || "HashContainer");
    this.objHash = {};
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.struct.HashContainer"
   */
  get className() {
    return "HashContainer";
  }

  /**
   * Release the object back into the object pool.
   */
  release() {
    this.clear();
    super.release();
  }

  /**
   * Returns <tt>true</tt> if the object name is already in
   * the hash.
   *
   * @param key {String} The name of the hash to check
   * @return {Boolean}
   */
  isInHash(key) {
    key = (key.charAt(0) === "_" ? key : "_" + String(key));
    return (this.objHash[key] != null);
  }

  /**
   * Add an object to the container.
   *
   * @param key {String} The name of the object to store.  Names must be unique
   *                      or the object with that name will be overwritten.
   * @param obj {BaseObject} The object to add to the container.
   */
  add(key, obj) {
    if (this.isInHash(key)) {
      // Remove the old one first
      this.removeHash(key);
    }

    // Some keys weren't being accepted (like "MOVE") so added
    // an underscore to prevent keyword collisions
    this.objHash["_" + String(key)] = obj;
    super.add(obj);
    return this.objHash["_" + String(key)];
  }

  /** @private */
  addAll() {
    R._unsupported("addAll()", this);
  }

  /** @private */
  clone() {
    R._unsupported("clone()", this);
  }

  /** @private */
  concat() {
    R._unsupported("concat()", this);
  }

  /** @private */
  reduce() {
    R._unsupported("reduce()", this);
  }

  /**
   * Remove an object from the container.  The object is
   * not destroyed when it is removed from the container.
   *
   * @param obj {BaseObject} The object to remove from the container.
   * @return {Object} The object removed from the container
   */
  remove(obj) {
    for (var o in this.objHash) {
      if (this.objHash[o] === obj) {
        // removeHash() takes care of removing the actual object, so we don't
        // call the base class - otherwise we delete the wrong object
        this.removeHash(o);
        break;
      }
    }
    return obj;
  }

  /**
   * Remove the object with the given key name from the container.
   *
   * @param key {String} The object to remove
   * @return {Object} The object removed
   */
  removeHash(key) {
    key = (key.charAt(0) === "_" ? key : "_" + String(key));
    var obj = this.objHash[key];
    R.engine.Support.arrayRemove(this.objects, obj);
    delete this.objHash[key];
    return obj;
  }

  /**
   * Remove an object from the container at the specified index.
   * The object is not destroyed when it is removed.
   *
   * @param idx {Number} An index between zero and the size of the container minus 1.
   * @return {Object} The object removed from the container.
   */
  removeAtIndex(idx) {
    var obj = this.base(idx);
    for (var o in this.objHash) {
      if (this.objHash[o] === obj) {
        this.removeHash(o);
        break;
      }
    }

    return obj;
  }

  /**
   * If a number is provided, the request will be passed to the
   * base object, otherwise a name is assumed and the hash will
   * be retrieved.
   *
   * @param idx {Number|String} The index or hash of the object to get
   * @return {Object}
   */
  get(idx) {
    if (idx.substr && idx.toLowerCase) {
      return this.objHash["_" + idx];
    } else {
      return super.get(idx);
    }
  }

  filter(fn, thisp) {
    R._unsupported("filter()", this);
  }

  /**
   * Remove all objects from the container.  None of the objects are
   * destroyed.
   */
  clear() {
    var key;

    super.clear();

    for (key in this.objHash) {
      if (this.objHash.hasOwnProperty(key)) {
        this.objHash[key] = undefined;
        delete this.objHash[key];
      }
    }
  }


}
