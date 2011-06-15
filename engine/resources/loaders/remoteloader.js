/**
 * The Render Engine
 * RemoteLoader
 *
 * @fileoverview A resource loader for handling remote objects located on
 *               the server.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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
	"class": "R.resources.loaders.RemoteLoader",
	"requires": [
		"R.resources.loaders.AbstractResourceLoader"
	]
});

/**
 * @class A base loader which implements the {@link #exists} method to
 *        synchronously check for the existence of a file.
 *
 * @constructor
 * @param name {String=RemoteLoader} The name of the resource loader
 * @extends R.resources.loaders.AbstractResourceLoader
 */
R.resources.loaders.RemoteLoader = function(){
	return R.resources.loaders.AbstractResourceLoader.extend(/** @scope R.resources.loaders.RemoteLoader.prototype */{

      pathUrls: null,

		/** @private */
		constructor: function(name){
			this.base(name || "RemoteLoader");
         this.pathUrls = {};
		},
		
		/**
		 * Performs a synchronous check for a file on the server.  While this approach will
		 * work in most cases, there is the possibility that the server will become unavailable
		 * before the request is made.  In this case, the application will hang until the
		 * request is satisfied (which may be never).
		 *
		 * @param url {String} The URL to check
		 * @return {Boolean} <tt>true</tt> if the file exists on the server or is in
		 *          the cache.
		 */
		exists: function(url){
			var stat = jQuery.ajax({
				type: "GET",
				url: url,
				async: false,
				dataType: "text"
			}).status;
			
			// If it returns OK or Cache not modified...
			return (stat == R.resources.loaders.RemoteLoader.STATUS_OK || stat == R.resources.loaders.RemoteLoader.STATUS_CACHED);
		},
		
		/**
		 * The name of the resource this loader will get.
		 * @returns {String} The string "remote"
		 */
		getResourceType: function(){
			return "remote";
		},

      /**
       * Load an resource from a remote URL.
       *
       * @param name {String} The name of the resource
       * @param url {String} The URL where the resource is located
       * @param data {Object} The loaded data to cache
       */
      load: function(name, url, data) {
         this.base(name, data);
         this.pathUrls[name] = url;
      },

      /**
       * Get the URL where the resource is located.
       * @param name {String} The name of the resource
       * @return {String}
       */
      getPathUrl: function(name) {
         return this.pathUrls[name];
      }
		
	}, /** @scope R.resources.loaders.RemoteLoader.prototype */{
		/**
		 * Get the class name of this object.
		 * @return {String} The string "R.resources.loaders.RemoteLoader"
		 */
		getClassName: function(){
			return "R.resources.loaders.RemoteLoader";
		},
		
		/**
		 * Transmit status ok
		 * @type {Number}
		 */
		STATUS_OK: 200,
		
		/**
		 * Transmit status - Cached
		 * @type {Number}
		 */
		STATUS_CACHED: 304,
		
		/**
		 * Transmit status - Not found
		 * @type {Number}
		 */
		STATUS_NOT_FOUND: 404,
		
		/**
		 * Transmit status - Server error
		 * @type {Number}
		 */
		STATUS_SERVER_ERROR: 500
	});
	
}