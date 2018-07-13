/**
 * The Render Engine
 * Engine Class
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */

let WORLD_TIME = 0;
let LAST_WORLD_TIME = 0;

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
class RenderEngine {
    static VERSION = "3.0.1";
    static HOME_URL = "@HOME_URL";
    static REF_NAME = "@REF_NAME";

    // Global engine options
    static _options = {};

    /*
     * Engine objects
     */
    static idRef = 0; // Object reference Id
    static timerPool = {}; // Pool of running timers
    static livingObjects = 0; // Count of live objects

    /*
     * Engine info
     */
    static _fpsClock = 16; // The clock rate (ms)
    static _FPS = undefined; // Calculated frames per second
    static _updateTime = 0; // Time (ms) to update for next frame
    static _frameTime = 0; // Time (ms) to render a frame
    static _engineLocation = null; // URI of engine
    static _defaultContext = null; // The default rendering context
    static _debugMode = false; // Global debug flag
    static _localMode = false; // Local run flag
    static _started = false; // Engine started flag
    static _running = false; // Engine running flag
    static _shuttingDown = false; // Engine is shutting down
    static _upTime = 0; // The startup time
    static _downTime = 0; // The shutdown time
    static _skipFrames = true; // Skip missed frames
    static _totalFrames = 0;
    static _droppedFrames = 0;
    static _pclRebuilds = 0;

    /*
     * Sound engine info
     */
    static _soundsEnabled = false; // Sound engine enabled flag

    static get worldTime() {
        return WORLD_TIME;
    }

    static get lastTime() {
        return LAST_WORLD_TIME;
    }

    static get deltaTime() {
        return WORLD_TIME - LAST_WORLD_TIME;
    }

    static get liveTime() {
        return WORLD_TIME - RenderEngine._upTime;
    }

    /** @private */
    static shutdownCallbacks = []; // Methods to call when the engine is shutting down

    static $GAME = null; // Reference to the game object

    // Issue #18 - Intrinsic loading dialog
    static loadingCSS = "<style type='text/css'>div.loadbox {width:325px;height:30px;padding:10px;font:10px Arial;border:1px outset gray;-moz-border-radius:10px;-webkit-border-radius:10px} #engine-load-progress { position:relative;border:1px inset gray;width:300px;height:5px} #engine-load-progress .bar {background:silver;}</style>";

    //====================================================================================================
    //====================================================================================================
    //                                      ENGINE PROPERTIES
    //====================================================================================================
    //====================================================================================================

    /**
     * Set/override the engine options.
     * @param opts {Object} Configuration options for the engine
    
     * @private
     */
    static setOptions(opts) {
        // Check for a "defaults" key
        var configOpts;
        if (opts.defaults) {
            configOpts = opts.defaults;
        }

        // Check for general version options
        if (opts["versions"]) {
            var versionDefaults = {};
            for (var v in opts["versions"]) {
                if (RenderEngine.Support.sysInfo().version == v) {
                    // Add version specific matches
                    versionDefaults = _.extend(versionDefaults, opts["versions"][v]);
                }

                if (parseFloat(RenderEngine.Support.sysInfo().version) >= parseFloat(v)) {
                    // Add version match options
                    versionDefaults = $.extend(versionDefaults, opts["versions"][v]);
                }
            }
        }

        $.extend(R.Engine.options, configOpts, versionDefaults);
    }

    static set options(opts) {
        this.setOptions(opts);
    }

    static get options() {
        return RenderEngine._options;
    }

    /**
     * Set the debug mode of the engine.  Engine debugging enables helper objects
     * which visually assist in debugging game objects.  To specify the console debug
     * message output level, see {@link R.debug.Console@setDebuglevel}.
     * <p/>
     * Engine debug helper objects include:
     * <ul>
     * <li>A left/up glyph at the origin of objects using the {@link R.components.Transform2D} component</li>
     * <li>Yellow outline in the shape of the collision hull of {@link R.objects.Object2D}, if assigned</li>
     * <li>Yellow outline around objects using box or circle collider components</li>
     * <li>Green outline around objects which are rendered with the {@link R.components.Billboard2D} component</li>
     * <li>Blue outline around box and circle rigid body objects</li>
     * <li>Red lines from anchor points in jointed {@link R.objects.PhysicsActor} objects</li>
     * </ul>
     *
     * @param mode {Boolean} <tt>true</tt> to enable debug mode
    
     */
    static set debugMode(mode) {
        RenderEngine._debugMode = mode;
    }

    /**
     * Query the debugging mode of the engine.
     *
     * @return {Boolean} <tt>true</tt> if the engine is in debug mode
    
     */
    static get debugMode () {
        return RenderEngine._debugMode;
    }

    /**
     * Returns <tt>true</tt> if SoundManager2 is loaded and initialized
     * properly.  The resource loader and play manager will use this
     * value to execute properly.
     * @return {Boolean} <tt>true</tt> if the sound engine was loaded properly
    
     */
    static get soundsEnabled() {
        return RenderEngine._soundsEnabled;
    }

    /**
     * Set the FPS (frames per second) the engine runs at.  This value
     * is mainly a suggestion to the engine as to how fast you want to
     * redraw frames.  If frame execution time is long, frames will be
     * processed as time is available. See the metrics to understand
     * available time versus render time.
     *
     * @param fps {Number} The number of frames per second to refresh
     *                     Engine objects.
    
     */
    static set FPS(fps) {
        Assert((fps != 0), "You cannot have a framerate of zero!");
        RenderEngine._fpsClock = Math.floor(1000 / fps);
        RenderEngine._FPS = undefined;
    }

    /**
     * Get the default rendering context for the Engine.  This
     * is the <tt>document.body</tt> element in the browser.
     *
    
     */
    static get defaultContext() {
        if (RenderEngine._defaultContext == null) {
            RenderEngine._defaultContext = DefaultContext.create();
        }

        return RenderEngine._defaultContext;
    }

    /**
     * Get the game object that has been loaded by the engine.  The game object isn't valid until the game is loaded.
     * @return {R.engine.Game}
     */
    static get game() {
        return R.Engine.$GAME;
    }

    /**
     * Get the path to the engine.  Uses the location of the <tt>/runtime/engine.js</tt>
     * file that was initially loaded to determine the URL where the engine is running from.
     * When files are included, or classes are loaded, they are loaded relative to the engine's
     * location on the server.
     *
     * @return {String} The path/URL where the engine is located
    
     */
    static get enginePath() {
        if (RenderEngine._engineLocation == null) {
            // Determine the path of the "engine.js" file
            var head = document.getElementsByTagName("head")[0];
            var scripts = head.getElementsByTagName("script");
            for (var x = 0; x < scripts.length; x++) {
                var src = scripts[x].src;
                var m = src.match(/(.*\/engine)\/runtime\/engine\.js/);
                if (src != null && m) {
                    // Get the path
                    RenderEngine.engineLocation = m[1];
                    break;
                }
            }
        }

        return RenderEngine.engineLocation;
    }

    //====================================================================================================
    //====================================================================================================
    //                                  GLOBAL OBJECT MANAGEMENT
    //====================================================================================================
    //====================================================================================================

    /**
     * Increment the reference counter and return a unique Id
     */
    static create(obj) {
        if (RenderEngine.shuttingDown === true) {
            console.warn("Engine shutting down, '" + obj + "' destroyed because it would create an orphaned reference.");
            obj.destroy();
            return null;
        }

        Assert((RenderEngine.started === true), "Creating an object when the engine is stopped!", obj);

        var objId = obj.name + RenderEngine.idRef++;
        //console.info("CREATED Object ", objId, "[", obj, "]");
        RenderEngine.livingObjects++;

        return objId;
    }

    /**
     * Decrement the reference counter
     */
    static destroy(obj) {
        if (obj == null) {
            console.warn("NULL reference passed to Engine.destroy()!  Ignored.");
            return;
        }

        //console.info("DESTROYED Object ", obj.id, "[", obj, "]");
        RenderEngine.livingObjects--;
    }

    /**
     * Add a timer to the pool so it can be cleaned up when
     * the engine is shutdown, or paused when the engine is
     * paused.
     * @param timerName {String} The timer name
     * @param timer {R.lang.Timer} The timer to add
     */
    static addTimer(timerName, timer) {
        RenderEngine.timerPool[timerName] = timer;
    }

    /**
     * Remove a timer from the pool when it is destroyed.
     * @param timerName {String} The timer name
     */
    static removeTimer(timerName) {
        RenderEngine.timerPool[timerName] = null;
        delete RenderEngine.timerPool[timerName];
    }

    /**
     * Get an object by the Id that was assigned during the call to {@link #create}.
     * Only objects that are contained within other objects will be found.  Discreetly
     * referenced objects cannot be located by Id.
     *
     * @param id {String} The Id of the object to locate
     * @return {R.engine.PooledObject} The object
    
     */
    static getObject (id) {
        function search(container) {
            var itr = container.iterator();
            while (itr.hasNext()) {
                var obj = itr.next();
                if (obj.getId && (obj.getId() === id)) {
                    itr.destroy();
                    return obj;
                }
                if (obj instanceof Container) {
                    // If the object is a container, search inside of it
                    return search(obj);
                }
            }
            itr.destroy();
            return null;
        }

        // Start at the engine's default context
        return search(RenderEngine.defaultContext);
    }

    //====================================================================================================
    //====================================================================================================
    //                                    ENGINE PROCESS CONTROL
    //====================================================================================================
    //====================================================================================================

    /**
     * Load the minimal scripts required for the engine to start.
     * @private
    
     */
    static loadEngineScripts() {
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

        if (RenderEngine.Support.checkBooleanParam("debug")) {
            RenderEngine._debugMode = true;
        }
    }

    /**
     * Starts the engine and loads the basic engine scripts.  When all scripts required
     * by the engine have been loaded the {@link #run} method will be called.
     *
     * @param debugMode {Boolean} <tt>true</tt> to set the engine into debug mode
     *                            which allows the output of messages to the console.
    
     */
    static startup(debugMode) {
        Assert((R.Engine.running == false), "Restart engine?");

        RenderEngine._upTime = R.now();
        RenderEngine._debugMode = !!debugMode;
        RenderEngine._started = true;
        RenderEngine._totalFrames = 0;

        // Load the required scripts
        R.Engine.loadEngineScripts();
        return true;
    }

    /**
     * Starts or resumes the engine.  This will be called after all scripts have been loaded.
     * You will also need to call this if you {@link #pause} the engine.  Any paused timers
     * will also be resumed.
    
     */
    static run() {
        if (RenderEngine._shuttingDown || RenderEngine._running) {
            return;
        }

        // Restart all of the timers
        for (var tm in RenderEngine.timerPool) {
            RenderEngine.timerPool[tm].restart();
        }

        var mode = "[" + (RenderEngine._debugMode ? "DEBUG" : "") + "]";
        console.warn(">>> Engine started " + mode);
        RenderEngine._running = true;
        RenderEngine._shuttingDown = false;

        console.debug(">>> sysinfo: ", RenderEngine.Support.sysInfo());

        RenderEngine._pauseTime = R.now();
        RenderEngine._stepOne = 0;
        RenderEngine._lastTime = R.now() - RenderEngine._fpsClock;

        // Start world timer
        RenderEngine.engineTimer();
    }

    /**
     * Steps the engine when paused.  Any timers that were paused, stay paused while stepping.
    
     */
    static step() {
        if (RenderEngine.running) {
            return;
        }

        RenderEngine._stepOne = 1;
        RenderEngine.engineTimer();
    }

    /**
     * Pauses the engine and any running timers.
    
     */
    static pause() {
        if (RenderEngine.shuttingDown) {
            return;
        }

        // Pause all of the timers
        for (var tm in RenderEngine.timerPool) {
            RenderEngine.timerPool[tm].pause();
        }

        console.warn(">>> Engine paused <<<");
        clearTimeout(RenderEngine.globalTimer);
        RenderEngine._running = false;
        RenderEngine._pauseTime = R.now();
    }

    /**
     * Add a method to be called when the engine is being shutdown.  Use this
     * method to allow an object, which is not referenced by the engine, to
     * perform cleanup actions.
     *
     * @param fn {Function} The callback function
    
     */
    static onShutdown(fn) {
        if (RenderEngine._shuttingDown === true) {
            return;
        }

        RenderEngine.shutdownCallbacks.push(fn);
    }

    /**
     * Shutdown the engine.  Stops the global timer and cleans up (destroys) all
     * objects that have been created and added to the engine, starting at the default
     * engine context.
    
     */
    static shutdown() {
        if (RenderEngine.shuttingDown) {
            return;
        }

        RenderEngine._shuttingDown = true;

        if (!RenderEngine._running && RenderEngine.started) {
            // If the engine is not currently running (i.e. paused)
            // restart it and then re-perform the shutdown
            RenderEngine.running = true;
            setTimeout(function () {
                RenderEngine.shutdown();
            }, (RenderEngine._fpsClock * 2));
            return;
        }

        RenderEngine._started = false;
        console.warn(">>> Engine shutting down...");

        // Stop world timer
        clearTimeout(RenderEngine.globalTimer);

        // Run through shutdown callbacks to allow unreferenced objects
        // to clean up references, etc.
        while (RenderEngine.shutdownCallbacks.length > 0) {
            RenderEngine.shutdownCallbacks.shift()();
        }

        // Cancel all of the timers
        console.debug(">>> Cancelling all timers");
        for (var tm in RenderEngine.timerPool) {
            RenderEngine.timerPool[tm].cancel();
        }
        RenderEngine.timerPool = {};

        RenderEngine._downTime = R.now();
        console.warn(">>> Engine stopped.  Runtime: " + (RenderEngine._downTime - RenderEngine._upTime) + "ms");
        console.warn(">>>   frames generated: ", RenderEngine._totalFrames);

        RenderEngine._running = false;

        // Kill off the default context and anything
        // that's attached to it.  We'll alert the
        // developer if there's an issue with orphaned objects
        RenderEngine.defaultContext.destroy();

        // Dump the object pool
        PooledObject.objectPool = null;

        AssertWarn((RenderEngine.livingObjects === 0), "Orphaned object references: " + RenderEngine.livingObjects);

        RenderEngine.loadedScripts = {};
        RenderEngine.scriptLoadCount = 0;
        RenderEngine.scriptsProcessed = 0;
        RenderEngine._defaultContext = null;

        // Shutdown complete
        RenderEngine._shuttingDown = false;
    }

    /**
     * Prints the version of the engine.
     */
    static toString() {
        return "The Render Engine " + RenderEngine.VERSION;
    }

    //====================================================================================================
    //====================================================================================================
    //                                        THE WORLD TIMER
    //====================================================================================================
    //====================================================================================================

    /**
     * Get the FPS (frames per second) the engine is set to run at.
     * @return {Number}
    
     */
    static get FPS() {
        if (!RenderEngine._FPS) {
            RenderEngine._FPS = Math.floor((1 / RenderEngine._fpsClock) * 1000);
        }
        return RenderEngine._FPS;
    }

    /**
     * Get the actual FPS (frames per second) the engine is running at.
     * This value will vary as load increases or decreases due to the
     * number of objects being rendered.  A faster machine will be able
     * to handle a higher FPS setting.
     * @return {Number}
    
     */
    static get actualFPS() {
        return Math.floor((1 / RenderEngine.frameTime) * 1000);
    }

    /**
     * Get the amount of time allocated to draw a single frame.
     * @return {Number} Milliseconds allocated to draw a frame
    
     */
    static get frameTime() {
        return R.now() - WORLD_TIME;
    }

    /**
     * Get the amount of time it took to draw the last frame.  This value
     * varies per frame drawn, based on visible objects, number of operations
     * performed, and other factors.  The draw time can be used to optimize
     * your game for performance.
     * @return {Number} Milliseconds required to draw the frame
    
     */
    static get drawTime() {
        return RenderEngine._frameTime;
    }

    static get upTime() {
        return WORLD_TIME - RenderEngine._upTime;
    }

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
    
     */
    static get engineLoad() {
        return (RenderEngine.frameTime / RenderEngine.fpsClock);
    }

    /**
     * This is the process which updates the world.  It starts with the default
     * context, telling it to update itself.  Since each context is a container,
     * all of the objects in the container will be called to update, and then
     * render themselves.
     *
     * @private
    
     */
    static engineTimer() {
        if (RenderEngine._shuttingDown) {
            return;
        }

        if (!RenderEngine._running && RenderEngine._stepOne == 0) {
            return;
        }

        var nextFrame = RenderEngine.fpsClock;

        // Update the world
        if ((RenderEngine._stepOne == 1 || RenderEngine.running) && RenderEngine.defaultContext != null) {
            RenderEngine.vObj = 0;
            RenderEngine.rObjs = 0;

            // Render a frame, adjusting for a paused engine
            WORLD_TIME = RenderEngine._stepOne == 1 ? RenderEngine._pauseTime : R.now();
            LAST_WORLD_TIME = RenderEngine._stepOne == 1 ? WORLD_TIME - RenderEngine._fpsClock : LAST_WORLD_TIME;

            // Tick the game
            if (RenderEngine.$GAME) {
                RenderEngine.$GAME.tick(WORLD_TIME, RenderEngine.deltaTime);
            }

            // Pass world time, delta time
            RenderEngine.defaultContext.update(WORLD_TIME, RenderEngine.deltaTime);
            RenderEngine._updateTime = R.now() - WORLD_TIME;

            // Render a frame
            RenderEngine.defaultContext.render();
            RenderEngine._frameTime = R.now() - RenderEngine._updateTime;

            LAST_WORLD_TIME = WORLD_TIME;

            if (RenderEngine._stepOne == 1) {
                RenderEngine._pauseTime += RenderEngine._frameTime;
            }

            RenderEngine.totalFrames++;

            // Determine when the next frame should draw
            // If we've gone over the allotted time, wait until the next available frame
            var f = nextFrame - RenderEngine._frameTime;
            nextFrame = (RenderEngine._skipFrames ? (f > 0 ? f : nextFrame) : RenderEngine._fpsClock);
            RenderEngine._droppedFrames += (f <= 0 ? Math.round((f * -1) / RenderEngine._fpsClock) : 0);
        }

        if (RenderEngine._stepOne == 1) {
            // If stepping, don't re-call the engine timer automatically
            RenderEngine._stepOne = 0;
            return;
        }

        // When the process is done, start all over again
        RenderEngine.nativeFrame(RenderEngine.engineTimer);
    }

    // ======================================================
    // References to R.engine.Script methods
    // ======================================================

    /**
     * Include a script file.
     *
     * @param scriptURL {String} The URL of the script file
    
     */
    static include(scriptURL) {
        R.engine.Script.include(scriptURL);
    }

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
    
     */
    static loadGame(gameSource, gameObjectName, gameDisplayName) {
        R.engine.Script.loadGame(gameSource, gameObjectName, gameDisplayName);
    }

}

