/**
 * The Render Engine
 * Console
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */


/**
 * Assert that a condition is <tt>true</tt>, stopping the engine if it is <tt>false</tt>.
 * If the condifion fails an exception will be thrown.
 *
 * @param test {Boolean} A simple test that should evaluate to <tt>true</tt>
 * @param error {String} The error message to throw if the test fails
 */
var Assert = function (test, error) {
    var fail = false;
    try {
        if (!test) {
            fail = true;
            if (arguments.length > 1) {
                for (var a = 1; a < arguments.length; a++) {
                    console.error("*ASSERT* ", arguments[a]);
                    console.trace();
                }
            }

            R.Engine.shutdown();

        }
    } catch (ex) {
        console.warn("*ASSERT* 'test' would result in an exception: ", ex);
    }

    // This will provide a stacktrace for browsers that support it
    if (fail) {
        throw new Error(error);
    }
};

/**
 * Assert that a condition is <tt>true</tt>, reporting a warning if the test fails.
 *
 * @param test {Boolean} A simple test that should evaluate to <tt>true</tt>
 * @param error {String} The warning to display if the test fails
 */
var AssertWarn = function (test, warning) {
    try {
        if (!test) {
            if (arguments.length > 1) {
                for (var a = 1; a < arguments.length; a++) {
                    console.warn("*ASSERT-WARN* ", arguments[a]);
                }
            }
            console.warn(warning);
        }
    } catch (ex) {
        console.warn("*ASSERT-WARN* 'test' would result in an exception: ", ex);
    }
};

