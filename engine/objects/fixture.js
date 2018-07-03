/**
 * The Render Engine
 * Fixture object
 *
 * @fileoverview A fixture is a box which either defines a solid area or a trigger.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1562 $
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

/**
 * @class A fixture is a simple rectangular area used to define either
 *             a solid area, or a trigger for a callback.
 * @param rect {Rectangle2D} The box which defines the area of the fixture
 *    @param visible {Boolean} <code>true</tt> to render a visible rectangle for the fixture
 * @constructor
 * @extends R.objects.Object2D
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
          return this.boxRect.width;
        }.bind(this),
        function (i) {
          this.width = i;
        }.bind(this)
      ]);
    props.add("Height",
      [
        function () {
          return this.boxRect.height;
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
        this.setType(i == "TYPE_COLLIDER" ? Fixture.TYPE_COLLIDER : Fixture.TYPE_TRIGGER);
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
   * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
   * @param time {Number} The engine time in milliseconds
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  update(renderContext, time, dt) {
    renderContext.pushTransform();

    super.update(renderContext, time, dt);

    if (this._visible) {
      var color = this.type == Fixture.TYPE_COLLIDER ? "0,255,255" : "255,0,0";
      renderContext.setFillStyle("rgba(" + color + ",0.4)");
      renderContext.drawFilledRectangle(this.boxRect);
      renderContext.setLineWidth(1);

      renderContext.drawText(this.boxRect.topLeft(), this.type == Fixture.TYPE_COLLIDER ?
        "solid" : "trigger");
      renderContext.drawRectangle(this.boxRect);
    }

    renderContext.popTransform();
  }

  /**
   * Get the type of collision box object being represented.
   * @return {Number}
   */
  get type() {
    return this._type;
  }

  /**
   * Set the type of collision box this will be.
   */
  set type(type) {
    this._type = type;
    if (type == CollisionBox.TYPE_TRIGGER) {
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
    this._boxRect.width = width;
    this._boxRect.height = height;
    this.boundingBox = this._boxRect;
  }

  /**
   * Set the width of the collision box
   */
  set width(width) {
    this._boxRect.width = width;
    this.boundingBox = this.boxRect;
  }

  /**
   * Set the height of the collision box
   */
  set height(height) {
    this._boxRect.height = height;
    this.boundingBox = this.boxRect;
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


