/**
 * The Render Engine
 * KeyValueStore
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class <tt>KeyValueStore</tt> persists data as keys with associated values
 *
 * @param name {String} The name of the store
 * @extends AbstractStorage
 * @constructor
 * @description This class of storage is the base for all key/value storage systems
 */
class KeyValueStore extends AbstractStorage {

  constructor(name = "KeyValueStore") {
    super(name);
    this._hash = this.deserialize();
  }

  release() {
    super.release();
    this._hash = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "KeyValueStore"
   */
  get className() {
    return "KeyValueStore";
  }

  /**
   * Save a value to storage.
   * @param key {String} The key to store the data with
   * @param value {Object} The value to store with the key
   */
  save(key, value) {
    if (typeof key === "object" && !R.isArray(key)) {
      // Set the entire hash
      this._hash = key;
    } else {
      this._hash[key] = value;
    }

    this.flush();
  }

  /**
   * Get the value associated with the key from storage.
   * @param key {String} The key to retrieve data for
   * @return {Object} The value that was stored with the key, or <tt>null</tt>
   */
  load(key) {
    if (!key) {
      return this._hash();
    }
    return this._hash[key];
  }

  /**
   * Clear all of the data stored in the cookie.
   */
  clear() {
    this._hash = {};
    this.flush();
  }

  /**
   * Flush contents
   */
  flush() {
    this.serialize(this._hash);
  }

  /**
   * Serialize the data object to the storage.
   * @param data {Object}
   */
  serialize(data) {
    (this.storageObject)[this.name] = JSON.stringify(data);
  }

  /**
   * Deserialize the data object from the storage.
   */
  deserialize() {
    return JSON.parse((this.storageObject)[this.name]);
  }
}


