/**
 * The Render Engine
 * SoundResource
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Represents a sound object that is abstracted from the sound system.
 *        If the sound system does not initialize, for whatever reason, you can
 *             still call a sound's methods.
 *
 * @constructor
 * @param name {String} The name of the sound
 * @extends PooledObject
 */
class SoundResource extends PooledObject {

  constructor(name, soundSystem, soundObj) {
    this.soundOpts = {
      volume: 50,
      paused: false,
      pan: 0,
      muted: false,
      soundObj: soundObj,
      soundSystem: soundSystem,
      supportedType: true,
      loop: false
    };
    super(name);
  }

  /**
   * Destroy the sound object
   */
  destroy() {
    this.soundOpts.soundSystem.destroySound(this.soundOpts.sound);
    super.destroy();
  }

  release() {
    super.release();
    this.soundOpts = null;
  }

  /**
   * Gets the class name of this object.
   * @return {String} The string "SoundResource"
   */
  get className() {
    return "SoundResource";
  }

  /**
   * Set a boolean flag indicating if the sound type is supported by the browser
   * @param state {Boolean} <code>true</code> indicates the sound type is supported
   */
  set supportedTypeFlag(state) {
    this.soundOpts.supportedType = state;
  }

  /**
   * Returns a boolean indicating if the sound type is supported by the browser
   * @return {Boolean}
   */
  get supportedTypeFlag() {
    return this.soundOpts.supportedType;
  }

  /**
   * Get the native sound object which was created by the subclassed sound system.
   * @return {Object}
   */
  get soundObject() {
    return this.soundOpts.soundObj;
  }

  /**
   * Set the sound object which the subclassed sound system created.
   * @param soundObj {Object} The sound's native object
   */
  set soundObject(soundObj) {
    this.soundOpts.soundObj = soundObj;
  }

  /**
   * Play the sound.  If the volume is specified, it will set volume of the
   * sound before playing.  If the sound was paused, it will be resumed.
   *
   * @param volume {Number} <i>[optional]</i> An integer between 0 (muted) and 100 (full volume)
   */
  play(volume) {
    if (this.soundOpts.paused) {
      this.resume();
      return;
    }

    if (volume && volume != this.soundOpts.getVolume()) {
      this.setVolume(volume);
    }

    this.soundOpts.soundSystem.playSound(this.soundOpts.soundObj);
  }

  /**
   * If the sound is playing, stop the sound and reset it to the beginning.
   */
  stop() {
    this.soundOpts.paused = false;
    this.soundOpts.soundSystem.stopSound(this.soundOpts.soundObj);
  }

  /**
   * If the sound is playing, pause the sound.
   */
  pause() {
    this.soundOpts.soundSystem.pauseSound(this.soundOpts.soundObj);
    this.soundOpts.paused = true;
  }

  /**
   * Returns <tt>true</tt> if the sound is currently paused.
   * @return {Boolean} <tt>true</tt> if the sound is paused
   */
  isPaused() {
    return this.soundOpts.paused;
  }

  get paused() {
    return this.isPaused();
  }

  /**
   * If the sound is paused, it will resume playing the sound.
   */
  resume() {
    this.soundOpts.paused = false;
    this.soundOpts.soundSystem.resumeSound(this.soundOpts.soundObj);
  }

  /**
   * Mute the sound (set its volume to zero).
   */
  mute() {
    this.soundOpts.soundSystem.muteSound(this.soundOpts.soundObj);
    this.soundOpts.muted = true;
  }

  /**
   * Unmute the sound (reset its volume to what it was before muting).
   */
  unmute() {
    if (!this.soundOpts.muted) {
      return;
    }
    this.soundOpts.soundSystem.unmuteSound(this.soundOpts.soundObj);
    this.soundOpts.muted = false;
  }

  get muted() {
    return this.soundOpts.muted;
  }

  /**
   * Set the volume of the sound to an integer between 0 (muted) and 100 (full volume).
   *
   * @param volume {Number} The volume of the sound
   */
  setVolume(volume) {
    if (isNaN(volume)) {
      return;
    }

    // clamp it
    volume = (volume < 0 ? 0 : volume > 100 ? 100 : volume);
    this.soundOpts.volume = volume;
    this.soundOpts.soundSystem.setSoundVolume(this.soundOpts.soundObj, volume);
  }

  set volume(v) {
    this.setVolume(v);
  }

  /**
   * Get the volume the sound is playing at.
   * @return {Number} An integer between 0 and 100
   */
  getVolume() {
    return this.soundOpts.volume;
  }

  get volume() {
    return this.getVolume();
  }

  /**
   * Set the pan of the sound, with -100 being full left and 100 being full right.
   *
   * @param pan {Number} An integer between -100 and 100, with 0 being center.
   */
  setPan(pan) {
    this.soundOpts.pan = pan;
    this.soundOpts.soundSystem.setSoundPan(this.soundOpts.soundObj, pan);
  }

  set pan(p) {
    this.setPan(p);
  }

  /**
   * Get the pan of the sound, with -100 being full left and 100 being full right.
   * @return {Number} An integer between -100 and 100
   */
  getPan() {
    return this.soundOpts.pan;
  }

  get pan() {
    return this.getPan();
  }

  /**
   * Set the sound offset in milliseconds.
   *
   * @param millisecondOffset {Number} The offset into the sound to play from
   */
  setPosition(millisecondOffset) {
    this.soundOpts.position = millisecondOffset;
    this.soundOpts.soundSystem.setSoundPosition(this.soundOpts.soundObj, millisecondOffset);
  }

  set position(m) {
    this.setPosition(m);
  }

  /**
   * Get the position of the sound, in milliseconds, from the start of the sound.
   * @return {Number} The millisecond offset into the sound
   */
  getLastPosition() {
    return this.soundOpts.soundSystem.getSoundPosition(this.soundOpts.soundObj);
  }

  get position() {
    return this.getLastPosition();
  }

  /**
   * Get the total size, in bytes, of the sound.  If the sound engine is not
   * initialized, returns 0.
   * @return {Number} The size of the sound, in bytes
   */
  getSizeBytes() {
    return this.soundOpts.soundSystem.getSoundSize(this.soundOpts.soundObj);
  }

  get size() {
    return this.getSizeBytes();
  }

  /**
   * Get the length of the sound, in milliseconds.  If the sound hasn't fully loaded,
   * it will be the number of milliseconds currently loaded.  Due to the nature of
   * Variable Bitrate (VBR) sounds, this number may be inaccurate.
   * @return {Number} The length of the sound, in milliseconds
   */
  getDuration() {
    return this.soundOpts.soundSystem.getSoundDuration(this.soundOpts.soundObj);
  }

  get duration() {
    return this.getDuration();
  }

  /**
   * Flag to indicate if the sound ready to use.
   * @return {Boolean}
   */
  getReadyState() {
    return this.soundOpts.soundSystem.getSoundReadyState(this.soundOpts.soundObj);
  }

  get ready() {
    return this.getReadyState();
  }

}