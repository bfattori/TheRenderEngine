/**
 * The Render Engine
 *
 * 2D Tilemapping Level Editor
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

R.Engine.define({
   "class": "LevelEditor",
   "requires": [
      "R.engine.Game",
      "R.engine.Events",

      // Resource loaders and types
      "R.resources.loaders.SoundLoader",
      "R.resources.loaders.SpriteLoader",
      "R.resources.loaders.LevelLoader",
      "R.resources.loaders.TileLoader",
      "R.resources.types.Level",
      "R.resources.types.Sprite",
      "R.resources.types.Sound",
      "R.resources.types.Tile",
      "R.resources.types.TileMap",

      // Persistent storage to save level
      "R.storage.PersistentStorage",

      // Math objects
      "R.math.Math2D",

      // Game objects
      "R.objects.SpriteActor",
      "R.objects.Fixture"
   ],

   "includes": [
      "/../tools/level_editor/jquery-ui-1.8.8.js",
      "/../tools/level_editor/jquery.jstree.js",
      "/../tools/level_editor/jquery.cookie.js",
      "/../tools/level_editor/jquery.hotkeys.js",
      "/../tools/level_editor/jquery.jdMenu.js"
   ],

   // Game class dependencies
   "depends": [
   ]
});

/**
 * @class The 2D level editor.
 */
var LevelEditor = function() {
   return Base.extend({

      gridSize: 16,
      currentSelectedObject: null,
      LEVEL_VERSION_NUMBER: 1,

      game: null,
      loaders: {
         sprite: null,
         tile: null,
         sound: null,
         level: null
      },
      gameRenderContext: null,
      currentZIndex: 1,
      defaultSprite: null,
      spriteOptions: null,
      allSprites: null,
      allTiles: null,
      contextOffset: null,
      pStore: null,
      dialogBase: null,
      currentLevel: null,
      lastPos: null,

      editingTiles: false,

      constructor: null,
      dirty: false,

      showing: false,

      editToggle: {
         zoom: false,
         parallax: false
      },

      getName: function() {
         return "LevelEditor";
      },

      init: function() {
         R.engine.Script.load("/../tools/level_editor/dialogs.js");
         R.engine.Script.load("/../tools/level_editor/load_save.js");
         R.engine.Script.load("/../tools/level_editor/object_edit.js")
         R.engine.Script.load("/../tools/level_editor/edit_tilemaps.js")
      },

      //=====================================================================================================
      // INITIALIZATION

      /**
       * This is the main entry point when editing a game.  Providing the
       * {@link Game} object which is being edited gives the editor a chance
       * to find all of the resource loaders being used by the game, and
       * also locate other parts of the game which can be edited.  The editor
       * will create interfaces for working with the game's structure, plus
       * it will generate data objects for the level being edited.
       * @param game {Game} The <tt>Game</tt> object being edited
       * @param [renderContext] {R.rendercontexts.RenderContext2D} Optional render context which
       *    should be enabled for editing.
       */
      edit: function(game, renderContext) {
         // Set the Game object which is being edited
         LevelEditor.setGame(game, renderContext);

         LevelEditor.currentLevel = {
            "id": -1,
            "name": "New Level"
         };

         // Wire up a keystroke to show the editor
         R.Engine.getDefaultContext().addEvent(null, "keydown", function(evt) {
            if (evt.which == R.engine.Events.KEYCODE_F4) {
               LevelEditor.toggleEditor();
            }
         });

         // Load the dialogs and UI
         R.engine.Script.loadText(R.Engine.getEnginePath() + "/../tools/level_editor/dialogs.html", null, function(data) {
            LevelEditor.dialogBase = $("<div>").html(data);
            LevelEditor.startup();
         });
      },

      /**
       * Read the <tt>Game</tt> which is being edited to get the
       * relevant parts which are going to be used by the editor.
       * @param game {Game} The <tt>Game</tt> class
       * @param [renderContext] {R.rendercontexts.RenderContext2D} Optional render context which
       *    should be enabled for editing.
       * @private
       */
      setGame: function(game, renderContext) {
         LevelEditor.game = game;

         // See what kind of resource loaders the game has assigned to it
         LevelEditor.loaders.sprite = [];
         LevelEditor.loaders.tile = [];
         LevelEditor.loaders.sound = [];
         LevelEditor.loaders.level = [];
         LevelEditor.lastPos = R.math.Point2D.create(0,0);

         LevelEditor.gameRenderContext = renderContext;

         for (var o in LevelEditor.game) {
            try {
               // TileLoader is a subclass of SpriteLoader, so it has to come first
               if (LevelEditor.game[o] instanceof R.resources.loaders.TileLoader) {
                  LevelEditor.loaders.tile.push(LevelEditor.game[o]);
               } else if (LevelEditor.game[o] instanceof R.resources.loaders.SpriteLoader) {
                  LevelEditor.loaders.sprite.push(LevelEditor.game[o]);
               } else if (LevelEditor.game[o] instanceof R.resources.loaders.SoundLoader) {
                  LevelEditor.loaders.sound.push(LevelEditor.game[o]);
               } else if (LevelEditor.game[o] instanceof R.resources.loaders.LevelLoader) {
                  LevelEditor.loaders.level.push(LevelEditor.game[o]);
               } else if (!LevelEditor.gameRenderContext &&
                     LevelEditor.game[o] instanceof R.rendercontexts.AbstractRenderContext) {

                  // The render context (if there's more than one, we'll need to modify this)
                  LevelEditor.gameRenderContext = LevelEditor.game[o];
               }
            } catch (ex) {
               // Some objects don't like to be touched
            }
         }
      },

      /**
       * Get the <tt>Game</tt> object which is being edited
       * @return {Game} The game being edited
       */
      getGame: function() {
         return LevelEditor.game;
      },

      /**
       * After the html data has been loaded, this method is called to start the editor.
       * @private
       */
      startup: function() {
         // Load the style sheet for the editor
         R.engine.Script.loadStylesheet("/../tools/level_editor/css/leveleditor.css", false, true);

         // Load the style sheet for jQueryUI
         R.engine.Script.loadStylesheet("/../tools/level_editor/css/smoothness/jquery-ui-1.8.8.custom.css", false, true);

         // Load the style sheets for jdMenu
         R.engine.Script.loadStylesheet("/../tools/level_editor/css/jdMenu.css", false, true);
         R.engine.Script.loadStylesheet("/../tools/level_editor/css/jdMenu.slate.css", false, true);
      },

      /**
       * Toggle the editor on and off
       */
      toggleEditor: function() {
         if (!LevelEditor.showing) {
            // Create the areas for the scene graph and the object properties
            $("body", document).append($("#editPanel", LevelEditor.dialogBase));

            // Set up the scene graph tree
            $("#editPanel div.sceneGraph")
            .jstree({
               "themes": {
                  "theme": "default",
                  "dots": true,
                  "icons": false
               },
               "ui": {
                  "select_limit": 1
               },
               "contextmenu": {
                  "select_node": true,
                  "items": function(obj) {
                     return LevelEditor.contextMenu(obj);
                  }
               },
               "plugins": ["themes","crrm","html_data","ui","contextmenu"]
            });

            // Bind to the method to catch renamed objects
            $("#editPanel").bind("setName", function(evt, obj, value) {
               $("#editPanel div.sceneGraph").jstree("set_text", "#" + obj.getId(), value + " [" + obj.getId() + "]");
            });

            // Bind a method to handle selection within the tree
            $("#editPanel div.sceneGraph").bind("select_node.jstree", function(e, data) {
               var id = $(data.args[0]).attr("id") || "";
               if (id == "") {
                  var p = $(data.args[0]).parent(), pId = p.attr("id"),
                     isObject = $(data.args[0]).parents("li.objects").length == 1;
                  if (p.hasClass("objects")) {
                     LevelEditor.editingTiles = false;
                     return;
                  }

                  if (pId && isObject) {
                     // Try to center the object in the view
                     var pos = R.clone(LevelEditor.getObjectById(pId).getPosition()),
                         d = R.clone(LevelEditor.gameRenderContext.getViewport().getDims());
                     pos.sub(d.div(2));
                     LevelEditor.gameRenderContext.scrollTo(300, pos);
                     LevelEditor.selectById(pId);
                     pos.destroy();
                     d.destroy();
                     if ($("#TileSelector").length != 0) {
                        LevelEditor.dialogBase.append($("#TileSelector").remove());
                     }
                     LevelEditor.editingTiles = false;
                  } else if (pId != "") {
                     LevelEditor.editTileMap(pId);
                     LevelEditor.editingTiles = true;
                  }
               }
            });

            // Dialog for script editor
            $("body", document).append($("#ScriptDialog", LevelEditor.dialogBase));
            $("#ScriptDialog").dialog({
               autoOpen: false,
               width: 570,
               modal: true,
               draggable: true,
               title: "Script Editor",
               buttons: {
                  "Save Script": function() {
                     // Get the option which contains our object's Id and the one where the script is stored
                     var objId = $(this).dialog("option", "_REObjectId");
                     var propName = $(this).dialog("option", "_REPropName");
                     LevelEditor.saveScript(objId, propName, $("#scriptVal").val())
                     $(this).dialog("close");
                  },
                  "Cancel": function() {
                     $(this).dialog("close");
                  }
               },
               close: function() {
                  $("#scriptVal").val("");
               }
            });

            // Dialog for actor config
            $("body", document).append($("#ActorConfigDialog", LevelEditor.dialogBase));
            $("#ActorConfigDialog").dialog({
               autoOpen: false,
               width: 570,
               draggable: true,
               title: "Actor Configuration",
               buttons: {
                  "Save": function() {
                     // Get the option which contains our object's Id and the one where the script is stored
                     var objId = $(this).dialog("option", "_REObjectId");
                     LevelEditor.saveActorConfig(objId, $("#ActorConfigDialog form"));
                     $(this).dialog("close");
                  },
                  "Cancel": function() {
                     $(this).dialog("close");
                  }
               },
               close: function() {
                  $("#ac_id").val("");
                  $("#ac_bitmask").val("0");
                  $("#ActorConfigDialog fieldset.optional").empty();
               }
            });

            // Dialog for level export
            $("body", document).append($("#ExportDialog", LevelEditor.dialogBase));
            $("#ExportDialog").dialog({
               autoOpen: false,
               width: 570,
               modal: true,
               draggable: true,
               title: "Level Export",
               buttons: {
                  "Ok": function() {
                     $(this).dialog("close");
                  }
               },
               close: function() {
                  $("#exportInfo").val("");
               }
            });

            // Dialog for level import
            $("body", document).append($("#ImportDialog", LevelEditor.dialogBase));
            $("#ImportDialog").dialog({
               autoOpen: false,
               width: 570,
               modal: true,
               draggable: true,
               title: "Level Import",
               buttons: {
                  "Import": function() {
                     LevelEditor.doImport($("#importInfo").val(), this);
                  },
                  "Cancel": function() {
                     $(this).dialog("close");
                  }
               },
               close: function() {
                  $("#importInfo").val("");
               }
            });

            // Dialog for Save As...
            $("body", document).append($("#SaveAsDialog", LevelEditor.dialogBase));
            $("#SaveAsDialog").dialog({
               autoOpen: false,
               width: 570,
               modal: true,
               draggable: true,
               title: "Save Level As...",
               buttons: {
                  "Save": function() {
                     LevelEditor.saveLevel($("#sv_levelName").val(), this);
                  },
                  "Cancel": function() {
                     $(this).dialog("close");
                  }
               },
               close: function() {
                  $("#sv_levelName").val("");
               }
            });

            // Dialog for Open level
            $("body", document).append($("#LoadDialog", LevelEditor.dialogBase));
            $("#LoadDialog").dialog({
               autoOpen: false,
               width: 320,
               modal: true,
               draggable: true,
               title: "Open Level",
               buttons: {
                  "Open": function() {
                     LevelEditor.loadLevel($("#ld_levelNames").val(), this);
                  },
                  "Cancel": function() {
                     $(this).dialog("close");
                  }
               },
               close: function() {
                  $("#ld_levelNames").empty();
               }
            });

            // Alert dialog for saving
            $("body", document).append($("#SaveDialog", LevelEditor.dialogBase));
            $("#SaveDialog").dialog({
               autoOpen: false,
               width: 300,
               draggable: false,
               resizable: false,
               closeOnEscape: false
            });


            // Enumerate all of the possible sprites to use as actors
            var s = $("<select id='actor' class='tool'>");
            var spr = LevelEditor.getAllSprites();

            // Set the default sprite unless otherwise specified
            LevelEditor.defaultSprite = spr[0].lookup;

            $.each(spr, function() {
               s.append($("<option value='" + this.lookup + "'>" + this.sprite + "</option>"));
            });

            $("#editPanel td.actors").append(s);

            $("#addActor").click(function() {
               LevelEditor.createActor($("#actor option:selected").val());
            });

            // We may need scrollbars to move the world
            var game = LevelEditor.getGame();
            var viewWidth = game.getRenderContext().getViewport().w;
//            var sb = $("<div style='height: 25px; width: " + viewWidth + "px; overflow-x: auto;'><div style='width: " +
//            game.getLevel().getFrame().w + "px; border: 1px dashed'></div></div>").bind("scroll", function() {
//               game.getRenderContext().setHorizontalScroll(this.scrollLeft);
//            });
//            $(document.body).append(sb);

            // Add an event handler to the context
            var ctx = game.getRenderContext();
            ctx.addEvent(LevelEditor, "mousedown", function(evt) {
               if (!LevelEditor.editingTiles) {
                  LevelEditor.selectObject(evt.pageX, evt.pageY);
               }
               LevelEditor.mouseDown = true;
               LevelEditor.lastPos.set(evt.pageX, evt.pageY);
            });

            ctx.addEvent(LevelEditor, "mouseup", function() {
               LevelEditor.mouseDown = false;
               LevelEditor.createPropertiesTable(LevelEditor.currentSelectedObject);
            });

            ctx.addEvent(LevelEditor, "mousemove", function(evt) {
               if (!LevelEditor.editingTiles && LevelEditor.mouseDown) {
                  if (LevelEditor.currentSelectedObject) {
                     LevelEditor.moveSelected(evt.pageX, evt.pageY);
                  } else {
                     LevelEditor.moveWorld(evt.pageX, evt.pageY);
                  }
               } else if (LevelEditor.editingTiles && LevelEditor.mouseDown) {
                  LevelEditor.drawTile(evt);
               }
            });

            //ctx.jQ().css("border", "1px solid red");
            ctx.addEvent(null, "keypress", function(evt) {
               // Toggle Zoom
               if (R.engine.Events.isKey(evt, "z")) {
                  LevelEditor.editToggle.zoom = !LevelEditor.editToggle.zoom;
                  if (LevelEditor.editToggle.zoom) {
                     ctx.setWorldScale(0.25,0.25);
                  } else {
                     ctx.setWorldScale(1,1);
                  }
               }

               // Toggle Parallax
               if (R.engine.Events.isKey(evt, "a")) {
                  LevelEditor.editToggle.parallax = !LevelEditor.editToggle.parallax;
                  var parallax = R.math.Point2D.create(1,1);
                  if (LevelEditor.editToggle.parallax) {
                     parallax.set(1.3,1.3);
                     LevelEditor.tileMaps["tm_background"].setParallax(parallax);
                     parallax.set(0.4,0.4);
                     LevelEditor.tileMaps["tm_foreground"].setParallax(parallax);
                  } else {
                     LevelEditor.tileMaps["tm_background"].setParallax(parallax);
                     LevelEditor.tileMaps["tm_foreground"].setParallax(parallax);
                  }
                  parallax.destroy();
               }
            });

            // Menu across the top
            var mb = {
               "File" : {
                  "New" : function() {
                     LevelEditor.newLevel();
                     return false;
                  },
                  "x1" : "separator",
                  "Open" : function() {
                     LevelEditor.openLevel();
                     return false;
                  },
                  "Save" : function() {
                     LevelEditor.currentLevel.id == -1 ? LevelEditor.saveAs() : LevelEditor.saveLevel();
                     return false;
                  },
                  "Save As..." : function() {
                     LevelEditor.saveAs();
                     return false;
                  },
                  "x2" : "separator",
                  "Import" : function() {
                     $("#ImportDialog").dialog("open");
                     return false;
                  },
                  "Export" : function() {
                     LevelEditor.exportLevel();
                     return false;
                  }
               },
               "Edit" : {
                  "Copy Object": function() {
                  },
                  "x1" : "separator",
                  "Delete Object": function() {
                  },
                  "x2" : "separator",
                  "Scroll to Object" : function() {
                  },
                  "Freeze Object": function() {
                  }
               },
               "Tools" : {
                  "Level Properties": function() {
                  },
                  "x2" : "separator",
                  "Options": function() {
                  }
               }
            };

            var menubar = $("<ul class='jd_menu jd_menu_slate'>");

            for (var m in mb) {
               var topLvl = $("<li>").text(m);
               var sub = $("<ul>");
               for (var n in mb[m]) {
                  if ($.isFunction(mb[m][n])) {
                     sub.append($("<li>").append($("<a href='#'>").html(n).click(mb[m][n])));
                  } else {
                     // Separator
                     sub.append($("<li>").append($("<hr>")));
                  }
               }
               topLvl.append(sub);
               menubar.append(topLvl);
            }

            // Insert the menubar before the rendercontext in the DOM
            var mbc = $("<div style='margin-bottom:8px;'>").append(menubar);
            ctx.jQ().before(mbc);
            $("ul.jd_menu").jdMenu();

            // Make sure we know where the context is at so we can adjust mouse position
            setTimeout(function() {
               LevelEditor.contextOffset = ctx.jQ().offset();
            }, 750);

            LevelEditor.showing = true;

         } else {
            // Clean up
            $("#editPanel").remove();
            LevelEditor.dialogBase.append($("#ScriptDialog").remove());
            LevelEditor.dialogBase.append($("#ActorConfigDialog").remove());
            LevelEditor.dialogBase.append($("#ExportDialog").remove());
            LevelEditor.dialogBase.append($("#ImportDialog").remove());
            LevelEditor.dialogBase.append($("#SaveAsDialog").remove());
            LevelEditor.dialogBase.append($("#LoadDialog").remove());
            LevelEditor.dialogBase.append($("#SaveDialog").remove());

            var ctx = LevelEditor.gameRenderContext;
            ctx.removeEvent(LevelEditor, "mousedown");
            ctx.removeEvent(LevelEditor, "mouseup");
            ctx.removeEvent(LevelEditor, "mousemove");

            $("ul.jd_menu").remove();

            LevelEditor.showing = false;
         }
      },

      /**
       * The context menu to display for a tree node
       * @private
       */
      contextMenu: function(node) {
         // Determine what type of object has been selected
         var id = node.attr("id");
         var selObj = (id == "sceneGraph" ? null : LevelEditor.getObjectById(id));
         return {
            "create": {
               "label": "Create New...",
               "action": function() { /* noop */
               },
               "submenu": {
                  "actor": {
                     "label": "Actor",
                     "action": function() {
                        LevelEditor.createActor(LevelEditor.defaultSprite);
                     }
                  },
                  "collbox": {
                     "label": "Collision Block",
                     "action": function() {
                        LevelEditor.createCollisionBox();
                     }
                  },
                  "trigger": {
                     "label": "Trigger Block",
                     "action": function() {
                        LevelEditor.createTriggerBox();
                     }
                  }
               }
            },
            "copy": {
               "label": "Clone Object",
               "_disabled": selObj == null,
               "separator_after": true,
               "action": function() {
                  LevelEditor.copyObject(selObj);
               }
            },
            "jump": {
               "label": "Jump to...",
               "_disabled": selObj == null,
               "action": function() {
                  LevelEditor.repositionViewport(selObj);
               }
            },
            "activate": {
               "label": "Freeze Object",
               "_disabled": selObj == null || !(selObj instanceof R.objects.SpriteActor),
               "action": function() {
               }
            },
            "action": {
               "label": "Actor Config",
               "_disabled": selObj == null || !(selObj instanceof R.objects.SpriteActor),
               "action": function() {
                  LevelEditor.showActorConfig();
               },
               "separator_after": true
            },
            "delete": {
               "label": "Delete",
               "_disabled": selObj == null,
               "action": function() {
                  LevelEditor.deleteObject(selObj);
               }
            }
         };
      },

      //=====================================================================================================
      // HELPER METHODS

      /**
       * Get all of the sprites in all of the sprite resources
       * @private
       */
      getAllSprites: function() {
         if (!LevelEditor.allSprites) {
            LevelEditor.allSprites = [];

            // For each of the sprite loaders
            for (var l in LevelEditor.loaders.sprite) {
               var loader = LevelEditor.loaders.sprite[l];

               // Locate the resources (sprite sheets)
               var resources = loader.getResources();
               for (var r in resources) {

                  // Get all of the sprites
                  var sprites = loader.getSpriteNames(resources[r]);
                  for (var s in sprites) {
                     LevelEditor.allSprites.push({
                        lookup: l + ":" + resources[r] + ":" + sprites[s],
                        sprite: resources[r] + ": " + sprites[s]
                     });
                  }
               }
            }
         }

         return LevelEditor.allSprites;
      },

      /**
       * Get all of the tiles in all of the tile resources
       * @private
       */
      getAllTiles: function() {
         if (!LevelEditor.allTiles) {
            LevelEditor.allTiles = [];

            // For each of the sprite loaders
            for (var l in LevelEditor.loaders.tile) {
               var loader = LevelEditor.loaders.tile[l];

               // Locate the resources (sprite sheets)
               var resources = loader.getResources();
               for (var r in resources) {

                  // Get all of the sprites
                  var tiles = loader.getSpriteNames(resources[r]);
                  for (var t in tiles) {
                     LevelEditor.allTiles.push({
                        lookup: l + ":" + resources[r] + ":" + tiles[t],
                        tile: resources[r] + ": " + tiles[t]
                     });
                  }
               }
            }
         }

         return LevelEditor.allTiles;
      },

      /**
       * Get all game objects, or filter them by the provided function.
       * @param fn {Function}
       * @return {Array}
       * @private
       */
      getGameObjects: function(fn) {
         fn = fn || function(e) {
            return (e instanceof R.objects.SpriteActor || e instanceof R.objects.CollisionBox);
         };
         return LevelEditor.gameRenderContext.getObjects(fn);
      },

      /**
       * Get a reference to the object given its Id
       * @param {Object} objId
       * @private
       */
      getObjectById: function(objId) {
         var objs = LevelEditor.gameRenderContext.getObjects(function(el) {
            return (el.getId() == objId);
         });
         if (objs.length == 0) {
            // Invalid object, so deselect the current node
            LevelEditor.deselectObject();
            return null;
         }
         return objs[0];
      },

      /**
       * Get an object of writable properties (and their values) for the given object
       * @param obj {R.engine.Object2D} The object to query
       * @return {Object}
       * @private
       */
      getWritablePropertiesObject: function(obj) {
         var bean = obj.getProperties(),
         propObj = {},
         val;

         // Defaults for object properties which can be skipped if no different
         var defs = {
            "Position":"0.00,0.00",
            "Origin":"0.00,0.00",
            "Rotation":"0",
            "ScaleX":"1",
            "ScaleY":"1",
            "Action":""
         };

         for (var p in bean) {
            if (bean[p][1]) {
               val = bean[p][0]();
               if (val != defs[p]) {
                  propObj[p] = bean[p][0]();
               }
            }
         }

         // TODO: Should probably do this somewhere else...
         if (obj instanceof R.objects.SpriteActor) {
            // Get the actor config
            var aCfg = {
               "actorId": obj.getActorId(),
               "bitMask": obj.getCollisionMask()
            };

            for (var c in obj.getConfig()) {
               val = obj.getConfig()[c] == "var" ? obj.getVariable(c) : (obj.getActorEvent(c) && obj.getActorEvent(c).script ? obj.getActorEvent(c).script : "")
               if (val) {
                  aCfg[c] = val;
               }
            }
            propObj["ACTOR_CONFIG"] = aCfg;
         }

         return propObj;
      },

      /**
       * Store a single property value
       * @param obj {R.engine.Object2D}
       * @param propName {String}
       * @param value {String}
       * @private
       */
      storePropertyValue: function(obj, propName, value) {

         // Special case
         if (propName == "ACTOR_CONFIG" && (obj instanceof R.objects.SpriteActor)) {
            var aCfg = value;

            // The actor configuration key is special
            obj.setActorId(aCfg.actorId);
            obj.setCollisionMask(aCfg.bitMask);

            // Now for the rest
            for (var c in obj.getConfig()) {
               if (aCfg[c]) {
                  // If there's a value in the config for it...
                  var val = aCfg[c];
                  if (obj.getConfig()[c] == "var") {
                     obj.setVariable(c, val);
                  } else {
                     obj.setActorEvent(c, val);
                  }
               }
            }

            return;
         }

         var bean = obj.getProperties();

         // Regardless if the editable flag is true, if there is a setter, we'll
         // call it to copy the value over.
         if (bean[propName][1]) {
            if (bean[propName][1].multi || bean[propName][1].toggle || bean[propName][1].editor) {
               // Multi-select, toggle, or custom editor
               bean[propName][1].fn(value);
            } else {
               // Single value
               bean[propName][1](value);
            }
         }
      },

      /**
       * Store all of the properties into the object
       * @param obj {R.engine.Object2D} The object
       * @param props {Object} The properties object
       */
      storeObjectProperties: function(obj, props) {
         for (var p in props) {
            LevelEditor.storePropertyValue(obj, p, props[p]);
         }
      },

      /**
       * Get the storage object where the information will be saved
       * @private
       */
      getStorage: function() {
         if (LevelEditor.pStore == null) {
            LevelEditor.pStore = R.storage.PersistentStorage.create("LevelEditor");
         }

         return LevelEditor.pStore;
      },

      /**
       * Return an array of sprites for a select dropdown from every sprite loader found
       * @private
       */
      getSpriteOptions: function() {
         if (!LevelEditor.spriteOptions) {
            var spr = LevelEditor.getAllSprites();
            LevelEditor.spriteOptions = [];
            $.each(spr, function() {
               LevelEditor.spriteOptions.push({ "val": this.lookup, "label": this.sprite });
            });
         }
         return LevelEditor.spriteOptions;
      },

      /**
       * Get the sprite object for the given canonical name
       * @param {Object} spriteOpt
       * @private
       */
      getSpriteForName: function(spriteOpt) {
         // Determine the loader, sheet, and sprite
         var spriteIdent = spriteOpt.split(":");
         var loader = LevelEditor.loaders.sprite[spriteIdent[0]];
         return loader.getSprite(spriteIdent[1], spriteIdent[2]);
      },

      /**
       * Get the tile object for the given canonical name
       * @param {Object} spriteOpt
       * @private
       */
      getTileForName: function(tileOpt) {
         // Determine the loader, sheet, and sprite
         var tileIdent = tileOpt.split(":");
         var loader = LevelEditor.loaders.tile[tileIdent[0]];
         return loader.getTile(tileIdent[1], tileIdent[2]);
      },

      /**
       * Get the sprite's canonical name.
       * "loaderIndex:resourceName:spriteName"
       *
       * @param sprite {Sprite}
       * @private
       */
      getSpriteCanonicalName: function(sprite) {
         var loader = sprite.getSpriteLoader(), loaderIdx = 0;

         // Locate the sprite loader index
         for (var l in LevelEditor.loaders.sprite) {
            if (loader === LevelEditor.loaders.sprite) {
               loaderIdx = l;
               break;
            }
         }

         // Return the canonical name which contains the loader index, resource name, and sprite name
         return loaderIdx + ":" + sprite.getSpriteResource().resourceName + ":" + sprite.getName();
      },

      /**
       * Get the tiles's canonical name.
       * "loaderIndex:resourceName:spriteName"
       *
       * @param sprite {Sprite}
       * @private
       */
      getTileCanonicalName: function(tile) {
         var loader = tile.getTileLoader(), loaderIdx = 0;

         // Locate the sprite loader index
         for (var l in LevelEditor.loaders.tile) {
            if (loader === LevelEditor.loaders.tile) {
               loaderIdx = l;
               break;
            }
         }

         // Return the canonical name which contains the loader index, resource name, and sprite name
         return loaderIdx + ":" + tile.getSpriteResource().resourceName + ":" + tile.getName();
      },


      //=====================================================================================================
      // INTERFACE

      /**
       * Create the table which will hold all of the given object's properties
       * @param {Object} obj
       * @private
       */
      createPropertiesTable: function(obj) {
         // Remove any existing property table
         $("#propTable").remove();

         if (obj == null && LevelEditor.currentSelectedObject == null) {
            return;
         }

         // Create a new property table
         var pTable = $("<table id='propTable'>");

         // Get the objects properties and bean methods
         var bean = obj.getProperties();
         for (var p in bean) {
            var r = $("<tr>");
            r.append($("<td class='propName'>" + p + "</td>"));
            var e;

            // As long as the editableFlag is true, we'll create the appropriate editor
            if (bean[p][2]) {

               if (bean[p][1].multi && bean[p][1].multi === true) {
                  // Multi-select dropdown
                  e = $("<select>");

                  // If it's a function, call it to get the options as: [{ val: "foo", label: "Foo Label" }, ...]
                  // otherwise, treat it as already in array/object notation above
                  var opts = $.isFunction(bean[p][1].opts) ? bean[p][1].opts() : bean[p][1].opts;

                  // Build options
                  $.each(opts, function() {
                     e.append($("<option value='" + this.val + "'>").text(this.label));
                  });

                  // When the option is chosen, call the setter function
                  var fn = function() {
                     arguments.callee.cb($(this).val());
                     $("#editPanel").trigger("set" + arguments.callee.prop, [arguments.callee.obj, $(this).val()]);
                  };
                  fn.cb = bean[p][1].fn;
                  fn.prop = p;
                  fn.obj = obj;

                  e.change(fn).val(bean[p][0]);
               } else if (bean[p][1].toggle && bean[p][1].toggle === true) {
                  // Checkbox toggle
                  e = $("<input type='checkbox'/>");

                  var fn = function() {
                     arguments.callee.cb(this.checked);
                     $("#editPanel").trigger("set" + arguments.callee.prop, [arguments.callee.obj, this.checked]);
                  };
                  fn.cb = bean[p][1].fn;
                  fn.prop = p;
                  fn.obj = obj;

                  e.change(fn)[0].checked = bean[p][0]();
               } else if (bean[p][1].editor) {
                  // Custom editor called in the scope of the object being edited
                  var fn = function() {
                     arguments.callee.cb.call(arguments.callee.obj);
                  };
                  fn.obj = obj;
                  fn.cb = bean[p][1].editor;
                  e = $("<span>").text(bean[p][0]()).append($("<input type='button' value='...'>").click(fn))
               } else {
                  // Single value input
                  var fn = function() {
                     arguments.callee.cb(this.value);
                     $("#editPanel").trigger("set" + arguments.callee.prop, [arguments.callee.obj, $(this).val()]);
                  };
                  fn.cb = bean[p][1];
                  fn.prop = p;
                  fn.obj = obj;

                  e = $("<input type='text' size='35' value='" + bean[p][0]().toString() + "'/>").change(fn);
               }
            } else {
               e = $("<div>").text(bean[p][0]().toString());
            }

            r.append($("<td>").append(e));
            pTable.append(r);
         }

         // Append the new property table
         $("#editPanel div.props").append(pTable);
      },

      moveWorld: function(x, y) {
         var cpt = R.math.Point2D.create(x, y),
            vp = R.math.Point2D.create(LevelEditor.gameRenderContext.getWorldPosition());
         LevelEditor.lastPos.sub(cpt);
         vp.add(LevelEditor.lastPos);
         LevelEditor.gameRenderContext.setScroll(vp);
         LevelEditor.lastPos.set(x,y);
         cpt.destroy();
         vp.destroy();
      }

   });
};