/**
 * The Render Engine
 * PersistentStorage
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class <tt>TransientStorage</tt> is used to hold data during the current browser
 *     session. Data will not persist between browser sessions.
 *
 * @param name {String} The name of the object
 * @extends KeyValueStore
 * @constructor
 * @description This class of storage is used to persist data between browser sessions.
 */
class TransientStorage extends KeyValueStore {

    constructor(name = "TransientStorage") {
        super(name);
    }

    /**
     * Get the class name of this object
     *
     * @return {String} "TransientStorage"
     */
    get className() {
        return "TransientStorage";
    }

    /**
     * Initialize the storage object to the sessionStorage browser object
     * @return {Object} The <tt>sessionStorage</tt> object
     */
    initStorageObject() {
        return window.sessionStorage;
    }
}
