/**
 * The Render Engine
 * Engine initialization
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */

// Default engine options
RenderEngine.defaultOptions = {
    "skipFrames":true, // Skip frames which cannot be rendered without impacting framerate
    "billboards":true, // Use billboards to speed up rendering
    "pointAsArc":true, // Draw points as arcs or rectangles (dot or rect)
    "useDirtyRectangles":false, // Enable canvas dirty rectangles redraws
    "nativeAnimationFrame":true, // Enable the use of "requestAnimationFrame"
    "disableParticleEngine":false, // Disable particle engines (if used)
    "maxParticles":10000, // Default maximum particles engine will allow
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
RenderEngine.options = _.extend({}, RenderEngine.defaultOptions);

// Set up the engine using whatever query params were passed
RenderEngine.debugMode = RenderEngine.Support.checkBooleanParam("debug");
