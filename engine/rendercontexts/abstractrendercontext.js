/**
 * The Render Engine
 * AbstractRenderContext
 *
 * @fileoverview The base class for all render contexts.
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
   "class": "R.rendercontexts.AbstractRenderContext",
   "requires": [
      "R.struct.Container",
      "R.math.Math2D",
      "R.engine.GameObject",
      "R.struct.MouseInfo"
   ]
});

/**
 * @class A base rendering context.  Game objects are rendered to a context
 * during engine runtime.  A render context is a container of all of the objects
 * added to it so that each object is given the chance to render.  A render context
 * is logically a scene graph.  While each context can have multiple contexts associated
 * with it, the root of the scene graph is always located at {@link R.Engine#getDefaultContext}.
 *
 * @param contextName {String} The name of this context.  Default: RenderContext
 * @param [surface] {HTMLElement} The surface node that all objects will be rendered to.
 * @extends R.struct.Container
 * @constructor
 * @description Creates a render context
 */
R.rendercontexts.AbstractRenderContext = function() {
   return R.struct.Container.extend(/** @scope R.rendercontexts.AbstractRenderContext.prototype */{

      surface: null,
      transformStackDepth: 0,
      worldBoundary: null,
      viewport: null,
      expViewport:null,
      worldPosition: null,
      worldRotation: null,
      worldScale: null,
      staticCtx: null,
      safeRemoveList: null,
      _handlers: null,

      /** @private */
      constructor: function(contextName, surface) {
         this.worldBoundary = null;
         this.worldScale = 1;
         this.worldPosition = R.math.Point2D.create(0, 0);
         this.worldRotation = 0;
         this.viewport = R.math.Rectangle2D.create(0, 0, 100, 100);
         this.expViewport = R.math.Rectangle2D.create(-25, -25, 125, 125);
         this.staticCtx = false;
         this.safeRemoveList = [];
         this._handlers = [];

         this.base(contextName || "RenderContext");
         this.surface = surface;
         this.setElement(surface);

         var pType = this.jQ().css("position");
         if (pType === "" || pType === "auto" || pType === "static") {
            // Make it relative so we can get it's offset in the document
            this.jQ().css("position", "relative");
         }
      },

      /**
       * Releases this context back into the pool for reuse
       */
      release: function() {
         this.base();
         this.surface = null;
         this.transformStackDepth = 0;
         this.worldScale = null;
         this.worldPosition = null;
         this.worldRotation = null;
         this.staticCtx = null;
         this.safeRemoveList = null;
         this.viewport = null;
         this.expViewport = null;
         this.worldBoundary = null;
         this._handlers = null;
      },

      /**
       * Destroy the rendering context, any objects within the context, and detach
       * the surface from its parent container.
       */
      destroy: function() {
         // Destroy all of the objects
         this.cleanUp();
         this.surface = null;
         this.viewport.destroy();
         this.expViewport.destroy();
         this.worldPosition.destroy();
         if (this.worldBoundary != null) {
            this.worldBoundary.destroy();
         }
         if (this._handlers[0]) {
            this.uncaptureMouse();
         }
         if (this._handlers[1]) {
            this.uncaptureTouch();
         }
         this.base();
      },

      /**
       * Set the surface element that objects will be rendered to.
       *
       * @param element {HTMLElement} The document node that all objects will be rendered to.
       */
      setSurface: function(element) {
         this.surface = element;
         this.setElement(element);
      },

      /**
       * Get the surface node that all objects will be rendered to.
       * @return {HTMLElement} The document node that represents the rendering surface
       */
      getSurface: function() {
         return this.surface;
      },

      /**
       * Set the context to be static.  Setting a context to be static effectively removes
       * it from the automatic update when the world is updated.  The user will need to call
       * {@link #render}, passing the world time (gotten with {@link R.Engine#worldTime})
       * to manually render the context.  Any objects within the context will then render
       * to the context.
       *
       * @param state {Boolean} <tt>true</tt> to set the context to static
       */
      setStatic: function(state) {
         this.staticCtx = state;
      },

      /**
       * Determine if the context is static.
       * @return {Boolean}
       */
      isStatic: function() {
         return this.staticCtx;
      },

      /**
       * Enable mouse event capturing within the render context.  The mouse
       * event data will be accessible by calling {@link #getMouseInfo}.
       */
      captureMouse: function() {
         if (!this._handlers[0]) {
            R.rendercontexts.AbstractRenderContext.assignMouseHandler(this);
            var self = this;
            R.Engine.onShutdown(function() {
               self.uncaptureMouse();
            });
            this._handlers[0] = true;
         }
      },

      /**
       * Disable mouse event capturing within the render context.
       */
      uncaptureMouse: function() {
         R.rendercontexts.AbstractRenderContext.removeMouseHandler(this);
         this._handlers[0] = false;
      },

      /**
       * Get the state of the mouse in the rendering context.  You must first enable mouse
       * event capturing with {@link #captureMouse}.  See {@link R.struct.MouseInfo} for more
       * information about what is in the object.
       *
       * @return {R.struct.MouseInfo} The current state of the mouse
       */
      getMouseInfo: function() {
         return this.getObjectDataModel(R.rendercontexts.AbstractRenderContext.MOUSE_DATA_MODEL);
      },

      /**
       * Enable touch event capturing within the render context.  The touch
       * event data will be accessible by calling {@link #getTouchInfo}.
       */
      captureTouch: function() {
         if (!this._handlers[1]) {
            R.rendercontexts.AbstractRenderContext.assignTouchHandler(this);
            var self = this;
            R.Engine.onShutdown(function() {
               self.uncaptureTouch();
            });
            this._handlers[1] = true;
         }
      },

      /**
       * Disable touch event capturing within the render context.
       */
      uncaptureTouch: function() {
         R.rendercontexts.AbstractRenderContext.removeTouchHandler(this);
         this._handlers[1] = false;
      },

      /**
       * Get the state of touches in the rendering context.  You must first enable touch
       * event capturing with {@link #captureTouch}.  See {@link R.struct.TouchInfo} for more
       * information about what is in the object.
       *
       * @return {R.struct.TouchInfo} The current state of touches
       */
      getTouchInfo: function() {
         return this.getObjectDataModel(R.rendercontexts.AbstractRenderContext.TOUCH_DATA_MODEL);
      },

      /**
       * [ABSTRACT] Set the scale of the rendering context.
       *
       * @param scaleX {Number} The scale along the X dimension
       * @param scaleY {Number} The scale along the Y dimension
       */
      setScale: function(scaleX, scaleY) {
      },

      /**
       * Set the world scale of the rendering context.  All objects should
       * be adjusted by this scale when the context renders.
       *
       * @param scale {Number} The uniform scale of the world
       */
      setWorldScale: function(scale) {
         this.worldScale = scale;
      },

      /**
       * Set the world rotation of the rendering context.  All objects
       * should be adjusted by this rotation when the context renders.
       * @param rotation {Number} The rotation angle
       */
      setWorldRotation: function(rotation) {
         this.worldRotation = rotation;
      },

      /**
       * Set the world position of the rendering context.  All objects
       * should be adjuest by this position when the context renders.
       * @param point {R.math.Point2D|Number} The world position or X coordinate
       * @param [y] {Number} If <tt>point</tt> is a number, this is the Y coordinate
       */
      setWorldPosition: function(point, y) {
         this.worldPosition.set(point, y);
      },

      /**
       * Gets an array representing the rendering scale of the world.
       * @return {Array} The first element is the X axis, the second is the Y axis
       */
      getWorldScale: function() {
         return this.worldScale;
      },

      /**
       * Gets the world rotation angle.
       * @return {Number}
       */
      getWorldRotation: function() {
         return this.worldRotation;
      },

      /**
       * Get the world render position.
       * @return {R.math.Point2D}
       */
      getWorldPosition: function() {
         return this.worldPosition;
      },

      /**
       * Set the world boundaries.  Set the world boundaries bigger than the viewport
       * to create a virtual world.  By default, the world boundary matches the viewport.
       * @param rect {R.math.Rectangle2D}
       */
      setWorldBoundary: function(rect) {
         this.worldBoundary = rect;
      },

      /**
       * get the world boundaries.
       * @return {R.math.Rectangle2D}
       */
      getWorldBoundary: function(rect) {
         return this.worldBoundary;
      },

      /**
       * Set the viewport of the render context.  The viewport is a window
       * upon the world so that not all of the world is rendered at one time.
       * @param rect {R.math.Rectangle2D} A rectangle defining the viewport
       */
      setViewport: function(rect) {
         this.viewport.set(rect);

         // Calculate the expanded viewport
         var w = rect.getDims().x * 0.25, h = rect.getDims().y * 0.25,
             tl = rect.getTopLeft(), d = rect.getDims();
         this.expViewport.set(tl.x - w, tl.y - h, tl.x + d.x + (w * 2), tl.y + d.y + (h * 2));
      },
      
      /**
       * Get the viewport of the render context.
       * @return {R.math.Rectangle2D}
       */
      getViewport: function() {
         return this.viewport;
      },

      /**
       * A viewport that is 25% larger than {@link #getViewport} to account for
       * an area slightly outside the viewing area.  Typically used to determin
       * what objects are to be processed in the scenegraph.
       * @return {R.math.Rectangle2D}
       */
      getExpandedViewport: function() {
         return this.expViewport;
      },

      /**
       * Add an object to the context.  Only objects
       * within the context will be rendered.  If an object declared
       * an <tt>afterAdd()</tt> method, it will be called after the object
       * has been added to the context.
       *
       * @param obj {R.engine.BaseObject} The object to add to the render list
       */
      add: function(obj) {
         this.base(obj);

         // Create a structure to hold information that is related to
         // the render context that keeps it separate from the rest of the object.
         obj.setObjectDataModel(R.rendercontexts.AbstractRenderContext.DATA_MODEL, {});

         if (obj instanceof R.engine.GameObject) {
            obj.setRenderContext(this);
            this.sort();
         }
      },

      /**
       * Remove an object from the render context.  The object is
       * not destroyed when it is removed from the container.  The removal
       * occurs after each update to avoid disrupting the flow of object
       * traversal.
       *
       * @param obj {Object} The object to remove from the container.
       * @return {Object} The object that was removed
       */
      remove: function(obj) {
         this.safeRemoveList.push(obj);
      },

      /**
       * Remove an object from the render context at the specified index.
       * The object is not destroyed when it is removed.  The removal
       * occurs after each update to avoid disrupting the flow of object
       * traversal.
       *
       * @param idx {Number} An index between zero and the size of the container minus 1.
       * @return {Object} The object removed from the container.
       */
      removeAtIndex: function(idx) {
         this.safeRemoveList.push(this.get(idx));
      },

      /**
       * This method is called after the update to remove items from the
       * context.
       * @private
       */
      _safeRemove: function() {
         var obj;
         while ((obj = this.safeRemoveList.shift()) != null) {
            R.struct.Container.prototype.remove.call(this, obj);
         }
         this.safeRemoveList.length = 0;
      },

      /**
       * Returns the structure that contains information held about
       * the rendering context.  This object allows a context to store
       * extra information on an object that an object wouldn't know about.
       * @return {Object} An object with data used by the context
       */
      getContextData: function(obj) {
         return obj.getObjectDataModel(R.rendercontexts.AbstractRenderContext.DATA_MODEL);
      },

      /**
       * [ABSTRACT] Sort the render context's objects.
       * @param sortFn {Function} A function to sort with, or <tt>null</tt> to use the default
       */
      sort: function(sortFn) {
         this.base(sortFn);
      },

      /**
       * [ABSTRACT] Clear the context and prepare it for rendering.  If you pass a
       * rectangle, only that portion of the world will be cleared.  If
       * you don't pass a rectangle, the entire context is cleared.
       *
       * @param rect {R.math.Rectangle2D} The area to clear in the context, or
       *             <tt>null</tt> to clear the entire context.
       */
      reset: function(rect) {
      },

      /**
       * Update the render context before rendering the objects to the surface.
       * If the context isn't static, this will reset and then render the context.
       * If the context is static, you'll need to perform the reset and render yourself.
       * This allows you to update objects in the world, skip the reset, and then
       * render yourself.  This can be an effective way to handle redrawing the world
       * only as needed.
       *
       * @param parentContext {R.rendercontexts.AbstractRenderContext} A parent context, or <tt>null</tt>
       * @param time {Number} The current render time in milliseconds from the engine.
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      update: function(parentContext, time, dt) {
         if (!this.staticCtx) {
            // Clear and render world
            this.reset();
            this.render(time, dt);
         }
      },

      /**
       * Called to render all of the objects to the context.
       *
       * @param time {Number} The current world time in milliseconds from the engine.
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      render: function(time, dt) {
         // Push the world transform
         this.pushTransform();

         this.setupWorld(time, dt);

         // Run the objects if they are visible
         var objs = this.iterator();
         while (objs.hasNext()) {
            this.renderObject(objs.next(), time, dt);
         }

         objs.destroy();

         // Restore the world transform
         this.popTransform();

         // Safely remove any objects that were removed from
         // the context while it was rendering
         if (this.safeRemoveList.length > 0) {
            this._safeRemove();
         }
      },

      /**
       * Render a single object into the world for the given time.
       * @param obj {R.engine.BaseObject} An object to render
       * @param time {Number} The world time, in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      renderObject: function(obj, time, dt) {
         obj.update(this, time, dt);
      },

      /**
       * [ABSTRACT] Gives the render context a chance to initialize the world.
       * Use this method to change the world position, rotation, scale, etc.
       *
       * @param time {Number} The current world time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      setupWorld: function(time, dt) {
      },

      /**
       * Increment the transform stack counter.
       */
      pushTransform: function() {
         this.transformStackDepth++;
      },

      /**
       * Decrement the transform stack counter and ensure that the stack
       * is not unbalanced.  An unbalanced stack can be indicative of
       * objects that do not reset the state after rendering themselves.
       */
      popTransform: function() {
         this.transformStackDepth--;
         Assert((this.transformStackDepth >= 0), "Unbalanced transform stack!");
      },

      /**
       * This is a potentially expensive call, and can lead to rendering
       * errors.  It is recommended against calling this method!
       */
      resetTransformStack: function() {
         while (this.transformStackDepth > 0) {
            this.popTransform();
         }
      }
   }, /** @scope R.rendercontexts.AbstractRenderContext.prototype */{

      /**
       * Get the class name of this object
       * @return {String} "R.rendercontexts.AbstractRenderContext"
       */
      getClassName: function() {
         return "R.rendercontexts.AbstractRenderContext";
      },

      /**
       * @private
       */
      DATA_MODEL: "RenderContext",

      /**
       * @private
       */
      MOUSE_DATA_MODEL: "mouseInfo",

      /**
       * @private
       */
      TOUCH_DATA_MODEL: "touchInfo",

      /**
       * Assigns the mouse handlers.
       * @private
       * @param ctx {R.rendercontexts.AbstractRenderContext} The context to assign the handlers to
       */
      assignMouseHandler: function(ctx) {
         // Assign handlers to the context, making sure to only add
         // the handler once.  This way we don't have hundreds of mouse move
         // handlers taking up precious milliseconds.
         var ctxData = ctx.getObjectDataModel(),
             mouseInfo = ctx.getObjectDataModel(R.rendercontexts.AbstractRenderContext.MOUSE_DATA_MODEL);

         if (!mouseInfo) {
            mouseInfo = ctx.setObjectDataModel(R.rendercontexts.AbstractRenderContext.MOUSE_DATA_MODEL,
                           R.struct.MouseInfo.create());

            ctx.addEvent(ctx, "mousemove", function(evt) {
               if (mouseInfo.moveTimer != null) {
                  mouseInfo.moveTimer.destroy();
                  mouseInfo.moveTimer = null;
               }
               mouseInfo.lastPosition.set(mouseInfo.position);

               // BAF: 05/31/2011 - https://github.com/bfattori/TheRenderEngine/issues/7
               // BAF: 06/17/2011 - https://github.com/bfattori/TheRenderEngine/issues/9
               // Adjust for position of context
               var x = evt.pageX, y = evt.pageY;
               mouseInfo.position.set(x, y).sub(ctx.getObjectDataModel("DOMPosition"));

               // Move vector is calculated relative to the last position
               mouseInfo.moveVec.set(mouseInfo.lastPosition);
               mouseInfo.moveVec.sub(mouseInfo.position);

               if (mouseInfo.button != R.engine.Events.MOUSE_NO_BUTTON) {
                  // Drag vector originates from the "down" position and is normalized
                  mouseInfo.dragVec.set(mouseInfo.downPosition);
                  mouseInfo.dragVec.sub(mouseInfo.position).normalize();
               }

               mouseInfo.moveTimer = R.lang.Timeout.create("mouseMove", 33, function() {
                  mouseInfo.moveVec.set(0, 0);
               });
            });

            ctx.addEvent(ctx, "mousedown", function(evt) {
               mouseInfo.button = evt.which;
               var x = evt.pageX, y = evt.pageY;

               mouseInfo.downPosition.set(x, y).sub(ctx.getObjectDataModel("DOMPosition"));
               evt.preventDefault();
            });

            ctx.addEvent(ctx, "mouseup", function(evt) {
               mouseInfo.button = R.engine.Events.MOUSE_NO_BUTTON;
               mouseInfo.dragVec.set(0, 0);
            });

         }
      },

      /**
       * Remove the mouse handlers
       * @param ctx
       * @private
       */
      removeMouseHandler: function(ctx) {
         ctx.setObjectDataModel(R.rendercontexts.AbstractRenderContext.MOUSE_DATA_MODEL, undefined);
         ctx.removeEvent(ctx, "mousemove");
         ctx.removeEvent(ctx, "mousedown");
         ctx.removeEvent(ctx, "mouseup");
      },

      /**
       * Assigns the touch handlers.
       * @private
       * @param ctx {R.rendercontexts.AbstractRenderContext} The context to assign the handlers to
       */
      assignTouchHandler: function(ctx) {
         // Assign handlers to the context, making sure to only add
         // the handler once.  This way we don't have hundreds of mouse move
         // handlers taking up precious milliseconds.
         var ctxData = ctx.getObjectDataModel(),
             touchInfo = ctx.getObjectDataModel(R.rendercontexts.AbstractRenderContext.TOUCH_DATA_MODEL);

         if (!touchInfo) {
            touchInfo = ctx.setObjectDataModel(R.rendercontexts.AbstractRenderContext.TOUCH_DATA_MODEL,
                           R.struct.TouchInfo.create());

            ctx.addEvent(ctx, "touchmove", function(evt) {
               touchInfo.touches = R.struct.TouchInfo.processTouches(evt.originalEvent);

               if (touchInfo.moveTimer != null) {
                  touchInfo.moveTimer.destroy();
                  touchInfo.moveTimer = null;
               }
               touchInfo.lastPosition.set(touchInfo.position);

               // Use the first touch as the position
               var x = touchInfo.touches[0].getX(), y = touchInfo.touches[0].getY();

               touchInfo.position.set(x, y).sub(ctx.getObjectDataModel("DOMPosition"));

               // Move vector is calculated relative to the last position
               touchInfo.moveVec.set(touchInfo.lastPosition);
               touchInfo.moveVec.sub(touchInfo.position);

               // Drag vector originates from the "down" touch and is normalized
               touchInfo.dragVec.set(touchInfo.downPosition);
               touchInfo.dragVec.sub(touchInfo.position).normalize();

               touchInfo.moveTimer = R.lang.Timeout.create("touchMove", 33, function() {
                  touchInfo.moveVec.set(0, 0);
               });
            });

            ctx.addEvent(ctx, "touchstart", function(evt) {
               touchInfo.touches = R.struct.TouchInfo.processTouches(evt.originalEvent);
               touchInfo.button = R.engine.Events.MOUSE_LEFT_BUTTON;

               // Use the first touch as the down position
               var x = touchInfo.touches[0].getX(), y = touchInfo.touches[0].getY();

               touchInfo.downPosition.set(x, y).sub(this._offset);
               evt.preventDefault();
            });

            ctx.addEvent(ctx, "touchend", function(evt) {
               touchInfo.touches = R.struct.TouchInfo.processTouches(evt.originalEvent);
               touchInfo.button = R.engine.Events.MOUSE_NO_BUTTON;
               touchInfo.dragVec.set(0, 0);
            });

         }
      },

      /**
       * Remove the touch handlers
       * @param ctx
       * @private
       */
      removeTouchHandler: function(ctx) {
         ctx.setObjectDataModel(R.rendercontexts.AbstractRenderContext.TOUCH_DATA_MODEL, undefined);
         ctx.removeEvent(ctx, "touchmove");
         ctx.removeEvent(ctx, "touchstart");
         ctx.removeEvent(ctx, "touchend");
      }

   });

};
