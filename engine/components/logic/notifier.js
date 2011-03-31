/**
 * The Render Engine
 * InputComponent
 *
 * @fileoverview An extension of the logic component which efficiently 
 *               notifies a list of recipients when events are triggered.
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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.components.logic.Notifier",
	"requires": [
		"R.components.Logic",
		"R.lang.FNV1Hash",
		"R.struct.HashContainer"
	]
});

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
 * @extends R.components.Logic
 * @constructor
 * @description Create a notifier component
 */
R.components.logic.Notifier = function() {
	return R.components.Logic.extend(/** @scope R.components.logic.Notifier.prototype */{

   notifyLists: null,
   hasher: null,

   /**
    * @private
    */
   constructor: function(name, priority) {
      this.base(name, priority || 1.0);
      this.notifyLists = {};
      this.hasher = R.lang.FNV1Hash.create();
   },

	/**
	 * Destroy the component instance
	 */
	destroy: function() {
		this.hasher.destroy();
		for (var n in this.notifyLists) {
			this.notifyLists[n].destroy();
		}
		this.base();
	},

   /**
    * Releases the component back into the object pool. See {@link R.engine.PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
      this.notifyLists = null;
      this.hasher = null;
   },

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
   subscribe: function(type, fn, thisObj) {
      if (this.notifyLists[type] == null) {
         this.notifyLists[type] = R.struct.HashContainer.create("subscribers");;
      }
      
      // get a unique subscriber Id
      var subId = this.hasher.updateHash(type + fn.toString() + (thisObj || this.getHostObject()).toString());
      this.notifyLists[type].add(subId, {parent: thisObj, func: fn});
      return subId;
   },

   /**
    * Unsubscribe from the event type specified.  If you only
    * pass the event type, all subscribers will be removed for that type.  
    * Passing the optional <tt>subscriberId</tt> will unsubscribe a specific
    * subscriber.
    *
    * @param type {String} The event type to unsubscribe from
    * @param [subscriberId] {String} The subscriber Id which was returned from {@link #subscribe}
    */
   unsubscribe: function(type, subscriberId) {
      if (subscriberId != null) {
         // Remove a specific subscriber
         this.notifyLists[type].remove(subscriberId);
      } else {
         // Remove all subscribers for the event type
         this.notifyLists[type].clear();
      }
   },

   /**
    * Post a message of the given type, with the event object
    * which subscribers can act upon.  The event object is free-form and
    * can contain anything.  The subscribers should know what to look for
    * and how to interpret the event object being passed to them.
    *
    * @param type {String} The type of the event
    * @param eventObj {Object} An object which subscribers can use
    */
   post: function(type, eventObj) {
      this.notifyRecipients(type, eventObj);      
   },

   /**
    * Run through the list of subscribers for the event type specified.  
    * Optimized for speed if the list is large.
    * @private
    */
   notifyRecipients: function(type, eventObj) {
      if (this.notifyLists[type] == null)
      {
         // No handlers for this type
         return;
      }

		var s = null;
		var scopeObj = null;
		var host = this.getHostOject();
		for (var itr = this.notifyLists[type].iterator(); itr.hasNext(); ) {
			s = itr.next();
			scopeObj = s.parent || host;
			s.func.call(scopeObj, eventObj);
		}
   }
}, /** @scope R.components.logic.Notifier.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.logic.Notifier"
    */
   getClassName: function() {
      return "R.components.logic.Notifier";
   }
});
}