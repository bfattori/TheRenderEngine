/**
 * The Render Engine
 * SpriteEditor
 *
 * Demonstration of using The Render Engine.
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
R.Engine.define({
   "class": "SpriteEditor",
   "requires": [
      "R.engine.Game",
      "R.rendercontexts.CanvasContext",
      "R.lang.Iterator",

      // Persistent storage to save level
      "R.storage.PersistentStorage",

      // Math objects
      "R.math.Math2D",
      "R.math.Point2D",
      "R.math.Vector2D",
      "R.math.Rectangle2D"
   ],

   // Game class dependencies
   "depends": [
      "SpriteLayer",
      "SpriteGrid",
      "SpritePreview",
      "ColorSelector"
   ]
});

// Load objects
R.engine.Game.load("/layer.js");
R.engine.Game.load("/grid.js");
R.engine.Game.load("/preview.js");
R.engine.Game.load("/color_select.js");

/**
 * @class A sprite editor for creating sprite resources for
 *        use in a 2D sprite-based game.  The editor has the capability
 *        to create single-frame and animated sprites.  Methods are
 *        provided to manipulate the sprites, such as: mirroring, inverting,
 *        shifting, and more.
 */
var SpriteEditor = function() {
   return R.engine.Game.extend({

      constructor: null,
      editorContext: null,
      pixSize: 16,
      editorSize: 512,
      currentColor: "white",
      currentLayer: null,
      renderFrame: null,
      mouseBtn: 0,
      drawMode: 0,
      colorSelector: null,
      brushSize: [0,0],
      grid: null,
      previewImage: null,
      editColor: 0,
      mirrorVert: false,
      mirrorHorz: false,
      frames: [],
      frameIdx: 0,
      pixOffset: [],
      noPixels: true,
      pStore: null,

      /**
       * Called to set up the editor, download any resources, and initialize
       * the editor to its running state.
       */
      setup: function() {
         // Link to persistent storage
         SpriteEditor.pStore = R.storage.PersistentStorage.create("SpriteEditor");

         // Load settings from storage
         this.pixSize = this.pStore.load("pixelSize") || 16;

         $("#controls").css("display", "block");
         $("#menuBar").css("display", "block");

         // Set the FPS so drawing speed is resonable
         R.Engine.setFPS(30);

         this.recalcOffset();

         // Create the 2D context
         this.editorContext = R.rendercontexts.CanvasContext.create("editor", this.editorSize, this.editorSize);
         this.editorContext.setWorldScale(1);
         R.Engine.getDefaultContext().add(this.editorContext);
         this.editorContext.setBackgroundColor("black");

         // The place where previews will be generated
         this.previewContext = SpritePreview.create();
         this.previewContext.setWorldScale(1);
         this.previewContext.setBackgroundColor("black");
         R.Engine.getDefaultContext().add(this.previewContext);

         // Set some event handlers
         var self = this;
         this.editorContext.addEvent(this, "mousedown", function(evt) {
            self.mouseBtn = true;
            switch (self.drawMode) {
               case SpriteEditor.PAINT : self.setPixel(evt.pageX + self.pixOffset[0], evt.pageY + self.pixOffset[1]);
                  break;
               case SpriteEditor.ERASE : self.clearPixel(evt.pageX + self.pixOffset[0], evt.pageY + self.pixOffset[1]);
                  break;
               case SpriteEditor.SELECT : self.getPixel(evt.pageX + self.pixOffset[0], evt.pageY + self.pixOffset[1]);
                  break;
            }
         });

         this.editorContext.addEvent(this, "mouseup", function(evt) {
            self.mouseBtn = false;
         });

         this.editorContext.addEvent(this, "mousemove", function(evt) {
            if (self.mouseBtn) {
               switch (self.drawMode) {
                  case SpriteEditor.PAINT : self.setPixel(evt.pageX + self.pixOffset[0], evt.pageY + self.pixOffset[1]);
                     break;
                  case SpriteEditor.ERASE : self.clearPixel(evt.pageX + self.pixOffset[0], evt.pageY + self.pixOffset[1]);
                     break;
                  case SpriteEditor.SELECT : self.getPixel(evt.pageX + self.pixOffset[0], evt.pageY + self.pixOffset[1]);
                     break;
               }
            }
         });

         // Add the first frame
         this.renderFrame = this.addFrame();
         this.editorContext.add(this.renderFrame);
         this.currentLayer = this.renderFrame;

         // Set a click event for the first frame in the frame manager
         $(".frames ul li.currentFrame").click(function() {
            SpriteEditor.setCurrentFrame($(".frames ul li").index(this));
         });

         // Generate the grid
         this.grid = SpriteGrid.create();
         this.editorContext.add(this.grid);
         this.grid.setVisible(SpriteEditor.pStore.load("drawGrid", true));

         // Finally, add the controls
         this.addControls();
      },

      /**
       * Called when the editor is being shut down to allow it to clean up
       * any objects, remove event handlers, destroy the rendering context, etc.
       */
      teardown: function() {
         this.editorContext.removeEvent("mousedown");
         this.editorContext.destroy();
      },

      //===============================================================================================
      // Editor Functions

      recalcOffset: function() {
         this.pixOffset = [-Math.floor(this.pixSize * 0.5), -($("#menuBar").height() + Math.floor(this.pixSize * 0.5))];
      },

      /**
       * Set the current frame being displayed in the editor.
       *
       * @param [frameIdx] {Number} The frame index, or <tt>null</tt> for the current frame
       */
      setCurrentFrame: function(frameIdx) {
         frameIdx = frameIdx || this.frameIdx;
         this.currentLayer = this.frames[frameIdx];
         this.editorContext.replace(this.renderFrame, this.currentLayer);
         this.renderFrame = this.currentLayer;
         $(".frames ul li.currentFrame").removeClass("currentFrame");
         $(".frames ul li:eq(" + frameIdx + ")").addClass("currentFrame");
      },

      /**
       * Add a new, empty frame to the set of frames in the sprite.
       * @return {SpriteLayer} The newly added frame layer
       */
      addFrame: function() {
         var frame = SpriteLayer.create();
         this.frames.push(frame);
         return frame;
      },

      /**
       * Delete the frame at the given index, or the currently selected frame.
       * @param [frameIdx] {Number} The index of the frame to delete, or <tt>null</tt> to
       *        delete the currently selected frame.
       */
      deleteFrame: function(frameIdx) {
         frameIdx = frameIdx || this.frameIdx;
         this.frames.splice(frameIdx, 1);
         this.setCurrentFrame();
      },

      /**
       * Navigate the frame manager to the previous frame and update
       * the editor to reflect that frame's state.
       */
      prevFrame: function() {
         this.frameIdx--;
         if (this.frameIdx < 0) {
            this.frameIdx = 0;
         }
         this.setCurrentFrame();
      },

      /**
       * Navigate the frame manager to the next frame and update
       * the editor to reflect that frame's state.
       */
      nextFrame: function() {
         this.frameIdx++;
         if (this.frameIdx == this.frames.length) {
            this.frameIdx = this.frames.length - 1;
         }
         this.setCurrentFrame();
      },

      /**
       * Set the pixel, at the given coordinates, to the currently selected
       * foreground color.
       *
       * @param x {Number} The X coordinate
       * @param y {Number} The Y coordinate
       */
      setPixel: function(x, y) {
         this.noPixels = false;
         for (var xB = 0; xB < SpriteEditor.brushSize[0] + 1; xB++) {
            for (var yB = 0; yB < SpriteEditor.brushSize[1] + 1; yB++) {
               SpriteEditor.currentLayer.addPixel(x + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               var d = [256 - x, 256 - y];
               if (this.mirrorHorz) {
                  SpriteEditor.currentLayer.addPixel((256 + d[0]) + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               }
               if (this.mirrorVert) {
                  SpriteEditor.currentLayer.addPixel(x + (xB * SpriteEditor.pixSize), (256 + d[1]) + (yB * SpriteEditor.pixSize));
               }
            }
         }
      },

      /**
       * Clear the pixel at the given coordinates.
       *
       * @param x {Number} The X coordinate
       * @param y {Number} The Y coordinate
       */
      clearPixel: function(x, y) {
         for (var xB = 0; xB < SpriteEditor.brushSize[0] + 1; xB++) {
            for (var yB = 0; yB < SpriteEditor.brushSize[1] + 1; yB++) {
               SpriteEditor.currentLayer.clearPixel(x + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               var d = [256 - x, 256 - y];
               if (this.mirrorHorz) {
                  SpriteEditor.currentLayer.clearPixel((256 + d[0]) + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               }
               if (this.mirrorVert) {
                  SpriteEditor.currentLayer.clearPixel(x + (xB * SpriteEditor.pixSize), (256 + d[1]) + (yB * SpriteEditor.pixSize));
               }
            }
         }
      },

      /**
       * Shift all pixels within the sprite up one row, wrapping at the top row.
       */
      shiftUp: function() {
         SpriteEditor.currentLayer.shiftUp();
      },

      /**
       * Shift all pixels within the sprite down one row, wrapping at the bottom row.
       */
      shiftDown: function() {
         SpriteEditor.currentLayer.shiftDown();
      },

      /**
       * Shift all pixels within the sprite left one column, wrapping at the left column.
       */
      shiftLeft: function() {
         SpriteEditor.currentLayer.shiftLeft();
      },

      /**
       * Shift all pixels within the sprite right one column, wrapping at the right column.
       */
      shiftRight: function() {
         SpriteEditor.currentLayer.shiftRight();
      },

      /**
       * Flip all pixels within the sprite vertically.
       */
      flipVertical: function() {
         SpriteEditor.currentLayer.flipVertical();
      },

      /**
       * Flip all pixels within the sprite horizontally.
       */
      flipHorizontal: function() {
         SpriteEditor.currentLayer.flipHorizontal();
      },

      /**
       * Toggle horizontal mirroring on or off.
       */
      hMirrorToggle: function() {
         var self = this;
         setTimeout(function() {
            var mode = $(".mirror-horizontal").hasClass("on");
            self.grid.setMirrorHorizontal(mode);
            self.mirrorHorz = mode;
         }, 10);
      },

      /**
       * Toggle vertical mirroring on or off.
       */
      vMirrorToggle: function() {
         var self = this;
         setTimeout(function() {
            var mode = $(".mirror-vertical").hasClass("on");
            self.grid.setMirrorVertical(mode);
            self.mirrorVert = mode;
         }, 10);
      },

      /**
       * Set the drawing mode current operation.
       * @param obj {HTMLElement} The element which corresponds to one of the UI buttons
       * @private
       */
      setDrawMode: function(obj) {
         if ($(obj).hasClass("paintbrush")) {
            SpriteEditor.drawMode = SpriteEditor.PAINT;
            $(".drawicon.eraser").removeClass("on");
            $(".drawicon.dropper").removeClass("on");
         } else if ($(obj).hasClass("eraser")) {
            SpriteEditor.drawMode = SpriteEditor.ERASE;
            $(".drawicon.paintbrush").removeClass("on");
            $(".drawicon.dropper").removeClass("on");
         } else if ($(obj).hasClass("dropper")) {
            SpriteEditor.drawMode = SpriteEditor.SELECT;
            $(".drawicon.paintbrush").removeClass("on");
            $(".drawicon.eraser").removeClass("on");
         }
      },

      /**
       * Get the color of the pixel at the given coordinates, setting the
       * current foreground color appropriately.
       *
       * @param x {Number} The X coordinate
       * @param y {Number} The Y coordinate
       */
      getPixel: function(x, y) {
         var colr = SpriteEditor.currentLayer.getPixel(x, y);
         if (colr) {
            $("#curColor").val(colr);
            SpriteEditor.currentColor = colr;
            $(".colorTable .selectedColor").css("background", colr);
         }
      },

      setPixelSize: function(size) {
         var doIt = false;
         if (this.frameIdx == 0 && this.frames.length == 1 && this.noPixels) {
            doIt = true;
         } else {
            doIt = confirm("Changing the pixel size will clear any current frames and reset to frame zero.  Are you sure you want to do this?");
         }

         if (doIt) {
            this.frames = [];
            this.frameIdx = 0;
            this.pixSize = size;
            this.recalcOffset();
            $(".frames ul").empty();
            this.actionNewFrame();
            this.noPixels = true;

            // Store the selection for next time
            SpriteEditor.pStore.save("pixelSize", size);

         }
      },

      /**
       * Set the drawing color to the given hexadecimal color value.
       *
       * @param hexColor {String} The hexidecimal color value in HTML notation (i.e. #aabbcc)
       */
      setNewColor: function(hexColor) {
         if (SpriteEditor.editColor == SpriteEditor.COLOR_FOREGROUND) {
            $("#curColor").val(hexColor);
            SpriteEditor.currentColor = hexColor;
            $(".colorTable .selectedColor").css("background", hexColor);
         } else {
            $(".colorTable .backgroundColor").css("background", hexColor);
            $(".preview img").css("background", hexColor);
            $(SpriteEditor.editorContext.getSurface()).css("background", hexColor);
            SpriteEditor.grid.setGridColor(SpriteEditor.getContrast(hexColor));
         }
      },

      /**
       * Add the drawing controls to the UI.
       * @private
       */
      addControls: function() {
         $("#curColor")
               .change(function() {
            SpriteEditor.currentColor = this.value;
            $(".colorTable .selectedColor").css("background", colr);
         })
               .dblclick(function() {
            SpriteEditor.colorSelector.show(520, 10, SpriteEditor.currentColor);
         });

         $(".colorTable .selectedColor")
               .click(function() {
            SpriteEditor.editColor = SpriteEditor.COLOR_FOREGROUND;
            SpriteEditor.colorSelector.show(520, 10, SpriteEditor.currentColor);
         });

         $(".colorTable .backgroundColor")
               .click(function() {
            SpriteEditor.editColor = SpriteEditor.COLOR_BACKGROUND;
            var colr = SpriteEditor.fixupColor($(this).css("background-color"));
            SpriteEditor.colorSelector.show(520, 10, colr);
         });


         $("#gridVis").change(function() {
            SpriteEditor.grid.setVisible(this.checked);
            SpriteEditor.pStore.save("drawGrid", this.checked);
         });

         $("#grid8")
               .change(function() {
            SpriteEditor.setPixelSize(512 / 8);
         });

         $("#grid16")
               .change(function() {
            SpriteEditor.setPixelSize(512 / 16);
         });

         $("#grid32")
               .change(function() {
            SpriteEditor.setPixelSize(512 / 32);
         });

         $("#grid64")
               .change(function() {
            SpriteEditor.setPixelSize(512 / 64);
         });


         $(".preColor")
               .click(function() {
            var colr = SpriteEditor.fixupColor($(this).css("background-color"));
            $("#curColor").val(colr.toUpperCase());
            $(".colorTable .selectedColor").css("background", colr);
            SpriteEditor.currentColor = colr;
         });

         $(".brushPix").click(function() {
            var idx = $(".brushPix").index(this);
            $(".brushPix").removeClass("enabled");
            SpriteEditor.brushSize = [Math.floor(idx % 3), Math.floor(idx / 3)];
            for (var x = 0; x < 3; x++) {
               for (var y = 0; y < 3; y++) {
                  if (x <= SpriteEditor.brushSize[0] &&
                        y <= SpriteEditor.brushSize[1]) {
                     $(".brushPix:eq(" + ((y * 3) + x) + ")").addClass("enabled");
                  }
               }
            }
         });

         $("#grid" + (512 / SpriteEditor.pixSize)).attr("checked", true);
         $("#gridVis").attr("checked", SpriteEditor.pStore.load("drawGrid", true));

         SpriteEditor.colorSelector = new ColorSelector("cs", SpriteEditor.setNewColor, $("#curColor").val());

         SpriteEditor.previewImage = $(".preview img");
      },

      /**
       * Fix up the given color so that it represents a good hexadecimal color value.
       * @param colr {String} A color value to fix
       * @return {String} A cleaned up hexadecimal color
       * @private
       */
      fixupColor: function(colr) {

         function pad(n) {
            if (parseInt(n, 10) < 10) {
               return "0" + n;
            }
            return n;
         }

         colr.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)/, function(str, r, g, b) {
            colr = "#";
            colr += pad(Number(r).toString(16));
            colr += pad(Number(g).toString(16));
            colr += pad(Number(b).toString(16));
         });
         // For browsers that use the named 16 colors
         colr.replace(/(.*)/, function(str) {
            var newColr = SpriteEditor.colorTable[str.toLowerCase()];
            colr = newColr || colr;
         });

         return colr;
      },

      /**
       * Get the contrast value of the given color value.
       * @param colr {String} The color to analyze
       * @return {String} The hexadecimal color with a normalized contrast
       * @private
       */
      getContrast: function(colr) {
         colr = colr.substring(1);
         var cont = colr.replace(/(\w{2})(\w{2})(\w{2})/, function(str, r, g, b) {
            return Math.max(Math.max(parseInt(r, 16), parseInt(g, 16)), parseInt(b, 16));
         });
         var n = (255 - cont).toString(16);
         return "#" + n + n + n;
      },

      //--------------------------------------------------------------------------------------------
      // MENUBAR ACTIONS

      /**
       * MENU - clear the current frame
       * @private
       */
      actionClearFrame: function() {
         function $$doNew() {
            SpriteEditor.currentLayer.clear();
         }

         if (confirm("Are you sure you want to clear the current Frame?")) {
            $$doNew();
         }
      },

      /**
       * MENU - add a new frame
       * @private
       */
      actionNewFrame: function() {
         var f = $("<li>").append("<img width='16' height='16'/>");
         f.click(function() {
            SpriteEditor.setCurrentFrame($(".frames ul li").index(this));
         });
         $(".frames ul").append(f);
         this.addFrame();
         this.setCurrentFrame(this.frames.length - 1);
      },

      /**
       * MENU - duplicate the current frame, adding a new frame at the end of the manager
       * @private
       */
      actionDuplicateFrame: function() {
         var f = $("<li>").append("<img width='16' height='16'/>");
         f.click(function() {
            SpriteEditor.setCurrentFrame($(".frames ul li").index(this));
         });
         $(".frames ul").append(f);
         var f = this.addFrame();
         f.setPixels(this.currentLayer.getPixels());
         this.setCurrentFrame(this.frames.length - 1);
      },

      /**
       * MENU - toggle horizontal mirror
       * @private
       */
      actionHMirrorToggle: function() {
         $("div.button.mirror-horizontal").mousedown();
      },

      /**
       * MENU - toggle vertical mirror
       * @private
       */
      actionVMirrorToggle: function() {
         $("div.button.mirror-vertical").mousedown();
      },

      /**
       * MENU - toggle the display of the grid
       * @private
       */
      actionToggleGrid: function() {
         $("#gridVis").click();
         SpriteEditor.grid.setVisible($("#gridVis")[0].checked);
      },

      /**
       * MENU - display "about" alert
       * @private
       */
      actionAbout: function() {
         alert("SpriteEditor [alpha 1]\n\nCopyright (c) 2011 Brett Fattori\nPart of The Render Engine project\nMIT Licensed");
      },

      /**
       * MENU - navigate to the previous frame
       * @private
       */
      actionPreviousFrame: function() {
         this.prevFrame();
      },

      /**
       * MENU - navigate to the next frame
       * @private
       */
      actionNextFrame: function() {
         this.nextFrame();
      },

      /**
       * MENU - exit the editor and shut down the game engine
       * @private
       */
      actionExit: function() {
         function $$doExit() {
            R.Engine.shutdown();
         }

         if (confirm("Are you sure you want to exit Sprite Editor?")) {
            $$doExit();
         }
      },

      /**
       * MENU - basic color pallette
       * @private
       */
      colorTable: {
         "white":"#FFFFFF",
         "yellow":"#FFFF00",
         "fuchsia":"#FF00FF",
         "red":"#FF0000",
         "silver":"#C0C0C0",
         "gray":"#808080",
         "olive":"#808000",
         "purple":"#800080",
         "maroon":"#800000",
         "aqua":"#00FFFF",
         "lime":"#00FF00",
         "teal":"#008080",
         "green":"#008000",
         "blue":"#0000FF",
         "navy":"#000080",
         "black":"#000000"
      },

      /**
       * Paint mode
       * @type Number
       */
      PAINT: 0,

      /**
       * Erase mode
       * @type Number
       */
      ERASE: 1,

      /**
       * Eye-dropper mode
       * @type Number
       */
      SELECT: 2,

      /**
       * Foreground color index
       * @type Number
       */
      COLOR_FOREGROUND: 0,

      /**
       * Background color index
       * @type Number
       */
      COLOR_BACKGROUND: 1
   });
};

