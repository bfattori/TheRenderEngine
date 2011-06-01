
// Extend LevelEditor with dialog methods
LevelEditor.extend({

   //=====================================================================================================
   // TILEMAP EDITING

   tileMaps: {},

   /**
    * Puts the editor into "tilemap editing mode" and sets the selected tilemap as
    * the current map to be edited.
    * @param mapName {String} The name of the tilemap to edito
    */
   editTileMap: function(mapName) {
      // See if there's a tilemap yet
      if (!LevelEditor.tileMaps[mapName]) {
         LevelEditor.tileMaps[mapName] = R.resources.types.TileMap.create(mapName, 200, 200);
      }

      var map = LevelEditor.tileMaps[mapName];

      LevelEditor.createPropertiesTable(map);
   }

});