/**
 * The Render Engine
 * Demo Game: Asteroids Evolution
 *
 * This is an example of using The Render Engine to create a complete
 * game.  This game is based off of the popular vector shooter, Asteroids,
 * which is (c)Copyright 1979 - Atari Corporation.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1568 $
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
   "class": "Spaceroids",
   "requires": [
      "R.engine.Game",
      "R.rendercontexts.CanvasContext",
      "R.collision.broadphase.SpatialGrid",
      "R.text.TextRenderer",
      "R.text.AbstractTextRenderer",
      "R.text.VectorText",
      "R.resources.loaders.SoundLoader",
      "R.resources.loaders.ImageLoader",
      "R.resources.types.Image",
      "R.sound.SM2",
      "R.storage.PersistentStorage",
      "R.engine.Events",
      "R.math.Math2D",
      //"R.particles.ParticleEngine"
      "R.particles.AccumulatorParticleEngine"
   ],

   // Game class dependencies
   "depends": [
      "SpaceroidsRock",
      "SpaceroidsPlayer",
      "SpaceroidsBullet",
      "SimpleParticle",
      "TrailParticle",
      "RockTrailParticle",
      "SpaceroidsUFO"
   ]
});

// Load game objects
R.engine.Game.load("/rock.js");
R.engine.Game.load("/player.js");
R.engine.Game.load("/bullet.js");
R.engine.Game.load("/particle.js");
R.engine.Game.load("/ufo.js");

/**
 * @class The game.
 */
var Spaceroids = function() {
   return R.engine.Game.extend({

      constructor: null,

      renderContext: null,
      soundLoader: null,
      imageLoader: null,

      fieldBox: null,
      centerPoint: null,
      areaScale: 1,

      collisionModel: null,

      rocks: 0,

      fieldWidth: 500,
      fieldHeight: 580,

      hiScore: 0,
      playerScore: 0,

      debug: true,

      scoreObj: null,
      hscoreObj: null,
      playerObj: null,

      showStart: false,

      pEngine: null,

      level: 0,

      titlePos: null,

      rec: false,
      play: false,

      pStore: null,
      backgroundImage: null,

      /**
       * Handle the key press which starts the game
       * @param event {Event} The event object
       */
      onKeyPress: function(event) {
         if (event.which == R.engine.Events.KEYCODE_ENTER) {
            Spaceroids.startGame();
         }
      },

      /**
       * Clean up the playfield, removing any objects that are
       * currently within the render context.  Used to initialize the game
       * and to handle transitions between attract mode and play mode.
       */
      cleanupPlayfield: function() {

         // Detach and reset the collision model & particle engine
         this.renderContext.remove(this.collisionModel);
         this.renderContext.remove(this.pEngine);
         this.pEngine.reset();
         this.collisionModel.reset();

         // Eliminate the score and high score objects
         this.scoreObj = null;
         this.hscoreObj = null;
         this.start = null;

         // Destroy all objects attached to the context
         this.renderContext.cleanUp();
         this.rocks = 0;
         this.level = 0;

         // Re-attach the particle engine and collision model
         this.renderContext.add(this.pEngine);
         this.renderContext.add(this.collisionModel);
      },

      /**
       * A way to attract players to play the game.
       */
      attractMode: function() {
         var center = this.fieldBox.getCenter();

         var titlePos = R.math.Point2D.create(center.x, 100);
         var copyPos = R.math.Point2D.create(center.x, 570);
         this.cleanupPlayfield();
         Spaceroids.isAttractMode = true;

         // Set the background image
         var img = this.imageLoader.getImage("apod2");
         this.backgroundImage.empty();
         this.backgroundImage.append($(img.getImage()).clone());

         this.pEngine.setFadeRate(0.5);

         var pWidth = this.fieldWidth;
         var pHeight = this.fieldHeight;

         // Add some asteroids
         for (var a = 0; a < 3; a++) {
            var rock = SpaceroidsRock.create(null, null, pWidth, pHeight);
            this.renderContext.add(rock);
            rock.setup();
            rock.killTimer = R.Engine.worldTime + 2000;
         }

         // Draw the user interface
         var title = R.text.TextRenderer.create(R.text.VectorText.create(), "Asteroids", 2);
         title.setPosition(titlePos);
         title.setColor("#ffffff");
         title.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_CENTER);
         this.renderContext.add(title);

         var copy = R.text.TextRenderer.create(R.text.VectorText.create(), "&copy;1979 Atari / &copy;2008-2011 Brett Fattori", 0.6);
         copy.setColor("#ffffff");
         copy.setPosition(copyPos);
         copy.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_CENTER);
         this.renderContext.add(copy);

         // Instructions
         var instruct = "left/right arrows to turn\nup arrow to thrust\nZ to fire missile\nA to hyperjump\nENTER to detonate nuke\n";
         instruct += R.engine.Support.sysInfo().OS + " " + R.engine.Support.sysInfo().browser + " " + R.engine.Support.sysInfo().version;

         var inst = R.text.TextRenderer.create(R.text.VectorText.create(), instruct, 0.8);
         inst.setColor("#00ff00");
         inst.setPosition(R.math.Point2D.create(center.x, 485));
         inst.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_CENTER);
         this.renderContext.add(inst);

         var startText;
         startText = "[ Press =Enter= to Start ]";

         var evolved = R.text.TextRenderer.create(R.text.VectorText.create(), "Evolution", 1);
         evolved.setColor("#ff0000");
         evolved.setPosition(R.math.Point2D.create(290, 120));
         this.renderContext.add(evolved);

         Spaceroids.start = R.text.TextRenderer.create(R.text.VectorText.create(), startText, 1);
         Spaceroids.start.setPosition(R.math.Point2D.create(center.x, 450));
         Spaceroids.start.setColor("#ffffff");
         Spaceroids.start.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_CENTER);
         Spaceroids.renderContext.add(Spaceroids.start);

         var flash = function() {
            if (!Spaceroids.showStart) {
               Spaceroids.start.setDrawMode(R.text.TextRenderer.DRAW_TEXT);
               Spaceroids.showStart = true;
               Spaceroids.intv.restart();
            }
            else {
               Spaceroids.start.setDrawMode(R.text.TextRenderer.NO_DRAW);
               Spaceroids.showStart = false;
               Spaceroids.intv.restart();
            }
         };

         // This will cause the "start text" to blink
         Spaceroids.intv = R.lang.Timeout.create("startkey", 1000, flash);

         // In attract mode, show "GAME OVER" and the high score
         this.addHiScore();
         this.gameOver();

         // Create a new asteroid every 20 seconds
         Spaceroids.attractTimer = R.lang.IntervalTimer.create("attract", 20000,
               function() {
                  var rock = SpaceroidsRock.create(null, null, Spaceroids.fieldWidth, Spaceroids.fieldHeight);
                  Spaceroids.renderContext.add(rock);
                  rock.setup();
                  rock.killTimer = R.Engine.worldTime + 2000;
               });

      },

      /**
       * Add the highscore object to the playfield.
       */
      addHiScore: function() {
         this.hscoreObj = R.text.TextRenderer.create(R.text.VectorText.create(), this.hiScore, 2);
         this.hscoreObj.setPosition(R.math.Point2D.create(400, 5));
         this.hscoreObj.setColor("#ffffff");
         this.hscoreObj.setTextWeight(0.5);
         this.hscoreObj.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_RIGHT);
         this.renderContext.add(this.hscoreObj);
      },

      /**
       * Add the score object to the playfield.
       */
      addScore: function() {
         this.scoreObj = R.text.TextRenderer.create(R.text.VectorText.create(), this.playerScore, 2);
         this.scoreObj.setPosition(R.math.Point2D.create(130, 5));
         this.scoreObj.setColor("#ffffff");
         this.scoreObj.setTextWeight(0.5);
         this.scoreObj.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_RIGHT);
         this.renderContext.add(this.scoreObj);
      },

      /**
       * Called to add points to the player's score.
       *
       * @param howMany {Number} The number of points to add to the player's score.
       */
      scorePoints: function(howMany) {
         this.playerScore += howMany;
         if (this.playerScore > this.hiScore) {
            this.hiScore = this.playerScore;
            this.hscoreObj.setText(this.hiScore);
         }

         if (Spaceroids.playerObj && this.playerScore > 1500 && !Spaceroids.playerObj.freeGuy) {
            // Extra guy at 1500 points
            Spaceroids.playerObj.players++;
            Spaceroids.playerObj.freeGuy = true;
         }

         this.scoreObj.setText(this.playerScore);
      },

      /**
       * Record a demo script
       * @private
       */
      recordDemo: function() {
         Spaceroids.rec = true;
         Spaceroids.demoScript = {};
         Spaceroids.demoScript.seed = R.lang.Math2.randomInt();

         R.lang.Math2.seed(Spaceroids.demoScript.seed);
         Spaceroids.startGame();
      },

      /**
       * Playback a demo script
       * @private
       */
      playDemo: function() {
         Spaceroids.play = true;
         var demoMode = Spaceroids.demoModes[0];
         R.lang.Math2.seed(demoMode.seed);
         this.startGame();
         this.playerObj.getComponent("input").playScript(demoMode.player);
      },

      /**
       * Start the game, resetting the playfield and creating the player.
       * If the game is already running, has no effect.
       */
      startGame: function() {

         if (this.gameRunning) {
            return;
         }

         this.gameRunning = true;

         if (!Spaceroids.rec && !Spaceroids.play) {
            // Shut down the attract mode timer which spawns new asteroids
            this.attractTimer.destroy();
            this.attractTimer = null;
            Spaceroids.isAttractMode = false;

            this.intv.destroy();
            this.intv = null;
         }

         // Prepare the playfield
         this.playerScore = 0;
         this.cleanupPlayfield();

         // Set the background image
         var rnd = R.lang.Math2.randomRange(0,5,true),
             imgName = "apod" + (rnd + (rnd == 1 ? 2 : 1)),
             img = this.imageLoader.getImage(imgName);

         this.backgroundImage.empty();
         this.backgroundImage.append($(img.getImage()).clone());

         // Change the fade rate on the particle engine
         this.pEngine.setFadeRate(0.2);

         // Begin the next level
         this.nextLevel();

         // Create the player
         this.playerObj = SpaceroidsPlayer.create();
         this.renderContext.add(this.playerObj);
         this.playerObj.setup();

         // Add the scores to the playfield and reset the player's score
         this.addHiScore();
         this.addScore();
         this.scorePoints(0);

         // Start the background "music" track
         Spaceroids.soundNum = 1;
         Spaceroids.gameSound = R.lang.IntervalTimer.create("gameSound", 1000, function() {
            if (Spaceroids.soundNum == 1) {
               Spaceroids.soundLoader.get("lowboop").play();
               Spaceroids.soundNum = 2;
            } else {
               Spaceroids.soundLoader.get("hiboop").play();
               Spaceroids.soundNum = 1;
            }
         });
      },

      /**
       * Advance to next level
       */
      nextLevel: function() {
         Spaceroids.level++;

         if (Spaceroids.level > 7) {
            // Max level of 7 so the asteroid count isn't insane
            Spaceroids.level = 7;
         }

         if (this.playerObj) {
            // Allow the player a maximum of 3 nukes
            this.playerObj.nukes++;
            this.playerObj.nukes = this.playerObj.nukes > 3 ? 3 : this.playerObj.nukes;
         }

         // Add asteroids to the level
         var pWidth = this.fieldWidth;
         var pHeight = this.fieldHeight;
         for (var a = 0; a < Spaceroids.level + 1; a++) {
            var rock = SpaceroidsRock.create(null, null, pWidth, pHeight);
            this.renderContext.add(rock);
            rock.setup();
         }
      },

      /**
       * Called when the game is over to draw the game over message and
       * set a timer to return to attract mode.
       */
      gameOver: function() {

         if (Spaceroids.rec) {
            this.playerObj.getComponent("input").stopRecording();
            Spaceroids.demoScript.player = this.playerObj.getComponent("input").getScript();
            console.debug(JSON.stringify(Spaceroids.demoScript));
            return;
         }

         // Draw the "GAME OVER" text
         var g = R.text.TextRenderer.create(R.text.VectorText.create(), "Game Over", 3);
         g.setPosition(R.math.Point2D.create(this.fieldBox.getCenter().x, 260));
         g.setTextWeight(0.8);
         g.setColor("#ffffff");
         g.setTextAlignment(R.text.AbstractTextRenderer.ALIGN_CENTER);
         this.renderContext.add(g);

         if (!this.gameRunning) {
            return;
         }

         // Shut down the background "music"
         Spaceroids.gameSound.destroy();
         Spaceroids.gameSound = null;

         this.gameRunning = false;

         // Remove the player
         if (this.playerObj) {
            this.playerObj.destroy();
            this.playerObj = null;
         }

         // Return to attract mode in 10sec
         R.lang.OneShotTimeout.create("gameover", 10000, function() {
            // Overwrite the high score
            Spaceroids.pStore.save("highScore", Spaceroids.hiScore);
            Spaceroids.attractMode();
         });
      },

      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(options) {
         //R.Engine.setDebugMode(true);
         //R.debug.Metrics.showMetrics();

         // Handle configuration options
         if (options.disableParticles) {
            R.Engine.options.disableParticleEngine = true;
         }

         if (options.playfieldRatio) {
            this.fieldWidth *= options.playfieldRatio;
            this.fieldHeight *= options.playfieldRatio;
         }

         // Create the 2D context
         this.fieldBox = R.math.Rectangle2D.create(0, 0, this.fieldWidth, this.fieldHeight);
         this.centerPoint = this.fieldBox.getCenter();
         this.renderContext = R.rendercontexts.CanvasContext.create("playfield", this.fieldWidth, this.fieldHeight);

         this.renderContext.setWorldScale(this.areaScale);
         R.Engine.getDefaultContext().add(this.renderContext);
         this.renderContext.setBackgroundColor("transparent");

         R.Engine.getDefaultContext().setBackgroundColor("#000000");
         this.renderContext.jQ().css({
            position: "absolute",
            left: (R.Engine.getDefaultContext().jQ().width() - this.renderContext.jQ().width()) / 2,
            border: "1px solid gray",
            zIndex: 20
         });

         // Set up the element for background images
         this.backgroundImage = $("<div class='bg'>&nbsp;</div>").css({
            position: "absolute",
            left: (R.Engine.getDefaultContext().jQ().width() - this.renderContext.jQ().width()) / 2,
            zIndex: 5
         });
         $("body", document).append(this.backgroundImage);

         // Use the spatial grid broad-phase collision model
         this.collisionModel = R.collision.broadphase.SpatialGrid.create(this.fieldWidth, this.fieldHeight, 5);
         this.collisionModel.setAccuracy(R.collision.broadphase.SpatialGrid.HIGH_ACCURACY);

         // Wire the event handler to start the game
         R.Engine.getDefaultContext().addEvent(Spaceroids, "keydown", Spaceroids.onKeyPress);

         // Load the sounds, using a SoundManager2 sound system
         this.soundLoader = R.resources.loaders.SoundLoader.create(new R.sound.SM2());
         var sounds = [['explode','explode1'],['shoot','shoot'],['death','explode2'],['thrust','thrust'],
                       ['lowboop','low'],['hiboop','hi'],['ufosmall','ufosmall'],['ufobig','ufobig']];

         $.each(sounds, function() {
            Spaceroids.soundLoader.load(this[0], Spaceroids.getFilePath("resources/" + this[1] + ".mp3"));
         });

         // Load the background images
         this.imageLoader = R.resources.loaders.ImageLoader.create();
         $.each(['apod1','apod2','apod3','apod4','apod5','apod6'], function() {
            Spaceroids.imageLoader.load(this, Spaceroids.getFilePath("resources/" + this + ".jpg"), 500, 580);
         });

         // Use persistent storage to keep the high score
         this.pStore = R.storage.PersistentStorage.create("AsteroidsEvolutionStorage");

         // See if a high score has been saved in persistent storage
         this.hiScore = this.pStore.load("highScore") || 0;

         // Start up a particle engine
         this.pEngine = R.particles.AccumulatorParticleEngine.create();
         this.pEngine.setBackgroundState(true);

         // Demo recording and playback - not currently used
         /*
         if (R.engine.Support.checkBooleanParam("record")) {
            Spaceroids.recordDemo();
            return;
         }

         if (R.engine.Support.checkBooleanParam("playback")) {
            Spaceroids.playDemo();
            return;
         }
         */

         // Experimental effect for blurring
         if (R.engine.Support.checkBooleanParam("blur")) {
            this.pEngine.setBlur(true);
         }

         // Wait for resources to finish loading before starting
         R.lang.Timeout.create("wait", 150, function() {
            if (Spaceroids.soundLoader.isReady() &&
                Spaceroids.imageLoader.isReady()) {
               // Go into attract mode as soon as the sounds are loaded
               this.destroy();
               Spaceroids.attractMode();
            } else {
               this.restart();
            }
         });
      },

      /**
       * Called when the game is being shut down to allow the game
       * the chance to clean up any objects, remove event handlers, and
       * destroy the rendering context.
       */
      teardown: function() {
         this.scoreObj = null;
         this.hscoreObj = null;

         R.engine.Events.clearHandler(document, "keypress", Spaceroids.onKeyPress);
         this.backgroundImage.remove();

         this.renderContext.destroy();
         this.pEngine.destroy();
      },

      // NOT USED
      blinkScreen: function(color) {},

      /**
       * A simple method that determines if the position is within the supplied bounding
       * box.
       *
       * @param pos {Point2D} The position to test
       * @param bBox {Rectangle2D} The bounding box of the playfield
       * @type Boolean
       */
      inField: function(pos, bBox) {
         var p = R.math.Point2D.create(pos);
         var newPos = this.wrap(p, bBox);
         var b = newPos.equals(pos);
         p.destroy();
         return b;
      },

      /**
       * Called to wrap an object around the edges of the playfield.
       *
       * @param pos {Point2D} The position of the object
       * @param bBox {Rectangle2D} The bounding box of the playfield
       */
      wrap: function(pos, bBox) {

         var rX = bBox.len_x() * 0.5;
         var rY = bBox.len_y() * 0.5;

         // Wrap if it's off the playing field
         var x = pos.x;
         var y = pos.y;
         var fb = this.renderContext.getViewport();

         if (pos.x < fb.x || pos.x > fb.r ||
               pos.y < fb.y || pos.y > fb.b) {

            if (pos.x > fb.r + rX) {
               x = (fb.x - (rX - 1));
            }
            if (pos.y > fb.b + rY) {
               y = (fb.y - (rY - 1));
            }
            if (pos.x < fb.x - rX) {
               x = (fb.r + (rX - 1));
            }
            if (pos.y < fb.y - rY) {
               y = (fb.b + (rY - 1));
            }
            pos.set(x, y);
         }
         return pos;
      },

      addUFO: function() {
         var ufo = SpaceroidsUFO.create();
         ufo.setup(false);
         Spaceroids.renderContext.add(ufo);
      },

      /**
       * The name of the game
       * @return {String}
       */
      getName: function() {
         return "Asteroids Evolution";
      }
   });
};
