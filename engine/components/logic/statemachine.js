/**
 * The Render Engine
 *
 * StateMachine component
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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
   "class": "R.components.logic.StateMachine",
   "requires": [],
   "includes": [
      "/libs/machine.js"
   ]
});

/**
 * @class A component that uses a behavior tree to process state changes.  This is
 *    based on Mary Rose Cook's excellent Machine.js (which is linked in) so for now
 *    look to:
 *    <blockquote>
 *       http://machinejs.maryrosecook.com/
 *    </blockquote>
 *    The states, themselves, should exist on your {@link R.engine.GameObject} for
 *    which this component is used.
 *
 * @param name {String} The name of the component
 * @param [states=null] {Object} A states control object, if <code>null</code> assumes the state
 *    methods exist on the host.
 * @param [priority=1.0] {Number} The priority of this component
 * @extends R.components.Logic
 * @constructor
 * @description Creates a state machine which is used to drive the behaviors of your game object.
 */
R.components.logic.StateMachine = function() {
   return R.components.Logic.extend(/** @scope R.components.logic.StateMachine.prototype */{

      machine: null,
      states: null,
      updateInterval: 0,
      lastUpdate: 0,

      /** @private */
      constructor: function(name, states, priority) {
         if (R.isNumber(states)) {
            priority = states;
            states = null;
         }

         this.base(name, priority);
         this.states = states;
         this.machine = null;
         this.updateInterval = 0;
         this.lastUpdate = 0;
      },

      /**
       * Set the behavior tree for the state machine.  This is also used to configure how
       * often the machine is updated.  By tweaking the speed at which decisions are made,
       * it is possible to simulate faster or slower "behavior" or "thought" processing.
       *
       * @param stateTree {Object} The behavior tree object
       * @param [updateInterval=1000] {Number} The number of milliseconds between state changes
       */
      setBehaviorTree: function(stateTree, updateInterval) {
         this.updateInterval = updateInterval || R.components.logic.StateMachine.DEFAULT_INTERVAL;
         this.machine = new MachineJS();

         // Create the state machine on the game object
         this.getGameObject().setObjectDataModel(R.components.logic.StateMachine.MACHINE_STATE,
                       this.machine.generateTree(stateTree, this.getGameObject(), this.states));
      },

      /**
       * Set the interval at which the machine's state is updated.
       * @param updateInterval {Number} The number of milliseconds between state changes
       */
      setUpdateInterval: function(updateInterval) {
         this.updateInterval = updateInterval;
         this.lastUpdate = 0;
      },

      /**
       * Update the state machine for each step of the engine.
       *
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      execute: function(renderContext, time, dt) {
         if (time - this.lastUpdate > this.updateInterval) {
            // Transition to the next state
            var state = this.getGameObject()
               .getObjectDataModel(R.components.logic.StateMachine.MACHINE_STATE);

            state = state.tick();
            this.lastUpdate = time;
         }
      }

   }, /** @scope R.components.logic.StateMachine.prototype */{
      getClassName: function() {
         return "R.components.logic.StateMachine";
      },

      /**
       * The default time between state changes (1000 milliseconds)
       * @type {Number}
       */
      DEFAULT_INTERVAL: 1000,

      /**
       * The machine state data model location.
       * @type {String}
       */
      MACHINE_STATE: "MachineState"
   });
};