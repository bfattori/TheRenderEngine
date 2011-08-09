R.Engine.define({
	"class": "Tutorial14",
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

      // Data Storage
      "R.storage.PersistentStorage"
	]
});

/**
 * @class Tutorial Eleven. User Interface Controls.
 */
var Tutorial14 = function() {
   return R.engine.Game.extend({
   
      // The rendering context
      renderContext: null,

      dataStore: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Create the render context
         Tutorial14.renderContext = R.rendercontexts.CanvasContext.create("Playfield", 400, 150);
	      Tutorial14.renderContext.setBackgroundColor("#333333");

         // Add the render context to the default engine context
         R.Engine.getDefaultContext().add(Tutorial14.renderContext);

         // Create a reference to the data storage.  We give it a unique name so that it won't
         // collide with other data storage objects.  Data storage has a hard limit of approximately
         // 5mb, including keys and values.
         Tutorial14.dataStore = R.storage.PersistentStorage.create("Tutorial14");

         // Create a table to store names which were previously entered.  When using SQL
         // to work with the data, you must create tables in which to store the data.
         if (!Tutorial14.dataStore.tableExists("previous_names")) {
            Tutorial14.dataStore.createTable("previous_names", ["username", "current"], ["String", "Number"]);
         }

         // Draw the form controls
         Tutorial14.drawForm();
      },

      /**
       * Add the form controls to the render context.
       */
      drawForm: function() {
         // Query the data storage for the user name which is marked as the current.  It is important
         // to specify the table names in the WHERE clause.  Also notice that the comparison operator
         // is a double-equal sign, not a single equal sign.
         var rs = this.dataStore.execSql("SELECT * FROM previous_names WHERE previous_names.current==1"),
             userName = "";

         if (rs.length > 0) {
            // If the result set contains something, we know it found one so get the "username" column
            userName = rs[0].username;
         }

         // Add an input control with label.
         var input = R.ui.TextInputControl.create(20, 30);
         input.setPosition(105, 10);
         Tutorial14.renderContext.add(input);
         input.setText(userName);
         input.setFocus(true);

         var label = R.ui.LabelControl.create("Your Name:");
         label.setPosition(10, 10);
         label.linkTo(input);
         Tutorial14.renderContext.add(label);

         // A button to save the data
         var button = R.ui.ButtonControl.create("Save");
         button.setPosition(10, 40);
         button.addEvent("mouseover", function() {
            this.addClass("mouseover");
         });
         button.addEvent("mouseout", function() {
            this.removeClass("mouseover");
         });
         Tutorial14.renderContext.add(button);

         button.addEvent("click", function() {
            // Clear the current flag.  In the SET clause, you DO NOT specify the table name, but
            // you MUST in the WHERE clause.  Again, recognize that the equality operator is a
            // double-equal sign.  If you specify a single equal sign, it will still execute the
            // statement, but the results won't be what you expect.
            Tutorial14.dataStore.execSql("UPDATE previous_names SET current=0 WHERE previous_names.current==1");

            // Query the table to see if the value has been entered before
            var result = Tutorial14.dataStore.execSql("SELECT * FROM previous_names WHERE previous_names.username=='" + input.getText() + "'");
            if (result.length > 0) {

               // We've had this name before.  Update it to make it the current one.
               Tutorial14.dataStore.execSql("UPDATE previous_names SET current=1 WHERE previous_names.username=='" + input.getText() + "'");

               // Let them know
               alert("You have entered that name before!");
            } else {
               // We've never seen this data, insert the data into the table and mark
               // it the current one.
               Tutorial14.dataStore.execSql("INSERT INTO previous_names (username, current) VALUES ('" + input.getText() + "',1)");

               // Let them know
               alert("Data Saved.  The size of the table data is now " + Tutorial14.dataStore.getTableSize("previous_names") + " bytes");
            }
         });

         // A button to view all of the data
         var button2 = R.ui.ButtonControl.create("View");
         button2.setPosition(120, 40);
         button2.addEvent("mouseover", function() {
            this.addClass("mouseover");
         });
         button2.addEvent("mouseout", function() {
            this.removeClass("mouseover");
         });
         Tutorial14.renderContext.add(button2);

         button2.addEvent("click", function() {
            // Query the table for all rows and display them with the current row marked
            var results = Tutorial14.dataStore.execSql("SELECT * FROM previous_names"),
                display = "";

            for (var r in results) {
               display += "   " + results[r].username + (results[r].current == 1 ? " [*]" : "") + "\n";
            }

            alert("All names entered so far:\n\n" + display);
         });

         // A button to clear the data
         var button3 = R.ui.ButtonControl.create("Clear");
         button3.setPosition(230, 40);
         button3.addEvent("mouseover", function() {
            this.addClass("mouseover");
         });
         button3.addEvent("mouseout", function() {
            this.removeClass("mouseover");
         });
         Tutorial14.renderContext.add(button3);

         button3.addEvent("click", function() {
            // Delete all of the data in the table
            Tutorial14.dataStore.execSql("DELETE * FROM previous_names");
            alert("All data erased.  The size of the table data is now " + Tutorial14.dataStore.getTableSize("previous_names") + " bytes");
         });
      },

      /**
       * Called when a game is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function(){
         Tutorial14.renderContext.destroy();
      }
   });
};
