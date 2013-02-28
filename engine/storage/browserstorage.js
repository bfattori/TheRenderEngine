/**
 * The Render Engine
 * BrowserStorage
 *
 * @fileoverview Generalized browser-based storage class for W3C storage types.
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
    "class":"R.storage.BrowserStorage",
    "requires":[
        "R.storage.AbstractDBStorage",
        "R.util.FNV1Hash"
    ],
    "includes":[
        "/libs/trimpath-query-1.1.14.js"
    ]
});

/**
 * @class <tt>R.storage.BrowserStorage</tt> is a generalized class for browser-based
 *     storage mechanisms.  Either of the browser storage objects can be accessed using
 *    a SQL-like syntax, with table creation and data manipulation, or using simple
 *    keys and values.
 *
 * @param name {String} The name of the object
 * @extends R.storage.AbstractDBStorage
 * @constructor
 * @description Generalized base storage class for browser storage objects.
 */
R.storage.BrowserStorage = function () {
    return R.storage.AbstractDBStorage.extend(/** @scope R.storage.BrowserStorage.prototype */{

        trimPath:null,
        schema:null,
        fnv:null,

        /** @private */
        constructor:function (name) {
            this.setStorageObject(this.initStorageObject());
            this.fnv = R.util.FNV1Hash.create();
            this.base(name);

            // See if a table schema exists for the given name
            var schema = JSON.parse(this.getStorageObject().getItem(this.getName() + ":schema"));
            if (schema != null) {
                // Load the table data
                var tSchema = {};
                for (var s in schema) {
                    tSchema[schema[s]] = this.getTableDef(schema[s]);
                }
                this.setSchema(tSchema);

                // We'll update this as needed
                this.trimPath = TrimPath.makeQueryLang(this.getSchema());
            }
        },

        /**
         * A unique identifier for the table name.
         * @param name {String} The table name
         * @return {String} A unique identifier
         */
        getTableUID:function (name) {
            var uid = this.fnv.getHash(this.getName() + name);
            return uid;
        },

        /**
         * Save a value to the browser storage object.
         * @param key {String} The key to store the data with
         * @param value {Object} The value to store with the key
         */
        save:function (key, value) {
            this.getStorageObject().setItem(this.getTableUID(key) + ":" + key, JSON.stringify(value));
        },

        /**
         * Get the value associated with the key from the browser storage object.
         * @param key {String} The key to retrieve data for
         * @param [defaultValue] {Object} If the value isn't found in storage, use this default value
         * @return {Object} The value that was stored with the key, or <tt>null</tt>
         */
        load:function (key, defaultValue) {
            var value = JSON.parse(this.getStorageObject().getItem(this.getTableUID(key) + ":" + key));
            if (value === null || value === undefined) {
                value = defaultValue;
            }
            return value;
        },

        /**
         * Get all of the keys associated with this storage object.
         * @return {Array} An array of key names
         */
        getKeys:function () {
            var key, keys = [], l = this.getStorageObject().length;
            while (l > 0) {
                key = this.getStorageObject().key(--l);
                var actual = key.split(":")[1];
                if (key.indexOf(this.getTableUID(actual)) == 0) {
                    keys.push(actual);
                }
            }
            return keys;
        },

        /**
         * Create a new table to store data in.
         *
         * @param name {String} The name of the table
         * @param columns {Array} An array of case-sensitive column names
         * @param types {Array} An array of the columns types.  The types are 1:1 for the column
         *     names.  If you omit <tt>types</tt>, all columns will be assumed type "String".
         * @return {Boolean} <code>true</code> if the table was created.  <code>false</code> if
         *         the table already exists or couldn't be created for another reason.
         */
        createTable:function (name, columns, types) {
            if (!this.enabled) {
                return false;
            }

            try {
                if (!this.tableExists(name)) {
                    var tName = this.getTableUID(name);

                    // Create the schema object
                    var def = {};
                    for (var c in columns) {
                        def[columns[c]] = {
                            type:types ? types[c] : "String"
                        };
                    }
                    this.getStorageObject().setItem(tName + ":def", JSON.stringify(def));
                    this.getStorageObject().setItem(tName + ":dat", JSON.stringify([]));

                    // Add it to the overall schema
                    var schema = this.getSchema();
                    if (schema != null) {
                        schema.push(name);
                    }
                    else {
                        schema = [name];
                    }
                    this.getStorageObject().setItem(this.getName() + ":schema", JSON.stringify(schema));

                    if (!this.getSchema()) {
                        this.setSchema({});
                    }
                    this.getSchema()[name] = def;
                    this.trimPath = TrimPath.makeQueryLang(this.getSchema());

                    // Make sure the underlying system is updated
                    this.base(name, def);
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (ex) {
                return false;
            }
        },

        /**
         * Drop a table by its given name
         *
         * @param name {String} The name of the table to drop
         */
        dropTable:function (name) {
            if (!this.enabled) {
                return;
            }

            var tName = this.getTableUID(name);
            this.getStorageObject().removeItem(tName + ":def");
            this.getStorageObject().removeItem(tName + ":dat");

            // Remove it from the overall schema
            var schema = this.getSchema();
            if (schema != null) {
                R.engine.Support.arrayRemove(schema, name);
            }
            else {
                schema = [];
            }
            if (schema.length == 0) {
                this.getStorageObject().removeItem(this.getName() + ":schema");
            }
            else {
                this.getStorageObject().setItem(this.getName() + ":schema", JSON.stringify(schema));
            }

            this.base(name);
            this.trimPath = TrimPath.makeQueryLang(this.getSchema());
        },

        /**
         * Returns <tt>true</tt> if the table with the given name exists
         * @param name {String} The name of the table
         * @return {Boolean}
         */
        tableExists:function (name) {
            if (!this.enabled) {
                return false;
            }

            // See if the table exists
            var tName = this.getTableUID(name);
            return !!this.getStorageObject().getItem(tName + ":def");
        },

        /**
         * Set the data, for the given table, in the persistent storage.
         *
         * @param name {String} The name of the table
         * @param data {Object} The table data to store
         * @return {Number} 1 if the data was stored, or 0 if the table doesn't exist
         */
        setTableData:function (name, data) {
            if (!this.enabled) {
                return 0;
            }

            // See if the table exists
            if (this.tableExists(name)) {
                var tName = this.getTableUID(name);
                this.getStorageObject().setItem(tName + ":dat", JSON.stringify(data));
                return 1;
            }
            else {
                return 0;
            }
        },

        /**
         * Get the schema object, for the given table.
         * @param name {String} The name of the table
         * @return {Object} The data object, or <tt>null</tt> if no table with the given name exists
         */
        getTableDef:function (name) {
            if (!this.enabled) {
                return null;
            }

            // See if the table exists
            if (this.tableExists(name)) {
                var tName = this.getTableUID(name);
                return JSON.parse(this.getStorageObject().getItem(tName + ":def"));
            }
            else {
                return null;
            }
        },

        /**
         * Get the data object, for the given table.
         * @param name {String} The name of the table
         * @return {Object} The data object, or <tt>null</tt> if no table with the given name exists
         */
        getTableData:function (name) {
            if (!this.enabled) {
                return null;
            }

            // See if the table exists
            if (this.tableExists(name)) {
                try {
                    var tName = this.getTableUID(name);
                    return JSON.parse(this.getStorageObject().getItem(tName + ":dat"));
                } catch (ex) {
                    // Most likely "undefined", return an empty object
                    return {};
                }
            }
            else {
                return null;
            }
        },

        /**
         * Get the size of a table's data in bytes.
         * @param name {String} The name of the table
         * @return {Number} The size of the table
         */
        getTableSize:function (name) {
            if (!this.enabled) {
                return null;
            }

            // See if the table exists
            if (this.tableExists(name)) {
                try {
                    var tName = this.getTableUID(name);
                    return this.getStorageObject().getItem(tName + ":dat").length;
                } catch (ex) {
                    // Most likely "undefined", return an empty object
                    return 0;
                }
            }
            else {
                return 0;
            }
        },

        /**
         * Execute SQL on the storage object, which may be one of <tt>SELECT</tt>,
         * <tt>UPDATE</tt>, <tt>INSERT</tt>, or <tt>DELETE</tt>.  This mechanism allows for
         * joining  of data, querying across multiple tables, and more.
         *
         * @param sqlString {String} The SQL to execute
         * @param bindings {Array} An optional array of bindings
         * @return {Object} If the SQL is a <tt>SELECT</tt>, the object will be the result of
         *     the statement, otherwise the result will be a <tt>Boolean</tt> if the statement was
         *     successful.
         */
        execSql:function (sqlString, bindings) {
            if (this.trimPath != null) {
                // Compile the method
                var stmt = this.trimPath.parseSQL(sqlString, bindings);
                // Build an object with all of the data
                var schema = this.getSchema();
                var db = {};
                for (var s in schema) {
                    db[s] = this.getTableData(s);
                }
                if (sqlString.indexOf("SELECT") != -1) {
                    return stmt.filter(db);
                }
                else {
                    // Determine which table was modified
                    var result = stmt.filter(db);
                    var tableName = "";
                    if (result === true) {
                        // Only update the storage if the statement was successful
                        if (sqlString.indexOf("INSERT") != -1) {
                            tableName = /INSERT INTO (\w*)/.exec(sqlString)[1];
                        }
                        else if (sqlString.indexOf("UPDATE") != -1) {
                            tableName = /UPDATE (\w*)/.exec(sqlString)[1];
                        }
                        else {
                            tableName = /DELETE .* FROM (\w*)/.exec(sqlString)[1];
                        }

                        // Extract that table from the database and store it
                        var table = db[tableName];
                        this.setTableData(tableName, table);
                    }
                    return result;
                }
            }
        }

    }, /** @scope R.storage.BrowserStorage.prototype */ {

        /**
         * Get the class name of this object
         *
         * @return {String} "R.storage.BrowserStorage"
         */
        getClassName:function () {
            return "R.storage.BrowserStorage";
        }

    });

};