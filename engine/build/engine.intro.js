/*!
 * The Render Engine is a cross-browser, open source game engine written entirely
 * in JavaScript. Designed from the ground up to be extremely flexible, it boasts
 * an extensive API and uses the newest features of today's modern browsers.  
 * 
 * Visit
 * http://www.renderengine.com for more information.
 *
 * author: Brett Fattori (brettf@renderengine.com)
 * version: @BUILD_VERSION
 * date: @BUILD_DATE
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

