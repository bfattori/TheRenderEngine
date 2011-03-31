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
	"class": "R.sound.SM2",
	"requires": [
		"R.sound.AbstractSoundSystem"
	],
	"includes": [
		"/libs/soundmanager2.js",
		"/libs/AC_OETags.js"	
	]
});

/**
 * @class Initializes the SoundManager2 sound system.
 *
 * @constructor
 * @extends R.sound.AbstractSoundSystem
 */
R.sound.SM2 = function(){
	return R.sound.AbstractSoundSystem.extend(/** @scope R.sound.SM2.prototype */{
	
		init: false,
		soundManager: null,
		
		/** @private */
		constructor: function(){
			this.base();
			if (typeof SoundManager !== "undefined") {
			
				// Create a link to the object
				this.soundManager = window.soundManager;
				this.soundManager.debugMode = false;
				
				// directory where SM2 .SWFs live
				this.soundManager.url = R.Engine.getEnginePath() + '/libs/';
				
				if (GetSwfVer() != null) {
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
					this.soundManager.onload = function(){
						self.init = true;
						R.debug.Console.warn("SoundManager loaded successfully");
						self.makeReady();
					};
					
					/** @private */
					this.soundManager.onerror = function(){
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
					this.init = false;
				}
				
			}
			else {
				// SoundManager isn't defined
				this.init = false;
			}
		},
		
		/**
		 * Shutdown the sound system
		 * @private
		 */
		shutdown: function(){
			this.soundManager.destruct();
		},
		
		retrieveSound: function(resourceLoader, name, url){
			var sound = this.base(resourceLoader, name, url);
			
			// Only MP3 files are supported
			Assert(url.indexOf(".mp3") > 0, "Only MP3 sound format is supported!");
			
			if (!this.init) {
				return sound;
			}
			
			// Create the sound object
			var sm2sound = this.soundManager.createSound({
				"id": name,
				"url": url,
				"autoPlay": false,
				"autoLoad": true,
				"volume": 50
			});
			sound.setSoundObject(sm2sound);
			return sound;
		},
		
		destroySound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.unload();
		},
		
		playSound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.play();
		},
		
		stopSound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.stop();
		},
		
		pauseSound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.pause();
		},
		
		resumeSound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.resume();
		},
		
		muteSound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.mute();
		},
		
		unmuteSound: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.unmute();
		},
		
		setSoundVolume: function(sound, volume){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.setVolume(volume);
		},
		
		setSoundPan: function(sound, pan){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.setPan(pan);
		},
		
		setSoundPosition: function(sound, millisecondOffset){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return;
			}
			sound.setPosition(millisecondOffset);
		},
		
		getSoundPosition: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return 0;
			}
			return sound.position;
		},
		
		getSoundSize: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return 0;
			}
			return sound.bytesTotal;
		},
		
		getSoundDuration: function(sound){
			if (!(this.init || this.getSoundReadyState(sound))) {
				return 0;
			}
			return sound.duration;
		},
		
		getSoundReadyState: function(sound){
			if (!this.init) {
				return true;
			}
			if (!sound) {
				return false;
			}
			return (sound.readyState == R.sound.SM2.LOAD_SUCCESS);
		}
		
	}, {
		LOAD_LOADING: 1,
		LOAD_ERROR: 2,
		LOAD_SUCCESS: 3
	});
	
}