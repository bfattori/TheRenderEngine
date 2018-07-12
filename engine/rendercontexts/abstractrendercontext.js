/**
 * The Render Engine
 * AbstractRenderContext
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A base rendering context.  Game objects are rendered to a context
 * during engine runtime.  A render context is a container of all of the objects
 * added to it so that each object is given the chance to render.  A render context
 * is logically a scene graph.  While each context can have multiple contexts associated
 * with it, the root of the scene graph is always located at {@link R.Engine#getDefaultContext}.
 *
 * @param contextName {String} The name of this context.  Default: RenderContext
 * @param [surface] {HTMLElement} The surface that all objects are rendered to.
 * @extends Container
 * @constructor
 * @description Creates a render context
 */
class AbstractRenderContext extends Container {

  /** @private */
  constructor(contextName = "AbstractRenderContext", surface = null) {
    this._worldBoundary = Rectangle2D.create(0, 0, 1, 1);
    this._worldPosition = Point2D.create(0, 0);
    this._viewport = Rectangle2D.create(0, 0, 100, 100);
    this._expViewport = Rectangle2D.create(0, 0, 1, 1);
    this._expViewport.copy(this.viewport).grow(100, 100);
    this._worldScale = 1;
    this._worldRotation = 0;
    this._staticCtx = false;
    this._safeRemoveList = [];
    this._handlers = [];

    super(contextName);
    this._surface = surface;
  }

  /**
   * Releases this context back into the pool for reuse
   */
  release() {
    super.release();
    this._surface = null;
    this._transformStackDepth = 0;
    this._worldScale = null;
    this._worldPosition = null;
    this._worldRotation = null;
    this._staticCtx = null;
    this._safeRemoveList = null;
    this._viewport = null;
    this._expViewport = null;
    this._worldBoundary = null;
    this._handlers = null;
  }

  /**
   * Destroy the rendering context, any objects within the context, and detach
   * the surface from its parent container.
   */
  destroy() {
    // Destroy all of the objects
    this.cleanUp();
    this._viewport.destroy();
    this._expViewport.destroy();
    this._worldPosition.destroy();
    this._worldBoundary.destroy();
    if (this._handlers[0]) {
      this.uncaptureMouse();
    }
    if (this._handlers[1]) {
      this.uncaptureTouch();
    }
    super.destroy();
  }

  /**
   * Get the class name of this object
   * @return {String} "R.rendercontexts.AbstractRenderContext"
   */
  get className() {
    return "AbstractRenderContext";
  }

  /**
   * Set the surface element that objects will be rendered to.
   *
   * @param element {HTMLElement} The document node that all objects will be rendered to.
   */
  set surface(element) {
    this._surface = element;
  }

  /**
   * Get the surface node that all objects will be rendered to.
   * @return {HTMLElement} The document node that represents the rendering surface
   */
  get surface() {
    return this._surface;
  }

  /**
   * Set the context to be static.  Setting a context to be static effectively removes
   * it from the automatic update when the world is updated.  The user will need to call
   * {@link #render}, passing the world time (gotten with {@link R.Engine#worldTime})
   * to manually render the context.  Any objects within the context will then render
   * to the context.
   *
   * @param state {Boolean} <tt>true</tt> to set the context to static
   */
  set staticContext(state) {
    this._staticCtx = state;
  }

  /**
   * Determine if the context is static.
   * @return {Boolean}
   */
  get staticContext() {
    return this._staticCtx;
  }

  /**
   * Enable mouse event capturing within the render context.  The mouse
   * event data will be accessible by calling {@link #getMouseInfo}.
   */
  captureMouse() {
    if (!this._handlers[0]) {
      AbstractRenderContext.assignMouseHandler(this);
      RenderEngine.onShutdown(function () {
        this.uncaptureMouse();
      }.bind(this));
      this._handlers[0] = true;
    }
  }

  /**
   * Disable mouse event capturing within the render context.
   */
  uncaptureMouse() {
    AbstractRenderContext.removeMouseHandler(this);
    this._handlers[0] = false;
  }

  /**
   * Get the state of the mouse in the rendering context.  You must first enable mouse
   * event capturing with {@link #captureMouse}.  See {@link R.struct.MouseInfo} for more
   * information about what is in the object.
   *
   * @return {R.struct.MouseInfo} The current state of the mouse
   */
  get mouseInfo() {
    return this.getObjectDataModel(AbstractRenderContext.MOUSE_DATA_MODEL);
  }

  /**
   * Enable touch event capturing within the render context.  The touch
   * event data will be accessible by calling {@link #getTouchInfo}.
   */
  captureTouch() {
    if (!this._handlers[1]) {
      AbstractRenderContext.assignTouchHandler(this);
      RenderEngine.onShutdown(function () {
        this.uncaptureTouch();
      }.bind(this));
      this._handlers[1] = true;
    }
  }

  /**
   * Disable touch event capturing within the render context.
   */
  uncaptureTouch() {
    AbstractRenderContext.removeTouchHandler(this);
    this._handlers[1] = false;
  }

  /**
   * Get the state of touches in the rendering context.  You must first enable touch
   * event capturing with {@link #captureTouch}.  See {@link R.struct.TouchInfo} for more
   * information about what is in the object.
   *
   * @return {TouchInfo} The current state of touches
   */
  get touchInfo() {
    return this.getObjectDataModel(AbstractRenderContext.TOUCH_DATA_MODEL);
  }

  /**
   * [ABSTRACT] Set the scale of the rendering context.
   *
   * @param scaleX {Number} The scale along the X dimension
   * @param scaleY {Number} The scale along the Y dimension
   */
  setScale(scaleX, scaleY) {
  }

  /**
   * Set the world scale of the rendering context.  All objects should
   * be adjusted by this scale when the context renders.
   *
   */
  set worldScale(scale) {
    this._worldScale = scale;
  }

  /**
   * Set the world rotation of the rendering context.  All objects
   * should be adjusted by this rotation when the context renders.
   */
  set worldRotation(rotation) {
    this._worldRotation = rotation;
  }

  /**
   * Set the world position of the rendering context.  All objects
   * should be adjuest by this position when the context renders.
   */
  set worldPosition(point) {
    this._worldPosition.copy(point);
  }

  /**
   * Gets an array representing the rendering scale of the world.
   */
  get worldScale() {
    return this._worldScale;
  }

  /**
   * Gets the world rotation angle.
   */
  get worldRotation() {
    return this._worldRotation;
  }

  /**
   * Get the world render position.
   */
  get worldPosition() {
    return this._worldPosition;
  }

  /**
   * Assign a rectangle to represent the world boundaries
   * @param rect {Rectangle2D}
   */
  set worldBoundaries(rect) {
    this.worldBoundary = rect;
  }

  /**
   * get the world boundaries.
   * @return {Rectangle2D}
   */
  get worldBoundaries() {
    return this.worldBoundary;
  }

  /**
   * Set the viewport of the render context.  The viewport is a window
   * upon the world so that not all of the world is rendered at one time.
   * @param rect {Rectangle2D} A rectangle defining the viewport
   */
  set viewport(rect) {
    this._viewport = rect;
    this._expViewport.copy(rect).grow(100, 100);
  }

  /**
   * Get the viewport of the render context.
   * @return {Rectangle2D}
   */
  get viewport() {
    return this._viewport;
  }

  /**
   * A viewport that is 25% larger than {@link #getViewport} to account for
   * an area slightly outside the viewing area.  Typically used to determin
   * what objects are to be processed in the scenegraph.
   * @return {Rectangle2D}
   */
  get expandedViewport() {
    return this._expViewport;
  }

  /**
   * Add an object to the context.  Only objects
   * within the context will be rendered.  If an object declared
   * an <tt>afterAdd()</tt> method, it will be called after the object
   * has been added to the context.
   *
   * @param obj {R.engine.BaseObject} The object to add to the render list
   */
  add(obj) {
    super.add(obj);

    // Create a structure to hold information that is related to
    // the render context that keeps it separate from the rest of the object.
    obj.setObjectDataModel(AbstractRenderContext.DATA_MODEL, {});

    if (obj instanceof GameObject) {
      obj.renderContext = this;
      this.sort();
    }
  }

  /**
   * Remove an object from the render context.  The object is
   * not destroyed when it is removed from the container.  The removal
   * occurs after each update to avoid disrupting the flow of object
   * traversal.
   *
   * @param obj {Object} The object to remove from the container.
   * @return {Object} The object that was removed
   */
  remove(obj) {
    this._safeRemoveList.push(obj);
  }

  /**
   * Remove an object from the render context at the specified index.
   * The object is not destroyed when it is removed.  The removal
   * occurs after each update to avoid disrupting the flow of object
   * traversal.
   *
   * @param idx {Number} An index between zero and the size of the container minus 1.
   * @return {Object} The object removed from the container.
   */
  removeAtIndex(idx) {
    this._safeRemoveList.push(this.get(idx));
  }

  /**
   * This method is called after the update to remove items from the
   * context.
   * @protected
   */
  _safeRemove() {
    var obj;
    while ((obj = this._safeRemoveList.shift()) != null) {
      Container.prototype.remove.call(this, obj);
    }
    this._safeRemoveList.length = 0;
  }

  /**
   * Returns the structure that contains information held about
   * the rendering context.  This object allows a context to store
   * extra information on an object that an object wouldn't know about.
   * @return {Object} An object with data used by the context
   */
  static getContextData(obj) {
    return obj.objectDataModel[AbstractRenderContext.DATA_MODEL];
  }

  /**
   * [ABSTRACT] Sort the render context's objects.
   * @param sortFn {Function} A function to sort with, or <tt>null</tt> to use the default
   */
  sort(sortFn) {
    super.sort(sortFn);
  }

  /**
   * [ABSTRACT] Clear the context and prepare it for rendering.  If you pass a
   * rectangle, only that portion of the world will be cleared.  If
   * you don't pass a rectangle, the entire context is cleared.
   *
   * @param rect {R.math.Rectangle2D} The area to clear in the context, or
   *             <tt>null</tt> to clear the entire context.
   */
  reset(rect = null) {
  }

  /**
   * Update the render context before rendering the objects to the surface.
   * If the context isn't static, this will reset and then render the context.
   * If the context is static, you'll need to perform the reset and render yourself.
   * This allows you to update objects in the world, skip the reset, and then
   * render yourself.  This can be an effective way to handle redrawing the world
   * only as needed.
   *
   * @param time {Number} The current render time in milliseconds from the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  update(time, dt) {
    var itr = this.iterator;
    while (itr.hasNext()) {
      itr.next().update(time, dt);
    }
    itr.destroy();
  }

  /**
   * Render all of the objects to the world.
   */
  render(renderContext) {
    if (this._staticCtx) {
      return;
    }

    this.reset();
    this.pushTransform();
    this.setupWorld();

    var itr = this.iterator;
    while (itr.hasNext()) {
      itr.next().render(this);
    }
    itr.destroy();

    this.popTransform();

    // Safely remove any objects that were removed from
    // the context while it was rendering
    this._safeRemove();
  }

  /**
   * [ABSTRACT] Gives the render context a chance to initialize the world.
   * Use this method to change the world position, rotation, scale, etc.
   *
   */
  setupWorld() {
  }

  /**
   * Increment the transform stack counter.
   */
  pushTransform() {
    this._transformStackDepth++;
  }

  /**
   * Decrement the transform stack counter and ensure that the stack
   * is not unbalanced.  An unbalanced stack can be indicative of
   * objects that do not reset the state after rendering themselves.
   */
  popTransform() {
    this._transformStackDepth--;
    Assert((this._transformStackDepth >= 0), "Unbalanced transform stack!");
  }

  /**
   * This is a potentially expensive call, and can lead to rendering
   * errors.  It is recommended against calling this method!
   */
  resetTransformStack() {
    while (this._transformStackDepth > 0) {
      this.popTransform();
    }
  }

  static DATA_MODEL = "RenderContext";
  static MOUSE_DATA_MODEL = "mouseInfo";
  static TOUCH_DATA_MODEL = "touchInfo";

  /**
   * Assigns the mouse handlers.
   * @private
   * @param ctx {AbstractRenderContext} The context to assign the handlers to
   */
  static assignMouseHandler(ctx) {
    // Assign handlers to the context, making sure to only add
    // the handler once.  This way we don't have hundreds of mouse move
    // handlers taking up precious milliseconds.
    var mouseInfo = ctx.getObjectDataModel(AbstractRenderContext.MOUSE_DATA_MODEL);

    if (!mouseInfo) {
      mouseInfo = ctx.setObjectDataModel(AbstractRenderContext.MOUSE_DATA_MODEL,
        MouseInfo.create());

      ctx.addEvent(ctx, "mousemove", function (evt) {
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

        mouseInfo.moveTimer = R.lang.Timeout.create("mouseMove", 33, function () {
          mouseInfo.moveVec.set(0, 0);
        });
      });

      ctx.addEvent(ctx, "mousedown", function (evt) {
        mouseInfo.button = evt.which;
        var x = evt.pageX, y = evt.pageY;

        mouseInfo.downPosition.set(x, y).sub(ctx.getObjectDataModel("DOMPosition"));
        evt.preventDefault();
      });

      ctx.addEvent(ctx, "mouseup", function (evt) {
        mouseInfo.button = R.engine.Events.MOUSE_NO_BUTTON;
        mouseInfo.dragVec.set(0, 0);
      });

    }
  }

  /**
   * Remove the mouse handlers
   * @param ctx
   * @private
   */
  static removeMouseHandler(ctx) {
    ctx.setObjectDataModel(AbstractRenderContext.MOUSE_DATA_MODEL, undefined);
    ctx.removeEvent(ctx, "mousemove");
    ctx.removeEvent(ctx, "mousedown");
    ctx.removeEvent(ctx, "mouseup");
  }

  /**
   * Assigns the touch handlers.
   * @private
   * @param ctx {AbstractRenderContext} The context to assign the handlers to
   */
  static assignTouchHandler(ctx) {
    // Assign handlers to the context, making sure to only add
    // the handler once.  This way we don't have hundreds of mouse move
    // handlers taking up precious milliseconds.
    var touchInfo = ctx.getObjectDataModel(R.rendercontexts.AbstractRenderContext.TOUCH_DATA_MODEL);

    if (!touchInfo) {
      touchInfo = ctx.setObjectDataModel(R.rendercontexts.AbstractRenderContext.TOUCH_DATA_MODEL,
        R.struct.TouchInfo.create());

      ctx.addEvent(ctx, "touchmove", function (evt) {
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

        touchInfo.moveTimer = R.lang.Timeout.create("touchMove", 33, function () {
          touchInfo.moveVec.set(0, 0);
        });
      });

      ctx.addEvent(ctx, "touchstart", function (evt) {
        touchInfo.touches = R.struct.TouchInfo.processTouches(evt.originalEvent);
        touchInfo.button = R.engine.Events.MOUSE_LEFT_BUTTON;

        // Use the first touch as the down position
        var x = touchInfo.touches[0].getX(), y = touchInfo.touches[0].getY();

        touchInfo.downPosition.set(x, y).sub(this._offset);
        evt.preventDefault();
      });

      ctx.addEvent(ctx, "touchend", function (evt) {
        touchInfo.touches = R.struct.TouchInfo.processTouches(evt.originalEvent);
        touchInfo.button = R.engine.Events.MOUSE_NO_BUTTON;
        touchInfo.dragVec.set(0, 0);
      });

    }
  }

  /**
   * Remove the touch handlers
   * @param ctx
   * @private
   */
  static removeTouchHandler(ctx) {
    ctx.setObjectDataModel(AbstractRenderContext.TOUCH_DATA_MODEL, undefined);
    ctx.removeEvent(ctx, "touchmove");
    ctx.removeEvent(ctx, "touchstart");
    ctx.removeEvent(ctx, "touchend");
  }

}

