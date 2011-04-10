/**
 * The Render Engine
 * CookieStorage
 *
 * @fileoverview A storage object where data is maintained in a cookie that stores data
 *               as a JSON object.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1567 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.storage.CookieStorage",
	"requires": [
		"R.storage.AbstractStorage"
	]
});

/**
 * @class <tt>R.storage.CookieStorage</tt> is used to maintain data in a
 *    cookie using a JSON object.  If cookies are not supported, the methods
 *    will have no effect.
 *
 * @param name {String} The name of the cookie
 * @param options {Object} An object which contains any of the following: path, domain, secure (boolean),
 *    and expires (number).  Any of the values can be left off, in which case defaults will be used.
 * @extends R.storage.AbstractStorage
 * @constructor
 * @description This class of storage is used to persist data in a cookie.
 */
R.storage.CookieStorage = function(){
	return R.storage.AbstractStorage.extend(/** @scope R.storage.CookieStorage.prototype */{

		enabled: null,
      cookieName: null,
      options: null,
      hash: null,

		/** @private */
		constructor: function(name, options){
			this.enabled = R.engine.Support.sysInfo().support.storage.cookie;
			AssertWarn(this.enabled, "CookieStorage is not supported by browser - DISABLED");
			this.base(name);
         this.cookieName = name;
         this.options = $.extend({
            path: "/",
            domain: null,
            secure: null,
            expires: null
         }, options);
         this.hash = this.loadData() || {};
		},

      destroy: function() {
         this.dispose();
         this.base();
      },

		/**
		 * Release the object back into the object pool.
		 */
		release: function(){
			this.base();
			this.cookieName = null;
         this.options = null;
         this.hash = null;
		},

		/**
		 * Initialize the storage object to the document.cookie object
		 * @return {Object} The <tt>localStorage</tt> object
		 */
		initStorageObject: function(){
			return window.document.cookie;
		},

      /**
       * Save a value to cookie storage.
       * @param key {String} The key to store the data with
       * @param value {Object} The value to store with the key
       */
      save: function(key, value) {
         if (!this.enabled) {
            return;
         }

         if (typeof key === "object" && !R.isArray(key)) {
            // Set the entire hash
            this.hash = key;
         } else {
            this.hash[key] = value;
         }
         this.saveData(JSON.stringify(this.hash));
      },

      /**
       * Get the value associated with the key from cookie storage.
       * @param key {String} The key to retrieve data for
       * @return {Object} The value that was stored with the key, or <tt>null</tt>
       */
      load: function(key) {
         if (!this.enabled) {
            return null;
         }

         if (!key) {
            return this.hash();
         }
         return this.hash[key];
      },

      /**
       * Dispose of the cookie (remove it from the user's browser).
       */
      dispose: function() {
         if (!this.enabled) {
            return;
         }

         var oldExpires = this.options.expires;
         $.extend(this.options, {
            expires: -1
         });
         this.saveData("");
         $.extend(this.options, {
            expires: oldExpires
         });
      },

      /**
       * Clear all of the data stored in the cookie.
       */
      clear: function() {
         if (!this.enabled) {
            return;
         }

         this.saveData("{}");
      },

      /**
       * Saves the data object into the cookie.
       * @param data
       * @private
       */
      saveData: function(data) {
         AssertWarn(data.length < R.engine.Support.sysInfo().support.storage.cookie.maxLength,
               "Data to save to cookie is larger than supported size - will be truncated");

         var p = "";
         $.each(this.options, function(k,v) {
            if (v) {
               p += (p.length > 0 ? ";" : "") + k + (function(o) {
                  switch (o) {
                     case "secure": return "";
                     case "expires": return "=" + new Date(now() + v).toGMTString();
                     default: return "=" + v;
                  }
               })(k);
            }
         });

         // Save the cookie
         this.getStorageObject() = this.cookieName + "=" + data + ";" + p;
      },

      /**
       * Loads the data object from the cookie
       * @private
       */
      loadData: function() {
         if (!this.enabled) {
            return null;
         }

         var va = this.getStorageObject().match('(?:^|;)\\s*' + this.cookieName + '=([^;]*)');
         var value = (va) ? va[1] : null;
         return JSON.parse(value);
      }

	}, /** @scope R.storage.CookieStorage.prototype */ {

		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.storage.CookieStorage"
		 */
		getClassName: function(){
			return "R.storage.CookieStorage";
		}

	});
};
