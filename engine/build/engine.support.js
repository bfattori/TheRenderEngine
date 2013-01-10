
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

/**
 * @class A static class with support methods the engine or games can use.  
 *        Many of the methods can be used to manipulate arrays.  Additional
 *        methods are provided to access query parameters, and generate or 
 *        read JSON.  A system capabilities method, {@link #sysInfo}, can be
 *        used to query the environment for support of features.
 * @static
 */
R.engine.Support = Base.extend(/** @scope R.engine.Support.prototype */{
   constructor: null,

   /**
    * Get the index of an element in the specified array.
    *
    * @param array {Array} The array to scan
    * @param obj {Object} The object to find
    * @param [from=0] {Number} The index to start at, defaults to zero.
    * @memberOf R.engine.Support
    */
   indexOf: function(array, obj, from) {
      return array && R.isArray(array) ? array.indexOf(obj, from) : -1;
   },

   /**
    * Remove an element from an array.  This method modifies the array
    * directly.
    *
    * @param array {Array} The array to modify
    * @param obj {Object} The object to remove
    * @memberOf R.engine.Support
    */
   arrayRemove: function(array, obj) {
      if (!array || !R.isArray(array)) {
         return;
      }

      var idx = R.engine.Support.indexOf(array, obj);
      if (idx != -1) {
         array.splice(idx, 1);
      }
   },
   
   /**
    * Returns <tt>true</tt> if the string, after trimming, is either
    * empty or is null.
    * 
    * @param str {String} The string to test
    * @return {Boolean} <tt>true</tt> if the string is empty or <tt>null</tt>
    * @memberOf R.engine.Support
    */
   isEmpty: function(str) {
      return R.isEmpty(str);
   },

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
    * @memberOf R.engine.Support
    */
   filter: function(array, fn, thisp) {
      return array && R.isArray(array) ? array.filter(fn, thisp) : undefined;
   },

   /**
    * Executes a callback for each element within an array.
    *
    * @param array {Array} The array to operate on
    * @param fn {Function} The function to apply to each element.  It will be passed three
    *                      arguments: The element value, the index of the element,
    *                      and the array being traversed.
    * @param [thisp=null] {Object} An optional "this" pointer to use in the callback
    * @memberOf R.engine.Support
    */
   forEach: function(array, fn, thisp) {
      return array && R.isArray(array) ? array.forEach(fn, thisp) : undefined;
   },

   /**
    * Fill the specified array with <tt>size</tt> elements
    * each with the value "<tt>value</tt>".  Modifies the provided
    * array directly.
    *
    * @param {Array} arr The array to fill
    * @param {Number} size The size of the array to fill
    * @param {Object} value The value to put at each index
    * @memberOf R.engine.Support
    */
   fillArray: function(arr, size, value) {
      for (var i = 0; i < size; i++) {
         arr[i] = value;
      }
   },

   /**
    * Get the path from a fully qualified URL, not including the trailing
    * slash character.
    *
    * @param url {String} The URL
    * @return {String} The path
    * @memberOf R.engine.Support
    */
   getPath: function(url) {
      return R.isString(url) ? url.substr(0, url.lastIndexOf("/")) : undefined;
   },

   /**
    * Get the query parameters from the window location object.  The
    * object returned will contain a key/value pair for each argument
    * found.
    *
    * @return {Object} A generic <tt>Object</tt> with a key and value for each query argument.
    * @memberOf R.engine.Support
    */
   getQueryParams: function() {
      if (!R.engine.Support.parms) {
         R.engine.Support.parms = {};
         var p = window.location.toString().split("?")[1];
         if (p)
         {
            p = p.split("&");
            for (var x = 0; x < p.length; x++)
            {
               var v = p[x].split("=");
               R.engine.Support.parms[v[0]] = (v.length > 1 ? v[1] : "");
            }
         }
      }
      return R.engine.Support.parms;
   },

   /**
    * Check for a query parameter and to see if it evaluates to one of the following:
    * <tt>true</tt>, <tt>1</tt>, <tt>yes</tt>, or <tt>y</tt>.  If so, returns <tt>true</tt>.
    *
    * @param paramName {String} The query parameter name
    * @return {Boolean} <tt>true</tt> if the query parameter exists and is one of the specified values.
    * @memberOf R.engine.Support
    */
   checkBooleanParam: function(paramName) {
      return (R.engine.Support.getQueryParams()[paramName] &&
              (R.engine.Support.getQueryParams()[paramName].toLowerCase() != "0" ||
               R.engine.Support.getQueryParams()[paramName].toLowerCase() != "false"));
   },

   /**
    * Check for a query parameter and to see if it evaluates to the specified value.
    * If so, returns <tt>true</tt>.
    *
    * @param paramName {String} The query parameter name
    * @param val {String} The value to check for
    * @return {Boolean} <tt>true</tt> if the query parameter exists and is the value specified
    * @memberOf R.engine.Support
    */
   checkStringParam: function(paramName, val) {
      return (R.engine.Support.getStringParam(paramName, null) == val);
   },

   /**
    * Check for a query parameter and to see if it evaluates to the specified number.
    * If so, returns <tt>true</tt>.
    *
    * @param paramName {String} The query parameter name
    * @param val {Number} The number to check for
    * @return {Boolean} <tt>true</tt> if the query parameter exists and is the value specified
    * @memberOf R.engine.Support
    */
   checkNumericParam: function(paramName, val) {
      var num = R.engine.Support.getStringParam(paramName, null);
      return (R.isNumber(num) && num == val);
   },

   /**
    * Get a numeric query parameter, or the default specified if the parameter
    * doesn't exist.
    *
    * @param paramName {String} The name of the parameter
    * @param defaultVal {Number} The number to return if the parameter doesn't exist
    * @return {Number} The value
    * @memberOf R.engine.Support
    */
   getNumericParam: function(paramName, defaultVal) {
      return Number(R.engine.Support.getStringParam(paramName, defaultVal));
   },

   /**
    * Get a string query parameter, or the default specified if the parameter
    * doesn't exist.
    *
    * @param paramName {String} The name of the parameter
    * @param defaultVal {String} The string to return if the parameter doesn't exist
    * @return {String} The value
    * @memberOf R.engine.Support
    */
   getStringParam: function(paramName, defaultVal) {
      return (R.engine.Support.getQueryParams()[paramName] || defaultVal);
   },

   /**
    * Returns specified object as a JavaScript Object Notation (JSON) string.
    *
    * @param object {Object} Must not be undefined or contain undefined types and variables.
    * @return String
    * @memberOf R.engine.Support
    * @deprecated Use <tt>JSON.stringify()</tt>
    */
   toJSON: function(o) {
      return window.JSON.stringify(o);
   },

   /**
    * Parses specified JavaScript Object Notation (JSON) string back into its corresponding object.
    *
    * @param jsonString
    * @return Object
    * @see http://www.json.org
    * @memberOf R.engine.Support
    * @deprecated Use <tt>JSON.parse()</tt> instead
    */
   parseJSON: function(jsonString) {
      return JSON.parse(jsonString);
   },
   
	/**
	 * Determine the OS platform from the user agent string, if possible
	 * @private
    * @memberOf R.engine.Support
	 */
	checkOS: function() {
		// Scrape the userAgent to get the OS
		var uA = navigator.userAgent.toLowerCase();
		return /windows nt 6\.0/.test (uA) ? "Windows Vista" :
				 /windows nt 6\.1/.test (uA) ? "Windows 7" :
				 /windows nt 5\.1/.test (uA) ? "Windows XP" :
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
	},

   /**
    * Gets an object that is a collation of a number of browser and
    * client settings.  You can use this information to tailor a game
    * to the environment it is running within.
    * <ul>
    * <li>browser - A string indicating the browser type (safari, mozilla, opera, msie)</li>
    * <li>version - The browser version</li>
    * <li>agent - The user agent</li>
    * <li>platform - The platform the browser is running on</li>
    * <li>cpu - The CPU on the machine the browser is running on</li>
    * <li>OS - The operating system the browser is running on</li>
    * <li>language - The browser's language</li>
    * <li>online - If the browser is running in online mode</li>
    * <li>cookies - If the browser supports cookies</li>
    * <li>fullscreen - If the browser is running in fullscreen mode</li>
    * <li>width - The browser's viewable width</li>
    * <li>height - The browser's viewable height</li>
    * <li>viewWidth - The innerWidth of the viewport</li>
    * <li>viewHeight - The innerHeight of the viewport</li>
    * <li>support:
    *    <ul><li>xhr - Browser supports XMLHttpRequest object</li>
    *    <li>geo - navigator.geolocation is supported</li>
    *    <li>threads - Browser supports Worker threads</li>
    *    <li>sockets - Browser supports WebSocket object</li>
    *    <li>storage:
    *       <ul><li>cookie - Cookie support. Reports an object with "maxLength", or <code>false</code></li>
    *       <li>local - localStorage support</li>
    *       <li>session - sessionStorage support</li>
    *       <li>indexeddb - indexedDB support</li>
    *       <li>sqllite - SQL lite support</li>
    *       <li>audio - HTML5 Audio support</li>
    *       <li>video - HTML5 Video support</li>
    *       </ul>
    *    </li>
    *    <li>canvas:
    *       <ul><li>defined - Canvas is either native or emulated</li>
    *       <li>text - Supports text</li>
    *       <li>textMetrics - Supports text measurement</li>
    *			<li>contexts:
    *      		<ul><li>ctx2D - Supports 2D</li>
    *				<li>ctxGL - Supports webGL</li>
    *				</ul>
    *			</li>
    *       </ul>
    *    </li>
    *    </ul>
    * </li>
    * </ul>
    * @return {Object} An object with system information
    * @memberOf R.engine.Support
    */
   sysInfo: function() {
      if (!R.engine.Support._sysInfo) {
      	
      	// Canvas and Storage support defaults
      	var canvasSupport = {
      		defined: false,
      		text: false,
      		textMetrics: false,
      		contexts: {
      			"2D": false,
      			"GL": false
      		}
      	},
         storageSupport = {
            cookie: false,
            local: false,
            session: false,
            indexeddb: false,
            sqllite: false
         };

         // Check for canvas support
         try {
            var canvas = document.createElement("canvas");
            if (typeof canvas !== "undefined" && R.isFunction(canvas.getContext)) {
               canvasSupport.defined = true;
               var c2d = canvas.getContext("2d");
               if (typeof c2d !== "undefined") {
                  canvasSupport.contexts["2D"] = true;

                  // Does it support native text
                  canvasSupport.text = (R.isFunction(c2d.fillText));
                  canvasSupport.textMetrics = (R.isFunction(c2d.measureText));
               } else {
                  canvasSupport.contexts["2D"] = false;
               }

               try {
                  var webGL = canvas.getContext("webgl");
                  if (typeof webGL !== "undefined") {
                     canvasSupport.contexts["GL"] = true;
                  }
               } catch (ex) { canvasSupport.contexts["GL"] = false; }
            }
         } catch (ex) { /* ignore */ }

         // Check storage support
         try {
            try {
               // Drop a cookie, then look for it (3kb max)
               for (var i = 0, j = []; i < 3072; i++) { j.push("x"); }
               window.document.cookie = "tre.test=" + j.join("") + ";path=/";
               var va = window.document.cookie.match('(?:^|;)\\s*tre.test=([^;]*)'),
                   supported = !!va;
               if (supported) {
                  // expire the cookie before returning
                  window.document.cookie = "tre.test=;path=/;expires=" + new Date(R.now() - 1).toGMTString();
               }
               storageSupport.cookie = supported ? { "maxLength": va[1].length } : false;
            } catch (ex) { /* ignored */ }

            try {
               storageSupport.local = (typeof localStorage !== "undefined");
               storageSupport.session = (typeof sessionStorage !== "undefined");
            } catch (ex) {
               // Firefox bug (https://bugzilla.mozilla.org/show_bug.cgi?id=389002)
            }

            try {
               storageSupport.indexeddb = (typeof mozIndexedDB !== "undefined");
            } catch (ex) { /* ignored */ }

            storageSupport.sqllite = R.isFunction(window.openDatabase);
         } catch (ex) { /* ignored */ }

      	// Build support object
         R.engine.Support._sysInfo = {
            "browser" : $.browser.chrome ? "chrome" :
				           ($.browser.android ? "android" :
                       ($.browser.Wii ? "wii" : 
                       ($.browser.safariMobile ? "safarimobile" :
                       ($.browser.safari ? "safari" :
							  ($.browser.firefox ? "firefox" : 
                       ($.browser.mozilla ? "mozilla" :
                       ($.browser.opera ? "opera" : 
                       ($.browser.msie ? "msie" : "unknown")))))))),
            "version" : $.browser.version,
            "agent": navigator.userAgent,
            "platform": navigator.platform,
            "cpu": navigator.cpuClass || navigator.oscpu,
				"OS": R.engine.Support.checkOS(),
            "language": navigator.language,
            "online": navigator.onLine,
            "fullscreen": window.fullScreen || false,
            "support": {
               "audio": (typeof Audio !== "undefined"),
               "video": (typeof Video !== "undefined"),
               "xhr": (typeof XMLHttpRequest !== "undefined"),
               "threads": (typeof Worker !== "undefined"),
               "sockets": (typeof WebSocket !== "undefined"),
               "storage": storageSupport,
               "geo": (typeof navigator.geolocation !== "undefined"),
               "canvas" : canvasSupport
            }
         };
         
         $(document).ready(function() {
            // When the document is ready, we'll go ahead and get the width and height added in
            R.engine.Support._sysInfo = $.extend(R.engine.Support._sysInfo, {
               "width": $(window).width(),
               "height": $(window).height(),
               "viewWidth": $(document).width(),
               "viewHeight" : $(document).height()
            });
         });
      }
      return R.engine.Support._sysInfo;
   },

   /**
    * When the object is no longer <tt>undefined</tt>, the function will
    * be executed.
    * @param obj {Object} The object to wait for
    * @param fn {Function} The function to execute when the object is ready
    * @memberOf R.engine.Support
    */
   whenReady: function(obj, fn) {
      var sleeper = function() {
         if (typeof arguments.callee.obj != "undefined") {
            arguments.callee.fn();
         } else {
            setTimeout(arguments.callee, 50);
         }
      };
      sleeper.fn = fn;
      sleeper.obj = obj;
      sleeper();
   },

   /**
    * Displays the virtual D-pad on the screen, if enabled via <tt>R.Engine.options.useVirtualControlPad</tt>,
    * and wires up the appropriate events for the current browser.
    */
   showDPad: function() {
      if (!R.Engine.options.useVirtualControlPad) {
         return;
      }

      R.debug.Console.debug("Virtual D-pad Enabled.");

      // Events to track based on platform
      var downEvent, upEvent;
      switch (R.engine.Support.sysInfo().browser) {
         case "safarimobile":
         case "android": downEvent = "touchstart"; upEvent = "touchend"; break;
         default: downEvent = "mousedown"; upEvent = "mouseup";
      }

      var dpad = $("<div class='virtual-d-pad'></div>"),
          vpad = $("<div class='virtual-buttons'></div>"), dpButtons = [], vbButtons = [], i = 0;


      // Decodes the key mapping
      function getMappedKey(key) {
         if (key.indexOf("R.engine.Events.") != -1) {
            return R.engine.Events[key.split(".")[3]];
         } else {
            return key.toUpperCase().charCodeAt(0);
         }
      }

      // Don't allow touches in the virtual pads to propagate
      dpad.bind(downEvent, function(evt) { evt.preventDefault(); evt.stopPropagation(); });
      vpad.bind(downEvent, function(evt) { evt.preventDefault(); evt.stopPropagation(); });

      // D-pad buttons
      $.each(R.Engine.options.virtualPad, function(key, v) {
         if (R.Engine.options.virtualPad[key] != false) {
            dpButtons[i++] = [key, getMappedKey(v), $("<div class='button " + key + "'></div>")];
         }
      });

      $.each(dpButtons, function() {
         dpad.append(this[2]);
      });
      $(document.body).append(dpad);

      // Virtual Pad Buttons
      i = 0;
      $.each(R.Engine.options.virtualButtons, function(key, v) {
         if (R.Engine.options.virtualButtons[key] != false) {
            vbButtons[i++] = [key, getMappedKey(v), $("<div class='button " + key + "'>" + key + "</div>")];
         }
      });

      $.each(vbButtons, function() {
         vpad.append(this[2]);
      });
      $(document.body).append(vpad);

      // Wire up the buttons to fire keyboard events on the context
      var allButtons = dpButtons.concat(vbButtons);
      $.each(allButtons, function() {
         var key = this;
         key[2].bind(downEvent, function() {
            R.debug.Console.debug("virtual keydown: " + key[1]);
            var e = $.Event("keydown", {
               which: key[1]
            });
            R.Engine.getDefaultContext().jQ().trigger(e);
         }).bind(upEvent, function() {
            R.debug.Console.debug("virtual keyup: " + key[1]);
            var e = $.Event("keyup", {
               which: key[1]
            });
            R.Engine.getDefaultContext().jQ().trigger(e);
         });
      });
   }
});

