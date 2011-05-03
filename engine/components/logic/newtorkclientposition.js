/**
 * The Render Engine
 * Network Position Component
 *
 * @fileoverview A simple component which uses the provided socket
 *    to transmit the location of the game object to the server.
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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.components.logic.NetworkClientPosition",
	"requires": [
		"R.components.Logic"
	]
});

/**
 * @class A very simple example component which sends the game object's
 *    client position in the world using a web socket.  You will need a
 *    valid socket and a running server to use this component.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of the component
 * @extends R.components.Logic
 * @constructor
 * @description Create a notifier component
 */
R.components.logic.NetworkClientPosition = function() {
	return R.components.Logic.extend(/** @scope R.components.logic.NetworkClientPosition.prototype */{

      socket: null,
      nextInterval: 0,
      interval: 0,

      constructor: function(socket, interval) {
         this.socket = null;
         this.nextInterval = 0;
         this.interval = interval || 20;
      },

      execute: function(renderContext, time, dt) {
         // Like to keep this from flooding the server
         if (time > this.nextInterval) {
            // Get the position of the game object
            var pos = this.getGameObject().getPosition();

            // Range on either axis is -32767 - 32767
            var signX = pos.x < 0 ? 1 : 0, signY = pos.y < 0 ? 1 : 0;
            var cPos = Math.abs(pos.x) << 16;
            cPos += Math.abs(pos.y) + ((signX << 31) + (signY << 15));

            // Encode in 4 bytes
            var sPos = String.fromCharCode((cPos & 0xff000000) >> 24,
                                           (cPos & 0xff0000) >> 16,
                                           (cPos & 0xff00) >> 8,
                                           (cPos & 0xff));

            // Transmit
            this.socket.send("p:" + sPos);
            this.nextInterval = time + this.interval;
         }
      }
   });
};
