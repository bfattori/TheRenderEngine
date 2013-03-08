/**
 * The Render Engine
 * SM2
 *
 * @fileoverview The SoundManager 2 sound system.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
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

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.sound.SM2",
    "requires":[
        "R.sound.AbstractSoundSystem"
    ],
    "includes":[
        "/libs/soundmanager2.js",
        "/libs/AC_OETags.js"
    ]
});

/**
 * @class Initializes the SoundManager2 sound system.  The SoundManager2 sound system will only
 *    render MP3 audio as supported by Flash.
 *
 * @constructor
 * @extends R.sound.AbstractSoundSystem
 */
R.sound.SM2 = function () {
    return R.sound.AbstractSoundSystem.extend(/** @scope R.sound.SM2.prototype */{

        init:false,
        soundManager:null,

        /** @private */
        constructor:function () {
            this.base();
            if (typeof SoundManager !== "undefined") {

                // Create a link to the object
                this.soundManager = window.soundManager;
                this.soundManager.debugMode = false;

                // directory where SM2 .SWFs live
                this.soundManager.url = R.Engine.getEnginePath() + '/libs/';

                var swfVer = GetSwfVer();
                if (swfVer && swfVer != -1) {
                    // Detect the version of flash available.  If 9 or higher, use 9
                    var hasReqestedVersion = DetectFlashVer(9, 0, 0);
                    if (hasReqestedVersion) {
                        this.soundManager.flashVersion = 9;
                    }
                    else {
                        this.soundManager.flashVersion = 8;
                    }

                    // Debugging enabled?
                    this.soundManager.debugMode = R.engine.Support.checkBooleanParam("debugSound");

                    var self = this;

                    /** @private */
                    this.soundManager.onload = function () {
                        self.init = true;
                        R.debug.Console.warn("SoundManager loaded successfully");
                        self.makeReady();
                    };

                    /** @private */
                    this.soundManager.onerror = function () {
                        self.init = false;
                        R.debug.Console.warn("SoundManager not loaded");
                    };

                    if (R.Engine.getEnginePath().indexOf("file:") == 0) {
                        this.soundManager.sandbox.type = "localWithFile";
                    }

                    this.soundManager.go();

                }
                else {
                    // Flash not installed
                    R.debug.Console.warn("SoundManager failed: No Flash Installed");
                    this.init = false;
                }

            }
            else {
                // SoundManager isn't defined
                R.debug.Console.warn("SoundManager failed: Not loaded or defined");
                this.init = false;
            }
        },

        /**
         * Shutdown the sound system
         * @private
         */
        shutdown:function () {
            this.soundManager.destruct();
        },

        /**
         * Retrieve the sound from the network, when the sound system is ready, and create the sound object.
         * @param resourceLoader {R.resources.loades.SoundLoader} The sound resource loader
         * @param name {String} The name of the sound object
         * @param url {String} The URL of the sound to load
         * @return {R.resources.types.Sound} The sound object
         * @private
         */
        retrieveSound:function (resourceLoader, name, url) {
            // See if the sound object is already cached by the given name
            var sound = this.base(resourceLoader, name, url);

            if (sound.getSoundObject() == null) {
                // Nope, this is a new sound object

                // Only MP3 files are supported
                if (url.indexOf(".mp3") == -1) {
                    sound.setSupportedTypeFlag(false);
                    return sound;
                }

                if (!this.init) {
                    return sound;
                }

                // Create the sound object
                var sm2sound = this.soundManager.createSound({
                    "id":name,
                    "url":url,
                    "autoPlay":false,
                    "autoLoad":true,
                    "volume":50
                });
                sound.setSoundObject(sm2sound);
            }

            return sound;
        },

        /**
         * Destroy the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        destroySound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.unload();
        },

        /**
         * Play the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        playSound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.play();
        },

        /**
         * Stop the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        stopSound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.stop();
        },

        /**
         * Pause the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        pauseSound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
        },

        /**
         * Resume the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        resumeSound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.resume();
        },

        /**
         * Mute the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        muteSound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.mute();
        },

        /**
         * Unmute the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        unmuteSound:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.unmute();
        },

        /**
         * Set the volume of the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         * @param volume {Number} A value between 0 and 100, with 0 being muted
         */
        setSoundVolume:function (sound, volume) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.setVolume(volume);
        },

        /**
         * Pan the given sound object from left to right
         * @param sound {R.resources.types.Sound} The sound object
         * @param pan {Number} A value between -100 and 100, with -100 being full left
         *         and zero being center
         */
        setSoundPan:function (sound, pan) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.setPan(pan);
        },

        /**
         * Set the position, within the sound's length, to play at
         * @param sound {R.resources.types.Sound} The sound object
         * @param millisecondOffset {Number} The millisecond offset from the start of
         *         the sounds duration
         */
        setSoundPosition:function (sound, millisecondOffset) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return;
            }
            sound.setPosition(millisecondOffset);
        },

        /**
         * Get the position, in milliseconds, within a playing or paused sound
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundPosition:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return 0;
            }
            return sound.position;
        },

        /**
         * Get the size of the sound object, in bytes
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundSize:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return 0;
            }
            return sound.bytesTotal;
        },

        /**
         * Get the length (duration) of the sound object, in milliseconds
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundDuration:function (sound) {
            if (!(this.init && this.getSoundReadyState(sound))) {
                return 0;
            }
            return sound.duration;
        },

        /**
         * Determine if the sound object is ready to be used
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Boolean} <code>true</code> if the sound is ready
         */
        getSoundReadyState:function (sound) {
            if (!this.init) {
                return true;
            }
            if (!sound) {
                return false;
            }
            return (sound.readyState == R.sound.SM2.LOAD_SUCCESS);
        }

    }, {
        LOAD_LOADING:1,
        LOAD_ERROR:2,
        LOAD_SUCCESS:3
    });

};