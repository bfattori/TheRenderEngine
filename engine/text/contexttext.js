/**
 * The Render Engine
 * ContextText
 *
 * @fileoverview A native context font renderer.  Uses the context's font rendering
 *               mechanism to generate textual output.
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
	"class": "R.text.ContextText",
	"requires": [
		"R.text.AbstractTextRenderer",
		"R.math.Point2D",
		"R.rendercontexts.RenderContext2D",
		"R.text.TextRenderer"
	]
});

/**
 * @class A text renderer which draws text using the context's native
 *        text rendering mechansim.  This may not work on all platforms, in
 *        all browsers.  If not, see {@link R.text.BitmapText} as an alternative.
 *
 * @constructor
 * @extends R.text.AbstractTextRenderer
 */
R.text.ContextText = function(){
	return R.text.AbstractTextRenderer.extend(/** @scope R.text.ContextText.prototype */{
	
		/** @private */
		constructor: function(){
			this.base();
			this.tInit();
		},
		
		/**
		 * Initialize some basics
		 * @private
		 */
		tInit: function(){
			this.setTextAlignment(R.rendercontexts.RenderContext2D.FONT_ALIGN_LEFT);
			this.setTextWeight(R.rendercontexts.RenderContext2D.FONT_WEIGHT_NORMAL);
			this.setTextFont("sans-serif");
			this.setTextStyle(R.rendercontexts.RenderContext2D.FONT_STYLE_NORMAL);
		},
		
		/**
		 * Release the text renderer back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.tInit();
		},
		
		/**
		 * Return <tt>true</tt> if the text renderer is native to the context.
		 * @return {Boolean}
		 */
		isNative: function(){
			return true;
		},
		
		/**
		 * Calculate the bounding box for the text and set it on the host object.
		 * @private
		 */
		calculateBoundingBox: function(){
			this.getGameObject().setBoundingBox(renderContext.getTextMetrics(this.getText()));
		},
		
		/**
		 * @private
		 */
		execute: function(renderContext, time, dt){
		
			if (this.getText().length == 0) {
				return;
			}
			
			renderContext.setFontStyle(this.getTextStyle());
			renderContext.setFontAlign(this.getTextAlignment());
			renderContext.setFontWeight(this.getTextWeight());
			renderContext.setFont(this.getTextFont());
			renderContext.setFontSize(Math.floor(this.getSize() * R.text.TextRenderer.BASE_TEXT_PIXELSIZE) || R.text.TextRenderer.BASE_TEXT_PIXELSIZE);
			
			renderContext.setFillStyle(this.getColor());
			renderContext.drawText(R.math.Point2D.ZERO, this.getText(), this.getGameObject());
		}
		
	}, /** @scope R.text.ContextText.prototype */ {
		/**
		 * Get the class name of this object
		 * @return {String} The string "R.text.ContextText"
		 */
		getClassName: function(){
			return "R.text.ContextText";
		}
	});
};
