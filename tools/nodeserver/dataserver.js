/*
   NodeJS Simple Data Server
   (c) 2011 Brett Fattori

   The Render Engine Project

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE

 */

// Require HTTP for communication & FS to work with the filesystem
var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    gConfig = null,
    db = {};

// Load the configuration file
fs.readFile('data_config.js', function(err, data) {
   if (err) {
      console.log('Configuration file not found');
      gConfig = {
         port: 1337,
         serverIP: '127.0.0.1',
         dataFile: 'data.json',
         pages: 'pages/'
      }
   } else {
      // Parse the JSON configuration
      gConfig = JSON.parse(String(data));
   }

   // Load the data object
   loadData();
});

process.on('exit', function() {
   // Write the data file to disk before exiting
   writeData();
});

function loadData() {
   fs.readFile(gConfig.dataFile, function(err, data) {

      if (err) {
         console.log('No database file found at "' + gConfig.dataFile + '"');
      } else {
         db = JSON.parse(data);
      }

      // Bootstrap
      bootstrapServer();
   });
}

/*
   Start the server
 */
function bootstrapServer() {
   http.createServer(function (req, res) {
      handleRequest(req, res);
   }).listen(gConfig.port, gConfig.serverIP);
   console.log('The Render Engine data server running at http://' + (gConfig.serverIP) + ':' + (gConfig.port) + '/');
}

/*
   Handle a request from the client
 */
function handleRequest(req, res) {
   var q = url.parse(req.url, true), pArr = q.pathname.substr(1).split('/'), root = pArr.shift();
   switch (root) {
      case 'html': getPage(req, res, pArr.join('/'), q.query); break;
      case 'get': getData(req, res, q.query); break;
      case 'put': putData(req, res, q.query); break;
      default:
         res.writeHead(500, { 'Content-Type': 'text/html' });
         res.end('<html><head><title>Error</title></head><body><h1>The Render Engine Server</h1><h2>Server Error 500</h2></body></html>');
   }
}

/*
   Request for an HTML page
 */
function getPage(req, res, path, query) {
   fs.readFile((gConfig.pages || 'pages/') + path, function(err, data) {
      if (err) {
         res.writeHead(404, {'Content-Type': 'text/html'} );
         res.end('<html><head><title>Error</title></head><body><h1>The Render Engine Server</h1><h2>Not Found - 404</h2></body></html>');
         return;
      }

      var d = String(data);
      res.writeHead(200, {
         'Content-Length': d.length,
         'Content-Type': 'text/html'
      });
      res.end(d);
   });
}

/*
   Return the data object to the client
 */
function getData(req, res, query) {
   res.writeHead(200, { 'Content-Type': 'text/plain' });
   var val = query.key ? db[query.key] : db;
   res.end(JSON.stringify(val));
}

var hasOwnProperty = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString;

function isArray( obj ) {
   return toString.call(obj) === "[object Array]";
}

function isPlainObject( obj ) {
   // Make sure that DOM nodes and window objects don't pass through, as well
   if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
      return false;
   }

   // Not own constructor property must be Object
   if ( obj.constructor && !hasOwnProperty.call(obj, "constructor")
      && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
   }

   // Own properties are enumerated firstly
   var key;
   for ( key in obj ) {}
   return key === undefined || hasOwnProperty.call( obj, key );
}

// Allow extending jQL or jQLp
var extend = function() {
   // copy reference to target object
   var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

   // Handle case when target is a string or something (possible in deep copy)
   if ( typeof target !== "object" ) {
      target = {};
   }

   for ( ; i < length; i++ ) {
      // Only deal with non-null/undefined values
      if ( (options = arguments[ i ]) != null ) {
         // Extend the base object
         for ( name in options ) {
            src = target[ name ];
            copy = options[ name ];

            // Prevent never-ending loop
            if ( target === copy ) {
               continue;
            }

            // Recurse if we're merging object literal values or arrays
            if ( copy && ( isPlainObject(copy) || isArray(copy) ) ) {
               var clone = src && ( isPlainObject(src) || isArray(src) ) ? src
                  : isArray(copy) ? [] : {};

               // Never move original objects, clone them
               target[ name ] = extend( deep, clone, copy );

            // Don't bring in undefined values
            } else if ( copy !== undefined ) {
               target[ name ] = copy;
            }
         }
      }
   }

   // Return the modified object
   return target;
};

function writeData() {
   // Flush the data to the file
   console.log("Writing database");
   return fs.writeFileSync(gConfig.dataFile, JSON.stringify(db));
}

/*
   Merge in the new data and write the file to disk
 */
function putData(req, res, query) {
   var obj = (query.key ? db[query.key] : db) || {};
   if (query.key) {
      obj = extend(db[query.key], query.value);
      db[query.key] = obj;
   } else {
      obj = extend(db, query.value);
   }

   res.writeHead(200, { 'Content-Type': 'text/plain'} );
   if (writeData()) {
      res.end("{'success':true}");
   } else {
      console.log("Could not write file '" + gConfig.dataFile + "'");
      res.end("{'success':false}");
   }
}
