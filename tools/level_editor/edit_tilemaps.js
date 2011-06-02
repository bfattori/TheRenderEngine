
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
         var tile,tileDiv;
         // Special tiles first
         tileDiv = $("<div class='tile'></div>");
         tileDiv.append($("<div style='border: 1px solid; width: 32px; height:32px; margin-left: 51px'></div>"))
            .append($("<div class='title'>empty</div>"));
         $("#TileSelector").append(tileDiv);
         
         var tiles = LevelEditor.getAllTiles();
         for (var t = 0; t < tiles.length; t++) {
            tile = LevelEditor.getTileForName(tiles[t].lookup);
            tileDiv = $("<div class='tile'></div>");

            var f = tile.getFrame(0,0), obj = $("<img>");

            tileDiv.attr("tileIdent", tiles[t].lookup);

            obj.attr({
               width: f.w,
               height: f.h,
               src: R.util.RenderUtil.extractDataURL(tile.getSourceImage(), f)
            }).css({
               marginLeft: (f.w / 2) + 35
            });

            tileDiv.append(obj).append($("<div class='title'>" + tiles[t].tile + "</div>"));
            $("#TileSelector").append(tileDiv);
            tile.destroy();
         }
      }

      $("#TileSelector div.tile").click(function() {
         $("#TileSelector div.tile").removeClass("selected");
         $(this).addClass("selected");
         var ident = $(this).attr("tileIdent");
         if (ident) {
            LevelEditor.setCurrentTile(ident);
         } else {
            LevelEditor.currentTile = null;
         }
      });

   },

   setCurrentTile: function(tileIdent) {
      if (LevelEditor.currentTile != null) {
         LevelEditor.currentTile.destroy();
      }

      LevelEditor.currentTile = LevelEditor.getTileForName(tileIdent);
   },

   drawTile: function(evt) {
      var which = evt.which, x = evt.pageX, y = evt.pageY;

      // Adjust for scroll and if the context was moved in the dom
      x += LevelEditor.gameRenderContext.getHorizontalScroll() - LevelEditor.contextOffset.left;
      y += LevelEditor.gameRenderContext.getVerticalScroll() - LevelEditor.contextOffset.top;

      var viewWidth = LevelEditor.gameRenderContext.getViewport().w,
          baseTile = LevelEditor.currentTileMap.getBaseTile(), bbox;

      if (LevelEditor.currentTile || baseTile) {
         bbox = (baseTile || LevelEditor.currentTile).getBoundingBox();
         x = (x - x % bbox.w) / bbox.w;
         y = (y - y % bbox.h) / bbox.h;
         var pt = R.math.Point2D.create(x, y);

         if (LevelEditor.currentTile) {
            LevelEditor.currentTileMap.setTile(LevelEditor.currentTile, x, y);
            pt.destroy();
         } else if (baseTile) {
            LevelEditor.currentTileMap.clearTile(x, y);
         }
      }
   }

});