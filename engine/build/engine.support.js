/**
 * The Render Engine
 * Engine Support Class
 *
 * @fileoverview A support class for the engine with useful methods
 *               to manipulate arrays, parse JSON, and handle query parameters.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1569 $
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

/**
 * @class A static class with support methods the engine or games can use.
 *        Many of the methods can be used to manipulate arrays.  Additional
 *        methods are provided to access query parameters, and generate or
 *        read JSON.  A system capabilities method, {@link #sysInfo}, can be
 *        used to query the environment for support of features.
 * @static
 */
class RSupport {

    /**
     * Get the index of an element in the specified array.
     *
     * @param array {Array} The array to scan
     * @param obj {Object} The object to find
     * @param [from=0] {Number} The index to start at, defaults to zero.
     * @memberof RenderEngine.Support
     */
    static indexOf(array, obj, from) {
        return array && R.isArray(array) ? array.indexOf(obj, from) : -1;
    }

    /**
     * Remove an element from an array.  This method modifies the array
     * directly.
     *
     * @param array {Array} The array to modify
     * @param obj {Object} The object to remove
     * @memberof RenderEngine.Support
     */
    static arrayRemove(array, obj) {
        if (!array || !R.isArray(array)) {
            return;
        }

        var idx = RSupport.indexOf(array, obj);
        if (idx != -1) {
            array.splice(idx, 1);
        }
    }

    /**
     * Returns <tt>true</tt> if the string, after trimming, is either
     * empty or is null.
     *
     * @param str {String} The string to test
     * @return {Boolean} <tt>true</tt> if the string is empty or <tt>null</tt>
     * @memberof RenderEngine.Support
     */
    static isEmpty(str) {
        return R.isEmpty(str);
    }

    /**
     * Calls a provided callback function once for each element in
     * an array, and constructs a new array of all the values for which
     * callback returns a <tt>true</tt> value. callback is invoked only
     * for indexes of the array which have assigned values; it is not invoked
     * for indexes which have been deleted or which have never been assigned
     * values. Array elements which do not pass the callback test are simply
     * skipped, and are not included in the new array.
     *
     * @param array {Array} The array to filter.
     * @param fn {Function} The callback to invoke.  It will be passed three
     *                      arguments: The element value, the index of the element,
     *                      and the array being traversed.
     * @param [thisp=null] {Object} Used as <tt>this</tt> for each invocation of the
     *                       callback.
     * @memberof RenderEngine.Support
     */
    static filter(array, fn, thisp) {
        return array && R.isArray(array) ? array.filter(fn, thisp) : undefined;
    }

    /**
     * Executes a callback for each element within an array.
     *
     * @param array {Array} The array to operate on
     * @param fn {Function} The function to apply to each element.  It will be passed three
     *                      arguments: The element value, the index of the element,
     *                      and the array being traversed.
     * @param [thisp=null] {Object} An optional "this" pointer to use in the callback
     * @memberof RenderEngine.Support
     */
    static forEach(array, fn, thisp) {
        return array && R.isArray(array) ? array.forEach(fn, thisp) : undefined;
    }

    /**
     * Fill the specified array with <tt>size</tt> elements
     * each with the value "<tt>value</tt>".  Modifies the provided
     * array directly.
     *
     * @param {Array} arr The array to fill
     * @param {Number} size The size of the array to fill
     * @param {Object} value The value to put at each index
     * @memberof RenderEngine.Support
     */
    static fillArray(arr, size, value) {
        for (var i = 0; i < size; i++) {
            arr[i] = value;
        }
    }

    /**
     * Get the path from a fully qualified URL, not including the trailing
     * slash character.
     *
     * @param url {String} The URL
     * @return {String} The path
     * @memberof RenderEngine.Support
     */
    static getPath(url) {
        return R.isString(url) ? url.substr(0, url.lastIndexOf("/")) : undefined;
    }

    static parms = null;

    /**
     * Get the query parameters from the window location object.  The
     * object returned will contain a key/value pair for each argument
     * found.
     *
     * @return {Object} A generic <tt>Object</tt> with a key and value for each query argument.
     * @memberof RenderEngine.Support
     */
    static getQueryParams() {
        if (!RSupport.parms) {
            RSupport.parms = {};
            var p = window.location.toString().split("?")[1];
            if (p) {
                p = p.split("&");
                for (var x = 0; x < p.length; x++) {
                    var v = p[x].split("=");
                    RSupport.parms[v[0]] = (v.length > 1 ? v[1] : "");
                }
            }
        }
        return RSupport.parms;
    }

    /**
     * Check for a query parameter and to see if it evaluates to one of the following:
     * <tt>true</tt>, <tt>1</tt>, <tt>yes</tt>, or <tt>y</tt>.  If so, returns <tt>true</tt>.
     *
     * @param paramName {String} The query parameter name
     * @return {Boolean} <tt>true</tt> if the query parameter exists and is one of the specified values.
     * @memberof RenderEngine.Support
     */
    static checkBooleanParam(paramName) {
        return (RSupport.getQueryParams()[paramName] &&
            (RSupport.getQueryParams()[paramName].toLowerCase() != "0" ||
                RSupport.getQueryParams()[paramName].toLowerCase() != "false"));
    }

    /**
     * Check for a query parameter and to see if it evaluates to the specified value.
     * If so, returns <tt>true</tt>.
     *
     * @param paramName {String} The query parameter name
     * @param val {String} The value to check for
     * @return {Boolean} <tt>true</tt> if the query parameter exists and is the value specified
     * @memberof RenderEngine.Support
     */
    static checkStringParam(paramName, val) {
        return (RSupport.getStringParam(paramName, null) == val);
    }

    /**
     * Check for a query parameter and to see if it evaluates to the specified number.
     * If so, returns <tt>true</tt>.
     *
     * @param paramName {String} The query parameter name
     * @param val {Number} The number to check for
     * @return {Boolean} <tt>true</tt> if the query parameter exists and is the value specified
     * @memberof RenderEngine.Support
     */
    static checkNumericParam(paramName, val) {
        var num = RSupport.getStringParam(paramName, null);
        return (R.isNumber(num) && num == val);
    }

    /**
     * Get a numeric query parameter, or the default specified if the parameter
     * doesn't exist.
     *
     * @param paramName {String} The name of the parameter
     * @param defaultVal {Number} The number to return if the parameter doesn't exist
     * @return {Number} The value
     * @memberof RenderEngine.Support
     */
    static getNumericParam(paramName, defaultVal) {
        return Number(RSupport.getStringParam(paramName, defaultVal));
    }

    /**
     * Get a string query parameter, or the default specified if the parameter
     * doesn't exist.
     *
     * @param paramName {String} The name of the parameter
     * @param defaultVal {String} The string to return if the parameter doesn't exist
     * @return {String} The value
     * @memberof RenderEngine.Support
     */
    static getStringParam(paramName, defaultVal) {
        return (RSupport.getQueryParams()[paramName] || defaultVal);
    }

    /**
     * Returns specified object as a JavaScript Object Notation (JSON) string.
     *
     * @param o {Object} Must not be undefined or contain undefined types and variables.
     * @return String
     * @memberof RenderEngine.Support
     * @deprecated Use <tt>JSON.stringify()</tt>
     */
    static toJSON(o) {
        return window.JSON.stringify(o);
    }

    /**
     * Parses specified JavaScript Object Notation (JSON) string back into its corresponding object. Or
     * if the object cannot be deserialized, an empty object is returned
     *
     * @param jsonString
     * @return Object
     * @see http://www.json.org
     * @memberof RenderEngine.Support
     * @deprecated Use <tt>JSON.parse()</tt> instead
     */
    static parseJSON(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (ex) {
            return {};
        }
    }

    /**
     * Determine the OS platform from the user agent string, if possible
     * @private
     * @memberof RenderEngine.Support
     */
    static checkOS() {
        // Scrape the userAgent to get the OS
        var uA = navigator.userAgent.toLowerCase();
        return /windows nt 6\.0/.test(uA) ? "Windows Vista" :
            /windows nt 6\.1/.test(uA) ? "Windows 7" :
                /windows nt 5\.1/.test(uA) ? "Windows XP" :
                    /windows/.test(uA) ? "Windows" :
                        /android 1\./.test(uA) ? "Android 1.x" :
                            /android 2\./.test(uA) ? "Android 2.x" :
                                /android/.test(uA) ? "Android" :
                                    /x11/.test(uA) ? "X11" :
                                        /linux/.test(uA) ? "Linux" :
                                            /Mac OS X/.test(uA) ? "Mac OS X" :
                                                /macintosh/.test(uA) ? "Macintosh" :
                                                    /iphone|ipad|ipod/.test(uA) ? "iOS" :
                                                        "unknown";
    }

    /**
     * When the object is no longer <tt>undefined</tt>, the function will
     * be executed.
     * @param obj {Object} The object to wait for
     * @param fn {Function} The function to execute when the object is ready
     * @memberof RenderEngine.Support
     */
    static whenReady(obj, fn) {
        var whenObject = {
            callback:fn,
            object:obj
        }, sleeper;

        sleeper.fn = fn;
        sleeper.obj = obj;

        sleeper = function () {
            if (typeof this.object != "undefined") {
                this.callback();
            } else {
                setTimeout(sleeper, 50);
            }
        }.bind(whenObject);
        sleeper();
    }
}

RenderEngine.Support = RSupport;