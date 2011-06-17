
// Extend LevelEditor with dialog methods
LevelEditor.extend({

   //=====================================================================================================
   // TILEMAP EDITING

   currentTile: null,
   currentTileMap: null,

   /**
    * Puts the editor into "tilemap editing mode" and sets the selected tilemap as
    * the current map to be edited.
    * @param mapName {String} The name of the tilemap to edito
    */
   editTileMap: function(mapName) {
      LevelEditor.currentTileMap = LevelEditor.currentLevel.getTileMap(mapName.split("_")[1]);
      LevelEditor.createPropertiesTable(LevelEditor.currentTileMap);

      // Show the tiles that are available
      $("body", document).append($("#TileSelector", LevelEditor.dialogBase));

      // If we haven't built the tile selector, do that now
      if ($("#TileSelector div.tile").length == 0) {
         var tile,tileDiv,special=[['empty','transparent'],['collision','#ff00ff']];
         // Special tiles first
         for (var st = 0; st < special.length; st++) {
            tileDiv = $("<div class='tile' tileIdent='$$" + special[st][0] + "'></div>");
            tileDiv.append($("<div style='border: 1px solid; background-color:" + special[st][1] + "; width: 32px; height:32px; margin-left: 51px'></div>"))
               .append($("<div class='title'>" + special[st][0] + "</div>"));
            $("#TileSelector").append(tileDiv);
         }

         var tiles = LevelEditor.getAllTiles();
         for (var t = 0; t < tiles.length; t++) {
            tile = LevelEditor.getTileForName(tiles[t].lookup);
            tileDiv = $("<div class='tile'></div>");

            var f = tile.getFrame(0,0), obj = $("<div>");
            tileDiv.attr("tileIdent", tiles[t].lookup);

            obj.css({
               width: f.w,
               height: f.h,
               backgroundPosition: -f.x + "px " + -f.y + "px",
               backgroundImage: 'url(' + tile.getSourceImage().src + ')',
               marginLeft: (f.w / 2) + 35
            });
            f.destroy();
            
            tileDiv.append(obj).append($("<div class='title'>" + tiles[t].tile + "</div>"));
            $("#TileSelector").append(tileDiv);
         }
      }

      // Make tiles selectable
      $("#TileSelector div.tile").click(function() {
         $("#TileSelector div.tile").removeClass("selected");
         $(this).addClass("selected");
         var ident = $(this).attr("tileIdent");
         if (ident.indexOf("$$") == -1) {
            LevelEditor.setCurrentTile(ident);
         } else {
            LevelEditor.currentTile = null;
         }
      });

   },

   setCurrentTile: function(tileIdent) {
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