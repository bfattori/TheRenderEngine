// Load all required engine components
R.Engine.define({
	"class": "PianoKeys",
	"requires": [
		"R.objects.Object2D",
      "R.math.Math2D",
      "R.engine.Events",

      "R.components.render.Image",
      "R.components.input.Keyboard"
	]
});

var PianoKeys = function() {
   return R.objects.Object2D.extend({

      sounds: null,
      dots: null,

      constructor: function() {
         this.base("PianoKeys");

         // Add the component which handles keyboard input.  This is necessary to
         // receive the event triggers.
         this.add(R.components.input.Keyboard.create("input"));
         this.add(R.components.render.Image.create("draw", Tutorial9.imageLoader.getImage("keys")));

         // Position the object
         this.setPosition(R.math.Point2D.create(20, 25));

         // Get the sounds into an array
         var self = this;
         this.sounds = [];
         $.each(["c1","d1","e1","f1","g1","a1","b1","c2"], function() {
            self.sounds.push(Tutorial9.soundLoader.get(this));
         });

         // Initialize the "dot" indicators array
         this.dots = [];
         R.engine.Support.fillArray(this.dots, 8, false);

         // Add key event handlers
         this.addEvents({
            "keydown": function(evt, which) {
               // These will trigger a dot on the key being played
               if (which >= 49 && which <= 56) {
                  self.sounds[which - 49].play();
                  self.dots[which - 49] = true;
               }
               return false;
            },
            "keyup": function(evt, which) {
               // These will remove the dot on the key being played
               if (which >= 49 && which <= 56) {
                  self.dots[which - 49] = false;
               }
               return false;
            }
         });
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
