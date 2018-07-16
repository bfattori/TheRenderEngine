/**
 * The Render Engine
 * CookieStorage
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class <tt>CookieStorage</tt> persists data in a cookie as a JSON object.
 *
 * @param name {String} The name of the cookie
 * @param options {Object} An object which contains any of the following: path, domain, secure (boolean),
 *    and expires (number).  Any of the values can be left off, in which case defaults will be used.
 * @extends KeyValueStore
 * @constructor
 * @description This class of storage is used to persist data in a cookie.
 */
class CookieStorage extends KeyValueStore {

  constructor(name = "CookieStorage", options) {
    this.cOpts = {
      cookieName: name,
      options: _.extend({
        path: "/",
        domain: null,
        secure: null,
        expires: null
      }, options)
    };
    super(name);
  }

  release() {
    super.release();
    this.cOpts = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "CookieStorage"
   */
  get className() {
    return "CookieStorage";
  }

  /**
   * Initialize the storage object to the document.cookie object
   */
  initStorageObject() {
    return window.document.cookie;
  }

  /**
   * Remove the cookie from the user's browser.
   */
  removeCookie() {
    var oldExpires = this.cOpts.options.expires;
    _.extend(this.cOpts.options, {
      expires: -1
    });
    this.serialize("");
    _.extend(this.cOpts.options, {
      expires: oldExpires
    });
  }

  /**
   * Saves the data object into the cookie.
   * @param data
   * @private
   */
  serialize(data) {
    data = JSON.stringify(data);
    AssertWarn(data.length < 4096,
      "Data to save to cookie is larger than supported size - will be truncated");

    var p = "";
    for (var k in this.cOpts.options) {
      if (this.cOpts.options.hasOwnProperty(k) && this.cOpts.options[k]) {
        p += (p.length > 0 ? ";" : "") + k + (function (o) {
            switch (o) {
              case "secure":
                return "";
              case "expires":
                return "=" + new Date(R.now() + v).toGMTString();
              default:
                return "=" + v;
            }
          })(k);
      }
    }

    // Save the cookie
    (this.storageObject) = this.cOpts.cookieName + "=" + data + ";" + p;
  }

  /**
   * Loads the data object from the cookie
   * @private
   */
  deserialize() {
    var va = this.storageObject.match('(?:^|;)\\s*' + this.cOpts.cookieName + '=([^;]*)');
    var value = (va) ? va[1] : null;
    return JSON.parse(value);
  }

}

