/**
 * The Render Engine
 * RenderUtil
 *
 * @fileoverview A static class with helper methods for rendering screen shots, partial images, and some effects.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1557 $
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
    "class":"R.util.RenderUtil",
    "requires":[
        "R.rendercontexts.CanvasContext",
        "R.math.Point2D",
        "R.math.Rectangle2D"
    ]
});

/**
 * @class A static class of rendering utilities.  Most of the methods are intended
 *     for bitmap contexts, such as canvas, but may apply to others.  The methods
 *     have been designed with canvas in mind.
 *
 * @static
 */
R.util.RenderUtil = /** @scope R.util.RenderUtil.prototype */ {

    // Private cache of temporary contexts
    tempContexts:{},

    /**
     * Get a temporary context to render into.  Only one context will ever be created for the type
     * specified, and cached for repeated use.  It will be cleaned up when the engine is shut down.
     * @param type {R.rendercontexts.RenderContext2D} The context class to mimic
     * @param width {Number} The width of the temporary context
     * @param height {Number} The height of the temporary context
     * @return {R.rendercontexts.RenderContext2D}
     */
    getTempContext:function (type, width, height) {
        if (R.util.RenderUtil.tempContexts[type.getClassName()] == null) {
            // Create the temporary context to render to
            R.util.RenderUtil.tempContexts[type.getClassName()] = type.create("tempCtx", 800, 800);

            // When the engine shuts down, clean up the contexts
            R.Engine.onShutdown(function () {
                for (var c in R.util.RenderUtil.tempContexts) {
                    R.util.RenderUtil.tempContexts[c].destroy();
                    R.util.RenderUtil.tempContexts = {};
                }
            })
        }

        // Prepare the temporary context
        var ctx = R.util.RenderUtil.tempContexts[type.getClassName()];
        ctx.getElement().width = width;
        ctx.getElement().height = height;
        ctx.reset();

        return ctx;
    },

    /**
     * Perform a single execution of a rendering component.
     * @param contextType {R.rendercontexts.RenderContext2D} The type of context to render to
     * @param renderComponent {R.components.Render} The component to render
     * @param width {Number} The width of the temporary context
     * @param height {Number} The height of the temporary context
     * @param time {Number} The time in milliseconds, or <code>null</code> to use the current engine time
     * @param offset {R.math.Point2D} The offset for the rendering position
     * @return {String} The data URL of the rendered image
     */
    renderComponentToImage:function (contextType, renderComponent, width, height, time, offset) {
        // Get the temporary context
        var ctx = R.util.RenderUtil.getTempContext(contextType, width, height);

        time = time || R.Engine.worldTime;

        // The position to render to in the context
        offset = offset || Point2D.ZERO;

        // Render the component
        var p = R.math.Point2D.create(0, 0);
        p.add(offset);
        ctx.setPosition(p);
        p.destroy();
        renderComponent.execute(ctx, time, 1);

        // Extract the rendered image
        return ctx.getDataURL();
    },

    /**
     * Takes a screen shot of the context provided, optionally cropped to specific dimensions.
     * @param renderContext {R.rendercontexts.RenderContext2D} The context to get a screenshot of
     * @param [cropRect] {R.math.Rectangle2D} Optional rectangle to crop to, or <code>null</code> for the
     *     entire context.
     * @return {String} The data URL of the screen shot
     */
    screenShot:function (renderContext, cropRect) {
        cropRect = cropRect || renderContext.getViewport();

        // Render the screenshot to the temp context
        var ctx = R.util.RenderUtil.getTempContext(renderContext.constructor, renderContext.getViewport().w, renderContext.getViewport().h);
        ctx.drawImage(renderContext.getViewport(), renderContext.getSurface(), cropRect);

        // Return the image data
        return ctx.getDataURL();
    },

    /**
     * Extract the image data URL from the provided image.  The image can either be an HTML &lt;img&gt; element,
     * or it can be another render context.  This method currently only works with the canvas context.
     * @param image {Object} Image or context
     * @param [cropRect] {R.math.Rectangle2D} A rectangle to crop to, or <code>null</code> to use the entire image
     * @param [contextType] {R.rendercontexts.RenderContext2D} Optional render context class, or <code>null</code> to
     *     assume a canvas context.
     * @return {String} A data URL for the extracted image
     */
    extractDataURL:function (image, cropRect, contextType) {
        contextType = contextType || R.rendercontexts.CanvasContext;
        var img = $(image), imgRect = R.math.Rectangle2D.create(0, 0, img.attr("width"), img.attr("height"));

        if (cropRect) {
            imgRect.sub(cropRect.getTopLeft());
        }

        // Get the temporary context
        var w = cropRect ? cropRect.w : imgRect.w, h = cropRect ? cropRect.h : imgRect.h,
            ctx = R.util.RenderUtil.getTempContext(contextType, w, h);

        ctx.drawImage(imgRect, image);

        // Return the image data from the temp context
        return ctx.getDataURL("image/png");
    },

    /**
     * Extract the image data from the provided image.  The image can either be an HTML &lt;img&gt; element,
     * or it can be another render context.  This method currently only works with the canvas context.
     * @param image {Object} Image or context
     * @param [cropRect] {R.math.Rectangle2D} A rectangle to crop to, or <code>null</code> to use the entire image
     * @param [contextType] {R.rendercontexts.RenderContext2D} Optional render context class, or <code>null</code> to
     *     assume a canvas context.
     * @return {Object} Image data object with "width", "height", and an Array of each pixel, represented as
     *     RGBA data where each element is represented by an integer 0-255.
     */
    extractImageData:function (image, cropRect, contextType) {
        contextType = contextType || R.rendercontexts.CanvasContext;
        var img = $(image), w = img.attr("width"), h = img.attr("height");
        var imgRect = R.math.Rectangle2D.create(0, 0, w, h);

        // Get the temporary context
        var ctx = R.util.RenderUtil.getTempContext(contextType, w, h);
        ctx.drawImage(imgRect, image);

        // Return the image data from the temp context
        return ctx.getImage(cropRect);
    },

    blurCtx:null,

    /**
     * Blur the contents of the <tt>renderContext</tt> using the number of passes specified.
     * The blur operation is fairly quick and is an approximation of a blur, not an actual
     * blur filter.  However, this method is slow and shouldn't be called per frame due to
     * passing the render context on the stack.
     *
     * @param renderContext {R.rendercontexts.RenderContext2D} The context to blur
     * @param [passes] {Number} Optional number of passes to apply (default: 1)
     */
    blur:function (renderContext, passes) {
        var i, x, y, rect = R.math.Rectangle2D.create(renderContext.getViewport()),
            ctx = R.util.RenderUtil.getTempContext(renderContext.constructor,
                renderContext.getViewport().w,
                renderContext.getViewport().h);

        // Extract the context's current image
        ctx.drawImage(rect, renderContext.getSurface());

        // Run the blur
        passes = passes || 1;
        renderContext.get2DContext().globalAlpha = 0.125;
        for (i = 1; i <= passes; i++) {
            for (y = -1; y < 2; y++) {
                for (x = -1; x < 2; x++) {
                    rect.x = x;
                    rect.y = y;
                    renderContext.drawImage(rect, ctx.getSurface());
                }
            }
        }
        renderContext.get2DContext().globalAlpha = 1.0;
    },

    /**
     * Get a mask for the provided image.  The mask is a simple pixel, no-pixel image which
     * exactly mimics the provided image.
     *
     * @param image {Object} Image or context
     * @param [cropRect] {R.math.Rectangle2D} A rectangle to crop to, or <code>null</code> to use the entire image
     * @param [contextType] {R.rendercontexts.RenderContext2D} Optional render context class, or <code>null</code> to
     *     assume a canvas context.
     * @return {String} A data URL for the image mask
     */
    getMaskImage:function (image, cropRect, contextType) {
        var imgData = R.util.RenderUtil.extractImageData(image, cropRect, contextType);

        // Modify the image data so each pixel is either fully on or off
        for (var pix = 0; pix < imgData.data.length; pix += 4) {
            if (imgData.data[pix + 3] != 0) {
                imgData.data[pix] = 255;
                imgData.data[pix + 1] = 255;
                imgData.data[pix + 2] = 255;
                imgData.data[pix + 3] = 255;
            } else {
                imgData.data[pix] = 0;
                imgData.data[pix + 1] = 0;
                imgData.data[pix + 2] = 0;
                imgData.data[pix + 3] = 0;
            }
        }

        // Recreate the temp context and draw the new image so we can extract the data URL
        var img = $(image), w = img.attr("width"), h = img.attr("height");
        var imgRect = R.math.Rectangle2D.create(0, 0, w, h);

        // Get the temporary context
        var ctx = R.util.RenderUtil.getTempContext(contextType, w, h);
        ctx.putImage(imgData, R.math.Point2D.ZERO);

        // Extract the data URL
        return ctx.getDataURL("image/png");
    },

    isWhite: function (color) {
        color = color.toLowerCase();
        return color == "#fff" || color == "#ffffff" || color == "white";
    },

    isBlack: function (color) {
        color = color.toLowerCase();
        return color == "#000" || color == "#000000" || color == "black";
    }

};