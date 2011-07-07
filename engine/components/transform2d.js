/**
 * The Render Engine
 * Transform2DComponent
 *
 * @fileoverview The base 2d transformation component.
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
	"class": "R.components.Transform2D",
	"requires": [
		"R.components.Base",
		"R.math.Math2D",
		"R.math.Point2D",
		"R.math.Vector2D"
	]
});

/**
 * @class A simple component that maintains position, rotation, and scale.
 *
 * @param name {String} The name of the component
 * @param [priority=1.0] {Number} The priority of the component
 * @extends R.components.Base
 * @constructor
 * @description Create a 2d transformation component
 */
R.components.Transform2D = function() {
	return R.components.Base.extend(/** @scope R.components.Transform2D.prototype */{

   position: null,
   rotation: 0,
   scale: null,
   lastPosition: null,
   lastRenderPosition: null,
	worldPos: null,
	
	/* pragma:DEBUG_START */
	_up: null,
	_left: null,
   /* pragma:DEBUG_END */

   /**
    * @private
    */
   constructor: function(name, priority) {
      this.base(name, R.components.Base.TYPE_TRANSFORM, priority || 1.0);
      this.position = R.math.Point2D.create(0,0);
		this.worldPos = R.math.Point2D.create(0,0);
      this.lastPosition = R.math.Point2D.create(0,0);
      this.lastRenderPosition = R.math.Point2D.create(0,0);
      this.rotation = 0;
      this.scale = R.math.Vector2D.create(1, 1);

		/* pragma:DEBUG_START */
		this._up = R.math.Vector2D.create(R.math.Vector2D.UP).mul(10);
		this._left = R.math.Vector2D.create(R.math.Vector2D.LEFT).mul(10);
		/* pragma:DEBUG_END */

   },
	
	/**
	 * Destroy the component instance
	 */
	destroy: function() {
		this.position.destroy();
		this.worldPos.destroy();
		this.lastPosition.destroy();
		this.lastRenderPosition.destroy();

		/* pragma:DEBUG_START */
		this._up.destroy();
		this._left.destroy();
		/* pragma:DEBUG_END */

		this.base();
	},

   /**
    * Releases the component back into the object pool. See {@link PooledObject#release} for
    * more information.
    */
   release: function() {
      this.base();
      this.position = null;
      this.rotation = 0;
      this.scale = null;
      this.lastPosition = null;
      this.lastRenderPosition = null;
		this.worldPos = null;
   },

   /**
    * Set the position of the transform.
    *
    * @param point {Number|R.math.Point2D} The X coordinate, or the position
    * @param [y] {Number} If <tt>point</tt> was a number, this is the Y coordinate
    */
   setPosition: function(point, y) {
      this.setLastPosition(this.getPosition());
      this.position.set(point, y);
		this.getGameObject().markDirty();
   },

   /**
    * Returns the position of the transformation relative to the world.
    * @return {R.math.Point2D}
    */
   getPosition: function() {
      return this.position;
   },

   /**
    * Returns the position of the transformation relative to the viewport.  If the world is
    * comprised of multiple viewports (wide and/or tall) the render position
    * is relative to the current viewport's position.
    * @return {R.math.Point2D}
    */
   getRenderPosition: function() {
		this.worldPos.set(this.getPosition());
		this.worldPos.sub(this.getGameObject().getRenderContext().getPosition());
      return this.worldPos;
   },

   /**
    * Set the last position that the transformation was at.
    *
    * @param point {Number|R.math.Point2D} The last X coordinate, or last position
    * @param [y] {Number} If <code>point</code> was a number, this is the Y coordinate
    */
   setLastPosition: function(point, y) {
      this.lastPosition.set(point, y);
   },

   /**
    * Get the last position of the transformation relative to the world.
    * @return {R.math.Point2D}
    */
   getLastPosition: function() {
      return this.lastPosition;
   },

   /**
    * Get the last position of the transformation relative to the viewport.
    * @return {R.math.Point2D}
    */
   getLastRenderPosition: function() {
      return this.lastRenderPosition;
   },

   /**
    * Set the rotation of the transformation.
    *
    * @param rotation {Number} The rotation
    */
   setRotation: function(rotation) {
      this.rotation = rotation;
		this.getGameObject().markDirty();
   },

   /**
    * Get the rotation of the transformation.
    * @return {Number}
    */
   getRotation: function() {
      return this.rotation;
   },

   /**
    * Get the rotation of the transformation relative to the viewport.
    * @return {Number}
    */
   getRenderRotation: function() {
      var wR = this.getGameObject().getRenderContext().getWorldRotation();
      return wR + this.getRotation();
   },

   /**
    * Set the scale of the transform.  You can apply a uniform scale by
    * assigning only the first argument a value.  To use a non-uniform scale,
    * use both the X and Y arguments.
    *
    * @param scaleX {Number} The scale of the transformation along the X-axis with 1.0 being 100%
    * @param [scaleY] {Number} The scale of the transformation along the Y-axis. If provided, a 
    *			non-uniform scale can be achieved by using a number which differs from the X-axis.
    */
   setScale: function(scaleX, scaleY) {
   	scaleX = scaleX || 1.0;
      this.scale.set(scaleX, scaleY || scaleX);
		this.getGameObject().markDirty();
   },

   /**
    * Get the uniform scale of the transformation.
    * @return {Number}
    */
   getScale: function() {
      return this.scale;
   },

	/**
	 * Get the non-uniform scale along the X-axis of the transformation.
	 * @return {Number}
	 */
	getScaleX: function() {
		return this.scale.x;
	},
	
	/**
	 * Get the non-uniform scale along the Y-axis of the transformation.
	 * @return {Number}
	 */
	getScaleY: function() {
		return this.scale.y;
	},

   /**
    * Get the uniform scale of the transformation relative to the viewport.
    * @return {Number}
    */
   getRenderScale: function() {
//    var wS = this.getGameObject().getRenderContext().getWorldScale();
//      return wS * this.scale;
      return this.scale;
   },

   /**
    * Get the uniform scale of the transformation relative to the viewport along the X-axis.
    * @return {Number}
    */
   getRenderScaleX: function() {
//    var wS = this.getGameObject().getRenderContext().getWorldScale();
//      return wS * this.scale;
      return this.scale.x;
   },

   /**
    * Get the uniform scale of the transformation relative to the viewport along the Y-axis.
    * @return {Number}
    */
   getRenderScaleY: function() {
//    var wS = this.getGameObject().getRenderContext().getWorldScale();
//      return wS * this.scale;
      return this.scale.y;
   },

   /**
    * Set the components of a transformation: position, rotation,
    * and scale, within the rendering context.
    *
    * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
    * @param time {Number} The engine time in milliseconds
    * @param dt {Number} The delta between the world time and the last time the world was updated
    *          in milliseconds.
    */
   execute: function(renderContext, time, dt) {
      renderContext.setPosition(this.getPosition());
      renderContext.setRotation(this.getRotation());
      renderContext.setScale(this.getScaleX(), this.getScaleY());

      /* pragma:DEBUG_START */
      // Debug the origin
      if (R.Engine.getDebugMode())
      {
			renderContext.setLineWidth(1);
         renderContext.setLineStyle("#f00");
         renderContext.drawLine(R.math.Point2D.ZERO, this._up);
         renderContext.setLineStyle("#08f");
         renderContext.drawLine(R.math.Point2D.ZERO, this._left);
      }
      /* pragma:DEBUG_END */
   }
   
}, /** @scope R.components.Transform2D.prototype */{
   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.Transform2D"
    */
   getClassName: function() {
      return "R.components.Transform2D";
   }
});
}