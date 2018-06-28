/**
 * The Render Engine
 * BaseObject
 *
 * @fileoverview An object that has functionality to assist in keeping memory
 *               usage down and to minimize the effect of the JavaScript garbage
 *               collector.
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
"use strict";

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.engine.PooledObject",
    "requires":[]
});

/**
 * @class Pooled objects are created as needed, and reused from a static pool
 *        of all objects, organized by classname.  When an object is created, if one
 *        is not available in the pool, a new object is created.  When the object
 *        is destroyed, it is returned to the pool so it can be used again.  This has the
 *        effect of minimizing the requirement for garbage collection, reducing
 *        cycles needed to clean up dead objects.
 *
 * @param name {String} The name of the object within the engine.
 * @constructor
 * @description Create an instance of this object, assigning a global identifies to it.
 */
R.engine.PooledObject = Base.extend(/** @scope R.engine.PooledObject.prototype */{

    // The Id assigned by the engine
    id:-1,

    // The name of the object
    name:"",

    _destroyed:false,

    /** @private */
    constructor:function (name) {
        this._destroyed = false;
        this.name = name;
        this.id = R.Engine.create(this);
    },

    /**
     * When a pooled object is destroyed, its <tt>release()</tt> method will be called
     * so it has a chance to clean up instance variables before being put back into
     * the pool for reuse. The variables should be returned to an "uninitialized" state.
     */
    release:function () {
        this.name = "";
        this.id = -1;
    },

    /**
     * Destroy this object instance (remove it from the Engine).  The object's <tt>release()</tt>
     * method is called after destruction so it can be returned to the pool of objects
     * to be used again.
     */
    destroy:function () {
        // Clean up the engine reference to this object
        R.Engine.destroy(this);

        this._destroyed = true;

        // Reset any variables on the object after putting
        // it back in the pool.
        this.release();
    },

    /**
     * Get the managed Id of this object within the Engine.
     *
     * @return {String}
     */
    getId:function () {
        return this.id;
    },

    /**
     * Get the original name this object was created with.
     *
     * @return {String} The name used when creating this object
     */
    getName:function () {
        return this.name;
    },

    /**
     * Set the name of the object.
     * @param name {String} The name for the object
     */
    setName:function (name) {
        this.name = name;
    },

    /**
     * Returns an object that assigns getter and setter methods
     * for exposed properties of an object.
     * @return {Object} An object which contains getter and setter methods.
     */
    getProperties:function () {
        var self = this;
        var prop = {};

        // [getter, setter, editableFlag]

        return $.extend(prop, {
            "Id":[function () {
                return self.getId();
            },
                null, false],
            "Name":[function () {
                return self.getName();
            },
                function (i) {
                    self.setName(i);
                }, true]
        });
    },

    /**
     * Write out the Id of the object and its class name
     * @return {String}
     */
    toString:function () {
        return this.getId() + " [" + this.constructor.getClassName() + "]";
    },

    /**
     * Serialize the object to XML.
     * @return {String}
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

        xml += "/>\n";
        return xml;
    },

    /**
     * Returns <tt>true</tt> if the object has been destroyed.  For objects which are
     * being updated by containers, this method is used to determine if the object should
     * be updated.  It is important to check this method if you are outside the normal
     * bounds of updating an object.  For example, if an object is drawing its bounding
     * box using it's collision component, the component may have been destroyed along
     * with the object, by another object.  Checking to see if the object is destroyed
     * before calling such method would prevent an exception being thrown when trying
     * to access the component which was destroyed as well.
     * @return {Boolean}
     */
    isDestroyed:function () {
        return this._destroyed;
    },

    /**
     * Get the model data associated with an object.  If <tt>key</tt> is provided, only the
     * data for <tt>key</tt> will be returned.  If the data has not yet been assigned,
     * an empty object will be created to contain the data.
     *
     * @param [key] {String} Optional key which contains the data, or <tt>null</tt> for the
     *     entire data model.
     */
    getObjectDataModel:function (key) {
        var mData = this[R.engine.PooledObject.DATA_MODEL];
        if (mData == null) {
            this[R.engine.PooledObject.DATA_MODEL] = {};
            mData = this[R.engine.PooledObject.DATA_MODEL];
        }
        return key ? mData[key] : mData;
    },

    /**
     * Set a key, within the object's data model, to a specific value.
     *
     * @param key {String} The key to set the data for
     * @param value {Object} The value to assign to the key
     */
    setObjectDataModel:function (key, value) {
        var mData = this.getObjectDataModel();
        mData[key] = value;
        return mData[key];
    },

    /**
     * Clear all of the spatial container model data.
     */
    clearObjectDataModel:function () {
        this[R.engine.PooledObject.DATA_MODEL] = null;
    }

}, /** @scope R.engine.PooledObject.prototype **/{

    /**
     * <tt>true</tt> for all objects within the engine.
     * @type {Boolean}
     */
    isRenderEngineObject:true,

    /**
     * <tt>true</tt> for all objects that are pooled.
     * @type {Boolean}
     */
    isPooledObject:true,

    /**
     * The maximum number of objects, per class, that can be pooled.  This value can
     * be tweaked, per class, which extends from <tt>R.engine.PooledObject</tt>.
     * <i>(default: 50)</i>
     * @type {Number}
     */
    MAX_POOL_COUNT:50,

    /**
     * Number of new objects put into the pool
     * @type {Number}
     */
    poolNew:0,

    /**
     * Total number of objects in the pool
     * @type {Number}
     */
    poolSize:0,


    /**
     * Grow the pool by MAX_POOL_COUNT
     * @param pool
     */
    growPool: function(pool) {
        var poolIncrement = R.engine.PooledObject.MAX_POOL_COUNT + pool.arr.length;
        while (pool.arr.length < poolIncrement) {
            pool.arr[pool.arr.length] = null; // Try creating it empty
        }
    },

    /**
     * Similar to a constructor, all pooled objects implement this method to create an instance of the object.
     * The <tt>create()</tt> method will either create a new instance, if no object of the object's
     * class exists within the pool, or will reuse an existing pooled instance of
     * the object.  Either way, the constructor for the object instance is called so that
     * instance creation can be maintained in the constructor.
     * <p/>
     * Usage: <tt>var obj = [ObjectClass].create(arg1, arg2, arg3...);</tt>
     * @static
     */
    create:function () {
        var className, pool, pooledObj, idx, startPoolSize;

        className = this.getClassName();
        pool = R.engine.PooledObject.objectPool[className];

        if (!pool) {
            // Create a pool, add an object
            pool = R.engine.PooledObject.objectPool[className] = {
                pc: 0,
                arr: [new this(
                  arguments[0], arguments[1], arguments[2], arguments[3], arguments[4],
                  arguments[5], arguments[6], arguments[7], arguments[8], arguments[9],
                  arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]
                )]
            };

            // Initialize
            R.engine.PooledObject.growPool(pool, this);

            // Short-circuit for pool creation
            return pool.arr[0];
        }

        // Look for a free object in the pool
        do {
            pooledObj = pool.arr[pool.pc];
            if (pooledObj === null || pooledObj._destroyed === true) {
                break;
            }
            pool.pc++;
        } while (pool.pc < pool.arr.length);

        if (pool.pc === pool.arr.length) {

            // Out of space in the pool
            R.engine.PooledObject.growPool(pool, this, arguments);
            pooledObj = null;
        }

        if (pooledObj === null) {

            // Create new object
            R.engine.PooledObject.objectPool[className].arr[pool.pc] = new this(
              arguments[0], arguments[1], arguments[2], arguments[3], arguments[4],
              arguments[5], arguments[6], arguments[7], arguments[8], arguments[9],
              arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]
            );

            pooledObj = R.engine.PooledObject.objectPool[className].arr[pool.pc];

        } else {

            // Initialize pooled object
            pooledObj.constructor.apply(pooledObj, arguments);

        }

        // At end of pool? Wrap around
        pool.pc++;
        if (pool.pc === pool.arr.length) {
            pool.pc = 0;
        }

        return pooledObj;
   },

    /**
     * The pool of all objects, stored by class name.
     * @type {Object}
     */
    objectPool:{},

    /**
     * Get the class name of this object
     *
     * @return {String} "R.engine.PooledObject"
     */
    getClassName:function () {
        if (!this.hasOwnProperty("getClassName")) {
            R.debug.Console.warn("Object is missing getClassName()");
        }
        return "R.engine.PooledObject";
    },

    /**
     * Serialize the pooled object into an object.
     * @param obj {R.engine.PooledObject} The object to serialize
     * @param [defaults] {Object} An optional set of defaults to ignore if the values
     *    are no different than the default.
     */
    serialize:function (obj, defaults) {
        var bean = obj.getProperties(), propObj = {}, val;
        defaults = defaults || [];
        for (var p in bean) {
            if (bean[p][1]) {
                val = bean[p][0]();
                if (val != defaults[p]) {
                    propObj[p] = bean[p][0]();
                }
            }
        }
        propObj.CLASSNAME = obj.constructor.getClassName();
        return propObj;
    },

    /**
     * Deserialize the object back into a Pooled Object.
     * @param obj {Object} The object to deserialize
     * @param [clazz] {Class} The object class to populate
     * @return {R.engine.PooledObject} The object which was deserialized
     */
    deserialize:function (obj, clazz) {
        // We'll remove the CLASSNAME field because we're not currently using it
        delete obj.CLASSNAME;

        clazz = clazz || R.engine.PooledObject.create(obj.name);
        var bean = clazz.getProperties();
        for (var p in obj) {
            // Regardless if the editable flag is true, if there is a setter, we'll
            // call it to copy the value over.
            if (bean[p][1]) {
                if (bean[p][1].multi || bean[p][1].toggle || bean[p][1].editor) {
                    // Multi-select, toggle, or custom editor
                    bean[p][1].fn(obj[p]);
                } else {
                    // Single value
                    bean[p][1](obj[p]);
                }
            }
        }

        return clazz;
    },

    /**
     * @private
     */
    DATA_MODEL:"$$OBJECT_DATA_MODEL"

});
