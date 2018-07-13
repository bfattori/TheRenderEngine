/**
 * The Render Engine
 * ObjectLoader
 *
 * @fileoverview An extension of the remote resource loader for loading
 *                   JSON objects.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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
    "class":"R.resources.loaders.ObjectLoader",
    "requires":[
        "R.resources.loaders.RemoteLoader"
    ]
});

/**
 * @class Loads JSON objects from a specified URL.  The object uses a sligtly modified
 *          format which allows for single-line comments in the object definition.  The
 *          object must follow the rest of the JSON spec, with key names in quotes.
 *
 * @constructor
 * @param name {String=ObjectLoader} The name of the resource loader
 * @extends R.resources.loaders.RemoteLoader
 */
R.resources.loaders.ObjectLoader = function () {
    return R.resources.loaders.RemoteLoader.extend(/** @scope R.resources.loaders.ObjectLoader.prototype */{

        objects:null,

        /** private */
        constructor:function (name) {
            this.base(name || "ObjectLoader");
            this.objects = {};
        },

        /**
         * Load a JSON object from a URL.
         *
         * @param name {String} The name of the resource
         * @param url {String} The URL where the resource is located
         */
        load:function (name, url /*, obj */) {
            if (arguments[2] === undefined) {
                var loc = window.location;
                if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.hostname) == -1) {
                    Assert(false, "Objects must be located on this server");
                }

                var thisObj = this;

                // Get the file from the server
                R.engine.Script.loadJSON(url, function (data) {
                    // 2nd pass - store the object
                    if (data) {
                        thisObj.load(name, url, data);
                    } else {
                        R.debug.Console.error("File at '" + url + "' returned no data.");
                    }
                });
            }
            else {
                // The object has been loaded and is ready for use
                this.base(name, url, arguments[2], true);
                this.afterLoad(name, arguments[2]);
            }
        },

        /**
         * [ABSTRACT] Allow a subclass to handle the data, potentially loading additional
         * resources and preparing for use.
         * @param name {String} The name of the object
         * @param obj {Object} The object which was loaded
         */
        afterLoad:function (name, obj) {
        },

        /**
         * The name of the resource this loader will get.
         * @returns {String} The string "object"
         */
        getResourceType:function () {
            return "object";
        }

    }, /** @scope R.resources.loaders.ObjectLoader.prototype */ {
        /**
         * Get the class name of this object.
         * @return {String} The string "R.resources.loaders.ObjectLoader"
         */
        getClassName:function () {
            return "R.resources.loaders.ObjectLoader";
        }
    });

}