/**
 * The Render Engine
 * VirtualCanvasContext
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A canvas render context whose world boundary is larger than the actual
 *        viewport.  This allows the world to be rendered as if viewed through a
 *        window into a larger world.  You can set the world position with simple
 *        scroll methods, or cause the world to transition to a specific point over
 *        a given duration.
 *
 * @constructor
 * @param name {String} The name of the object
 * @param windowWidth {Number} The width of the viewable window, in pixels
 * @param windowHeight {Number} The height of the viewable window, in pixels
 * @param worldWidth {Number} The width of the world, in pixels
 * @param worldHeight {Number} The height of the world, in pixels
 * @extends CanvasContext
 */
class VirtualCanvasContext extends CanvasContext {

  constructor(name = "VirtualCanvasContext", windowWidth, windowHeight, worldWidth, worldHeight) {
    super(name, windowWidth, windowHeight);
    this.worldBoundaries = Rectangle2D.create(0, 0, worldWidth, worldHeight);
    this.scrollToPt = Point2D.create(0, 0);
    this.scrollFromPt = Point2D.create(0, 0);
    this.moving = false;
    this.expireTime = 0;
    this.duration = 0;
  }

  destroy() {
    this.scrollToPt.destroy();
    this.scrollFromPt.destroy();
    super.destroy();
  }

  /**
   * Get the class name of this object
   * @return {String} "VirtualCanvasContext"
   */
  get className() {
    return "VirtualCanvasContext";
  }

  /**
   * Set the current world position to a specific point.
   * @param pt {Point2D} The point to set the scroll to.
   */
  setScroll(pt) {
    this.horizontalScroll = pt.x;
    this.verticalScroll = pt.y;
  }

  /**
   * Scroll to the given point, or location, over the given duration.
   * @param duration {Number} The number of milliseconds for the transition to occur
   * @param point {Point2D} The X coordinate, or point, to scroll to
   */
  scrollTo(duration, point) {
    this.scrollFromPt.copy(this.worldPosition);
    this.scrollToPt.copy(point);
    this.moving = true;
    this.expireTime = RenderEngine.worldTime + duration;
    this.duration = duration;
  }

  /**
   * Set the horizontal world position in pixels.
   *
   * @param x {Number} The horizontal scroll in pixels
   */
  set horizontalScroll(x) {
    var maxX = this.worldBoundaries.width - this.viewport.width;
    x = (x < 0 ? 0 : (x > maxX ? maxX : x));
    this.worldPosition.x = x;
    this.viewport.x = x;
  }

  /**
   * Set the vertical world position in pixels.
   *
   * @param y {Number} The vertical scroll in pixels
   */
  set verticalScroll(y) {
    var maxY = this.worldBoundaries.height - this.viewport.height;
    y = (y < 0 ? 0 : (y > maxY ? maxY : y));
    this.worldPosition.y = y;
    this.viewport.y = y;
  }

  /**
   * Get the horizontal scroll amount in pixels.
   * @return {Number} The horizontal scroll
   */
  get horizontalScroll() {
    return this.worldPosition.x;
  }

  /**
   * Get the vertical scroll amount in pixels.
   * @return {Number} The vertical scroll
   */
  get verticalScroll() {
    return this.worldPosition.y;
  }

  /**
   * If a transition was initiated with {@link #scrollTo},
   * this will update the viewport accordingly.
   *
   * @param worldTime {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  setupWorld(worldTime, dt) {
    if (this.moving) {
      if (worldTime < this.expireTime) {
        // Moving
        var sc = Point2D.create(this.scrollToPt).sub(this.scrollFromPt)
          .mul((this.duration - (this.expireTime - worldTime)) / this.duration),
          sp = Point2D.create(this.scrollFromPt).add(sc);
        this.setScroll(sp);
        sc.destroy();
        sp.destroy();
      } else {
        // Arrived
        this.moving = false;
        this.expireTime = 0;
        this.setScroll(this.scrollToPt);
      }
    }
    super.setupWorld(worldTime, dt);
  }

}

