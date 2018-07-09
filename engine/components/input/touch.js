/**
 * The Render Engine
 * TouchComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A component which responds to touch events and notifies
 * its {@link R.engine.GameObject} by triggering one of three events.  The <tt>R.engine.GameObject</tt>
 * should add event handlers for any one of:
 * <ul>
 * <li><tt>touchstart</tt> - A touch event started</li>
 * <li><tt>touchend</tt> - A touch event ended</li>
 * <li><tt>touchmove</tt> - A movement occurred after a touch event started</li>
 * </ul>
 * Each event handler will be passed a {@link R.struct.TouchInfo TouchInfo} object which
 * contains information about the event.  The <tt>touchmove</tt> event is also passed a boolean
 * flag indicating if the touch is within the world bounding box of the game object.
 * <p/>
 * <i>Note: The rendering context that the object is contained within needs to enable touch event
 * capturing with the {@link R.rendercontexts.AbstractRenderContext#captureTouch} method.</i>
 *
 * @param name {String} The unique name of the component.
 * @param [priority] {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create an instance of a touch input component.
 */
class TouchComponent extends InputComponent {

  /**
   * Destroy this instance and remove all references.
   */
  destroy() {
    if (this.gameObject) {
      delete this.gameObject.objectDataModel[TouchComponent.TOUCH_DATA_MODEL];
    }
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "TouchComponent"
   */
  get className() {
    return "TouchComponent";
  }

  /**
   * @private
   */
  static TOUCH_DATA_MODEL = "TouchInputComponent";

  /**
   * Establishes the link between this component and its host object.
   * When you assign components to a host object, it will call this method
   * so that each component can refer to its host object, the same way
   * a host object can refer to a component with {@link GameObject#getComponent}.
   *
   * @param gameObject {GameObject} The object which hosts this component
   */
  set gameObject(gameObject) {
    super.gameObject = gameObject;

    // Set some flags we can check
    var dataModel = gameObject.setObjectDataModel(MouseComponent.TOUCH_DATA_MODEL, {
      touchDown: false
    });
  }

  /**
   * Perform the checks on the touch info object, and also perform
   * intersection tests to be able to call touch events.
   * @param time {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    // Objects may be in motion.  If so, we need to call the touch
    // methods for just such a case.
    var gameObject = this.gameObject;


    // Only objects without an element will use this.  For object WITH an element,
    // this component will have intervened and wired up special handlers to fake
    // the mouseInfo object.
    var touchInfo = this.gameObject.renderContext.touchInfo,
      bBox = gameObject.worldBox,
      touchOn = false,
      dataModel = gameObject.objectDataModel[R.components.input.Touch.TOUCH_DATA_MODEL];

    if (touchInfo && bBox) {
      touchOn = Math2D.boxPointCollision(bBox, touchInfo.position);
    }

    // Touched on object
    if (touchOn && (touchInfo.button != Events.MOUSE_NO_BUTTON)) {
      dataModel.touchDown = true;
      gameObject.triggerEvent("touchstart", [touchInfo]);
    }

    // Touch position changed
    if (dataModel.touchDown && !touchInfo.position.equals(touchInfo.lastPosition)) {
      gameObject.triggerEvent("touchmove", [touchInfo, touchOn]);
    }

    // Touch ended (and object was touched)
    if (dataModel.touchDown && touchInfo.button == Events.MOUSE_NO_BUTTON) {
      dataModel.touchDown = false;
      gameObject.triggerEvent("touchend", [touchInfo]);
    }
  }

}
