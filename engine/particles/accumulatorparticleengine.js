/**
 * The Render Engine
 * AccumulatorParticleEngine
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class An updated particle engine with an accumulator buffer so that
 *        effects such as bloom, glow, and tail can be achieved.  A note
 *        of caution, using the accumulator particle engine <em>will be
 *        slower</em> compared with the basic particle engine.
 *        <p/>
 *        Because of the effect used by the accumulator particle engine,
 *        background imagery will be darkened slightly.
 *
 * @extends ParticleEngine
 * @constructor
 * @description Create a particle engine
 */
class AccumulatorParticleEngine extends ParticleEngine {

  constructor(fadeRate = 0.5) {
    super("AccumulatorParticleEngine");
    this._accumulator = null;
    this._fadeRate = fadeRate;
    this._blur = false;
    this._radius = 1;
    this._hasBackground = false;
  }

  /**
   * Destroy the particle engine
   */
  destroy() {
    this._accumulator.destroy();
    super.destroy();
  }

  /**
   * Releases the particle engine back into the pool.
   */
  release() {
    super.release();
    this._accumulator = null;
    this._fadeRate = 0;
    this._blur = false;
    this._radius = 1;
    this._hasBackground = false;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "AccumulatorParticleEngine"
   */
  get className() {
    return "AccumulatorParticleEngine";
  }

  /**
   * Set the rate at which the particles fade out
   * @param fadeRate {Number} A value between 0 and 1
   */
  set fadeRate(fadeRate) {
    this._fadeRate = fadeRate;
    this._accumulator = null;
  }

  /**
   * Enable blurring of the particles in the accumulator
   * @param state {Boolean} <code>true</code> to enable (default: false)
   */
  set blur(state) {
    this._blur = state;
  }

  /**
   * Set the blurring radius around the pixel.  Higher numbers result in lower frame rates.
   * @param radius {Number} The radius of the blur (default: 1)
   */
  set blurRadius(radius) {
    this._radius = radius;
  }

  /**
   * Set this value to <code>true</code> if the particle engine is atop a background image.
   * This will have the effect of slightly darkening the background image.  If the background
   * is solid black, you can set this to <code>false</code>.
   * @param state {Boolean} The background state
   */
  set backgroundState(state) {
    this._hasBackground = state;
  }

  /**
   * Clear the accumulator
   */
  reset() {
    if (this._accumulator) {
      this._accumulator.reset();
    }
    super.reset();
  }

  /**
   * Update the particles within the render context.
   *
   * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the particles will be rendered within.
   * @param time {Number} The global time within the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  update(renderContext, time, dt) {
    if (R.Engine.options.disableParticleEngine) {
      return;
    }

    // Is there an accumulator already?
    if (!this._accumulator) {
      // Create the accumulator buffer, at the size of the renderContext
      this._accumulator = CanvasContext.create("APEContext",
        renderContext.viewport.width, renderContext.viewport.height);
    }

    if (!this._blur) {
      // Fade the accumulator at a set rate
      this._accumulator.context2D.globalAlpha = this._fadeRate;
      this._accumulator.context2D.globalCompositeOperation = this._hasBackground ? "xor" : "source-atop";
      this._accumulator.setFillStyle("rgb(0,0,0)");
      this._accumulator.drawFilledRectangle(renderContext.viewport);
      this._accumulator.context2D.globalCompositeOperation = "source-over";
    } else {
      var vp = Rectangle2D.create(renderContext.viewport),
        ox = vp.x, oy = vp.y;
      this._accumulator.context2D.globalAlpha = 0.5;
      for (var y = -this._radius; y <= this._radius; y++) {
        for (var x = -this._radius; x <= this._radius; x++) {
          vp.y = oy + y;
          vp.x = ox + x;
          this._accumulator.drawImage(vp, this._accumulator.surface);
        }
      }
      vp.destroy();
    }

    this._accumulator.context2D.globalAlpha = 1.0;

    // Render particles to the accumulator
    super.update(this._accumulator, time, dt);

    // Render the contents of the accumulator to the render context
    renderContext.drawImage(renderContext.viewport, this._accumulator.surface);
  }

  /**
   * Get the properties object for the particle engine
   * @return {Object}
   */
  getProperties() {
    var props = super.getProperties();
    props.add("FadeRate", [
      function () {
        return this.fadeRate;
      },
      null
    ]);
    return props;
  }


}
