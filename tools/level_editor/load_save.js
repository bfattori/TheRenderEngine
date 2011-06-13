
// Add level saving and loading to the level editor
LevelEditor.extend({

   //=====================================================================================================
   // IMPORT AND EXPORT

   /**
    * Setup the initial schema if it doesn't exist
    * @private
    */
   setupDataSchema: function() {
      // Check to see if the data schema exists already.  If so, early out
      var db = LevelEditor.getStorage();

      // See if the levels table exists
      if (!db.tableExists("Maint")) {
         // Create the schema

         // -- Maintenance
         db.createTable("Maint", ["id", "next_level_id"], ["Number","Number"]);
         var sql = "INSERT INTO Maint (id, next_level_id) VALUES (0,0)";
         db.execSql(sql);

         // -- Levels
         db.createTable("Levels", ["level_id","name"], ["Number","String"]);

         // -- Objects
         db.createTable("Objects", ["object_id","type_id","level_id"], ["Number","Number","Number"]);

         // -- ObjectProps
         db.createTable("ObjectProps", ["object_id","level_id","name","value"], ["Number","Number","String","String"]);
      }

      return;
   },

   /**
    * Drop the data schema from storage
    * @private
    */
   dropDataSchema: function() {
      var db = LevelEditor.getStorage();

      // Drop the schema
      db.dropTable("Maint");
      db.dropTable("Levels");
      db.dropTable("Objects");
      db.dropTable("ObjectProps");
   },

   /**
    * Open the Save As... dialog, populated with the level name
    * @private
    */
   saveAs: function() {
      $("#sv_levelName").val(LevelEditor.currentLevel.name);
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

      LevelEditor.setupDataSchema();

      // If we got a level name, we should check if it exists first
      var levelName = LevelEditor.currentLevel.name,
      levelId = LevelEditor.currentLevel.id,
      exists = true;

      var sql, result;
      if (lvlName) {
         exists = false;
         sql = "SELECT * FROM Levels WHERE Levels.name == '" + lvlName + "'";
         result = db.execSql(sql);
         if (result.length > 0) {
            exists = true;
            if (!confirm("A level with that name already exists.  Overwrite?")) {
               return;
            }

            // Initiate the level overwrite
            levelId = result[0].level_id;
         }

         levelName = lvlName;
      }

      if (levelId == -1) {
         exists = false;

         // If we don't have an Id yet, get the next Id from the database and add one
         sql = "SELECT Maint.next_level_id FROM Maint WHERE Maint.id == 0";
         result = db.execSql(sql);
         levelId = result[0].next_level_id;

         sql = "UPDATE Maint SET next_level_id = " + (levelId + 1) + " WHERE Maint.id == 0";
         db.execSql(sql);
      }

      // Add or update the level
      if (exists) {
         // Get all of the object Ids in the level
         sql = "SELECT Objects.object_id FROM Objects WHERE Objects.level_id = " + levelId;
         var objs = db.execSql(sql);

         // Delete the properties for all of the objects
         for (var o in objs) {
            sql = "DELETE ObjectProps FROM ObjectProps WHERE ObjectProps.object_id == " + objs[o].object_id + " AND ObjectProps.level_id == " + levelId;
            db.execSql(sql);
         }

         // Delete the objects from the level (in the database)
         sql = "DELETE Objects FROM Objects WHERE Objects.level_id == " + levelId;
         db.execSql(sql);
      } else {
         // Create the level entry
         sql = "INSERT INTO Levels (level_id, name) VALUES (" + levelId + ",'" + levelName + "')";
         db.execSql(sql);
      }

      // Get all of the objects of type SpriteActor or CollisionBox
      var levelObjects = LevelEditor.getGameObjects();

      // Spin through the objects and store properties which have setters to an object which
      // we'll serialize into the database
      for (var o = 0; o < levelObjects.length; o++) {
         var obj = levelObjects[o],
         props = LevelEditor.getWritablePropertiesObject(obj),
         oType = (obj instanceof R.objects.SpriteActor ? 1 :
         obj.getType() == R.objects.CollisionBox.TYPE_COLLIDER ? 2 : 3);

         // Storing JSON doesn't work...
         //var s = JSON.stringify(props);
         sql = "INSERT INTO Objects (object_id, type_id, level_id) VALUES (" + o + "," + oType + "," + levelId + ")";
         db.execSql(sql);

         // Insert all of the properties
         for (var p in props) {
            sql = "INSERT INTO ObjectProps (object_id, level_id, name, value) VALUES (" + o + "," + levelId + ",'" + p + "','" + props[p] + "')";
            db.execSql(sql);
         }
      }

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
      var lvlJSON = {
         "name": LevelEditor.currentLevel.name,
         "version": LevelEditor.LEVEL_VERSION_NUMBER,
         "actors": [],
         "fixtures": [],
         "triggers": [],
         "tilemaps": {}
      };

      // Enumerate all of the actors
      var actors = LevelEditor.getGameObjects(function(e) {
         return (e instanceof R.objects.SpriteActor);
      });

      // Enumerate all of the collision blocks
      var cBlocks = LevelEditor.getGameObjects(function(e) {
         return (e instanceof R.objects.Fixture && e.getType() == R.objects.Fixture.TYPE_COLLIDER);
      });

      // Enumerate all of the trigger blocks
      var tBlocks = LevelEditor.getGameObjects(function(e) {
         return (e instanceof R.objects.Fixture && e.getType() == R.objects.Fixture.TYPE_TRIGGER);
      });

      // Add them to the JSON object
      for (var a in actors) {
         lvlJSON["actors"].push(LevelEditor.getWritablePropertiesObject(actors[a]));
      }
      for (var c in cBlocks) {
         lvlJSON["fixtures"].push(LevelEditor.getWritablePropertiesObject(cBlocks[c]));
      }
      for (var t in tBlocks) {
         lvlJSON["triggers"].push(LevelEditor.getWritablePropertiesObject(tBlocks[t]));
      }

      for (var tm in LevelEditor.tileMaps) {
         var tmap = [].concat(LevelEditor.tileMaps[tm].getTileMap()),tmap2 = [];
         // Quick run through to convert to zeros (empty) and tiles
         for (var tile = 0; tile < tmap.length; tile++) {
            tmap[tile] = tmap[tile] != null ? LevelEditor.getTileCanonicalName(tmap[tile]) : 0;
         }

         // Second pass, collapse all empties into RLE
         var eCount = 0;
         for (tile = 0; tile < tmap.length; tile++) {
            if (tmap[tile] == 0) {
               eCount++;
            } else {
               if (eCount > 0) {
                  tmap2.push("e:" + eCount);
                  eCount = 0;
               }
               tmap2.push(tmap[tile]);
            }
         }

         // Capture any remaining empties
         if (eCount > 0) {
            tmap2.push("e:" + eCount);
         }

         lvlJSON["tilemaps"][tm] = {
            "props": LevelEditor.getWritablePropertiesObject(LevelEditor.tileMaps[tm]),
            "map": tmap2
         }
      }

      // Open the dialog
      $("#exportInfo").val(JSON.stringify(lvlJSON, null, 3));
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

      LevelEditor.setupDataSchema();

      // Get the names of all levels from storage
      var db = LevelEditor.getStorage(),
      sql = "SELECT Levels.* FROM Levels ORDER BY Levels.name",
      results = db.execSql(sql);

      for (var l in results) {
         $("#ld_levelNames").append($("<option value='" + results[l].level_id + "'>").text(results[l].name));
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

      LevelEditor.setupDataSchema();

      // Find the level
      var sql = "SELECT * FROM Levels WHERE Levels.level_id == " + levelId;
      var result = db.execSql(sql);
      if (result.length != 0) {
         // The level exists... let's load it up
         LevelEditor.currentLevel = {
            "id": levelId,
            "name": result[0].name
         };

         sql = "SELECT * FROM Objects WHERE Objects.level_id == " + levelId;
         result = db.execSql(sql);

         for (var o in result) {
            var oType = result[o].type_id, newObj;
            if (oType == 1) {
               newObj = R.objects.SpriteActor.create();
               treeParent = "#sg_actors";
            } else {
               newObj = R.objects.CollisionBox.create();
               newObj.setType(oType == 2 ? R.objects.CollisionBox.TYPE_COLLIDER : R.objects.CollisionBox.TYPE_TRIGGER);
               treeParent = (oType == 2 ? "#sg_fixture" : "#sg_trigger");
            }

            // Get the properties for the object and set them
            var pSql = "SELECT * FROM ObjectProps WHERE ObjectProps.object_id == " + result[o].object_id + " AND ObjectProps.level_id == " + levelId;
            var pRes = db.execSql(pSql);

            for (var p in pRes) {
               LevelEditor.storePropertyValue(newObj, pRes[p].name, pRes[p].value);
            }

            // Add the object to the context
            ctx.add(newObj);

            // Add the object to the scene graph
            $("#editPanel div.sceneGraph").jstree("create", treeParent, "last", {
               "attr": { "id": newObj.getId() },
               "data": newObj.getName() + " [" + newObj.getId() + "]"
            }, false, true);
         }
      }

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
      // We're only going to remove actors and collision/trigger blocks,
      // in case the game being edited has added something else to the context
      var objs = LevelEditor.getGameObjects();
      for (var i in objs) {
         // Update the scene graph tree
         $("#editPanel div.sceneGraph").jstree("remove", "#" + objs[i].getId());
         objs[i].destroy();
      }

      // Blow away the tile maps
      for (var maps in LevelEditor.tileMaps) {
         LevelEditor.tileMaps[maps].destroy();
      }
      LevelEditor.tileMaps = {};

      LevelEditor.currentLevel.id = -1;
      LevelEditor.currentLevel.name = "New Level";
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

      // Check the version in the file to see if it's lower than the version of the editor
      if (lvlJSON.version < LevelEditor.LEVEL_VERSION_NUMBER) {
         if (!confirm("The version in the file is older than the editor version.  There may be differences which cannot be imported.  Do you want to continue?")) {
            return;
         }
      }

      // See if the version in the file is higher than the version of the editor
      if (lvlJSON.version > LevelEditor.LEVEL_VERSION_NUMBER) {
         alert("The version of the file cannot be loaded by this editor.");
         return;
      }

      // Now that the formalities are out of the way, let's get to importing the data
      LevelEditor.resetLevel();

      // Get the level name
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
