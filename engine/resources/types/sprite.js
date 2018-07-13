/**
 * The Render Engine
 * SpriteResource
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A 2D sprite object.  Sprites are either a single frame, or an animation composed of
 *        multiple frames run at a specified frame speed.  Animations can be run once, loop
 *        continuously, or toggle back and forth through the frames.  It is possible to start
 *        and stop animations, and also modify the speed at which each frame is played.
 *        <p/>
 *        In addition to the normal controls for an animation, a developer can also respond
 *        to events triggered on the sprite.  Linking to the events is done through
 *        {@link R.engine.BaseObject#addEvent}. The following are the events, and their
 *        descriptions:
 *        <ul>
 *           <li><tt>finished</tt> - A "run once" animation has played and completed</li>
 *           <li><tt>loopRestarted</tt> - A looping animation has begun a new cycle</li>
 *           <li><tt>toggled</tt> - A toggle animation has changed animation direction</li>
 *        </ul>
 *
 * @constructor
 * @param name {String} The name of the sprite within the resource
 * @param spriteObj {Object} Passed in by a {@link SpriteLoader}.  An array which defines the
 *                  sprite frame, and parameters.
 * @param spriteResource {Object} The sprite resource loaded by the {@link SpriteLoader}
 * @extends R.engine.BaseObject
 */
class SpriteResource extends BaseObject {

  static TYPE_SINGLE = 0;
  static TYPE_ANIMATION = 1;

  static MODE_LOOP = 0;
  static MODE_TOGGLE = 1;
  static MODE_ONCE = 2;

  static INDEX_LEFT = 0;
  static INDEX_TOP = 1;
  static INDEX_WIDTH = 2;
  static INDEX_HEIGHT = 3;
  static INDEX_COUNT = 4;
  static INDEX_SPEED = 5;
  static INDEX_TYPE = 6;
  static INDEX_SYNC = 7;

  /** @private */
  constructor(name, spriteObj, spriteResource, fileVersion, spriteLoader) {
    super(name);

    this.spriteOpts = {
      finished: false,
      frameNum: 0,
      playing: true,
      type: (spriteObj.length === 4 ? SpriteResource.TYPE_SINGLE : SpriteResource.TYPE_ANIMATION)
    };

    var s = spriteObj;

    if (this.spriteOpts.type === SpriteResource.TYPE_ANIMATION) {
      switch (s[SpriteResource.INDEX_TYPE]) {
        case "loop" :
          this.spriteOpts.mode = SpriteResource.MODE_LOOP;
          break;
        case "toggle" :
          this.spriteOpts.mode = SpriteResource.MODE_TOGGLE;
          break;
        case "once" :
          this.spriteOpts.mode = SpriteResource.MODE_ONCE;
          break;
      }
      if (s.length - 1 == SpriteResource.INDEX_SYNC) {
        this.spriteOpts.sync = true;
        this.spriteOpts.lastTime = null;
        this.spriteOpts.toggleDir = -1;	// Trust me
      } else {
        this.spriteOpts.sync = false;
      }
      this.spriteOpts.count = s[SpriteResource.INDEX_COUNT];
      this.spriteOpts.speed = s[SpriteResource.INDEX_SPEED];
    } else {
      this.spriteOpts.count = 1;
      this.spriteOpts.speed = -1;
    }

    this.spriteOpts.resource = spriteResource;
    this.spriteOpts.loader = spriteLoader;
    this.spriteOpts.image = spriteResource.image;
    this.spriteOpts.frame = Rectangle2D.create(s[SpriteResource.INDEX_LEFT], s[SpriteResource.INDEX_TOP], s[SpriteResource.INDEX_WIDTH], s[SpriteResource.INDEX_HEIGHT]);
    this.spriteOpts.bbox = Rectangle2D.create(0, 0, s[SpriteResource.INDEX_WIDTH], s[SpriteResource.INDEX_HEIGHT]);
    this.spriteOpts.currentFrame = 0;
  }

  /**
   * Destroy the sprite instance
   */
  destroy() {
    this.spriteOpts.bbox.destroy();
    this.spriteOpts.frame.destroy();
    super.destroy();
  }

  /**
   * Release the sprite back into the pool for reuse
   */
  release() {
    super.release();
    this.spriteOpts = null;
  }

  /**
   * Gets the class name of this object.
   * @return {String} The string "SpriteResource"
   */
  get className() {
    return "SpriteResource";
  }


  /**
   * Get the resource this sprite originated from
   */
  get spriteResource() {
    return this.spriteOpts.resource;
  }

  /**
   * Get the sprite loader this sprite originated from
   */
  get spriteLoader() {
    return this.spriteOpts.loader;
  }

  /**
   * Returns <tt>true</tt> if the sprite is an animation.
   */
  get isAnimation() {
    return (this.spriteOpts.type == SpriteResource.TYPE_ANIMATION);
  }

  /**
   * Returns <tt>true</tt> if the sprite is an animation and loops.
   */
  get isLoop() {
    return (this.isAnimation && this.spriteOpts.mode === SpriteResource.MODE_LOOP);
  }

  /**
   * Returns <tt>true</tt> if the sprite is an animation and toggles.
   */
  get isToggle() {
    return (this.isAnimation && this.spriteOpts.mode === SpriteComponent.MODE_TOGGLE);
  }

  /**
   * Returns <tt>true</tt> if the sprite is an animation and plays once.
   */
  get isOnce() {
    return (this.isAnimation && this.spriteOpts.mode === SpriteComponent.MODE_ONCE);
  }

  /**
   * Get the number of frames in the sprite.
   */
  get frameCount() {
    return this.spriteOpts.count;
  }

  /**
   * Get the frame speed of the animation in milliseconds, or -1 if it's a single frame.
   */
  get frameSpeed() {
    return this.spriteOpts.speed;
  }

  /**
   * For animated sprites, play the animation if it is stopped.
   */
  play() {
    this.spriteOpts.playing = true;
  }

  /**
   * For animated sprites, stop the animation if it is playing.
   */
  stop() {
    this.spriteOpts.playing = false;
  }

  /**
   * For animated sprites, reset the animation to frame zero.
   */
  reset() {
    this.spriteOpts.frameNum = 0;
  }

  /**
   * For animated sprites, go to a particular frame number.
   * @param frameNum {Number} The frame number to jump to
   */
  gotoFrame(frameNum) {
    this.frameNum = (frameNum < 0 ? 0 : (frameNum >= this.spriteOpts.count ? this.spriteOpts.count - 1 : frameNum));
  }

  /**
   * Get the bounding box for the sprite.
   */
  get boundingBox() {
    return this.spriteOpts.bbox;
  }

  /**
   * Gets the frame of the sprite. The frame is the rectangle defining what
   * portion of the image map the sprite frame occupies, given the specified time.
   *
   * @param time {Number} Current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   */
  getFrame(time, dt) {
    if (!this.isAnimation) {
      return Rectangle2D.create(this.spriteOpts.frame);
    } else {
      var f = Rectangle2D.create(this.spriteOpts.frame);
      var fn = this.calcFrameNumber(time, dt);
      return f.offset(f.width * fn, 0);
    }
  }

  animate(time, dt) {
    this.spriteOpts.currentFrame = this.getFrame(time, dt);
  }

  /**
   * Calculate the frame number for the type of animation.
   * @param time {Number} The current world time
   * @param dt {Number} The delta between the world time and the last time the world was updated
   *          in milliseconds.
   * @private
   */
  calcFrameNumber(time, dt) {
    if (!this.spriteOpts.playing) {
      return this.spriteOpts.frameNum;
    }

    if (this.spriteOpts.sync) {
      // Synchronized animations

      if (this.spriteOpts.lastTime === null) {
        // Note the time when the first frame is requested and just return frame zero
        this.spriteOpts.lastTime = time;
        return 0;
      }

      // How much time has elapsed since the last frame update?
      if (dt > this.spriteOpts.speed) {
        // Engine is lagging, skip to correct frame
        this.spriteOpts.frameNum += (Math.floor(dt / this.spriteOpts.speed) * this.spriteOpts.toggleDir);
      } else {
        this.spriteOpts.frameNum += (time - this.spriteOpts.lastTime > this.spriteOpts.speed ? this.spriteOpts.toggleDir : 0);
      }

      // Modify the frame number for the animation mode
      if (this.isOnce) {
        // Play animation once from beginning to end
        if (this.spriteOpts.frameNum >= this.spriteOpts.count) {
          this.spriteOpts.frameNum = this.spriteOpts.count - 1;
          if (!this.spriteOpts.finished) {
            // Call event when finished
            this.spriteOpts.finished = true;
            this.triggerEvent("finished");
          }
        }
      } else if (this.isLoop) {
        if (this.spriteOpts.frameNum > this.spriteOpts.count - 1) {
          // Call event when loop restarts
          this.spriteOpts.frameNum = 0;
          this.triggerEvent("loopRestarted");
        }
      } else {
        if (this.spriteOpts.frameNum === this.spriteOpts.count - 1 || this.spriteOpts.frameNum === 0) {
          // Call event when animation toggles
          this.spriteOpts.toggleDir *= -1;
          this.spriteOpts.frameNum += this.spriteOpts.toggleDir;
          this.triggerEvent("toggled");
        }
      }

      // Remember the last time a frame was requested
      this.spriteOpts.lastTime = time;

    } else {
      // Unsynchronized animations
      var lastFrame = this.spriteOpts.frameNum;
      if (this.isLoop) {
        this.spriteOpts.frameNum = Math.floor(time / this.spriteOpts.speed) % this.spriteOpts.count;
        if (this.spriteOpts.frameNum < lastFrame) {
          this.triggerEvent("loopRestarted");
        }
      } else if (this.isOnce && !this.spriteOpts.finished) {
        this.spriteOpts.frameNum = Math.floor(time / this.spriteOpts.speed) % this.spriteOpts.count;
        if (this.spriteOpts.frameNum < lastFrame) {
          this.spriteOpts.finished = true;
          this.spriteOpts.frameNum = this.spriteOpts.count - 1;
          this.triggerEvent("finished");
        }
      } else if (this.isToggle) {
        this.spriteOpts.frameNum = Math.floor(time / this.spriteOpts.speed) % (this.spriteOpts.count * 2);
        if (this.spriteOpts.frameNum > this.spriteOpts.count - 1) {
          this.spriteOpts.frameNum = this.spriteOpts.count - (this.spriteOpts.frameNum - (this.spriteOpts.count - 1));
          this.triggerEvent("toggled");
        }
      }
    }

    return this.spriteOpts.frameNum;
  }

  /**
   * Set the speed, in milliseconds, that an animation runs at.  If the sprite is
   * not an animation, this has no effect.
   */
  set speed(speed) {
    if (speed >= 0) {
      this.spriteOpts.speed = speed;
    }
  }

  /**
   * Get the number of milliseconds each frame is displayed for an animation
   */
  get speed() {
    return this.spriteOpts.speed;
  }

  /**
   * The source image loaded by the {@link SpriteLoader} when the sprite was
   * created.
   * @return {HTMLImage} The source image the sprite is contained within
   */
  get sourceImage() {
    return this.spriteOpts.image;
  }

  /**
   * @returns {Rectangle2D}
   */
  get currentFrame() {
    return this.spriteOpts.currentFrame;
  }

  onSpriteLoopRestart() {
  }

}
