/**
 * The Render Engine
 * Engine initialization
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */

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
        "up":"Events.KEYCODE_UP_ARROW",
        "down":"Events.KEYCODE_DOWN_ARROW",
        "left":"Events.KEYCODE_LEFT_ARROW",
        "right":"Events.KEYCODE_RIGHT_ARROW"
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

// Local mode keeps loaded script source available
R.Engine.localMode = R.engine.Support.checkBooleanParam("local");
