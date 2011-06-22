/**
 * The Render Engine
 * LabelControl
 *
 * @fileoverview A label control.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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
   "class": "R.ui.LabelControl",
   "requires": [
      "R.ui.AbstractUIControl"
   ]
});

/**
 * @class UI label control.
 *
 * @constructor
 * @param text {String} The text to display for the button.
 * @param [forControl] {R.ui.AbstractUIControl} The control the label will set focus to if clicked
 * @extends R.ui.AbstractUIControl
 */
R.ui.LabelControl = function() {
   return R.ui.AbstractUIControl.extend(/** @scope R.ui.LabelControl.prototype */{

      text: null,
      forControl: false,

      /** @private */
      constructor: function(text, forControl, textRenderer) {
         this.base("Label", textRenderer);
         this.addClass("labelcontrol");
         this.text = text || "";
         this.forControl = forControl;
      },

      /**
       * Destroy the text input control, releasing its event handlers.
       */
      destroy: function() {
         this.base();
      },

      /**
       * Releases the object back into the object pool.  See {@link R.engine.PooledObject#release}
       * for more information.
       */
      release: function() {
         this.base();
         this.text = "";
         this.forControl = null;
      },

      /**
       * Set the text of this label control.
       * @param text {String} Text
       */
      setText: function(text) {
         this.text = text;
      },

      /**
       * Get the text of this label control.
       * @return {String}
       */
      getText: function() {
         return this.text;
      },

      /**
       * Link the label to a UI control.  When the label is clicked, the UI control will
       * receive focus.
       * @param uiControl {R.ui.AbstractUIControl} The control to link to
       */
      linkTo: function(uiControl) {
         Assert(uiControl == null || uiControl instanceof R.ui.AbstractUIControl, "Labels can only be linked to UI controls");
         this.forControl = uiControl;
      },

      /**
       * Get the UI control this label is linked to.
       * @return {R.ui.AbstractUIControl} The UI control, or <code>null</code>
       */
      getLinkTo: function() {
         return this.forControl;
      },

      /**
       * Called when a mouse button is pressed, then released on the control.  Triggers the
       * "click" event, passing the <code>R.struct.MouseInfo</code> structure.
       *
       * @param mouseInfo {R.struct.MouseInfo} The mouse info structure
       */
      click: function(mouseInfo) {
         this.base(mouseInfo);
         if (this.forControl != null) {
            this.forControl.click(mouseInfo);
         }
      },

      /**
       * Draw the input component within the
       * @param renderContext {R.rendercontexts.RenderContext2D} The render context where the control is
       *    drawn.
       * @param worldTime {Number} The current world time, in milliseconds
       * @param dt {Number} The time since the last frame was drawn by the engine, in milliseconds
       */
      drawControl: function(renderContext, worldTime, dt) {
         this.getTextRenderer().setText(this.text);
         
         // Draw the current label text.  The text baseline is the bottom of the font,
         // so we need to move that down by the height of the control (with some padding to look right)
         renderContext.pushTransform();
         var pt = R.math.Point2D.create(0,this.calcHeight() - 2);
         renderContext.setPosition(pt);
         this.getTextRenderer().update(renderContext, worldTime, dt);
         pt.destroy();
         renderContext.popTransform();
      },

      /**
       * Returns a bean which represents the read or read/write properties
       * of the object.
       *
       * @return {Object} The properties object
       */
      getProperties: function(){
         var self = this;
         var prop = this.base(self);
         return $.extend(prop, {
            "Text": [function() {
               return self.getText();
            }, function(i) {
               self.setText(i);
            }, true],
            "ForControl": [function() {
               return self.getLinkTo() != null ? self.getLinkTo().getControlName() : "";
            }, function(i) {
               // TODO: need to figure out how to do this...
               //self.linkTo(i);
            }, true]
         });
      }

   }, /** @scope R.ui.LabelControl.prototype */{

      /**
       * Get the class name of this object
       * @return {String} The string "R.ui.LabelControl"
       */
      getClassName: function() {
         return "R.ui.LabelControl";
      },

      /**
       * Get a properties object with values for the given object.
       * @param obj {R.ui.LabelControl} The label control to query
       * @param [defaults] {Object} Default values that don't need to be serialized unless
       *    they are different.
       * @return {Object}
       */
      serialize: function(obj, defaults) {
         // Defaults for object properties which can be skipped if no different
         defaults = defaults || [];
         $.extend(defaults, {
            "ForControl":""
         });
         return R.ui.AbstractUIControl.serialize(obj, defaults);
      },

      /**
       * Deserialize the object back into a label control.
       * @param obj {Object} The object to deserialize
       * @param [clazz] {Class} The object class to populate
       * @return {R.ui.LabelControl} The object which was deserialized
       */
      deserialize: function(obj, clazz) {
         clazz = clazz || R.ui.LabelControl.create();
         R.ui.AbstractUIControl.deserialize(obj, clazz);
         return clazz;
      }
   });

};