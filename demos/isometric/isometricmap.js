

R.Engine.requires("/rendercontexts/context.htmldivcontext.js");
R.Engine.requires("/resourceloaders/loader.object.js");
R.Engine.requires("/engine.timers.js");
R.Engine.requires("/engine.math2d.js");
R.Engine.requires("/components/component.mouseinput.js");
R.Engine.requires("/engine.events.js");


R.Engine.initObject("IsometricMap", "BaseObject", function() {

/**
 * @class Loads a tileset object file which can describe one or more tile sets.
 * 		 A tileset object file has a very specific format which describes each
 * 		 tileset and the tiles within it.  A tileset object file can have any
 * 		 number of tilesets within it, as long as the tileset names are unique.
 *        <p/>
 *        The format of a tileset object file might look like the following:
 <pre>
{
   "set1": {
      "tile1": "tile1_img.png",
      "tile2": "tile2_img.png"
   },
   "set2": {
      "tile1": "tile1a_img.png",
      "tileX": "tilex.png"
   }
}
 </pre>
 *        As you can see, each tile set is a separate object within the tilset
 *        object file.  Each tileset has a tile name, followed by the image
 *        which represents the tile.  Tile names do not need to be unique among
 *        tilesets, but must be unique <i>within a single tileset</i>. 
 *
 * @constructor
 * @param name {String} The name of the tileset object
 * @param filename {String} The file which contains the tileset object
 * @description Create a tileset object from which tiles can be accessed.
 * @extends BaseObject
 */
	var IsometricMap = BaseObject.extend(/** @scope IsometricMap.prototype */{
	
		mapLoader: null,
		mapFile: null,
		mapName: null,
		ready: false,
		tileSize: null,
		terrain: null,
		objects: null,
		map: null,
		rebuild: false,
		tileset: null,
		
		layers: null,
		mouseDown: false,
		downScrollPos: null,
	
		/**
		 * @private 
		 */
		constructor: function(name, filename, tileSize) {
			this.base("IsometricMap");			
			this.mapName = name;
			this.mapFile = filename;
	      this.mapLoader = ObjectLoader.create();
			this.ready = false;
			this.tileSize = tileSize;
			this.map = null;
			this.rebuild = true;
			this.layers = [];
			this.mouseDown = false;
			this.downScrollPos = Point2D.create(0,0);
			
			// Assign the default mouse handlers
			MouseInputComponent.assignMouseHandlers();
			
			this.mapLoader.load(name, filename);
			var self = this;
	      Timeout.create("mapwait", 250, function() {
				if (self.mapLoader.isReady()) {
					this.destroy();
					self.map = self.mapLoader.get(self.mapName);
					self.ready = true;
					return;
				} else {
					this.restart();
				}
			});
		},
		
		/**
		 * Returns <code>true</code> when all of the tile images have been loaded.
		 * @return {Boolean}
		 */
		isReady: function() {
			return this.ready;
		},
		
		setTileSets: function(tileset) {
			this.tileset = tileset;
		},
		
		getWidth: function() {
			return this.map.size[0];
		},
		
		getHeight: function() {
			return this.map.size[1];
		},
		
		build: function(renderContext, time) {
			if (this.rebuild) {

				// Convert the map into a X by Y array which can be filled with more data as needed
				this.terrain = [];
				this.objects = [];
				
				// First, draw the filler
				for (var x = 0; x < this.map.size[0]; x++) {
					this.terrain[x + 1] = [];
					for (var y = 0; y < this.map.size[1]; y++) {
						this.terrain[x + 1][y + 1] = {
							dirty: true,
							tileset: this.map.fill[0],
							tile: this.map.fill[1]
						};
					}
				}
				
				var mapOffsX = Math.floor(this.map.size[0] / 2);
				var mapOffsY = Math.floor(this.map.size[1] / 2);
				
				// Now read out the terrain features and store them
				var terr = this.map.terrain;
				if (terr != null) {
					for (var t in this.map.terrain.tiles) {
						for (var l = 0; l < this.map.terrain.tiles[t][1].length; l++) {
							this.terrain[this.map.terrain.tiles[t][1][l][0] + mapOffsX][this.map.terrain.tiles[t][1][l][1] + mapOffsY] = {
								dirty: true,
								tileset: this.map.terrain.tileset,
								tile: this.map.terrain.tiles[t][0]
							};
						}
					}
				}
				
				mapOffsX += 1;
				// Finally, read out the object groups and store them
				var objs = this.map.objects;
				if (objs != null) {
					for (var g in objs) {
						var objGroup = objs[g];
						for (var p in objGroup.props) {
							for (var o = 0; o < objGroup.props[p][1].length; o++) {
								this.objects.push({
									pos: Point2D.create(objGroup.props[p][1][o][0] + mapOffsX, objGroup.props[p][1][o][1] + mapOffsY),
									tileset: objGroup.tileset,
									tile: objGroup.props[p][0], 
									dirty: true
								});
							}
						}
					}
				}
			 	
				if (this.layers[0] != null) {
					this.layers[0].empty();
					this.layers[1].empty();
				} else {
					this.layers[0] = $("<div id='terrain'>").css({
						position: "absolute",
						top: 0,
						left: 0
					});
					this.layers[1] = $("<div id='objects'>").css({
						position: "absolute",
						top: 0,
						left: 0
					});
					// Add the layers to the context
					renderContext.jQ().append(this.layers[0]);
					renderContext.jQ().append(this.layers[1]);
				}
				
				var worldOffsX = Math.floor(this.map.size[0]);
				var worldOffsY = -Math.floor(this.map.size[1]/2);
				
			 	// Render the changes to the context only
				var ts = this.tileSize.get();
				var xOffs = ts.x * worldOffsX;
				var yOffs = ts.y * worldOffsY;
				for (var y = 0; y < this.map.size[1]; y++) {
					for (var x = 0; x < this.map.size[0]; x++) {
						var pt = Point3D.create(xOffs + (ts.x * x), yOffs + (ts.y * y), 0);
						var ptp = pt.project();
						pt.destroy();
						var t = this.tileset.getTileImage(this.terrain[x + 1][y + 1].tileset, this.terrain[x + 1][y + 1].tile);
						var tile = $(t).clone().css({
							position: "absolute",
							top: ptp.get().y,
							left: ptp.get().x
						});
						ptp.destroy();
						this.layers[0].append(tile);
					}
					xOffs -= ts.x;
				}

				// Render the objects, sorted by Y
				this.objects.sort(function(a, b) {
					return a.pos.get().y - b.pos.get().y;
				});
				
				var yOffs = ts.y * worldOffsY;
				for (var o = 0; o < this.objects.length; o++) {
					var obj = this.objects[o];
					var xOffs = (ts.x * worldOffsX) - (ts.x * obj.pos.get().y);
					var pt = Point3D.create(xOffs + (ts.x * obj.pos.get().x), yOffs + (ts.y * obj.pos.get().y), 0);
					var info = this.tileset.getTileInfo(obj.tileset, obj.tile);
					pt.sub(info.origin);
					var ptp = pt.project();
					pt.destroy();
					var t = this.tileset.getTileImage(obj.tileset, obj.tile);
					var tile = $(t).clone().css({
						position: "absolute",
						top: ptp.get().y,
						left: ptp.get().x
					});
					ptp.destroy();
					this.layers[1].append(tile);
				}

				// Center the map
				renderContext.jQ()
					.scrollTop(renderContext.jQ()[0].scrollHeight / 2.2)
					.scrollLeft(renderContext.jQ()[0].scrollWidth / 2.2);
			
			}
			
			this.rebuild = false;
		},
		
		update: function(renderContext, time) {
			// This should only happen once
			this.build(renderContext, time);
			
			// Check for mouse movement
			var mInfo = renderContext.MouseInputComponent_mouseInfo;
			if (!this.mouseDown && mInfo.button == EventEngine.MOUSE_LEFT_BUTTON) {
				this.mouseDown = true;
				this.downScrollPos.set(renderContext.jQ().scrollLeft(),renderContext.jQ().scrollTop());
			} else if (this.mouseDown && mInfo.button == EventEngine.MOUSE_NO_BUTTON) {
				this.mouseDown = false;
			}
			
			if (this.mouseDown === true) {
				// Check to see if the mouse has been moved
				var sVec = Vector2D.create(this.downScrollPos);
				sVec.add(mInfo.dragVec);
				renderContext.jQ().scrollLeft(sVec.get().x).scrollTop(sVec.get().y);
				sVec.destroy();
			}
		}

	}, /** @scope IsometricMap.prototype */{
		getClassName: function() {
			return "IsometricMap";
		}
	});

	return IsometricMap;
});