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
        var dependencies = [];
        if (classDef.requires && classDef.requires.length > 0) dependencies = dependencies.concat(classDef.requires);
        var includes = [];
        if (classDef.includes && classDef.includes.length > 0) includes = includes.concat(classDef.includes);

        if (dependencies.length == 0 && includes.length == 0) {
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
        var unresolvedDependencies = [];
        var dependency;
        while (dependencies.length > 0) {
            dependency = dependencies.shift();
            if (!R.engine.Linker.resolvedClasses[dependency]) {
                unresolvedDependencies.push(dependency);
            }
        }

        // Remove any includes which are already loaded
        var unresolvedIncludes = [];
        var includeFile;
        while (includes.length > 0) {
            includeFile = includes.shift();
            if (!R.engine.Linker.resolvedFiles[includeFile]) {
                unresolvedIncludes.push(includeFile);
            }
        }

        // Load the includes ASAP
        while (unresolvedIncludes.length > 0) {
            includeFile = unresolvedIncludes.shift();

            // If the include hasn't been processed yet, do it now
            if (!R.engine.Linker.processed[includeFile]) {
                var cb = function (path, result) {
                    if (result === R.engine.Script.SCRIPT_LOADED) {
                        R.engine.Linker.resolvedFiles[path] = true;
                    }
                };
                R.engine.Script.loadNow(includeFile, cb);
                R.engine.Linker.processed[includeFile] = true;
            }
        }

        // Queue up the classes for processing
        while (unresolvedDependencies.length > 0) {
            dependency = unresolvedDependencies.shift();
            if (!R.engine.Linker.processed[dependency]) {
                R.engine.Linker.processed[dependency] = true;
                R.engine.Linker.loadClasses.push(dependency);
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
        for (var className in R.engine.Linker.queuedClasses) {
            inProcess++;

            // Get the class definition
            var classDef = R.engine.Linker.classDefinitions[className];

            if (!classDef) {
                throw new Error("R.engine.Linker => Class '" + className + "' doesn't have a definition!");
            }

            // Check to see if the dependencies exist
            var missingDependencies = false, requiredClasses = [], unresolvedDependencies = [];
            if (classDef.requires && classDef.requires.length > 0) requiredClasses = requiredClasses.concat(classDef.requires);
            while (requiredClasses.length > 0) {
                var req = requiredClasses.shift();

                if (!R.engine.Linker.resolvedClasses[req]) {
                    // Check for A => B  => A
                    // If such a circular reference exists, we can ignore the dependency
                    var dependentDefinition = R.engine.Linker.classDefinitions[req];
                    if (dependentDefinition && dependentDefinition.requires) {
                        if (RenderEngine.Support.indexOf(dependentDefinition.requires, className) == -1) {
                            // Not a circular reference
                            unresolvedDependencies.push(req);
                        }
                    } else {
                        // Class not resolved
                        unresolvedDependencies.push(req);
                    }
                }
            }

            // Anything left unresolved means we cannot initialize
            missingDependencies = (unresolvedDependencies.length > 0);

            // Check for local dependencies
            var locallyDependent = false, localDependencies = [], localUnresolvedDependencies = [];
            if (classDef.depends && classDef.depends.length > 0) localDependencies = localDependencies.concat(classDef.depends);
            while (localDependencies.length > 0) {
                var localDependency = localDependencies.shift();

                if (!R.engine.Linker.resolvedClasses[localDependency]) {
                    // Check for A => B  => A
                    // If such a circular reference exists, we can ignore the dependency
                    var localDependencyDefinition = R.engine.Linker.classDefinitions[localDependency];
                    if (localDependencyDefinition && localDependencyDefinition.requires) {
                        if (RenderEngine.Support.indexOf(localDependencyDefinition.requires, className) == -1) {
                            // Not a circular reference
                            localUnresolvedDependencies.push(localDependency);
                        }
                    } else if (localDependencyDefinition && localDependencyDefinition.depends) {
                        if (RenderEngine.Support.indexOf(localDependencyDefinition.depends, className) == -1) {
                            // Not a circular reference
                            localUnresolvedDependencies.push(localDependency);
                        }
                    } else {
                        // Class not resolved
                        localUnresolvedDependencies.push(localDependency);
                    }
                }
            }

            // Anything left unresolved means we cannot initialize
            locallyDependent = (localUnresolvedDependencies.length > 0);

            // If all requirements are loaded, check the includes
            if (!(missingDependencies || locallyDependent)) {
                var missingIncludes = false, includes = classDef.includes || [];
                for (var i = 0; i < includes.length; i++) {
                    if (!R.engine.Linker.resolvedFiles[includes[i]]) {
                        missingIncludes = true;
                        break;
                    }
                }

                if (!missingIncludes) {
                    R.engine.Linker._initClass(className);

                    // No need to process it again
                    completed.push(className);
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

        var newClass = 0;
        for (var j in R.engine.Linker.queuedClasses) {
            newClass++;
        }

        if (newClass > 0 || inProcess > processed) {
            // There are classes waiting for their dependencies, do this again
            R.engine.Linker.classTimer = setTimeout(function () {
                R.engine.Linker._processClasses();
            }, 100);
        } else if (inProcess == processed) {
            // Clear the fail timer
            clearTimeout(R.engine.Linker.failTimer);

            // All classes waiting to be processed have been processed
            clearTimeout(R.engine.Linker.classTimer);
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
