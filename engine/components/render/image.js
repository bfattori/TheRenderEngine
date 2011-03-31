/**
 * The Render Engine
 * ImageComponent
 *
 * @fileoverview An extension of the render component which handles 
 *               image resource rendering.
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
	"class": "R.components.render.Image",
	"requires": [
		"R.components.Render"
	]
});

/**
 * @class A {@link R.components.Render render component} that draws an image to the render context.
 *        Images used by this component are loaded via an {@link R.resources.loader.ImageLoader}
 *        so that client-side caching can be used.
 *
 * @param name {String} The name of the component
 * @param [priority=0.1] {Number} The render priority
 * @param image {R.resources.types.Image} The image object, acquired with {@link R.resources.loaders.ImageLoader#getImage}.
 * @extends R.components.Render
 * @constructor
 * @description Creates a component which renders images from an {@link ImageLoader}.
 */
R.components.render.Image = function() {
	return R.components.Render.extend(/** @scope R.components.render.Image.prototype */{

   currentImage: null,
   bbox: null,
   imageLoader: null,

   /**
    * @private
    */
   constructor: function(name, priority, image) {
      if (Image.isInstance(priority)) {
         image = priority;
         priority = 0.1;
      }
      this.base(name, priority);
      if (image != null) {
         this.currentImage = image;
         this.bbox = this.currentImage.getBoundingBox();
      }
   },

   /**
    * Releases the component back into the object pool. See {@link R.engine.PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
      this.currentImage = null;
      this.bbox = null;
   },

   /**
    * Calculates the bounding box which encloses the image.
    * @private
    */
   calculateBoundingBox: function() {
      return this.bbox;
    },

   /**
    * Set the image the component will render from the {@link R.resources.loaders.ImageLoader}
    * specified when creating the component.  This allows the user to change
    * the image on the fly.
    *
    * @param image {R.resources.types.Image} The image to render
    */
   setImage: function(image) {
      this.currentImage = image;
      this.bbox = image.getBoundingBox();
		this.getHostObject().markDirty();
   },

   /**
    * Get the image the component is rendering.
    * @return {HTMLImage}
    */
   getImage: function() {
      return this.currentImage;
   },

   /**
    * Draw the image to the render context.
    *
    * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to render to
    * @param time {Number} The engine time in milliseconds
    */
   execute: function(renderContext, time) {

      if (!this.base(renderContext, time)) {
         return;
      }

      if (this.currentImage) {
			this.transformOrigin(renderContext, true);
         renderContext.drawImage(this.bbox, this.currentImage.getImage(), null, this.getHostObject());
			this.transformOrigin(renderContext, false);
      }
   }
}, /** @scope R.components.render.Image.prototype */{ 
   /**
    * Get the class name of this object
    * @return {String} "R.components.render.Image"
    */
   getClassName: function() {
      return "R.components.render.Image";
   }
});
}
