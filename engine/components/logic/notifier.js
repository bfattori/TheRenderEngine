/**
 * The Render Engine
 * NotifierComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A component which notifies objects when an action occurs.  The component
 *        uses a subscriber model to notify an object when certain actions occur.
 *        This component can be used so that multiple objects could subscribe to one
 *        to be notified when a particular event occurs.  The objects don't have to
 *        exist within the same scope.
 *        <p/>
 *        For example, a host object could publish an event of type "death" that other
 *        hosts are listening for.  Thus, when the host dies, it can pass relevant
 *        information that other objects (such as a life counter) could respond to.
 *        Rather than the host having to actively know about other parts of the
 *        game world, those other objects could "listen in" on the actions of the host
 *        and act accordingly.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of the component
 * @extends LogicComponent
 * @constructor
 * @description Create a notifier component
 */
class PubSubComponent extends LogicComponent {

  constructor(name, priority) {
    super(name, priority);
    this.notifyLists = {};
    this.hasher = FNV1Hash.create();
  }

  /**
   * Destroy the component instance
   */
  destroy() {
    this.hasher.destroy();
    for (var n in this.notifyLists) {
      this.notifyLists[n].destroy();
    }
    super.destroy();
  }

  release() {
    super.release();
    this.notifyLists = null;
    this.hasher = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "PubSubComponent"
   */
  get className() {
    return "PubSubComponent";
  }

  /**
   * Subscribe to the event type specified, receiving a subscriber Id in return.
   * When the event type is posted, the specified callback will either be called in
   * the scope of <tt>thisObj</tt>, or if <tt>thisObj</tt> is <tt>null</tt> then the
   * scope will be this component's host object.
   * <p/>
   * Any object can subscribe to any other object's events.  This is a handy method
   * to use event passing as a way to propagate actions from one object to a group
   * of other objects.
   *
   * @param type {String} The type name of the event.
   * @param fn {Function} The function to call when the event triggers.
   * @param [thisObj] {Object} The object which will represent "this" for the callback.
   *
   * @return {String} A subscriber Id which can later be used to unsubscribe
   */
  subscribe(type, fn, thisObj) {
    if (this.notifyLists[type] == null) {
      this.notifyLists[type] = HashContainer.create("subscribers");
    }

    // get a unique subscriber Id
    var subId = this.hasher.updateHash(type + fn.toString() + (thisObj || this.gameObject).toString());
    this.notifyLists[type].add(subId, {parent: thisObj, func: fn});
    return subId;
  }

  /**
   * Unsubscribe from the event type specified.  If you only
   * pass the event type, all subscribers will be removed for that type.
   * Passing the optional <tt>subscriberId</tt> will unsubscribe a specific
   * subscriber.
   *
   * @param type {String} The event type to unsubscribe from
   * @param [subscriberId] {String} The subscriber Id which was returned from {@link #subscribe}
   */
  unsubscribe(type, subscriberId) {
    if (subscriberId != null) {
      // Remove a specific subscriber
      this.notifyLists[type].remove(subscriberId);
    } else {
      // Remove all subscribers for the event type
      this.notifyLists[type].clear();
    }
  }

  /**
   * Post a message of the given type, with the event object
   * which subscribers can act upon.  The event object is free-form and
   * can contain anything.  The subscribers should know what to look for
   * and how to interpret the event object being passed to them.
   *
   * @param type {String} The type of the event
   * @param eventObj {Object} An object which subscribers can use
   */
  post(type, eventObj) {
    this.notifyRecipients(this.notifyLists[type], eventObj);
  }

  pub(type, eventObj) {
    this.post(type, eventObj);
  }

  /**
   * Run through the list of subscribers for the event type specified.
   * Optimized for speed if the list is large.
   * @private
   */
  notifyRecipients(recipients, eventObj) {
    if (!recipients) {
      return;
    }

    var s = null;
    var scopeObj = null;
    var host = this.gameObject;
    for (var itr = recipients.iterator(); itr.hasNext();) {
      s = itr.next();
      scopeObj = s.parent || host;
      s.func.call(scopeObj, eventObj);
    }
    itr.destroy();
  }
}
