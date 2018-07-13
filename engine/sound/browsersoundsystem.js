/**
 * The Render Engine
 * BrowserSoundSystem
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class Initializes the HTML5 sound system.  The sound types supported by the HTML5 sound system
 *    are determined by file extension on the URL:
 *    <ul>
 *       <li>mp3 - Audio MP3 format</li>
 *       <li>aac - Apple's AAC format</li>
 *       <li>ogg - Ogg Vorbis format</li>
 *       <li>pcm - WebM audio-only format</li>
 *       <li>wav - Wave audio format</li>
 *    </ul>
 *
 * @constructor
 * @extends AbstractSoundSystem
 */
class BrowserSoundSystem extends AbstractSoundSystem {

    static HAVE_NOTHING = 0;
    static HAVE_METADATA = 1;
    static HAVE_CURRENT_DATA = 2;
    static HAVE_FUTURE_DATA = 3;
    static HAVE_ENOUGH_DATA = 4;

    constructor() {
            super();

            // Get an audio element we can use to determine if the type is supported
            this._audioRoot = new Audio("");
            this._supported = true;

            // Interrogate the supported audio types
            this._types = {
                'mp3':this.verifyType("audio/mpeg"),
                'aac':this.verifyType("audio/mp4; codecs='mp4a.40.2'"),
                'ogg':this.verifyType("audio/ogg; codecs='vorbis'"),
                'pcm':this.verifyType("audio/webm; codecs='vorbis'"),
                'wav':this.verifyType("audio/x-wav; codecs='1'") || this.verifyType("audio/wave; codecs='1'") ||
                    this.verifyType("audio/wav; codecs='1'") || this.verifyType("audio/x-pn-wav; codecs='1'")
            };
        }

        /**
         * Verify if the given type can be played
         * @param mime
         */
        verifyType(mime) {
            return (this.audioRoot.canPlayType(mime) != "");
        }

        /**
         * Retrieve the sound from the network, when the sound system is ready, and create the sound object.
         * @param resourceLoader {SoundLoader} The sound resource loader
         * @param name {String} The name of the sound object
         * @param url {String} The URL of the sound to load
         * @return {SoundResource} The sound object
         */
        retrieveSound(resourceLoader, name, url) {
            // First check to see if we've already got an audio element cached
            var sound = super.retrieveSound(resourceLoader, name, url);

            if (sound.soundObject === null) {
                // Nope, this is a new sound object

                // Check if the browser supports this sound format
                var ext = url.split("/");
                ext = ext[ext.length - 1].split(".")[1];
                if (!this._types[ext]) {
                    // The sound type is not supported
                    sound.supportedTypeFlag = false;
                    return sound;
                }

                // The type is supported, load the audio element and make sure it's not set to autoplay
                var audio = new Audio(url);
                audio.autoplay = false;
                audio.volume = 0.5;

                // Store the sound object
                sound.soundObject = audio;
            }

            return sound;
        }

        /**
         * Destroy the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        destroySound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
            sound.src = "";
        }

        /**
         * Play the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        playSound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.play();
        }

        /**
         * Stop the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        stopSound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
            sound.currentTime = 0;
        }

        /**
         * Pause the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        pauseSound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
        }

        /**
         * Resume the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        resumeSound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            if (sound.paused) {
                sound.play();
            }
        }

        /**
         * Mute the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        muteSound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.muted = true;
        }

        /**
         * Unmute the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        unmuteSound(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.muted = false;
        }

        /**
         * Set the volume of the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         * @param volume {Number} A value between 0 and 100, with 0 being muted
         */
        setSoundVolume(sound, volume) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.volume = volume / 100;
        }

        /**
         * Pan the given sound object from left to right (unsupported in HTML5)
         * @param sound {R.resources.types.Sound} The sound object
         * @param pan {Number} A value between -100 and 100, with -100 being full left
         *         and zero being center
         */
        setSoundPan(sound, pan) {
        }

        /**
         * Set the position, within the sound's length, to play at
         * @param sound {R.resources.types.Sound} The sound object
         * @param millisecondOffset {Number} The millisecond offset from the start of
         *         the sounds duration
         */
        setSoundPosition(sound, millisecondOffset) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.currentTime = Math.floor(millisecondOffset / 1000);
        }

        /**
         * Get the position, in milliseconds, within a playing or paused sound
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundPosition(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return 0;
            }
            return sound.currentTime * 1000;
        }

        /**
         * Get the size of the sound object, in bytes (unsupported in HTML5)
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundSize(sound) {
            return 0;
        }

        /**
         * Get the length (duration) of the sound object, in milliseconds
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundDuration(sound) {
            if (!(this._supported || this.getSoundReadyState(sound))) {
                return 0;
            }
            var d = sound.duration;
            return (isNaN(d) ? 0 : d);
        }

        /**
         * Determine if the sound object is ready to be used
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Boolean} <code>true</code> if the sound is ready
         */
        getSoundReadyState(sound) {
            if (!this._supported) {
                return true;
            }
            if (!sound) {
                return false;
            }
            return (sound.readyState >= BrowserSoundSystem.HAVE_ENOUGH_DATA);
        }

    }
