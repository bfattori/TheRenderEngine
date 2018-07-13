/**
 * The Render Engine
 * SoundResourceLoader
 *
 * @fileoverview A resource loader for sounds.
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
    "class":"R.resources.loaders.SoundLoader",
    "requires":[
        "R.resources.loaders.RemoteLoader",
        "R.lang.Timeout"
    ]
});

/**
 * @class Loads sounds and stores the reference to them using the provided sound
 *          system.  Sounds resource that are loaded are cached with the loader.
 *
 * @constructor
 * @param soundSystem {R.sound.AbstractSoundSystem} A sound system instance, either {@link R.sound.SM2} or
 *     {@link R.sound.HTML5}.
 * @extends R.resources.loaders.RemoteLoader
 */
R.resources.loaders.SoundLoader = function () {
    return R.resources.loaders.RemoteLoader.extend(/** @scope R.resources.loaders.SoundLoader.prototype */{

        queuedSounds:null,
        checkReady:null,
        soundSystem:null,
        queueingSounds:true,
        loadingSounds:0,

        /** @private */
        constructor:function (soundSystem) {
            this.base("SoundLoader");
            this.init = false;
            this.queuedSounds = [];
            this.queueingSounds = true;
            this.loadingSounds = 0;
            this.soundSystem = soundSystem;
        },

        /**
         * Destroy the sound loader and shut down the sound system
         */
        destroy:function () {
            if (this.soundSystem) {
                this.soundSystem.shutdown();
                this.soundSystem = null;
            }
        },

        /**
         * Load a sound resource from a URL. If the sound system does not initialize, for whatever
         * reason, you can still call the sound's methods.
         *
         * @param name {String} The name of the resource
         * @param url {String} The URL where the resource is located
         */
        load:function (name, url) {
            var soundObj = this.soundSystem.loadSound(this, name, url);

            // We'll need to periodically check a sound's "readyState" for success
            // to know when the sound is ready for usage.
            this.loadingSounds++;
            if (!this.checkReady) {
                var self = this;
                this.checkReady = true;

                R.lang.Timeout.create("waitForSounds", 500, function () {
                    var sounds = self.getResources();
                    for (var s in sounds) {
                        if (!self.isReady(sounds[s]) && self.get(sounds[s]).getReadyState()) {
                            self.setReady(sounds[s], true);
                            self.loadingSounds--;
                        }
                    }

                    if (self.loadingSounds != 0) {
                        // There are still sounds loading
                        this.restart();
                    }
                    else {
                        self.checkReady = false;
                        this.destroy();
                    }
                });
            }

            if (!this.init) {
                this.init = true;
            }

            this.base(name, url, soundObj);
        },

        /**
         * Unload a sound, calling the proper methods in the sound system.
         *
         * @param sound {String} The name of the sound to unload
         */
        unload:function (sound) {
            var s = this.get(sound).destroy();
            this.base(sound);
        },

        /**
         * Creates a {@link R.resources.types.Sound} object representing the named sound.
         *
         * @param sound {String} The name of the sound from the resource
         * @return {R.resources.types.Sound} A {@link R.resources.types.Sound} instance
         */
        getSound:function (sound) {
            return this.get(sound);
        },

        /**
         * Get the specific sound resource by name.
         * @param name {String} The name of the resource
         * @return {R.resources.types.Sound}
         */
        getResourceObject:function (name) {
            return this.getSound(name);
        },

        /**
         * The name of the resource this loader will get.
         * @return {String} The string "sound"
         */
        getResourceType:function () {
            return "sound";
        }

    }, /** @scope R.resources.loaders.SoundLoader.prototype */ {
        /**
         * Get the class name of this object
         * @return {String} The string "R.resources.loaders.SoundLoader"
         */
        getClassName:function () {
            return "R.resources.loaders.SoundLoader";
        }
    });

};
