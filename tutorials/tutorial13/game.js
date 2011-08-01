R.Engine.define({
	"class": "Tutorial13",
	"requires": [
		"R.engine.Game",
		"R.rendercontexts.CanvasContext",
      "R.text.TextRenderer",
      "R.text.ContextText",
      "R.math.Math2D",

      // UI controls
      "R.ui.LabelControl",
      "R.ui.TextInputControl",
      "R.ui.ButtonControl",
      "R.ui.CheckboxControl",
      "R.ui.RadioControl",
      "R.ui.FieldGroup"
	]
});

/**
 * @class User Interface Controls tutorial.
 */
var Tutorial13 = function() {
   return R.engine.Game.extend({
   
      // The rendering context
      renderContext: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         Tutorial13.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 500, 300);
	      Tutorial13.renderContext.setBackgroundColor("#333333");

         // Add the render context to the default engine context
         R.Engine.getDefaultContext().add(Tutorial13.renderContext);

/*
         this.renderContext.jQ().css({
            position: "absolute",
            left: (R.Engine.getDefaultContext().jQ().width() - this.renderContext.jQ().width()) / 2,
            border: "1px solid gray",
            zIndex: 20
         });
*/

         // Draw the form controls
         Tutorial13.drawForm();
      },

      /**
       * Add the form controls to the render context.
       */
      drawForm: function() {
         // A field group to logically and physically cluster fields together
         var fg = R.ui.FieldGroup.create();
         fg.setPosition(5, 5);
         fg.addClass("form");
         Tutorial13.renderContext.add(fg);

         // Add some text input controls with labels.  We add these to
         // the field group, rather than adding them to the render context.
         var input = R.ui.TextInputControl.create(20, 30);
         input.setPosition(105, 10);
         fg.addControl(input);
         input.setText("Some text");

         var label = R.ui.LabelControl.create("Type something:");
         label.setPosition(10, 10);
         label.linkTo(input);
         fg.addControl(label);

         // Adding a CSS defined class will apply the styles to the
         // text input control, as it would in an HTML context
         var input2 = R.ui.TextInputControl.create(20, 30);
         input2.addClass("bigger");
         input2.setPosition(105, 40);
         fg.addControl(input2);
         input2.setText("More text");

         label = R.ui.LabelControl.create("Type more:");
         label.setPosition(40, 40);
         label.linkTo(input2);
         fg.addControl(label);

         // A password field is masked so that input is not visible
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

         // Checkbox controls are simply true/false inputs
         var checkbox = R.ui.CheckboxControl.create(true);
         checkbox.setPosition(105, 130);
         fg.addControl(checkbox);

         label = R.ui.LabelControl.create("Is this cool?");
         label.setPosition(30, 130);
         label.linkTo(checkbox);
         fg.addControl(label);

         // Radio controls allow for a single selection from multiple choices
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

         // The button responds to mouse events for over and
         // out to toggle between two styles
         var button = R.ui.ButtonControl.create("Click Me");
         button.setPosition(10, 200);
         button.addEvent("mouseover", function() {
            this.addClass("mouseover");
         });
         button.addEvent("mouseout", function() {
            this.removeClass("mouseover");
         });
         fg.addControl(button);

         // When the button is clicked, show the values
         button.addEvent("click", function() {
            alert("input 1: " + input.getText() + "\ninput 2: " + input2.getText() + "\npassword: " + input3.getText() +
               "\ncool: " + checkbox.isChecked() + "\nwho: " + radio1.getGroupValue());

            // If you want to see the field group, serialized to JSON,
            // uncomment the line below.  This can be used to deserialize
            // a form from a text file.

            //R.debug.Console.debug(R.ui.FieldGroup.serialize(fg));
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         Tutorial13.renderContext.destroy();
      },

      /**
       * Return a reference to the render context
       */
      getRenderContext: function(){
         return Tutorial13.renderContext;
      }
   });
};
