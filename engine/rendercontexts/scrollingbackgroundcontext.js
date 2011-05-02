/**
 * The Render Engine
 * ScrollingBackgroundContext
 * 
 * @fileoverview An object which loads an image and a collision map
 *               for usage as a single layered scrolling background.
 *
 * @fileoverview An extension of the canvas context that provides the
 *               display of a scrolling background.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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
	"class": "R.rendercontexts.ScrollingBackgroundContext",
	"requires": [
		"R.rendercontexts.CanvasContext",
		"R.math.Math2D"
	]
});

/**
 * @class A scrolling background render context.  The render context loads 
 * 		 a level which defines the image that will be displayed within the context
 * 		 as its background.
 *
 * @constructor
 * @param name {String} The name of the object
 * @param level {Level} A level object to use for this scrolling background
 * @param windowWidth {Number} The width of the viewable window, in pixels
 * @param windowHeight {Number} The height of the viewable window, in pixels
 * @example R.rendercontexts.ScrollingBackground.create("background", levelObj, 640, 448);
 * @extends R.rendercontexts.CanvasContext
 */
R.rendercontexts.ScrollingBackgroundContext = function(){
	return R.rendercontexts.CanvasContext.extend(/** @scope R.rendercontexts.ScrollingBackgroundContext.prototype */{
	
		level: null,
		
		visRect: null,
		
		/** @private */
		constructor: function(name, level, windowWidth, windowHeight){
			// Create an element for us to use as our window
			this.base(name || "ScrollingBackgroundContext", windowWidth, windowHeight);
			this.visRect = R.math.Rectangle2D.create(0, 0, windowWidth, windowHeight);
			this.level = level;
		},
		
		/**
		 * Set the scroll position for the background using a {@link R.math.Point2D} to
		 * define the X and Y scroll amount.
		 *
		 * @param point {R.math.Point2D} The scroll position along X and Y
		 */
		setWorldPosition: function(point){
			this.visRect.setTopLeft(point);
			this.base(point);
		},
		
		/**
		 * Set the horizontal scroll amount in pixels.
		 *
		 * @param x {Number} The horizontal scroll in pixels
		 */
		setHorizontalScroll: function(x){
			var pt = this.visRect.getTopLeft();
			pt.setX(x);
			this.setWorldPosition(pt);
		},
		
		/**
		 * Set the vertical scroll amount in pixels.
		 *
		 * @param y {Number} The vertical scroll in pixels
		 */
		setVerticalScroll: function(y){
			var pt = this.visRect.getTopLeft();
			pt.setY(y);
			this.setWorldPosition(pt);
		},
		
		/**
		 * Get the horizontal scroll amount in pixels.
		 * @return {Number} The horizontal scroll
		 */
		getHorizontalScroll: function(){
			return this.visRect.getTopLeft().x;
		},
		
		/**
		 * Get the vertical scroll amount in pixels.
		 * @return {Number} The vertical scroll
		 */
		getVerticalScroll: function(){
			return this.visRect.getTopLeft().y;
		},
		
		setupWorld: function(time, dt){
			this.base(time, dt);
			
			// Render the slice of the level image first
			this.drawImage(this.getViewport(), this.level.getSourceImage(), this.visRect);
		}
		
	}, /** @scope R.rendercontexts.ScrollingBackgroundContext.prototype */ {
	
		/**
		 * Get the class name of this object
		 * @return {String} The string "R.rendercontexts.ScrollingBackgroundContext"
		 */
		getClassName: function(){
			return "R.rendercontexts.ScrollingBackgroundContext";
		}
	});
	
}
