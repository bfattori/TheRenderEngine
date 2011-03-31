/**
 * The Render Engine
 * AbstractStorage
 *
 * @fileoverview The base object from which all storage objects are derived.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1557 $
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
	"class": "R.storage.AbstractStorage",
	"requires": [
		"R.engine.PooledObject"
	]
});

/**
 * @class <tt>R.storage.AbstractStorage</tt> is the base class of all storage objects.
 *
 * @param name {String} The name of the object
 * @extends R.engine.PooledObject
 * @constructor
 * @description This base class is considered abstract and should not be
 *              instantiated directly.  See {@link R.storage.TransientStorage}, 
 *              {@link R.storage.PersistentStorage}, or {@link R.storage.IndexedStorage} for
 *              implementations.
 */
R.storage.AbstractStorage = function(){
	return R.engine.PooledObject.extend(/** @scope R.storage.AbstractStorage.prototype */{
	
		storageObject: null,

		/** @private */
		constructor: function(name){
			this.base(name || "AbstractStorage");
			this.storageObject = this.initStorageObject();
		},
		
		/**
		 * Destroy the object, cleaning up any events that have been
		 * attached to this object.
		 */
		destroy: function(){
			this.storageObject.flush();
			this.base();
		},
		
		/**
		 * Release the object back into the object pool.
		 */
		release: function(){
			this.base();
			this.storageObject = null;
		},
		
		/**
		 * [ABSTRACT] Initialize the storage object which holds the data
		 * @return {Object} The storage object
		 */
		initStorageObject: function(){
			return null;
		},
		
		/**
		 * Get the storage object
		 * @return {Object} The DOM object being used to store data
		 */
		getStorageObject: function(){
			return this.storageObject;
		},
		
		/**
		 * Set the storage object
		 *
		 * @param storageObject {Object} The DOM object to use to store data
		 */
		setStorageObject: function(storageObject){
			this.storageObject = storageObject;
		},

		/**
		 * [ABSTRACT] Finalize any pending storage requests.
		 */
		flush: function(){
		},

      /**
       * [ABSTRACT] Save the data to the storage object
       */
      saveData: function(data) {
      },

      /**
       * [ABSTRACT] Load data from the storage object.
       */
      loadData: function() {
         return null;
      }

	}, /** @scope R.storage.AbstractStorage.prototype */ {
	
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.storage.AbstractStorage"
		 */
		getClassName: function(){
			return "R.storage.AbstractStorage";
		}
		
	});
	
}