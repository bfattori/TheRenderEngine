/**
 * The Render Engine
 * MouseInputComponent
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A component which responds to mouse events and notifies
 * the host object when one of the events occurs.  The <tt>R.engine.GameObject</tt> should
 * add event handlers for any of the following:
 * <ul>
 * <li><tt>mouseover</tt> - The mouse moved over the host object, or the object moved under the mouse</li>
 * <li><tt>mouseout</tt> - The mouse moved out of the host object (after being over it)</li>
 * <li><tt>mousedown</tt> - A mouse button was depressed, while over the object</li>
 * <li><tt>mouseup</tt> - A mouse button was released</li>
 * <li><tt>click</tt> - A mouse button was depressed, and released, while over the object</li>
 * <li><tt>mousemove</tt> - The mouse was moved</li>
 * </ul>
 * Each event is passed the event object and a {@link R.struct.MouseInfo MouseInfo} structure which
 * contains information about the mouse event in the context of a game.
 * <p/>
 * <i>Note: The rendering context that the object is contained within needs to enable mouse event
 * capturing with the {@link R.rendercontexts.AbstractRenderContext#captureMouse} method.</i>
 * Objects which wish to be notified via the <tt>mouseover</tt> event handler will need to define
 * a bounding box.
 *
 * @param name {String} The unique name of the component.
 * @param priority {Number} The priority of the component among other input components.
 * @extends R.components.Input
 * @constructor
 * @description Create a mouse input component.
 */
class MouseComponent extends InputComponent {

  static MOUSE_DATA_MODEL = "MouseInputComponent";

  /**
   * Destroy the component.
   */
  destroy() {
    if (this.gameObject) {
      delete this.gameObject.objectDataModel[MouseComponent.MOUSE_DATA_MODEL];
    }
    super.destroy();
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "MouseComponent"
   */
  get className() {
    return "MouseComponent";
  }

  /**
   * Set the game object this component exists within.  Additionally, this component
   * sets some readable flags on the game object and establishes (if not already set)
   * a mouse listener on the render context.
   *
   * @param gameObject {GameObject} The object which hosts the component
   * @private
   */
  set gameObject(gameObject) {
    super.gameObject = gameObject;

    // Set some flags we can check
    var dataModel = gameObject.setObjectDataModel(MouseComponent.MOUSE_DATA_MODEL, {
      mouseOver: false,
      mouseDown: false
    });
  }



  /**
   * Perform the checks on the mouse info object, and also perform
   * intersection tests to be able to call mouse events.
   * @param renderContext {AbstractRenderContext} The render context
   * @param time {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  execute(time, dt) {
    // Objects may be in motion.  If so, we need to call the mouse
    // methods for just such a case.
    var gameObject = this.gameObject;
    var mouseInfo = this.gameObject.renderContext.mouseInfo,
      bBox = gameObject.worldBox,
      mouseOver = false,
      dataModel = gameObject.objectDataModel[MouseComponent.MOUSE_DATA_MODEL];

    if (mouseInfo && bBox) {
      mouseOver = Math2D.boxPointCollision(bBox, mouseInfo.position);
    }

    // Mouse position changed
    if (!mouseInfo.position.equals(mouseInfo.lastPosition) && mouseOver) {
      gameObject.triggerEvent("mousemove", [mouseInfo]);
    }

    // Mouse is over object
    if (mouseOver && !dataModel.mouseOver) {
      dataModel.mouseOver = true;
      gameObject.triggerEvent("mouseover", [mouseInfo]);
    }

    // Mouse was over object
    if (!mouseOver && dataModel.mouseOver === true) {
      dataModel.mouseOver = false;
      mouseInfo.lastOver = this;
      gameObject.triggerEvent("mouseout", [mouseInfo]);
    }

    // Whether the mouse is over the object or not, we'll still record that the
    // mouse button was pressed.
    if (!dataModel.mouseDown && (mouseInfo.button != Events.MOUSE_NO_BUTTON)) {

      // BAF: 06/17/2011 - https://github.com/bfattori/TheRenderEngine/issues/8
      // Mouse down can only be triggered if the mouse went down while over the object
      if (mouseOver) {
        dataModel.mouseDown = true;
        gameObject.triggerEvent("mousedown", [mouseInfo]);
      }
    }

    // Mouse button released (and mouse was down)
    if (dataModel.mouseDown && (mouseInfo.button == Events.MOUSE_NO_BUTTON)) {
      dataModel.mouseDown = false;
      gameObject.triggerEvent("mouseup", [mouseInfo]);

      // Trigger the "click" event if the mouse was pressed and released
      // over an object
      if (mouseOver) {
        gameObject.triggerEvent("click", [mouseInfo]);
      }
    }
  }

}
