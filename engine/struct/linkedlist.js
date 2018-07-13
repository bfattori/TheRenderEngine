/**
 * The Render Engine
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A linked list is a logical collection of objects.
 *        When a linked list is destroyed, none of the objects within it
 *        are destroyed with it.  If the objects must be destroyed, call
 *        {@link #cleanUp}.  This type of list is doubly-linked, which means
 *        you can traverse it both forward and backward.
 *
 * @param containerName {String} The name of the container
 * @extends Container
 * @constructor
 * @description Create a linked list container.
 */
class LinkedList extends Container {

  constructor(containerName = "LinkedList") {
    super(containerName);
    this._head = null;
    this._tail = null;
    this._sz = 0;
  }

  /**
   * Release the object back into the object pool.
   */
  release() {
    super.release();
    this.clear();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "LinkedList"
   */
  get className() {
    return "LinkedList";
  }

  /** @private */
  static resolved() {
    LinkedList.EMPTY = new LinkedList("EMPTY");
    Object.freeze(LinkedList.EMPTY);
  }

  /**
   * Create a new <code>LinkedList</code> from an <code>Array</code>.
   * @param array {Array} An array of objects
   * @return {LinkedList}
   * @static
   */
  static fromArray(array) {
    var c = LinkedList.create();
    c.addAll(array);
    return c;
  }

  /**
   * An empty container - DO NOT MODIFY!!
   * @type {LinkedList}
   */
  static EMPTY = null;

  /**
   * Returns the count of the number of objects within the
   * container.
   *
   * @return {Number} The number of objects in the container
   */
  get size() {
    return this._sz;
  }

  /**
   * Create a new node for the list
   * @param obj {Object} The object
   * @private
   */
  static _new(obj) {
    var o = {
      prev: null,
      next: null,
      ptr: obj
    };
    return o;
  }

  /**
   * Find the list node at the given index.  No bounds checking
   * is performed with this function.
   * @param idx {Number} The index where the item exists
   * @param offset {Object} The object to start at, "head" if null
   * @private
   */
  _find(idx, offset) {
    var n = offset || this._head, c = idx;
    while (n != null && c-- > 0) {
      n = n.next;
    }
    return (c > 0 ? null : n);
  }

  /**
   * Look through the list to find the given object.  If the object is
   * found, the  list node is returned.  If no object is found, the method
   * returns <code>null</code>.
   *
   * @param obj {Object} The object to find
   * @private
   */
  _peek(obj) {
    var n = this._head;
    while (n != null) {
      if (n.ptr === obj) {
        return n;
      }
      n = n.next;
    }
    return null;
  }

  /**
   * Returns <tt>true</tt> if the object is in the container.
   * @param obj {Object} The object to find
   * @return {Boolean}
   */
  contains(obj) {
    return (this._peek(obj) !== null);
  }

  /**
   * Add an object to the container.
   *
   * @param obj {Object} The object to add to the container.
   */
  add(obj) {
    var n = this._new(obj);
    if (this._head == null && this._tail == null) {
      this._head = n;
      this._tail = n;
    } else {
      this._tail.next = n;
      n.prev = this._tail;
      this._tail = n;
    }

    //if (obj.getId) {
    //    console.info("Added ", obj.getId(), "[", obj, "] to ", this.getId(), "[", this, "]");
    //}
    this._sz++;

    // Return the last node that was added
    return n;
  }

  /**
   * Concatenate a container or array to the end of this container,
   * returning a new container with all of the elements.  The
   * array or container will be copied and appended to this
   * container.  While the actual pointers to the objects aren't deep copied,
   * one can be assured that modifying the array or container structure being
   * appended will not affect either container.  Note, however, that modifying
   * the objects within the container will modify the objects in the original
   * containers as well.
   *
   * @param arr {Container|Array} A container or array of objects
   * @return {Container} A new container with all objects from both
   */
  concat(arr) {
    if (arr instanceof Container) {
      arr = arr.getAll();
    }
    var c = this.clone();
    c.addAll(arr);
    return c;
  }

  /**
   * Append a container to the end of this container.  When you append a
   * container, its head will now point to the tail of this container and
   * the tail of this container will become the tail of the appended container.
   * The appended container will still exist, but navigating the container in
   * reverse past the head of the container will navigate into the container
   * which was appended to.  If you need the containers to remain independent
   * of eachother, see the {@link #concat} method.
   *
   * @param c {Container} The container to append.
   */
  append(c) {
    if (!(c instanceof LinkedList)) {
      console.error("Can only append LinkedList, or subclasses, to a LinkedList");
      return;
    }

    // Create the linkage and update the tail
    if (this._head == null && this._tail == null &&
      c._head != null && c._tail != null) {
      // If the container is empty, but the one to append is not
      this._head = c._head;
      this._tail = c._tail;
    } else if (this._head != c._head && this._tail != c._tail) {
      c._head.prev = this._tail;
      this._tail.next = c._head;
      this._tail = c._tail;
    }
  }

  /**
   * Insert an object into the container at the given index. Asserts if the
   * index is out of bounds for the container.  The index must be greater than
   * or equal to zero, and less than or equal to the size of the container minus one.
   * The effect is to extend the length of the container by one.
   *
   * @param index {Number} The index to insert the object at.
   * @param obj {Object} The object to insert into the container
   */
  insert(index, obj) {
    Assert(!(index < 0 || index > this._sz), "Index out of range when inserting object!");
    var o = this._find(index);
    var n = this._new(obj);

    n.prev = o.prev;
    n.prev.next = n;
    n.next = o;
    o.prev = n;
    this.sz++;

    // Return the last node that was inserted
    return n;
  }

  /**
   * Replaces the given object with the new object.  If the old object is
   * not found, no action is performed.
   *
   * @param oldObj {Object} The object to replace
   * @param newObj {Object} The object to put in place
   * @return {Object} The object which was replaced
   */
  replace(oldObj, newObj) {
    var o = this._peek(oldObj), r = null;
    if (o.ptr != null) {
      r = o.ptr;
      o.ptr = newObj;
    }
    return r;
  }

  /**
   * Replaces the object at the given index, returning the object that was there
   * previously. Asserts if the index is out of bounds for the container.  The index
   * must be greater than or equal to zero, and less than or equal to the size of the
   * container minus one.
   *
   * @param index {Number} The index at which to replace the object
   * @param obj {Object} The object to put in place
   * @return {Object} The object which was replaced
   */
  replaceAt(index, obj) {
    Assert(!(index < 0 || index > this._sz), "Index out of range when inserting object!");
    var o = this._find(index);
    var r = o.ptr;
    o.ptr = obj;
    return r;
  }

  /**
   * Remove an object from the container.  The object is
   * not destroyed when it is removed from the container.
   *
   * @param obj {Object} The object to remove from the container.
   * @return {Object} The object that was removed
   */
  remove(obj) {
    var o = this._peek(obj);
    //AssertWarn(o != null, "Removing object from collection which is not in collection");

    if (o != null) {
      if (o === this._head && o === this._tail) {
        this.clear();
        this.sz = 0;
        return null;
      }

      if (o === this._head) {
        this._head = o.next;
        if (this._head == null) {
          this.clear();
          this.sz = 0;
          return null;
        }
      }

      if (o === this._tail) {
        this._tail = o.prev;
      }

      if (o.next) o.next.prev = o.prev;
      if (o.prev) o.prev.next = o.next;
      o.prev = o.next = null;
      this.sz--;

      //if (obj.getId) {
      //    console.info("Removed ", obj.getId(), "[", obj, "] from ", this.getId(), "[", this, "]");
      //}

      return o.ptr;
    }
    return null;
  }

  /**
   * Remove an object from the container at the specified index.
   * The object is not destroyed when it is removed.
   *
   * @param idx {Number} An index between zero and the size of the container minus 1.
   * @return {Object} The object removed from the container.
   */
  removeAtIndex(idx) {
    Assert((idx >= 0 && idx < this._sz), "Index of out range in Container");

    var o = this._find(idx);
    if (o === this._head) {
      this._head = o.next;
    }
    if (o === this.tail) {
      this._tail = o.prev;
    }
    if (o.next) o.next.prev = o.prev;
    if (o.prev) o.prev.next = o.next;
    o.prev = o.next = null;
    var r = o.ptr;

    //console.info("Removed ", r.getId(), "[", r, "] from ", this.getId(), "[", this, "]");
    this.sz--;
    return r;
  }

  /**
   * Reduce the container so that it's length is the specified length.  If <code>length</code>
   * is larger than the size of this container, no operation is performed.  Setting <code>length</code>
   * to zero is effectively the same as calling {@link #clear}.  Objects which would logically
   * fall after <code>length</code> are not automatically destroyed.
   *
   * @param length {Number} The maximum number of elements
   * @return {Container} The subset of elements being removed
   */
  reduce(length) {
    if (length > this._sz) {
      return null;
    }
    var a = this.getAll();
    var sub = this.subset(length, a.length, a);
    if (length == 0) {
      return sub;
    }

    a.length = length;
    this.clear();
    for (var i in a) {
      this.add(a[i]);
    }
    return sub;
  }

  /**
   * Get the object at the index specified. If the container has been
   * sorted, objects might not be in the position you'd expect.
   *
   * @param idx {Number} The index of the object to get
   * @return {Object} The object at the index within the container
   * @throws {Error} Index out of bounds if the index is out of the list of objects
   */
  get(idx) {
    if (idx < 0 || idx > this._sz) {
      throw new Error("Index out of bounds");
    }
    return this._find(idx).ptr;
  }

  /**
   * Get an array of all of the objects in this container.
   * @return {Array} An array of all of the objects in the container
   */
  getAll() {
    var a = [], i = this.iterator;
    while (i.hasNext()) {
      a.push(i.next());
    }
    i.destroy();
    return a;
  }

  /**
   * Filters the container with the function, returning a new <code>Container</code>
   * with the objects that pass the test in the function.  If the object should be
   * included in the new <code>Container</code>, the function should return <code>true</code>.
   * The function takes one argument: the object being processed.
   * Unless otherwise specified, <code>this</code> refers to the container.
   *
   * @param fn {Function} The function to execute for each object
   * @param [thisp] {Object} The object to use as <code>this</code> inside the function
   * @return {Container}
   */
  filter(fn, thisp) {
    var arr = RenderEngine.Support.filter(this.getAll(), fn, thisp || this);
    var c = Container.create("filterCopy");
    c.addAll(arr);
    return c;
  }

  /**
   * Remove all references to objects in the container.  None of the objects are
   * actually destroyed.  Use {@link #cleanUp} to remove and destroy all objects.
   */
  clear() {
    this._head = null;
    this._tail = null;
    this._sz = 0;
  }

  /**
   * Get the array of all objects within this container.  If a filtering
   * function is provided, only objects matching the filter will be
   * returned from the object collection.
   * <p/>
   * The filter function needs to return <tt>true</tt> for each element
   * that should be contained in the filtered set.  The function will be
   * passed the following arguments:
   * <ul>
   * <li>element - The array element being operated upon</li>
   * <li>index - The index of the element in the array</li>
   * <li>array - The entire array of elements in the container</li>
   * </ul>
   * Say you wanted to filter a host objects components based on a
   * particular type.  You might do something like the following:
   * <pre>
   * var logicComponents = host.getObjects(function(el, idx) {
    *    if (el.getType() == BaseComponent.TYPE_LOGIC) {
    *       return true;
    *    }
    * });
   * </pre>
   *
   * @param filterFn {Function} A function to filter the set of
   *                 elements with.  If you pass <tt>null</tt> the
   *                 entire set of objects will be returned.
   * @return {Array} The array of filtered objects
   */
  getObjects(filterFn) {
    var a = this.getAll();
    if (filterFn) {
      return RenderEngine.Support.filter(a, filterFn);
    } else {
      return a;
    }
  }

  /**
   * Sort the objects within the container, using the provided function.
   * The function will be provided object A and B.  If the result of the
   * function is less than zero, A will be sorted before B.  If the result is zero,
   * A and B retain their order.  If the result is greater than zero, A will
   * be sorted after B.
   *
   * @param [fn] {Function} The function to sort with. If <tt>null</tt> the objects
   *          will be sorted in "natural" order.
   */
  sort(fn) {
    //console.info("Sorting ", this.getName(), "[" + this.getId() + "]");
    var a = this.getAll().sort(fn);

    // Relink
    this._head = this._new(a[0]);
    var p = this._head;
    for (var i = 1; i < a.length; i++) {
      var n = this._new(a[i]);
      p.next = n;
      n.prev = p;
      p = n;
    }
    this._tail = p;
    this.sz = a.length;
  }

  /**
   * Returns a property object with accessor methods to modify the property.
   * @return {Object} The properties object
   */
  getProperties() {
    //var self = this;
    //var prop = this.base(self);
    //return $.extend(prop, {
    //    "Size":[function () {
    //        return self.size();
    //    },
    //        null, false]
    //});
  }

  get iterator() {
    return Iterator.create(this);
  }

}
