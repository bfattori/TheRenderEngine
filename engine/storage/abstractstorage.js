/**
 * The Render Engine
 * AbstractStorage
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class <tt>AbstractStorage</tt> is the base class of all storage objects.
 *
 * @param name {String} The name of the object
 * @extends PooledObject
 * @constructor
 * @description This base class is considered abstract and should not be
 *              instantiated directly.  See {@link TransientStorage},
 *              {@link PersistentStorage}, or {@link CookieStorage} for
 *              implementations.
 */
class AbstractStorage extends PooledObject {

  constructor(name = "AbstractStorage") {
    super(name);
    this._storageObject = this.initStorageObject();
  }

  /**
   * Destroy the object, cleaning up any events that have been
   * attached to this object.
   */
  destroy() {
    this._storageObject.flush();
    this._storageObject = null;
    super.destroy();
  }

  /**
   * Release the object back into the object pool.
   */
  release() {
    super.release();
    this._storageObject = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "AbstractStorage"
   */
  get className() {
    return "AbstractStorage";
  }

  /**
   * [ABSTRACT] Initialize the storage object which holds the data
   * @return {Object} The storage object
   */
  initStorageObject() {
    return null;
  }

  /**
   * Get the storage object
   * @return {Object} The DOM object being used to store data
   */
  get storageObject() {
    return this._storageObject;
  }

  /**
   * [ABSTRACT] Finalize any pending storage requests.
   */
  flush() {
  }

  /**
   * [ABSTRACT] Save the data to the storage object
   */
  serialize(data) {
  }

  /**
   * [ABSTRACT] Load data from the storage object.
   */
  deserialize() {
    return null;
  }

}

