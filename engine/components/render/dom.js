/**
 * The Render Engine
 * DOMRenderComponent
 *
 * @fileoverview DOM element render component.
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
   "class": "R.components.render.DOM",
   "requires": [
      "R.components.Render"
   ]
});

/**
 * @class Render component for DOM elements.  This component will ensure that
 *        the DOM CSS transformations are applied to the game object for each frame.
 *
 * @param name {String} The name of the component
 * @param priority {Number} The priority of the component between 0.0 and 1.0
 * @constructor
 * @extends R.components.Render
 * @description Creates a DOM element render component.
 */
R.components.render.DOM = function() {
   return R.components.Render.extend(/** @scope R.components.render.DOM.prototype */{

      scenery: false,
      doRefresh: false,
      originGlyph: null,

      constructor: function(name, scenery) {
         this.base(name);
         this.scenery = scenery || false;
         this.doRefresh = true;

         if (R.Engine.getDebugMode()) {
            this.originGlyph = $("<div style='z-index: 5000; position: absolute; width: 10px; height: 10px; background: red'></div>");
            $("body", document).append(this.originGlyph);
         }
      },

      destroy: function() {
         this.base();
         if (R.Engine.getDebugMode()) {
            this.originGlyph.remove();
         }
      },

      reset: function() {
         this.scenery = false;
         this.doRefresh = true;
         this.base();
      },

      refresh: function() {
         this.doRefresh = true;
      },

      /**
       * Handles whether or not the component should draw to the
       * render context.
       *
       * @param renderContext {R.rendercontexts.HTMLElementContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       * @param dt {Number} The delta between the world time and the last time the world was updated
       *          in milliseconds.
       */
      execute: function(renderContext, time, dt) {
         // Due to this being a render component, it won't update if the object goes off-screen
         // by default.  So, we need to make sure it continues to update regardless
         this.base(renderContext, time, dt);

         if (this.doRefresh || !this.scenery) {
            renderContext.drawElement(this.getGameObject());
            this.doRefresh = !this.scenery;
         }

         if (R.Engine.getDebugMode()) {
            // Draw a dot where the origin is located
            var p = R.math.Point2D.create(5,5),
                pt = R.clone(this.getGameObject().getPosition()).add(this.getGameObject().getOrigin()).sub(p);
            renderContext.drawElement(null, this.originGlyph, pt);
            pt.destroy();
            p.destroy();
         }
      }

   }, /** @scope R.components.render.DOM.prototype */{

      /**
       * Get the class name of this object
       *
       * @return {String} "R.components.render.DOM"
       */
      getClassName: function() {
         return "R.components.render.DOM";
      }
   });
}