/**
 * The Render Engine
 * PooledObject
 *
 * @fileoverview An object that has functionality to assist in keeping memory
 *               usage down and to minimize the effect of the JavaScript garbage
 *               collector.
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 *
 */
"use strict";

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
class PooledObject {

  constructor(name) {
    this.opt = {
      dataModel: {},
      destroyed: false,
      name: name,
      id: RenderEngine.create(this) // Reference counting
    };
  }

  get dataModel() {
    return this.opt.dataModel;
  }

  get _destroyed() {
    return this.opt.destroyed;
  }

  get id() {
    return this.opt.id;
  }

  get name() {
    return this.opt.name;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "PooledObject"
   */
  get className() {
    if (!this.hasOwnProperty("className")) {
      console.warn("Object is missing className()");
    }
    return "PooledObject";
  }

  /**
   * When a pooled object is destroyed, its <tt>release()</tt> method will be called
   * so it has a chance to clean up instance variables before being put back into
   * the pool for reuse. The variables should be returned to an "uninitialized" state.
   */
  release() {
    this.opt.name = "";
    this.opt.id = -1;
  }

  /**
   * Destroy this object instance (remove it from the Engine).  The object's <tt>release()</tt>
   * method is called after destruction so it can be returned to the pool of objects
   * to be used again.
   */
  destroy() {
    this.opt.destroyed = true;

    // Clean up the engine reference to this object
    RenderEngine.destroy(this); // De-referencing

    // Reset any variables on the object after putting
    // it back in the pool.
    this.release();
  }

  /**
   * Get the managed Id of this object within the Engine.
   *
   * @return {String}
   */
  getId() {
    return this.id;
  }

  /**
   * Get the original name this object was created with.
   *
   * @return {String} The name used when creating this object
   */
  getName() {
    return this.name;
  }

  /**
   * Set the name of the object.
   * @param name {String} The name for the object
   */
  setName(name) {
    this.opt.name = name;
  }

  /**
   * Write out the Id of the object and its class name
   * @return {String}
   */
  toString() {
    return "PooledObject(" + this.getId() + " [" + this.constructor.getClassName() + "])";
  }

  /**
   * Get the serializable properties of this object.
   * @return {Object} An object which contains getter and setter methods.
   */
  properties() {
    // [getter, setter]
    var props = HashContainer.create(this.id + "Properties");
    props.add(
      "Id", [
        function () {
          return this.getId();
        }.bind(this),
        null
      ]);
    props.add(
      "Name", [
        function () {
          return this.getName();
        }.bind(this),
        function (i) {
          this.setName(i);
        }.bind(this)
      ]
    );
    return props;
  }

  /**
   * Serialize into a portable object.
   * @param obj {PooledObject} The object to serialize
   * @param [defaults] {Object} An optional set of defaults to ignore if the values
   *    are no different than the default.
   */
  static serialize(obj, defaults) {
    var bean = obj.getProperties(), propObj = {}, val,
      SETTER = 1, GETTER = 0;

    defaults = defaults || [];

    for (var prop in bean) {
      if (bean[prop][SETTER]) {
        val = bean[prop][GETTER]();
        if (val != defaults[prop]) {
          propObj[prop] = bean[prop][GETTER]();
        }
      }
    }
    propObj.CLASSNAME = obj.className;
    return propObj;
  }

  /**
   * Deserialize a portable object back into a PooledObject.
   * @param obj {Object} The object to deserialize
   * @param [clazz] {class} The object class to populate
   * @return {PooledObject} The object which was deserialized
   */
  static deserialize(obj, clazz) {
    // We'll remove the CLASSNAME field because we're not currently using it
    var portClassname = obj.CLASSNAME, SETTER = 1;
    delete obj.CLASSNAME;

    clazz = clazz || PooledObject.create(obj.name);
    var bean = clazz.getProperties();

    for (var p in obj) {
      if (bean[p][SETTER]) {
        bean[p][SETTER](obj[p]);
      }
    }

    return clazz;
  }

  /**
   * Get the model data associated with an object.  If <tt>key</tt> is provided, only the
   * data for <tt>key</tt> will be returned.  If the data has not yet been assigned,
   * an empty object will be created to contain the data.
   *
   * @param [key] {String} Optional key which contains the data, or <tt>null</tt> for the
   *     entire data model.
   */
  getObjectDataModel(key) {
    return key ? this.opt.dataModel[key] : this.opt.dataModel;
  }

  get objectDataModel() {
    return this.opt.dataModel;
  }

  /**
   * Set a key, within the object's data model, to a specific value.
   *
   * @param key {String} The key to set the data for
   * @param value {Object} The value to assign to the key
   */
  setObjectDataModel(key, value) {
    this.opt.dataModel[key] = value;
    return this.opt.dataModel[key];
  }

  /**
   * Clear all of the spatial container model data.
   */
  clearObjectDataModel() {
    // TODO: This seems leaky
    this.opt.dataModel = null;
  }

  //noinspection JSMethodCanBeStatic
  /**
   * <tt>true</tt> for all objects within the engine.
   * @type {Boolean}
   */
  get isRenderEngineObject() {
    return true;
  }

  //noinspection JSMethodCanBeStatic
  /**
   * <tt>true</tt> for all objects that are pooled.
   * @type {Boolean}
   */
  get isPooledObject() {
    return true;
  }

  //==================================================================================

  /**
   * The growth rate of a pool.
   * <i>(default: 50)</i>
   * @type {Number}
   */
  static get POOL_GROWTH_SIZE() {
    return 50;
  }

  /**
   * Number of new objects put into the pool
   * @type {Number}
   */
  static poolNew = 0;

  /**
   * Total number of objects in the pool
   * @type {Number}
   */
  static poolSize = 0;

  /**
   * Grow the pool by MAX_POOL_COUNT
   * @param pool
   */
  static growPool(pool) {
    var poolIncrement = PooledObject.POOL_GROWTH_SIZE + pool.arr.length;
    while (pool.arr.length < poolIncrement) {
      pool.arr[pool.arr.length] = null; // Try creating it empty
    }
  }

  /**
   * Similar to a constructor, all pooled objects implement this method to create an instance of the object.
   * The <tt>create()</tt> method will either create a new instance, if no object of the object's
   * class exists within the pool, or will reuse an existing pooled instance of
   * the object.  Either way, the constructor for the object instance is called so that
   * instance creation can be maintained by the constructor.
   * <p/>
   * Usage: <tt>var obj = [ObjectClass].create(arg1, arg2, arg3...);</tt>
   * @static
   */
  create(...args) {
    var className, pool, pooledObj, idx, startPoolSize;

    className = this.className;
    pool = PooledObject.objectPool[className];

    if (!pool) {
      // Create a pool, add an object
      pool = PooledObject.objectPool[className] = {
        pc: 0,
        arr: [new this(
          arguments[0], arguments[1], arguments[2], arguments[3], arguments[4],
          arguments[5], arguments[6], arguments[7], arguments[8], arguments[9],
          arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]
        )]
        //arr: [new this(args)]
      };

      // Initialize
      PooledObject.growPool(pool, this);

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
      PooledObject.growPool(pool, this, arguments);
      pooledObj = null;
    }

    if (pooledObj === null) {

      // Create new object
      PooledObject.objectPool[className].arr[pool.pc] = new this(
        arguments[0], arguments[1], arguments[2], arguments[3], arguments[4],
        arguments[5], arguments[6], arguments[7], arguments[8], arguments[9],
        arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]
      );
      //PooledObject.objectPool[className].arr[pool.pc] = new this(args);

      pooledObj = PooledObject.objectPool[className].arr[pool.pc];

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
  }

  /**
   * The pool of all objects, stored by class name.
   * @type {Object}
   */
  static objectPool = {};
}

