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

//====================================================================================================
//====================================================================================================
//                                     SCRIPT PROCESSING
//====================================================================================================
//====================================================================================================
/**
 * @class A static class which is used to load new JavaScript into the browser.  Methods are
 *          also provided to use AJAX to get text and JSON data on-the-fly, load stylesheets,
 *          and process script callbacks from a loader queue.
 * @static
 */
R.engine.Script = Base.extend(/** @scope R.engine.Script.prototype */{

    constructor:null,

    /*
     * Script queue
     */
    scriptQueue:[],
    loadedScripts:{}, // Cache of loaded scripts
    scriptLoadCount:0, // Number of queued scripts to load
    scriptsProcessed:0, // Number of scripts processed
    scriptRatio:0, // Ratio between processed/queued
    queuePaused:false, // Script queue paused flag
    pauseReps:0, // Queue run repetitions while paused
    gameOptionsLoaded:false, // Whether the game options have loaded yet
    gameOptionsObject:{}, // Options object for the game
    uniqueRequest:true,
    callbacks:{}, // Script callbacks

    /**
     * Status message when a script is not found
     * @memberof R.engine.Script
     * @type {Boolean}
     */
    SCRIPT_NOT_FOUND:false,

    /**
     * Status message when a script is successfully loaded
     * @memberof R.engine.Script
     * @type {Boolean}
     */
    SCRIPT_LOADED:true,

    /**
     * Include a script file.
     *
     * @param scriptURL {String} The URL of the script file
     * @memberof R.engine.Script
     */
    include:function (scriptURL) {
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
     * @memberof R.engine.Script
     * @private
     */
    loadNow:function (scriptPath, cb) {
        R.engine.Script.doLoad(R.Engine.getEnginePath() + scriptPath, scriptPath, cb);
    },

    /**
     * Queue a script to load from the server and append it to
     * the head element of the browser.  Script names are
     * cached so they will not be loaded again.  Each script in the
     * queue is processed synchronously.
     *
     * @param scriptPath {String} The URL of a script to load.
     * @memberof R.engine.Script
     */
    loadScript:function (scriptPath) {
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
     * @memberof R.engine.Script
     */
    ajaxLoad:function (path, data, callback) {
        /* pragma:DEBUG_START */
        // If we're in debug mode, force the browser to grab the latest
        if (R.Engine.getDebugMode() && R.engine.Script.isMakeUnique()) {
            path += (path.indexOf("?") == -1 ? "?" : "&") + "_debug=" + R.now();
        }
        /* pragma:DEBUG_END */

        // Use our own internal method to load a file with the JSON
        // data.  This way, we don't fail silently when loading a file
        // that doesn't exist.
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.onreadystatechange = function (evt) {
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
     *        text and status code (a number) of the request.
     * @memberof R.engine.Script
     */
    loadText:function (path, data, callback) {
        if (R.isFunction(data)) {
            callback = data;
            data = null;
        }
        R.engine.Script.ajaxLoad(path, data, function (xhr, result) {
            callback(xhr.responseText, xhr.status);
        });
    },

    /**
     * Load text from the specified path and parse it as JSON.
     *
     * @param path {String} The url to load
     * @param data {Object} Optional arguments to pass to server
     * @param callback {Function} The callback method which is passed the
     *        JSON object and status code (a number) of the request.
     * @memberof R.engine.Script
     */
    loadJSON:function (path, data, callback) {
        if (R.isFunction(data)) {
            callback = data;
            data = null;
        }
        R.engine.Script.ajaxLoad(path, data, function (xhr, result) {
            var json = null;
            if (result != 404) {
                try {
                    // Remove comments
                    json = RenderEngine.Support.parseJSON(xhr.responseText);
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
     * @memberof R.engine.Script
     */
    runScriptQueue:function () {
        if (!R.engine.Script.scriptQueueTimer) {
            // Process any waiting scripts
            R.engine.Script.scriptQueueTimer = setInterval(function () {
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
     * @memberof R.engine.Script
     */
    setQueueCallback:function (cb) {
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
     * @memberof R.engine.Script
     */
    pauseQueue:function (state) {
        R.engine.Script.queuePaused = state;
    },

    /**
     * Process any scripts that are waiting to be loaded.
     * @private
     * @memberof R.engine.Script
     */
    processScriptQueue:function () {
        if (R.engine.Script.scriptQueue.length > 0 && R.engine.Script.readyForNextScript) {
            // Hold the queue until the script is loaded
            R.engine.Script.readyForNextScript = false;

            // Get next script...
            var scriptPath = R.engine.Script.scriptQueue.shift();

            // If the queue element is a function, execute it and return
            if (R.isFunction(scriptPath)) {
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
     * @memberof R.engine.Script
     */
    doLoad:function (scriptPath, simplePath, cb) {
        if (!R.Engine.started) {
            return;
        }

        var s = scriptPath.replace(/[\/\.]/g, "_");
        if (R.engine.Script.loadedScripts[s] == null) {
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
            if (R.Engine.getDebugMode() && R.engine.Script.isMakeUnique()) {
                scriptPath += (scriptPath.indexOf("?") == -1 ? "?" : "&") + "_debug=" + R.now();
            }
            /* pragma:DEBUG_END */

            if (R.browser.Wii) {

                $.get(scriptPath, function (data) {

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
            } else {

                // We'll use our own script loader so we can detect errors (i.e. missing files).
                var n = document.createElement("script");
                n.src = scriptPath;
                n.type = "text/javascript";

                // When the file is loaded
                var scriptInfo = {
                    node:n,
                    fullPath:scriptPath,
                    simpPath:simplePath,
                    callback:cb
                }, successCallback, errorCallback;


                successCallback = R.bind(scriptInfo, function () {
                    if (!this.node.readyState ||
                        this.node.readyState == "loaded" ||
                        this.node.readyState == "complete") {

                        // If there was a callback, get it
                        var callBack = R.engine.Script.callbacks[this.simpPath];

                        R.debug.Console.debug("Loaded '" + this.fullPath + "'");
                        R.engine.Script.handleScriptDone();
                        if (R.isFunction(callBack)) {
                            R.debug.Console.info("Callback for '" + this.fullPath + "'");
                            callBack(this.simpPath, R.engine.Script.SCRIPT_LOADED);

                            // Delete the callback
                            delete R.engine.Script.callbacks[this.simpPath];
                        }

                        if (!R.Engine.localMode) {
                            // Delete the script node
                            $(this.node).remove();
                        }
                    }
                    R.engine.Script.readyForNextScript = true;
                });

                // When an error occurs
                errorCallback = R.bind(scriptInfo, function (msg) {
                    var callBack = this.callback;
                    R.debug.Console.error("File not found: ", this.fullPath);
                    if (callBack) {
                        callBack(this.simpPath, R.engine.Script.SCRIPT_NOT_FOUND);
                    }
                    R.engine.Script.readyForNextScript = true;
                });

                if (R.browser.msie) {
                    n.defer = true;
                    n.onreadystatechange = successCallback;
                    n.onerror = errorCallback;
                } else {
                    n.onload = successCallback;
                    n.onerror = errorCallback;
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
     * @memberof R.engine.Script
     */
    loadGame:function (gameSource, gameObjectName/* , gameDisplayName */) {
        if (!R.Engine.startup()) {
            return;
        }

        var gameDisplayName = arguments[2] || gameObjectName;

        $(document).ready(function () {
            // Determine if the developer has provided a "loading" element of their own
            if ($("span.loading").length == 0) {
                // They haven't, so create one for them
                $("head").append($(R.Engine.loadingCSS));

                var loadingDialog = "<span id='loading' class='intrinsic'><table border='0' style='width:100%;height:100%;'><tr>";
                loadingDialog += "<td style='width:100%;height:100%;' valign='middle' align='center'><div class='loadbox'>Loading ";
                loadingDialog += gameDisplayName + "...<div id='engine-load-progress'></div><span id='engine-load-info'></span></div>";
                loadingDialog += "</td></tr></table></span>";

                $("body", document).append($(loadingDialog));
            }
        });

        // We'll wait for the Engine to be ready before we load the game
        // Load engine options for browsers
        R.engine.Script.loadEngineOptions();

        // Load the config object for the game, if it exists
        R.engine.Script.loadGameOptions(gameSource);

        R.engine.Script.gameLoadTimer = setInterval(function () {
            if (R.engine.Script.optionsLoaded &&
                R.engine.Script.gameOptionsLoaded &&
                R.rendercontexts.DocumentContext &&
                R.rendercontexts.DocumentContext.started) {

                // Show the virtual D-pad if the option is on
                RenderEngine.Support.showDPad();

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
                    R.engine.Script.gameRunTimer = setInterval(function () {
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
     * @memberof R.engine.Script
     * @private
     */
    loadEngineOptions:function () {
        // Load the specific config for the browser type
        R.engine.Script.optionsLoaded = false;

        // Load the options specific to the browser.  Whether they load, or not,
        // the game will continue to load.
        R.engine.Script.loadJSON(R.Engine.getEnginePath() + "/configs/" + RenderEngine.Support.sysInfo().browser + ".config", function (bData, status) {
            if (status == 200 || status == 304) {
                R.debug.Console.debug("Engine options loaded for: " + RenderEngine.Support.sysInfo().browser);
                R.Engine.setOptions(bData);
            } else {
                // Log an error (most likely a 404)
                R.debug.Console.log("Engine options for: " + RenderEngine.Support.sysInfo().browser + " responded with " + status);
            }

            // Allow a game to override engine options
            R.engine.Script.loadJSON("engine.config", function (bData, status) {
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
     * @memberof R.engine.Script
     * @private
     */
    loadGameOptions:function (gameSource) {
        var file = gameSource.split(".")[0];
        R.engine.Script.gameOptionsLoaded = false;
        R.engine.Script.gameOptionsObject = {};

        // Attempt three loads for game options... First for the game in general, then
        // for the browser, and finally for the browser and platform.  The objects will be
        // merged together and passed to the setup() method of the game.
        R.engine.Script.loadJSON(file + ".config", function (bData, status) {
            if (status == 200 || status == 304) {
                R.debug.Console.debug("Game options loaded from '" + file + ".config'");
                R.engine.Script.gameOptionsObject = $.extend(R.engine.Script.gameOptionsObject, bData);
            }

            // Now try to load a browser specific object
            file += "_" + RenderEngine.Support.sysInfo().browser;
            R.engine.Script.loadJSON(file + ".config", function (bData, status) {
                if (status == 200 || status == 304) {
                    R.debug.Console.debug("Browser specific game options loaded from '" + file + ".config'");
                    R.engine.Script.gameOptionsObject = $.extend(R.engine.Script.gameOptionsObject, bData);
                }

                // Finally try to load a browser and platform specific object
                file += "_" + RenderEngine.Support.sysInfo().platform.toLowerCase();
                R.engine.Script.loadJSON(file + ".config", function (bData, status) {
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
     * @memberof R.engine.Script
     */
    load:function (scriptSource) {
        R.engine.Script.loadScript(R.Engine.getEnginePath() + scriptSource);
    },

    /**
     * After a script has been loaded, updates the progress
     * @private
     * @memberof R.engine.Script
     */
    handleScriptDone:function () {
        R.engine.Script.scriptsProcessed++;
        R.engine.Script.scriptRatio = R.engine.Script.scriptsProcessed / R.engine.Script.scriptLoadCount;
        R.engine.Script.scriptRatio = R.engine.Script.scriptRatio > 1 ? 1 : R.engine.Script.scriptRatio;
        R.engine.Script.updateProgress();
    },

    /**
     * Updates the progress bar (if available)
     * @private
     * @memberof R.engine.Script
     */
    updateProgress:function () {
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
     *     a <tt>&lt;link /&gt; tag to load the styles instead.
     * @memberof R.engine.Script
     */
    loadStylesheet:function (stylesheetPath, relative, noInject) {
        stylesheetPath = (relative ? "" : R.Engine.getEnginePath()) + stylesheetPath;

        /* pragma:DEBUG_START */
        // If we're in debug mode, force the browser to grab the latest
        if (R.Engine.getDebugMode() && R.engine.Script.isMakeUnique()) {
            stylesheetPath += (stylesheetPath.indexOf("?") == -1 ? "?" : "&") + "_debug=" + R.now();
        }
        /* pragma:DEBUG_END */

        var f = function () {
            if (noInject) {
                $("head", document).append($("<link type='text/css' rel='stylesheet' href='" + stylesheetPath + "'/>"));
            } else {
                $.get(stylesheetPath, function (data) {
                    // process the data to replace the "enginePath" variable
                    var epRE = /(\$<enginePath>)/g;
                    data = data.replace(epRE, R.Engine.getEnginePath());
                    if (RenderEngine.Support.sysInfo().browser == "msie") {
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
     * @memberof R.engine.Script
     */
    dumpScripts:function () {
        for (var f in this.loadedScripts) {
            R.debug.Console.debug(R.engine.Script.loadedScripts[f]);
        }
    },

    /**
     * Clears the script name cache.  Allows scripts to be loaded
     * again.  Use this method with caution, as it is not recommended
     * to load a script if the object is in use.  May cause unexpected
     * results.
     * @memberof R.engine.Script
     */
    clearScriptCache:function () {
        R.engine.Script.loadedScripts = {};
    },

    isMakeUnique:function () {
        return R.engine.Script.uniqueRequest;
    },

    setUniqueRequest:function (state) {
        R.engine.Script.uniqueRequest = state;
    }

});
