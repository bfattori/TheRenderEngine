/**
 * The Render Engine
 * GameObject
 *
 * @fileoverview An object which contains components.  This is a base
 *               class for most in-game objects.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1573 $
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
"use strict";

/**
 * @class A game object is a container for components.  Each component within
 *        the object provides a portion of the overall functionality.  A game object
 *        can have any number of components of any type within it.  Components provide
 *        functionality for things like rendering, collision detection, effects, or
 *        transformations. This way, an object can be anything, depending on it's components.
 *        <p/>
 *        A <tt>GameObject</tt> is the logical foundation for all in-game objects.  It is
 *        through this mechanism that game objects can be created without having to manipulate
 *        large, monolithic objects.  A <tt>GameObject</tt> contains {@link R.components.Base Components},
 *        which are the building blocks for complex functionality and ease of development.
 *        <p/>
 *        By building a <tt>GameObject</tt> from multiple components, the object gains the
 *        component's functionality without necessarily having to implement anything.  Many
 *        components already exist in the engine, but you are only limited by your imagination
 *        when it comes to developing new components.
 *
 * @extends BaseObject
 * @constructor
 * @description Create a game object.
 */
class GameObject extends BaseObject {

  /** @private */
  constructor(name) {
    super(name);
    this.dirtyFlag = true;
    this.oldDirty = false;
    this.renderContext = null;
    this.keepAlive = false;
    this.componentProps = {};
    this.componentEvents = {};

    this._preRenderComponents = HashContainer.create("preRenderComponents");
    this._postRenderComponents = HashContainer.create("postRenderComponents");
    this._components = HashContainer.create("nonRenderComponents");
    this._renderComponents = HashContainer.create("renderComponents");

    this._allObjects = null;
  }

  /**
   * Release the object back into the object pool.
   */
  release() {
    super.release();
    this._renderContext = null;
    this._dirtyFlag = false;
    this._oldDirty = false;
    this._keepAlive = false;
    this.componentProps = null;
    this.componentEvents = null;

    this._preRenderComponents = null;
    this._postRenderComponents = null;
    this._components = null;
    this._renderComponents = null;
    this._allObjects = null;
  }

  /**
   * Destroy all of the components within this object and
   * remove this object from it's render context.
   */
  destroy() {
    if (this._renderContext !== null) {
      // remove us from the render context
      this._renderContext.remove(this);
    }

    this._preRenderComponents.destroy();
    this._postRenderComponents.destroy();
    this._components.destroy();
    this._renderComponents.destroy();
    if (this._allObjects) {
      this._allObjects.destroy();
    }

    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.engine.GameObject"
   */
  get className() {
    return "GameObject";
  }

  /**
   * Marks the object as dirty.  An object is considered dirty if something about
   * it has changed which would affect how it is rendered.
   */
  markDirty() {
    this.dirtyFlag = true;
  }

  set dirty(v) {
    this.dirtyFlag = true;
  }

  /**
   * Check the flag which indicates if the object is dirty.
   * @return {Boolean}
   */
  isDirty() {
    return this.dirtyFlag;
  }

  get dirty() {
    return this.dirtyFlag;
  }

  /**
   * Check the flag which indicates if the object <i>was</i> dirty the last time
   * it was updated.  Objects which aren't dirty, but were dirty, need to be redrawn
   * one more time so they aren't missed in the next frame.
   * @return {Boolean}
   */
  wasDirty() {
    return this.oldDirty;
  }

  /**
   * Set the rendering context this object will be drawn within.  This method is
   * called when a host object is added to a rendering context.
   *
   * @param renderContext {AbstractRenderContext} The context
   */
  set renderContext(renderContext) {
    this._renderContext = renderContext;
    this.markDirty();

    //TODO: Remove magic - needs to be deterministic
    if (this.afterAdd) {
      // If the object being added to the render context has
      // an "afterAdd" method, call it
      this.afterAdd(renderContext);
    }
  }

  /**
   * Get the rendering context this object will be drawn upon.
   *
   * @return {AbstractRenderContext} The render context the object belongs to
   */
  get renderContext() {
    return this._renderContext;
  }

  /**
   * Sort components within this object based upon their component
   * type, and the priority within that type.  Components with a higher
   * priority will be sorted before components with a lower priority.
   * @static
   */
  static componentSort(component1, component2) {
    return ((component1.type - component2.type) +
    ((1 / component1.priority) - (1 / component2.priority)));
  }

  /**
   * Update the object in the world.
   *
   * @param time {Number} The global time within the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  update(time, dt) {
    // Update pre-render components
    var components = this.all.iterator;
    while (components.hasNext()) {
      components.next().execute(time, dt);
    }
    components.destroy();

    super.update(time, dt);
  }

  /**
   * Render this object to the output context.
   * @param renderContext {RenderContext2D}
   */
  render(renderContext) {
    // Run the render components
    var components = this._renderComponents.iterator;
    while (components.hasNext()) {
      components.next().render(this._renderContext);
    }
    components.destroy();

    this._oldDirty = this.dirtyFlag;
    this._dirtyFlag = false;

    super.render();
  }

  /**
   * Run pre-render or post-render components.
   * @param type {Number} The component type
   * @param renderContext {AbstractRenderContext} The context the object will be rendered within.
   * @private
   */
  runPreOrPostComponents(type, renderContext) {
    var components = type === BaseComponent.TYPE_PRE ? this._preRenderComponents : this._postRenderComponents;
    if (components !== null) {
      for (var cIdx = 0; cIdx < components.length; cIdx++) {
        components[cIdx].render(renderContext);
      }
    }
  }

  /**
   * Keep object alive, even when outside viewport.  Setting an object to the "keep alive"
   * state will keep the object from being put into the render context's inactive bin,
   * even when it is outside of the expanded viewport.  This is good for objects which
   * traverse a large area of the game world.
   * @param state {Boolean} <code>true</code> to keep the object alive at all times
   */
  set keepAlive(state) {
    this._keepAlive = state;
  }

  /**
   * Returns <code>true</code> if the object is to be kept alive (updated) at all times.
   * @return {Boolean}
   */
  get keepAlive() {
    return this._keepAlive;
  }

  /**
   * Add a component to the game object.  The components will be
   * sorted based on their type then their priority within that type.
   * Components with a higher priority will be sorted before components
   * with a lower priority.  The sorting order for type is:
   * <ul>
   * <li>Input</li>
   * <li>Transform</li>
   * <li>Logic</li>
   * <li>Collision</li>
   * <li>Rendering</li>
   * </ul>
   *
   * @param component {BaseComponent} A component to add to the host
   */
  add(component) {

    Assert((BaseComponent.isInstance(component)), "Cannot add a non-component to a GameObject");

    // Put the components into the right container
    var container = this._components;
    if (component.type === BaseComponent.TYPE_PRE) {
      container = this._preRenderComponents;
    } else if (component.type === BaseComponent.TYPE_POST) {
      container = this._postRenderComponents;
    } else if (component.type === BaseComponent.TYPE_RENDERING) {
      container = this._renderComponents;
    }

    component.gameObject = this;
    container.add(component.name, component);
    container.sort(GameObject.componentSort);

    // Force update
    GameObject.allObjects = null;

    this.markDirty();
  }

  /**
   * Remove the component from the game object
   * @param component {BaseComponent} The component to remove, or the name of the component to remove
   */
  remove(component) {
    var container = this._components;
    if (component.type === BaseComponent.TYPE_PRE) {
      container = this._preRenderComponents;
    } else if (component.type === BaseComponent.TYPE_POST) {
      container = this._postRenderComponents;
    } else if (component.type === BaseComponent.TYPE_RENDERING) {
      container = this._renderComponents;
    }

    return container.remove(c);
  }

  _searchContainers(name) {
    var component = this._components.get(name.toUpperCase());
    if (!component) {
      component = this._renderComponents.get(name.toUpperCase());
    }
    if (!component) {
      component = this._preRenderComponents.get(name.toUpperCase());
    }
    if (!component) {
      component = this._postRenderComponents.get(name.toUpperCase());
    }
    return component;
  }

  /**
   * Get the component with the specified name from this object.
   *
   * @param name {String} The unique name of the component to get
   * @return {BaseComponent}
   */
  getComponent(name) {
    return this._searchContainers(name);
  }

  /**
   * Get a component by class name.  If there is more than one component with the given
   * class, returns the first occurrence.
   * @param className {String} The class name
   * @return {BaseComponent} The component, or <code>null</code> if not found
   */
  getComponentByClass(className) {
    var clazz = R.getClassForName(className);
    if (undefined === clazz) {
      return null;
    }

    var c = this.getAll();
    for (var i in c) {
      if (c.hasOwnProperty(i) && c[i] instanceof clazz) {
        return c[i];
      }
    }
    return null;
  }

  getAll() {
    var arr = [];
    arr.concat(
      this._components.getAll(),
      this._renderComponents.getAll(),
      this._preRenderComponents.getAll(),
      this._postRenderComponents.getAll()
    );
    return arr;
  }


  get all() {
    if (this._allObjects === null) {
      this._allObjects = HashContainer.create("allComponents");
      this._allObjects.addAll(this._components);
      this._allObjects.addAll(this._renderComponents);
      this._allObjects.addAll(this._preRenderComponents);
      this._allObjects.addAll(this._postRenderComponents);
    }

    return this._allObjects;
  }

  addComponentProperty(name, accessor) {
    // Add a property to the game object directly from the component
    this.componentProps[name] = accessor;
    Object.defineProperty(this, "$"+name, {
      get() { return accessor.get(); },
      set(val) { accessor.set(val); },
      enumerable: false,
      writeable: false
    });
  }

  addComponentEvent(name, handler) {
    // Add a default handler so we don't have to perform checks
    this.componentEvents[name] = handler;
    this["on"+name] = handler;
  }

  /**
   * Returns a property object with accessor methods.
   * @return {Object}
   */
  getProperties() {
    var props = super.getProperties();
    props.add("RenderContext",
      [
        function () {
          return this.renderContext.name;
        },
        null
      ]);
    return props;
  }

}
