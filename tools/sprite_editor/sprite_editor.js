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

      // Persistent storage to save level
      "R.storage.PersistentStorage",

      // Math objects
      "R.math.Math2D",

      "R.util.RenderUtil"
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
      mouseBtn: 0,
      drawMode: 0,
      colorSelector: null,
      brushSize: [0,0],
      grid: null,
      previewImage: null,
      editColor: 0,
      mirrorVert: false,
      mirrorHorz: false,
      animations: {},
      currentAnimation: "animation0",
      frameIdx: 0,
      pixOffset: [],
      noPixels: true,
      pStore: null,
      undoHistory: [],
      redoHistory: [],
      clipboard: null,

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
         $("#bottom").css("display", "block");

         // Set the FPS so drawing speed is resonable
         R.Engine.setFPS(30);

         this.recalcOffset();

         // Create the 2D context
         this.editorContext = R.rendercontexts.CanvasContext.create("editor", this.editorSize, this.editorSize);
         this.editorContext.setWorldScale(1);
         R.Engine.getDefaultContext().add(this.editorContext);

         var backColor = this.pStore.load("backgroundColor", "#000000");
         this.editorContext.setBackgroundColor(backColor);

         // The place where previews will be generated
         this.previewContext = SpritePreview.create();
         this.previewContext.setWorldScale(1);
         R.Engine.getDefaultContext().add(this.previewContext);
         this.previewContext.setBackgroundColor(backColor);

         // Set some event handlers
         var self = this;
         this.editorContext.addEvent(this, "mousedown", function(evt) {
            // Grab the current layer's pixels and store them in undo history
            SpriteEditor.undoHistory.push(SpriteEditor.currentLayer.getPixels());
            
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

         // Create the animations container
         this.animations[this.currentAnimation] = {
            frames: [],
            size: SpriteEditor.pixSize
         };

         // Add the first frame
         this.currentLayer = this.addFrame();
         this.currentLayer.setDrawMode(SpriteLayer.DRAW);
         this.editorContext.add(this.currentLayer);

         // Set a click event for the first frame in the frame manager
         $(".frames ul li").eq(0).click(function() {
            SpriteEditor.setCurrentFrame(0);
         }).hover(function() {
            $("div.tag", this).text($(".frames ul li").index(this));
            $(this).addClass("mouseover");
         }, function() { $(this).removeClass("mouseover"); });

         $(".animations ul li").eq(0).click(function() {
            SpriteEditor.setCurrentAnimation($(this).attr("aname"));   
         });

         // Generate the grid
         this.grid = SpriteGrid.create();
         this.editorContext.add(this.grid);
         this.grid.setVisible(SpriteEditor.pStore.load("drawGrid", true));

         // Finally, add the controls
         this.addControls();

         // Make sure the background color is in all of the right places
         $(".colorTable .backgroundColor").css("background", backColor);
         $(".preview img").css("background", backColor);
         $(SpriteEditor.editorContext.getSurface()).css("background", backColor);
         SpriteEditor.grid.setGridColor(SpriteEditor.getContrast(backColor));
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
         // Clear the undo and redo history
         SpriteEditor.undoHistory = [];
         SpriteEditor.redoHistory = [];

         frameIdx = frameIdx === undefined ? this.frameIdx : frameIdx;

         SpriteEditor.currentLayer.setDrawMode(SpriteLayer.NO_DRAW);
         SpriteEditor.currentLayer = SpriteEditor.animations[SpriteEditor.currentAnimation].frames[frameIdx];
         SpriteEditor.currentLayer.setDrawMode(SpriteLayer.DRAW);
         
         $(".frames ul li.currentFrame").removeClass("currentFrame");
         $(".frames ul li:eq(" + frameIdx + ")").addClass("currentFrame");

         this.frameIdx = frameIdx;
      },

      /**
       * Set the current animation
       * @param animationName {String}
       */
      setCurrentAnimation: function(animationName) {
         // Clear the undo and redo history
         SpriteEditor.undoHistory = [];
         SpriteEditor.redoHistory = [];

         SpriteEditor.currentAnimation = animationName;

         // Get the pixel size for the animation
         SpriteEditor.pixSize = SpriteEditor.animations[animationName].size;
         SpriteEditor.recalcOffset();

         // Load up the frames for the animation
         var frames = SpriteEditor.animations[animationName].frames;
         $(".frames ul li").remove();
         $.each(frames, function(i, frame) {
            var f = $("<li>").append("<img width='32' height='32'/>").append("<div class='tag'>" + i + "</div>");
            f.click(function() {
               SpriteEditor.setCurrentFrame($(".frames ul li").index(this));
            }).hover(function() {
               $("div.tag", this).text($(".frames ul li").index(this));
               $(this).addClass("mouseover");
            }, function() { $(this).removeClass("mouseover"); });
            $("img", f).attr("src", frame.getImgSrc());
            $(".frames ul").append(f);
         });

         // Set the current frame to the first frame
         SpriteEditor.setCurrentFrame(0);

         $(".animations ul li img.currentAnimation").removeClass("currentAnimation");
         $(".animations ul li[aname=" + animationName + "] img").addClass("currentAnimation");

      },

      /**
       * Add a new, empty frame to the set of frames in the sprite.
       * @return {SpriteLayer} The newly added frame layer
       */
      addFrame: function() {
         var frame = SpriteLayer.create(SpriteEditor.pixSize);
         SpriteEditor.animations[SpriteEditor.currentAnimation].frames.push(frame);
         return frame;
      },


      /**
       * Delete the frame at the given index, or the currently selected frame.
       * @param [frameIdx] {Number} The index of the frame to delete, or <tt>null</tt> to
       *        delete the currently selected frame.
       */
      deleteFrame: function(frameIdx) {
         frameIdx = frameIdx || this.frameIdx;
         SpriteEditor.animations[SpriteEditor.currentAnimation].frames.splice(frameIdx, 1);

         // If there aren't any frames, we'll need to create one for them
         if (SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length == 0) {
            var frame = this.addFrame();
            SpriteEditor.editorContext.add(frame);
         }

         if (frameIdx == SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length) {
            SpriteEditor.frameIdx--;
         }

         SpriteEditor.setCurrentFrame();
      },

      /**
       * Navigate the frame manager to the previous frame and update
       * the editor to reflect that frame's state.
       */
      prevFrame: function() {
         SpriteEditor.frameIdx--;
         if (SpriteEditor.frameIdx < 0) {
            SpriteEditor.frameIdx = 0;
         }
         SpriteEditor.setCurrentFrame();
      },

      /**
       * Navigate the frame manager to the next frame and update
       * the editor to reflect that frame's state.
       */
      nextFrame: function() {
         SpriteEditor.frameIdx++;
         if (SpriteEditor.frameIdx == SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length) {
            SpriteEditor.frameIdx = SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length - 1;
         }
         SpriteEditor.setCurrentFrame();
      },

      /**
       * Set the pixel, at the given coordinates, to the currently selected
       * foreground color.
       *
       * @param x {Number} The X coordinate
       * @param y {Number} The Y coordinate
       */
      setPixel: function(x, y) {
         SpriteEditor.noPixels = false;
         for (var xB = 0; xB < SpriteEditor.brushSize[0] + 1; xB++) {
            for (var yB = 0; yB < SpriteEditor.brushSize[1] + 1; yB++) {
               SpriteEditor.currentLayer.addPixel(x + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               var d = [256 - x, 256 - y];
               if (SpriteEditor.mirrorHorz) {
                  SpriteEditor.currentLayer.addPixel((256 + d[0]) + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               }
               if (SpriteEditor.mirrorVert) {
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
               if (SpriteEditor.mirrorHorz) {
                  SpriteEditor.currentLayer.clearPixel((256 + d[0]) + (xB * SpriteEditor.pixSize), y + (yB * SpriteEditor.pixSize));
               }
               if (SpriteEditor.mirrorVert) {
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
         if (SpriteEditor.frameIdx == 0 && SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length == 1 && SpriteEditor.noPixels) {
            doIt = true;
         } else {
            doIt = confirm("Changing the pixel size will clear any current frames and reset to frame zero.  Are you sure you want to do this?");
         }

         if (doIt) {
            SpriteEditor.animations[SpriteEditor.currentAnimation].frames = [];
            SpriteEditor.animations[SpriteEditor.currentAnimation].size = size;
            SpriteEditor.frameIdx = 0;
            SpriteEditor.pixSize = size;
            SpriteEditor.recalcOffset();
            $(".frames ul").empty();
            SpriteEditor.actionNewFrame();
            SpriteEditor.noPixels = true;

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
            // Store the color
            SpriteEditor.pStore.save("backgroundColor", hexColor);

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
       * MENU - Start fresh, clearing all animations.
       * @private
       */
      actionNew: function() {
         var c = 0;
         for (var i in SpriteEditor.animations) {
            c++;
         }
         if (c == 0) {
            return;
         }
         var doIt = confirm("Are you sure you want to delete all animations and start new?");
         if (doIt) {
            for (var a in SpriteEditor.animations) {
               var frames = SpriteEditor.animations[a].frames;
               for (var f in frames) {
                  frames[f].destroy();
               }
            }
            SpriteEditor.animations = {
               "animation0": {
                  frames:[],
                  size:SpriteEditor.pixSize
               }
            };
            $(".animations ul").empty();

            SpriteEditor.noPixels = true;

            var frame = SpriteLayer.create(SpriteEditor.pixSize);
            SpriteEditor.animations["animation0"].frames.push(frame);
            SpriteEditor.editorContext.add(frame);

            var f = $("<li aname='animation0'>").append("<img width='32' height='32'/>").append("<div class='tag'>animation0</div>");
            f.click(function() {
               SpriteEditor.setCurrentAnimation($(this).attr("aname"));
            });
            $(".animations ul").append(f);
            SpriteEditor.setCurrentAnimation("animation0");
         }
      },

      /**
       * MENU - clear the current frame
       * @private
       */
      actionClearFrame: function() {
         function $$doNew() {
            SpriteEditor.undoHistory.push(SpriteEditor.currentLayer.getPixels());
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
         var f = $("<li>").append("<img width='32' height='32'/>").append("<div class='tag'>" + SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length + "</div>");
         f.click(function() {
            SpriteEditor.setCurrentFrame($(".frames ul li").index(this));
         }).hover(function() {
            $("div.tag", this).text($(".frames ul li").index(this));
            $(this).addClass("mouseover");
         }, function() { $(this).removeClass("mouseover"); });
         $(".frames ul").append(f);
         var frame = this.addFrame();
         SpriteEditor.editorContext.add(frame);

         SpriteEditor.setCurrentFrame(SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length - 1);
      },

      /**
       * MENU - add a new animation
       * @private
       */
      actionNewAnimation: function() {
         var animationName = prompt("Enter a name for the animation:", "animation");
         if (SpriteEditor.animations[animationName] != null) {
            alert("There is already an animation with that name");
            return;
         }

         SpriteEditor.animations[animationName] = {
            frames: [],
            size: SpriteEditor.pixSize
         };
         SpriteEditor.noPixels = true;

         var frame = SpriteLayer.create(SpriteEditor.pixSize);
         SpriteEditor.animations[animationName].frames.push(frame);
         SpriteEditor.editorContext.add(frame);

         var f = $("<li aname='" + animationName + "'>").append("<img width='32' height='32'/>").append("<div class='tag'>" + animationName + "</div>");
         f.click(function() {
            SpriteEditor.setCurrentAnimation($(this).attr("aname"));
         });
         $(".animations ul").append(f);
         $(".animations ul li img.currentAnimation").removeClass("currentAnimation");
         $("img",f).addClass("currentAnimation");
         SpriteEditor.setCurrentAnimation(animationName);
      },

      /**
       * MENU - Rename the current animation
       * @private
       */
      actionRenameAnimation: function() {
         var newAnimationName = prompt("Enter a new name for the animation:", SpriteEditor.currentAnimation);
         if (newAnimationName == null || newAnimationName == "") {
            return;
         }
         if (SpriteEditor.animations[newAnimationName] != null) {
            alert("There is already an animation with that name");
            return;
         }

         SpriteEditor.animations[newAnimationName] = {};
         SpriteEditor.animations[newAnimationName].size = SpriteEditor.animations[SpriteEditor.currentAnimation].size;
         SpriteEditor.animations[newAnimationName].frames = SpriteEditor.animations[SpriteEditor.currentAnimation].frames;
         var oldAnimation = SpriteEditor.currentAnimation;
         SpriteEditor.currentAnimation = newAnimationName;
         delete SpriteEditor.animations[oldAnimation];

         $(".animations ul li[aname=" + oldAnimation + "]").attr("aname", newAnimationName).find("div.tag").html(newAnimationName);
      },

      /**
       * MENU - Delete an frame from an animation
       * @private
       */
      actionDeleteFrame: function() {
         function $$doDelete() {
            // Remove the frame
            SpriteEditor.currentLayer.setDrawMode(SpriteLayer.NO_DRAW);
            SpriteEditor.currentLayer.destroy();

            // Remove the frame preview
            $(".frames ul li").eq(SpriteEditor.frameIdx).remove();

            // Delete the frame
            SpriteEditor.deleteFrame();
         }

         if (SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length > 1 && confirm("Are you sure you want to delete the current frame?")) {
            $$doDelete();
         }
      },

      /**
       * MENU - Delete the current animation
       * @private
       */
      actionDeleteAnimation: function() {
         var doIt = confirm("Are you sure you want to delete animation '" + SpriteEditor.currentAnimation + "'?");
         if (doIt) {
            var del = SpriteEditor.currentAnimation;
            delete SpriteEditor.animations[del];
            $(".animations ul li[aname=" + del + "]").remove();

            var next = del, c = 0;
            for (var i in SpriteEditor.animations) {
               // Get the first animation
               next = i;
               break;
            }

            if (c == 0) {
               next = "animation0";

               // All animations deleted, start fresh
               SpriteEditor.animations[next] = {
                  frames: [],
                  size: SpriteEditor.pixSize
               };
               SpriteEditor.noPixels = true;

               var frame = SpriteLayer.create(SpriteEditor.pixSize);
               SpriteEditor.animations[next].frames.push(frame);
               SpriteEditor.editorContext.add(frame);

               var f = $("<li aname='" + next + "'>").append("<img width='32' height='32'/>").append("<div class='tag'>" + next + "</div>");
               f.click(function() {
                  SpriteEditor.setCurrentAnimation($(this).attr("aname"));
               });
               $(".animations ul").append(f);
            }

            SpriteEditor.setCurrentAnimation(next);
         }
      },

      /**
       * MENU - duplicate the current frame, adding a new frame at the end of the manager
       * @private
       */
      actionDuplicateFrame: function() {
         var f = $("<li>").append("<img width='32' height='32'/>").append("<div class='tag'>" + SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length + "</div>");
         f.click(function() {
            SpriteEditor.setCurrentFrame($(".frames ul li").index(this));
         }).hover(function() {
            $("div.tag", this).text($(".frames ul li").index(this));
            $(this).addClass("mouseover");
         }, function() { $(this).removeClass("mouseover"); });
         $(".frames ul").append(f);
         var frame = SpriteEditor.addFrame();
         SpriteEditor.editorContext.add(frame);
         frame.setPixels(SpriteEditor.currentLayer.getPixels());
         this.setCurrentFrame(SpriteEditor.animations[SpriteEditor.currentAnimation].frames.length - 1);
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
       * MENU - Show the help contents
       * @private
       */
      actionHelp: function() {
         window.open("resources/help/index.html", "helpWindow");
      },

      /**
       * MENU - display "about" alert
       * @private
       */
      actionAbout: function() {
         alert("SpriteEditor [v1.0.0]\n\nCopyright (c) 2011 Brett Fattori\nPart of The Render Engine project\nMIT Licensed");
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

      actionUndo: function() {
         if (SpriteEditor.undoHistory.length > 0) {
            var pixels = SpriteEditor.undoHistory.pop();
            SpriteEditor.redoHistory.push(SpriteEditor.currentLayer.getPixels());
            SpriteEditor.currentLayer.setPixels(pixels);
         }
      },

      actionRedo: function() {
         if (SpriteEditor.redoHistory.length > 0) {
            var pixels = SpriteEditor.redoHistory.pop();
            SpriteEditor.undoHistory.push(pixels);
            SpriteEditor.undoHistory.push(SpriteEditor.currentLayer.getPixels());
            SpriteEditor.currentLayer.setPixels(pixels);
         }
      },

      actionCopy: function() {
         SpriteEditor.clipboard = {
            pix: SpriteEditor.currentLayer.getPixels(),
            size: SpriteEditor.currentLayer.pixSize
         };
         $("div.menu div.paste").removeClass("disabled");
      },

      actionPaste: function() {
         if (SpriteEditor.clipboard != null && SpriteEditor.pixSize == SpriteEditor.clipboard.size) {
            SpriteEditor.currentLayer.setPixels(SpriteEditor.clipboard.pix);
         }
      },

      /**
       * Break an animation up into single frames
       */
      actionBreakAnim: function() {
         
      },

      actionExportSpriteSheet: function() {
         // Create a canvas that will store all the frames of each animation
         var aW, sheetHeight = 0, sheetWidth = 0, blockSize, animation;
         for (animation in SpriteEditor.animations) {
            blockSize = (512 / SpriteEditor.animations[animation].size);
            // Find the widest animation while finding the number of animations
            aW = blockSize * SpriteEditor.animations[animation].frames.length;
            if (aW > sheetWidth) {
               sheetWidth = aW;
            }
            sheetHeight += blockSize;
         }
         var spriteSheet = R.util.RenderUtil.getTempContext(R.rendercontexts.CanvasContext, sheetWidth, sheetHeight),
             top = 0, sheetInfo = {
               "bitmapImage": "[PNG FILE NAME]",
               "bitmapSize": [sheetWidth, sheetHeight],
               "version": 2,
               "sprites": {}
             };

         // Export the different animations
         var  pt = R.math.Point2D.create(0,0);
         for (animation in SpriteEditor.animations) {
            // Render out each frame to image data
            var iS = (512 / SpriteEditor.animations[animation].size), pixBuf;

            sheetInfo.sprites[animation] = [0,top,iS,iS];
            if (SpriteEditor.animations[animation].frames.length > 1) {
               sheetInfo.sprites[animation].push(100);
               sheetInfo.sprites[animation].push("loop");
            }

            // For each frame, render out to the image, then copy that data to the temporary canvas
            for (var f = 0; f < SpriteEditor.animations[animation].frames.length; f++) {
               pixBuf = SpriteEditor.animations[animation].frames[f].getImageData();

               // Add the image data to the canvas at the frames position
               pt.set(f * iS, top);
               spriteSheet.putImage(pixBuf, pt);
            }
            top += iS;
         }
         pt.destroy();

         // Now, open a new window and put our sprite sheet into it for them to capture
         var w = window.open("about:blank", "spriteSheet", "width=640,height=480,toolbar=no,resizable=yes,scrolling=yes");
         var img = $("<img src='" + spriteSheet.getDataURL("image/png") + "' width='" + sheetWidth + "' height='" + sheetHeight + "' style='border: 1px solid'/>");
         var info = $("<textarea cols='70' rows='20'>").val(JSON.stringify(sheetInfo,null,2));
         $("body", w.document).append("<span>Right-click on the image below and select 'Save As'.  Then copy the sheet info into a sprite file.<br/><br/></span>")
               .append(img).append("<br/><br/><span>Sheet info:</span><br/>").append(info);
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

