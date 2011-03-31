/**
 * The Render Engine
 * WindowStorage
 *
 * @fileoverview A storage object where data is maintained on "window.name" that stores data
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
	"class": "R.storage.WindowStorage",
	"requires": [
		"R.storage.AbstractStorage"
	]
});

/**
 * @class <tt>R.storage.WindowStorage</tt> is used to maintain data in "window.name"
 *    using a JSON object.  This type of storage is transient.
 *
 * @extends R.storage.AbstractStorage
 * @constructor
 * @description This class of storage is used to persist data in a cookie.
 */
R.storage.WindowStorage = function(){
	return R.storage.AbstractStorage.extend(/** @scope R.storage.WindowStorage.prototype */{

      hash: null,

		/** @private */
		constructor: function(name, options){
			this.base(name);
         this.hash = {};
         this.loadData();
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
         this.hash = null;
		},

		/**
		 * Initialize the storage object to the document.cookie object
		 * @return {Object} The <tt>localStorage</tt> object
		 */
		initStorageObject: function(){
			return window.name;
		},

      set: function(key, value) {
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

      get: function(key) {
         if (!this.enabled) {
            return null;
         }

         if (!key) {
            return this.hash();
         }
         return this.hash[key];
      },

      dispose: function() {
         if (!this.enabled) {
            return;
         }

         this.saveData("");
      },

      clear: function() {
         if (!this.enabled) {
            return;
         }

         this.saveData("{}");
      },

      saveData: function(data) {
         // Save the cookie
         this.getStorageObject() = data;
      },

      loadData: function() {
         return JSON.parse(this.getStorageObject());
      }

	}, /** @scope R.storage.WindowStorage.prototype */ {

		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.storage.WindowStorage"
		 */
		getClassName: function(){
			return "R.storage.WindowStorage";
		}

	});
};
