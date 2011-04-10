/**
 * The Render Engine
 * AbstractDBStorage
 *
 * @fileoverview The base object from which all database storage objects are derived.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1559 $
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
	"class": "R.storage.AbstractDBStorage",
	"requires": [
		"R.storage.AbstractStorage"
	]
});

/**
 * @class <tt>R.storage.AbstractStorage</tt> is the base class of all storage objects.
 *        Currently, The Render Engine supports three types of storage,
 *        all with the ability to export their data remotely
 *        and to import data from a remote source.
 *
 * @param name {String} The name of the object
 * @extends R.storage.AbstractStorage
 * @constructor
 * @description This base class is considered abstract and should not be
 *              instantiated directly.  See {@link R.storage.TransientStorage},
 *              {@link R.storage.PersistentStorage}, or {@link R.storage.IndexedStorage} for
 *              implementations.
 */
R.storage.AbstractDBStorage = function(){
	return R.storage.AbstractStorage.extend(/** @scope R.storage.AbstractDBStorage.prototype */{

      schema: null,

		/** @private */
		constructor: function(name){
         this.schema = null;
			this.base(name || "AbstractDBStorage");
		},

		/**
		 * Get the data storage schema from the storage object.
		 * @return {Array} An array of tables for the storage object
		 */
		getSchema: function(){
			return this.schema;
		},

      /**
       * Set the data storage schema for the storage object.
       * @schema {Array} An array of table names
       */
      setSchema: function(schema) {
         this.schema = schema;
      },

		/**
		 * [ABSTRACT] Finalize any pending storage requests.
		 */
		flush: function(){
		},

		/**
		 * Create a new table to store data in.
		 *
		 * @param name {String} The name of the table
		 * @param def {Object} Table definition object
		 * @return {Boolean} <code>true</code> if the table was created.  <code>false</code> if
		 *         the table already exists or couldn't be created for another reason.
		 */
		createTable: function(name, def){
         return false;
		},

		/**
		 * Drop a table by its given name
		 *
		 * @param name {String} The name of the table to drop
		 */
		dropTable: function(name){
			if (!this.schema) {
				return;
			}
			delete this.schema[name];
		},

		/**
		 * Returns <tt>true</tt> if the table with the given name exists
		 * @param name {String} The name of the table
		 * @return {Boolean}
		 */
		tableExists: function(name){
			return false;
		},

		/**
		 * Set the data, for the given table, in the storage.
		 *
		 * @param name {String} The name of the table
		 * @param data {Object} The table data to store
		 * @return {Number} 1 if the data was stored, or 0 if the table doesn't exist
		 */
		setTableData: function(name, data){
			return 0;
		},

		/**
		 * Get the schema object, for the given table.
		 * @param name {String} The name of the table
		 * @return {Object} The data object, or <tt>null</tt> if no table with the given name exists
		 */
		getTableDef: function(name){
			return null;
		},

		/**
		 * Get the data object, for the given table.
		 * @param name {String} The name of the table
		 * @return {Object} The data object, or <tt>null</tt> if no table with the given name exists
		 */
		getTableData: function(name){
			return null;
		},

		/**
		 * Execute SQL on the storage object, which may be one of <tt>SELECT</tt>,
		 * <tt>UPDATE</tt>, <tt>INSERT</tt>, or <tt>DELETE</tt>.
		 * @param sqlString {String} The SQL to execute
		 * @param bindings {Array} An optional array of bindings
		 * @return {Object} If the SQL is a <tt>SELECT</tt>, the object will be the result of
		 * 	the statement, otherwise the result will be a <tt>Boolean</tt> if the statement was
		 * 	successful.
		 */
		execSql: function(sqlString, bindings){
         return false;
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

};