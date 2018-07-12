/**
 * The Render Engine
 * ParticleEngine
 *
 * Copyright (c) 2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class The particle engine is a system for updating and expiring
 *        particles within a game environment.  This is registered with the
 *        render context so it will be updated at regular intervals.  The maximum
 *        number of supported particles can be configured, but defaults to 250.
 *        It is possible to run multiple particle engines within a render context.
 *        <p/>
 *        Particles should be simple objects which don't need to perform many
 *        calculations before being drawn.  All particles are rendered in world
 *        coordinates to speed up processing.
 *        <p/>
 *        A word of caution: <em>Using a particle engine will potentially slow down your frame
 *        rate depending on the amount of particles per frame.</em> While care has
 *        been taken to make the particle engine run as fast as possible, it is
 *        not uncommon to see a significant drop in frame rate when using a lot of
 *        particles.
 *        <p/>
 *        You can modify the maximum number of particles the engine will allow
 *        with the <code>R.Engine.options["maxParticles"]</code> setting.  Each
 *        browser has been tailored for the best performance, but this values
 *        can be changed in your game with either {@link #setMaximum} or by
 *        changing the engine option.
 *
 * @extends BaseObject
 * @constructor
 * @description Create a particle engine
 */
class ParticleEngine extends BaseObject {

  static MAX_PARTICLES = R.Engine.options["maxParticles"];

  /** @private */
  constructor() {
    super("ParticleEngine");
    this._particles = Container.create("particles");
    this._particleEffects = Container.create("particleEffects");
    this._lastTime = 0;
  }

  /**
   * Destroy the particle engine and all contained particles
   */
  destroy() {
    this.reset();
    this._particles.destroy();
    this._particleEffects.destroy();
    super.destroy();
  }

  /**
   * Releases the particle engine back into the pool.
   */
  release() {
    super.release();
    this._particles = null;
    this._particleEffects = null;
    this._lastTime = 0;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "ParticleEngine"
   */
  get className() {
    return "ParticleEngine";
  }

  get count() {
    return this._particles.size;
  }

  get lastTime() {
    return this._lastTime;
  }

  /**
   * Add a group of particles at one time.  This reduces the number of calls
   * to {@link #addParticle} which resorts the array of particles each time.
   * @param particles {Array|Container} A container of particles to add at one time
   */
  addParticles(particles) {
    if (R.isArray(particles)) {
      particles = Container.fromArray(particles);
    }

    if (R.Engine.options.disableParticleEngine) {
      particles.destroy();
      return;
    }

    // If the new particles exceed the size of the engine's
    // maximum, truncate the remainder
    if (particles.size > ParticleEngine.MAX_PARTICLES) {
      var discard = particles.reduce(ParticleEngine.MAX_PARTICLES);
      discard.cleanUp();
      discard.destroy();
    }

    // Initialize all of the new particles
    for (var i = particles.iterator(); i.hasNext();) {
      // Adjust for time slip
      i.next().init(this, this.lastTime);
    }
    i.destroy();

    // The maximum number of particles to animate
    var total = this._count + particles.size;
    if (total > ParticleEngine.MAX_PARTICLES) {
      total = ParticleEngine.MAX_PARTICLES;
    }

    // If we can fit the entire set of particles without overflowing,
    // add all the particles and be done.
    if (this.count <= ParticleEngine.MAX_PARTICLES - this._count) {
      this._particles.addAll(particles);
    } else {
      // There isn't enough space to put all of the particles into
      // the container.  So, we'll only add what we can.
      var maxLeft = ParticleEngine.MAX_PARTICLES - total;
      var easySet = particles.subset(0, maxLeft);
      this._particles.addAll(easySet);
      easySet.destroy();
    }
    particles.destroy();
  }

  /**
   * Add a single particle to the engine.  If many particles are being
   * added at one time, use {@link #addParticles} instead to add a
   * {@link Container} of particles.
   *
   * @param particle {AbstractParticle} A particle to animate
   */
  addParticle(particle) {
    if (R.Engine.options.disableParticleEngine) {
      particle.destroy();
      return;
    }

    if (this.count < ParticleEngine.MAX_PARTICLES) {
      // Adjust for time-slip
      particle.init(this, this.lastTime);
      this._particles.add(particle);
    } else {
      // nowhere to put it
      particle.destroy();
    }
  }

  /**
   * Set the absolute maximum number of particles the engine will allow.  The
   * engine is configured with a maximum number in <code>R.Engine.options["maxParticles"]</code>.
   * You can override this value using configurations also.
   *
   * @param maximum {Number} The maximum particles the particle engine allows
   */
  setMaximum(maximum) {
    var oldMax = ParticleEngine.MAX_PARTICLES;
    ParticleEngine.MAX_PARTICLES = maximum;

    // Kill off particles if the size is reduced
    if (ParticleEngine.MAX_PARTICLES < oldMax) {
      var discard = this._particles.reduce(ParticleEngine.MAX_PARTICLES);
      discard.cleanUp();
      discard.destroy();
    }
  }

  /**
   * Get the maximum number of particles allowed in the particle engine.
   * @return {Number}
   */
  static get maximum() {
    return ParticleEngine.MAX_PARTICLES;
  }

  /**
   * Update a particle, removing it and nulling its reference
   * if it is dead.  Only live particles are updated
   * @private
   */
  runParticle(particle, renderContext, time, dt) {
    if (!particle.update(renderContext, time, dt)) {
      this._particles.remove(particle);
      particle.destroy();
    }
  }

  /**
   * Add a particle effect
   * @param particleEffect
   * @return {R.particles.Effect} The instance of the effect
   */
  addEffect(particleEffect) {
    this._particleEffects.add(particleEffect);
    return particleEffect;
  }

  /**
   * Update the particles within the render context, and for the specified time.
   *
   * @param renderContext {AbstractRenderContext} The context the particles will be rendered within.
   * @param time {Number} The global time within the engine.
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  update(renderContext, time, dt) {
    if (RenderEngine.options.disableParticleEngine) {
      return;
    }

    this._lastTime = time;

    // Run all queued effects
    for (var effectItr = this._particleEffects.iterator(); effectItr.hasNext();) {
      var effect = effectItr.next();
      if (!effect.hasRun() || effect.getLifespan(dt) > 0) {
        effect.runEffect(this, time, dt);
      }
    }
    effectItr.destroy();

    // If there are no live particles, don't do anything
    if (this.count == 0) {
      return;
    }

    renderContext.pushTransform();

    for (var itr = this._particles.iterator(); itr.hasNext();) {
      this.runParticle(itr.next(), renderContext, time, dt);
    }
    itr.destroy();

    renderContext.popTransform();

    // Remove completed particle effects
    this._particleEffects.filter(function (pe) {
      if (pe.hasRun() && pe.getLifespan(dt) <= 0) {
        pe.destroy();
        return false;
      }
      return true;
    });
  }

  /**
   * Get the properties object for the particle engine
   * @return {Object}
   */
  getProperties() {
    var props = super.getProperties();
    props.add("Particles", [
      function () {
        return this.count;
      },
      null
    ]);
    return props;
  }

  /**
   * Reset the particle engine.  Destroys all active particles and effects.
   */
  reset() {
    this._particles.cleanUp();
    this._particleEffects.cleanUp();
  }

}
