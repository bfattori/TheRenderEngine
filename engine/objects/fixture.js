/**
 * The Render Engine
 * Fixture object
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A fixture is a simple rectangular area used to define either
 *             a solid area, or a trigger for a callback.
 * @param rect {Rectangle2D} The box which defines the area of the fixture
 *    @param visible {Boolean} <code>true</tt> to render a visible rectangle for the fixture
 * @constructor
 * @extends Object2D
 */
class Fixture extends Object2D {

  /**
   * This type of box impedes movement through it
   * @type {Number}
   */
  static TYPE_COLLIDER = 1;

  /**
   * This type of box triggers an action
   * @type {Number}
   */
  static TYPE_TRIGGER = 2;

  constructor(rect, visible) {
    super("Fixture");
    this._visible = visible;
    this._position = rect.topLeft;
    rect.topLeft(0, 0);
    this._boundingBox = rect;
    this._type = Fixture.TYPE_COLLIDER;
    this._action = "";
  }

  destroy() {
    this._boundingBox.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   * @return The string <tt>R.objects.Fixture</tt>
   * @type String
   */
  get className() {
    return "Fixture";
  }

  /**
   * Get the properties object for this collision box.
   * @return {Object}
   */
  getProperties() {
    var props = super.getProperties(this);
    props.add("Width",
      [
        function () {
          return this._boundingBox.width;
        }.bind(this),
        function (i) {
          this.width = i;
        }.bind(this)
      ]);
    props.add("Height",
      [
        function () {
          return this._boundingBox.height;
        }.bind(this),
        function (i) {
          this.height = i;
        }.bind(this)
      ]);
    props.add("Type", [
      function () {
        return this.type == Fixture.TYPE_COLLIDER ? "TYPE_COLLIDER" : "TYPE_TRIGGER";
      }.bind(this),
      function (i) {
        this.type = (i === "TYPE_COLLIDER" ? Fixture.TYPE_COLLIDER : Fixture.TYPE_TRIGGER);
      }.bind(this)
    ]);
    props.add("Action",
      [
        function () {
          return this.action.substring(0, 25);
        }.bind(this),
        function (a) {
          this.action = a;
        }.bind(this)
      ]);
  }

  /**
   * Update the player within the rendering context.  This draws
   * the shape to the context, after updating the transform of the
   * object.  If the player is thrusting, draw the thrust flame
   * under the ship.
   *
   * @param renderContext {RenderContext2D} The rendering context
   */
  render(renderContext) {
    renderContext.pushTransform();

    super.update(renderContext, time, dt);

    if (this._visible) {
      var color = this.type == Fixture.TYPE_COLLIDER ? "0,255,255" : "255,0,0";
      renderContext.fillStyle = "rgba(" + color + ",0.4)";
      renderContext.drawFilledRectangle(this.boxRect);
      renderContext.lineWidth = 1;

      renderContext.drawText(this._boundingBox.topLeft, this.type == Fixture.TYPE_COLLIDER ?
        "solid" : "trigger");
      renderContext.drawRectangle(this._boundingBox);
    }

    renderContext.popTransform();
  }

  /**
   * Get the type of collision box object being represented.
   */
  get type() {
    return this._type;
  }

  /**
   * Set the type of collision box this will be.
   */
  set type(type) {
    this._type = type;
    if (type === CollisionBox.TYPE_TRIGGER) {
      this.name = "TriggerBlock";
    } else {
      this.name = "CollisionBlock";
    }
  }

  /**
   * Sets the script which will be called when the block is triggered.
   */
  set action(action) {
    this._action = action;
  }

  /**
   * Set the size of the collision box
   * @param width {Number} The width of the box in pixels
   * @param height {Number} The height of the box in pixels
   */
  setBoxSize(width, height) {
    this._boundingBox.width = width;
    this._boundingBox.height = height;
    this.boundingBox = this._boxRect;
  }

  /**
   * Set the width of the collision box
   */
  set width(width) {
    this._boundingBox.width = width;
  }

  /**
   * Set the height of the collision box
   */
  set height(height) {
    this._boundingBox.height = height;
  }

  /**
   * Set the visibility state of the fixture.
   * @param state {Boolean}
   * @private
   */
  set visible(state) {
    this._visible = state;
  }

}


