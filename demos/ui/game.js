/**
 * The Render Engine
 * Test: Font Rendering
 *
 * Tests of the available font renderers.
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

// Load all required engine components
R.Engine.define({
	"class": "UITest",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.ui.TextInputControl",
      "R.ui.ButtonControl",
      "R.math.Math2D"
	]
});

/**
 * @class User Interface testing demo.
 */
var UITest = function() {
   return R.engine.Game.extend({
   
      constructor: null,
      
      // The rendering context
      renderContext: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         this.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 500, 300);
	      this.renderContext.setBackgroundColor("#333333");
         R.Engine.getDefaultContext().add(this.renderContext);

         // Add the text input control
         var input = R.ui.TextInputControl.create(20, 30);
         input.setPosition(10, 10);
         this.renderContext.add(input);

         var input2 = R.ui.TextInputControl.create(20, 30);
         input2.addClass("bigger");
         input2.setPosition(10, 40);
         this.renderContext.add(input2);

         var input3 = R.ui.TextInputControl.create(20, 30);
         input3.addClass("biggerAgain");
         input3.setPosition(10, 90);
         input3.setPassword(true);
         this.renderContext.add(input3);

         var button = R.ui.ButtonControl.create("Click Me");
         button.setPosition(10, 140);
         this.renderContext.add(button);

         button.addEvent(this, "click", function() {
            alert("input: " + input.getText() + "\ninput2: " + input2.getText() + "\ninput3: " + input3.getText());
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         this.renderContext.destroy();
      },

      /**
       * Return a reference to the render context
       */
      getRenderContext: function(){
         return this.renderContext;
      },
      
      /**
       * Return a reference to the playfield box
       */
      getFieldBox: function() {
         return this.fieldBox;
      }
      
   });
};
