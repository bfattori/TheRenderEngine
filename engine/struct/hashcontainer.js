/**
 * The Render Engine
 * HashContainer
 * 
 * @fileoverview A set of objects which can be used to create a collection
 *               of objects, and to iterate over a container.
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
	"class": "R.struct.HashContainer",
	"requires": [
		"R.struct.Container"
	]
});

/**
 * @class A hash container is a logical collection of objects.  A hash container
 *        is a container with a backing object for faster lookups.  Objects within
 *        the container must have unique names. When the container is destroyed, none of the
 *        objects within the container are destroyed with it.  Call {@link #cleanUp} to 
 *        destroy all of the objects in the container.
 *
 * @param containerName {String} The name of the container. Default: Container
 * @extends R.struct.Container
 * @constructor
 * @description Create a hashed container object.
 */
R.struct.HashContainer = function(){
	return R.struct.Container.extend(/** @scope R.struct.HashContainer.prototype */{
	
		objHash: null,
		
		/**
		 * @private
		 */
		constructor: function(containerName){
			this.base(containerName || "HashContainer");
			this.objHash = {};
		},
		
		/**
		 * Release the object back into the object pool.
		 */
		release: function(){
			this.base();
			this.objHash = null;
		},
		
		/**
		 * Returns <tt>true</tt> if the object name is already in
		 * the hash.
		 *
		 * @param name {String} The name of the hash to check
		 * @return {Boolean}
		 */
		isInHash: function(key){
			key = (key.charAt(0) === "_" ? key : "_" + String(key));
			return (this.objHash[key] != null);
		},
		
		/**
		 * Add an object to the container.
		 *
		 * @param key {String} The name of the object to store.  Names must be unique
		 *                      or the object with that name will be overwritten.
		 * @param obj {BaseObject} The object to add to the container.
		 */
		add: function(key, obj){
			AssertWarn(!this.isInHash(key), "Object already exists within hash!");
			
			if (this.isInHash(key)) {
				// Remove the old one first
				this.removeHash(key);
			}
			
			// Some keys weren't being accepted (like "MOVE") so added
			// an underscore to prevent keyword collisions
			this.objHash["_" + String(key)] = obj;
			this.base(obj);
		},
		
		/** @private */
		addAll: function(){
			R._unsupported("addAll()", this);
		},
		
		/** @private */
		clone: function(){
			R._unsupported("clone()", this);
		},
		
		/** @private */
		concat: function(){
			R._unsupported("concat()", this);
		},
		
		/** @private */
		reduce: function(){
			R._unsupported("reduce()", this);
		},
		
		/**
		 * Remove an object from the container.  The object is
		 * not destroyed when it is removed from the container.
		 *
		 * @param obj {BaseObject} The object to remove from the container.
		 * @return {Object} The object removed from the container
		 */
		remove: function(obj){
			for (var o in this.objHash) {
				if (this.objHash[o] === obj) {
               // removeHash() takes care of removing the actual object, so we don't
               // call the base class - otherwise we delete the wrong object
					this.removeHash(o);
					break;
				}
			}
			return obj;
		},
		
		/**
		 * Remove the object with the given key name from the container.
		 *
		 * @param name {String} The object to remove
		 * @return {Object} The object removed
		 */
		removeHash: function(key){
			key = (key.charAt(0) === "_" ? key : "_" + String(key));
			var obj = this.objHash[key];
			R.engine.Support.arrayRemove(this.objects, obj);
			delete this.objHash[key];
			return obj;
		},
		
		/**
		 * Remove an object from the container at the specified index.
		 * The object is not destroyed when it is removed.
		 *
		 * @param idx {Number} An index between zero and the size of the container minus 1.
		 * @return {Object} The object removed from the container.
		 */
		removeAtIndex: function(idx){
			var obj = this.base(idx);
			for (var o in this.objHash) {
				if (this.objHash[o] === obj) {
					this.removeHash(o);
					break;
				}
			}
			
			return obj;
		},
		
		/**
		 * If a number is provided, the request will be passed to the
		 * base object, otherwise a name is assumed and the hash will
		 * be retrieved.
		 *
		 * @param idx {Number|String} The index or hash of the object to get
		 * @return {Object}
		 */
		get: function(idx){
			if (idx.substr && idx.toLowerCase) {
				return this.objHash["_" + idx];
			} else {
				return this.base(idx);
			}
		},
		
		/**
		 * Remove all objects from the container.  None of the objects are
		 * destroyed.
		 */
		clear: function(){
			this.base();
			this.objHash = {};
		},
		
		/**
		 * Cleans up the references to the objects (destroys them) within
		 * the container.
		 */
		cleanUp: function(){
			this.base();
		}
		
	}, /** @scope R.struct.HashContainer.prototype */ {
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.struct.HashContainer"
		 */
		getClassName: function(){
			return "R.struct.HashContainer";
		}
		
	});
	
};