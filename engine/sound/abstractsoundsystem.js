/**
 * The Render Engine
 * SoundSystem
 *
 * @fileoverview An abstraction class for the engine sound system.  Pluggable
 *					  architecture for linking in different sound managers.
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
	"class": "R.sound.AbstractSoundSystem",
	"requires": [
		"R.lang.Timeout",
		"R.resources.types.Sound"
	]
});

/**
 * @class Sound system abstraction class for pluggable sound architecture.  The <tt>
 *			 R.sound.AbstractSoundSystem</tt> class is used to separate the sound manager from the resource
 *			 loader and sound objects.
 *
 * @constructor
 */
R.sound.AbstractSoundSystem = function(){
	return Base.extend(/** @scope R.sound.AbstractSoundSystem.prototype */{
	
		ready: false,
		queuedSounds: null,
		loadingSounds: null,
		
		/** @private */
		constructor: function(){
			this.ready = false, this.queuedSounds = [];
			this.loadingSounds = {};
		},
		
		shutdown: function(){
		},
		
		isReady: function(){
			return this.ready;
		},
		
		makeReady: function(){
			// Retrieve queued sounds
			var self = this;
			R.lang.Timeout.create("loadQueuedSounds", 100, function(){
				if (self.queuedSounds.length > 0) {
					while (self.queuedSounds.length > 0) {
						var s = self.queuedSounds.shift();
						self.retrieveSound(s.sLoader, s.sName, s.sUrl);
					}
				}
				
				this.destroy();
			});
			this.ready = true;
		},
		
		loadSound: function(resourceLoader, name, url){
			if (!this.ready) {
				this.queuedSounds.push({
					sLoader: resourceLoader,
					sName: name,
					sUrl: url
				});
				return R.resources.types.Sound.create(this, null);
			}
			else {
				return this.retrieveSound(resourceLoader, name, url);
			}
		},
		
		retrieveSound: function(resourceLoader, name, url){
			// See if the resource loader has a sound object for us already
			var sound = resourceLoader.get(name);
			if (sound == null) {
				// No, return an empty sound object
				return R.sound.Sound.create(this, null);
			}
			else {
				// Yep, return the existing sound object
				return sound;
			}
		},
		
		/**
		 * [ABSTRACT] Destroy the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		destroySound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Play the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		playSound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Stop the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		stopSound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Pause the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		pauseSound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Resume the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		resumeSound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Mute the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		muteSound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Unmute the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 */
		unmuteSound: function(sound){
		},
		
		/**
		 * [ABSTRACT] Set the volume of the given sound object
		 * @param sound {R.resources.types.Sound} The sound object
		 * @param volume {Number} A value between 0 and 100, with 0 being muted
		 */
		setSoundVolume: function(sound, volume){
		},
		
		/**
		 * [ABSTRACT] Pan the given sound object from left to right
		 * @param sound {R.resources.types.Sound} The sound object
		 * @param pan {Number} A value between -100 and 100, with -100 being full left
		 * 		and zero being center
		 */
		setSoundPan: function(sound, pan){
		},
		
		/**
		 * [ABSTRACT] Set the position, within the sound's length, to play at
		 * @param sound {R.resources.types.Sound} The sound object
		 * @param millisecondOffset {Number} The millisecond offset from the start of
		 * 		the sounds duration
		 */
		setSoundPosition: function(sound, millisecondOffset){
		},
		
		/**
		 * [ABSTRACT] Get the position, in milliseconds, within a playing or paused sound
		 * @param sound {R.resources.types.Sound} The sound object
		 * @return {Number}
		 */
		getSoundPosition: function(sound){
			return 0;
		},
		
		/**
		 * [ABSTRACT] Get the size of the sound object, in bytes
		 * @param sound {R.resources.types.Sound} The sound object
		 * @return {Number}
		 */
		getSoundSize: function(sound){
			return 0;
		},
		
		/**
		 * [ABSTRACT] Get the length (duration) of the sound object, in milliseconds
		 * @param sound {R.resources.types.Sound} The sound object
		 * @return {Number}
		 */
		getSoundDuration: function(sound){
			return 0;
		},
		
		/**
		 * [ABSTRACT] Determine if the sound object is ready to be used
		 * @param sound {R.resources.types.Sound} The sound object
		 * @return {Boolean} <code>true</code> if the sound is ready
		 */
		getSoundReadyState: function(sound){
			return false;
		}
		
	});
}