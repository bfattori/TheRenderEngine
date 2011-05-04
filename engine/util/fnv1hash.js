/**
 * The Render Engine
 * FNV1 Hashing
 *
 * @fileoverview A class for quickly generating a hash for the provided input string.
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
 * THE SOFTWARE
 */

// The class this file defines and its required classes
R.Engine.define({
   "class": "R.util.FNV1Hash",
   "requires": [
      "R.engine.PooledObject"
   ]
});

/*
 * A family of fast hash functions, originally created by Glenn Fowler, Phong Vo,
 * and improved by Landon Curt Noll.  Implemented in Javascript by Brett Fattori.
 * 
 * <p>FNV1 hashes are designed to be fast while maintaining a low collision rate.
 * The FNV1 speed allows one to quickly hash lots of data while maintaining a
 * reasonable collision rate. The high dispersion of the FNV1 hashes makes them
 * well suited for hashing nearly identical strings such as URLs, hostnames,
 * filenames, text, IP addresses, etc.</p>
 * 
 * <p>FNV1a is a variant of FNV1, which is slightly better suited for hashing
 * short values (< 4 octets).</p>
 * 
 * <p>This is a straightforward port of the public domain C version,
 * written by Landon Curt Noll (one of the authors), available from
 * <a href="http://www.isthe.com/chongo/tech/comp/fnv/">his website</a>.</p>
 * 
 * <p>The usage pattern is as follows: to compute the initial hash value
 * you call one of the <code>init(...)</code> methods. After that you may
 * update the hash zero or more times with additional values using the
 * <code>update(...)</code> methods. When you are done, you can retrieve the
 * final hash value with {@link #getHash()}.</p>
 * <p>Individual instances of FNV1 are reusable after you call one of
 * the <code>init(...)</code> methods. However, these implementations are NOT
 * synchronized, so proper care should be taken when using this hash in a multi-threaded
 * environment.</p>
 * 
 * @author Brett Fattori &lt;bfattori AT gmail DOT com&gt;
 * @private
 */
R.util.FNV1 = function(algo) {

   // Create the linkage to the hashing algorithm
   var fnv = algo.fnv;
   var getHashValue = algo.getHash || function(h) {
      return Number(h).toString(16);
   };
   var INIT = algo.INIT;

   return {

      /**
       * Initialize this hash instance. Any previous state is reset, and the new
       * hash value is computed.
       */
      init: function(buf, offset, len) {
         if (typeof buf == "string") {
            buf = buf.split("");
            offset = 0;
            len = buf.length;
         }
         return fnv(buf, offset, len, INIT);
      },

      /**
       * Update the hash value. Repeated calls to this method update the hash
       * value accordingly, and they are equivalent to calling the <code>init(...)</code>
       * method once with a concatenated value of all parameters.
       */
      update: function(hash, buf, offset, len) {
         if (typeof buf == "string") {
            buf = buf.split("");
            offset = 0;
            len = buf.length;
         }
         hash = fnv(buf, offset, len, hash);
      },

      /**
       * Retrieve the hash value
       * @return hash value
       */
      getHash: function() {
         return getHashValue(hash);
      }
   };
};

/**
 * @class Implementation of FNV1 - a fast hash function.
 *
 * <p>This implementation uses 32-bit operations, and the values returned from
 * {@link #getHash()} are limited to the lower 32 bits.</p>
 *
 * @author Andrzej Bialecki &lt;ab@getopt.org&gt;
 */
R.util.FNV132 = (function() {
   return {
      fnv: function(buf, offset, len, seed) {
         for (var i = offset; i < offset + len; i++) {
            seed += (seed << 1) + (seed << 4) + (seed << 7) + (seed << 8) + (seed << 24);
            seed ^= String(buf[i]).charCodeAt(0);
         }
         return seed;
      },

      INIT: 0x811c9dc5
   };
})();

/**
 * @class Implementation of FNV1a - a fast hash function. The FNV1a variant provides a
 * slightly better dispersion for short (< 4 bytes) values than plain FNV1.
 *
 * <p>This implementation uses 32-bit operations, and the values returned from
 * {@link #getHash()} are limited to the lower 32 bits.</p>
 *
 * @author Andrzej Bialecki &lt;ab@getopt.org&gt;
 */
R.util.FNV1a32 = (function() {
   return {
      fnv: function(buf, offset, len, seed) {
         for (var i = offset; i < offset + len; i++) {
            seed ^= String(buf[i]).charCodeAt(0);
            seed += (seed << 1) + (seed << 4) + (seed << 7) + (seed << 8) + (seed << 24);
         }
         return seed;
      },

      INIT: 0x811c9dc5
   };
})();

/**
 * @class A class for creating a hash value from a string. Calling the {@link #getHash} method resets
 *        the hash each time a new source string is provided, whereas evolving the hash will build upon
 *        previous hashes.  The hash for a string will always be the same.  Hashing a set of strings, in
 *        order, will always result in the same evolved hash.  Uses the {@link R.lang.FNV1a32} hashing
 *        routine by default.
 *
 * @constructor
 * @param [hashRoutine=R.lang.FNV1a32] {FNV1} The hash routine to use.
 * @extends R.engine.PooledObject
 */
R.util.FNV1Hash = function() {
   return R.engine.PooledObject.extend(/** @scope R.util.FNV1Hash.prototype */{

      fnv: null,
      gotten: null,
      lastHash: 0,

      /** @private */
      constructor: function(hashRoutine) {
         this.base("FNV1Hash");
         this.fnv = new R.util.FNV1(hashRoutine || R.util.FNV1a32);
         this.gotten = false;
         this.lastHash = 0;
      },

      /**
       * Release the hash back into the pool for later use.
       */
      release: function() {
         this.base();
         this.fnv = null;
         this.gotten = null;
         this.lastHash = 0;
      },

      /**
       * Initialize the hasher with the provided string.  To instead evolve the hash
       * use the {@link #updateHash} to update the hash with new data.
       *
       * @param str {String} The value to get the hash for
       * @return {String} A hexadecimal hash value
       */
      getHash: function(str) {
         this.gotten = true;
         this.lastHash = this.fnv.init(str);
         return this.getLastHash();
      },

      /**
       * Get the last returned hash value without evolving the hash.
       * @return {String} A hexadecimal hash value
       */
      getLastHash: function() {
         return Number(this.lastHash).toString(16);
      },

      /**
       * Evolves the existing hash.
       * @param str {String} The value to get the hash for
       * @return {String} A hexadecimal hash value
       */
      updateHash: function(str) {
         if (this.gotten) {
            this.lastHash = this.fnv.update(this.lastHash, str);
            return this.getLastHash();
         } else {
            return this.getHash(str);
         }
      }

   }, /** @scope R.util.FNV1Hash.prototype */{

      getClassName: function() {
         return "R.util.FNV1Hash";
      }
   });

};
