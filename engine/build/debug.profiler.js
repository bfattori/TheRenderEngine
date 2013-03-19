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
    profileStack:[],
    allProfiles:{},
    profiles:[],
    running:false,
    engineStartTime:0,
    engineFrameStart:0
};

/**
 * Start the profiler.
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.start = function () {
    R.debug.Profiler.resetProfiles();
    R.debug.Profiler.running = true;

    R.debug.Profiler.engineStartTime = R.Engine.worldTime;
    R.debug.Profiler.engineFrameStart = R.Engine.totalFrames;
};

/**
 * Stop the profiler, dumping whatever was being profiled.
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.stop = function () {
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
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.enter = function (prof) {
    if (!R.debug.Profiler.running) {
        return;
    }
    var profile = R.debug.Profiler.allProfiles[prof];
    if (profile == null) {
        // Create a monitor
        profile = R.debug.Profiler.allProfiles[prof] = {
            name:prof,
            startMS:R.now(),
            execs:0,
            totalMS:0,
            instances:1,
            pushed:false
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
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.exit = function () {
    if (!R.debug.Profiler.running) {
        return;
    }
    if (R.debug.Profiler.profileStack.length == 0) {
        var msg = "Profile stack underflow";
        if (typeof console !== "undefined") {
            console.error(msg);
        }
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
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.resetProfiles = function () {
    R.debug.Profiler.profileStack = [];
    R.debug.Profiler.allProfiles = {};
    R.debug.Profiler.profiles = [];
};

/**
 * Dump the profiles that are currently in the stack to a debug window.
 * The profile stack will be cleared after the dump.
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.dump = function () {
    if (!R.debug.Profiler.running) {
        return;
    }
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
 * @memberof R.debug.Profiler
 */
R.debug.Profiler.wireObjects = function (objArray) {
    for (var obj in objArray) {

        for (var o in objArray[obj].prototype) {
            try {
                if (R.isFunction(objArray[obj].prototype[o]) &&
                    objArray[obj].prototype.hasOwnProperty(o) && o != "constructor") {
                    // wrap it in a function to profile it
                    var f = objArray[obj].prototype[o];
                    var fn = function () {
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
