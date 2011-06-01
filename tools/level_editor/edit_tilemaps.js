
// Extend LevelEditor with dialog methods
LevelEditor.extend({

   //=====================================================================================================
   // TILEMAP EDITING

   tileMaps: {},
   currentTile: null,
   currentTileMap: null,

   /**
    * Puts the editor into "tilemap editing mode" and sets the selected tilemap as
    * the current map to be edited.
    * @param mapName {String} The name of the tilemap to edito
    */
   editTileMap: function(mapName) {
      // See if there's a tilemap yet
      if (!LevelEditor.tileMaps[mapName]) {
         LevelEditor.tileMaps[mapName] = R.resources.types.TileMap.create(mapName, 200, 200);
         LevelEditor.gameRenderContext.add(LevelEditor.tileMaps[mapName]);
      }

      LevelEditor.currentTileMap = LevelEditor.tileMaps[mapName];
      LevelEditor.createPropertiesTable(LevelEditor.currentTileMap);

      // Show the tiles that are available
      $("body", document).append($("#TileSelector", LevelEditor.dialogBase));

      // Only do this once
      if ($("#TileSelector div.tile").length == 0) {
         var tiles = LevelEditor.getAllTiles();
         for (var t = 0; t < tiles.length; t++) {
            var tile = LevelEditor.getTileForName(tiles[t].lookup),
                tileDiv = $("<div class='tile'></div>"), f = tile.getFrame(0,0), obj = $("<img>");

            tileDiv.attr("tileIdent", tiles[t].lookup);

            obj.attr({
               width: f.w,
               height: f.h,
               src: R.util.RenderUtil.extractDataURL(tile.getSourceImage(), f)
            }).css({
               marginLeft: (f.w / 2) + 35
            });
            tileDiv.append(obj).append($("<div class='title'>" + tiles[t].tile + "</div>")).click(function() {
               $("#TileSelector div.tile").removeClass("selected");
               $(this).addClass("selected");
               LevelEditor.setCurrentTile($(this).attr("tileIdent"));
            });

            $("#TileSelector").append(tileDiv);
            tile.destroy();
         }
      }
   },

   setCurrentTile: function(tileIdent) {
      if (LevelEditor.currentTile != null) {
         LevelEditor.currentTile.destroy();
      }

      LevelEditor.currentTile = LevelEditor.getTileForName(tileIdent);
   },

   drawTile: function(x, y) {
      // Adjust for scroll and if the context was moved in the dom
      x += LevelEditor.gameRenderContext.getHorizontalScroll() - LevelEditor.contextOffset.left;
      y += LevelEditor.gameRenderContext.getVerticalScroll() - LevelEditor.contextOffset.top;

      var viewWidth = LevelEditor.gameRenderContext.getViewport().w;

      if (LevelEditor.currentTile) {
         x = x - x % currentTile.getBoundingBox().w;
         y = y - y % currentTile.getBoundingBox().h;
         var pt = R.math.Point2D.create(x, y);
         LevelEditor.currentTileMap.setTile(LevelEditor.currentTile, x, y);
         pt.destroy();
      }
   }

});