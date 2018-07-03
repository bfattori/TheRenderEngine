/**
 * The Render Engine
 * Game
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class The game object represents an instance of a game.  It is
 * the controlling entity for the game constructs and is responsible
 * for setup and teardown of the game.  All games must extend from this class
 * to be executed by the engine.
 */
class Game {

    static scriptsToLoad = [];

    /**
     * Load a script relative to this game.  Scripts cannot be specified
     * with an absolute URL.
     *
     * @param scriptSource {String} The relative path to the script to load.
     * @return {String} An Id for the script which is used in the call to {@link #scriptLoaded}
     *                  when the script has completed loading (or errored out)
     * @memberof R.engine.Game
     */
    static load(scriptSource) {
        Assert((scriptSource.indexOf("http") == -1), "Game scripts can only be loaded relative to the game's path");
        R.engine.Script.loadScript((scriptSource.charAt(0) != "/" ? "./" : ".") + scriptSource);
        var self = this;
        this.setQueueCallback(function () {
            self.scriptLoaded(scriptSource);
        });
    }

    /**
     * Load a script, relative to the game engine.  Scripts cannot be loaded
     * with an absolute URL.
     *
     * @param scriptPath {String} The relative path of the script to load.
     * @memberof R.engine.Game
     */
    static loadEngineScript (scriptPath) {
        R.engine.Script.loadNow(scriptPath, Game.scriptLoaded);
    }

    /**
     * Allows a game to inject a function call into the scriping
     * queue to be processed when the queue has an available slot.
     * @param cb {Function} The callback to execute
     * @memberof R.engine.Game
     */
    static setQueueCallback(cb) {
        R.engine.Script.setQueueCallback(cb);
    }

    /**
     * Get the path where your game class exists.
     * @return {String}
     * @memberof R.engine.Game
     */
    static get gamePath() {
        var loc = window.location;
        var path = loc.protocol + "//" + loc.host + loc.pathname.substring(0, loc.pathname.lastIndexOf("/"));
        path += (path.charAt(path.length - 1) == "/" ? "" : "/");
        return path;
    }

    /**
     * Get the path of the specified file, relative to your game class.
     * @param fileName {String} The path to the file
     * @return {String}
     * @memberof R.engine.Game
     */
    static getFilePath(fileName) {
        var loc = window.location;
        if (fileName.indexOf(loc.protocol) != -1 && fileName.indexOf(loc.host) == -1) {
            throw new Error("File cannot be located on another server!");
        }

        if (fileName.indexOf(loc.protocol) == -1) {
            return this.gamePath + fileName;
        } else {
            return fileName;
        }
    }

    //====================================================================================

    /**
     * Get the number of players the game supports.
     * @return {Number}
     */
    get playerCount() {
        return 1;
    }

    /**
     * Get the display name of the game.
     * @memberof R.engine.Game
     */
    get name() {
        return "Game";
    }

    /**
     * [ABSTRACT] Will be called with the path of a loaded script. You can
     * be guaranteed that the script either loaded and is ready or failed to load.
     * @param scriptPath {String} The script path
     * @memberof R.engine.Game
     */
    scriptLoaded(scriptPath) {}

    /**
     * [ABSTRACT] Initialize the game.  This method will be called automatically by the
     * engine when all dependencies for the game have been resolved.
     */
    setup() {}

    /**
     * [ABSTRACT] Shut down the game.  This method will be called if the engine is shut down
     * giving a game time to clean up before it is destroyed.
     */
    tearDown() {}

    /**
     * This method is called just before the next frame is generated.
     * @param time {Number} The current world time
     * @param dt {Number} The delta between the last frame time and the world time
     */
    tick(time, dt) {}
}
