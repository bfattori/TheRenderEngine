/**
 * The Render Engine
 * AbstractCollisionNode
 *
 * @fileoverview Abstract node class within a broad-phase collision model.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
 * @class A node within a broad-phase collision model which contains a list of
 *        game objects within it.
 *
 * @constructor
 * @description Abstract class from which broad-phase collision model nodes are derived
 */
class AbstractCollisionNode {

  static NODE_INDEX = 1;

  constructor() {
    this.idx = AbstractCollisionNode.NODE_INDEX++;
    this._objects = Container.create("collisionNodeObjects");
    this._dirty = true;
  }

  destroy() {
    this.objects.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.collision.broadphase.AbstractCollisionNode"
   */
  get className() {
    return "AbstractCollisionNode";
  }

  /**
   * Get the unique index of this node.
   * @return {Number} The index of this node
   */
  get index() {
    return this.idx;
  }

  get dirty() {
    return this._dirty;
  }

  /**
   * Clear the dirty flag after the node has been processed.
   */
  clearDirty() {
    this._dirty = false;
  }

  /**
   * Get a Container which is all objects within this node.
   * @return {Container} Objects in the node
   */
  get objects() {
    return this._objects;
  }

  /**
   * Get the count of objects within the node.
   * @return {Number}
   */
  get count() {
    return this._objects.size();
  }

  /**
   * Add an object to this node.
   *
   * @param obj {BaseObject} The object to add to this node.
   */
  addObject(obj) {
    this._objects.add(obj);
    this._dirty = true;
  }

  /**
   * Remove an object from this node
   *
   * @param obj {BaseObject} The object to remove from this node
   */
  removeObject(obj) {
    this._objects.remove(obj);
    this._dirty = true;
  }

  /**
   * Returns true if the spatial node contains the point specified.
   * @param point {Point2D} The point to check
   * @return {Boolean}
   */
  contains(point) {
    return false;
  }

}