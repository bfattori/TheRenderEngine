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

    constructor:null,

    //====================================================================================================
    //====================================================================================================
    //                                   DEPENDENCY PROCESSOR
    //
    //====================================================================================================
    //====================================================================================================

    classDefinitions:{}, // These are class definitions which have been parsed
    processed:{}, // These are the classes/files which have been processed
    resolvedClasses:{}, // These are resolved (loaded & ready) classes
    resolvedFiles:{}, // These are resolved (loaded) files

    loadClasses:[], // Classes which need to be loaded
    queuedClasses:{}, // Classes which are queued to be initialized

    classLoaderTimer:null,
    classTimer:null,
    failTimer:null,

    waiting:{},

    /**
     * See R.Engine.define()
     * @private
     */
    define:function (classDef) {
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
                var cb = function (path, result) {
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
            setTimeout(function () {
                R.engine.Linker.classLoader();
            }, 100);
        }

        if (R.engine.Linker.classTimer == null) {
            // After 10 seconds, if classes haven't been processed, fail
            R.engine.Linker.failTimer = setTimeout(function () {
                R.engine.Linker._failure();
            }, 10000);

            R.engine.Linker.classTimer = setTimeout(function () {
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
    classLoader:function () {
        // Load the classes
        while (R.engine.Linker.loadClasses.length > 0) {
            R.engine.Linker._doLoad(R.engine.Linker.loadClasses.shift());
        }
    },

    /**
     * Linker uses this to load classes and track them
     * @private
     */
    _doLoad:function (className) {
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
    _loaded:function (path, result) {

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
    _processClasses:function () {
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
            R.engine.Linker.failTimer = setTimeout(function () {
                R.engine.Linker._failure();
            }, 10000);
        }

        var newClzz = 0;
        for (var j in R.engine.Linker.queuedClasses) {
            newClzz++;
        }

        if (newClzz > 0 || inProcess > processed) {
            // There are classes waiting for their dependencies, do this again
            R.engine.Linker.classTimer = setTimeout(function () {
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
    _initClass:function (className) {
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
        if (R.isFunction(classObjDef)) {
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
    _failure:function () {
        clearTimeout(R.engine.Linker.failTimer);
        clearTimeout(R.engine.Linker.classTimer);
        clearTimeout(R.engine.Linker.classLoader);

        R.debug.Console.error("R.engine.Linker => FAILURE TO LOAD CLASSES!", "Resolved: ", R.engine.Linker.resolvedClasses, " Unprocessed: ", R.engine.Linker.queuedClasses, " ClassDefs: ", R.engine.Linker.classDefinitions);
    }

});
