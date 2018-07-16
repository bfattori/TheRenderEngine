/**
 * The Render Engine
 * PersistentStorage
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class <tt>PersistentStorage</tt> is used to maintain data between browser
 *     sessions.  The schema and data tables will persist in the user's browser
 *     between restarts.  This is a good place to store configuration data,
 *     high score tables, and other data which needs to be maintained.
 *
 * @param name {String} The name of the object
 * @extends KeyValueStore
 * @constructor
 * @description This class of storage is used to persist data between browser sessions.
 */
class PersistentStorage extends KeyValueStore {

  constructor(name = "PersistentStorage") {
    super(name);
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "PersistentStorage"
   */
  get className() {
    return "PersistentStorage";
  }

  /**
   * Initialize the storage object to the localStorage browser object
   * @return {Object} The <tt>localStorage</tt> object
   */
  initStorageObject() {
    return window.localStorage;
  }
}
