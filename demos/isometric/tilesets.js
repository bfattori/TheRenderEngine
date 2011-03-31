

R.Engine.requires("/resourceloaders/loader.image.js");
R.Engine.requires("/resourceloaders/loader.object.js");
R.Engine.requires("/engine.timers.js");


R.Engine.initObject("TileSets", "PooledObject", function() {

/**
 * @class Loads a tilesets object file which can describe one or more tile sets.
 * 		 A tilesets object file has a very specific format which describes each
 * 		 tile set and the tiles within it.  A tilesets object file can have any
 * 		 number of tile sets within it, as long as the tile set names are unique.
 *        <p/>
 *        The format of a tilesets object file might look like the following:
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
 *        As you can see, each tile set is a separate object within the tilsets
 *        object file.  Each tile set has a tile name, followed by the image
 *        which represents the tile.  Tile names do not need to be unique among
 *        tilesets, but must be unique <i>within a single tile set</i>. 
 *
 * @constructor
 * @param name {String} The name of the tilesets object
 * @param filename {String} The file which contains the tilesets object
 * @description Create a tilesets object from which tiles can be accessed.
 * @extends PooledObject
 */
	var TileSets = PooledObject.extend(/** @scope TileSets.prototype */{
	
		tileLoader: null,
		imageLoader: null,
	
		tiles: null,
		tilesFile: null,
		
		tileInfos: null,
		
		ready: false,
	
		/**
		 * @private 
		 */
		constructor: function(name, filename) {
			this.base(name);
			this.tilesFile = filename;
	      this.tileLoader = ObjectLoader.create();
	      this.imageLoader = ImageLoader.create();
			this.ready = false;
			this.tileInfos = {};
			
			this.tileLoader.load("tiles", filename);
			var self = this;
	      Timeout.create("tilewait", 250, function() {
				if (self.tileLoader.isReady()) {
					this.destroy();
					self.loadTileImages();
					return;
				} else {
					this.restart();
				}
			});
		},
		
		/**
		 * Load the images associated with all of the tiles in
		 * all of the tilesets that are within the tileset file.
		 * @private
		 */
		loadTileImages: function() {
			// Get the tileset descriptor
			this.tiles = this.tileLoader.get("tiles");
			var path = R.engine.Support.getPath(this.tilesFile);
			
			// Load the images within the tileset(s)
			for (var tileset in this.tiles) {
				var tSet = this.tiles[tileset];
				this.tileInfos[tileset] = {};
				var setInfo = this.tileInfos[tileset];
				for (var t in tSet) {
					var tileName = tileset + ":" + t;

					// Currently, info only contains the image and the origin but
					// could potentially contain more information in the future
					var img = tSet[t][0];
					setInfo[t] = {
						origin: Point3D.create(tSet[t][1][0], tSet[t][1][1], 0)
					}
					
					// Load the image file
					this.imageLoader.load(tileName, path + "/" + img);
				} 	
			}
			
			// Now we wait until the tile images are loaded
			var self = this;
			Timeout.create("imagewait", 250, function() {
				if (self.imageLoader.isReady()) {
					this.destroy();
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
		
		/**
		 * Get an <code>Image</code> object which represents a tile's image.
		 * 
		 * @param tileset {String} The tileset where the tile image exsist
		 * @param name {String} The name of the tile
		 * @return {Image}
		 */
		getTileImage: function(tileset, name) {
			return this.imageLoader.get(tileset + ":" + name);		
		},
		
		/**
		 * Get the tile info object for the specified tile
		 * @return {Object}
		 */
		getTileInfo: function(tileset, name) {
			return this.tileInfos[tileset][name];
		}
		
	}, /** @scope TileSets.prototype */{
		getClassName: function(){
	  		return "TileSets";
	   }
	});

	return TileSets;
});