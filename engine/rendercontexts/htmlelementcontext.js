/**
 * The Render Engine
 * HTMLElementContext
 *
 * @fileoverview A render context which wraps a specified HTML node.
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
	"class": "R.rendercontexts.HTMLElementContext",
	"requires": [
		"R.rendercontexts.RenderContext2D",
		"R.math.Math2D"
	]
});

/**
 * @class A wrapper for any HTML element to convert it into a targetable render context.
 *        The {@link R.rendercontexts.DocumentContext} and {@link R.rendercontexts.HTMLDivContext} use this as their base
 *        class.
 *
 * @extends R.rendercontexts.RenderContext2D
 * @constructor
 * @description Create an instance of an HTML element rendering context.  This context
 * represents any HTML element.
 * @param name {String} The name of the context
 * @param element {Number} The element which is the surface of the context.
 */
R.rendercontexts.HTMLElementContext = function(){
	return R.rendercontexts.RenderContext2D.extend(/** @scope R.rendercontexts.HTMLElementContext.prototype */{
	
		transformStack: null,
		cursorPos: null,
		jQObj: null,
		hasTxfm: false,
      has3dTxfm: false,
		txfmBrowser: null,
		txfmOrigin: null,
		txfm: null,
		
		tmpP1: null,
		tmpP2: null,
		tmpP3: null,
		
		/** @private */
		constructor: function(name, element){
			this.base(name || "HTMLElementContext", element);
			element.id = this.getId();
			this.cursorPos = R.math.Point2D.create(0, 0);
			this.txfm = [];
			this.transformStack = [];
			this.pushTransform();
			this.jQObj = null;
			this.setViewport(R.math.Rectangle2D.create(0, 0, this.jQ().width(), this.jQ().height()));
			this.checkTransformSupport();
			
			// Temporary points to use in calculations
			this.tmpP1 = R.math.Point2D.create(0,0);
			this.tmpP2 = R.math.Point2D.create(0,0);
			this.tmpP3 = R.math.Point2D.create(0,0);
		},
		
		/**
		 * Destroy the context and any objects within the context.
		 */
		destroy: function(){
		
			// If the objects in the context are elements in
			// the DOM, remove them from the DOM
			var objs = this.getObjects();
			for (var o in objs) {
				var e = objs[o].getElement();
				if (e && e.nodeName && e != document.body) {
				
					this.getSurface().removeChild(e);
				}
			}
			this.cursorPos.destroy();
			this.getViewport().destroy();
			this.txfm = null;

			this.tmpP1.destroy();
			this.tmpP2.destroy();
			this.tmpP3.destroy();

			this.base();
		},
		
		/**
		 * Check the browser and version to see if it supports transformations.
		 * @private
		 */
		checkTransformSupport: function(){
			var version = parseFloat(R.engine.Support.sysInfo().version);
			switch (R.engine.Support.sysInfo().browser) {
				case "safari":
            case "safarimobile":
					if (version >= 3) {
						// Support for webkit transforms
						this.hasTxfm = true;
                  this.has3dTxfm = true;
						this.txfmBrowser = "-webkit-transform";
						this.txfmOrigin = "-webkit-transform-origin";
					}
					break;
				case "chrome":
					// Support for webkit transforms
					this.hasTxfm = true;
               this.has3dTxfm = true;
					this.txfmBrowser = "-webkit-transform";
					this.txfmOrigin = "-webkit-transform-origin";
					break;
				case "firefox":
					if (version >= 3.5) {
						// Support for gecko transforms
						this.hasTxfm = true;
                  this.has3dTxfm = false;
						this.txfmBrowser = "-moz-transform";
						this.txfmOrigin = "-moz-transform-origin";
					}
					break;
				case "opera":
					if (version >= 10.5) {
						// Support for opera transforms
						this.hasTxfm = true;
                  this.has3dTxfm = false;
						this.txfmBrowser = "-o-transform";
						this.txfmOrigin = "-o-transform-origin";
					}
					break;
            case "msie":
               if (version >= 9.0) {
                  // Support for Internet Explorer transforms
                  this.hasTxfm = true;
                  this.has3dTxfm = false;
                  this.txfmBrowser = "msTransform";
                  this.txfmOrigin = "-ms-transform-origin";
               }
               break;
				default:
					this.hasTxfm = false;
               this.has3dTxfm = false;
					break;
			}
		},

		/**
		 * Add an object to the context, or creates an element to represent the object.  Objects
       * added to the <tt>HTMLElementContext</tt> need a DOM representation, otherwise one
       * will be created for the object being added.
       *
		 * @param obj {HTMLElement} The element, or <tt>null</tt>
		 */
		add: function(obj){
			if (!obj.getElement()) {
				// Create an element for the object
				obj.setElement($("<div>").css("position", "absolute"));
			}

         // Look to see if the element is already a child of the element
         // we're appending to.  This will occur when someone adds a HTMLElementContext
         // to the default context, when the element which represents the HTMLElementContext
         // already exists in the DOM.
         if (this.jQ().find(obj.getElement()).length == 0) {
			   this.jQ().append(obj.getElement());
         }

         var pos = $(obj.getElement()).position();
         obj.setObjectDataModel("DOMPosition", R.math.Point2D.create(pos.left, pos.top));

			this.base(obj);
		},
		
		/**
		 * Remove an object from the context.
		 * @param obj {HTMLElement} The object to remove
		 */
		remove: function(obj){
			if (obj.getElement()) {
				this.jQ().remove(obj.getElement());
			}
			this.base(obj);
		},
		
		/**
		 * Serializes the current transformation state to an object.
		 * @return {Object}
		 * @private
		 */
		serializeTransform: function(){
			return {
				pos: R.clone(this.cursorPos),
				txfm: this.txfm,
				stroke: this.getLineStyle(),
				sWidth: this.getLineWidth(),
				fill: this.getFillStyle()
			};
		},
		
		/**
		 * Deserializes a transformation state from an object.
		 * @param transform {Object} The object which contains the current transformation
		 * @private
		 */
		deserializeTransform: function(transform){
			this.txfm = transform.txfm;
			this.cursorPos.set(transform.pos);
         transform.pos.destroy();
			this.setLineStyle(transform.stroke);
			this.setLineWidth(transform.sWidth);
			this.setFillStyle(transform.fill);
		},
		
		/**
		 * Push a transform state onto the stack.
		 */
		pushTransform: function(){
			this.base();
			this.transformStack.push(this.serializeTransform());
		},
		
		/**
		 * Pop a transform state off the stack.
		 */
		popTransform: function(){
			this.base();
			this.deserializeTransform(this.transformStack.pop());
		},
		
		//================================================================
		// Drawing functions
		
		/**
		 * Set the background color of the context.
		 *
		 * @param color {String} An HTML color
		 */
		setBackgroundColor: function(color){
			this.base(color);
			this.jQ().css("background-color", color);
		},
		
		/**
		 * Set the current transform position (translation).
		 *
		 * @param point {R.math.Point2D} The translation
		 */
		setPosition: function(point){
			this.cursorPos.add(point);
			if (this.hasTxfm) {
				this.txfm[0] = "translate(" + this.cursorPos.x + "px," + this.cursorPos.y + "px)";
			}
			this.base(this.cursorPos);
		},
		
		/**
		 * Set the rotation angle of the current transform
		 *
		 * @param angle {Number} An angle in degrees
		 */
		setRotation: function(angle){
			if (this.hasTxfm) {
            angle = Math.floor(angle % 360);
				this.txfm[1] = "rotate(" + angle + "deg)";
			}
			this.base(angle);
		},
		
		/**
		 * Set the scale of the current transform.  Specifying
		 * only the first parameter implies a uniform scale.
		 *
		 * @param scaleX {Number} The X scaling factor, with 1 being 100%
		 * @param scaleY {Number} The Y scaling factor
		 */
		setScale: function(scaleX, scaleY){
			scaleX = scaleX || 1;
			scaleY = scaleY || scaleX;
			if (this.hasTxfm) {
				this.txfm[2] = "scale(" + scaleX + "," + scaleY + ")";
			}
			this.base(scaleX, scaleY);
		},
		
		/**
		 * Set the width of the context drawing area.
		 *
		 * @param width {Number} The width in pixels
		 */
		setWidth: function(width){
			this.base(width);
			this.jQ().width(width);
		},
		
		/**
		 * Set the height of the context drawing area
		 *
		 * @param height {Number} The height in pixels
		 */
		setHeight: function(height){
			this.base(height);
			this.jQ().height(height);
		},
		
		/**
		 * Merge in the CSS transformations object, if the browser supports it.
		 * @param css {Object} CSS properties to merge with
		 * @return {Object}
		 * @private
		 */
		_mergeTransform: function(ref, css){
			if (this.hasTxfm && this.txfm[0]) {
				css[this.txfmBrowser] = this.txfm[0] + " " +
				(ref && ref.getRotation() != 0 ? this.txfm[1] + " " : "") +
				(ref && ref.getScale().len() != 1 ? this.txfm[2] : "");
			}
			else {
				css.top = css.top || this.cursorPos.y;
				css.left = css.left || this.cursorPos.x;
			}
			
			return css;
		},

      /**
       * Create an element and append it to the render context
       * @param element {String} Element type
       * @return {jQuery}
       * @private
       */
      _createElement: function(element) {
         var e = $(element).css({
            position: "absolute",
            display: "block",
            left: 0,
            top: 0
         });
         this.jQ().append(e);
         return e;
      },

		/**
		 * Draw an un-filled rectangle on the context.  Unless <tt>ref</tt> is provided, a div element
       * will be added to the render context.
		 *
		 * @param rect {R.math.Rectangle2D} The rectangle to draw
		 * @param ref {R.engine.GameObject} A reference game object
       * @return {HTMLElement} The element added to the DOM
		 */
		drawRectangle: function(rect, ref){
			var rD = rect.getDims(),
               obj = ref && ref.jQ() ? ref.jQ() : this._createElement("<div>");

			obj.css(this._mergeTransform(ref, {
				borderWidth: this.getLineWidth(),
				borderColor: this.getLineStyle(),
				left: rD.l,
				top: rD.t,
				width: rD.w,
				height: rD.h,
				position: "absolute"
			}));

         return obj;
		},
		
		/**
		 * Draw a filled rectangle on the context.  Unless <tt>ref</tt> is provided, a div element
       * will be added to the render context.
		 *
		 * @param rect {R.math.Rectangle2D} The rectangle to draw
       * @param ref {R.engine.GameObject} A reference game object
       * @return {HTMLElement} The element added to the DOM
		 */
		drawFilledRectangle: function(rect, ref){
			var rD = rect.getDims(),
               obj = ref && ref.jQ() ? ref.jQ() : this._createElement("<div>");

			obj.css(this._mergeTransform(ref, {
				borderWidth: this.getLineWidth(),
				borderColor: this.getLineStyle(),
				backgroundColor: this.getFillStyle(),
				left: rD.l,
				top: rD.t,
				width: rD.w,
				height: rD.h,
				position: "absolute"
			}));

         return obj;
		},
		
		/**
		 * Draw a point on the context.  Unless <tt>ref</tt> is provided, a new image
       * will be added to the render context.
		 *
		 * @param point {R.math.Point2D} The position to draw the point
       * @param ref {R.engine.GameObject} A reference game object
       * @return {HTMLElement} The element added to the DOM
		 */
		drawPoint: function(point, ref){
			return this.drawFilledRectangle(R.math.Rectangle2D.create(point.x, point.y, 1, 1), ref);
		},
		
		/**
		 * Draw a sprite on the context.  Unless <tt>ref</tt> is provided, a new image
       * will be added to the render context.
		 *
		 * @param sprite {R.resources.types.Sprite} The sprite to draw
		 * @param time {Number} The current world time
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
		 * @param ref {R.math.HostObject} A reference game object
       * @return {HTMLElement} The element added to the DOM
		 */
		drawSprite: function(sprite, time, dt, ref){
			var f = sprite.getFrame(time, dt);
			
			// The reference object is a host object it
			// will give us a reference to the HTML element which we can then
			// just modify the displayed image for.  If no ref was provided,
         // create a new image.
         var obj = ref && ref.jQ() ? ref.jQ() : this._createElement("<div>");

         var css = this._mergeTransform(ref, {
            width: f.w,
            height: f.h,
            backgroundPosition: -f.x + "px " + -f.y + "px",
            backgroundImage: 'url:(' + sprite.getSourceImage().src + ')'
         });
         obj.css(css);
         this.base(sprite, time, dt);
         f.destroy();

         return obj;
		},
		
		/**
		 * Draw an image on the context.  Unless <tt>ref</tt> is provided, a new image
       * will be added to the render context.
		 *
		 * @param rect {R.math.Rectangle2D} The rectangle that specifies the position and
		 *             dimensions of the image rectangle.
		 * @param image {HTMLImage} The image to draw onto the context
		 * @param [srcRect] {R.math.Rectangle2D} <i>[optional]</i> The source rectangle within the image, if
		 *                <tt>null</tt> the entire image is used
		 * @param [ref] {R.engine.GameObject} A reference game object
       * @return {HTMLElement} The element added to the DOM
		 */
		drawImage: function(rect, image, srcRect, ref){
			srcRect = (srcRect.__RECTANGLE2D ? srcRect : null);
			var sD = srcRect ? srcRect : rect;
			ref = (!srcRect.__RECTANGLE2D ? srcRect : ref);
			
			// The reference object is an object that should
			// have a reference to an HTML element which we can
			// just modify the displayed image for.
			// If no ref is provided, create a new element.
         var obj = ref && ref.jQ() ? ref.jQ() : this._createElement("<div>");

         var css = this._mergeTransform(ref, {
            backgroundImage: "url(" + image.src + ")",
            backgroundPosition: -sD.x + "px " + -sD.y + "px",
            left: rect.x,
            top: rect.y,
            width: sD.w,
            height: sD.h
         });
         obj.css(css);
         this.base(rect, image, srcRect, ref);

         return obj;
		},
		
		/**
		 * Draw text on the context.  Unless <tt>ref</tt> is provided, a span element
       * will be added to the render context.
		 *
		 * @param point {R.math.Point2D} The top-left position to draw the image.
		 * @param text {String} The text to draw
       * @param ref {R.engine.GameObject} A reference game object
       * @return {HTMLElement} The element added to the DOM
		 */
		drawText: function(point, text, ref){
			this.base(point, text);
			
			// The reference object is a host object it
			// will give us a reference to the HTML element which we can then
			// just modify the displayed text for.  If no ref was provided,
         // create a new image.
         var obj = ref && ref.jQ() ? ref.jQ() : this._createElement("<span>");

         var css = this._mergeTransform(ref, {
            font: this.getNormalizedFont(),
            color: this.getFillStyle(),
            left: point.x,
            top: point.y,
            position: "absolute"
         });
         obj.css(css).text(text);

         return obj;
		},
		
		/**
		 * Draw an element on the context.
       * @param ref {R.engine.GameObject} A reference game object
		 */
		drawElement: function(ref){
			if (ref && ref.jQ()) {
				// TODO: Can probably save cycles by checking for changes in the
				//			transformations before blindly applying them
				var css = {};
				if (this.hasTxfm && ref.getOrigin) {
					if (ref.getOrigin().isZero()) {
						css[this.txfmOrigin] = "top left";
					}
					else {
						var o = ref.getOrigin();
						css[this.txfmOrigin] = o.x + "px " + o.y + "px";
					}
				}
				css = this._mergeTransform(ref, css);
				ref.jQ().css(css);
			}
		}
		
	}, /** @scope R.rendercontexts.HTMLElementContext.prototype */ {
	
		/**
		 * Get the class name of this object
		 * @return {String} The string "R.rendercontexts.HTMLElementContext"
		 */
		getClassName: function(){
			return "R.rendercontexts.HTMLElementContext";
		}
	});
	
};
