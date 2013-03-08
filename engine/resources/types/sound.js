/**
 * The Render Engine
 * Sound
 *
 * @fileoverview A sound object.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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
    "class":"R.resources.types.Sound",
    "requires":[
        "R.engine.PooledObject"
    ]
});

/**
 * @class Represents a sound object that is abstracted from the sound system.
 *        If the sound system does not initialize, for whatever reason, you can
 *             still call a sound's methods.
 *
 * @constructor
 * @param name {String} The name of the sound
 * @extends R.engine.PooledObject
 */
R.resources.types.Sound = function () {
    return R.engine.PooledObject.extend(/** @scope R.resources.types.Sound.prototype */{

        volume:-1,
        paused:false,
        pan:-1,
        muted:false,
        soundObj:null,
        soundSystem:null,
        supportedType:false,

        /** @private */
        constructor:function (soundSystem, soundObj) {
            this.volume = 50;
            this.paused = false;
            this.pan = 0;
            this.muted = false;
            this.soundObj = soundObj;
            this.soundSystem = soundSystem;
            this.supportedType = true;
            this.loop = false;
            return this.base(name);
        },

        /**
         * Destroy the sound object
         */
        destroy:function () {
            this.soundSystem.destroySound(this.sound);
            this.base();
        },

        /**
         * Release the sound back into the pool for reuse
         */
        release:function () {
            this.base();
            this.volume = -1;
            this.pan = -1;
            this.paused = false;
            this.muted = false;
            this.soundObj = null;
            this.soundSystem = null;
        },

        /**
         * Set a boolean flag indicating if the sound type is supported by the browser
         * @param state {Boolean} <code>true</code> indicates the sound type is supported
         */
        setSupportedTypeFlag:function (state) {
            this.supportedType = state;
        },

        /**
         * Returns a boolean indicating if the sound type is supported by the browser
         * @return {Boolean}
         */
        getSupportedTypeFlag:function () {
            return this.supportedType;
        },

        /**
         * Get the native sound object which was created by the subclassed sound system.
         * @return {Object}
         */
        getSoundObject:function () {
            return this.soundObj;
        },

        /**
         * Set the sound object which the subclassed sound system created.
         * @param soundObj {Object} The sound's native object
         */
        setSoundObject:function (soundObj) {
            this.soundObj = soundObj;
        },

        /**
         * Play the sound.  If the volume is specified, it will set volume of the
         * sound before playing.  If the sound was paused, it will be resumed.
         *
         * @param volume {Number} <i>[optional]</i> An integer between 0 (muted) and 100 (full volume)
         */
        play:function (volume) {
            if (this.paused) {
                this.resume();
                return;
            }

            if (volume && volume != this.getVolume()) {
                this.setVolume(volume);
            }

            this.soundSystem.playSound(this.soundObj);
        },

        /**
         * If the sound is playing, stop the sound and reset it to the beginning.
         */
        stop:function () {
            this.paused = false;
            this.soundSystem.stopSound(this.soundObj);
        },

        /**
         * If the sound is playing, pause the sound.
         */
        pause:function () {
            this.soundSystem.pauseSound(this.soundObj);
            this.paused = true;
        },

        /**
         * Returns <tt>true</tt> if the sound is currently paused.
         * @return {Boolean} <tt>true</tt> if the sound is paused
         */
        isPaused:function () {
            return this.paused;
        },

        /**
         * If the sound is paused, it will resume playing the sound.
         */
        resume:function () {
            this.paused = false;
            this.soundSystem.resumeSound(this.soundObj);
        },

        /**
         * Mute the sound (set its volume to zero).
         */
        mute:function () {
            this.soundSystem.muteSound(this.soundObj);
            this.muted = true;
        },

        /**
         * Unmute the sound (reset its volume to what it was before muting).
         */
        unmute:function () {
            if (!this.muted) {
                return;
            }
            this.soundSystem.unmuteSound(this.soundObj);
            this.muted = false;
        },

        /**
         * Set the volume of the sound to an integer between 0 (muted) and 100 (full volume).
         *
         * @param volume {Number} The volume of the sound
         */
        setVolume:function (volume) {
            if (isNaN(volume)) {
                return;
            }

            // clamp it
            volume = (volume < 0 ? 0 : volume > 100 ? 100 : volume);
            this.volume = volume;
            this.soundSystem.setSoundVolume(this.soundObj, volume);
        },

        /**
         * Get the volume the sound is playing at.
         * @return {Number} An integer between 0 and 100
         */
        getVolume:function () {
            return this.volume;
        },

        /**
         * Set the pan of the sound, with -100 being full left and 100 being full right.
         *
         * @param pan {Number} An integer between -100 and 100, with 0 being center.
         */
        setPan:function (pan) {
            this.pan = pan;
            this.soundSystem.setSoundPan(this.soundObj, pan);
        },

        /**
         * Get the pan of the sound, with -100 being full left and 100 being full right.
         * @return {Number} An integer between -100 and 100
         */
        getPan:function () {
            return this.pan;
        },

        /**
         * Set the sound offset in milliseconds.
         *
         * @param millisecondOffset {Number} The offset into the sound to play from
         */
        setPosition:function (millisecondOffset) {
            this.position = millisecondOffset;
            this.soundSystem.setSoundPosition(this.soundObj, millisecondOffset);
        },

        /**
         * Get the position of the sound, in milliseconds, from the start of the sound.
         * @return {Number} The millisecond offset into the sound
         */
        getLastPosition:function () {
            return this.soundSystem.getSoundPosition(this.soundObj);
        },

        /**
         * Get the total size, in bytes, of the sound.  If the sound engine is not
         * initialized, returns 0.
         * @return {Number} The size of the sound, in bytes
         */
        getSizeBytes:function () {
            return this.soundSystem.getSoundSize(this.soundObj);
        },

        /**
         * Get the length of the sound, in milliseconds.  If the sound hasn't fully loaded,
         * it will be the number of milliseconds currently loaded.  Due to the nature of
         * Variable Bitrate (VBR) sounds, this number may be inaccurate.
         * @return {Number} The length of the sound, in milliseconds
         */
        getDuration:function () {
            return this.soundSystem.getSoundDuration(this.soundObj);
        },

        /**
         * Flag to indicate if the sound ready to use.
         * @return {Boolean}
         */
        getReadyState:function () {
            return this.soundSystem.getSoundReadyState(this.soundObj);
        }

    }, /** @scope R.resources.types.Sound.prototype */ {
        /**
         * Gets the class name of this object.
         * @return {String} The string "R.resources.types.Sound"
         */
        getClassName:function () {
            return "R.resources.types.Sound";
        }
    });

}