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
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
    "class":"R.storage.WindowStorage",
    "requires":[
        "R.storage.AbstractStorage"
    ]
});

/**
 * @class <tt>R.storage.WindowStorage</tt> is used to maintain data in "window.name"
 *    using a JSON object.  This type of storage is transient and should be used as a
 *    last resort when trying to store data.
 *
 * @extends R.storage.AbstractStorage
 * @constructor
 * @description This class of storage is used to persist data on the window object's <tt>name</tt>
 *    attribute.
 */
R.storage.WindowStorage = function () {
    return R.storage.AbstractStorage.extend(/** @scope R.storage.WindowStorage.prototype */{

        hash:null,

        /** @private */
        constructor:function (name, options) {
            this.base(name);
            this.hash = {};
            this.loadData();
        },

        destroy:function () {
            this.dispose();
            this.base();
        },

        /**
         * Release the object back into the object pool.
         */
        release:function () {
            this.base();
            this.hash = null;
        },

        /**
         * Initialize the storage object to the document.cookie object
         * @return {Object} The <tt>localStorage</tt> object
         */
        initStorageObject:function () {
            return window.name;
        },

        /**
         * Save a value to the window's <tt>name</tt> attribute storage.
         * @param key {String} The key to store the data with
         * @param value {Object} The value to store with the key
         */
        save:function (key, value) {
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
         * Get the value associated with the key from the window's <tt>name</tt> attribute storage.
         * @param key {String} The key to retrieve data for
         * @return {Object} The value that was stored with the key, or <tt>null</tt>
         */
        load:function (key) {
            if (!this.enabled) {
                return null;
            }

            if (!key) {
                return this.hash();
            }
            return this.hash[key];
        },

        /**
         * Dispose of all of the data
         */
        dispose:function () {
            if (!this.enabled) {
                return;
            }

            this.saveData(null);
        },

        /**
         * Clear all of the data
         */
        clear:function () {
            if (!this.enabled) {
                return;
            }

            this.saveData("{}");
        },

        /**
         * Save the data to the window's <tt>name</tt> attribute.  We don't want to
         * overwrite what might already be there, so we mark it up.
         * @param data
         * @private
         */
        saveData:function (data) {
            if (data != null) {
                // First we remove it from window.name
                this.loadData();
                // Then we reattach it
                this.getStorageObject() += "/*TRE_S*/" + data + "/*TRE_E*/";
            }
        },

        /**
         * Load the data from the window's <tt>name</tt> attribute
         * @private
         */
        loadData:function () {
            // Find our object
            var m = /\/\*TRE_S\*\/(\{.*\})\/\*TRE_E\*\//,
                res = m.exec(this.getStorageObject());

            if (res && res[1] != null) {
                this.getStorageObject().replace(m, "");
                return JSON.parse(res[1]);
            }

            return {};
        }

    }, /** @scope R.storage.WindowStorage.prototype */ {

        /**
         * Get the class name of this object
         *
         * @return {String} "R.storage.WindowStorage"
         */
        getClassName:function () {
            return "R.storage.WindowStorage";
        }

    });
};
