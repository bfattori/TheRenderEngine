/**
 * The Render Engine
 * PersistentStorage
 *
 * @fileoverview A storage object where data is maintained between browser sessions.
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
    "class":"R.storage.PersistentStorage",
    "requires":[
        "R.storage.BrowserStorage"
    ]
});

/**
 * @class <tt>R.storage.PersistentStorage</tt> is used to maintain data between browser
 *     sessions.  The schema and data tables will persist in the user's browser
 *     between restarts.  This is a good place to store configuration data,
 *     high score tables, and other data which needs to be maintained.
 *     <p/>
 *     Data is stored and retrieved using a SQL-like syntax.  For information
 *     about the SQL syntax, see http://code.google.com/p/trimpath/wiki/TrimQuery
 *
 * @param name {String} The name of the object
 * @extends R.storage.BrowserStorage
 * @constructor
 * @description This class of storage is used to persist data between browser sessions.
 */
R.storage.PersistentStorage = function () {
    return R.storage.BrowserStorage.extend(/** @scope R.storage.PersistentStorage.prototype */{

        enabled:null,

        /** @private */
        constructor:function (name) {
            this.enabled = R.engine.Support.sysInfo().support.storage.local;
            AssertWarn(this.enabled, "PersistentStorage is not supported by browser - DISABLED");
            this.base(name);
        },

        /**
         * Release the object back into the object pool.
         */
        release:function () {
            this.base();
            this.enabled = null;
        },

        /**
         * Initialize the storage object to the localStorage browser object
         * @return {Object} The <tt>localStorage</tt> object
         */
        initStorageObject:function () {
            return window.localStorage;
        },

        /**
         * A unique identifier for the table name.
         * @param name {String} The table name
         * @return {String} A unique identifier
         */
        getTableUID:function (name) {
            return this.base(name) + "PS";
        }

    }, /** @scope R.storage.PersistentStorage.prototype */ {

        /**
         * Get the class name of this object
         *
         * @return {String} "R.storage.PersistentStorage"
         */
        getClassName:function () {
            return "R.storage.PersistentStorage";
        }

    });

};
