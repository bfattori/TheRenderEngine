/**
 * The Render Engine
 * DocumentContext
 *
 * @fileoverview A render context which wraps the DOM document node.
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
	"class": "R.rendercontexts.DocumentContext",
	"requires": [
		"R.rendercontexts.HTMLElementContext"
	]
});

/**
 * @class A reference to the <tt>document.body</tt> element as a rendering context.
 * Aside from being The Render Engine's default rendering context, the context
 * is essentially a wrapper for the HTML document.  Wrapping, in this way, allows
 * us to update not only this context, but all other contexts during an engine frame.
 *
 * @extends R.rendercontexts.HTMLElementContext
 * @constructor
 * @description Create an instance of a document rendering context.  This context
 * represents the HTML document body.  Theoretically, only one of these
 * contexts should ever be created.
 */
R.rendercontexts.DocumentContext = function(){
	return R.rendercontexts.HTMLElementContext.extend(/** @scope R.rendercontexts.DocumentContext.prototype */{
	
		/** @private */
		constructor: function(){
			this.base("DocumentContext", document.body);

         // Special case
         this.setObjectDataModel("DOMPosition", R.math.Point2D.ZERO);
		},
		
		/**
		 * Reset the context, clearing it and preparing it for drawing.
		 */
		reset: function(rect){
		}
		
	}, { /** @scope R.rendercontexts.DocumentContext.prototype */
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.rendercontexts.DocumentContext"
		 */
		getClassName: function(){
			return "R.rendercontexts.DocumentContext";
		},
		
		// The engine looks for this field to know when to startup
		started: true

	});
};