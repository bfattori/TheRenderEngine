/**
 * The Render Engine
 * InputComponent
 *
 * @fileoverview The base input component.
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
   "class": "R.components.Input",
   "requires": [
      "R.components.Base"
   ]
});

/**
 * @class A component which can read an input device and make those inputs
 *        available to a {@link R.engine.GameObject}.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The component's priority
 * @extends R.components.Base
 * @constructor
 * @description Create an input component.
 */
R.components.Input = function() {
   return R.components.Base.extend(/** @scope R.components.Input.prototype */{

      recording: false,
      playback: false,
      script: null,
      lastInputTime: 0,

      /** @private */
      constructor: function(name, priority) {
         this.base(name, R.components.Base.TYPE_INPUT, priority || 1.0);
         this.recording = false;
         this.playback = false;
      },

      /** @private */
      startRecording: function() {
         R.debug.Console.debug("RECORDING INPUT");
         this.recording = true;
         this.lastInputTime = R.Engine.worldTime;
         this.script = [];
      },

      /** @private */
      stopRecording: function() {
         R.debug.Console.debug("RECORDING STOPPED");
         this.recording = false;
      },

      /** @private */
      getScript: function() {
         return this.script;
      },

      /** @private */
      setScript: function(script) {
         this.script = script;
      },

      /** @private */
      playEvent: function() {
         // ABSTRACT
      },

      /** @private */
      playScript: function(script) {
         this.recording = false;
         this.playback = true;
         this.script = script;

          var scriptObj = {
              script:script,
              playEvent:R.Bind(this, this.playEvent),
              evt:null
          }, popCall;

          popCall = R.bind(scriptObj, function () {
              if (this.script.length == 0) {
                  return;
              }
              if (this.evt != null) {
                  R.debug.Console.log("PLAYBACK:", this.evt.type);
                  this.playEvent(this.evt);
              }
              this.evt = this.script.shift();
              setTimeout(popCall, this.evt.delay);
          });

          popCall();
      },

      /** @private */
      record: function(eventObj, parts, time, dt) {
         // TODO: Now with engine time and delta we should be able
         // to accurately record and playback demos
         if (!this.recording) {
            return;
         }
         var evtCall = {};
         for (var x in parts) {
            evtCall[parts[x]] = eventObj[parts[x]];
         }
         evtCall.delay = R.Engine.worldTime - this.lastInputTime;
         this.lastInputTime = R.Engine.worldTime;
         evtCall.type = eventObj.type;
         this.script.push(evtCall);
      }

   }, /** @scope R.components.Input.prototype */{
      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.Input"
       */
      getClassName: function() {
         return "R.components.Input";
      }
   });
}