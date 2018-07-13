/**
 * The Render Engine
 * Iterator
 *
 * @fileoverview A set of objects which can be used to create a collection
 *               of objects, and to iterate over a container.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1572 $
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
 * @class Create an iterator over a {@link R.struct.Container} or <code>Array</code> instance. An
 * iterator is a convenient object to traverse the list of objects
 * within the container.  The benefit of using an iterator with a <code>R.struct.Container</code> is
 * that if the container is modified, the <code>R.lang.Iterator</code> will reflect these changes.
 * <p/>
 * The simplest way to traverse the list is as follows:
 * <pre>
 * for (var itr = R.lang.Iterator.create(containerObj); itr.hasNext(); ) {
 *    // Get the next object in the container
 *    var o = itr.next();
 *
 *    // Do something with the object
 *    o.doSomething();
 * }
 *
 * // Destroy the iterator when done
 * itr.destroy();
 * </pre>
 * The last step is important so that you're not creating a lot
 * of objects, especially if the iterator is used repeatedly.
 * Since the iterator is a pooled object, it will be reused.
 *
 * @param container {R.struct.Container} The container to iterate over.
 * @constructor
 * @extends R.engine.PooledObject
 * @description Create an iterator over a collection
 */
class Iterator extends PooledObject {

  constructor(container /*, actualContainerObj */) {
    super("Iterator");
    this.c = container;
    this.aO = (arguments.length == 2 ? arguments[1] : null);
    this.arr = R.isArray(container);    // Handle plain Arrays too
    this.p = this.arr ? 0 : container._head;
    this.r = false;
  }

  /**
   * Release the iterator back into the object pool.
   */
  release() {
    super.release();
    this.c = null;
    this.aO = null;
    this.arr = false;
    this.p = null;
    this.r = false;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "Iterator"
   */
  get className() {
    return "Iterator";
  }


  /**
   * Reset the iterator to the start of the collection.
   */
  reset() {
    this.p = this.arr ? (this.r ? this.c.length - 1 : 0) : (this.r ? this.c._tail : this.c._head);
  }

  /**
   * Reverse the order of the elements in the container (non-destructive) before
   * iterating over them.  You cannot call this method after you have called {@link #next},
   * otherwise, use {@link #reset} before calling this method.
   */
  reverse() {
    Assert((this.arr ? this.p == 0 : this.p === this.c._head), "Cannot reverse Iterator after calling next()");
    this.r = true;
    this.p = this.arr ? this.c.length - 1 : this.c._tail;
  }

  /**
   * Get the next element from the iterator.
   * @return {Object} The next element in the iterator
   * @throws {Error} An error if called when no more elements are available
   */
  next() {
    // Make sure the container wasn't destroyed
    if (this.arr ? (this.aO != null ? this.aO._destroyed : false) : this.c._destroyed) {
      throw new Error("Invalid iterator over destroyed container!");
    }

    var o = null;
    if (this.arr) {
      // For arrays
      Assert(this.p > -1 && this.p < this.c.length, "Iterator[" + this.getId() + "] - next() is out of range");
      o = this.c[this.p];
      this.p += (this.r ? -1 : 1);
    } else {
      // For containers
      // Get the next and move the pointer
      o = this.p.ptr;
      this.p = (this.r ? this.p.prev : this.p.next);

      if (o == null) {
        Assert(false, "Iterator[" + this.getId() + "] - next() is out of range");
      }
    }

    return o;
  }

  /**
   * Returns <tt>true</tt> if the iterator has more elements.
   * @return {Boolean}
   */
  hasNext() {
    // As long as the container hasn't been destroyed
    if (this.arr ? (this.aO != null ? !this.aO._destroyed : true) : !this.c._destroyed) {
      if (this.arr) {
        // For arrays (and R.struct.Container)
        var nxt = this.r ? -1 : 1, n = this.p,
          dead = (this.c[n] && this.c[n]._destroyed === true);
        while ((n > -1 && n < this.c.length) && dead) {
          // Skip dead objects
          n += nxt;
          this.p = n;
        }
        return (n > -1 && n < this.c.length);
      } else {
        // If the container hasn't been destroyed
        while (this.p != null && this.p.ptr != null && this.p.ptr._destroyed) {
          // Skip destroyed objects
          this.p = (this.r ? this.p.prev : this.p.next);
        }
        return this.p != null;
      }
    }
    return false;
  }

  /**
   * Create an instance of an iterator over the given container.
   * @param container {Container|Array} An <code>Array</code> or {@link Container}
   * @return {Iterator} An iterator over the container
   */
  static over(container) {
    return Iterator.create(container);
  }

}

