/**
 * The Render Engine
 * Math2 Class
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A static class which provides methods for generating random integers
 *          and floats between 0 and 1.  The class also provides a way to seed the
 *          random number generator for repeatable results.
 *
 * @static
 */
class Math2 {

    static state = 1;
    static m = 0x100000000; // 2**32;
    static a = 1103515245;
    static c = 12345;

    /**
     * Largest integer (4294967295)
     * @type {Number}
     * @memberof R.lang.Math2
     */
    static MAX_INT = 0xFFFFFFFF; // 64-bits

    /**
     * Seed the random number generator with a known number.  This
     * ensures that random numbers occur in a known sequence.
     *
     * @param seed {Number} An integer to seed the number generator with
     * @memberof R.lang.Math2
     */
    static seed(seed = undefined) {
        // LCG using GCC's constants
        Math2.state = seed ? seed : Math.floor(Math.random() * (Math2.m - 1));
    }

    /**
     * Returns a random integer between 0 and 4,294,967,296.
     * @return {Number} An integer between 0 and 2^32
     * @memberof R.lang.Math2
     */
    static randomInt() {
        Math2.state = (Math2.a * Math2.state + Math2.c) % Math2.m;
        return Math2.state;
    }

    /**
     * Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)
     * @return {Number} A number between 0 and 1
     * @memberof R.lang.Math2
     */
    static random() {
        // returns in range [0,1]
        return Math2.randomInt() / (Math2.m - 1);
    }

    /**
     * Return a random value within the <tt>low</tt> to <tt>height</tt> range,
     * optionally as an integer value only.
     *
     * @param low {Number} The low part of the range
     * @param high {Number} The high part of the range
     * @param [whole] {Boolean} Return whole values only
     * @return {Number}
     */
    static randomRange(low, high, whole) {
        var v = low + (Math2.random() * high);
        return (whole ? Math.floor(v) : v);
    }

    /**
     * Parse a binary string into a number.
     *
     * @param bin {String} Binary string to parse
     * @return {Number}
     */
    static parseBin(bin) {
        if (!isNaN(bin)) {
            return R.global.parseInt(bin, 2);
        }
        return null;
    }

    /**
     * Converts a number to a hexidecimal string, prefixed by "0x".
     *
     * @param num {Number} The number to convert
     * @return {String}
     * @memberof R.lang.Math2
     */
    static toHex(num) {
        if (!isNaN(num)) {
            return ("0x" + num.toString(16));
        }
        return null;
    }

    /**
     * Converts a number to a binary string.
     *
     * @param num {Number} The number to convert
     * @return {String}
     * @memberof R.lang.Math2
     */
    static toBinary(num) {
        if (!isNaN(num)) {
            return num.toString(2);
        }
        return null;
    }
}

// Initially seed the random number generator with a pseudo-random number
Math2.seed();
