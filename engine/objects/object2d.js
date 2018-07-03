/**
 * The Render Engine
 * Object2D
 *
 * @fileoverview An extension of the <tt>HostObject</tt> which is specifically geared
 *               towards 2d game development.
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

/**
 * @class An object for use in a 2d game environment.  If no <tt>transformComponent</tt> is provided,
 * the object will be assigned a {@link Transform2DComponent} component.  This class is the recommended
 * base class for objects used within a 2d game environment, instead of deriving from the base
 * {@link GameObject} class.
 *
 * @param name {String} The name of the object
 * @param [transformComponent] {R.components.Transform2D} The transform component to use, or
 *        <code>null</code>.  If the value is <code>null</code>, the object will be assigned a default
 *        {@link R.components.Transform2D Transform2D} component.
 * @extends GameObject
 * @constructor
 * @description Create a game object with methods for operating in a 2D context.
 */
class Object2D extends GameObject {

  constructor(name, transformComponent) {
    super(name);
    this._lastPosition = Point2D.create(5, 5);
    this.originPos = Point2D.create(5, 5);
    this.oldRenderPosition = Point2D.create(5, 5);
    this.oldBbox = Rectangle2D.create(0, 0, 1, 1);
    this.oldScale = Vector2D.create(1, 1);
    this._boundingBox = Rectangle2D.create(0, 0, 1, 1);
    this._AABB = Rectangle2D.create(0, 0, 1, 1);
    this._worldBox = Rectangle2D.create(0, 0, 1, 1);
    this._worldCircle = Circle2D.create(0, 0, 1);
    this._zIndex = 0;
    this._origin = Point2D.create(0, 0);
    this._originNeg = Point2D.create(0, 0);
    this._collisionHull = null;
    this.regenHull = false;

    // Assign a default 2d transformation component to store position information
    this.defaultTxfmComponent = transformComponent != null ? transformComponent : Transform2DComponent.create("defaultTxfm__");
    this.add(this.defaultTxfmComponent);

    // Initialize the matrices
    this.oMtx = Math2D.identityMatrix();
    this.oMtxN = Math2D.identityMatrix();
  }

  static get __OBJECT2D() {
    return true;
  }

  /**
   * Destroy the object.
   */
  destroy() {
    this._lastPosition.destroy();
    this.originPos.destroy();
    this.oldRenderPosition.destroy();
    this.oldBbox.destroy();
    this.oldScale.destroy();
    this._boundingBox.destroy();
    this._AABB.destroy();
    this._worldBox.destroy();
    this._worldCircle.destroy();
    this._origin.destroy();
    this._originNeg.destroy();
    if (this._collisionHull) {
      this._collisionHull.destroy();
    }

    super.destroy();
  }

  /**
   * Release the object back into the pool.
   */
  release() {
    super.release();
    this._zIndex = 0;
    this._boundingBox = null;
    this._worldBox = null;
    this._worldCircle = null;
    this._lastPosition = null;
    this.originPos = null;
    this.oldRenderPosition = null;
    this.oldBbox = null;
    this.oldScale = null;
    this._AABB = null;
    this._worldCircle = null;
    this._origin = null;
    this._originNeg = null;
    this._collisionHull = null;
    this.regenHull = null;

    // Free the matrices
    this.oMtx = null;
    this.oMtxN = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "R.objects.Object2D"
   */
  get className() {
    return "Object2D";
  }

  /**
   * The axis of rotation
   * @private
   */
  static ROTATION_AXIS = $V([0, 0, 1]);

  /**
   * Get the transformation matrix for this object
   * @return {Matrix}
   */
  get transformationMatrix() {
    // Translation
    var p = this.renderPosition;
    var tMtx = $M([
      [1, 0, p.x],
      [0, 1, p.y],
      [0, 0, 1]
    ]);
    tMtx = tMtx.multiply(this.oMtxN);

    // Rotation
    var a = this.rotation;
    var rMtx;
    if (a != 0) {
      // Move the origin
      rMtx = this.oMtx.dup();
      // Rotate
      rMtx = rMtx.multiply(Matrix.Rotation(Math2D.degToRad(a), Object2D.ROTATION_AXIS));
      // Move the origin back
      rMtx = rMtx.multiply(this.oMtxN);
    }
    else {
      // Set to identity
      rMtx = Math2D.identityMatrix();
    }

    // Scale
    var sX = this.scaleX, sY = this.scaleY, sMtx = $M([
        [sX, 0, 0],
        [0, sY, 0],
        [0, 0, 1]
      ]),
      txfmMtx = tMtx.multiply(rMtx).multiply(sMtx);

    rMtx = null;
    sMtx = null;
    return txfmMtx;
  }

  /**
   * Set the render origin of the object.  The render origin is where the object will be
   * centered around when drawing position and rotation.
   *
   * @param x {Number|Point2D} The X coordinate or the render origin (default: 0,0 - top left corner)
   * @param y {Number} The Y coordinate or <code>null</code> if X is a <code>Point2D</code>
   */
  setOrigin(x, y) {
    this._origin.x = x;
    this._origin.y = y;
    this._originNeg.x = x;
    this._originNeg.y = y;
    this._originNeg.neg();

    var pX = x;
    var pY = y;

    if (x.__POINT2D) {
      pX = x.x;
      pY = x.y;
    }

    this.oMtx.setElements([
      [1, 0, pX],
      [0, 1, pY],
      [0, 0, 1]
    ]);
    this.oMtxN.setElements([
      [1, 0, -pX],
      [0, 1, -pY],
      [0, 0, 1]
    ]);
    this.markDirty();
  }

  /**
   * Get the render origin of the object.
   * @return {Point2D}
   */
  get origin() {
    return this._origin;
  }

  /**
   * Set the bounding box of this object
   *
   * @param width {Number|Rectangle2D} The width, or the rectangle that completely encompasses
   *                                   this object.
   * @param height {Number} If width is a number, this is the height
   */
  setBoundingBox(width, height) {
    throw error("setBoundBox(w,h) on object2d is invalid!");
  }

  /**
   * Get the object's local bounding box.
   */
  get boundingBox() {
    return this._boundingBox;
  }

  set boundingBox(bBox) {
    this._boundingBox = R.clone(bBox);

    if (this.regenHull) {
      this._collisionHull = null;
      this.regenHull = false;
    }

    this.markDirty();
  }
  
  /**
   * [ABSTRACT] Get the object's local bounding circle.
   * @return {Circle2D} The object bounding circle
   */
  get boundingCircle() {
  }

  /**
   * Get the object's bounding box in world coordinates.
   * @return {Rectangle2D} The world bounding rectangle
   */
  get worldBox() {
    // Only update if the object has moved, changed size, or has been scaled
    if (this.renderPosition.equals(this.oldRenderPosition) &&
      this._boundingBox.equals(this.oldBbox) && this.getScale().equals(this.oldScale)) {
      return this._worldBox;
    }

    this._worldBox.x = this.boundingBox.x;
    this._worldBox.y = this.boundingBox.y;
    this._worldBox.width = this.boundingBox.width;
    this._worldBox.height = this.boundingBox.height;

    // Need to apply scaling
    this._worldBox.width = this._worldBox.width * this.scaleX;
    this._worldBox.height = this._worldBox.height * this.scaleY;

    var rPos = Point2D.create(this.renderPosition).add(this._originNeg);
    this._worldBox.offset(rPos);
    rPos.destroy();

    // Remember the changes
    this.oldRenderPosition.x = this.renderPosition.x;
    this.oldRenderPosition.y = this.renderPosition.y;

    this.oldBbox.x = this._boundingBox.x;
    this.oldBbox.y = this._boundingBox.y;
    this.oldBbox.width = this._boundingBox.width;
    this.oldBbox.height = this._boundingBox.height;

    this.oldScale.x = this.scaleX;
    this.oldScale.y = this.scaleY;
    return this._worldBox;
  }

  /**
   * Get the object's bounding circle in world coordinates.  If {@link #getBoundingCircle} returns
   * null, the bounding circle will be approximated using {@link #getBoundingBox}.
   *
   * @return {Circle2D} The world bounding circle
   */
  get worldCircle() {
    var c = this.boundingCircle;

    if (c === null) {
      c = Circle2D.approximateFromRectangle(this.boundingBox);
      this._worldCircle.center.x = c.center.x;
      this._worldCircle.center.y = c.center.y;
      this._worldCircle.radius = c.radius;
      c.destroy();
    } else {
      this._worldCircle.center.x = c.center.x;
      this._worldCircle.center.y = c.center.y;
      this._worldCircle.radius = c.radius;
    }

    var rPos = Point2D.create(this.renderPosition).add(this._originNeg);
    this._worldCircle.offset(rPos);
    rPos.destroy();
    return this._worldCircle;
  }

  /**
   * Get an axis aligned world bounding box for the object.  This bounding box
   * is ensured to encompass the entire object.
   * @return {Rectangle2D}
   */
  get AABB() {
    if (this.isDirty()) {
      Math2D.getBoundingBox(this.collisionHull.vertexes, this._AABB, true);
    }

    return this._AABB;
  }

  /**
   * Set the convex hull used for collision.  The {@link R.components.ConvexCollider ConvexCollider} component
   * uses the collision hull to perform the collision testing.
   * @param convexHull {R.collision.ConvexHull} The convex hull object
   */
  set collisionHull(convexHull) {
    Assert(convexHull instanceof R.collision.ConvexHull, "setCollisionHull() - not ConvexHull!");
    this._collisionHull = convexHull;
    this._collisionHull.gameObject = this;
    this.regenHull = false;
    this.markDirty();
  }

  /**
   * Get the convex hull used for collision testing with a {@link R.components.ConvexCollider ConvexCollider}
   * component.  If no collision hull has been assigned, a {@link R.collision.OBBHull OBBHull} will
   * be created and returned.
   *
   * @return {R.collision.ConvexHull}
   */
  get collisionHull() {
    if (this._collisionHull == null) {
      this._collisionHull = OBBHull.create(this.boundingBox);

      // A flag indicating the hull was auto-generated
      this.regenHull = true;
    }

    return this._collisionHull;
  }

  /**
   * Get the default transform component.
   * @return {Transform2DComponent}
   */
  get defaultTransformComponent() {
    return this.defaultTxfmComponent;
  }

  /**
   * Set, or override, the default transformation component.
   * @param transformComponent {Transform2DComponent}
   */
  set defaultTransformComponent(transformComponent) {
    Assert(transformComponent && transformComponent instanceof Transform2DComponent, "Default transform component not R.components.Transform2DComponent or subclass");

    // If this is the component created by the system, we can just destroy it
    if (this.defaultTxfmComponent && this.defaultTxfmComponent.name() === "DTXFM__") {
      this.remove(this.defaultTxfmComponent);
      this.defaultTxfmComponent.destroy();
    }

    this.defaultTxfmComponent = transformComponent;
  }

  /**
   * Set the position of the object
   * @param point {R.math.Point2D|Number} The position of the object, or a simple X coordinate
   * @param [y] {Number} A Y coordinate if <tt>point</tt> is a number
   */
  setPosition(point, y) {
    this.defaultTransformComponent.setPosition(point, y);
    this.markDirty();
  }

  /**
   * Get the position of the object.
   */
  get position() {
    return this.defaultTransformComponent.position;
  }

  set position(pos) {
    this.defaultTransformComponent.position.x = pos.x;
    this.defaultTransformComponent.position.y = pos.y;
  }

  /**
   * Get the position of the object, at its origin.
   * @return {Point2D} The position
   */
  get originPosition() {
    this.originPos.x = this.position.x;
    this.originPos.y = this.position.y;
    this.originPos.add(this.origin);
  }

  /**
   * Get the render position of the object.
   * @return {Point2D}
   */
  get renderPosition() {
    return this.defaultTransformComponent.renderPosition;
  }

  /**
   * Get the last position the object was rendered at.
   * @return {R.math.Point2D}
   */
  get lastPosition() {
    return this.defaultTransformComponent.lastPosition;
  }

  /**
   * Set the rotation of the object
   * @param angle {Number} The rotation angle
   */
  set rotation(angle) {
    this.defaultTransformComponent.rotation = angle;
    this.markDirty();
  }

  /**
   * Get the rotation of the object
   * @return {Number} Angle in degrees
   */
  get rotation() {
    return this.defaultTransformComponent.rotation;
  }

  /**
   * Get the world adjusted rotation of the object
   * @return {Number} Angle in degrees
   */
  get renderRotation() {
    return this.defaultTransformComponent.renderRotation;
  }

  /**
   * Set the scale of the object along the X and Y axis in the scaling matrix
   * @param scaleX {Number} The scale along the X axis
   * @param [scaleY] {Number} Optional scale along the Y axis.  If no value is provided
   *        <tt>scaleX</tt> will be used to perform a uniform scale.
   */
  setScale(scaleX, scaleY) {
    this.defaultTransformComponent.setScale(scaleX, scaleY);
    this.markDirty();
  }

  /**
   * Get the scale of the object along both the X and Y axis.
   * @return {R.math.Vector2D}
   */
  get scale() {
    return this.defaultTransformComponent.scale;
  }

  /**
   * Get the scale of the object along the X axis
   * @return {Number}
   */
  get scaleX() {
    return this.defaultTransformComponent.scaleX;
  }

  /**
   * Get the scale of the object along the Y axis.
   * @return {Number}
   */
  get scaleY() {
    return this.defaultTransformComponent.scaleY;
  }

  /**
   * Set the depth at which this object will render to
   * the context.  The lower the z-index, the further
   * away from the front the object will draw.
   *
   * @param zIndex {Number} The z-index of this object
   */
  set zIndex(zIndex) {
    this._zIndex = zIndex;

    if (this.renderContext) {
      this.renderContext.swapBins(this, this._zIndex, zIndex);
      this.renderContext.sort();
    }
    this.markDirty();
  }

  /**
   * Get the depth at which this object will render to
   * the context.
   *
   * @return {Number}
   */
  get zIndex() {
    return this._zIndex;
  }

  /**
   * Returns a bean which represents the read or read/write properties
   * of the object.
   *
   * @return {Object} The properties object
   */
  getProperties() {
    var props = super.getProperties();

    props.add("ZIndex", [
      function () {
        return self.getZIndex();
      },
      function (i) {
        self.setZIndex(parseInt(i));
      }
    ]);
    props.add("BoundingBox", [
      function () {
        return self.getBoundingBox().toString();
      },
      null
    ]);
    props.add("Origin", [
      function () {
        return self.getOrigin().toString();
      },
      function (i) {
        var p = i.split(",");
        self.setOrigin(parseFloat(p[0]), parseFloat(p[1]));
      }
    ]);

  }

}
