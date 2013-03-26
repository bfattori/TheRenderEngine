/**
 * The Render Engine
 * Game
 *
 * @fileoverview The game object represents an instance of a game.  It is
 *               the controlling entity for all of a game and is responsible
 *               for setup and teardown of the game.
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
 * THE SOFTWARE
 */
"use strict";

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.engine.Game",
    "requires":[]
});

/**
 * @class The game object represents an instance of a game.  It is
 * the controlling entity for the game constructs and is responsible
 * for setup and teardown of the game.  All games must extend from this class
 * to be executed by the engine.
 */
R.engine.Game = Base.extend(/** @scope R.engine.Game.prototype */{

    scriptsToLoad:[],

    /** @private */
    constructor:null,

    /**
     * [ABSTRACT] Initialize the game.  This method will be called automatically by the
     * engine when all dependencies for the game have been resolved.
     * @memberof R.engine.Game
     */
    setup:function () {
    },

    /**
     * [ABSTRACT] Shut down the game.  This method will be called if the engine is shut down
     * giving a game time to clean up before it is destroyed.
     * @memberof R.engine.Game
     */
    tearDown:function () {
    },

    /**
     * Get the display name of the game.
     * @memberof R.engine.Game
     */
    getName:function () {
        return "Game";
    },

    /**
     * Load a script relative to this game.  Scripts cannot be specified
     * with an absolute URL.
     *
     * @param scriptSource {String} The relative path to the script to load.
     * @return {String} An Id for the script which is used in the call to {@link #scriptLoaded}
     *                  when the script has completed loading (or errored out)
     * @memberof R.engine.Game
     */
    load:function (scriptSource) {
        Assert((scriptSource.indexOf("http") == -1), "Game scripts can only be loaded relative to the game's path");
        R.engine.Script.loadScript((scriptSource.charAt(0) != "/" ? "./" : ".") + scriptSource);
        var self = this;
        this.setQueueCallback(function () {
            self.scriptLoaded(scriptSource);
        });
    },

    /**
     * Load a script, relative to the game engine.  Scripts cannot be loaded
     * with an absolute URL.
     *
     * @param scriptPath {String} The relative path of the script to load.
     * @memberof R.engine.Game
     */
    loadEngineScript:function (scriptPath) {
        R.engine.Script.loadNow(scriptPath, Game.scriptLoaded);
    },

    /**
     * [ABSTRACT] Will be called with the path of a loaded script. You can
     * be guaranteed that the script either loaded and is ready or failed to load.
     * @param scriptPath {String} The script path
     * @memberof R.engine.Game
     */
    scriptLoaded:function (scriptPath) {
    },

    /**
     * Allows a game to inject a function call into the scriping
     * queue to be processed when the queue has an available slot.
     * @param cb {Function} The callback to execute
     * @memberof R.engine.Game
     */
    setQueueCallback:function (cb) {
        R.engine.Script.setQueueCallback(cb);
    },

    /**
     * Get the number of players the game supports.
     *
     * @return {Number}
     * @memberof R.engine.Game
     */
    getPlayers:function () {
        return 1;
    },

    /**
     * Get the path where your game class exists.
     * @return {String}
     * @memberof R.engine.Game
     */
    getGamePath:function () {
        var loc = window.location;
        var path = loc.protocol + "//" + loc.host + loc.pathname.substring(0, loc.pathname.lastIndexOf("/"));
        path += (path.charAt(path.length - 1) == "/" ? "" : "/");
        return path;
    },

    /**
     * Get the path of the specified file, relative to your game class.
     * @param fileName {String} The path to the file
     * @return {String}
     * @memberof R.engine.Game
     */
    getFilePath:function (fileName) {
        var loc = window.location;
        if (fileName.indexOf(loc.protocol) != -1 && fileName.indexOf(loc.host) == -1) {
            throw new Error("File cannot be located on another server!");
        }

        if (fileName.indexOf(loc.protocol) == -1) {
            return this.getGamePath() + fileName;
        } else {
            return fileName;
        }
    },

    /**
     * This method is called just before the next frame is generated.
     * @param time {Number} The current world time
     * @param dt {Number} The delta between the last frame time and the world time
     */
    tick: function(time, dt) {
    }
});
