/**
 * The Render Engine
 * SoundResourceLoader
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Loads sounds and stores the reference to them using the provided sound
 *          system.  Sounds resource that are loaded are cached with the loader.
 *
 * @constructor
 * @param soundSystem {R.sound.AbstractSoundSystem} A sound system instance, either {@link R.sound.SM2} or
 *     {@link R.sound.HTML5}.
 * @extends RemoteLoader
 */
class SoundLoader extends RemoteLoader {

  constructor(soundSystem) {
    super("SoundLoader");
    this._init = false;
    this._queuedSounds = [];
    this._queueingSounds = true;
    this._loadingSounds = 0;
    this._soundSystem = soundSystem;
    this._checkReady = false;
  }

  /**
   * Destroy the sound loader and shut down the sound system
   */
  destroy() {
    if (this._soundSystem) {
      this._soundSystem.shutdown();
      this._soundSystem = null;
    }
  }

  /**
   * Get the class name of this object
   * @return {String} The string "SoundLoader"
   */
  get className() {
    return "SoundLoader";
  }

  /**
   * Load a sound resource from a URL. If the sound system does not initialize, for whatever
   * reason, you can still call the sound's methods.
   *
   * @param name {String} The name of the resource
   * @param url {String} The URL where the resource is located
   */
  load(name, url) {
    var soundObj = this._soundSystem.loadSound(this, name, url);

    // We'll need to periodically check a sound's "readyState" for success
    // to know when the sound is ready for usage.
    this._loadingSounds++;
    if (!this._checkReady) {
      this._checkReady = true;
      var selfObj = this;

      Timeout.create("waitForSounds", 500, function () {
        var sounds = selfObj.resources;
        for (var s in sounds) {
          if (!selfObj.isReady(sounds[s]) && selfObj.get(sounds[s]).getReadyState()) {
            selfObj.setReady(sounds[s], true);
            selfObj._loadingSounds--;
          }
        }

        if (selfObj._loadingSounds !== 0) {
          // There are still sounds loading
          this.restart();
        }
        else {
          selfObj._checkReady = false;
          this.destroy();
        }
      });
    }

    if (!this._init) {
      this._init = true;
    }

    super.load(name, url, soundObj);
  }

  /**
   * Unload a sound, calling the proper methods in the sound system.
   *
   * @param sound {String} The name of the sound to unload
   */
  unload(sound) {
    var s = this.get(sound).destroy();
    super.unload(sound);
  }

  /**
   * Creates a {@link SoundResource} object representing the named sound.
   *
   * @param sound {String} The name of the sound from the resource
   * @return {SoundResource} A {@link SoundResource} instance
   */
  getSound(sound) {
    return this.get(sound);
  }

  /**
   * Get the specific sound resource by name.
   * @param name {String} The name of the resource
   * @return {SoundResource}
   */
  getResourceObject(name) {
    return this.getSound(name);
  }

  /**
   * The name of the resource this loader will get.
   * @return {String} The string "sound"
   */
  get resourceType() {
    return "sound";
  }

}
