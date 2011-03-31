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
	"class": "R.sound.HTML5",
	"requires": [
		"R.sound.AbstractSoundSystem"
	]
});

/**
 * @class Initializes the HTML5 sound system.
 *
 * @constructor
 * @extends R.sound.AbstractSoundSystem
 */
R.sound.HTML5 = function(){
	return R.sound.AbstractSoundSystem.extend(/** @scope R.sound.HTML5.prototype */{
	
		supported: false,
		types: null,
		audioRoot: null,
		
		/** @private */
		constructor: function(){
			this.base();
			try {
				// Check for the Audio tag
				this.audioRoot = new Audio("");
				this.supported = true;
				// Interrogate the supported audio types
				this.types = {
					mp3: this.verifyType("audio/mpeg"),
					ogg: this.verifyType("audio/ogg; codecs='vorbis'"),
					wav: this.verifyType("audio/x-wav")
				};
			} 
			catch (ex) {
				this.supported = false;
			}
		},
		
		verifyType: function(mime){
			return (this.audioRoot.canPlayType(mime) != "");
		},
		
		retrieveSound: function(resourceLoader, name, url){
		},
		
		destroySound: function(sound){
			if (!this.supported) {
				return;
			}
		},
		
		playSound: function(sound){
			if (!this.supported) {
				return;
			}
			sound.play();
		},
		
		stopSound: function(sound){
			if (!this.supported) {
				return;
			}
			sound.pause();
			sound.currentTime = 0;
		},
		
		pauseSound: function(sound){
			if (!this.supported) {
				return;
			}
			sound.pause();
		},
		
		resumeSound: function(sound){
			if (!this.supported) {
				return;
			}
			sound.play();
		},
		
		muteSound: function(sound){
			if (!this.supported) {
				return;
			}
			sound.muted = true;
		},
		
		unmuteSound: function(sound){
			if (!this.supported) {
				return;
			}
			sound.muted = false;
		},
		
		setSoundVolume: function(sound, volume){
			if (!this.supported) {
				return;
			}
			sound.volume = volume;
		},
		
		/** 
		 * Unsupported in HTML5
		 */
		setSoundPan: function(sound, pan){
			return;
		},
		
		setSoundPosition: function(sound, millisecondOffset){
			if (!this.supported) {
				return;
			}
			sound.currentTime = Math.floor(millisecondOffset / 1000);
		},
		
		getSoundPosition: function(sound){
			if (!this.supported) {
				return 0;
			}
			return sound.currentTime * 1000;
		},
		
		/**
		 * Unsupported in HTML5
		 */
		getSoundSize: function(sound){
			return 0;
		},
		
		getSoundDuration: function(sound){
			if (!this.supported) {
				return 0;
			}
			var d = sound.duration;
			return (isNaN(d) ? 0 : d);
		},
		
		getSoundReadyState: function(sound){
			if (!this.supported) {
				return true;
			}
			return (sound.readyState >= R.sound.HTML5.HAVE_CURRENT_DATA);
		}
		
	}, {
		HAVE_NOTHING: 0,
		HAVE_METADATA: 1,
		HAVE_CURRENT_DATA: 2,
		HAVE_FUTURE_DATA: 3,
		HAVE_ENOUGH_DATA: 4
	});
	
}
