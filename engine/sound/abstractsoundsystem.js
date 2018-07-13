/**
 * The Render Engine
 * AbstractSoundSystem
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Sound system abstraction class for pluggable sound architecture.  The <tt>
 *             R.sound.AbstractSoundSystem</tt> class is used to separate the sound manager from the resource
 *             loader and sound objects.
 *
 * @constructor
 */
class AbstractSoundSystem {

  constructor() {
    this._ready = false;
    this._queuedSounds = [];
    this._loadingSounds = {};
  }

  /**
   * [ABSTRACT] Shut down the sound system
   */
  shutdown() {
  }

  /**
   * Returns a flag indicating if the sound system is ready
   * @return {Boolean}
   */
  isReady() {
    return this._ready;
  }

  get ready() {
    return this._ready;
  }

  /**
   * Sets the ready state of the sound system.
   * @private
   */
  makeReady() {
    // Retrieve queued sounds
    var self = this;
    Timeout.create("loadQueuedSounds", 100, function () {
      if (self._queuedSounds.length > 0) {
        while (self._queuedSounds.length > 0) {
          var s = self._queuedSounds.shift();
          self.retrieveSound(s.sLoader, s.sName, s.sUrl);
        }
      }

      this.destroy();
    });
    this._ready = true;
  }

  /**
   * Load a sound using the sound system.  If the sound system isn't ready,
   * sounds will be queued until it is ready.
   *
   * @param resourceLoader {SoundLoader} The sound resource loader
   * @param name {String} The name of the sound object
   * @param url {String} The URL of the sound to load
   * @return {SoundResource} The sound object
   */
  loadSound(resourceLoader, name, url) {
    if (!this.ready) {
      this._queuedSounds.push({
        sLoader: resourceLoader,
        sName: name,
        sUrl: url
      });
      return SoundResource.create(this, null);
    }
    else {
      return this.retrieveSound(resourceLoader, name, url);
    }
  }

  /**
   * Retrieve the sound from the network, when the sound system is ready, and create the sound object.
   * @param resourceLoader {SoundLoader} The sound resource loader
   * @param name {String} The name of the sound object
   * @param url {String} The URL of the sound to load
   * @return {SoundResource} The sound object
   * @protected
   */
  retrieveSound(resourceLoader, name, url) {
    // See if the resource loader has a sound object for us already
    var sound = resourceLoader.get(name);
    if (sound === null) {
      // No, return an empty sound object
      return SoundResource.create(this, null);
    }
    else {
      // Yep, return the existing sound object
      return sound;
    }
  }

  /**
   * [ABSTRACT] Destroy the given sound object
   * @param sound {SoundResource} The sound object
   */
  destroySound(sound) {
  }

  /**
   * [ABSTRACT] Play the given sound object
   * @param sound {SoundResource} The sound object
   */
  playSound(sound) {
  }

  /**
   * [ABSTRACT] Stop the given sound object
   * @param sound {SoundResource} The sound object
   */
  stopSound(sound) {
  }

  /**
   * [ABSTRACT] Pause the given sound object
   * @param sound {SoundResource} The sound object
   */
  pauseSound(sound) {
  }

  /**
   * [ABSTRACT] Resume the given sound object
   * @param sound {SoundResource} The sound object
   */
  resumeSound(sound) {
  }

  /**
   * [ABSTRACT] Mute the given sound object
   * @param sound {SoundResource} The sound object
   */
  muteSound(sound) {
  }

  /**
   * [ABSTRACT] Unmute the given sound object
   * @param sound {SoundResource} The sound object
   */
  unmuteSound(sound) {
  }

  /**
   * [ABSTRACT] Set the volume of the given sound object
   * @param sound {SoundResource} The sound object
   * @param volume {Number} A value between 0 and 100, with 0 being muted
   */
  setSoundVolume(sound, volume) {
  }

  /**
   * [ABSTRACT] Pan the given sound object from left to right
   * @param sound {SoundResource} The sound object
   * @param pan {Number} A value between -100 and 100, with -100 being full left
   *         and zero being center
   */
  setSoundPan(sound, pan) {
  }

  /**
   * [ABSTRACT] Set the position, within the sound's length, to play at
   * @param sound {SoundResource} The sound object
   * @param millisecondOffset {Number} The millisecond offset from the start of
   *         the sounds duration
   */
  setSoundPosition(sound, millisecondOffset) {
  }

  /**
   * [ABSTRACT] Get the position, in milliseconds, within a playing or paused sound
   * @param sound {SoundResource} The sound object
   * @return {Number}
   */
  getSoundPosition(sound) {
    return 0;
  }

  /**
   * [ABSTRACT] Get the size of the sound object, in bytes
   * @param sound {SoundResource} The sound object
   * @return {Number}
   */
  getSoundSize(sound) {
    return 0;
  }

  /**
   * [ABSTRACT] Get the length (duration) of the sound object, in milliseconds
   * @param sound {SoundResource} The sound object
   * @return {Number}
   */
  getSoundDuration(sound) {
    return 0;
  }

  /**
   * [ABSTRACT] Determine if the sound object is ready to be used
   * @param sound {SoundResource} The sound object
   * @return {Boolean} <code>true</code> if the sound is ready
   */
  getSoundReadyState(sound) {
    return false;
  }

}