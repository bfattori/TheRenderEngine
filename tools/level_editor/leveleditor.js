/**
 * The Render Engine
 *
 * The level editor
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
		"R.lang.Timeout",
		"R.lang.Iterator",
		"R.engine.Events",

		// Resource loaders and types
		"R.resources.loaders.SoundLoader",
		"R.resources.loaders.SpriteLoader",
		"R.resources.loaders.LevelLoader",
		"R.resources.types.Level",
		"R.resources.types.Sprite",
		"R.resources.types.Sound",

		// Persistent storage to save level
		"R.storage.PersistentStorage",

		// Math objects
		"R.math.Math2D",
		"R.math.Point2D",
		"R.math.Vector2D",
		"R.math.Rectangle2D",
		
		// Game objects
		"R.objects.SpriteActor",
		"R.objects.CollisionBox"
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
      sound: null,
      level: null
   },
   gameRenderContext: null,
   nextZ: 1,
	defaultSprite: null,
	spriteOptions: null,
	allSprites: null,
	contextOffset: null,
	pStore: null,
	dialogBase: null,
	currentLevel: null,

   constructor: null,
	dirty: false,
	
	getName: function() {
		return "LevelEditor";
	},

   /**
    * Read the <tt>Game</tt> which is being edited to get the
    * relevant parts which are going to be used by the editor.
    * @param game {Game} The <tt>Game</tt> class
	 * @private
    */
   setGame: function(game) {
      LevelEditor.game = game;
      
      // See what kind of resource loaders the game has assigned to it
      LevelEditor.loaders.sprite = [];
      LevelEditor.loaders.sound = [];
      LevelEditor.loaders.level = [];
      
      for (var o in this.game) {
         try {
            if (LevelEditor.game[o] instanceof R.resources.loaders.SpriteLoader) {
               LevelEditor.loaders.sprite.push(LevelEditor.game[o]);
            } else if (LevelEditor.game[o] instanceof R.resources.loaders.SoundLoader) {
               LevelEditor.loaders.sound.push(LevelEditor.game[o]);
            } else if (LevelEditor.game[o] instanceof R.resources.loaders.LevelLoader) {
               LevelEditor.loaders.level.push(LevelEditor.game[o]);
            } else if (LevelEditor.game[o] instanceof R.rendercontexts.AbstractRenderContext) {
               // The render context (if there's more than one, we'll need to update this)
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
	 * Get all game objects, or filter them by the provided function.
	 * @param fn {Function}
	 * @return {Array}
	 * @private
	 */
	getGameObjects: function(fn) {
		fn = fn || function(e) { return (e instanceof R.objects.SpriteActor || e instanceof R.objects.CollisionBox); };
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

		// TODO: Should do this somewhere else...
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
	 * Get the sprite's canonical name.
	 * "loaderIndex:resourceName:spriteName"
	 * 
	 * @param sprite {Sprite}
	 * @private
	 */
	getSpriteCanonicalName: function(sprite) {
		var loader = sprite.getSpriteLoader(), loaderIdx = 0;
		
		// Locate the sprite loader index
      for (var l in this.loaders.sprite) {
		  	if (loader === this.loaders.sprite) {
		  		loaderIdx = l;
		  		break;
		  	}
		}	         
	   
		// Return the canonical name which contains the loader index, resource name, and sprite name
		return loaderIdx + ":" + sprite.getSpriteResource().resourceName + ":" + sprite.getName();
	},

   /**
    * This is the main entry point when editing a game.  Providing the
    * {@link Game} object which is being edited gives the editor a chance
    * to find all of the resource loaders being used by the game, and
    * also locate other parts of the game which can be edited.  The editor
    * will create interfaces for working with the game's structure, plus
    * it will generate data objects for the level being edited.
    * @param game {Game} The <tt>Game</tt> object being edited
    */
	edit: function(game) {
      // Set the Game object which is being edited
      this.setGame(game);

		LevelEditor.currentLevel = {
		 	"id": -1,
		 	"name": "New Level"
		};

		// Load the dialogs and UI
		R.engine.Script.loadText(R.Engine.getEnginePath() + "/../tools/level_editor/dialogs.html", null, function(data) {
			LevelEditor.dialogBase = $("<div>").html(data);
			LevelEditor.startup();
		});		
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
					"items": function(obj) { return LevelEditor.contextMenu(obj); }	
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
				id = $(data.args[0]).parent().attr("id") || "";
			}
			LevelEditor.selectById(id);			
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

		/*
      // Update grid size
      tbar.append($("<span class='tool'>Grid Size:</span>"));
      tbar.append($("<input class='tool' type='text' size='3' value='16'/>").change(function() {
         if (!isNaN($(this).val())) {
            LevelEditor.gridSize = $(this).val();
         } else {
            $(this).val(LevelEditor.gridSize);
         }
      }));

      // Create collision rect
      tbar.append($("<input type='button' value='Collision Box' class='tool'/>").click(function() {
         LevelEditor.createCollisionBox();
      }));
		*/
		
      // We need a scrollbar to move the world
		var game = LevelEditor.getGame();
		var viewWidth = game.getRenderContext().getViewport().get().w;
      var sb = $("<div style='height: 25px; width: " + viewWidth + "px; overflow-x: auto;'><div style='width: " +
         game.getLevel().getFrame().get().w + "px; border: 1px dashed'></div></div>").bind("scroll", function() {
            game.getRenderContext().setHorizontalScroll(this.scrollLeft);
      });
      $(document.body).append(sb);

      // Add an event handler to the context
      var ctx = game.getRenderContext();
      ctx.addEvent(this, "mousedown", function(evt) {
         LevelEditor.selectObject(evt.pageX, evt.pageY);
         LevelEditor.mouseDown = true;
      });

      ctx.addEvent(this, "mouseup", function() {
         LevelEditor.mouseDown = false;
         LevelEditor.createPropertiesTable(LevelEditor.currentSelectedObject);
      });

      ctx.addEvent(this, "mousemove", function(evt) {
         if (LevelEditor.mouseDown) {
            LevelEditor.moveSelected(evt.pageX, evt.pageY);
         }
      });
		
		// Menu across the top
		var mb = {
			"File" : {
				"New" : function() { LevelEditor.newLevel(); return false; },
				"x1" : "separator",
				"Open" : function() { LevelEditor.openLevel(); return false; },
				"Save" : function() { LevelEditor.currentLevel.id == -1 ? LevelEditor.saveAs() : LevelEditor.saveLevel(); return false; },
				"Save As..." : function() { LevelEditor.saveAs(); return false; },
				"x2" : "separator",
				"Import" : function() { $("#ImportDialog").dialog("open"); return false; },
				"Export" : function() { LevelEditor.exportLevel(); return false; }
			},
			"Edit" : {
				"Copy Object": function() {},
				"x1" : "separator",
				"Delete Object": function() {},
				"x2" : "separator",
				"Scroll to Object" : function() {},
				"Freeze Object": function() {}
			},
			"Tools" : {
				"Level Properties": function() {},
				"x2" : "separator",
				"Options": function() {}
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
				"action": function() { /* noop */ },
				"submenu": {
					"actor": {
						"label": "Actor",
						"action": function() { LevelEditor.createActor(LevelEditor.defaultSprite); }
					},
					"collbox": {
						"label": "Collision Block",
						"action": function() { LevelEditor.createCollisionBox(); }
					},
					"trigger": {
						"label": "Trigger Block",
						"action": function() { LevelEditor.createTriggerBox(); }
					}
				}
			},
			"copy": {
				"label": "Clone Object",
				"_disabled": selObj == null,
				"separator_after": true,
				"action": function() { LevelEditor.copyObject(selObj); }
			},
			"jump": {
				"label": "Jump to...",
				"_disabled": selObj == null,
				"action": function() { LevelEditor.repositionViewport(selObj); }
			},
			"activate": {
				"label": "Freeze Object",
				"_disabled": selObj == null || !(selObj instanceof R.objects.SpriteActor),
				"action": function(){}
			},
			"action": {
				"label": "Actor Config",
				"_disabled": selObj == null || !(selObj instanceof R.objects.SpriteActor),
				"action": function(){ LevelEditor.showActorConfig(); },
				"separator_after": true
			},
			"delete": {
				"label": "Delete",
				"_disabled": selObj == null,
				"action": function() { LevelEditor.deleteObject(selObj); }
			}
		};
	},
	
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
				case "var": val = obj.getVariable(cName);
								el = $("<input type='text' size='20' name='" + cName + "' value='" + val + "'/>");
								break;
				case "script": val = obj.getActorEvent(cName);
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
	},

	/**
	 * Create a sprite actor object
	 * @param actorName {String} The canonical name of the sprite
	 * @private
	 */
   createActor: function(actorName) {
      var ctx = LevelEditor.gameRenderContext;
      var actor = R.objects.SpriteActor.create();
		
		// Set the sprite given the canonical name for it
      actor.setSprite(LevelEditor.getSpriteForName(actorName));

      // Adjust for scroll
      var s = ctx.getHorizontalScroll();
		
		var vPort = LevelEditor.gameRenderContext.getViewport().get();
		var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2); 
      var pT = R.math.Point2D.create(hCenter + s, vCenter);
      actor.setPosition(pT);
      actor.setZIndex(LevelEditor.nextZ++);
		
      ctx.add(actor);
      this.setSelected(actor);
		
		// Add the actor to the tree
		$("#editPanel div.sceneGraph").jstree("create","#sg_actors","last",{
	  		"attr": { "id": actor.getId() },
	  		"data": actor.getName() + " [" + actor.getId() + "]"
	  	},false,true);
		LevelEditor.dirty = true;
   },

	/**
	 * Create a collision box to impede movement
	 * @param {Object} game
	 * @private
	 */
   createCollisionBox: function() {
      var ctx = LevelEditor.gameRenderContext;
      var cbox = R.objects.CollisionBox.create();

      // Adjust for scroll
      var s = ctx.getHorizontalScroll();
		var vPort = ctx.getViewport();
		var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2); 
      var pT = R.math.Point2D.create(hCenter + s, vCenter);

      cbox.setPosition(pT);
      cbox.setBoxSize(80, 80);
      cbox.setZIndex(LevelEditor.nextZ++);
      ctx.add(cbox);
      this.setSelected(cbox);

		// Add the box to the tree
		$("#editPanel div.sceneGraph").jstree("create","#sg_fixture","last",{
	  		"attr": { "id": cbox.getId() },
	  		"data": cbox.getName() + " [" + cbox.getId() + "]"
	  	},false,true);
		LevelEditor.dirty = true;
   },

	/**
	 * Create a collision box that when touched triggers an action 
	 * @param {Object} game
	 * @private
	 */
   createTriggerBox: function() {
      var ctx = LevelEditor.gameRenderContext;
      var cbox = R.objects.CollisionBox.create();

      // Adjust for scroll
      var s = ctx.getHorizontalScroll();
		var vPort = ctx.getViewport();
		var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2); 
      var pT = R.math.Point2D.create(hCenter + s, vCenter);

      cbox.setPosition(pT);
      cbox.setBoxSize(80, 80);
      cbox.setZIndex(LevelEditor.nextZ++);
		cbox.setType(R.objects.CollisionBox.TYPE_TRIGGER);
      ctx.add(cbox);
      this.setSelected(cbox);

		// Add the box to the tree
		$("#editPanel div.sceneGraph").jstree("create","#sg_trigger","last",{
	  		"attr": { "id": cbox.getId() },
	  		"data": cbox.getName() + " [" + cbox.getId() + "]"
	  	},false,true);
		LevelEditor.dirty = true;
   },

	/**
	 * Copy an object and all of its properties into a new object of the same type
	 * @param obj {Object2D} The object to copy
	 * @private
	 */
	copyObject: function(obj) {
		obj = obj || LevelEditor.currentSelectedObject;
      if (obj != null) {
		  	var original = obj;
		  	
		  	// What type of object is this?
			if (obj instanceof R.objects.SpriteActor) {
				// Create a new actor
				var cName = LevelEditor.getSpriteCanonicalName(obj.getSprite());
				LevelEditor.createActor(cName);
			} else if (obj instanceof R.objects.CollisionBox) {
				LevelEditor.createCollisionBox();	
			} /* else if (obj instanceof TriggerBox) {
		 
		 	}*/

			var bean = LevelEditor.currentSelectedObject.getProperties(), origProps = original.getProperties();
			
			for (var p in bean) {
				// Regardless if the editable flag is true, if there is a setter, we'll
				// call it to copy the value over.
				if (bean[p][1]) {
					if (bean[p][1].multi && bean[p][1].multi === true) {
						// Multi-option
						bean[p][1].fn(origProps[p][0]());
					} else if (bean[p][1].checkbox && bean[p][1].checkbox === true) {
						// Checkbox toggle
					} else if (bean[p][1].editor && bean[p][1].editor === true) {
						// Custom editor
						bean[p][1].fn(origProps[p][0]());
					} else {
						// Single value
						bean[p][1](origProps[p][0]());
					}
				}
			}
			
			// If the object isn't in the current viewport, move it to the viewport's center
			// otherwise, offset it by half width and height down and to the right
			var newObj = LevelEditor.currentSelectedObject, 
				 ctx = LevelEditor.gameRenderContext, s = ctx.getHorizontalScroll(), pT;

			if (!ctx.getViewport().isIntersecting(newObj.getWorldBox())) {
				var vPort = LevelEditor.gameRenderContext.getViewport();
				var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2); 
		      pT = R.math.Point2D.create(hCenter + s, vCenter);
			} else {
				var offs = R.math.Point2D.create(newObj.getBoundingBox().getHalfWidth() + s, newObj.getBoundingBox().getHalfHeight());
				pT = R.math.Point2D.create(newObj.getRenderPosition()).add(offs);
				offs.destroy();
			}		

	      newObj.setPosition(pT);
			pT.destroy();
			
			// Make sure the label in the tree matches the new object's name and Id
			$("#editPanel div.sceneGraph").jstree("set_text", "#" + newObj.getId(), newObj.getName() + " [" + newObj.getId() + "]");		
		}
	},

	/**
	 * Select the object which is at the given coordinates
	 * @param {Object} x
	 * @param {Object} y
	 * @private
	 */
   selectObject: function(x, y) {
      this.deselectObject();

      // Adjust for context location
      var ctx = LevelEditor.gameRenderContext;
      x -= LevelEditor.contextOffset.left;
      y -= LevelEditor.contextOffset.top;

      // Check to see if this object falls on top of an object
      var pt = R.math.Point2D.create(x,y);
      var itr = ctx.iterator();
      itr.reverse();
      while (itr.hasNext()) {
         var obj = itr.next();
         if (obj.isEditable &&
               obj.getWorldBox().containsPoint(pt))
         {
            this.setSelected(obj);
            break;
         }
      }
      itr.destroy();
      pt.destroy();
   },

	/**
	 * Deselect the given object, or the currently selected object if "obj" is null
	 * @param {Object} obj
	 * @private
	 */
   deselectObject: function(obj) {
		var objId;
      if (obj == null) {
         if (this.currentSelectedObject) {
				objId = this.currentSelectedObject.getId();
            this.currentSelectedObject.setEditing(false);
            this.currentSelectedObject = null;
         }
      } else {
         obj.setEditing(false);
			objId = obj.getId();
      }

		// Deselect node in tree
		$("#editPanel div.sceneGraph").jstree("deselect_node", "#" + objId);
   },

	/**
	 * Delete the given object, or delete the currently selected object if "obj" is null
	 * @param {Object} obj
	 * @private
	 */
   deleteObject: function(obj) {
		var objId;
      if (obj == null) {
         if (this.currentSelectedObject) {
				objId = this.currentSelectedObject.getId();
            this.getGame().getRenderContext().remove(LevelEditor.currentSelectedObject);
            LevelEditor.currentSelectedObject.destroy();
            LevelEditor.currentSelectedObject = null;
         }
      } else {
			objId = obj.getId();
         this.getGame().getRenderContext().remove(obj);
         obj.destroy();
      }
      LevelEditor.createPropertiesTable(null);
		
		// Update the scene graph tree
		$("#editPanel div.sceneGraph").jstree("remove","#" + objId);
		LevelEditor.dirty = true;
   },

	/**
	 * Select an object by its Id
	 * @param {Object} objId
	 * @private
	 */
	selectById: function(objId) {
		LevelEditor.setSelected(LevelEditor.getObjectById(objId));
	},

	/**
	 * Set the selected object
	 * @param {Object} obj
	 * @private
	 */
   setSelected: function(obj) {
      LevelEditor.deselectObject();

		if (obj) {
	  		// Update the selection in the tree
			$("#editPanel div.sceneGraph").jstree("select_node", "#" + obj.getId());
		}
			
      LevelEditor.currentSelectedObject = obj;
		if (obj) {
	      obj.setEditing(true);
		}
      LevelEditor.createPropertiesTable(obj);
   },

	/**
	 * Move the currently selected object relative to the given coordinates
	 * @param {Object} x
	 * @param {Object} y
	 * @private
	 */
   moveSelected: function(x, y) {
      // Adjust for scroll and if the context was moved in the dom
      x += LevelEditor.gameRenderContext.getHorizontalScroll() - LevelEditor.contextOffset.left;
      y -= LevelEditor.contextOffset.top;

		var viewWidth = LevelEditor.gameRenderContext.getViewport().get().w;

      if (this.currentSelectedObject) {
         var grid = viewWidth / this.gridSize;
         x = x - x % this.gridSize;
         y = y - y % this.gridSize;
         var pt = R.math.Point2D.create(x, y);
         this.currentSelectedObject.setPosition(pt);
         pt.destroy();
      }
   },

	/**
	 * Create the table which will hold all of the given object's properties
	 * @param {Object} obj
	 * @private
	 */
   createPropertiesTable: function(obj) {
      // Remove any existing property table
      $("#propTable").remove();

      if (obj == null || this.currentSelectedObject == null) {
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
			"triggers": []
		};
		
		// Enumerate all of the actors
		var actors = LevelEditor.getGameObjects(function(e) {
			return (e instanceof R.objects.SpriteActor);
		});
		var cBlocks = LevelEditor.getGameObjects(function(e) {
			return (e instanceof R.objects.CollisionBox && e.getType() == R.objects.CollisionBox.TYPE_COLLIDER);
		});
		var tBlocks = LevelEditor.getGameObjects(function(e) {
			return (e instanceof R.objects.CollisionBox && e.getType() == R.objects.CollisionBox.TYPE_TRIGGER);
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
		
		// Open the dialog
		$("#exportInfo").val(JSON.stringify(lvlJSON,null,3));
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
				$("#editPanel div.sceneGraph").jstree("create",treeParent,"last",{
			  		"attr": { "id": newObj.getId() },
			  		"data": newObj.getName() + " [" + newObj.getId() + "]"
			  	},false,true);
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
			$("#editPanel div.sceneGraph").jstree("remove","#" + objs[i].getId());
			objs[i].destroy();
		}
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
		
		// Now the the formalities are out of the way, let's get to importing the data
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
			$("#editPanel div.sceneGraph").jstree("create","#sg_actors","last",{
		  		"attr": { "id": newObj.getId() },
		  		"data": newObj.getName() + " [" + newObj.getId() + "]"
		  	},false,true);
		}

		for (var f in lvlJSON["fixtures"]) {
			newObj = R.objects.CollisionBox.create();
			LevelEditor.storeObjectProperties(newObj, lvlJSON["fixtures"][f]);

			// Add the object to the context
			ctx.add(newObj);
			
			// Add the object to the scene graph
			$("#editPanel div.sceneGraph").jstree("create","#sg_fixture","last",{
		  		"attr": { "id": newObj.getId() },
		  		"data": newObj.getName() + " [" + newObj.getId() + "]"
		  	},false,true);
		}

		for (var t in lvlJSON["triggers"]) {
			newObj = R.objects.CollisionBox.create();
			newObj.setType(R.objects.CollisionBox.TYPE_TRIGGER);
			LevelEditor.storeObjectProperties(newObj, lvlJSON["triggers"][t]);

			// Add the object to the context
			ctx.add(newObj);
			
			// Add the object to the scene graph
			$("#editPanel div.sceneGraph").jstree("create","#sg_trigger","last",{
		  		"attr": { "id": newObj.getId() },
		  		"data": newObj.getName() + " [" + newObj.getId() + "]"
		  	},false,true);
		}
		
		// All good!
		$(dlg).dialog("close");
	}

});
};