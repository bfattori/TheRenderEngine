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
"use strict";

/**
 * @class A wrapper class for images.  Images contain a reference to their resource
 *          loader and the bitmap dimensions for the image.  Additionally, the dimensions
 *          are used to determine the bounding box around the image.
 *
 * @constructor
 * @param name {String} The name of the image object
 * @param imageName {String} The name of the image container in the resource loader
 * @param imageLoader {ImageLoader} The resource loader used to load the image
 * @extends PooledObject
 */
class ImageResource extends PooledObject {

  constructor(name = "ImageResource", imageName, imageLoader) {
    super(name);
    this._image = imageLoader.get(imageName);
    var dims = imageLoader.getDimensions(imageName);
    this._bbox = Rectangle2D.create(0, 0, dims.x, dims.y);
  }

  release() {
    super.release();
    this._image = null;
    this._bbox = null;
  }

  destroy() {
    this._bbox.destroy();
    super.destroy();
  }

  /**
   * Gets the class name of this object.
   * @return {String} The string "ImageResource"
   */
  get className() {
    return "ImageResource";
  }

  /**
   * Get the bounding box for the image.
   */
  get boundingBox() {
    return this._bbox;
  }

  /**
   * Get the HTML image object which contains the image.
   */
  get image() {
    return this._image;
  }

}