/*!
 * The Render Engine is a cross-browser, open source game engine written entirely
 * in JavaScript. Designed from the ground up to be extremely flexible, it boasts
 * an extensive API and uses the newest features of today's modern browsers.  
 * 
 * Visit
 * http://www.renderengine.com for more information.
 *
 * author: Brett Fattori (brettf@renderengine.com)
 * version: v2.0.0.10 beta
 * date: 7/20/2011
 *
 * Copyright (c) 2011 Brett Fattori
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
 * @namespace
 * The Render Engine namespace
 */
var R = R || {};

/**
 * List of namespaces declared in R
 * @private
 */
R._namespaces = {};

/**
 * The global namespace, typically the window object
 * @memberOf R
 * @type {Object}
 */
R.global = this;
	
/**
 * Declare a new namespace in R.
 * @param ns {String} The namespace to declare
 * @exception Throws an exception if the namespace is already declared
 * @memberOf R
 */
R.namespace = function(ns) {
	if (R._namespaces[ns]) {
		throw new Error("Namespace '" + ns + "' already defined!");
	}
	R._namespaces[ns] = 1;
	
	var path = ns.split("."), cur = R;
	for (var p; path.length && (p = path.shift());) {
		if (cur[p]) {
			cur = cur[p];
		} else {
			cur = cur[p] = {};
		}
	}
};

/**
 * Throw an "unsupported" exception for the given method in the class.
 * @param method {String} The method name
 * @param clazz {Class} The class object
 * @memberOf R
 * @exception Throws a "[method] is unsupported in [Class]" error
 */
R._unsupported = function(method, clazz) {
	throw new Error(method + " is unsupported in " + clazz.getClassName());	
};

/** private **/
R.str = Object.prototype.toString;

/**
 * Check if the given object is a function
 * @param obj {Object} The object to test
 * @return {Boolean}
 * @memberOf R
 */
R.isFunction = function(obj) {
   return (R.str.call(obj) === "[object Function]");
};

/**
 * Check if the given object is an array
 * @param obj {Object} The object to test
 * @return {Boolean}
 * @memberOf R
 */
R.isArray = function(obj) {
   return (R.str.call(obj) === "[object Array]");
};

/**
 * Check if the given object is a string
 * @param obj {Object} The object to test
 * @return {Boolean}
 * @memberOf R
 */
R.isString = function(obj) {
   return (R.str.call(obj) === "[object String]");
};

/**
 * Check if the given object is a number
 * @param obj {Object} The object to test
 * @return {Boolean}
 * @memberOf R
 */
R.isNumber = function(obj) {
   return (R.str.call(obj) === "[object Number]");
};

/**
 * Test if the object is undefined, null, or a string and is empty
 * @param obj {Object} The object to test
 * @return {Boolean}
 * @memberOf R
 */
R.isEmpty = function(obj) {
	return typeof obj === "undefined" || obj === null || (R.isString(obj) && $.trim(obj) === "");
};

/**
 * Make a simplified class object.
 * @param clazz {Object} Methods and fields to assign to the class prototype.  A special method, "<tt>constructor</tt>"
 *		will be used as the constructor function for the class, or an empty constructor will be assigned.
 * @param props {Object} Properties which are available on the object class.  The format is [getterFn, setterFn].  If
 *		either is null, the corresponding property accessor method will not be assigned.
 * @return {Function} A new
 * @memberOf R
 */
R.make = function(clazz, props) {
	// Get the constructor (if it exists)
	var c = clazz["constructor"] || function(){};
	if (clazz["constructor"]) {
		delete clazz["constructor"];
	}
	
	// Assign prototype fields and methods
	for (var fm in clazz) {
		c.prototype[fm] = clazz[fm];
	}
	
	// Set up properties
	if (props) {
		for (var p in props) {
			if (props[p][0]) {
				c.prototype.__defineGetter__(p, props[p][0]);
			}
			if (props[p][1]) {
				c.prototype.__defineSetter__(p, props[p][1]);
			}
		}
	}
	
	return c;
};

/**
 * Method for cloning objects which extend from {@link R.engine.PooledObject}.
 * Other objects will return a clone of the object, but not classes.
 * @param obj {Object} The object to clone
 * @return {Object} A clone of the object
 */
R.clone = function(obj) {
   if (obj instanceof R.engine.PooledObject) {
      var ctor = obj.constructor;
      if (ctor.clone) {
         return ctor.clone(obj);
      } else {
         return ctor.create(obj);
      }
   } else {
      return $.extend({}, obj);
   }
};

/**
 * Get the class for the given class name string.
 * @param className {String} The class name string
 * @return {Class} The class object for the given name
 * @throws ReferenceError if the class is invalid or unknown
 */
R.getClassForName = function(className) {
   var cn = className.split("."), c = R.global;
   try {
      while (cn.length > 0) {
         c = c[cn.shift()];
      }
      return c;
   } catch (ex) {
      return undefined;
   }
};

/**
 * Method to request an animation frame for timing (alternate loop)
 * framerate fixed at 60fps
 */
R.global.nativeFrame = (function(){
   return  R.global.requestAnimationFrame       ||
           R.global.webkitRequestAnimationFrame ||
           R.global.mozRequestAnimationFrame    ||
           R.global.oRequestAnimationFrame      ||
           R.global.msRequestAnimationFrame     ||
           function(/* function */ callback, /* DOMElement */ element){
             R.global.setTimeout(callback, 1000 / 60);
           };
 })();

// Define the engine's default namespaces
R.namespace("debug");
R.namespace("lang");
R.namespace("struct");
R.namespace("math");
R.namespace("engine");
R.namespace("collision");
R.namespace("collision.broadphase");
R.namespace("components");
R.namespace("components.input");
R.namespace("components.transform");
R.namespace("components.logic");
R.namespace("components.collision");
R.namespace("components.render");
R.namespace("components.physics");
R.namespace("objects");
R.namespace("particles");
R.namespace("physics");
R.namespace("rendercontexts");
R.namespace("resources");
R.namespace("resources.loaders");
R.namespace("resources.types");
R.namespace("sound");
R.namespace("storage");
R.namespace("text");
R.namespace("ui");
R.namespace("util");

/**
 * Return the current time in milliseconds.
 * @return {Number}
 */
R.now = (function() {
   return Date.now ? Date.now : function() {return new Date().getTime();};
})();

/**
 * The Render Engine
 * Console
 *
 * @fileoverview A debug console abstraction
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1562 $
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
 * @class The base class for all console objects. Each type of supported console outputs
 *        its data differently.  This class allows abstraction between the console and the
 *        browser's console object so the {@link Console} can report to it.
 */
R.debug.ConsoleRef = Base.extend(/** @scope R.debug.ConsoleRef.prototype */{
   constructor: function() {
   },

   dumpWindow: null,

   /** @private */
   combiner: function() {
      var out = "";
      for (var a = 0; a < arguments.length; a++) {
         out += arguments[a].toString();
      }
      return out;
   },

   cleanup: function(o) {
      if (typeof o === "undefined") {
         return "";
      } else if (o === null) {
         return "null";
      } else if (typeof o == "function") {
         return "function";
      } else if (o.constructor == Array || (o.slice && o.join && o.splice)) { // An array
         var s = "[";
         for (var e in o) {
            s += (s.length > 1 ? "," : "") + this.cleanup(o[e]);
         }
         return s + "]";
      } else if (typeof o === "object") {
         var s = "{\n";
         for (var e in o) {
            s += e + ": " + this.cleanup(o[e]) + "\n";
         }
         return s + "}\n";
      } else {
         return o.toString();
      }
   },

   /** @private */
   fixArgs: function(a) {
      var x = [];
      for (var i=0; i < a.length; i++) {
         if (!a[i]) {
            x.push("null");
         } else {
            x.push(this.cleanup(a[i]));
         }
      }
      return x.join(" ");
   },

   /**
    * Write a debug message to the console.  The arguments to the method call will be
    * concatenated into one string message.
    */
   debug: function() {
   },

   /**
    * Write an info message to the console.  The arguments to the method call will be
    * concatenated into one string message.
    */
   info: function() {
   },

   /**
    * Write a warning message to the console.  The arguments to the method call will be
    * concatenated into one string message.
    */
   warn: function() {
   },

   /**
    * Write an error message to the console.  The arguments to the method call will be
    * concatenated into one string message.
    */
   error: function() {
   },

   /**
    * Dump a stack trace to the console.
    */   
   trace: function() {
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "ConsoleRef"
    */
   getClassName: function() {
      return "ConsoleRef";
   }

});

/**
 * @class A debug console that will use a pre-defined element to display its output.  The element with the id 
 *        "debug-console" will be created an appended to the DOM for you.  This object is created when no other
 *        option is available from the browser, or when developer tools cannot be accessed.
 * @extends R.debug.ConsoleRef
 */
R.debug.HTML = R.debug.ConsoleRef.extend(/** @scope R.debug.HTML.prototype **/{

   msgStore: null,
   
   firstTime: null,

   constructor: function() {
      this.msgStore = [];
      this.firstTime = true;
      $("head", document).append(
            "<style> " +
            "#debug-console { position: absolute; width: 400px; right: 10px; bottom: 5px; height: 98%; border: 1px solid; overflow: auto; " +
            "font-family: 'Lucida Console',Courier; font-size: 8pt; color: black; } " +
            "#debug-console .console-debug, #debug-console .console-info { background: white; } " +
            "#debug-console .console-warn { font-style: italic; background: #00ffff; } " +
            "#debug-console .console-error { color: red; background: yellow; font-weight: bold; } " +
            "</style>"
      );
      $(document).ready(function() {
         $(document.body).append($("<div id='debug-console'><!-- --></div>"));
      });
      
      // Redirect error logging to the console
      window.onerror = function(err){
         if (err instanceof Error) {
            this.error(err.message);
         } else {
            this.error(err);
         }
      };
   },

   /** @private */
   clean: function() {
      if ($("#debug-console > span").length > 150) {
         $("#debug-console > span:lt(150)").remove();
      }
   },

   /** @private */
   scroll: function() {
      var w = $("#debug-console")[0];
      if (w) {
         $("#debug-console")[0].scrollTop = w.scrollHeight + 1;
      }
   },
   
   store: function(type, args) {
      if (!this.firstTime) {
         return;
      }
      if (!document.getElementById("debug-console")) {
         this.msgStore.push({
            t: type,
            a: this.fixArgs(args)
         });   
      } else {
         this.firstTime = false;
         for (var i = 0; i < this.msgStore.length; i++) {
            switch (this.msgStore[i].t) {
               case "i": this.info(this.msgStore[i].a); break;
               case "d": this.debug(this.msgStore[i].a); break;
               case "w": this.warn(this.msgStore[i].a); break;
               case "e": this.error(this.msgStore[i].a); break;
            }
         }
         this.msgStore = null;
      }
   },

   /** @private */
   fixArgs: function(a) {
      var o = this.base(a);
      return o.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;");
   },

   /**
    * Write a debug message to the console.
    */
   info: function() {
      this.clean();
      this.store("i",arguments);
      $("#debug-console").append($("<div class='console-info'>" + this.fixArgs(arguments) + "</div>"));
      this.scroll();
   },

   /**
    * Write a debug message to the console
    */
   debug: function() {
      this.clean();
      this.store("d",arguments);
      $("#debug-console").append($("<div class='console-debug'>" + this.fixArgs(arguments) + "</div>"));
      this.scroll();
   },

   /**
    * Write a warning message to the console
    */
   warn: function() {
      this.clean();
      this.store("w",arguments);
      $("#debug-console").append($("<div class='console-warn'>" + this.fixArgs(arguments) + "</div>"));
      this.scroll();
   },

   /**
    * Write an error message to the console
    */
   error: function() {
      this.clean();
      this.store("e",arguments);
      $("#debug-console").append($("<div class='console-error'>" + this.fixArgs(arguments) + "</div>"));
      this.scroll();
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.debug.HTML"
    */
   getClassName: function() {
      return "R.debug.HTML";
   }
});

/**
 * @class A debug console abstraction for Webkit browsers.
 * @extends R.debug.ConsoleRef
 */
R.debug.Webkit = R.debug.ConsoleRef.extend(/** @scope R.debug.Webkit.prototype **/{

   constructor: function() {
   },

   /**
    * Write a debug message to the console
    */
   info: function() {
      console.log.apply(console,arguments);
   },

   /**
    * Write a debug message to the console
    */
   debug: function() {
      console.debug.apply(console,arguments);
   },

   /**
    * Write a warning message to the console
    */
   warn: function() {
      console.warn.apply(console,arguments);
   },

   /**
    * Write an error message to the console
    */
   error: function() {
      console.error.apply(console,arguments);
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.debug.Webkit"
    */
   getClassName: function() {
      return "R.debug.Safari";
   }

});

/**
 * @class A debug console for Opera browsers.
 * @extends R.debug.ConsoleRef
 */
R.debug.Opera = R.debug.ConsoleRef.extend(/** @scope R.debug.Opera.prototype **/{

   constructor: function() {
   },

   /**
    * Write a debug message to the console
    */
   info: function() {
      window.opera.postError(this.fixArgs(arguments));
   },

   /**
    * Write a debug message to the console
    */
   debug: function() {
      window.opera.postError(["[D]", this.fixArgs(arguments)]);
   },

   /**
    * Write a warning message to the console
    */
   warn: function() {
      window.opera.postError(["[W]", this.fixArgs(arguments)]);
   },

   /**
    * Write an error message to the console
    */
   error: function() {
      window.opera.postError(["[E!]", this.fixArgs(arguments)]);
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.debug.Opera"
    */
   getClassName: function() {
      return "R.debug.Opera";
   }

});


/**
 * @class A console reference to the Firebug console.  This will work with both Firebug and FirebugLite.
 * @extends R.debug.ConsoleRef
 */
R.debug.Firebug = R.debug.ConsoleRef.extend(/** @scope R.debug.Firebug.prototype **/{

   constructor: function () {
   },

   /**
    * Write a debug message to the console
    */
   info: function() {
      if (typeof firebug !== "undefined") {
         firebug.d.console.log.apply(firebug.d.console, arguments);
      } else {
         console.info.apply(console, arguments);
      }
   },

   /**
    * Write a debug message to the console
    */
   debug: function() {
      if (typeof firebug !== "undefined") {
         firebug.d.console.log.apply(firebug.d.console, arguments);
      } else {
         console.debug.apply(console, arguments);
      }
   },

   /**
    * Write a warning message to the console
    */
   warn: function() {
      if (typeof firebug !== "undefined") {
         firebug.d.console.log.apply(firebug.d.console, arguments);
      } else {
         console.warn.apply(console, arguments);
      }
   },

   /**
    * Write an error message to the console
    */
   error: function() {
      if (typeof firebug !== "undefined") {
         firebug.d.console.log.apply(firebug.d.console, arguments);
      } else {
         console.error.apply(console, arguments);
      }
   },
   
   /**
    * Write a stack trace to the console
    */
   trace: function() {
      if (typeof firebug !== "undefined") {
         console.trace.apply(arguments);
      }
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.debug.Firebug"
    */
   getClassName: function() {
      return "R.debug.Firebug";
   }
});

/**
 * @class A console reference to the MSIE console.
 * @extends R.debug.ConsoleRef
 */
R.debug.MSIE = R.debug.ConsoleRef.extend(/** @scope R.debug.MSIE.prototype **/{

   constructor: function() {
   },

   /**
    * Write a debug message to the console
    */
   info: function() {
      console.log(this.fixArgs(arguments));
   },

   /**
    * Write a debug message to the console
    */
   debug: function() {
      console.info(this.fixArgs(arguments));
   },

   /**
    * Write a warning message to the console
    */
   warn: function() {
      console.warn(this.fixArgs(arguments));
   },

   /**
    * Write an error message to the console
    */
   error: function() {
      console.error(this.fixArgs(arguments));
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.debug.MSIE"
    */
   getClassName: function() {
      return "R.debug.MSIE";
   }
});

/**
 * @class A class for logging messages to a console reference object.  There are
 *        currently four supported console references:
 *        <ul>
 *        <li>Firebug - logs to the Firebug/Firebug Lite error console</li>
 *        <li>OperaConsoleRef - logs to the Opera error console</li>
 *        <li>HTMLConsoleRef - logs to an HTML div element in the body</li>
 *        <li>SafariConsoleRef - logging for Apple's Safari browser</li>
 *        </ul>
 */
R.debug.Console = Base.extend(/** @scope R.debug.Console.prototype */{
   constructor: null,
   consoleRef: null,
   enableDebugOutput: null,

   /**
    * Output only errors to the console.
    */
   DEBUGLEVEL_ERRORS:      4,

   /**
    * Output warnings and errors to the console.
    */
   DEBUGLEVEL_WARNINGS:    3,

   /**
    * Output warnings, errors, and debug messages to the console.
    */
   DEBUGLEVEL_DEBUG:       2,

   /**
    * Output warnings, errors, debug, and low-level info messages to the console.
    */
   DEBUGLEVEL_INFO:        1,

   /**
    * Output all messages to the console.
    */
   DEBUGLEVEL_VERBOSE:     0,

   /**
    * Output nothing to the console.
    */
   DEBUGLEVEL_NONE:       -1,

   /** @private */
   verbosity: null,

   /**
    * Starts up the console.
    */
   startup: function() {
		R.debug.Console.verbosity = R.debug.Console.DEBUGLEVEL_ERRORS;
		R.debug.Console.enableDebugOutput = false;
		
      if (R.engine.Support.checkBooleanParam("debug") && (R.engine.Support.checkBooleanParam("simWii") || jQuery.browser.Wii)) {
         R.debug.Console.consoleRef = new R.debug.HTML();
      }
      else if (typeof firebug !== "undefined" || (typeof console !== "undefined" && console.firebug)) {
         // Firebug or firebug lite
         R.debug.Console.consoleRef = new R.debug.Firebug();
      }
      else if (typeof console !== "undefined" && jQuery.browser.msie) {
         R.debug.Console.consoleRef = new R.debug.MSIE();
      }
      else if (jQuery.browser.chrome || jQuery.browser.safari) {
         R.debug.Console.consoleRef = new R.debug.Webkit();
      }
      else if (jQuery.browser.opera) {
         R.debug.Console.consoleRef = new R.debug.Opera();
      }
      else {
         R.debug.Console.consoleRef = new R.debug.ConsoleRef(); // (null console)
      }
   },

   /**
    * Set the console reference object to a new type of console which isn't
    * natively supported.
    *
    * @param refObj {ConsoleRef} A descendent of the <tt>ConsoleRef</tt> class.
    */
   setConsoleRef: function(refObj) {
      if (refObj instanceof R.debug.ConsoleRef) {
         R.debug.Console.consoleRef = refObj;
      }
   },

   /**
    * Set the debug output level of the console.  The available levels are:
    * <ul>
    * <li><tt>Console.DEBUGLEVEL_ERRORS</tt> = 4</li>
    * <li><tt>Console.DEBUGLEVEL_WARNINGS</tt> = 3</li>
    * <li><tt>Console.DEBUGLEVEL_DEBUG</tt> = 2</li>
    * <li><tt>Console.DEBUGLEVEL_INFO</tt> = 1</li>
    * <li><tt>Console.DEBUGLEVEL_VERBOSE</tt> = 0</li>
    * <li><tt>Console.DEBUGLEVEL_NONE</tt> = -1</li>
    * </ul>
    * Messages of the same (or lower) level as the specified level will be logged.
    * For instance, if you set the level to <tt>DEBUGLEVEL_DEBUG</tt>, errors and warnings
    * will also be logged.  The engine must also be in debug mode for warnings,
    * debug, and log messages to be output.
    * <p/>
    * Console messages have been decoupled from engine debugging mode so that messages
    * can be output without the need to enter engine debug mode.  To enable engine
    * debugging, see {@link R.Engine#setDebugMode}.
    *
    * @param level {Number} One of the debug levels.  Defaults to DEBUGLEVEL_NONE.
    */
   setDebugLevel: function(level) {
      R.debug.Console.verbosity = level;
      
      // Automatically enable output, unless no debugging is specified
      if (level != R.debug.Console.DEBUGLEVEL_NONE) {
      	R.debug.Console.enableDebugOutput = true;
      } else {
      	R.debug.Console.enableDebugOutput = false;
      }
   },
   
   /**
    * Get the debug level which the console is currently at.
    * @return {Number} The debug level
    */
   getDebugLevel: function() {
      return R.debug.Console.verbosity;
   },

   /**
    * Verifies that the debug level is the same as the message to output
    * @private
    */
   checkVerbosity: function(debugLevel) {
      return (R.debug.Console.enableDebugOutput && 
      		  R.debug.Console.verbosity != R.debug.Console.DEBUGLEVEL_NONE &&
              R.debug.Console.verbosity == R.debug.Console.DEBUGLEVEL_VERBOSE ||
              (debugLevel != R.debug.Console.DEBUGLEVEL_VERBOSE && debugLevel >= R.debug.Console.verbosity));
   },

   /**
    * Outputs a log message.  These messages will only show when <tt>DEBUGLEVEL_VERBOSE</tt> is the level.
    * You can pass as many parameters as you want to this method.  The parameters will be combined into
    * one message to output to the console.
    */
   log: function() {
      if (R.debug.Console.checkVerbosity(R.debug.Console.DEBUGLEVEL_VERBOSE))
         R.debug.Console.consoleRef.debug.apply(R.debug.Console.consoleRef, arguments);
   },

   /**
    * Outputs an info message. These messages will only show when <tt>DEBUGLEVEL_INFO</tt> is the level.
    * You can pass as many parameters as you want to this method.  The parameters will be combined into
    * one message to output to the console.
    */
   info: function() {
      if (R.debug.Console.checkVerbosity(R.debug.Console.DEBUGLEVEL_INFO))
         R.debug.Console.consoleRef.debug.apply(R.debug.Console.consoleRef, arguments);
   },

   /**
    * Outputs a debug message.  These messages will only show when <tt>DEBUGLEVEL_DEBUG</tt> is the level.
    * You can pass as many parameters as you want to this method.  The parameters will be combined into
    * one message to output to the console.
    */
   debug: function() {
      if (R.debug.Console.checkVerbosity(R.debug.Console.DEBUGLEVEL_DEBUG))
         R.debug.Console.consoleRef.info.apply(R.debug.Console.consoleRef, arguments);
   },

   /**
    * Outputs a warning message.  These messages will only show when <tt>DEBUGLEVEL_WARNINGS</tt> is the level.
    * You can pass as many parameters as you want to this method.  The parameters will be combined into
    * one message to output to the console.
    */
   warn: function() {
      if (R.debug.Console.checkVerbosity(R.debug.Console.DEBUGLEVEL_WARNINGS))
         R.debug.Console.consoleRef.warn.apply(R.debug.Console.consoleRef, arguments);
   },

   /**
    * Output an error message.  These messages always appear unless the debug level is explicitly
    * set to <tt>DEBUGLEVEL_NONE</tt>.
    * You can pass as many parameters as you want to this method.  The parameters will be combined into
    * one message to output to the console.
    */
   error: function() {
      if (R.debug.Console.checkVerbosity(R.debug.Console.DEBUGLEVEL_ERRORS))
         R.debug.Console.consoleRef.error.apply(R.debug.Console.consoleRef, arguments);
   },
   
   /**
    * @private
    */
   trace: function() {
      R.debug.Console.consoleRef.trace();
   }
});


/**
 * Assert that a condition is <tt>true</tt>, stopping the engine if it is <tt>false</tt>.  
 * If the condifion fails an exception will be thrown.
 *
 * @param test {Boolean} A simple test that should evaluate to <tt>true</tt>
 * @param error {String} The error message to throw if the test fails
 */
var Assert = function(test, error) {
   var fail = false;
   try {
      if (!test)
      {
         fail = true;
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_ERRORS);
         if (arguments.length > 1) {
            for (var a = 1; a < arguments.length; a++) {
               R.debug.Console.error("*ASSERT* ", arguments[a]);
               R.debug.Console.trace();
            }
         }

         R.Engine.shutdown();
         
      }
   } catch (ex) {
      var pr = R.debug.Console.getDebugLevel();
      R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_WARNINGS);
      R.debug.Console.warn("*ASSERT* 'test' would result in an exception: ", ex);
      R.debug.Console.setDebugLevel(pr);
   }
   
   // This will provide a stacktrace for browsers that support it
   if (fail) {
      throw new Error(error);
   }
};

/**
 * Assert that a condition is <tt>true</tt>, reporting a warning if the test fails.
 *
 * @param test {Boolean} A simple test that should evaluate to <tt>true</tt>
 * @param error {String} The warning to display if the test fails
 */
var AssertWarn = function(test, warning) {
   try {
      if (!test)
      {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_WARNINGS);
         if (arguments.length > 1) {
            for (var a = 1; a < arguments.length; a++) {
               R.debug.Console.warn("*ASSERT-WARN* ", arguments[a]);
            }
         }
         R.debug.Console.warn(warning);
      }
   } catch (ex) {
      var pr = R.debug.Console.getDebugLevel();
      R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_WARNINGS);
      R.debug.Console.warn("*ASSERT-WARN* 'test' would result in an exception: ", ex);
      R.debug.Console.setDebugLevel(pr);
   }
};

/**
 * The Render Engine
 * JavaScript Profiler
 *
 * @fileoverview Profiler Object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1562 $
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
 * @class A static JavaScript implementation of a simple profiler.
 * @static
 */
R.debug.Profiler = {
	profileStack: [],
	allProfiles: {},
	profiles: [],
	running: false,
	engineStartTime: 0,
	engineFrameStart: 0
};

/**
 * Start the profiler.
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.start = function() {
	R.debug.Profiler.resetProfiles();
	R.debug.Profiler.running = true;
	
	R.debug.Profiler.engineStartTime = R.Engine.worldTime;
	R.debug.Profiler.engineFrameStart = R.Engine.totalFrames;
};

/**
 * Stop the profiler, dumping whatever was being profiled.
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.stop = function() {
	R.debug.Profiler.dump();
	R.debug.Profiler.running = false;
};

/**
 * Add a profile monitor to the stack of running profiles.  A good way to profile code
 * is to use the <tt>try/finally</tt> method so that the profile will be exited even
 * if the method returns from multiple points.
<pre>
   function func() {
      try {
         Profiler.enter("func");
         
         doStuff = doStuff + 1;
         return doStuff;
      } finally {
         Profiler.exit();
      }
   }
</pre>
 *
 * @param prof {String} The name of the profile
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.enter = function(prof) {
	if (!R.debug.Profiler.running) { return; }
	var profile = R.debug.Profiler.allProfiles[prof];
	if (profile == null) {
		// Create a monitor
		profile = R.debug.Profiler.allProfiles[prof] = {
			name: prof,
			startMS: R.now(),
			execs: 0,
			totalMS: 0,
			instances: 1,
			pushed: false
		};
	} else {
		profile.startMS = profile.instances == 0 ? R.now() : profile.startMS;
		profile.instances++;
	}
	R.debug.Profiler.profileStack.push(profile);
};

/**
 * For every "enter", there needs to be a matching "exit" to
 * tell the profiler to stop timing the contained code.  Note
 * that "exit" doesn't take any parameters.  It is necessary that
 * you properly balance your profile stack.  Too many "exit" calls
 * will result in a stack underflow. Missing calls to "exit" will
 * result in a stack overflow.
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.exit = function() {
	if (!R.debug.Profiler.running) { return; }
	if (R.debug.Profiler.profileStack.length == 0) {
		var msg = "Profile stack underflow";
		if (typeof console !== "undefined") { console.error(msg); }
		throw(msg);
	}

	var profile = R.debug.Profiler.profileStack.pop();
	profile.endMS = new Date();
	profile.execs++;
	profile.instances--;
	profile.totalMS += profile.instances == 0 ? (profile.endMS.getTime() - profile.startMS.getTime()) : 0;
	if (!profile.pushed) {
		// If we haven't remembered it, do that now
		profile.pushed = true;
		R.debug.Profiler.profiles.push(profile);
	}
};

/**
 * Reset any currently running profiles and clear the stack.
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.resetProfiles = function() {
	R.debug.Profiler.profileStack = [];
	R.debug.Profiler.allProfiles = {};
	R.debug.Profiler.profiles = [];
};

/**
 * Dump the profiles that are currently in the stack to a debug window.
 * The profile stack will be cleared after the dump.
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.dump = function() {
	if (!R.debug.Profiler.running) { return; }
	if (R.debug.Profiler.profileStack.length > 0) {
		// overflow - profiles left in stack
		var rProfs = "";
		for (var x in R.debug.Profiler.profileStack) {
			rProfs += (rProfs.length > 0 ? "," : "") + x;
		}
		R.debug.Console.error("Profile stack overflow.  Running profiles: ", rProfs);
	}

	var d = new Date();
	d = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

	var rev = R.debug.Profiler.profiles.reverse();
	var totalTime = 0;
	var out = "";
	for (var r in rev) {
		var avg = Math.round(rev[r].totalMS / rev[r].execs);
		totalTime += rev[r].totalMS;
		out += "# " + rev[r].name + " | " + (rev[r].totalMS < 1 ? "<1" : rev[r].totalMS) + " ms | " + rev[r].execs + " @ " + (avg < 1 ? "<1" : avg) + " ms\n";
	}
	out += "# Total Time: | " + totalTime + " ms | \n";

	R.debug.Console.warn("PROFILER RESULTS @ " + d + "\n---------------------------------------------------\n");
	R.debug.Console.warn("   Runtime: " + (R.Engine.worldTime - R.debug.Profiler.engineStartTime) + "ms\n" +
								"   Frames: " + (R.Engine.totalFrames - R.debug.Profiler.engineFrameStart) +
								"\n---------------------------------------------------\n");

	R.debug.Console.info(out);
	
	R.debug.Profiler.resetProfiles();
};

/**
 * Wire the objects in the array with profiling 
 * @param objArray {Array} Object array
 * @memberOf R.debug.Profiler
 */
R.debug.Profiler.wireObjects = function(objArray) {
	for (var obj in objArray) {

		for (var o in objArray[obj].prototype) {
			try {
				if (typeof objArray[obj].prototype[o] == "function" && 
					 objArray[obj].prototype.hasOwnProperty(o) && o != "constructor") {
					// wrap it in a function to profile it
					var f = objArray[obj].prototype[o];
					var fn = function() {
						try {
							R.debug.Profiler.enter(arguments.callee.ob + "." + arguments.callee.o + "()");
							return arguments.callee.f.apply(this, arguments);
						} finally {
							R.debug.Profiler.exit();
						}
					};
					fn.f = f;
					fn.o = o;
					fn.ob = objArray[obj].getClassName(); 
					
					objArray[obj].prototype[o] = fn;
				}
			} catch (e) {
			}
		}
		
	}
};
/**
 * The Render Engine
 * Math2 Class
 *
 * @fileoverview A math static class which provides a method for generating
 * 				  pseudo random numbers.
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

/**
 * @class A static class which provides methods for generating random integers
 * 		 and floats between 0 and 1.  The class also provides a way to seed the
 * 		 random number generator for repeatable results.
 * 
 * @static
 */
R.lang.Math2 = /** @scope R.lang.Math2.prototype */{
	
	state: 1,
	m: 0x100000000, // 2**32;
	a: 1103515245,
	c: 12345,
	
	/**
	 * Largest integer (4294967295)
	 * @type {Number}
	 * @memberOf R.lang.Math2
	 */
	MAX_INT: 0xFFFFFFFF,		// 64-bits
	
	/**
	 * Seed the random number generator with a known number.  This
	 * ensures that random numbers occur in a known sequence.
	 * 
	 * @param seed {Number} An integer to seed the number generator with
	 * @memberOf R.lang.Math2
	 */
	seed: function(seed) {
		// LCG using GCC's constants
		R.lang.Math2.state = seed ? seed : Math.floor(Math.random() * (R.lang.Math2.m-1));
	},
	
	/**
	 * Returns a random integer between 0 and 4,294,967,296.
	 * @return {Number} An integer between 0 and 2^32
	 * @memberOf R.lang.Math2
	 */
	randomInt: function() {
		R.lang.Math2.state = (R.lang.Math2.a * R.lang.Math2.state + R.lang.Math2.c) % R.lang.Math2.m;
		return R.lang.Math2.state;
	},
	
	/**
	 * Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)
	 * @return {Number} A number between 0 and 1
	 * @memberOf R.lang.Math2
	 */
	random: function() {
		// returns in range [0,1]
		return R.lang.Math2.randomInt() / (R.lang.Math2.m - 1);
	},
	
	/**
	 * Return a random value within the <tt>low</tt> to <tt>height</tt> range,
	 * optionally as an integer value only.
	 *
	 * @param low {Number} The low part of the range
	 * @param high {Number} The high part of the range
	 * @param [whole] {Boolean} Return whole values only
	 * @return {Number}
	 * @memberOf R.lang.Math2
	 */
	randomRange: function(low, high, whole) {
		var v = low + (R.lang.Math2.random() * high);
		return (whole ? Math.floor(v) : v);
	},
	
	/**
	 * Parse a binary string into a number.
	 * 
	 * @param bin {String} Binary string to parse
	 * @return {Number}
	 * @memberOf R.lang.Math2
	 */
	parseBin: function(bin) {
		if (!isNaN(bin)) {
			return R.global.parseInt(bin, 2);
		}
	},
	
	/**
	 * Converts a number to a hexidecimal string, prefixed by "0x".
	 *
	 * @param num {Number} The number to convert
	 * @return {String}
	 * @memberOf R.lang.Math2
	 */
	toHex: function(num) {
		if (!isNaN(num)) {
			return ("0x" + num.toString(16));
		}
	},
	
	/**
	 * Converts a number to a binary string.
	 *
	 * @param num {Number} The number to convert
	 * @return {String}
	 * @memberOf R.lang.Math2
	 */
	toBinary: function(num) {
		if (!isNaN(num)) {
			return num.toString(2);
		}
	}
};

// Initially seed the random number generator with a pseudo-random number
R.lang.Math2.seed();

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
      if (!array) {
         return -1;
      }

      if (Array.prototype.indexOf) {
         return array.indexOf(obj, from);
      }
      else
      {
         var len = array.length;
         var from = Number(from) || 0;
         from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
         if (from < 0)
            from += len;

         for (; from < len; from++)
         {
            if (from in array && array[from] === obj)
               return from;
         }
         return -1;
      }
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
      if (!array) {
         return;
      }

      var idx = R.engine.Support.indexOf(array, obj);
      if (idx != -1)
      {
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
      return (str == null || $.trim(str) === "");     
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
      if (!array) {
         return null;
      }

      if (Array.prototype.filter) {
         return array.filter(fn, thisp)
      }
      else
      {
         var len = array.length;
         if (typeof fn != "function")
            throw new TypeError();

         var res = new Array();
         for (var i = 0; i < len; i++)
         {
            if (i in array)
            {
               var val = array[i]; // in case fn mutates this
               if (fn.call(thisp, val, i, array))
                  res.push(val);
            }
         }

         return res;
      }
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
      if (!array) {
         return;
      }

      if (Array.prototype.forEach) {
         array.forEach(fn, thisp);
      }
      else
      {
         var len = array.length;
         if (typeof fn != "function")
            throw new TypeError();

         for (var i = 0; i < len; i++)
         {
            if (i in array)
               fn.call(thisp, array[i], i, array);
         }
      }
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
      var l = url.lastIndexOf("/");
      return url.substr(0, l);
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
              (R.engine.Support.getQueryParams()[paramName] == "true" ||
               R.engine.Support.getQueryParams()[paramName] == "1" ||
               R.engine.Support.getQueryParams()[paramName].toLowerCase() == "yes" ||
               R.engine.Support.getQueryParams()[paramName].toLowerCase() == "y"));
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
      return (R.engine.Support.getStringParam(paramName, null) == val)
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
   parseJSON: function(jsonString)
   {
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
      if (typeof obj !== "undefined") {
         fn();
      } else {
         setTimeout(arguments.callee, 50);
      }
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


/**
 * The Render Engine
 * Engine Linker Class
 *
 * @fileoverview A class for checking class dependencies and class intialization
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

/**
 * @class A static class for processing class files, looking for dependencies, and
 *        ensuring that all dependencies exist before initializing a class.  The linker
 *        expects that files will follow a fairly strict format, so that patterns can be
 *        identified and all dependencies resolved.
 *        <p/>
 *        These methods handle object dependencies so that each object will be
 *        initialized as soon as its dependencies become available.  Using this method
 *        scripts can be loaded immediately, using the browsers threading model, and
 *        executed when dependencies are fulfilled.
 *
 * @static
 * @private
 */
R.engine.Linker = Base.extend(/** @scope R.engine.Linker.prototype */{ 

   constructor: null,

   //====================================================================================================
   //====================================================================================================
   //                                   DEPENDENCY PROCESSOR
   //
   //====================================================================================================
   //====================================================================================================

	classDefinitions: {},	// These are class definitions which have been parsed
	processed: {},				// These are the classes/files which have been processed
	resolvedClasses: {},		// These are resolved (loaded & ready) classes
	resolvedFiles: {},		// These are resolved (loaded) files
	
	loadClasses: [],			// Classes which need to be loaded
	queuedClasses: {},		// Classes which are queued to be initialized
	
	classLoaderTimer: null,
	classTimer: null,
	failTimer: null,
	
	waiting: {},
	
	/**
	 * See R.Engine.define()
	 * @private
	 */
	define: function(classDef) {
		if (typeof classDef["class"] === "undefined") {
			throw new SyntaxError("Missing 'class' key in class definition!");
		}
		var className = classDef["class"];
		
		if (R.engine.Linker.resolvedClasses[className] != null) {
			throw new ReferenceError("Class '" + className + "' is already defined!");
		}

		R.debug.Console.info("R.engine.Linker => Process definition for ", className);

		R.engine.Linker.classDefinitions[className] = classDef;	
		var deps = [];
		if (classDef.requires && classDef.requires.length > 0) deps = deps.concat(classDef.requires);
		var incs = [];
		if (classDef.includes && classDef.includes.length > 0) incs = incs.concat(classDef.includes);
		
		if (deps.length == 0 && incs.length == 0) {
			// This class is ready to go already
			R.engine.Linker._initClass(className);
			return;			
		}
		
		if (!R.engine.Linker.processed[className]) {
			R.engine.Linker.processed[className] = true;
			if (!R.engine.Linker.resolvedClasses[className]) {
				// Queue the class to be resolved
				R.engine.Linker.queuedClasses[className] = true;
			}
		}
		
		// Remove any dependencies which are already resolved
		var unresDeps = [];
		while (deps.length > 0) {
			var dep = deps.shift();
			if (!R.engine.Linker.resolvedClasses[dep]) {
				unresDeps.push(dep);
			}
		}
		
		// Remove any includes which are already loaded
		var unresIncs = [];
		while (incs.length > 0) {
			var inc = incs.shift();
			if (!R.engine.Linker.resolvedFiles[inc]) {
				unresIncs.push(inc);
			}
		}
		
		// Load the includes ASAP
		while (unresIncs.length > 0) {
			var inc = unresIncs.shift();
			
			// If the include hasn't been processed yet, do it now
			if (!R.engine.Linker.processed[inc]) {
				var cb = function(path, result) {
					if (result === R.engine.Script.SCRIPT_LOADED) {
						R.engine.Linker.resolvedFiles[path] = true;
					}
				};
				R.engine.Script.loadNow(inc, cb);
				R.engine.Linker.processed[inc] = true;
			}
		}
		
		// Queue up the classes for processing
		while (unresDeps.length > 0) {
			var dep = unresDeps.shift();
			if (!R.engine.Linker.processed[dep]) {
				R.engine.Linker.processed[dep] = true;
				R.engine.Linker.loadClasses.push(dep);
			}
		}
		
		if (R.engine.Linker.loadClasses.length > 0) {
			// Run the class loader
			setTimeout(function() {
				R.engine.Linker.classLoader();
			}, 100);
		}
		
		if (R.engine.Linker.classTimer == null) {
			// After 10 seconds, if classes haven't been processed, fail
			R.engine.Linker.failTimer = setTimeout(function() {
				R.engine.Linker._failure();
			}, 10000);
			
		  	R.engine.Linker.classTimer = setTimeout(function(){
		  		R.engine.Linker._processClasses();
		  	}, 100);
		}
	},
   
	/**
	 * Loads the class by converting the namespaced class to a filename and
	 * calling the script loader.  When the file finishes loading, it is
	 * put into the class queue to be processed.
	 * 
	 * @private
	 */
	classLoader: function() {
		// Load the classes
		while (R.engine.Linker.loadClasses.length > 0) {
			R.engine.Linker._doLoad(R.engine.Linker.loadClasses.shift());
		}
	},

	/**
	 * Linker uses this to load classes and track them
	 * @private
	 */
	_doLoad: function(className) {
		// Split the class into packages
		var cn = className.split(".");

		// Shift off the namespace
		cn.shift();

		// Is this in the engine package?
		if (cn[0] == "engine") {
			// Shift off the package
			cn.shift();
		}

		// Convert the class to a path
		var path = "/" + cn.join("/").toLowerCase() + ".js";

		// Classes waiting for data
		R.engine.Linker.waiting[path] = className;

		// Load the class
		R.debug.Console.log("Loading " + path);
		R.engine.Script.loadNow(path, R.engine.Linker._loaded);
	},
	
	/**
	 * The callback for when a class file is loaded
	 * @private
	 */
	_loaded: function(path, result) {

		// Get the class for the path name
		var className = R.engine.Linker.waiting[path];
		delete R.engine.Linker.waiting[path];
		
		if (result === R.engine.Script.SCRIPT_LOADED) {
			// Push the class into the processing queue
			R.debug.Console.info("R.engine.Linker => Initializing " + className);
			R.engine.Linker.queuedClasses[className] = true;
		} else {
			R.debug.Console.error("R.engine.Linker => " + className + " failed to load!");
		}
			
	},
	
	/**
	 * Performs dependency and include checking for a class before
	 * initializing it into the namespace.
	 * 
	 * @private
	 */
	_processClasses: function() {
		var inProcess = 0, processed = 0, completed = [];
		for (var cn in R.engine.Linker.queuedClasses) {
			inProcess++;
			
			// Get the class definition
			var def = R.engine.Linker.classDefinitions[cn];
			
			if (!def) {
				throw new Error("R.engine.Linker => Class '" + cn + "' doesn't have a definition!");
			}
				
			// Check to see if the dependencies exist
			var missDeps = false, reqs = [], unres = [];
			if (def.requires && def.requires.length > 0) reqs = reqs.concat(def.requires);
			while (reqs.length > 0) {
				var req = reqs.shift();
				
				if (!R.engine.Linker.resolvedClasses[req]) {
					// Check for A => B  => A
					// If such a circular reference exists, we can ignore the dependency
					var depDef = R.engine.Linker.classDefinitions[req];
					if (depDef && depDef.requires) {
						if (R.engine.Support.indexOf(depDef.requires, cn) == -1) {
							// Not a circular reference
							unres.push(req);
						}
					} else {
						// Class not resolved
						unres.push(req);
					}
				}
			}
			
			// Anything left unresolved means we cannot initialize
			missDeps = (unres.length > 0);
			
			// Check for local dependencies
			var localDeps = false, lDeps = [], lUnres = [];
			if (def.depends && def.depends.length > 0) lDeps = lDeps.concat(def.depends);
			while (lDeps.length > 0) {
				var lDep = lDeps.shift();
				
				if (!R.engine.Linker.resolvedClasses[lDep]) {
					// Check for A => B  => A
					// If such a circular reference exists, we can ignore the dependency
					var lDepDef = R.engine.Linker.classDefinitions[lDep];
					if (lDepDef && lDepDef.requires) {
						if (R.engine.Support.indexOf(lDepDef.requires, cn) == -1) {
							// Not a circular reference
							lUnres.push(lDep);
						}
					} else if (lDepDef && lDepDef.depends) {
						if (R.engine.Support.indexOf(lDepDef.depends, cn) == -1) {
							// Not a circular reference
							lUnres.push(lDep);
						}
					} else {
						// Class not resolved
						lUnres.push(lDep);
					}
				}
			}
			
			// Anything left unresolved means we cannot initialize
			localDeps = (lUnres.length > 0);
						
			// If all requirements are loaded, check the includes
			if (!(missDeps || localDeps)) {
				var missIncs = false, incs = def.includes || [];
				for (var i = 0; i < incs.length; i++) {
					if (!R.engine.Linker.resolvedFiles[incs[i]]) {
						missIncs = true;
						break;	
					}
				}

				if (!missIncs) {
					R.engine.Linker._initClass(cn);
				
					// No need to process it again
					completed.push(cn);
					processed++;				
				}
			}
		}

		// Clean up processed classes
		while (completed.length > 0) {
			delete R.engine.Linker.queuedClasses[completed.shift()];
		}
		
		if (processed != 0) {
			// Something was processed, reset the fail timer
			clearTimeout(R.engine.Linker.failTimer);
			R.engine.Linker.failTimer = setTimeout(function() {
				R.engine.Linker._failure();
			}, 10000);
		}
		
		var newClzz = 0;
		for (var j in R.engine.Linker.queuedClasses) {
			newClzz++;
		}
		
		if (newClzz > 0 || inProcess > processed) {
			// There are classes waiting for their dependencies, do this again
			R.engine.Linker.classTimer = setTimeout(function(){
		  		R.engine.Linker._processClasses();
		  	}, 100);				
		} else if (inProcess == processed) {
			// Clear the fail timer
			clearTimeout(R.engine.Linker.failTimer);

			// All classes waiting to be processed have been processed
			R.engine.Linker.classTimer = null;
		}
	},
	
	/**
	 * Initializes classes which have their dependencies resolved
	 * @private
	 */
	_initClass: function(className) {
      if (R.engine.Linker.resolvedClasses[className]) {
         // This is all set, no need to run through this again
         return;
      }

		// Get the class object
		var pkg = R.global, clazz = className.split(".");
		while (clazz.length > 1) {
			pkg = pkg[clazz.shift()];
		}
		var shortName = clazz.shift(), classObjDef = pkg[shortName];
		
		// We can initialize the class
		if ($.isFunction(classObjDef)) {
			pkg[shortName] = classObjDef();
		} else {
			pkg[shortName] = classObjDef;
		}

		// If the class defines a "resolved()" class method, call that
		if ((typeof pkg[shortName] !== "undefined") && pkg[shortName].resolved) {
			pkg[shortName].resolved();
		}

		R.debug.Console.info("R.engine.Linker => " + className + " initialized");
		R.engine.Linker.resolvedClasses[className] = true;
	},
	
	/**
	 * Called if the linker has failed to load any classes and seems to be
	 * stuck waiting for resolution.
	 * @private
	 */
	_failure: function() {
		clearTimeout(R.engine.Linker.failTimer);
		clearTimeout(R.engine.Linker.classTimer);	
		clearTimeout(R.engine.Linker.classLoader);	
		
		R.debug.Console.error("R.engine.Linker => FAILURE TO LOAD CLASSES!", "Resolved: ", R.engine.Linker.resolvedClasses, " Unprocessed: ", R.engine.Linker.queuedClasses, " ClassDefs: ", R.engine.Linker.classDefinitions);
	}
	
});
/**
 * The Render Engine
 * Engine Class
 *
 * @fileoverview The main engine class
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

/**
 * @class The main engine class which is responsible for keeping the world up to date.
 * Additionally, the Engine will track and display metrics for optimizing a game. Finally,
 * the Engine is responsible for maintaining the local client's <tt>worldTime</tt>.
 * <p/>
 * The engine includes methods to load scripts and stylesheets in a serialized fashion
 * and report on the sound engine status.  Since objects are tracked by the engine, a list
 * of all game objects can be obtained from the engine.  The engine also contains the root
 * rendering context, or "default" context.  For anything to be rendered, or updated by the
 * engine, it will need to be added to a child of the default context.
 * <p/>
 * Other methods allow for starting or shutting down then engine, toggling metric display,
 * setting of the base "frames per second", toggling of the debug mode, and processing of
 * the script and function queue.
 * <p/>
 * Since JavaScript is a single-threaded environment, frames are generated serially.  One
 * frame must complete before another can be rendered.  By default, if frames are missed,
 * the engine will wait until the next logical frame can be rendered.  The engine can also
 * run where it doesn't skip frames, and instead runs a constant frame clock.  This
 * doesn't guarantee that the engine will run at a fixed frame rate.
 *
 * @static
 */
R.Engine = Base.extend(/** @scope R.Engine.prototype */{
   version: "v2.0.0.10 beta",
   HOME_URL: "http://www.renderengine.com",
   REF_NAME: "The Render Engine",

   constructor: null,

   // Global engine options
   options: {},

   /*
    * Engine objects
    */
   idRef: 0,                  // Object reference Id
   gameObjects: {},           // Live objects cache
   timerPool: {},             // Pool of running timers
   livingObjects: 0,          // Count of live objects

   /*
    * Engine info
    */
   fpsClock: 16,              // The clock rate (ms)
   FPS: undefined,            // Calculated frames per second
   frameTime: 0,              // Amount of time taken to render a frame
   engineLocation: null,      // URI of engine
   defaultContext: null,      // The default rendering context
   debugMode: false,          // Global debug flag
   localMode: false,          // Local run flag
   started: false,            // Engine started flag
   running: false,            // Engine running flag
   shuttingDown: false,       // Engine is shutting down
   upTime: 0,                 // The startup time
   downTime: 0,               // The shutdown time
   skipFrames: true,          // Skip missed frames
   totalFrames: 0,
   droppedFrames: 0,
   pclRebuilds: 0,

   /*
    * Sound engine info
    */
   soundsEnabled: false,      // Sound engine enabled flag

   /**
    * The current time of the world on the client.  This time is updated
    * for each frame generated by the Engine.
    * @type {Number}
    * @memberOf R.Engine
    */
   worldTime: 0,              // The world time

   /** @private */
   lastTime: 0,               // The last timestamp the world was drawn

   /**
    * The number of milliseconds the engine has been running.  This time is updated
    * for each frame generated by the Engine.
    * @type {Number}
    * @memberOf R.Engine
    */
   liveTime: 0,               // The "alive" time (worldTime-upTime)

   /** @private */
   shutdownCallbacks: [],      // Methods to call when the engine is shutting down

   $GAME: null,               // Reference to the game object

   // Issue #18 - Intrinsic loading dialog
   loadingCSS: "<style type='text/css'>div.loadbox {width:325px;height:30px;padding:10px;font:10px Arial;border:1px outset gray;-moz-border-radius:10px;-webkit-border-radius:10px} #engine-load-progress { position:relative;border:1px inset gray;width:300px;height:5px} #engine-load-progress .bar {background:silver;}</style>",

   //====================================================================================================
   //====================================================================================================
   //                                      ENGINE PROPERTIES
   //====================================================================================================
   //====================================================================================================

   /**
    * Set/override the engine options.
    * @param opts {Object} Configuration options for the engine
    * @memberOf R.Engine
    * @private
    */
   setOptions: function(opts) {
      // Check for a "defaults" key
      var configOpts;
      if (opts.defaults) {
         configOpts = opts.defaults;
      }

      // See if the OS has a key
      var osOpts, platformDefaults, versionDefaults, platformVersions;
      if (opts["platforms"] && opts["platforms"][R.engine.Support.sysInfo().OS]) {
         // Yep, extract that one
         osOpts = opts["platforms"][R.engine.Support.sysInfo().OS];

         // Check for platform defaults
         if (osOpts && osOpts["defaults"]) {
            platformDefaults = osOpts["defaults"];
         }
      }

      // Check for general version options
      if (opts["versions"]) {
         versionDefaults = {};
         for (var v in opts["versions"]) {
            if (R.engine.Support.sysInfo().version == v) {
               // Add version specific matches
               versionDefaults = $.extend(versionDefaults, opts["versions"][v]);
            }

            if (parseFloat(R.engine.Support.sysInfo().version) >= parseFloat(v)) {
               // Add version match options
               versionDefaults = $.extend(versionDefaults, opts["versions"][v]);
            }
         }
      }

      // Finally, check the OS for version options
      if (osOpts && osOpts["versions"]) {
         platformVersions = {};
         for (var v in osOpts["versions"]) {
            if (R.engine.Support.sysInfo().version == v) {
               // Add  version specific options
               platformVersions = $.extend(platformVersions, osOpts["versions"][v]);
            }

            if (parseFloat(R.engine.Support.sysInfo().version) >= parseFloat(v)) {
               // Add version match options
               platformVersions = $.extend(platformVersions, osOpts["versions"][v]);
            }
         }
      }

      $.extend(R.Engine.options, configOpts, platformDefaults, versionDefaults, platformVersions);
   },

   /**
    * Set the debug mode of the engine.  Engine debugging enables helper objects
    * which visually assist in debugging game objects.  To specify the console debug
    * message output level, see {@link R.debug.Console@setDebuglevel}.
    * <p/>
    * Engine debug helper objects include:
    * <ul>
    * <li>A left/up glyph at the origin of objects using the {@link R.components.Transform2D} component</li>
    * <li>Yellow outline in the shape of the collision hull of {@link R.engine.Object2D}, if assigned</li>
    * <li>Yellow outline around objects using box or circle collider components</li>
    * <li>Green outline around objects which are rendered with the {@link R.components.Billboard2D} component</li>
    * <li>Blue outline around box and circle rigid body objects</li>
    * <li>Red lines from anchor points in jointed {@link R.objects.PhysicsActor} objects</li>
    * </ul>
    *
    * @param mode {Boolean} <tt>true</tt> to enable debug mode
    * @memberOf R.Engine
    */
   setDebugMode: function(mode) {
      R.Engine.debugMode = mode;
   },

   /**
    * Query the debugging mode of the engine.
    *
    * @return {Boolean} <tt>true</tt> if the engine is in debug mode
    * @memberOf R.Engine
    */
   getDebugMode: function() {
      return R.Engine.debugMode;
   },

   /**
    * Returns <tt>true</tt> if SoundManager2 is loaded and initialized
    * properly.  The resource loader and play manager will use this
    * value to execute properly.
    * @return {Boolean} <tt>true</tt> if the sound engine was loaded properly
    * @memberOf R.Engine
    */
   isSoundEnabled: function() {
      return R.Engine.soundsEnabled;
   },

   /**
    * Set the FPS (frames per second) the engine runs at.  This value
    * is mainly a suggestion to the engine as to how fast you want to
    * redraw frames.  If frame execution time is long, frames will be
    * processed as time is available. See the metrics to understand
    * available time versus render time.
    *
    * @param fps {Number} The number of frames per second to refresh
    *                     Engine objects.
    * @memberOf R.Engine
    */
   setFPS: function(fps) {
      Assert((fps != 0), "You cannot have a framerate of zero!");
      R.Engine.fpsClock = Math.floor(1000 / fps);
      R.Engine.FPS = undefined;
   },

   /**
    * Get the FPS (frames per second) the engine is set to run at.
    * @return {Number}
    * @memberOf R.Engine
    */
   getFPS: function() {
      if (!R.Engine.FPS) {
         R.Engine.FPS = Math.floor((1 / R.Engine.fpsClock) * 1000);
      }
      return R.Engine.FPS;
   },

   /**
    * Get the actual FPS (frames per second) the engine is running at.
    * This value will vary as load increases or decreases due to the
    * number of objects being rendered.  A faster machine will be able
    * to handle a higher FPS setting.
    * @return {Number}
    * @memberOf R.Engine
    */
   getActualFPS: function() {
      return Math.floor((1 / R.Engine.frameTime) * 1000);
   },

   /**
    * Get the amount of time allocated to draw a single frame.
    * @return {Number} Milliseconds allocated to draw a frame
    * @memberOf R.Engine
    */
   getFrameTime: function() {
      return R.Engine.fpsClock;
   },

   /**
    * Get the amount of time it took to draw the last frame.  This value
    * varies per frame drawn, based on visible objects, number of operations
    * performed, and other factors.  The draw time can be used to optimize
    * your game for performance.
    * @return {Number} Milliseconds required to draw the frame
    * @memberOf R.Engine
    */
   getDrawTime: function() {
      return R.Engine.frameTime;
   },

   /**
    * Get the load the currently rendered frame is putting on the engine.
    * The load represents the amount of
    * work the engine is doing to render a frame.  A value less
    * than one indicates the the engine can render a frame within
    * the amount of time available.  Higher than one indicates the
    * engine cannot render the frame in the time available.
    * <p/>
    * Faster machines will be able to handle more load.  You can use
    * this value to gauge how well your game is performing.
    * @return {Number}
    * @memberOf R.Engine
    */
   getEngineLoad: function () {
      return (R.Engine.frameTime / R.Engine.fpsClock);
   },

   /**
    * Get the default rendering context for the Engine.  This
    * is the <tt>document.body</tt> element in the browser.
    *
    * @return {RenderContext} The default rendering context
    * @memberOf R.Engine
    */
   getDefaultContext: function() {
      if (R.Engine.defaultContext == null) {
         R.Engine.defaultContext = R.rendercontexts.DocumentContext.create();
      }

      return R.Engine.defaultContext;
   },

   /**
    * Override the engine's default context.  The engine will use
    * the {@link R.rendercontexts.DocumentContext} as the default context,
    * unless otherwise specified.
    * @param defaultContext {R.rendercontexts.AbstracRenderContext} The context to use as the start of the
    *      scene graph.
    * @memberOf R.Engine
    */
   setDefaultContext: function(defaultContext) {
      Assert(defaultContext instanceof R.rendercontexts.AbstractRenderContext, "Setting default engine context to object which is not a render context!");
      R.Engine.defaultContext = defaultContext;
   },

   /**
    * Get the game object that has been loaded by the engine.  The game object isn't valid until the game is loaded.
    * @return {R.engine.Game}
    */
   getGame: function() {
      return R.Engine.$GAME;
   },

   /**
    * Get the path to the engine.  Uses the location of the <tt>/runtime/engine.js</tt>
    * file that was initially loaded to determine the URL where the engine is running from.
    * When files are included, or classes are loaded, they are loaded relative to the engine's
    * location on the server.
    *
    * @return {String} The path/URL where the engine is located
    * @memberOf R.Engine
    */
   getEnginePath: function() {
      if (R.Engine.engineLocation == null) {
         // Determine the path of the "engine.js" file
         var head = document.getElementsByTagName("head")[0];
         var scripts = head.getElementsByTagName("script");
         for (var x = 0; x < scripts.length; x++) {
            var src = scripts[x].src;
            var m = src.match(/(.*\/engine)\/runtime\/engine\.js/);
            if (src != null && m) {
               // Get the path
               R.Engine.engineLocation = m[1];
               break;
            }
         }
      }

      return R.Engine.engineLocation;
   },

   //====================================================================================================
   //====================================================================================================
   //                                  GLOBAL OBJECT MANAGEMENT
   //====================================================================================================
   //====================================================================================================

   /**
    * Create an instance of an object within the Engine and get a unique Id for it.
    * This is called by any object that extends from {@link R.engine.PooledObject}.
    *
    * @param obj {R.engine.PooledObject} An object within the engine
    * @return {String} The global Id of the object
    * @memberOf R.Engine
    */
   create: function(obj) {
      if (R.Engine.shuttingDown === true) {
         R.debug.Console.warn("Engine shutting down, '" + obj + "' destroyed because it would create an orphaned reference");
         obj.destroy();
         return null;
      }

      Assert((R.Engine.started === true), "Creating an object when the engine is stopped!", obj);

      R.Engine.idRef++;
      var objId = obj.getName() + R.Engine.idRef;
      R.debug.Console.log("CREATED Object ", objId, "[", obj, "]");
      R.Engine.livingObjects++;

      return objId;
   },

   /**
    * Destroys an object instance within the Engine.
    *
    * @param obj {R.engine.PooledObject} The object, managed by the engine, to destroy
    * @memberOf R.Engine
    */
   destroy: function(obj) {
      if (obj == null) {
         R.debug.Console.warn("NULL reference passed to Engine.destroy()!  Ignored.");
         return;
      }

      var objId = obj.getId();
      R.debug.Console.log("DESTROYED Object ", objId, "[", obj, "]");
      R.Engine.livingObjects--;
   },

   /**
    * Add a timer to the pool so it can be cleaned up when
    * the engine is shutdown, or paused when the engine is
    * paused.
    * @param timerName {String} The timer name
    * @param timer {R.lang.Timer} The timer to add
    * @memberOf R.Engine
    */
   addTimer: function(timerName, timer) {
      R.Engine.timerPool[timerName] = timer;
   },

   /**
    * Remove a timer from the pool when it is destroyed.
    * @param timerName {String} The timer name
    * @memberOf R.Engine
    */
   removeTimer: function(timerName) {
      R.Engine.timerPool[timerName] = null;
      delete R.Engine.timerPool[timerName];
   },

   /**
    * Get an object by the Id that was assigned during the call to {@link #create}.
    * Only objects that are contained within other objects will be found.  Discreetly
    * referenced objects cannot be located by Id.
    *
    * @param id {String} The Id of the object to locate
    * @return {R.engine.PooledObject} The object
    * @memberOf R.Engine
    */
   getObject: function(id) {
      function search(container) {
         var itr = container.iterator();
         while (itr.hasNext()) {
            var obj = itr.next();
            if (obj.getId && (obj.getId() === id)) {
               itr.destroy();
               return obj;
            }
            if (obj instanceof R.struct.Container) {
               // If the object is a container, search inside of it
               return search(obj);
            }
         }
         itr.destroy();
         return null;
      }

      // Start at the engine's default context
      return search(R.Engine.getDefaultContext());
   },

   //====================================================================================================
   //====================================================================================================
   //                                    ENGINE PROCESS CONTROL
   //====================================================================================================
   //====================================================================================================

   /**
    * Load the minimal scripts required for the engine to start.
    * @private
    * @memberOf R.Engine
    */
   loadEngineScripts: function() {
      // Engine stylesheet
      R.engine.Script.loadStylesheet("/css/engine.css");

      // The basics needed by the engine to get started
      R.engine.Linker._doLoad("R.engine.Game");
      R.engine.Linker._doLoad("R.engine.PooledObject");
      R.engine.Linker._doLoad("R.lang.Iterator");
      R.engine.Linker._doLoad("R.rendercontexts.AbstractRenderContext");
      R.engine.Linker._doLoad("R.rendercontexts.RenderContext2D");
      R.engine.Linker._doLoad("R.rendercontexts.HTMLElementContext");
      R.engine.Linker._doLoad("R.rendercontexts.DocumentContext");

      // Load the timers so that we don't require developers to do it
      R.engine.Linker._doLoad("R.lang.AbstractTimer");
      R.engine.Linker._doLoad("R.lang.IntervalTimer");
      R.engine.Linker._doLoad("R.lang.MultiTimeout");
      R.engine.Linker._doLoad("R.lang.OneShotTimeout");
      R.engine.Linker._doLoad("R.lang.OneShotTrigger");
      R.engine.Linker._doLoad("R.lang.Timeout");
   },

   /**
    * Starts the engine and loads the basic engine scripts.  When all scripts required
    * by the engine have been loaded the {@link #run} method will be called.
    *
    * @param debugMode {Boolean} <tt>true</tt> to set the engine into debug mode
    *                            which allows the output of messages to the console.
    * @memberOf R.Engine
    */
   startup: function(debugMode) {
      Assert((R.Engine.running == false), "An attempt was made to restart the engine!");

      // Check for supported browser
      if (!R.Engine.browserSupportCheck()) {
         return false;
      }

      R.Engine.upTime = R.now();
      //R.Engine.debugMode = debugMode ? true : false;
      R.Engine.started = true;
      R.Engine.totalFrames = 0;

      // Load the required scripts
      R.Engine.loadEngineScripts();
      return true;
   },

   /**
    * Starts or resumes the engine.  This will be called after all scripts have been loaded.
    * You will also need to call this if you {@link #pause} the engine.  Any paused timers
    * will also be resumed.
    * @memberOf R.Engine
    */
   run: function() {
      if (R.Engine.shuttingDown || R.Engine.running) {
         return;
      }

      // Restart all of the timers
      for (var tm in R.Engine.timerPool) {
         R.Engine.timerPool[tm].restart();
      }

      var mode = "[";
      mode += (R.Engine.debugMode ? "DEBUG" : "");
      mode += (R.Engine.localMode ? (mode.length > 0 ? " LOCAL" : "LOCAL") : "");
      mode += "]";
      R.debug.Console.warn(">>> Engine started. " + (mode != "[]" ? mode : ""));
      R.Engine.running = true;
      R.Engine.shuttingDown = false;

      R.debug.Console.debug(">>> sysinfo: ", R.engine.Support.sysInfo());

      R.Engine._pauseTime = R.now();
      R.Engine._stepOne = 0;
      R.Engine.lastTime = R.now() - R.Engine.fpsClock;

      // Start world timer
      R.Engine.engineTimer();
   },

   /**
    * Steps the engine when paused.  Any timers that were paused, stay paused while stepping.
    * @memberOf R.Engine
    */
   step: function() {
      if (R.Engine.running) {
         // Need to pause the engine to step
         return;
      }

      R.Engine._stepOne = 1;
      R.Engine.engineTimer();
   },

   /**
    * Pauses the engine and any running timers.
    * @memberOf R.Engine
    */
   pause: function() {
      if (R.Engine.shuttingDown) {
         return;
      }

      // Pause all of the timers
      R.debug.Console.debug("Pausing all timers");
      for (var tm in R.Engine.timerPool) {
         R.Engine.timerPool[tm].pause();
      }

      R.debug.Console.warn(">>> Engine paused <<<");
      window.clearTimeout(R.Engine.globalTimer);
      R.Engine.running = false;
      R.Engine._pauseTime = R.now();
   },

   /**
    * Add a method to be called when the engine is being shutdown.  Use this
    * method to allow an object, which is not referenced by the engine, to
    * perform cleanup actions.
    *
    * @param fn {Function} The callback function
    * @memberOf R.Engine
    */
   onShutdown: function(fn) {
      if (R.Engine.shuttingDown === true) {
         return;
      }

      R.Engine.shutdownCallbacks.push(fn);
   },

   /**
    * Shutdown the engine.  Stops the global timer and cleans up (destroys) all
    * objects that have been created and added to the engine, starting at the default
    * engine context.
    * @memberOf R.Engine
    */
   shutdown: function() {
      if (R.Engine.shuttingDown) {
         // Prevent another shutdown
         return;
      }

      R.Engine.shuttingDown = true;

      if (!R.Engine.running && R.Engine.started) {
         // If the engine is not currently running (i.e. paused) 
         // restart it and then re-perform the shutdown
         R.Engine.running = true;
         setTimeout(function() {
            R.Engine.shutdown();
         }, (R.Engine.fpsClock * 2));
         return;
      }

      R.Engine.started = false;
      R.debug.Console.warn(">>> Engine shutting down...");

      // Stop world timer
      R.global.clearTimeout(R.Engine.globalTimer);

      // Run through shutdown callbacks to allow unreferenced objects
      // to clean up references, etc.
      while (R.Engine.shutdownCallbacks.length > 0) {
         R.Engine.shutdownCallbacks.shift()();
      }
      ;

      if (R.Engine.metricDisplay) {
         R.Engine.metricDisplay.remove();
         R.Engine.metricDisplay = null;
      }

      // Cancel all of the timers
      R.debug.Console.debug(">>> Cancelling all timers");
      for (var tm in R.Engine.timerPool) {
         R.Engine.timerPool[tm].cancel();
      }
      R.Engine.timerPool = {};

      R.Engine.downTime = R.now();
      R.debug.Console.warn(">>> Engine stopped.  Runtime: " + (R.Engine.downTime - R.Engine.upTime) + "ms");
      R.debug.Console.warn(">>>   frames generated: ", R.Engine.totalFrames);

      R.Engine.running = false;

      // Kill off the default context and anything
      // that's attached to it.  We'll alert the
      // developer if there's an issue with orphaned objects
      R.Engine.getDefaultContext().destroy();

      // Dump the object pool
      R.engine.PooledObject.objectPool = null;

      AssertWarn((R.Engine.livingObjects == 0), "Object references were not cleaned up!");

      R.Engine.loadedScripts = {};
      R.Engine.scriptLoadCount = 0;
      R.Engine.scriptsProcessed = 0;
      R.Engine.defaultContext = null;

      // Shutdown complete
      R.Engine.shuttingDown = false;
   },

   /**
    * See {@link #define} instead.
    * @deprecated
    * @memberOf R.Engine
    */
   initObject: function(objectName, primaryDependency, fn) {
      throw new Error("Unsupported - See R.Engine.define() instead");
   },

   /**
    * Defines a new class.  The format of the object definition is:
    * <pre>
    * R.Engine.define({
    *    "class": "[class name]",
    *    "requires": [
    *       "R.[package name].[dependency]"
    *    ],
    *    "depends": [
    *       "[dependency]"
    *    ],
    *    "includes": [
    *       "/path/to/file.js"
    *    ]
    * });
    * </pre>
    * Each class must define its class name via the "class" key.  This is the name that
    * other classes will use to locate the class object.  The <tt>"requires"</tt> key defines the
    * classes within the engine that the class is dependent upon.  Anything that falls into
    * the <tt>"R."</tt> namespace should be declared as a requirement here. The "requires" key
    * performs class loading for these objects automatically.  In other words, you do not need
    * to load classes which start with <tt>"R."</tt>.
    * <p/>
    * If your class has dependencies on classes <i>not defined in the <tt>"R"</tt> namespace</i>,
    * they should be declared via the <tt>"depends"</tt> array.  These are classes which your game
    * classes need to load via {@link R.engine.Game#load} calls.  For files which just need to be
    * loaded, use the <tt>"include"</tt> key to tell the engine where the file is.
    * <p/>
    * Until all requirements, dependencies, and included files have been loaded and/or initialized,
    * a class will, itself, not be initialized. Be aware of class dependencies so you do not create
    * circular dependencies.  First-level circular dependencies are okay, such as <tt>A</tt> requires
    * <tt>B</tt>, while <tt>B</tt> requires <tt>A</tt>.  But second, third, and so on circular
    * dependencies will cause your classes to remain unresolved. The engine will not start the game,
    * and an erro message will be sent to the console listing classes which were resolved and those
    * which are unresolved.
    * <p/>
    * The <tt>"requires"</tt>, <tt>"includes"</tt> and <tt>"depends"</tt> keys are optional.  You
    * can either omit them entirely, set them to <code>null</code>, or assign an empty array to them.
    * <p/>
    * The <tt>"depends"</tt> key is the only way your game classes can establish class dependencies
    * which are <i>not in the <tt>"R."</tt> namespace</i>.  Classes specified via the
    * <tt>"depends"</tt> key are not loaded via the engine class loader like <tt>"requires"</tt>
    * does.  Instead, your game will need to load the classes.  For example:
    * <pre>
    * R.Engine.define({
    *    "class": "Foo",
    *    "requires": [
    *       "R.rendercontexts.CanvasContext"
    *    ],
    *    "depends": [
    *       "Bar"
    *    ]
    * });
    *
    * // Load the Bar class
    * R.engine.Game.load("bar.js");
    * </pre>
    * After receiving the definition, the engine will load <tt>R.rendercontexts.CanvasContext</tt>
    * for <tt>Foo</tt>. The call to <code>R.engine.Game.load("bar.js")</code> would load the
    * <tt>Bar</tt> class.  When the context and <tt>Bar</tt> have loaded and initialized, <tt>Foo</tt>
    * can be initialized which will enable any classes dependent on <tt>Foo</tt> to be initialized.
    *
    * @param classDef {Object} The object's definition
    * @memberOf R.Engine
    */
   define: function(classDef) {
      R.engine.Linker.define(classDef);
   },

   /**
    * Check the current browser to see if it is supported by the
    * engine.  If it isn't, there's no reason to load the remainder of
    * the engine.  This check can be disabled with the <tt>disableBrowserCheck</tt>
    * query parameter set to <tt>true</tt>.
    * <p/>
    * If the browser isn't supported, the engine is shutdown and a message is
    * displayed.
    * @memberOf R.Engine
    * @private
    */
   browserSupportCheck: function() {
      if (R.engine.Support.checkBooleanParam("disableBrowserCheck")) {
         return true;
      }
      var sInfo = R.engine.Support.sysInfo();
      var msg = "This browser is not currently supported by <i>" + R.Engine.REF_NAME + "</i>.<br/><br/>";
      msg += "Please go <a href='" + R.Engine.HOME_URL + "' target='_blank'>here</a> for more information.";
      switch (sInfo.browser) {
         case "iPhone":
         case "android":
         case "msie":
         case "chrome":
         case "Wii":
         case "safari":
         case "safarimobile":
         case "mozilla":
         case "firefox":
         case "opera":
            return true;
         default:
            R.debug.Console.warn("Unsupported Browser");
            $("body", document).empty().append($("<div style='font:12pt Arial,sans-serif;'>").html(msg));
            return false;
      }
   },

   /**
    * Prints the version of the engine.
    * @memberOf R.Engine
    */
   toString: function() {
      return "The Render Engine " + R.Engine.version;
   },

   //====================================================================================================
   //====================================================================================================
   //                                        THE WORLD TIMER
   //====================================================================================================
   //====================================================================================================

   /**
    * This is the process which updates the world.  It starts with the default
    * context, telling it to update itself.  Since each context is a container,
    * all of the objects in the container will be called to update, and then
    * render themselves.
    *
    * @private
    * @memberOf R.Engine
    */
   engineTimer: function() {
      if (R.Engine.shuttingDown) {
         return;
      }

      if (!R.Engine.running && R.Engine._stepOne == 0) {
         // Not stepping, done here
         return;
      }

      var nextFrame = R.Engine.fpsClock;

      // Update the world
      if ((R.Engine._stepOne == 1 || R.Engine.running) && R.Engine.getDefaultContext() != null) {
         R.Engine.vObj = 0;
         R.Engine.rObjs = 0;
         //R.Engine.pclRebuilds = 0;

         // Render a frame
         R.Engine.worldTime = R.Engine._stepOne == 1 ? R.Engine._pauseTime : R.now();
         R.Engine.lastTime = R.Engine._stepOne == 1 ? R.Engine.worldTime - R.Engine.fpsClock : R.Engine.lastTime;

         // Pass parent context, world time, delta time
         R.Engine.getDefaultContext().update(null, R.Engine.worldTime, R.Engine.worldTime - R.Engine.lastTime);
         R.Engine.lastTime = R.Engine.worldTime;
         R.Engine.frameTime = R.now() - R.Engine.worldTime;

         if (R.Engine._stepOne == 1) {
            R.Engine._pauseTime += R.Engine.frameTime;
         }

         R.Engine.liveTime = R.Engine.worldTime - R.Engine.upTime;

         // Count the number of frames generated
         R.Engine.totalFrames++;

         // Determine when the next frame should draw
         // If we've gone over the allotted time, wait until the next available frame
         var f = nextFrame - R.Engine.frameTime;
         nextFrame = (R.Engine.skipFrames ? (f > 0 ? f : nextFrame) : R.Engine.fpsClock);
         R.Engine.droppedFrames += (f <= 0 ? Math.round((f * -1) / R.Engine.fpsClock) : 0);

         // Update the metrics display
         R.Engine.doMetrics();
      }

      if (R.Engine._stepOne == 1) {
         // If stepping, don't re-call the engine timer automatically
         R.Engine._stepOne = 0;
         return;
      }

      // When the process is done, start all over again
      if (R.Engine.options.nativeAnimationFrame) {
         R.global.nativeFrame(R.Engine.engineTimer /*, R.Engine.getDefaultContext().getSurface()*/);
      } else {
         R.Engine.globalTimer = setTimeout(function _engineTimer() {
            R.Engine.engineTimer();
         }, nextFrame);
      }
   },

   /**
    * @private
    */
   doMetrics: function() {
      if (R.debug && R.debug.Metrics) {
         R.debug.Metrics.doMetrics();
      }
   },

   // ======================================================
   // References to R.engine.Script methods
   // ======================================================

   /**
    * Include a script file.
    *
    * @param scriptURL {String} The URL of the script file
    * @memberOf R.Engine
    */
   include: function(scriptURL) {
      R.engine.Script.include(scriptURL);
   },

   /**
    * Loads a game's script.  This will wait until the specified
    * <tt>gameObjectName</tt> is available before running it.  Doing so will
    * ensure that all dependencies have been resolved before starting a game.
    * Also creates the default rendering context for the engine.
    * <p/>
    * All games should execute this method to start their processing, rather than
    * using the script loading mechanism for engine or game scripts.  This is used
    * for the main game script only.  Normally it would appear in the game's "index" file.
    * <pre>
    *  &lt;script type="text/javascript"&gt;
    *     // Load the game script
    *     Engine.loadGame('game.js','Spaceroids');
    *  &lt;/script&gt;
    * </pre>
    *
    * @param gameSource {String} The URL of the game script.
    * @param gameObjectName {String} The string name of the game object to execute.  When
    *                       the framework if ready, the <tt>startup()</tt> method of this
    *                       object will be called.
    * @param [gameDisplayName] {String} An optional string to display in the loading dialog
    * @memberOf R.Engine
    */
   loadGame: function(gameSource, gameObjectName, gameDisplayName) {
      R.engine.Script.loadGame(gameSource, gameObjectName, gameDisplayName);
   }

}, { // Interface
   /** @private */
   globalTimer: null
});

/**
 * The Render Engine
 * 
 * An extension to the engine for script loading and processing.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author$
 * @version: $Revision$
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

//====================================================================================================
//====================================================================================================
//                                     SCRIPT PROCESSING
//====================================================================================================
//====================================================================================================
/**
 * @class A static class which is used to load new JavaScript into the browser.  Methods are
 * 		 also provided to use AJAX to get text and JSON data on-the-fly, load stylesheets,
 * 		 and process script callbacks from a loader queue.
 * @static
 */
R.engine.Script = Base.extend(/** @scope R.engine.Script.prototype */{

   constructor: null,

   /*
    * Script queue
    */
   scriptQueue: [],
   loadedScripts: {},         // Cache of loaded scripts
   scriptLoadCount: 0,        // Number of queued scripts to load
   scriptsProcessed: 0,       // Number of scripts processed
   scriptRatio: 0,            // Ratio between processed/queued
   queuePaused:false,         // Script queue paused flag
   pauseReps: 0,              // Queue run repetitions while paused
   gameOptionsLoaded: false,  // Whether the game options have loaded yet
   gameOptionsObject: {},     // Options object for the game

   callbacks: {},					// Script callbacks
   
   /**
    * Status message when a script is not found
    * @memberOf R.engine.Script
    * @type {Boolean}
    */
   SCRIPT_NOT_FOUND: false,
   
   /**
    * Status message when a script is successfully loaded
    * @memberOf R.engine.Script
    * @type {Boolean}
    */
   SCRIPT_LOADED: true,

   /**
    * Include a script file.
    *
    * @param scriptURL {String} The URL of the script file
    * @memberOf R.engine.Script
    */
   include: function(scriptURL) {
      R.engine.Script.loadNow(scriptURL);
   },

   /**
    * Perform an immediate load on the specified script.  Objects within
    * the script may not immediately initialize, unless their dependencies
    * have been resolved.
    * 
    * @param {String} scriptPath The path to the script to load
    * @param {Function} [cb] The function to call when the script is loaded.
    *                   the path of the script loaded and a status message
    *                   will be passed as the two parameters.
    * @memberOf R.engine.Script
    * @private
    */
   loadNow: function(scriptPath, cb) {
      R.engine.Script.doLoad(R.Engine.getEnginePath() + scriptPath, scriptPath, cb);
   },
   
   /**
    * Queue a script to load from the server and append it to
    * the head element of the browser.  Script names are
    * cached so they will not be loaded again.  Each script in the
    * queue is processed synchronously.
    *
    * @param scriptPath {String} The URL of a script to load.
    * @memberOf R.engine.Script
    */
   loadScript: function(scriptPath) {
      // Put script into load queue
      R.engine.Script.scriptQueue.push(scriptPath);
      R.engine.Script.runScriptQueue();
   },

	/**
	 * Low-level method to call jQuery to use AJAX to load
	 * a file asynchronously.  If a failure (such as a 404) occurs,
	 * it shouldn't fail silently.
	 * 
	 * @param path {String} The url to load
	 * @param data {Object} Optional arguments to pass to server
	 * @param callback {Function} The callback method
	 * @memberOf R.engine.Script
	 */
	ajaxLoad: function(path, data, callback) {
      /* pragma:DEBUG_START */
      // If we're in debug mode, force the browser to grab the latest
      if (R.Engine.getDebugMode()) {
         path += (path.indexOf("?") == -1 ? "?" : "&") + "_debug=" + R.now();
      }
      /* pragma:DEBUG_END */

		// Use our own internal method to load a file with the JSON
		// data.  This way, we don't fail silently when loading a file
		// that doesn't exist.
		var xhr = new XMLHttpRequest();
		xhr.open("GET", path, true);
		xhr.onreadystatechange = function(evt) {
			if (xhr.readyState == 4) {
				callback(xhr, xhr.status);
			}
		};
		var rData = null;
		if (data) {
			rData = "";
			for (var i in data) {
				rData += (rData.length == 0 ? "?" : "&") + i + "=" + encodeURIComponent(data[i]);
			}
		}
		xhr.send(rData);
	},
	
	/**
	 * Load text from the specified path.
	 *
	 * @param path {String} The url to load
	 * @param data {Object} Optional arguments to pass to server
	 * @param callback {Function} The callback method which is passed the
	 *		text and status code (a number) of the request.
	 * @memberOf R.engine.Script
	 */	 
	loadText: function(path, data, callback) {
		if (typeof data == "function") {
			callback = data;
			data = null;
		}
		R.engine.Script.ajaxLoad(path, data, function(xhr, result) {
         callback(xhr.responseText, xhr.status);
		});
	},
	
	/**
	 * Load text from the specified path and parse it as JSON.
	 *
	 * @param path {String} The url to load
	 * @param data {Object} Optional arguments to pass to server
	 * @param callback {Function} The callback method which is passed the
	 *		JSON object and status code (a number) of the request.
	 * @memberOf R.engine.Script
	 */	 
	loadJSON: function(path, data, callback) {
		if (typeof data == "function") {
			callback = data;
			data = null;
		}
		R.engine.Script.ajaxLoad(path, data, function(xhr, result) {
			var json = null;
         if (result != 404) {
            try {
               // Remove comments
               json = R.engine.Support.parseJSON(xhr.responseText);
            } catch (ex) {
               R.debug.Console.error("Error parsing JSON at '" + path + "'");
            }
         }
			callback(json, xhr.status);
		});
	},

   /**
    * Internal method which runs the script queue to handle scripts and functions
    * which are queued to run sequentially.
    * @private
    * @memberOf R.engine.Script
    */
   runScriptQueue: function() {
      if (!R.engine.Script.scriptQueueTimer) {
         // Process any waiting scripts
         R.engine.Script.scriptQueueTimer = setInterval(function() {
            if (R.engine.Script.queuePaused) {
               if (R.engine.Script.pauseReps++ > 500) {
                  // If after ~5 seconds the queue is still paused, unpause it and
                  // warn the user that the situation occurred
                  R.debug.Console.error("Script queue was paused for 5 seconds and not resumed -- restarting...");
                  R.engine.Script.pauseReps = 0;
                  R.engine.Script.pauseQueue(false);
               }
               return;
            }

            R.engine.Script.pauseReps = 0;

            if (R.engine.Script.scriptQueue.length > 0) {
               R.engine.Script.processScriptQueue();
            } else {
               // Stop the queue timer if there are no scripts
               clearInterval(R.engine.Script.scriptQueueTimer);
               R.engine.Script.scriptQueueTimer = null;
            }
         }, 10);

         R.engine.Script.readyForNextScript = true;
      }
   },

   /**
    * Put a callback into the script queue so that when a
    * certain number of files has been loaded, we can call
    * a method.  Allows for functionality to start with
    * incremental loading.
    *
    * @param cb {Function} A callback to execute
    * @memberOf R.engine.Script
    */
   setQueueCallback: function(cb) {
      // Put callback into load queue
      R.engine.Script.scriptQueue.push(cb);
      R.engine.Script.runScriptQueue();
   },

   /**
    * You can pause the queue from a callback function, then
    * unpause it to continue processing queued scripts.  This will
    * allow you to wait for an event to occur before continuing to
    * to load scripts.
    *
    * @param state {Boolean} <tt>true</tt> to put the queue processor
    *                        in a paused state.
    * @memberOf R.engine.Script
    */
   pauseQueue: function(state) {
      R.engine.Script.queuePaused = state;
   },

   /**
    * Process any scripts that are waiting to be loaded.
    * @private
    * @memberOf R.engine.Script
    */
   processScriptQueue: function() {
      if (R.engine.Script.scriptQueue.length > 0 && R.engine.Script.readyForNextScript) {
         // Hold the queue until the script is loaded
         R.engine.Script.readyForNextScript = false;

         // Get next script...
         var scriptPath = R.engine.Script.scriptQueue.shift();

         // If the queue element is a function, execute it and return
         if (typeof scriptPath === "function") {
            scriptPath();
            R.engine.Script.readyForNextScript = true;
            return;
         }

         R.engine.Script.doLoad(scriptPath);
      }
   },

   /**
    * This method performs the actual script loading.
    * @private
    * @memberOf R.engine.Script
    */
   doLoad: function(scriptPath, simplePath, cb) {
      if (!R.Engine.started) {
         return;
      }

      var s = scriptPath.replace(/[\/\.]/g,"_");
      if (R.engine.Script.loadedScripts[s] == null)
      {
         // Store the request in the cache
         R.engine.Script.loadedScripts[s] = scriptPath;

         R.engine.Script.scriptLoadCount++;
         R.engine.Script.updateProgress();
         
         // If there's a callback for the script, store it
         if (cb) {
         	R.debug.Console.log("Push callback for ", simplePath);
	         R.engine.Script.callbacks[simplePath] = cb;
	      }

         /* pragma:DEBUG_START */
         // If we're in debug mode, force the browser to grab the latest
         if (R.Engine.getDebugMode()) {
            scriptPath += (scriptPath.indexOf("?") == -1 ? "?" : "&") + "_debug=" + R.now();
         }
         /* pragma:DEBUG_END */

         if ($.browser.Wii) {

            $.get(scriptPath, function(data) {

               // Parse script code for syntax errors
               if (R.engine.Linker.parseSyntax(data)) {
                  var n = document.createElement("script");
                  n.type = "text/javascript";
                  $(n).text(data);

                  var h = document.getElementsByTagName("head")[0];
                  h.appendChild(n);
                  R.engine.Script.readyForNextScript = true;
                  
                  R.engine.Script.scriptLoadCount--;
                  R.engine.Script.updateProgress();
                  R.debug.Console.debug("Loaded '" + scriptPath + "'");
               }
               
            }, "text");
         }  else {

            // We'll use our own script loader so we can detect errors (i.e. missing files).
            var n = document.createElement("script");
            n.src = scriptPath;
            n.type = "text/javascript";

            // When the file is loaded
            var fn = function() {
               if (!this.readyState || 
						  this.readyState == "loaded" || 
						  this.readyState == "complete") {

						var sNode = arguments.callee.node;
						var sPath = arguments.callee.fullPath;

						// If there was a callback, get it
						var callBack = R.engine.Script.callbacks[arguments.callee.simpPath];

                  R.debug.Console.debug("Loaded '" + sPath + "'");
                  R.engine.Script.handleScriptDone();
                  if ($.isFunction(callBack)) {
                  	R.debug.Console.info("Callback for '" + sPath + "'");
                     callBack(simplePath, R.engine.Script.SCRIPT_LOADED);
                     
                     // Delete the callback
                     delete R.engine.Script.callbacks[arguments.callee.simpPath];
                  }
                  
                  if (!R.Engine.localMode) {
                     // Delete the script node
                     $(sNode).remove(); 
                  }
               }
               R.engine.Script.readyForNextScript = true;
            };
				fn.node = n;
				fn.fullPath = scriptPath;
				fn.simpPath = simplePath;

            // When an error occurs
            var eFn = function(msg) {
					var callBack = arguments.callee.cb;
               R.debug.Console.error("File not found: ", scriptPath);
               if (callBack) {
                  callBack(simplePath, R.engine.Script.SCRIPT_NOT_FOUND);
               }
               R.engine.Script.readyForNextScript = true;
            };
				eFn.cb = cb;

            if ($.browser.msie) {
               n.defer = true;
               n.onreadystatechange = fn;
               n.onerror = eFn;
            } else {
               n.onload = fn;
               n.onerror = eFn;
            }

            var h = document.getElementsByTagName("head")[0];
            h.appendChild(n);
         }

      } else {
         // Already have this script
         R.engine.Script.readyForNextScript = true;
      }
   },

   /**
    * Loads a game's script.  This will wait until the specified
    * <tt>gameObjectName</tt> is available before running it.  Doing so will
    * ensure that all dependencies have been resolved before starting a game.
    * Also creates the default rendering context for the engine.
    * <p/>
    * All games should execute this method to start their processing, rather than
    * using the script loading mechanism for engine or game scripts.  This is used
    * for the main game script only.  Normally it would appear in the game's "index" file.
    * <pre>
    *  &lt;script type="text/javascript"&gt;
    *     // Load the game script
    *     Engine.loadGame('game.js','Spaceroids');
    *  &lt;/script&gt;
    * </pre>
    * <p/>
    * The game can provide configuration files which will be loaded and passed to the
    * game's <tt>setup()</tt> method.  The name of the configuration file is the game
    * as the game's main JavaScript file.  If your JavaScript file is "game.js", the
    * format for the config files are:
    * <ul>
    *    <li><tt>game.config</tt> - General game configuration</li>
    *    <li><tt>game_[browser].config</tt> - Browser specific configuration</li>
    *    <li><tt>game_[browser]_[platform].config</tt> - Platform specific configuration</li>
    * </ul>
    * Examples: <tt>game_mobilesafari.config</tt>, <tt>game_mobilesafari_ipad.config</tt>
    *
    * @param gameSource {String} The URL of the game script.
    * @param gameObjectName {String} The string name of the game object to execute.  When
    *                       the framework if ready, the <tt>startup()</tt> method of this
    *                       object will be called.
    * @param [gameDisplayName] {String} An optional string to display in the loading dialog
    * @memberOf R.engine.Script
    */
   loadGame: function(gameSource, gameObjectName/* , gameDisplayName */) {
      if (!R.Engine.startup()) {
         return;
      }

      var gameDisplayName = arguments[2] || gameObjectName;

      $(document).ready(function() {
         // Determine if the developer has provided a "loading" element of their own
         if ($("span.loading").length == 0) {
            // They haven't, so create one for them
            $("head").append($(R.Engine.loadingCSS));

            var loadingDialog = "<span id='loading' class='intrinsic'><table border='0' style='width:100%;height:100%;'><tr>";
            loadingDialog += "<td style='width:100%;height:100%;' valign='middle' align='center'><div class='loadbox'>Loading ";
            loadingDialog += gameDisplayName + "...<div id='engine-load-progress'></div><span id='engine-load-info'></span></div>";
            loadingDialog += "</td></tr></table></span>";

            $("body",document).append($(loadingDialog)); 
         }
      });

      // We'll wait for the Engine to be ready before we load the game
		// Load engine options for browsers
		R.engine.Script.loadEngineOptions();

      // Load the config object for the game, if it exists
      R.engine.Script.loadGameOptions(gameSource);

      R.engine.Script.gameLoadTimer = setInterval(function() {
         if (R.engine.Script.optionsLoaded &&
             R.engine.Script.gameOptionsLoaded &&
				 R.rendercontexts.DocumentContext &&
				 R.rendercontexts.DocumentContext.started) {

            // Show the virtual D-pad if the option is on
            R.engine.Support.showDPad();

            // Start the engine
            R.Engine.run();

            // Stop the timer
            clearInterval(R.engine.Script.gameLoadTimer);
            R.engine.Script.gameLoadTimer = null;

            // Load the game
            R.debug.Console.debug("Loading '" + gameSource + "'");
            R.engine.Script.loadScript(gameSource);

            // Start the game when it's ready
            if (gameObjectName) {
               R.engine.Script.gameRunTimer = setInterval(function() {
                  var gameObj = R.getClassForName(gameObjectName);
                  if (gameObj !== undefined && gameObj.setup) {
                     clearInterval(R.engine.Script.gameRunTimer);

                     R.debug.Console.warn("Starting: " + gameObjectName);
                     
                     // Remove the "loading" message (if we provided it)
                     $("#loading.intrinsic").remove();

                     // Store the game object when it's ready
                     R.Engine.$GAME = gameObj;

                     // Start the game
                     gameObj.setup(R.engine.Script.gameOptionsObject);
                  }
               }, 100);
            }
         }
      }, 2);
   },

	/**
	 * Load the engine options object for the current browser and OS
	 * @memberOf R.engine.Script
	 * @private
	 */
   loadEngineOptions: function() {
      // Load the specific config for the browser type
      R.engine.Script.optionsLoaded = false;
	
      // Load the options specific to the browser.  Whether they load, or not,
      // the game will continue to load.
      R.engine.Script.loadJSON(R.Engine.getEnginePath() + "/configs/" + R.engine.Support.sysInfo().browser + ".config", function(bData, status) {
         if (status == 200 || status == 304) {
            R.debug.Console.debug("Engine options loaded for: " + R.engine.Support.sysInfo().browser);
            R.Engine.setOptions(bData);
         } else {
            // Log an error (most likely a 404)
            R.debug.Console.log("Engine options for: " + R.engine.Support.sysInfo().browser + " responded with " + status);
         }

         // Allow a game to override engine options
         R.engine.Script.loadJSON("engine.config", function(bData, status) {
            if (status == 200 || status == 304) {
               R.debug.Console.debug("Engine option overrides loaded for game.");
               R.Engine.options = $.extend(R.Engine.options, bData);
            }

            R.engine.Script.optionsLoaded = true;
         });
      });
   },

   /**
    * Load the the options object for the current game being loaded.
    * @param gameSource {String} The game source file
    * @memberOf R.engine.Script
    * @private
    */
   loadGameOptions: function(gameSource) {
      var file = gameSource.split(".")[0];
      R.engine.Script.gameOptionsLoaded = false;
      R.engine.Script.gameOptionsObject = {};

      // Attempt three loads for game options... First for the game in general, then
      // for the browser, and finally for the browser and platform.  The objects will be
      // merged together and passed to the setup() method of the game.
      R.engine.Script.loadJSON(file + ".config", function(bData, status) {
         if (status == 200 || status == 304) {
            R.debug.Console.debug("Game options loaded from '" + file + ".config'");
            R.engine.Script.gameOptionsObject = $.extend(R.engine.Script.gameOptionsObject, bData);
         }

         // Now try to load a browser specific object
         file += "_" + R.engine.Support.sysInfo().browser;
         R.engine.Script.loadJSON(file + ".config", function(bData, status) {
            if (status == 200 || status == 304) {
               R.debug.Console.debug("Browser specific game options loaded from '" + file + ".config'");
               R.engine.Script.gameOptionsObject = $.extend(R.engine.Script.gameOptionsObject, bData);
            }

            // Finally try to load a browser and platform specific object
            file += "_" + R.engine.Support.sysInfo().platform.toLowerCase();
            R.engine.Script.loadJSON(file + ".config", function(bData, status) {
               if (status == 200 || status == 304) {
                  R.debug.Console.debug("Platform specific game options loaded from '" + file + ".config'");
                  R.engine.Script.gameOptionsObject = $.extend(R.engine.Script.gameOptionsObject, bData);
               }

               R.engine.Script.gameOptionsLoaded = true;
            });
         });
      });
   },

   /**
    * Load a script relative to the engine path.  A simple helper method which calls
    * {@link #loadScript} and prepends the engine path to the supplied script source.
    *
    * @param scriptSource {String} A URL to load that is relative to the engine path.
    * @memberOf R.engine.Script
    */
   load: function(scriptSource) {
      R.engine.Script.loadScript(R.Engine.getEnginePath() + scriptSource);
   },

   /**
    * After a script has been loaded, updates the progress
    * @private
    * @memberOf R.engine.Script
    */
   handleScriptDone: function() {
      R.engine.Script.scriptsProcessed++;
      R.engine.Script.scriptRatio = R.engine.Script.scriptsProcessed / R.engine.Script.scriptLoadCount;
      R.engine.Script.scriptRatio = R.engine.Script.scriptRatio > 1 ? 1 : R.engine.Script.scriptRatio;
      R.engine.Script.updateProgress();
   },

   /**
    * Updates the progress bar (if available)
    * @private
    * @memberOf R.engine.Script
    */
   updateProgress: function() {
      var pBar = jQuery("#engine-load-progress");
      if (pBar.length > 0) {
         // Update their progress bar
         if (pBar.css("position") != "relative" || pBar.css("position") != "absolute") {
            pBar.css("position", "relative");
         }
         var pW = pBar.width();
         var fill = Math.floor(pW * R.engine.Script.scriptRatio);
         var fBar = jQuery("#engine-load-progress .bar");
         if (fBar.length == 0) {
            fBar = jQuery("<div class='bar' style='position: absolute; top: 0px; left: 0px; height: 100%;'></div>");
            pBar.append(fBar);
         }
         fBar.width(fill);
         jQuery("#engine-load-info").text(R.engine.Script.scriptsProcessed + " of " + R.engine.Script.scriptLoadCount);
      }
   },

   /**
    * Load a stylesheet and append it to the document.  Allows for
    * scripts to specify additional stylesheets that can be loaded
    * as needed.  Additionally, you can use thise method to inject
    * the engine path into the css being loaded.  Using the variable
    * <tt>$&lt;enginePath&gt;</tt>, you can load css relative to the
    * engine's path.  For example:
    * <pre>
    *    .foo {
    *       background: url('$&lt;enginePath&gt;/myGame/images/bar.png') no-repeat 50% 50%;
    *    }
    * </pre>
    *
    * @param stylesheetPath {String} Path to the stylesheet, relative to
    *                                the engine path.
    * @param relative {Boolean} Relative to the current path, or from the engine path
    * @param noInject {Boolean} <code>true</code> to bypass engine path injection and use
    * 	a <tt>&lt;link /&gt; tag to load the styles instead.                               
    * @memberOf R.engine.Script
    */
   loadStylesheet: function(stylesheetPath, relative, noInject) {
      stylesheetPath = (relative ? "" : R.Engine.getEnginePath()) + stylesheetPath;

      /* pragma:DEBUG_START */
      // If we're in debug mode, force the browser to grab the latest
      if (R.Engine.getDebugMode()) {
         stylesheetPath += (stylesheetPath.indexOf("?") == -1 ? "?" : "&") + "_debug=" + R.now();
      }
      /* pragma:DEBUG_END */

      var f = function() {
			if (noInject) {
				$("head", document).append($("<link type='text/css' rel='stylesheet' href='" + stylesheetPath + "'/>"));	
			} else {
	         $.get(stylesheetPath, function(data) {
	            // process the data to replace the "enginePath" variable
	            var epRE = /(\$<enginePath>)/g;
	            data = data.replace(epRE, R.Engine.getEnginePath());
	            if (R.engine.Support.sysInfo().browser == "msie") {
	               // IE likes it this way...
	               $("head", document).append($("<style type='text/css'>" + data + "</style>"));
	            } else {
	               $("head", document).append($("<style type='text/css'/>").text(data));
	            }
	            R.debug.Console.debug("Stylesheet loaded '" + stylesheetPath + "'");
	         }, "text");
			}
      };

      R.engine.Script.setQueueCallback(f);
   },

   /**
    * Output the list of scripts loaded by the Engine to the console.
    * @memberOf R.engine.Script
    */
   dumpScripts: function() {
      for (var f in this.loadedScripts)
      {
         R.debug.Console.debug(R.engine.Script.loadedScripts[f]);
      }
   },

   /**
    * Clears the script name cache.  Allows scripts to be loaded
    * again.  Use this method with caution, as it is not recommended
    * to load a script if the object is in use.  May cause unexpected
    * results.
    * @memberOf R.engine.Script
    */
   clearScriptCache: function() {
      R.engine.Script.loadedScripts = {};
   }
   
});
/**
 * The Render Engine
 * 
 * An extension to the engine for metrics processing and display.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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

//====================================================================================================
//====================================================================================================
//                                     METRICS MANAGEMENT
//====================================================================================================
//====================================================================================================
/**
 * @class A static class to be used to measure metrics of engine and game performance.  A
 * 		 visual profiler is provided which graphs runtime values of the engine, such as
 * 		 load and visible objects.  Additionally a metrics window is provided to show
 * 		 sampled metric data from parts of the engine, as well as user-defined metrics.
 * @static
 */
R.debug.Metrics = Base.extend(/** @scope R.debug.Metrics.prototype */{
   constructor: null,

   /*
    * Metrics tracking/display
    */
   metrics: {},               // Tracked metrics
   metricDisplay: null,       // The metric display object
   profileDisplay: null,      // The profile display object
   metricSampleRate: 10,      // Frames between samples
   lastMetricSample: 10,      // Last sample frame
   showMetricsWindow: false,  // Metrics display flag
   showMetricsProfile: false, // Metrics profile graph display flag
   vObj: 0,                   // Visible objects
   droppedFrames: 0,          // Non-rendered frames/frames dropped
   profilePos: 0,
   profiles: {},
   

   /**
    * Toggle the display of the metrics window.  Any metrics
    * that are being tracked will be reported in this window.
    * @memberOf R.debug.Metrics
    */
   toggleMetrics: function() {
      R.debug.Metrics.showMetricsWindow = !R.debug.Metrics.showMetricsWindow;
   },

   /**
    * Show the metrics window
    * @memberOf R.debug.Metrics
    */
   showMetrics: function() {
      R.debug.Metrics.showMetricsWindow = true;
   },
   
   /**
    * Show a graph of the engine profile
    * @memberOf R.debug.Metrics
    */
   showProfile: function() {
      R.debug.Metrics.showMetricsProfile = true;
   },

   /**
    * Hide the metrics window
    * @memberOf R.debug.Metrics
    */
   hideMetrics: function() {
      R.debug.Metrics.showMetricsWindow = false;
   },
   
   manMetrics: function() {
      if ($("div.metric-button.minimize").length > 0) {
         $("div.metric-button.minimize").removeClass("minimize").addClass("maximize").attr("title", "maximize");
         $("div.metrics").css("height", 17);
         $("div.metrics .items").hide();
      } else {
         $("div.metric-button.maximize").removeClass("maximize").addClass("minimize").attr("title", "minimize");
         $("div.metrics .items").show();
         $("div.metrics").css("height", "auto");
      }
   },

   /**
    * Creates a button for the metrics window
    * @private
    */
   metricButton: function(cssClass, fn) {
      return $("<div class='metric-button " + cssClass + "' title='" + cssClass + "'><!-- --></div>").click(fn);
   },

   /**
    * Render the metrics window
    * @private
    */
   render: function() {

      if (R.debug.Metrics.showMetricsWindow && !R.debug.Metrics.metricDisplay) {
         R.debug.Metrics.metricDisplay = $("<div/>").addClass("metrics");
         R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("run", function() { R.Engine.run(); }));
         R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("step", function() { R.Engine.step(); }));
         R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("pause", function() { R.Engine.pause(); }));
         R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("shutdown", function() { R.Engine.shutdown(); }));

         R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("close", function() { R.debug.Metrics.hideMetrics(); }));
         R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("minimize", function() { R.debug.Metrics.manMetrics(); }));

         R.debug.Metrics.metricDisplay.append($("<div class='items'/>"));
         R.debug.Metrics.metricDisplay.appendTo($("body"));
      }
      
      if ((this.showMetricsWindow || this.showMetricsProfile) && this.lastMetricSample-- == 0)
      {
         // Basic engine metrics
         R.debug.Metrics.add("FPS", R.Engine.getFPS(), false, "#");
         R.debug.Metrics.add("aFPS", R.Engine.getActualFPS(), true, "#");
         R.debug.Metrics.add("availTime", R.Engine.fpsClock, false, "#ms");
         R.debug.Metrics.add("frames", R.Engine.totalFrames, false, "#");
         R.debug.Metrics.add("frameGenTime", R.Engine.frameTime, true, "#ms");
         R.debug.Metrics.add("engineLoad", Math.floor(R.Engine.getEngineLoad() * 100), true, "#%");
         R.debug.Metrics.add("vObj", R.Engine.vObj, false, "#");
			R.debug.Metrics.add("rObj", R.Engine.rObjs, false, "#");
         R.debug.Metrics.add("droppedFrames", R.Engine.droppedFrames, false, "#");
         R.debug.Metrics.add("upTime", Math.floor((R.Engine.worldTime - R.Engine.upTime)/1000), false, "# sec");
         R.debug.Metrics.add("pclRebuilds", R.Engine.pclRebuilds, false, "#");

         R.debug.Metrics.update();
         R.debug.Metrics.lastMetricSample = R.debug.Metrics.metricSampleRate;
      }
      
      if (R.debug.Metrics.showMetricsProfile && R.engine.Support.sysInfo().browser == "msie" &&
			 parseFloat(R.engine.Support.sysInfo().version) < 9) {
         // Profiler not supported in IE
         R.debug.Metrics.showMetricsProfile = false;
      }
      
      if (R.debug.Metrics.showMetricsProfile && !R.debug.Metrics.profileDisplay) {
         R.debug.Metrics.profileDisplay = $("<canvas width='150' height='100'/>").addClass("engine-profile");
         R.debug.Metrics.profileDisplay.appendTo($("body"));
         R.debug.Metrics.profileDisplay[0].getContext('2d').save();
      }
   },

   /**
    * Set the interval at which metrics are sampled by the system.
    * The default is for metrics to be calculated every 10 engine frames.
    *
    * @param sampleRate {Number} The number of ticks between samples
    * @memberOf R.debug.Metrics
    */
   setSampleRate: function(sampleRate) {
      R.debug.Metrics.lastMetricSample = 1;
      R.debug.Metrics.metricSampleRate = sampleRate;
   },

   /**
    * Add a metric to the game engine that can be displayed
    * while it is running.  If smoothing is selected, a 3 point
    * running average will be used to smooth out jitters in the
    * value that is shown.  For the <tt>fmt</tt> argument,
    * you can provide a string which contains the pound sign "#"
    * that will be used to determine where the calculated value will
    * occur in the formatted string.
    *
    * @param metricName {String} The name of the metric to track
    * @param value {String/Number} The value of the metric.
    * @param smoothing {Boolean} <tt>true</tt> to use 3 point average smoothing
    * @param fmt {String} The way the value should be formatted in the display (e.g. "#ms")
    * @memberOf R.debug.Metrics
    */
   add: function(metricName, value, smoothing, fmt) {
      if (smoothing) {
         var vals = R.debug.Metrics.metrics[metricName] ? R.debug.Metrics.metrics[metricName].values : [];
         if (vals.length == 0) {
            // Init
            vals.push(value);
            vals.push(value);
            vals.push(value);
         }
         vals.shift();
         vals.push(value);
         var v = Math.floor((vals[0] + vals[1] + vals[2]) * 0.33);
         R.debug.Metrics.metrics[metricName] = { val: (fmt ? fmt.replace("#", v) : v), values: vals, act: v };
      } else {
         R.debug.Metrics.metrics[metricName] = { val: (fmt ? fmt.replace("#", value) : value), act: value };
      }
   },

   /**
    * Remove a metric from the display
    *
    * @param metricName {String} The name of the metric to remove
    * @memberOf R.debug.Metrics
    */
   remove: function(metricName) {
      R.debug.Metrics.metrics[metricName] = null;
      delete R.debug.Metrics.metrics[metricName];
   },

   /**
    * Updates the display of the metrics window.
    * @private
    * @memberOf R.debug.Metrics
    */
   update: function() {
      var h = "", ctx;
      if (R.debug.Metrics.showMetricsProfile) {
         ctx = R.debug.Metrics.profileDisplay[0].getContext('2d');
         ctx.save();
         ctx.translate(147, 0);
      }

      for (var m in R.debug.Metrics.metrics)
      {
			if (R.debug.Metrics.showMetricsWindow) {
	         h += m + ": " + R.debug.Metrics.metrics[m].val + "<br/>";
			}
         if (R.debug.Metrics.showMetricsProfile) {
            switch (m) {
               case "engineLoad": this.drawProfilePoint("#ffff00", R.debug.Metrics.metrics[m].act); break;
               case "vObj": this.drawProfilePoint("#339933", R.debug.Metrics.metrics[m].act); break;
               case "rObj": this.drawProfilePoint("#ff00ff", R.debug.Metrics.metrics[m].act); break;
               case "poolLoad" : this.drawProfilePoint("#a0a0ff", R.debug.Metrics.metrics[m].act); break;
            }
         }
      }
		if (R.debug.Metrics.showMetricsWindow) {
			$(".items", R.debug.Metrics.metricDisplay).html(h);
		}
	   if (R.debug.Metrics.showMetricsProfile) {
         ctx.restore();
         R.debug.Metrics.moveProfiler();
      }
   },

	/**
	 * @private
	 */
   drawProfilePoint: function(color, val) {
      var ctx = R.debug.Metrics.profileDisplay[0].getContext('2d');
      ctx.strokeStyle = color
      try {
         if (!isNaN(val)) {
            ctx.beginPath();
            ctx.moveTo(0, R.debug.Metrics.profiles[color] || 100);
            ctx.lineTo(1, (100 - val < 1 ? 1 : 100 - val));
            ctx.closePath();
            ctx.stroke();
            R.debug.Metrics.profiles[color] = (100 - val < 1 ? 1 : 100 - val);
         }
      } catch(ex) {
         
      }
   },
   
   /**
    * @private
    */
   moveProfiler: function() {
      var ctx = R.debug.Metrics.profileDisplay[0].getContext('2d');
      var imgData = ctx.getImageData(1,0,149,100);
      ctx.save();
      ctx.translate(-1,0);
      ctx.putImageData(imgData, 0, 0);
      ctx.restore();
   },

   /**
    * Run the metrics display.
    * @private
    * @memberOf R.debug.Metrics
    */
   doMetrics: function() { 
      // Output any metrics
      if (R.debug.Metrics.showMetricsWindow || R.debug.Metrics.showMetricsProfile) {
         R.debug.Metrics.render();
      } else if (!R.debug.Metrics.showMetricsWindow && R.debug.Metrics.metricDisplay) {
         R.debug.Metrics.metricDisplay.remove();
         R.debug.Metrics.metricDisplay = null;
      }
   }
   
});

if (R.engine.Support.checkBooleanParam("metrics")) {
   R.debug.Metrics.showMetrics();
}

if (R.engine.Support.checkBooleanParam("profile")) {
   R.debug.Metrics.showProfile();
}


/**
 * The Render Engine
 * Engine initialization
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

// Start the console so logging can take place immediately
R.debug.Console.startup();

// Default engine options
R.Engine.defaultOptions = {
   "skipFrames": true,													// Skip missed frames
   "billboards": true,													// Use billboards to speed up rendering
   "textUseBillboards": true,										   // Text will use billboards unless platform doesn't support
   "hardwareAccel": false,											   // Hardware acceleration supported flag
   "pointAsArc": true,													// Draw points as arcs or rectangles
	"transientMathObject": false,									   // Transient (non-pooled) MathObjects
	"useDirtyRectangles": false,										// Enable canvas dirty rectangles redraws
   "nativeAnimationFrame": true,                            // Enable the use of "requestAnimationFrame" for faster redraws
   "disableParticleEngine": false,                          // Disable the particle engine (if used)
   "maxParticles": 250,                                     // Default maximum for particles
   "useVirtualControlPad": false,                           // Disable the display of the virtual control pad (for touch)
   "virtualPad": {                                          // Virtual d-pad mappings
      "up": "R.engine.Events.KEYCODE_UP_ARROW",
      "down": "R.engine.Events.KEYCODE_DOWN_ARROW",
      "left": "R.engine.Events.KEYCODE_LEFT_ARROW",
      "right": "R.engine.Events.KEYCODE_RIGHT_ARROW"
   },
   "virtualButtons": {                                      // Virtual control button mappings
      "A": "A",
      "B": "B",
      "C": "C"
   }
};


// Configure the default options
R.Engine.options = $.extend({}, R.Engine.defaultOptions);

// Set up the engine using whatever query params were passed
R.Engine.setDebugMode(R.engine.Support.checkBooleanParam("debug"));

if (R.Engine.getDebugMode()) {
   R.debug.Console.setDebugLevel(R.engine.Support.getNumericParam("debugLevel", R.debug.Console.DEBUGLEVEL_DEBUG));
}

// Local mode keeps loaded script source available
R.Engine.localMode = R.engine.Support.checkBooleanParam("local");
