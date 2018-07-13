/**
 * The Render Engine
 * HTML5
 *
 * @fileoverview The HTML5 sound system.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
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
    "class":"R.sound.HTML5",
    "requires":[
        "R.sound.AbstractSoundSystem"
    ]
});

/**
 * @class Initializes the HTML5 sound system.  The sound types supported by the HTML5 sound system
 *    are determined by file extension on the URL:
 *    <ul>
 *       <li>mp3 - Audio MP3 format (Safari, Chrome, IE9)</li>
 *       <li>aac - Apple's AAC format (Safari)</li>
 *       <li>ogg - Ogg Vorbis format (Firefox, Chrome, Opera)</li>
 *       <li>pcm - WebM audio-only format (Firefox)</li>
 *       <li>wav - Wave audio format (Firefox, Safari, Opera, IE9)</li>
 *    </ul>
 *
 * @constructor
 * @extends R.sound.AbstractSoundSystem
 */
R.sound.HTML5 = function () {
    return R.sound.AbstractSoundSystem.extend(/** @scope R.sound.HTML5.prototype */{

        supported:false,
        types:null,
        audioRoot:null,

        /** @private */
        constructor:function () {
            this.base();

            // Check for audio support on this browser before doing anything more
            if (!RenderEngine.Support.sysInfo().support.audio) {
                this.supported = false;
                return;
            }

            // Get an audio element we can use to determine if the type is supported
            this.audioRoot = new Audio("");
            this.supported = true;

            // Interrogate the supported audio types
            this.types = {
                'mp3':this.verifyType("audio/mpeg"),
                'aac':this.verifyType("audio/mp4; codecs='mp4a.40.2'"),
                'ogg':this.verifyType("audio/ogg; codecs='vorbis'"),
                'pcm':this.verifyType("audio/webm; codecs='vorbis'"),
                'wav':this.verifyType("audio/x-wav; codecs='1'") || this.verifyType("audio/wave; codecs='1'") ||
                    this.verifyType("audio/wav; codecs='1'") || this.verifyType("audio/x-pn-wav; codecs='1'")
            };
        },

        /**
         * Verify if the given type can be played
         * @param mime
         */
        verifyType:function (mime) {
            return (this.audioRoot.canPlayType(mime) != "");
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
            // First check to see if we've already got an audio element cached
            var sound = this.base(resourceLoader, name, url);

            if (sound.getSoundObject() == null) {
                // Nope, this is a new sound object

                // Check if the browser supports this sound format
                var ext = url.split("/");
                ext = ext[ext.length - 1].split(".")[1];
                if (!this.types[ext]) {
                    // The sound type is not supported
                    sound.setSupportedTypeFlag(false);
                    return sound;
                }

                // The type is supported, load the audio element and make sure it's not set to autoplay
                var audio = new Audio(url);
                audio.autoplay = false;
                audio.volume = 0.5;

                // Store the sound object
                sound.setSoundObject(audio);
            }

            return sound;
        },

        /**
         * Destroy the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        destroySound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
            sound.src = "";
        },

        /**
         * Play the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        playSound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.play();
        },

        /**
         * Stop the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        stopSound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
            sound.currentTime = 0;
        },

        /**
         * Pause the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        pauseSound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.pause();
        },

        /**
         * Resume the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        resumeSound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            if (sound.paused) {
                sound.play();
            }
        },

        /**
         * Mute the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        muteSound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.muted = true;
        },

        /**
         * Unmute the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         */
        unmuteSound:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.muted = false;
        },

        /**
         * Set the volume of the given sound object
         * @param sound {R.resources.types.Sound} The sound object
         * @param volume {Number} A value between 0 and 100, with 0 being muted
         */
        setSoundVolume:function (sound, volume) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.volume = volume / 100;
        },

        /**
         * Pan the given sound object from left to right (unsupported in HTML5)
         * @param sound {R.resources.types.Sound} The sound object
         * @param pan {Number} A value between -100 and 100, with -100 being full left
         *         and zero being center
         */
        setSoundPan:function (sound, pan) {
            return;
        },

        /**
         * Set the position, within the sound's length, to play at
         * @param sound {R.resources.types.Sound} The sound object
         * @param millisecondOffset {Number} The millisecond offset from the start of
         *         the sounds duration
         */
        setSoundPosition:function (sound, millisecondOffset) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return;
            }
            sound.currentTime = Math.floor(millisecondOffset / 1000);
        },

        /**
         * Get the position, in milliseconds, within a playing or paused sound
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundPosition:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return 0;
            }
            return sound.currentTime * 1000;
        },

        /**
         * Get the size of the sound object, in bytes (unsupported in HTML5)
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundSize:function (sound) {
            return 0;
        },

        /**
         * Get the length (duration) of the sound object, in milliseconds
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Number}
         */
        getSoundDuration:function (sound) {
            if (!(this.supported || this.getSoundReadyState(sound))) {
                return 0;
            }
            var d = sound.duration;
            return (isNaN(d) ? 0 : d);
        },

        /**
         * Determine if the sound object is ready to be used
         * @param sound {R.resources.types.Sound} The sound object
         * @return {Boolean} <code>true</code> if the sound is ready
         */
        getSoundReadyState:function (sound) {
            if (!this.supported) {
                return true;
            }
            if (!sound) {
                return false;
            }
            return (sound.readyState >= R.sound.HTML5.HAVE_ENOUGH_DATA);
        }

    }, {
        HAVE_NOTHING:0,
        HAVE_METADATA:1,
        HAVE_CURRENT_DATA:2,
        HAVE_FUTURE_DATA:3,
        HAVE_ENOUGH_DATA:4
    });

};
