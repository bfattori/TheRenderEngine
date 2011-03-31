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
	 * Load text from the specified path and parse it as JSON.  We're doing
	 * a little pre-parsing of the returned data so that the JSON can include
	 * comments which is not spec.
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
			function clean(txt) {
				var outbound = txt.replace(/(".*".*|)(\/\/.*$)/gm, function(str,t,c) {
					return t;
				});
				return outbound.replace(/[\n\r\t]*/g,"");
				//return outbound; //.replace(/\/\*(.|\n|\r)*?\*\//g, "");
			}

			var json = null;
			try {
				// Remove comments
				var inbound = xhr.responseText;
				if (inbound) {
					var c = clean(inbound);
					json = R.engine.Support.parseJSON(c);
				}
			} catch (ex) {}
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
                  	R.debug.Console.debug("Callback for '" + sPath + "'");
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
    *
    * @param gameSource {String} The URL of the game script.
    * @param gameObjectName {String} The string name of the game object to execute.  When
    *                       the framework if ready, the <tt>startup()</tt> method of this
    *                       object will be called.
    * @param [gameDisplayName] {String} An optional string to display in the loading dialog
    * @memberOf R.engine.Script
    */
   loadGame: function(gameSource, gameObjectName/* , gameDisplayName */) {

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
      var engine = R.engine.Engine;
	
		// Load engine options for browsers
		R.engine.Script.loadEngineOptions();

      R.engine.Script.gameLoadTimer = setInterval(function() {
         if (R.engine.Script.optionsLoaded && 
				 R.rendercontexts.DocumentContext &&
				 R.rendercontexts.DocumentContext.started) {

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
                  if (typeof window[gameObjectName] != "undefined" &&
                        window[gameObjectName].setup) {
                     clearInterval(R.engine.Script.gameRunTimer);

                     R.debug.Console.warn("Starting: " + gameObjectName);
                     
                     // Remove the "loading" message (if we provided it)
                     $("#loading.intrinsic").remove();
                     
                     // Start the game
                     window[gameObjectName].setup();
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
		
		// Load the default configuration for all browsers, then load one specific to the browser type
		R.engine.Script.optionsLoaded = false;
	
		// Load the options specific to the browser.  Whether they load, or not,
		// the game will continue to load.
		R.engine.Script.loadJSON(R.Engine.getEnginePath() + "/configs/" + R.engine.Support.sysInfo().browser + ".config", function(bData, status) {
			if (status == 200) {
				R.debug.Console.debug("Engine options loaded for: " + R.engine.Support.sysInfo().browser);
				R.Engine.setOptions(bData);
			} else {
				// Log an error (most likely a 404)
				R.debug.Console.log("Engine options for: " + R.engine.Support.sysInfo().browser + " responded with " + status);
			}
			
			R.engine.Script.optionsLoaded = true;	
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
