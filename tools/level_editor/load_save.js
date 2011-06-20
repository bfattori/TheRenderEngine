
// Add level saving and loading to the level editor
LevelEditor.extend({

   //=====================================================================================================
   // IMPORT AND EXPORT

   /**
    * Open the Save As... dialog, populated with the level name
    * @private
    */
   saveAs: function() {
      $("#sv_levelName").val(LevelEditor.currentLevel.getName());
      $("#SaveAsDialog").dialog("open");
   },

   /**
    * Save the level to storage
    * @param lvlName {String} The name of the level or null to just save current level
    * @param dlg {Object} The dialog
    * @private
    */
   saveLevel: function(lvlName, dlg) {
      // Get the render context
      var ctx = LevelEditor.gameRenderContext,
      db = LevelEditor.getStorage();
      lvlName = lvlName || LevelEditor.currentLevel.getName();

      // Tag levels with the editor's version number
      LevelEditor.currentLevel.setVersion(LevelEditor.LEVEL_VERSION_NUMBER);
      
      db.save(lvlName, R.resources.types.Level.serialize(LevelEditor.currentLevel));
      LevelEditor.dirty = false;

      if (dlg) {
         $(dlg).dialog("close");
      }
   },

   /**
    * Open the export dialog and export the level to a JSON object
    * @private
    */
   exportLevel: function() {
      // Tag levels with the editor's version number
      LevelEditor.currentLevel.setVersion(LevelEditor.LEVEL_VERSION_NUMBER);

      // Serialize the level and show the dialog
      var json = JSON.stringify(R.resources.types.Level.serialize(LevelEditor.currentLevel), null, 2);
      $("#exportInfo").val(json);
      $("#ExportDialog").dialog("open");
   },

   /**
    * Show the dialog to load level from storage
    * @private
    */
   openLevel: function() {
      // If they're editing a level, make sure they are ok with this
      if (LevelEditor.dirty &&
      !confirm("Any unsaved changes you've made to the current level will be lost.  Proceed?")) {
         return;
      }

      // Get the names of all levels from storage
      var db = LevelEditor.getStorage(),
      results = db.getKeys();

      for (var l in results) {
         $("#ld_levelNames").append($("<option value='sto:" + results[l] + "'>").text(results[l]));
      }

      // Get the names of levels from each level loader
      for (var loader in LevelEditor.loaders.level) {
         for (var lvl in LevelEditor.loaders.level[loader].getResources()) {
            $("#ld_levelNames").append($("<option value='lod:" + LevelEditor.loaders.level[loader].getName() + ":" +
               lvl + "'>").text(lvl));
         }
      }

      // Select the first level by default
      $("#ld_levelNames")[0].selectedIndex = 0;

      // Display the dialog
      $("#LoadDialog").dialog("open");
   },

   /**
    * Load a level from storage
    * @private
    */
   loadLevel: function(levelId, dlg) {
      LevelEditor.resetLevel();

      // Get the render context
      var ctx = LevelEditor.gameRenderContext,
      db = LevelEditor.getStorage(),
      newObj, treeParent;

      var lvlJSON;
      if (levelId.indexOf("sto") == 0) {
         // From storage
         lvlJSON = db.load(levelId.split(":")[1]);
      } else {
         // From a level loader

      }

      // Check to see if the JSON is a level object
      if (!(lvlJSON.name && lvlJSON.resourceURLs && lvlJSON.actors && lvlJSON.fixtures && lvlJSON.tilemaps)) {
         alert("The data does not appear to be a level object.");
         return;
      }

      // Check the version in the file to see if it's lower than the version of the editor
      if (lvlJSON.version < LevelEditor.LEVEL_VERSION_NUMBER) {
         if (!confirm("The version in the file is older than the editor version.  There may be differences which cannot be imported.  Do you want to continue?")) {
            return;
         }
      }

      // See if the version in the file is higher than the version of the editor
      if (lvlJSON.version > LevelEditor.LEVEL_VERSION_NUMBER) {
         alert("The level object cannot be loaded by this version of the editor.");
         return;
      }

      var level = R.resources.types.Level.deserialize(lvlJSON);
      level.addEvent(LevelEditor, "loaded", function() {
         level.setRenderContext(LevelEditor.gameRenderContext);
      });

      if (dlg) {
         $(dlg).dialog("close");
      }
   },

   /**
    * Clear everything about the level out and start fresh
    * @private
    */
   newLevel: function() {
      if (LevelEditor.dirty &&
      !confirm("This will remove everything from the level.  Any unsaved data will be lost.  Proceed?")) {
         return;
      }
      LevelEditor.resetLevel();
   },

   /**
    * Clean up the level and remove everything
    * @private
    */
   resetLevel: function() {
      // Remove the current level from the context
      LevelEditor.currentLevel.destroy();
      LevelEditor.gameRenderContext.remove(LevelEditor.currentLevel);

//      for (var i in objs) {
//         // Update the scene graph tree
//         $("#editPanel div.sceneGraph").jstree("remove", "#" + objs[i].getId());
//         objs[i].destroy();
//      }
   },

   /**
    * Perform the import
    * @private
    */
   doImport: function(lvl, dlg) {
      // If they are currently editing a level, ask if they want to import
      if (LevelEditor.dirty &&
      !confirm("If you import now, any unsaved changes you've made will be lost.  Proceed?")) {
         return;
      }

      // Parse the JSON to see if it's valid
      var lvlJSON;
      try {
         lvlJSON = JSON.parse(lvl);
      } catch (ex) {
         alert("The JSON object provided is not valid and could not be parsed");
         return;
      }

      // Check to see if the JSON is a level object
      if (!(lvlJSON.name && lvlJSON.resourceURLs && lvlJSON.actors && lvlJSON.fixtures && lvlJSON.tilemaps)) {
         alert("The JSON object provided does not appear to be a level object.");
         return;
      }

      // Check the version in the file to see if it's lower than the version of the editor
      if (lvlJSON.version < LevelEditor.LEVEL_VERSION_NUMBER) {
         if (!confirm("The version in the file is older than the editor version.  There may be differences which cannot be imported.  Do you want to continue?")) {
            return;
         }
      }

      // See if the version in the file is higher than the version of the editor
      if (lvlJSON.version > LevelEditor.LEVEL_VERSION_NUMBER) {
         alert("The level object cannot be loaded by this version of the editor.");
         return;
      }

      // Now that the formalities are out of the way, let's get to importing the data
      LevelEditor.resetLevel();

      // Get the level name
      LevelEditor.currentLevel = R.resources.types.Level.deserialize(lvlJSON);

      LevelEditor.name = lvlJSON.name;

      // Import all of the actors, collision blocks, and trigger blocks
      var newObj, ctx = LevelEditor.gameRenderContext;
      for (var a in lvlJSON["actors"]) {
         newObj = R.objects.SpriteActor.create();
         LevelEditor.storeObjectProperties(newObj, lvlJSON["actors"][a]);

         // Add the object to the context
         ctx.add(newObj);

         // Add the object to the scene graph
         $("#editPanel div.sceneGraph").jstree("create", "#sg_actors", "last", {
            "attr": { "id": newObj.getId() },
            "data": newObj.getName() + " [" + newObj.getId() + "]"
         }, false, true);
      }

      for (var f in lvlJSON["fixtures"]) {
         newObj = R.objects.Fixture.create();
         LevelEditor.storeObjectProperties(newObj, lvlJSON["fixtures"][f]);

         // Add the object to the context
         ctx.add(newObj);

         // Add the object to the scene graph
         $("#editPanel div.sceneGraph").jstree("create", "#sg_fixture", "last", {
            "attr": { "id": newObj.getId() },
            "data": newObj.getName() + " [" + newObj.getId() + "]"
         }, false, true);
      }

      for (var t in lvlJSON["triggers"]) {
         newObj = R.objects.Fixture.create();
         newObj.setType(R.objects.Fixture.TYPE_TRIGGER);
         LevelEditor.storeObjectProperties(newObj, lvlJSON["triggers"][t]);

         // Add the object to the context
         ctx.add(newObj);

         // Add the object to the scene graph
         $("#editPanel div.sceneGraph").jstree("create", "#sg_trigger", "last", {
            "attr": { "id": newObj.getId() },
            "data": newObj.getName() + " [" + newObj.getId() + "]"
         }, false, true);
      }

      // Now import the tile maps
      for (var tMap in lvlJSON["tilemaps"]) {
         newObj = R.resources.types.TileMap.load(tMap, LevelEditor.loaders.tile, lvlJSON["tilemaps"][tMap]);
         ctx.add(newObj);
         LevelEditor.tileMaps[newObj.getName()] = newObj;
      }

      // All good!
      $(dlg).dialog("close");
   }
});
