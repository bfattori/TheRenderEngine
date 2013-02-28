// Load all required engine components
R.Engine.define({
    "class":"BlockPlayer",
    "requires":[
        "R.objects.Object2D",
        "R.math.Math2D"
    ]
});

var BlockPlayer = function () {
    return R.objects.Object2D.extend({

        velocity:null, // The velocity of our object
        shape:null, // Our object's shape

        constructor:function () {
            // Call the base class to assign a name to this object
            this.base("BlockPlayer");

            // Pick a random position to start at
            var start = R.math.Math2D.randomPoint(R.clone(Tutorial2.getFieldRect())
                .shrink(25, 25).offset(25, 25));

            // Pick a random velocity for each axis
            this.velocity = R.math.Vector2D.create(1 + Math.floor(R.lang.Math2.random() * 3),
                1 + Math.floor(R.lang.Math2.random() * 3));

            // Set our object's shape
            this.shape = R.math.Rectangle2D.create(0, 0, 50, 50);

            // Position the object
            this.setPosition(start);
        },

        /**
         * Update the object within the rendering context.  This calls the transform
         * components to position the object on the playfield.
         *
         * @param renderContext {RenderContext} The rendering context
         * @param time {Number} The engine time in milliseconds
         * @param dt {Number} Delta time since last update
         */
        update:function (renderContext, time, dt) {
            renderContext.pushTransform();

            // Call the "update" method of the super class
            this.base(renderContext, time);

            // Update the object's position
            this.move();

            // Draw the object on the render context
            this.draw(renderContext);

            renderContext.popTransform();
        },

        /**
         * Calculate and perform a move for our object.  We'll use
         * the field dimensions from our playfield to determine when to
         * "bounce".
         */
        move:function () {
            var pos = this.getPosition().add(this.velocity);

            // Determine if we hit a "wall" of our playfield
            var playfield = Tutorial2.getFieldRect();

            if ((pos.x + 50 > playfield.r) || (pos.x < 0)) {
                // Reverse the X velocity
                this.velocity.setX(this.velocity.x * -1);
            }

            if ((pos.y + 50 > playfield.b) || (pos.y < 0)) {
                // Reverse the Y velocity
                this.velocity.setY(this.velocity.y * -1);
            }
        },

        /**
         * Draw our game object onto the specified render context.
         * @param renderContext {RenderContext} The context to draw onto
         */
        draw:function (renderContext) {
            // Generate a rectangle to represent our object
            var pos = this.getPosition();

            // Set the color to draw with
            renderContext.setFillStyle("#ffff00");
            renderContext.drawFilledRectangle(this.shape);
        }

    }, { // Static

        /**
         * Get the class name of this object
         * @return {String} The string MyObject
         */
        getClassName:function () {
            return "BlockPlayer";
        }
    });
}
