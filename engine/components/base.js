/**
 * The Render Engine
 * BaseComponent
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class All components extend from this object class.  A component is one
 *        part of an operating whole object (a {@link R.engine.GameObject}) which is
 *        responsible for only a portion of the overall operation of the
 *        game object.  Components are broken down into five major categories:
 *        <ul>
 *          <li><b>TYPE_INPUT</b> - Input from controllers (keyboard, mouse, etc.)</li>
 *          <li><b>TYPE_TRANSFORM</b> - Performs transformations on the host object</li>
 *          <li><b>TYPE_LOGIC</b> - Handles logical operations that are not related to
 *              input and collision</li>
 *          <li><b>TYPE_COLLIDER</b> - Determines what this object is possibly colliding
 *              with, and reports those collisions via callbacks to the host.</li>
 *          <li><b>TYPE_RENDERING</b> - Performs some sort of rendering operation to the context</li>
 *        </ul>
 *        Components are executed in the order listed.  First, all inputs are
 *        checked, then logic is performed.  Logic may be internal to a game object
 *        itself, but some components perform an object-centric type of logic that
 *        can be reused.  Next, collisions are checked.  And finally, rendering can
 *        occur.
 *        <p/>
 *        Within each component type set, components can be prioritized so that
 *        one component will execute before others.  Such an ordering allows for
 *        multiple components of each type to perform their tasks in an order
 *        that the game object defines.
 *
 *
 * @extends BaseObject
 * @constructor
 * @description Create a new instance of a component, setting the name, type, and
 *              update priority of this component compared to all other components
 *              within the host.
 * @param name {String} The name of the component
 * @param type {Number} The type of the component
 * @param priority {Number} A value between 0.0 and 1.0.  Default: 0.5
 */
class BaseComponent extends BaseObject {

  static TYPE_UNKNOWN   = -1;
  static TYPE_PRE       = 0;
  static TYPE_INPUT     = 1;
  static TYPE_TRANSFORM = 2;
  static TYPE_LOGIC     = 3;
  static TYPE_COLLIDER  = 4;
  static TYPE_RENDERING = 5;
  static TYPE_POST      = 6;

  constructor(name, type, priority = 0.5) {
    Assert((name != null), "You must assign a name to every Component.");

    Assert((type != null && (type >= BaseComponent.TYPE_PRE && type <= BaseComponent.TYPE_POST)),
      "You must specify a type for component");

    Assert((priority != null && (priority >= 0.0 && priority <= 1.0)),
      "Priority must be between 0.0 and 1.0 for component");

    this._type = type;
    this._priority = priority;
    this._gameObject = null;

    name = name.toUpperCase();
    super(name);
  }

  release() {
    super.release();
    this._priority = 0;
    this._type = -1;
    this._gameObject = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "BaseComponent"
   */
  get className() {
    return "BaseComponent";
  }

  /**
   * Establishes the link between this component and its game object.
   * When you assign components to a game object, it will call this method
   * so that each component can refer to its game object, the same way
   * a game object can refer to a component with {@link GameObject#getComponent}.
   *
   * @param gameObject {GameObject} The object which hosts this component
   */
  set gameObject(gameObject) {
    this._gameObject = gameObject;
  }

  /**
   * Gets the game object this component is a part of.  When the component was
   * assigned to a game object, the game object will have set itself as the container
   * via {@link #setGameObject}.
   *
   * @return {GameObject}
   */
  get gameObject() {
    return this._gameObject;
  }

  /**
   * Get the type of this component.  The value will be one of:
   * {@link #TYPE_INPUT}, {@link #TYPE_TRANSFORM}, {@link #TYPE_LOGIC},
   * {@link #TYPE_COLLIDER}, or {@link #TYPE_RENDERING}
   *
   * @return {Number} The component type Id
   */
  get type() {
    return this._type;
  }

  /**
   * Set the execution priority of this component with
   * 1.0 being the highest priority and 0.0 being the lowest.  Components
   * within a game object are sorted by type, and then priority.  As such,
   * two components with the same type will be sorted by priority with the
   * higher value executing before the lower value.  This allows you to layer
   * components like the {@link RenderComponent} component so that one effect
   * is drawn before another.
   *
   * @param priority {Number} A value between 0.0 and 1.0
   */
  set priority(priority) {
    this._priority = priority;
    if (this._gameObject) {
      this._gameObject.sort();
    }
  }

  /**
   * Returns the priority of this component.
   *
   * @return {Number} A value between 0.0 and 1.0
   */
  get priority() {
    return this._priority;
  }

  /**
   * [ABSTRACT] This method is called by the game object to update the component's state
   * Not all components will need an execute method.  However, it is important to include one if you need to
   * update the state of the component for each engine cycle.
   *
   * @param time {Number} The global engine time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
  }

  /**
   * [ABSTRACT] This method is called by the game object to render the component.
   *
   * @param renderContext {AbstractRenderContext} The context the component will render within.
   */
  render(renderContext) {
  }

  /**
   * Get the type of the component as a string.
   * @return {String}
   */
  get typeString() {
    var ts = "";
    switch (this._type) {
      case BaseComponent.TYPE_PRE:
        ts = "TYPE_PRE";
        break;
      case BaseComponent.TYPE_INPUT:
        ts = "TYPE_INPUT";
        break;
      case BaseComponent.TYPE_TRANSFORM:
        ts = "TYPE_TRANSFORM";
        break;
      case BaseComponent.TYPE_LOGIC:
        ts = "TYPE_LOGIC";
        break;
      case BaseComponent.TYPE_COLLIDER:
        ts = "TYPE_COLLIDER";
        break;
      case BaseComponent.TYPE_RENDERING:
        ts = "TYPE_RENDERING";
        break;
      case BaseComponent.TYPE_POST:
        ts = "TYPE_POST";
        break;
      default:
        ts = "TYPE_UNKNOWN";
    }

    return ts;
  }


}


