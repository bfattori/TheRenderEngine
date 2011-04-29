// Load all required engine components
R.Engine.define({
	"class": "PianoKeys",
	"requires": [
		"R.engine.Object2D",
      "R.math.Math2D",
      "R.engine.Events",

      "R.components.render.Image",
      "R.components.input.Keyboard"
	]
});

var PianoKeys = function() {
   return R.engine.Object2D.extend({

      sounds: null,
      dots: null,

      constructor: function() {
         this.base("PianoKeys");

         // Add the component which handles keyboard input
         this.add(R.components.input.Keyboard.create("input"));
         this.add(R.components.render.Image.create("draw", Tutorial4.imageLoader.getImage("keys")));

         // Position the object
         this.setPosition(R.math.Point2D.create(20, 25));

         // Get the sounds into an array
         var self = this;
         this.sounds = [];
         $.each(["c1","d1","e1","f1","g1","a1","b1","c2"], function() {
            self.sounds.push(Tutorial4.soundLoader.get(this));
         });

         // Initialize the "dot" indicators array
         this.dots = [];
         R.engine.Support.fillArray(this.dots, 8, false);
      },

      /**
       * Update the object within the rendering context.  This calls the transform
       * components to position the object on the playfield.
       *
       * @param renderContext {RenderContext} The rendering context
       * @param time {Number} The engine time in milliseconds
       */
      update: function(renderContext, time) {
         renderContext.pushTransform();

         // The the "update" method of the super class
         this.base(renderContext, time);

         // Draw a dot on the key being pressed
         this.draw(renderContext);

         renderContext.popTransform();
      },

      /**
       * Handle a "keydown" event from <tt>R.components.input.Keyboard</tt>.
       * @param keyCode {Number} The key which was pressed.
       */
      onKeyDown: function(charCode) {
         // These will trigger a dot on the key being played
         if (charCode >= 49 && charCode <= 56) {
            this.sounds[charCode - 49].play();
            this.dots[charCode - 49] = true;
         }
         return false;
      },

      /**
       * Handle a "keyup" event from <tt>R.components.input.Keyboard</tt>.
       * @param keyCode {Number} The key which was pressed.
       */
      onKeyUp: function(charCode) {
         // These will remove the dot on the key being played
         if (charCode >= 49 && charCode <= 56) {
            this.dots[charCode - 49] = false;
         }
         return false;
      },

      /**
       * Draw the dots onto the keyboard when a key is pressed.
       * @param renderContext {R.rendercontexts.AbstractRenderContext} The context to draw onto
       */
      draw: function(renderContext) {
         for (var key = 0; key < 8; key++) {
            var keyColor = this.dots[key] ? "#ff0000" : "#ffffff";
            var dotShape = R.math.Rectangle2D.create(15 + (26 * key), 108, 10, 10);
            renderContext.setFillStyle(keyColor);
            renderContext.drawFilledRectangle(dotShape);
         }
      }

   }, { // Static

      /**
       * Get the class name of this object
       * @return {String} The string MyObject
       */
      getClassName: function() {
         return "PianoKeys";
      }
   });
};
