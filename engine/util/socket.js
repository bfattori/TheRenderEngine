/**
 * The Render Engine
 * Socket
 *
 * @fileoverview A static class with helper methods for creating network sockets.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1557 $
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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.util.SocketUtil",
	"requires": [],
   "includes": [
      "/../libs/socket.io.js"
   ]
});

/**
 * @class A static class to create sockets for two-way network communication.  This uses
 *    socket.IO as the socket provider to abstract the many different transport mechanisms.
 *    It is recommended that you see the example Node.JS server provided with <em>The Render Engine</em>
 *    to get an understanding of creating your own server.
 *
 * @static
 */
R.util.SocketUtil = /** @scope R.util.SocketUtil.prototype */{

   /**
    * Socket connected message type
    * @type {Number}
    */
   MSG_CONNECT: 1,

   /**
    * Socket disconnected message type
    * @type {Number}
    */
   MSG_DISCONNECT: 2,

   /**
    * Socket acknowledges message received and handled type
    * @type {Number}
    */
   MSG_ACK: 3,

   /**
    * Server broadcast message type
    * @type {Number}
    */
   MSG_SERVER: 4,

   /**
    * Internal pool of sockets, organized by URL
    * @private
    */
   _socketPool: {},

   /**
    * Create a socket for network communication.  A socket is
    * a self contained object which has methods for sending messages of
    * various types.  When you are finished with the socket, call its
    * <code>done()</code> method to disconnect from the server and return
    * the socket to the pool.
    * <p/>
    * As soon as you've created the socket, you can start sending messages.
    * Messages will be queued until the socket is connected.  A method
    * called <tt>listener()</tt> can be attached to the socket so that
    * messages arriving back from the socket can be handled.
    * <p/>
    * <pre>
    *    var socket = R.util.SocketUtil.createSocket('my.url.com/server/io.js');
    *    socket.listener = function(type, message) {
    *       if (type == R.util.SocketUtil.MSG_CONNECT) {
    *          alert("connected!");
    *       }
    *    };
    *    socket.connect();
    * </pre>
    * For information about using a socket, see {@link R.Socket}
    *
    * @param connectionURL {String} The URL to connect to
    * @param [port] {Number} The port to connect to (default: 8090)
    * @param [secure] {Boolean} <tt>true</tt> to use a secure connection (default: <tt>false</tt>)
    * @return {R.Socket} A socket object
    */
   createSocket: function(connectionURL, port, secure)  {

      // Message type for simple "send" with no acknowledgement
      var TYPE_SEND = -1,

      // Broadcast type message for all users.
      TYPE_BROADCAST = -2;

      port = typeof port == "number" ? port : undefined;
      secure = typeof port == "boolean" ? (secure ? "1" : "0") : "0";

      // Normalize the socket url, port, and secure flag
      var dest = connectionURL.split("/");
      dest = dest[dest.length - 1].replace(/[^\w]g/,"") + ":" + (port ? port.toString() : "0") + ":" + secure;

      var pool = R.util.SocketUtil._socketPool[dest];
      if (!pool || pool.length == 0) {

         if (!pool) {
            // Create the pool
            pool = R.util.SocketUtil._socketPool[dest] = [];
         }

         // Add the socket to the pool
         pool.push(new R.Socket(dest, connectionURL));
      }

      // Pop the first available socket from the pool and return it
      return pool.pop();
   }
};

/**
 * @class A web socket for two-way network communication.  You should not
 * create an object from this class directly.  Instead, see
 * {@link R.util.SocketUtil#createSocket}
 *
 * @constructor
 */
R.Socket = function(/* ident, host */) {
   this.id = arguments[0];
   var inf = this.id.split(":");
   this.socket = new io.Socket(arguments[1], {
      secure: inf[2] == "1",
      port: inf[1] == "0" ? undefined : Number(inf[1]),
      // Really would like to avoid using Flash or ActiveX, if possible...
      //transports: ['websocket','xhr-multipart','xhr-polling','jsonp-polling','htmlfile','flashsocket']
      transports: ['websocket','xhr-multipart','xhr-polling','jsonp-polling'],
      rememberTransport: false
   });
   this.packetNum = 1;
   this.awaitingACK = [];
   this.queued = [];
   this.ready = false;

   // Wire handlers into the socket
   var self = this;
   //--------------------------------------------------------------------------

   // Received a message from the server
   this.socket.on('message', function(obj) {
      if (obj.type == Socket.MSG_SERVER) {
         // A server message, pass it along
         self.notify(Socket.MSG_SERVER, obj.msg);

      } else if (obj.type == Socket.MSG_ACK) {
         // An acknowledgement of a previously assured message
         var f = -1, ack = R.engine.Support.filter(this.awaitingACK, function(a, i) {
            if (a.packetNum == obj.packetNum) {
               f = i;
               return true;
            }
         });

         // Acknowledged
         if (f != -1) {
            if ($.isFunction(ack[0].cb)) {
               ack[0].cb(obj.packetNum);
            }

            // No longer waiting for ACK
            self.awaitingACK.slice(i,1);
         }
      }
   });

   // Called when the socket creates a successful connectino
   this.socket.on('connect', function() {
      self.ready = true;

      // Send any queued messages
      while (this.queued.length > 0) {
         // First in, first out
         self.socket.send(this.queued.shift());
      }
      self.notify(Socket.MSG_CONNECT, 'hello');
   });

   // Disconnected by the server
   this.socket.on('disconnect', function() {
      self.ready = false;
      self.notify(Socket.MSG_DISCONNECT, 'goodbye');
   });

};

   /**
    * Attempt to connect the socket to its destination.  Upon
    * successful connection, the <tt>listener()</tt> method
    * attached to the socket will be triggered.
    */
R.Socket.prototype.connect = function() {
      this.socket.connect();
   };

   /**
    * Internal method which tells the socket user that something has
    * occurred.
    * @param type {Number} The type of message
    * @param message {String} A string message to pass along
    * @private
    */
   R.Socket.prototype.notify = function(type, message) {
      if ($.isFunction(self.listener)) {
         self.listener(type, message);
      }
   };

   /**
    * Call this method to complete all communications with the socket
    * and return it to the pool.
    */
   R.Socket.prototype.done = function() {
      // See if we're awaiting anything
      if (this.awaitingACK.length > 0) {
         // There are guaranteed messages which haven't ACKed yet
         return false;
      }

      // Let the server know we're disconnecting (unless they
      // disconnected us already)
      if (this.ready) {
         this.socket.send('goodbye');
         this.socket.disconnect();
      }

      // All set, clean up and pool us
      this.packetNum = 1;
      this.awaitingACK.length = 0;
      this.listener = undefined;

      R.util.SocketUtil._socketPool[this.id].push(this);
   };

   /**
    * Queues the message if the socket isn't connected yet,
    * otherwise, sends the message.
    * @param msg {Object} The message to send
    * @private
    */
   R.Socket.prototype.queueOrSend = function(msg) {
      // Queue messages if we're not yet connected
      if (!this.ready) {
         this.queued.push(msg);
      } else {
         this.socket.send(msg);
      }
   };

   /**
    * Send a message without a guarantee that the message was
    * received or handled by the server.
    * @param msg {Object} The message to send
    */
   R.Socket.prototype.send = function(msg) {
      var wrap = {
         ack: R.Socket.TYPE_SEND,
         message: msg
      };
      this.queueOrSend(wrap);
   };

   /**
    * Send a broadcast message to the server.  Broadcast messages
    * are sent to all connected clients and are not guaranteed.
    * @param msg {Object} The message to send
    */
   R.Socket.prototype.broadcast = function(msg) {
      var wrap = {
         ack: R.Socket.TYPE_BROADCAST,
         message: msg
      };
      this.queueOrSend(wrap);
   };

   /**
    * Sends a message with a guarantee that will be returned by
    * the server when the message is received.
    *
    * @param msg {Object} The message to send
    * @param [cb] {Function} The callback function, or <tt>null</tt>.
    * @return {Number} The packet number
    */
   R.Socket.prototype.assure = function(msg, cb) {
      var wrap = {
         ack: this.packetNum++,
         message: msg
      };
      this.await(wrap.ack, cb);
      this.queueOrSend(wrap);
      return wrap.ack;
   };

   /*
   Socket.prototype.orderedAssure = function(prev, msg, cb) {
      var wrap = {
         ack: this.packetNum++,
         message: msg
      };

      var curry = function(ack) {
         if ()
      };

      this.await(wrap.ack, curry);
      this.queueOrSend(wrap);
      return wrap.ack;
   };
   */

   /**
    * Guaranteed messages awaiting acknowledgement register so their
    * callback will be triggered.
    * @param packetNum {Number} The packet number
    * @param [cb] {Function} the callback
    * @private
    */
   R.Socket.prototype.await = function(packetNum, cb) {
      this.awaitingACK.push({
         packet: packetNum,
         trigger: cb
      });
   };


/**
 * Socket connected message type
 * @type {Number}
 */
R.Socket.MSG_CONNECT = R.util.SocketUtil.MSG_CONNECT;

/**
 * Socket disconnected message type
 * @type {Number}
 */
R.Socket.MSG_DISCONNECT = R.util.SocketUtil.MSG_DISCONNECT;

/**
 * Socket acknowledges message received and handled type
 * @type {Number}
 */
R.Socket.MSG_ACK = R.util.SocketUtil.MSG_ACK;

/**
 * Server broadcast message type
 * @type {Number}
 */
R.Socket.MSG_SERVER = R.util.SocketUtil.MSG_SERVER;

R.Socket.TYPE_SEND = -1;

R.Socket.TYPE_BROADCAST = -2;
