/**
 * The Render Engine
 * Sprite
 *
 * @fileoverview A class for working with sprites.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1556 $
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
	"class": "R.resources.types.Sprite",
	"requires": [
		"R.engine.PooledObject",
		"R.math.Rectangle2D"
	]
});

/**
 * @class Represents a sprite
 *
 * @constructor
 * @param name {String} The name of the sprite within the resource
 * @param spriteObj {Object} Passed in by a {@link SpriteLoader}.  An array which defines the
 *                  sprite frame, and parameters.
 * @param spriteResource {Object} The sprite resource loaded by the {@link SpriteLoader}
 * @extends R.engine.PooledObject
 */
R.resources.types.Sprite = function() {
	return R.engine.PooledObject.extend(/** @scope R.resources.types.Sprite.prototype */{

   // The type of sprite: Single or Animation
   type: -1,

   // Animation mode: loop or toggle
   mode: -1,

   // Animation frame count
   count: -1,

   // Animation speed
   speed: -1,

   // The rect which defines the sprite frame
   frame: null,

   // The image map that contains the sprite(s)
   image: null,

   // The bounding box for the sprite
   bbox: null,
   
   lastTime: null,
   sync: false,
   finished: false,
   toggleDir: null,
   frameNum: 0,
   playing: false,
	resource: null,
	loader: null,

   /** @private */
   constructor: function(name, spriteObj, spriteResource, fileVersion, spriteLoader) {
      this.base(name);
		this.finished = false;
		this.frameNum = 0;
		this.playing = true;
		
		if (fileVersion == 1) {
	  		this.type = (spriteObj["a"] ? R.resources.types.Sprite.TYPE_ANIMATION : R.resources.types.Sprite.TYPE_SINGLE);
		} else if (fileVersion == 2) {
			this.type = (spriteObj.length == 4 ? R.resources.types.Sprite.TYPE_SINGLE : R.resources.types.Sprite.TYPE_ANIMATION);
		}

      var s;
		if (fileVersion == 1) {
			s = (this.type == R.resources.types.Sprite.TYPE_ANIMATION ? spriteObj["a"] : spriteObj["f"]);
		} else if (fileVersion == 2) {
			s = spriteObj;
		}
		
      if (this.type == R.resources.types.Sprite.TYPE_ANIMATION) {
         switch (s[R.resources.types.Sprite.INDEX_TYPE]) {
            case "loop" : this.mode = R.resources.types.Sprite.MODE_LOOP; break;
            case "toggle" : this.mode = R.resources.types.Sprite.MODE_TOGGLE; break;
            case "once" : this.mode = R.resources.types.Sprite.MODE_ONCE; break;
         }
         if (s.length - 1 == R.resources.types.Sprite.INDEX_SYNC) {
            this.sync = true;
            this.lastTime = null;
            this.toggleDir = -1;	// Trust me
         } else {
         	this.sync = false;
         }
         this.count = s[R.resources.types.Sprite.INDEX_COUNT];
         this.speed = s[R.resources.types.Sprite.INDEX_SPEED];
      } else {
			this.count = 1;
			this.speed = -1;
		}

		this.resource = spriteResource;
		this.loader = spriteLoader;
      this.image = spriteResource.image;
      this.frame = R.math.Rectangle2D.create(s[R.resources.types.Sprite.INDEX_LEFT], s[R.resources.types.Sprite.INDEX_TOP], s[R.resources.types.Sprite.INDEX_WIDTH], s[R.resources.types.Sprite.INDEX_HEIGHT]);
      this.bbox = R.math.Rectangle2D.create(0, 0, s[R.resources.types.Sprite.INDEX_WIDTH], s[R.resources.types.Sprite.INDEX_HEIGHT]);
   },

	/**
	 * Destroy the sprite instance
	 */
	destroy: function() {
		this.bbox.destroy();
		this.frame.destroy();
		this.base();
	},

   /**
    * Release the sprite back into the pool for reuse
    */
   release: function() {
      this.base();
      this.mode = -1;
      this.type = -1;
      this.count = -1;
      this.speed = -1;
      this.frame = null;
      this.image = null;
      this.bbox = null;
		this.resource = null;
		this.loader = null;
   },

	/**
	 * Get the resource this sprite originated from
	 * @return {Object}
	 */
	getSpriteResource: function() {
		return this.resource;
	},

	/**
	 * Get the sprite loader this sprite originated from
	 * @return {R.resources.loaders.SpriteLoader}
	 */
	getSpriteLoader: function() {
		return this.loader;
	},

   /**
    * Returns <tt>true</tt> if the sprite is an animation.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation
    */
   isAnimation: function() {
      return (this.type == R.resources.types.Sprite.TYPE_ANIMATION);
   },

   /**
    * Returns <tt>true</tt> if the sprite is an animation and loops.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation and loops
    */
   isLoop: function() {
      return (this.isAnimation() && this.mode == R.resources.types.Sprite.MODE_LOOP);
   },

   /**
    * Returns <tt>true</tt> if the sprite is an animation and toggles.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation and toggles
    */
   isToggle: function() {
      return (this.isAnimation() && this.mode == R.resources.types.Sprite.MODE_TOGGLE);
   },

   /**
    * Returns <tt>true</tt> if the sprite is an animation and plays once.
    * @return {Boolean} <tt>true</tt> if the sprite is an animation and plays once
    */
   isOnce: function() {
      return (this.isAnimation() && this.mode == R.resources.types.Sprite.MODE_ONCE);
   },

	/**
	 * Get the number of frames in the sprite.
	 * @return {Number} 
	 */
	getFrameCount: function() {
		return this.count;
	},
	
	/**
	 * Get the frame speed of the animation in milliseconds, or -1 if it's a single frame.
	 * @return {Number}
	 */
	getFrameSpeed: function() {
		return this.speed;
	},

	/**
	 * For animated sprites, play the animation if it is stopped.
	 */
	play: function() {
		this.playing = true;
	},
	
	/**
	 * For animated sprites, stop the animation if it is playing.
	 */
	stop: function() {
		this.playing = false;
	},
	
	/**
	 * For animated sprites, reset the animation to frame zero.
	 */
	reset: function() {
		this.frameNum = 0;
	},
	
	/**
	 * For animated sprites, go to a particular frame number.
	 * @param frameNum {Number} The frame number to jump to
	 */
	gotoFrame: function(frameNum) {
		this.frameNum = (frameNum < 0 ? 0 : (frameNum >= this.count ? this.count - 1 : frameNum));
	},

   /**
    * Get the bounding box for the sprite.
    * @return {R.math.Rectangle2D} The bounding box which contains the entire sprite
    */
   getBoundingBox: function() {
      return this.bbox;
   },

   /**
    * Gets the frame of the sprite. The frame is the rectangle defining what
    * portion of the image map the sprite frame occupies, given the specified time.
    *
    * @param time {Number} Current world time (can be obtained with {@link Engine#worldTime}
    * @return {R.math.Rectangle2D} A rectangle which defines the frame of the sprite in
    *         the source image map.
    */
   getFrame: function(time) {
      if (!this.isAnimation()) {
         return R.math.Rectangle2D.create(this.frame);
      } else {
         var f = R.math.Rectangle2D.create(this.frame);
         var fn = this.calcFrameNumber(time);
         return f.offset(f.dims.x * fn, 0);
      }
   },

	/**
	 * Calculate the frame number for the type of animation
	 * @param time {Number} The current world time
	 * @private
	 */
	calcFrameNumber: function(time) {
		if (!this.playing) {
			return this.frameNum;
		}
	
		if (this.sync) {
			// Synchronized animations
			
			if (this.lastTime === null) {
				// Note the time when the first frame is requested and just return frame zero
				this.lastTime = time;
				return 0;
			}
			
			// How much time has elapsed since the last frame update?
			this.frameNum += (time - this.lastTime > this.speed ? this.toggleDir : 0);
			
			// Modify the frame number for the animation mode
			if (this.isOnce()) {
				// Play animation once from beinning to end
				if (this.frameNum == this.count) {
					this.frameNum = this.count - 1;
					if (!this.finished) {
						// Call event when finished
						this.finished = true;
						// TRIGGER: onSpriteFinished
					}
				}
			} else if (this.isLoop()) {
				if (this.frameNum > this.count - 1) {
					// Call event when loop restarts
					this.frameNum = 0;
					// TRIGGER: onSpriteLoopRestart
				}
			} else {
				if (this.frameNum == this.count - 1 || this.frameNum == 0) {
					// Call event when animation toggles
					this.toggleDir *= -1;
					this.frameNum += this.toggleDir;
					// TRIGGER: onSpriteToggle
				}
			}
			
			// Remember the last time a frame was requested
			this.lastTime = time;
			
		} else {
			// Unsynchronized animations
			var lastFrame = this.frameNum;
			if (this.isLoop()) {
				this.frameNum = Math.floor(time / this.speed) % this.count;
				if (this.frameNum < lastFrame) {
					// TRIGGER: onSpriteLoopRestart
				}				
			} else if (this.isOnce() && !this.finished) {
				this.frameNum = Math.floor(time / this.speed) % this.count;
				if (this.frameNum < lastFrame) {
					this.finished = true;
					this.frameNum = this.count - 1;
					// TRIGGER: onSpriteFinished
				}
			} else if (this.isToggle()) {
				this.frameNum = Math.floor(time / this.speed) % (this.count * 2);
				if (this.frameNum > this.count - 1) {
					this.frameNum = this.count - (this.frameNum - (this.count - 1));
					// TRIGGER: onSpriteToggle
				}
			}
		}
		
		return this.frameNum;
	},

   /**
    * Set the speed, in milliseconds, that an animation runs at.  If the sprite is
    * not an animation, this has no effect.
    *
    * @param speed {Number} The number of milliseconds per frame of an animation
    */
   setSpeed: function(speed) {
      if (speed >= 0) {
         this.speed = speed;
      }
   },

   /**
    * Get the number of milliseconds each frame is displayed for an animation
    * @return {Number} The milliseconds per frame
    */
   getSpeed: function() {
      return this.speed;
   },

   /**
    * The source image loaded by the {@link SpriteLoader} when the sprite was
    * created.
    * @return {HTMLImage} The source image the sprite is contained within
    */
   getSourceImage: function() {
      return this.image;
   },
   
   onSpriteLoopRestart: function() {
   }

}, /** @scope R.resources.types.Sprite.prototype */{
   /**
    * Gets the class name of this object.
    * @return {String} The string "R.resources.types.Sprite"
    */
   getClassName: function() {
      return "R.resources.types.Sprite";
   },

   /** The sprite animation loops
    * @type {Number}
    */
   MODE_LOOP: 0,

   /** The sprite animation toggles - Plays from the first to the last frame
    *  then plays backwards to the first frame and repeats.
    * @type {Number}
    */
   MODE_TOGGLE: 1,
   
   /** The sprite animation plays once from the beginning then stops at the last frame
    * @type {Number}
    */
   MODE_ONCE: 2,

   /** The sprite is a single frame
    * @type {Number}
    */
   TYPE_SINGLE: 0,

   /** The sprite is an animation
    * @type {Number}
    */
   TYPE_ANIMATION: 1,

   /** The field in the sprite definition file for the left pixel of the sprite frame
    * @private
    */
   INDEX_LEFT: 0,

   /** The field in the sprite definition file for the top pixel of the sprite frame
    * @private
    */
   INDEX_TOP: 1,

   /** The field in the sprite definition file for the width of the sprite frame
    * @private
    */
   INDEX_WIDTH: 2,

   /** The field in the sprite definition file for the height of the sprite frame
    * @private
    */
   INDEX_HEIGHT: 3,

   /** The field in the sprite definition file for the count of frames in the sprite
    * @private
    */
   INDEX_COUNT: 4,

   /** The field in the sprite definition file for the speed in milliseconds that the sprite animates
    * @private
    */
   INDEX_SPEED: 5,

   /** The field in the sprite definition file for the type of sprite animation
    * @private
    */
   INDEX_TYPE: 6,
   
   /**
    * Use synchronized frame starts and no skipping.
    * @private
    */
   INDEX_SYNC: 7
   
});

}
