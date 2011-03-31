/**
 * The Render Engine
 * RemoteFileLoader
 * 
 * The RemoteFileLoader resource loader provides functionality
 * that will allow a remote server to act like a filesystem.  You can
 * check for the existence of a file, plus blocking and non-blocking
 * (sync and async) modes are supported for retrieval of the data.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author$
 * @version: $Revision$
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
	"class": "R.resources.loaders.RemoteFileLoader",
	"requires": [
		"R.resources.loaders.AbstractResourceLoader"
	]
});

/**
 * @class Loads a text or XML file from the specified URL.  It is possible to check for the
 *        existence of a file with this type of loader.
 *
 * @constructor
 * @param [name=RemoteFileLoader] {String} The name of the resource loader
 * @extends R.resources.loaders.AbstractResourceLoader
 * @deprecated
 */
R.resources.loaders.RemoteFileLoader = function(){
	return R.resources.loaders.AbstractResourceLoader.extend(/** @scope R.resources.loaders.RemoteFileLoader.prototype */{
	
		pending: null,
		
		/** private */
		constructor: function(name){
			this.base(name || "RemoteFileLoader");
			this.pending = null;
		},
		
		/**
		 * Release the resource loader back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.pending = null;
		},
		
		/**
		 * Helper method to get the remote data and handle incoming
		 * returns.
		 * @param remoteURL {String} The URL to retrieve.  Must be relative.
		 * @param remoteType {String} The type of data: "xml", "text"
		 * @param [sync] {Boolean} <tt>true</tt> to make blocking request
		 * @private
		 */
		getFile: function(cacheRec, sync){
			Assert(remoteURL.indexOf("http") == -1, "URL must exist relative to this server");
			
			// Make the request. We'll handle the result ourselves
			var self = this;
			var xhr = $.ajax({
				type: "GET",
				url: cacheRec.url,
				data: null,
				async: !sync,
				success: function(data){
					cacheRec.data = data;
					cacheRec.status = R.resources.loaders.RemoteFileLoader.STATUS_OK;
					self.success(cacheRec);
				},
				complete: function(xhr, status){
					if (status != "success") {
						cacheRec.status = R.resources.loaders.RemoteFileLoader.STATUS_FAIL;
					}
				},
				dataType: cacheRec.type
			});
			
			return cacheRec;
		},
		
		/**
		 * Check for the existence of a file at the url provided in a
		 * synchronous manner.  This will cause the program's execution to
		 * wait until the file can be verified.
		 *
		 * @param remoteUrl {String} The URL where the file is located.
		 * @param type {String} The type of data to check
		 * @return <tt>true</tt> if the file exists
		 */
		exists: function(remoteUrl, type){
			this.pending = this.getCacheRecord(remoteURL, type);
			var r = this.getFile(this.pending, true);
			return (r.status == R.resources.loaders.RemoteFileLoader.STATUS_OK);
		},
		
		/**
		 * Load the remote file
		 */
		load: function(name, remoteURL, remoteType, sync){
			var cacheRec = null;
			if (this.pending.url == remoteURL) {
				cacheRec = this.pending;
				this.pending = null;
			}
			else {
				cacheRec = this.getCacheRecord(remoteURL, remoteType);
			}
			cacheRec.name = name;
			
			this.base(name, cacheRec, false);
			this.getFile(cacheRec, sync);
		},
		
		success: function(cacheRec){
			if (cacheRec.name) {
				this.set(name, cacheRec);
				this.setReady(name, true);
			}
		},
		
		getCacheRecord: function(remoteURL, remoteType){
			return {
				url: remoteURL,
				status: R.resources.loaders.RemoteFileLoader.STATUS_INIT,
				type: remoteType,
				data: null,
				xhr: null
			};
		},
		
		getData: function(name){
			var d = this.get(name);
			return d ? d.data : null;
		},
		
		/**
		 * The name of the resource this loader will get.
		 * @returns {String} The string "remote file"
		 */
		getResourceType: function(){
			return "remote file";
		}
		
	}, /** @scope R.resources.loaders.RemoteFileLoader.prototype */{
		/**
		 * Get the class name of this object.
		 * @return {String} The string "R.resources.loaders.RemoteFileLoader"
		 */
		getClassName: function(){
			return "R.resources.loaders.RemoteFileLoader";
		},
		
		/** Request initializating **/
		STATUS_INIT: -1,
		
		/** Request succeeded **/
		STATUS_OK: 1,
		
		/** There was some sort of error while loading the file **/
		STATUS_FAIL: 0
	
	});
	
}