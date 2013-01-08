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
      return "R.debug.ConsoleRef";
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
		
//      if (R.engine.Support.checkBooleanParam("debug") && (R.engine.Support.checkBooleanParam("simWii") || jQuery.browser.Wii)) {
//         R.debug.Console.consoleRef = new R.debug.HTML();
//      }
//      else if (typeof firebug !== "undefined" || (typeof console !== "undefined" && console.firebug)) {
//         // Firebug or firebug lite
//         R.debug.Console.consoleRef = new R.debug.Firebug();
//      }
//      else if (typeof console !== "undefined" && jQuery.browser.msie) {
//         R.debug.Console.consoleRef = new R.debug.MSIE();
//      }
//      else if (jQuery.browser.chrome || jQuery.browser.safari) {
//         R.debug.Console.consoleRef = new R.debug.Webkit();
//      }
//      else if (jQuery.browser.opera) {
//         R.debug.Console.consoleRef = new R.debug.Opera();
//      }
//      else {
         R.debug.Console.consoleRef = new R.debug.ConsoleRef(); // (null console)
//      }
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
      if (!R.debug.Console.enableDebugOutput) return;

      return (R.debug.Console.verbosity == R.debug.Console.DEBUGLEVEL_VERBOSE ||
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

