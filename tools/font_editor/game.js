
/**
 * The Render Engine
 * FontEditor
 *
 * A tool for marking glyph boundaries in bitmapped fonts.
 *
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

// Load all required engine components
R.Engine.requires("/rendercontexts/context.htmldivcontext.js");
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/resourceloaders/loader.image.js");
R.Engine.requires("/textrender/text.renderer.js");
R.Engine.requires("/textrender/text.bitmap.js");
R.Engine.requires("/engine.timers.js");

Game.load("fontrender.js");

R.Engine.initObject("FontEditor", "Game", function() {

/**
 * @class Font Editor.  Fonts should be a single bitmap, 36px to 48px font,
 * with the following characters (in the exact order)
 * !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz
 */
var FontEditor = Game.extend({

   constructor: null,
   editorContext: null,
	testContext: null,
	fontDef: null,
	
	editorWidth: 6000,
	editorHeight: 100,
	
	testWidth: 430,
	testHeight: 50,
	
	testString: "The quick brown fox jumps over the lazy dog.",
	testString2: "!@#$%^&*()[]/?,.':;\" ABC WMX LIO",
	imageLoader: null,
	
	analyzed: false,
	mouseBtn: false,
	mouseLine: -1,
	
	fontBase: "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz",

	//testString: "@?>=<;:9876543210",
	//testString2: "ZYXWVUTSRQPONMLKJIHGFEDCBA",

   /**
    * Called to set up the game, download any resources, and initialize
    * the game to its running state.
    */
   setup: function() {
     $("#loading").remove();
	  $("#infoForm").css("display", "block");

      // Set the FPS of the game
      R.Engine.setFPS(5);
		
		$("#fontURL").val(R.Engine.getEnginePath() + "/fonts/century_gothic_36.png");
		$("#fontDef").val("");

		// The font file can be specified as a command parameter
		var fontFile = R.engine.Support.getStringParam("fontFile");
		
		// Check to see if a JS file exists for the font
		//var fontJS = Game.loadEngineScript("fonts/" + fontFile + ".js");

		// Create a div we can scroll the canvas within
		var div = HTMLDivContext.create("div", 800, 120);
		div.jQ().css("overflow-x", "auto");

		R.Engine.getDefaultContext().add(div);

      // Create the editor's 2D context
      this.editorContext = CanvasContext.create("editor", this.editorWidth, this.editorHeight);
		this.editorContext.setWorldScale(2);
		
		// The editor context is static.  We'll update it as needed
		this.editorContext.setStatic(true);
      div.add(this.editorContext);
      this.editorContext.setBackgroundColor("black");

		// Create the test context where the font will be rendered to
		this.testContext = CanvasContext.create("testing", this.testWidth, this.testHeight);
		this.testContext.setWorldScale(1);
		this.testContext.setStatic(true);
		R.Engine.getDefaultContext().add(this.testContext);
		this.testContext.setBackgroundColor("black");
		this.testContext.jQ().css({
			position: "absolute",
			left: 140,
			top: 217
		});
		
		this.imageLoader = ImageLoader.create();

		// Set some event handlers
		var self = this;
		this.editorContext.addEvent(this, "mousedown", function(evt) {
			
			function near(pos) {
				return (self.fontDef.letters[pos - 1] == "X" ||
						 self.fontDef.letters[pos] == "X" ||
						 self.fontDef.letters[pos + 1] == "X");
			}
			
			function at(pos) {
				return (self.fontDef.letters[pos - 1] == "X" ? pos - 1 :
						  self.fontDef.letters[pos + 1] == "X" ? pos + 1 : pos);
			}
			
			self.mouseBtn = true;
			var pos = self.mouseLine;
			var h = parseInt($("#fontHeight").val()) * 2;
			// This allows manual adjustment of automatic glyph dividers
			if (!near(pos)) {
				self.fontDef.letters[pos] = "X";
				self.editorContext.setLineStyle("#8888ff");
				self.editorContext.drawLine(Point2D.create(pos,0), Point2D.create(pos, h));
				self.checkFont();
			} else {
				self.fontDef.letters[at(pos)] = null;
				self.editorContext.setLineStyle("black");
				self.editorContext.drawLine(Point2D.create(at(pos),0), Point2D.create(at(pos), h));
				self.checkFont();
			}
		});

		this.editorContext.addEvent(this, "mouseup", function(evt) {
			self.mouseBtn = false;
		});

		this.editorContext.addEvent(this, "mousemove", function(evt) {
			var pos = evt.clientX + $(this).parent().scrollLeft();
			self.mouseLine = pos;
		});
		
		// Default font definition
		this.fontDef = {
		   "name": "",
		   "width": 0,
		   "height": 0,
		   "kerning": 0.88,
		   "space": 20,
		   "upperCaseOnly": false,
		   "bitmapImage": "",
		   "letters": {}
		};
		
		this.linkEditors();
   },

   /**
    * Called when a game is being shut down to allow it to clean up
    * any objects, remove event handlers, destroy the rendering context, etc.
    */
   teardown: function() {
		this.editorContext.removeEvent("mousedown");
		this.editorContext.removeEvent("mouseup");
		this.editorContext.removeEvent("mousemove");
      this.editorContext.destroy();
		this.testContext.destroy();
   },

	//===============================================================================================
	// Editor Functions

	getImageLoader: function() {
		return this.imageLoader;
	},

	linkEditors: function() {
		var self = this;
		$("#loadFile").click(function() {
			self.testContext.cleanUp();
			var url=$("#fontURL").val();
			self.imageLoader.load("font", url, $("#fontWidth").val(), $("#fontHeight").val());
			self.imageTimeout = Timeout.create("foo", 100, function() {
				self.waitForResources();
			});
		});
		
		$("#generate").click(function() {
			self.checkFont();
		})
	},

	waitForResources: function() {
		if (this.imageLoader.isReady()) {
			this.imageTimeout.destroy();
			this.run();
		} else {
			this.imageTimeout.restart();
		}
	},
	
	run: function() {
		var self = this;
		this.editorContext.cleanUp();
		this.editorContext.add(FontRender.create("font"));
		this.editorContext.reset();
		this.editorContext.render(R.Engine.worldTime);
		$("#minAlpha").val(this.getAveragePixelDensity());
		$("#analyze").click(function() {
			self.editorContext.reset();
			self.editorContext.render(R.Engine.worldTime);
			self.analyze();
		});
	},

	getAveragePixelDensity: function() {
		var pixD = 0;
		var w = parseInt($("#fontWidth").val()) * 2;
		for (var x = 0; x < w; x++) {
			pixD += this.getPixelDensity(x);
		}
		return Math.floor((pixD / w) * 255);
	},

	/**
	 * Automatically analyze a font image, looking for breaks between character
	 * glyphs.  If there are multiple rows with zero filled pixels, find the
	 * median between them.  If there aren't any rows containing zero pixels, find
	 * the one with the least number of overlapped pixels.  Builds a dense array of
	 * possible divider positions.
	 */
	analyze: function() {
		var rowNum = 1;
		this.fontDef.letters = {};
		var w = parseInt($("#fontWidth").val()) * 2;
		var h = parseInt($("#fontHeight").val()) * 2;
		this.fontDef.letters[0] = "X";
		this.fontDef.letters[w] = "X";
		this.editorContext.setLineStyle("orange");
		this.editorContext.drawLine(Point2D.create(0,0), Point2D.create(0, h));
		this.editorContext.drawLine(Point2D.create(w,0), Point2D.create(w, h));

		this.editorContext.setLineStyle("yellow");
		do {
			var d = this.getPixelDensity(rowNum);
			rowNum++;
			if (d == 0) {
				// Possible letter boundary, check the density of the next rows
				// until we find one that is higher than zero
				var nextRow = rowNum + 1;
				while (nextRow < w && this.getPixelDensity(nextRow) < 1) {
					nextRow++;
				};
				nextRow--; 
				// If nextrow and rownum are not the same, find the median
				var med = 0;
				if (rowNum != nextRow) {
					med = Math.floor((nextRow - rowNum) / 2);
				}
				rowNum += med;
				this.editorContext.drawLine(Point2D.create(rowNum,0), Point2D.create(rowNum, h));
				this.fontDef.letters[rowNum] = "X";
				rowNum = nextRow + 1;
			} else {
				// For now, we'll just assume another charater is being processed.
				rowNum++;
			}
		} while (rowNum < w - 1);
		this.analyzed = true;
		this.checkFont();
	},
	
	/**
	 * Get the row of pixels at the specified row.
	 * @param rowNum {Number} The row to analyze
	 * @return {Array} The array of pixels in the row
	 */
	getPixelRow: function(rowNum) {
		var h = parseInt($("#fontHeight").val()) * 2;
		var rect = Rectangle2D.create(rowNum, 0, 1, h);
		return this.editorContext.getImage(rect);
	},
	
	/**
	 * Count the pixels in the given row.
	 * @param rowNum {Number} The row to analyze
	 */
	getPixelDensity: function(rowNum) {
		var h = parseInt($("#fontHeight").val()) * 2;
		var d = 0;
		var r = this.getPixelRow(rowNum);
		var min = parseInt($("#minAlpha").val());
		for (var y = 3; y < 4*h; y+=4) {
			d |= (r.data[y] > min ? 1 : 0);
		}
		return d;	
	},
	
	/**
	 * Check to see if all of the required character slots
	 * are filled.  If so, render the test string with the
	 * new font and generate the font definition.
	 */
	checkFont: function() {
		//var req = $("#fontUpper").val() == "on" ? 58 : this.fontBase.length;
		var ltrs = [];
		var ltrCount = 0;
		for (var l in this.fontDef.letters) {
			if (this.fontDef.letters[l] == "X") {
				ltrCount++;
				var z = parseInt(l);
				ltrs.push(Math.round(z / 2));
			}
		}
		ltrs.sort(function(a,b) {
			return parseInt(a) - parseInt(b);
		});
		$("#identified").text(ltrs.length);
		if (ltrs.length == 91) {
			var outDef = $.extend({}, this.fontDef);
			outDef.name = $("#fontName").val();
			outDef.width = parseInt($("#fontWidth").val());
			outDef.height = parseInt($("#fontHeight").val());
			outDef.kerning = Number($("#fontKerning").val());
			outDef.space = parseInt($("#fontSpace").val());
			outDef.size = parseInt($("#fontSize").val());
			outDef.bitmapImage = $("#fontURL").val().substr($("#fontURL").val().lastIndexOf("/") + 1);
			outDef.letters = ltrs;
			var reg = "// Generated by The Render Engine font editor\n// Copyright (c) 2011 Brett Fattori\n";
			$("#fontDef").val(reg + JSON.stringify(outDef));
			
			// Highlight the letters
			this.highlight();
			
			// Build a quick test
			this.buildTest();
		} else {
			$("#fontDef").val("");
		}	
	},
	
	highlight: function() {
		//this.editorContext.render(R.Engine.worldTime);
	},
	
	buildTest: function() {
		// We're going to fake the loading of a bitmap font so the
		// bitmap text renderer will work
		window.BitmapFontLoader = {};
		var fDef = new Function($("#fontDef").val() + " return BitmapFontLoader.font;");
		var font = {
			image: this.imageLoader.get("font"),
			info: fDef()
		};
		this.testContext.cleanUp();
      
		var tW = $("#fontBold")[0].checked ? 2 : 1;
		
		var bText = TextRenderer.create(BitmapText.create(font), this.testString, 0.5);
      bText.setPosition(Point2D.create(2, 2));
      bText.setTextWeight(tW);
      bText.setColor("#ff00ff");
      this.testContext.add(bText);

		var bText2 = TextRenderer.create(BitmapText.create(font), this.testString2, 0.5);
      bText2.setPosition(Point2D.create(2, 25));
      bText2.setTextWeight(tW);
      bText2.setColor("#ff00ff");
      this.testContext.add(bText2);
		
		this.testContext.reset();
		this.testContext.render(R.Engine.worldTime);
	}
	
});

return FontEditor;

});

