/**
 * The Render Engine
 *
 * @fileoverview A doubly linked list.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1570 $
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
    "class":"R.struct.Container",
    "requires":[
        "R.engine.BaseObject",
        "R.lang.Iterator"
    ]
});

/**
 * @class A container is a logical collection of objects.  A container
 *        is responsible for maintaining the list of objects within it.
 *        When a container is destroyed, none of the objects within the container
 *        are destroyed with it.  If the objects must be destroyed, call
 *        {@link #cleanUp}.  A container is a doubly linked list.
 *
 * @param containerName {String} The name of the container
 * @extends R.engine.BaseObject
 * @constructor
 * @description Create a container.
 */
R.struct.Container = function () {
    return R.engine.BaseObject.extend(/** @scope R.struct.Container.prototype */{

        objects:null,

        /**
         * @private
         */
        constructor:function (containerName, initial) {
            this.base(containerName || "Container");
            this.objects = [];
            if (!R.isUndefined(initial)) {
                this.addAll(initial);
            }
        },

        /**
         * Release the object back into the object pool.
         */
        release:function () {
            this.base();
            this.clear();
        },

        /**
         * Clears the container, however, all of the objects within the container
         * are not destroyed automatically.  This is to prevent the early clean up of
         * objects which are being used by a transient container.
         */
        destroy:function () {
            this.base();
        },

        /**
         * Returns the count of the number of objects within the
         * container.
         *
         * @return {Number} The number of objects in the container
         */
        size:function () {
            return this.objects.length;
        },

        /**
         * Returns <tt>true</tt> if the object is in the container.
         * @param obj {Object} The object to find
         * @return {Boolean}
         */
        contains:function (obj) {
            return (R.engine.Support.indexOf(this.objects, obj) != -1);
        },

        /**
         * Add an object to the container.
         *
         * @param obj {Object} The object to add to the container.
         */
        add:function (obj) {
            this.objects.push(obj);

            if (obj.getId) {
                R.debug.Console.log("Added ", obj.getId(), "[", obj, "] to ", this.getId(), "[", this, "]");
            }

            // Return the index of the added object
            return (this.objects.length - 1);
        },

        /**
         * Add all of the objects in the container or array to this container, at the end
         * of this container.  If "arr" is a container, the head of "arr" is joined to the
         * tail of this, resulting in a very fast operation.  Because this method, when
         * performed on a container, is just joining the two lists, no duplication of
         * elements from the container is performed.  As such, removing elements from the
         * new container will affect this container as well.
         *
         * @param arr {R.struct.Container|Array} A container or array of objects
         */
        addAll:function (arr) {
            var i;
            if (arr instanceof R.struct.Container) {
                for (i = arr.iterator(); i.hasNext();) {
                    this.add(i.next());
                }
                i.destroy();
            } else if (R.isArray(arr)) {
                for (i in arr) {
                    this.add(arr[i]);
                }
            } else {
                Assert(false, "R.struct.Container.addAll() - invalid object!")
            }
        },

        /**
         * Clone this container, returning a new container which points to all of the
         * objects in this container.
         * @return {R.struct.Container} A new container with all of the objects from the current container
         */
        clone:function () {
            var c = this.constructor.create();
            c.addAll(this.getAll());
            return c;
        },

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
         * @param arr {R.struct.Container|Array} A container or array of objects
         * @return {R.struct.Container} A new container with all objects from both
         */
        concat:function (arr) {
            if (arr instanceof R.struct.Container) {
                arr = arr.getAll();
            }
            var c = this.clone();
            c.objects = c.objects.concat(arr);
            return c;
        },

        /**
         * Append a container to the end of this container.  When you append a
         * container, its head will now point to the tail of this container and
         * the tail of this container will become the tail of the appended container.
         * The appended container will still exist, but navigating the container in
         * reverse past the head of the container will navigate into the container
         * which was appended to.  If you need the containers to remain independent
         * of eachother, see the {@link #concat} method.
         *
         * @param c {R.struct.Container} The container to append.
         */
        append:function (c) {
            if (!(c instanceof R.struct.Container)) {
                R.debug.Console.error("Can only append R.struct.Container, or subclasses, to an R.struct.Container");
                return;
            }

            this.objects = this.objects.concat(c.getAll());
        },

        /**
         * Insert an object into the container at the given index. Asserts if the
         * index is out of bounds for the container.  The index must be greater than
         * or equal to zero, and less than or equal to the size of the container minus one.
         * The effect is to extend the length of the container by one.
         *
         * @param index {Number} The index to insert the object at.
         * @param obj {Object} The object to insert into the container
         */
        insert:function (index, obj) {
            Assert(!(index < 0 || index > this.size()), "Index out of range when inserting object!");

            this.objects.splice(index, 0, obj);

            // Return the list node that was inserted
            return index;
        },

        /**
         * Replaces the given object with the new object.  If the old object is
         * not found, no action is performed.
         *
         * @param oldObj {Object} The object to replace
         * @param newObj {Object} The object to put in place
         * @return {Object} The object which was replaced
         */
        replace:function (oldObj, newObj) {
            var i = R.engine.Support.indexOf(this.objects, oldObj);
            this.objects[i] = newObj;
            return oldObj;
        },

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
        replaceAt:function (index, obj) {
            Assert(!(index < 0 || index > this.size()), "Index out of range when inserting object!");
            var r = this.objects[index];
            this.objects[index] = obj;
            return r;
        },

        /**
         * Remove an object from the container.  The object is
         * not destroyed when it is removed from the container.
         *
         * @param obj {Object} The object to remove from the container.
         * @return {Object} The object that was removed
         */
        remove:function (obj) {
            var r = this.objects.splice(R.engine.Support.indexOf(this.objects, obj), 1);
            if (obj.getId) {
                R.debug.Console.log("Removed ", obj.getId(), "[", obj, "] from ", this.getId(), "[", this, "]");
            }
            return obj;
        },

        /**
         * Remove an object from the container at the specified index.
         * The object is not destroyed when it is removed.
         *
         * @param idx {Number} An index between zero and the size of the container minus 1.
         * @return {Object} The object removed from the container.
         */
        removeAtIndex:function (idx) {
            Assert((idx >= 0 && idx < this.size()), "Index of out range in Container");
            var r = this.objects.splice(idx, 1);
            R.debug.Console.log("Removed ", r.getId(), "[", r, "] from ", this.getId(), "[", this, "]");
            return r;
        },

        /**
         * Reduce the container so that it's length is the specified length.  If <code>length</code>
         * is larger than the size of this container, no operation is performed.  Setting <code>length</code>
         * to zero is effectively the same as calling {@link #clear}.  Objects which would logically
         * fall after <code>length</code> are not automatically destroyed.
         *
         * @param length {Number} The maximum number of elements
         * @return {R.struct.Container} The subset of elements being removed
         */
        reduce:function (length) {
            if (length > this.size()) {
                return null;
            }
            var a = this.getAll();
            var sub = this.subset(length, a.length, a);
            if (length == 0) {
                return sub;
            }

            a.length = length;
            return sub;
        },

        /**
         * A new <code>Container</code> which is a subset of the current container
         * from the starting index (inclusive) to the ending index (exclusive).  Modifications
         * made to the objects in the subset will affect this container's objects.
         *
         * @param start {Number} The starting index in the container
         * @param end {Number} The engine index in the container
         * @return {R.struct.Container} A subset of the container.
         */
        subset:function (start, end, b) {
            var a = b || this.getAll();
            var c = this.constructor.create();
            for (var i = start; i < end; i++) {
                c.add(a[i]);
            }
            return c;
        },

        /**
         * Get the object at the index specified. If the container has been
         * sorted, objects might not be in the position you'd expect.
         *
         * @param idx {Number} The index of the object to get
         * @return {Object} The object at the index within the container
         * @throws {Error} Index out of bounds if the index is out of the list of objects
         */
        get:function (idx) {
            if (idx < 0 || idx > this.size()) {
                throw new Error("Index out of bounds");
            }
            return this.objects[idx];
        },

        /**
         * Get an array of all of the objects in this container.
         * @return {Array} An array of all of the objects in the container
         */
        getAll:function () {
            return this.objects;
        },

        /**
         * For each object in the container, the function will be executed.
         * The function takes one argument: the object being processed.
         * Unless otherwise specified, <code>this</code> refers to the container.
         * <p/>
         * Returning <tt>false</tt> from <tt>fn</tt> will immediately halt any
         * further iteration over the container.
         *
         * @param fn {Function} The function to execute for each object
         * @param [thisp] {Object} The object to use as <code>this</code> inside the function
         */
        forEach:function (fn, thisp) {
            var itr = this.iterator();
            var result = true;
            var hasMethod = !!(thisp && thisp.isDestroyed);
            while ((hasMethod ? !thisp.isDestroyed() && result : result) && itr.hasNext()) {
                result = fn.call(thisp || this, itr.next());
                result = (result == undefined ? true : result);
            }
            itr.destroy();
        },

        /**
         * Filters the container with the function, returning a new <code>Container</code>
         * with the objects that pass the test in the function.  If the object should be
         * included in the new <code>Container</code>, the function should return <code>true</code>.
         * The function takes one argument: the object being processed.
         * Unless otherwise specified, <code>this</code> refers to the container.
         *
         * @param fn {Function} The function to execute for each object
         * @param [thisp] {Object} The object to use as <code>this</code> inside the function
         * @return {R.struct.Container}
         */
        filter:function (fn, thisp) {
            this.objects = R.engine.Support.filter(this.objects, fn, thisp || this);
            return this;
        },

        /**
         * Remove all references to objects in the container.  None of the objects are
         * actually destroyed.  Use {@link #cleanUp} to remove and destroy all objects.
         */
        clear:function () {
            //this.objects = [];
            this.length = 0;
        },

        /**
         * Remove and destroy all objects in the container.
         */
        cleanUp:function () {
            var a = this.getAll(), h;
            while (a.length > 0) {
                h = a.shift();
                if (h.destroy) {
                    h.destroy();
                }
            }
            this.clear();
        },

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
        getObjects:function (filterFn) {
            var a = this.getAll();
            if (filterFn) {
                return R.engine.Support.filter(a, filterFn);
            } else {
                return a;
            }
        },

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
        sort:function (fn) {
            R.debug.Console.log("Sorting ", this.getName(), "[" + this.getId() + "]");
            this.objects.sort(fn);
        },

        /**
         * Returns a property object with accessor methods to modify the property.
         * @return {Object} The properties object
         */
        getProperties:function () {
            var self = this;
            var prop = this.base(self);
            return $.extend(prop, {
                "Size":[function () {
                    return self.size();
                },
                    null, false]
            });
        },

        /**
         * Serializes a container to XML.
         * @return {String} The XML string
         */
        toXML:function (indent) {
            indent = indent ? indent : "";
            var props = this.getProperties();
            var xml = indent + "<" + this.constructor.getClassName();
            for (var p in props) {
                // If the value should be serialized, call it's getter
                if (props[p][2]) {
                    xml += " " + p.toLowerCase() + "=\"" + props[p][0]().toString() + "\"";
                }
            }
            xml += ">\n";

            // Dump children
            var all = this.getAll();
            for (var o in all) {
                xml += all[o].toXML(indent + "  ");
            }

            // Closing tag
            xml += indent + "</" + this.constructor.getClassName() + ">\n";
            return xml;
        },

        /**
         * Returns an iterator over the collection.
         * @return {R.lang.Iterator} An iterator
         */
        iterator:function () {
            return R.lang.Iterator.create(this.objects, this);
        }

    }, /** @scope R.struct.Container.prototype */{
        /**
         * Get the class name of this object
         *
         * @return {String} "R.struct.Container"
         */
        getClassName:function () {
            return "R.struct.Container";
        },

        /** @private */
        resolved:function () {
            R.struct.Container.EMPTY = new R.struct.Container("EMPTY");
        },

        /**
         * Create a new <code>R.struct.Container</code> from an <code>Array</code>.
         * @param array {Array} An array of objects
         * @return {R.struct.Container}
         * @static
         */
        fromArray:function (array) {
            var c = R.struct.Container.create("copy");
            c.addAll(array);
            return c;
        },

        /**
         * An empty container - DO NOT MODIFY!!
         * @type {R.struct.Container}
         */
        EMPTY:null

    });

};