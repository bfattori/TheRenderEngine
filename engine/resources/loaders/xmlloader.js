/**
 * The Render Engine
 * XMLLoader
 *
 * @fileoverview A resource loader for XML files.
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
	"class": "R.resources.loaders.XMLLoader",
	"requires": [
		"R.resources.loaders.RemoteLoader"
	]
});

/**
 * @class Loads XML files from a specified URL.
 *
 * @constructor
 * @param name {String=XMLLoader} The name of the resource loader
 * @extends R.resources.loaders.RemoteLoader
 */
R.resources.loaders.XMLLoader = function(){
	return R.resources.loaders.RemoteLoader.extend(/** @scope R.resources.loaders.XMLLoader.prototype */{
	
		objects: null,
		
		/** private */
		constructor: function(name){
			this.base(name || "XMLLoader");
			this.objects = {};
		},
		
		/**
		 * Load an XML file from a URL.
		 *
		 * @param name {String} The name of the resource
		 * @param url {String} The URL where the resource is located
		 * @param doc {Object} The document that was loaded
		 */
		load: function(name, url, doc){
		
			if (url) {
				Assert(url.indexOf("http") == -1, "XML must be located relative to this server");
				var thisObj = this;
				
				// Get the file from the server
				$.get(url, function(data){
					// 2nd pass - store the XML
					thisObj.load(name, null, data);
				}, "xml");
			}
			else {
				// The object has been loaded and is ready for use
				this.setReady(true);
				this.base(name, doc);
			}
		},
		
		/**
		 * The name of the resource this loader will get.
		 * @returns {String} The string "object"
		 */
		getResourceType: function(){
			return "xml";
		}
		
	}, /** @scope R.resources.loaders.XMLLoader.prototype */ {
		/**
		 * Get the class name of this object.
		 * @return {String} The string "R.resources.loaders.XMLLoader"
		 */
		getClassName: function(){
			return "R.resources.loaders.XMLLoader";
		}
	});
	
}
