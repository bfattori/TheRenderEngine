/**
 * The Render Engine
 * Image
 *
 * @fileoverview An image resource
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
	"class": "R.resources.types.Image",
	"requires": [
		"R.engine.PooledObject",
		"R.math.Rectangle2D"
	]
});

/**
 * @class A wrapper class for images.  Images contain a reference to their resource
 * 		 loader and the bitmap dimensions for the image.  Additionally, the dimensions
 * 		 are used to determine the bounding box around the image.
 *
 * @constructor
 * @param name {String} The name of the image object
 * @param imageName {String} The name of the image container in the resource loader
 * @param imageLoader {ImageLoader} The resource loader used to load the image
 * @extends R.engine.PooledObject
 */
R.resources.types.Image = function(){
	return R.engine.PooledObject.extend(/** @scope R.resources.types.Image.prototype */{
	
		image: null,
		
		/** @private */
		constructor: function(name, imageName, imageLoader){
			this.base(name || "Image");
			this.image = imageLoader.get(imageName);
			var dims = imageLoader.getDimensions(imageName);
			this.bbox = R.math.Rectangle2D.create(0, 0, dims.x, dims.y);
		},
		
		/**
		 * Release the image back into the pool for reuse
		 */
		release: function(){
			this.base();
			this.image = null;
			this.bbox = null;
		},
		
		/**
		 * Get the bounding box for the image.
		 * @return {R.math.Rectangle2D} The bounding box which contains the entire image
		 */
		getBoundingBox: function(){
			return this.bbox;
		},
		
		/**
		 * Get the HTML image object which contains the image.
		 * @return {HTMLImage}
		 */
		getImage: function(){
			return this.image;
		}
		
	}, /** @scope R.resources.types.Image.prototype */{ 
		/**
		 * Gets the class name of this object.
		 * @return {String} The string "R.resources.types.Image"
		 */
		getClassName: function(){
			return "R.resources.types.Image";
		}
		
	});
	
}