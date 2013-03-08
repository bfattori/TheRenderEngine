// The class this file defines and its required classes
R.Engine.define({
    "class":"R.util.console.Webkit",
    "requires":[
        "R.debug.ConsoleRef"
    ]
});

/**
 * @class A debug console abstraction for Webkit browsers.
 * @extends R.debug.ConsoleRef
 */
R.util.console.Webkit = R.debug.ConsoleRef.extend(/** @scope R.util.console.Webkit.prototype **/{

    constructor:function () {
    },

    /**
     * Write a debug message to the console
     */
    info:function () {
        console.log.apply(console, arguments);
    },

    /**
     * Write a debug message to the console
     */
    debug:function () {
        console.debug.apply(console, arguments);
    },

    /**
     * Write a warning message to the console
     */
    warn:function () {
        console.warn.apply(console, arguments);
    },

    /**
     * Write an error message to the console
     */
    error:function () {
        console.error.apply(console, arguments);
    },

    /**
     * Get the class name of this object
     *
     * @return {String} The string "R.util.console.Webkit"
     */
    getClassName:function () {
        return "R.util.console.Webkit";
    }

});
