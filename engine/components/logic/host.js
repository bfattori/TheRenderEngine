/**
 * The Render Engine
 * HostComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A component that can execute game objects.  Allows embedding
 *        of multiple objects into one object.  This is logically
 *        a method to embed further {@link R.engine.GameObject GameObjects} within
 *        an existing <tt>R.engine.GameObject</tt>.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of this component
 * @extends R.components.Logic
 * @constructor
 * @description Creates a <tt>R.components.Host</tt> which can contain {@link R.engine.GameObject GameObjects}.
 *              This allows a component to embed other game objects within it.  Each time the
 *              component is executed, each game object will be given a chance to update as well.
 */
class HostComponent extends LogicComponent {

  constructor(name, priority = 1.0) {
    super(name, priority);
    this.objects = HashContainer.create("hostedObjects");
  }

  release() {
    super.release();
    this.objects = null;
  }

  /**
   * Destroys the container which refers to the game objects.
   */
  destroy() {
    this.objects.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "HostComponent"
   */
  get className() {
    return "HostComponent";
  }

  /**
   * Add a {@link GameObject} to the component to be processed when
   * this component is executed.  Objects will be updated in the order in
   * which they are added.
   *
   * @param name {String} A unique name to refer to the object by
   * @param obj {GameObject} The game object reference
   */
  add(name, obj) {
    Assert((obj instanceof GameObject), "You can only add GameObject to a HostComponent");
    this.objects.add(name.toUpperCase(), obj);
  }

  /**
   * Retrieve the {@linkGameObject} that is associated with the
   * given name from the component.
   *
   * @param name {String} The unique name of the object
   * @return {GameObject}
   */
  get(name) {
    return this.objects.get(name.toUpperCase());
  }

  /**
   * Remove the game object from the component.
   *
   * @param obj {GameObject} The game object reference
   * @return {GameObject} The object which was removed
   */
  remove(obj) {
    return this.objects.remove(obj);
  }

  /**
   * Update each of the game objects within this component.  The order
   * in which game objects are updated is equivalent to the order in which
   * the objects were added.
   *
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    var itr = this.objects.iterator;
    while (itr.hasNext()) {
      var obj = itr.next();

      if (obj.renderContext !== this.gameObject.renderContext) {
        console.warn(obj.gameObject.id + " is not in the same context as " + this.gameObject.id);
      }

      // Make sure the game object's render context matches
      // this component's game object's context
      if (obj.renderContext === null) {
        obj.renderContext = this.gameObject.renderContext;
        console.warn("Swapped context with host");
      }

      obj.update(this.gameObject.renderContext, time, dt);
    }
  }
}
