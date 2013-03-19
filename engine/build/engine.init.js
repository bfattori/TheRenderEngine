/**
 * The Render Engine
 * Engine initialization
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

// Start the console so logging can take place immediately
R.debug.Console.startup();

// Default engine options
R.Engine.defaultOptions = {
    "skipFrames":true, // Skip frames which cannot be rendered without impacting framerate
    "billboards":true, // Use billboards to speed up rendering
    "textUseBillboards":true, // Text will use billboards unless platform doesn't support it
    "hardwareAccel":false, // Hardware acceleration supported flag (deprecated)
    "pointAsArc":true, // Draw points as arcs or rectangles (dot or rect)
    "transientMathObject":false, // Transient (non-pooled) MathObjects
    "useDirtyRectangles":false, // Enable canvas dirty rectangles redraws
    "nativeAnimationFrame":true, // Enable the use of "requestAnimationFrame"
    "disableParticleEngine":false, // Disable particle engines (if used)
    "maxParticles":250, // Default maximum particles engine will allow
    "useVirtualControlPad":false, // Show the virtual d-pad (for touch)
    "virtualPad":{                                          // Virtual d-pad mappings
        "up":"R.engine.Events.KEYCODE_UP_ARROW",
        "down":"R.engine.Events.KEYCODE_DOWN_ARROW",
        "left":"R.engine.Events.KEYCODE_LEFT_ARROW",
        "right":"R.engine.Events.KEYCODE_RIGHT_ARROW"
    },
    "virtualButtons":{                                      // Virtual control button mappings
        "A":"A",
        "B":"B",
        "C":"C"
    }
};


// Configure the default options
R.Engine.options = $.extend({}, R.Engine.defaultOptions);


// Set up the engine using whatever query params were passed
R.Engine.setDebugMode(R.engine.Support.checkBooleanParam("debug"));

if (R.Engine.getDebugMode()) {
    R.debug.Console.setDebugLevel(R.engine.Support.getNumericParam("debugLevel", R.debug.Console.DEBUGLEVEL_DEBUG));
}

// Local mode keeps loaded script source available
R.Engine.localMode = R.engine.Support.checkBooleanParam("local");
