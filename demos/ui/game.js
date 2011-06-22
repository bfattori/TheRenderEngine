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
      "R.text.TextRenderer",
      "R.text.ContextText",
      "R.math.Math2D",

      "R.ui.LabelControl",
      "R.ui.TextInputControl",
      "R.ui.ButtonControl",
      "R.ui.CheckboxControl",
      "R.ui.RadioControl",
      "R.ui.FieldGroup"
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

/*
         this.renderContext.jQ().css({
            position: "absolute",
            left: (R.Engine.getDefaultContext().jQ().width() - this.renderContext.jQ().width()) / 2,
            border: "1px solid gray",
            zIndex: 20
         });
*/

         // Draw the form controls
         this.drawForm();
      },

      drawForm: function() {
         var fg = R.ui.FieldGroup.create();
         fg.setPosition(5, 5);
         fg.addClass("form");
         this.renderContext.add(fg);

         // Add some text input controls
         var input = R.ui.TextInputControl.create(20, 30);
         input.setPosition(105, 10);
         fg.addControl(input);
         input.setText("Some text");

         var label = R.ui.LabelControl.create("Type something:");
         label.setPosition(10, 10);
         label.linkTo(input);
         fg.addControl(label);

         var input2 = R.ui.TextInputControl.create(20, 30);
         input2.addClass("bigger");
         input2.setPosition(105, 40);
         fg.addControl(input2);
         input2.setText("More text");

         label = R.ui.LabelControl.create("Type more:");
         label.setPosition(40, 40);
         label.linkTo(input2);
         fg.addControl(label);

         var input3 = R.ui.TextInputControl.create(15, 15);
         input3.addClass("biggerAgain");
         input3.setPosition(105, 90);
         input3.setPassword(true);
         fg.addControl(input3);
         input3.setText("p4ssw0rD!");

         label = R.ui.LabelControl.create("Password:");
         label.setPosition(40, 90);
         label.linkTo(input3);
         fg.addControl(label);

         // Add a check box control
         var checkbox = R.ui.CheckboxControl.create(true);
         checkbox.setPosition(105, 130);
         fg.addControl(checkbox);

         label = R.ui.LabelControl.create("Is this cool?");
         label.setPosition(30, 130);
         label.linkTo(checkbox);
         fg.addControl(label);

         // Add a radio group
         var radio1 = R.ui.RadioControl.create("group1", "me", true);
         radio1.setPosition(10,160);
         fg.addControl(radio1);

         label = R.ui.LabelControl.create("Me");
         label.setPosition(30, 160);
         fg.addControl(label);

         var radio2 = R.ui.RadioControl.create("group1", "you");
         radio2.setPosition(70,160);
         fg.addControl(radio2);

         label = R.ui.LabelControl.create("You");
         label.setPosition(90, 160);
         fg.addControl(label);

         var radio3 = R.ui.RadioControl.create("group1", "them");
         radio3.setPosition(140,160);
         fg.addControl(radio3);

         label = R.ui.LabelControl.create("Them");
         label.setPosition(160, 160);
         fg.addControl(label);

         // Add a button so we can alert the values
         var button = R.ui.ButtonControl.create("Click Me");
         button.setPosition(10, 200);
         button.addEvent(this, "mouseover", function() {
            this.addClass("mouseover");
         });
         button.addEvent(this, "mouseout", function() {
            this.removeClass("mouseover");
         });
         fg.addControl(button);

         // When the button is clicked, show the values
         button.addEvent(this, "click", function() {
            alert("input 1: " + input.getText() + "\ninput 2: " + input2.getText() + "\npassword: " + input3.getText() +
               "\ncool: " + checkbox.isChecked() + "\nwho: " + radio1.getGroupValue());

            R.debug.Console.debug(R.ui.FieldGroup.serialize(fg));
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
