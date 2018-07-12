/**
 * The Render Engine
 * StateMachine component
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

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
class StateMachineComponent extends LogicComponent {

  /**
   * The default time between state changes (1000 milliseconds)
   * @type {Number}
   */
  static DEFAULT_INTERVAL = 1000;

  /**
   * The machine state data model location.
   * @type {String}
   */
  static MACHINE_STATE = "MachineState";

  constructor(name, priority, states) {
    super(name, priority);
    this.states = states;
    this.machine = null;
    this._updateInterval = 0;
    this._lastUpdate = 0;
  }

  get className() {
    return "StateMachineComponent";
  }

  /**
   * Set the behavior tree for the state machine.  This is also used to configure how
   * often the machine is updated.  By tweaking the speed at which decisions are made,
   * it is possible to simulate faster or slower "behavior" or "thought" processing.
   *
   * @param stateTree {Object} The behavior tree object
   */
  set behaviorTree(stateTree) {
    this._updateInterval = StateMachineComponent.DEFAULT_INTERVAL;
    this.machine = new MachineJS();

    // Create the state machine on the game object
    this.gameObject.setObjectDataModel(StateMachineComponent.MACHINE_STATE,
      this.machine.generateTree(stateTree, this.gameObject, this.states));
  }

  /**
   * Set the interval at which the machine's state is updated.
   * @param updateInterval {Number} The number of milliseconds between state changes
   */
  set updateInterval(updateInterval) {
    this._updateInterval = updateInterval;
    this._lastUpdate = 0;
  }

  /**
   * Update the state machine for each step of the engine.
   *
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    if (time - this._lastUpdate > this._updateInterval) {
      // Transition to the next state
      var state = this.gameObject.getObjectDataModel(StateMachineComponent.MACHINE_STATE);

      state = state.tick();
      this._lastUpdate = time;
    }
    super.execute(time, dt);
  }

}
