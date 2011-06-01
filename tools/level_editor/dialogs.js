
// Extend LevelEditor with dialog methods
LevelEditor.extend({

   //=====================================================================================================
   // DIALOGS

   /**
    * Show the script editor dialog
    * @param obj {Object2D} The object being edited
    * @param propName {String} The property of the object where the script is saved
    * @param script {String} The initial value
    * @private
    */
   showScriptDialog: function(obj, propName, script) {
      script = script || "";
      $("#scriptVal").val(script);
      $("#ScriptDialog").dialog("option", {
         "_REObjectId": obj.getId(),
         "_REPropName": propName
      }).dialog("open");
   },

   /**
    * Show the actor config dialog
    * @private
    */
   showActorConfig: function() {
      // Get the currently selected object
      var obj = LevelEditor.currentSelectedObject;

      // Is this a SpriteActor?
      if (!(obj instanceof R.objects.SpriteActor)) {
         return;
      }

      // Get the config object
      var cfg = obj.getConfig();

      // Build the UI for the entries
      var fs = $("#ActorConfigDialog form fieldset.optional");
      for (var cName in cfg) {
         // Depending on the type, this is either a text or textarea input
         var el, name = cName + ":", val;
         switch (cfg[cName]) {
            case "var":
               val = obj.getVariable(cName);
               el = $("<input type='text' size='20' name='" + cName + "' value='" + val + "'/>");
               break;
            case "script":
               val = obj.getActorEvent(cName);
               val = val && val.script ? val.script : "";
               name += "</br>";
               el = $("<textarea cols='68' rows='3' name='" + cName + "'>").text(val);
               break;
         }

         fs.append($("<span class='label'>").html(name)).append(el).append("<br/>");
      }

      $("#ActorConfigDialog").dialog("option", { "_REObjectId": obj.getId() }).dialog("open");
   },

   /**
    * Save the script onto the object, for the given property
    * @param objId {String} The object's Id
    * @param propName {String} The name of the property being modified
    * @param script {String} The script
    * @private
    */
   saveScript: function(objId, propName, script) {
      var obj = LevelEditor.getObjectById(objId);
      LevelEditor.storePropertyValue(obj, propName, script);
   },

   /**
    * Save the actor configuration
    * @param objId {String} The object's Id
    * @private
    */
   saveActorConfig: function(objId, cfgForm) {
      var obj = LevelEditor.getObjectById(objId);

      // Store the values
      obj.setActorId($("#ac_id", cfgForm).val());
      obj.setCollisionMask($("#ac_bitmask", cfgForm).val());

      $("fieldset.optional textarea", cfgForm).each(function() {
         var fld = $(this);
         if (fld.val() != "") {
            obj.setActorEvent(fld.attr("name"), fld.val());
         }
      });
   }
});

