/**
 * The Render Engine
 * Network Position Component
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

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
class NetworkClientPositionComponent extends LogicComponent {

  constructor(name, priority, socket, interval) {
    this.socket = null;
    this.nextInterval = 0;
    this.interval = interval || 20;
    super(name, priority);
  }

  execute(time, dt) {
    // Like to keep this from flooding the server
    if (time > this.nextInterval) {
      // Get the position of the game object
      var pos = this.gameObject.position;

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
}