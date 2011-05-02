/**
 * The Render Engine
 * RenderComponent
 *
 * @fileoverview The base render component.
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
	"class": "R.components.Render",
	"requires": [
		"R.components.Base"
	]
});

/**
 * @class The base component class for components which render
 *        to an {@link R.rendercontexts.AbstractRenderContext render context}.  Rendering 
 *			 consists of anything which alters the visual state of the render context.
 *
 * @param name {String} The name of the component
 * @param priority {Number} The priority of the component between 0.0 and 1.0
 * @constructor
 * @extends R.components.Base
 * @description Creates a render component.
 */
R.components.Render = function() {
	return R.components.Base.extend(/** @scope R.components.Render.prototype */{

   drawMode: 0,
   origin: null,
   oldDisplay: null,

   /**
    * @private
    */
   constructor: function(name, priority) {
      this.base(name, R.components.Base.TYPE_RENDERING, priority || 0.1);
      this.oldDisplay = null;
		this.origin = R.math.Point2D.create(0,0);
   },

	/**
	 * Destroy the component instance
	 */
	destroy: function() {
		this.origin.destroy();
		this.base();
	},

   /**
    * Releases the component back into the object pool. See {@link PooledObject#release}
    * for more information.
    */
   release: function() {
      this.base();
      this.drawMode = 0;
   },

   /**
    * Set the draw mode of the component.  Currently this determines
    * if the component should render itself to the context or not.
    *
    * @param drawMode {Number} One of {@link #DRAW} or
    *                 {@link #NO_DRAW}.
    */
   setDrawMode: function(drawMode) {
      this.drawMode = drawMode;
   },

   /**
    * Get the drawing mode of the component.
    * @return {Number}
    */
   getDrawMode: function() {
      return this.drawMode;
   },

	/**
	 * Adjust the local transformation to accommodate the origin.
	 * 
	 * @param renderContext {R.rendercontexts.AbstractRenderContext} The render context
	 * @param before {Boolean} <code>true</code> if the transform is occurring before rendering
	 */
	transformOrigin: function(renderContext, before) {
		if (this.getGameObject().getOrigin().isZero()) {
			return;
		}
		
		if (!this.origin.equals(this.getGameObject().getOrigin())) {
			this.origin.set(this.getGameObject().getOrigin());
		}
		
		if (before === true) {
			renderContext.pushTransform();
			renderContext.setPosition(this.origin.neg());
			this.origin.neg();
		} else {
			renderContext.popTransform();
		}
	},

   /**
    * Handles whether or not the component should draw to the
    * render context.
    *
    * @param renderContext {R.rendercontexts.AbstractRenderContext} The rendering context
    * @param time {Number} The engine time in milliseconds
    * @param dt {Number} The delta between the world time and the last time the world was updated
    *          in milliseconds.
    */
   execute: function(renderContext, time, dt) {

		if (R.Engine.options.useDirtyRectangles && !this.getGameObject().isDirty()) {
			// Objects that aren't dirty don't need to re-render
			return false;
		}

      // Check visibility
      if ((this.drawMode == R.components.Render.NO_DRAW) ||
          this.getGameObject().getWorldBox &&
          (!renderContext.getViewport().isIntersecting(this.getGameObject().getWorldBox())))
      {
         if (this.getGameObject().getElement() && !this.oldDisplay) {
            this.oldDisplay = this.getGameObject().jQ().css("display");
            this.getGameObject().jQ().css("display", "none");
         }

         return false;
      }

      if (this.getGameObject().getElement() && this.oldDisplay) {
         this.getGameObject().jQ().css("display", this.oldDisplay);
         this.oldDisplay = null;
      }

      // The object is visible
      R.Engine.vObj++;
      return true;
   }

}, /** @scope R.components.Render.prototype */{ 

   /**
    * Get the class name of this object
    *
    * @return {String} "R.components.Render"
    */
   getClassName: function() {
      return "R.components.Render";
   },

   /**
    * The component should render itself to the rendering context.
    * @type {Number}
    */
   DRAW: 0,

   /**
    * The component <i>should not</i> render itself to the rendering context.
    * @type {Number}
    */
   NO_DRAW: 1

});
}