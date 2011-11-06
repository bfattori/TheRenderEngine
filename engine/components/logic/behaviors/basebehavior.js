/**
 * The Render Engine
 * BaseBehavior
 *
 * @fileoverview The base for all behaviors.
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
 * THE SOFTWARE
 */

// Load all required engine components
R.Engine.define({
   "class": "R.components.logic.behaviors.BaseBehavior",
   "requires": [
      "R.components.Logic"
   ]
});

/**
 * @class The base behavior component.
 * @extends R.components.Logic
 * @constructor
 */
R.components.logic.behaviors.BaseBehavior = function() {
   return R.components.Logic.extend(/** @scope R.components.logic.behaviors.BaseBehavior.prototype */{

      transformComponent: null,

      /** @private */
      constructor: function(name) {
         this.base(name);
      },

      reset: function() {
         this.transformComponent = null;
         this.base();
      },

      /**
       * Sets the transformation component which contains this behavior.
       * @param component {R.components.transform.BehaviorMover2D} The behavior mover component
       */
      setTransformComponent: function(component) {
         this.transformComponent = component;
      },

      /**
       * Gets the transformation component which contains this behavior.
       * @return {R.components.transform.BehaviorMover2D}
       */
      getTransformComponent: function() {
         return this.transformComponent;
      }

   }, /** @scope R.components.logic.behaviors.BaseBehavior.prototype */{
      getClassName: function() {
         return "R.components.logic.behaviors.BaseBehavior";
      }
   });
};
