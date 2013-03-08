
/**
 * The Render Engine
 * Example Game: Spaceroids - an Asteroids clone
 *
 * The bullet object
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1572 $
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
	"class": "SpaceroidsBullet",
	"requires": [
		"R.components.transform.Mover2D",
		"R.components.render.Vector2D",
		"R.components.collision.Circle",
		"R.objects.Object2D",
		"R.math.Math2D"
	]
});

/**
 * @class The bullet object.
 *
 * @param player {Spaceroids.Player} The player object this bullet comes from,
 */
var SpaceroidsBullet = function() {
	return R.objects.Object2D.extend({

   player: null,
   rot: null,

   constructor: function(player) {
      this.base("Bullet", R.components.transform.Mover2D.create("move"));

      // Track the player that created us
      this.player = player;
      this.rot = player.getRotation();

      // Add components to draw the bullet
      this.add(R.components.render.Vector2D.create("draw"));

      // Set up collision component (OBB hull [SAT])
      this.add(R.components.collision.Circle.create("collide", Spaceroids.collisionModel));
		this.getComponent("collide").setCollisionMask(SpaceroidsBullet.COLLISION_MASK);

      // Get the player's position and rotation,
      // then position this at the tip of the ship
      // moving away from it
      var p_mover = this.player.getComponent("move");
      var c_mover = this.getComponent("move");
      var c_draw = this.getComponent("draw");

      c_draw.setPoints(SpaceroidsBullet.shape);
      c_draw.setLineStyle("white");
      c_draw.setFillStyle("white");

		this.setOrigin(c_draw.getCenter());
		
      this.setCollisionHull(c_draw.getCircleHull(1.3));
		this.setBoundingBox(c_draw.getBoundingBox());

      var r = p_mover.getRotation();
      var dir = R.math.Math2D.getDirectionVector(R.math.Point2D.ZERO, R.math.Vector2D.UP, r);

      var p = R.math.Point2D.create(p_mover.getPosition());
		var dPos = R.math.Point2D.create(dir).mul(10);
      c_mover.setPosition(p.add(dPos));
      c_mover.setVelocity(dir.mul(4.5));
		dir.destroy();
		p.destroy();
		dPos.destroy();
		this.setZIndex(1);
   },

   release: function() {
      this.base();
      this.player = null;
   },

   /**
    * Destroy a bullet, removing it from the list of objects
    * in the last collision model node.
    */
   destroy: function() {
   	Spaceroids.collisionModel.removeObject(this);
      this.base();
   },

   /**
    * Update the host object to reflect the state of the bullet.
    *
    * @param renderContext {RenderContext} The rendering context
    * @param time {Number} The engine time in milliseconds
    * @param dt {Number} The delta between the world time and the last time the world was updated
    *          in milliseconds.
    */
   update: function(renderContext, time, dt) {
      var c_mover = this.getComponent("move");

      // Is this bullet in field any more?
      var p = c_mover.getPosition();
      var bBox = R.math.Rectangle2D.create(p.x, p.y, 2, 2);
      if (!Spaceroids.inField(p, bBox))
      {
         this.player.removeBullet(this);
         this.destroy();
			bBox.destroy();
         return;
      }

      renderContext.pushTransform();
      this.base(renderContext, time, dt);
      renderContext.popTransform();
		bBox.destroy();
   }

}, {
   /**
    * Get the class name of this object
    *
    * @type String
    */
   getClassName: function() {
      return "SpaceroidsBullet";
   },

   // Why we have this, I don't know...
   shape: [ R.math.Point2D.create(-1, -1), R.math.Point2D.create( 1, -1),
            R.math.Point2D.create( 1,  1), R.math.Point2D.create(-1,  1)],

	COLLISION_MASK: R.lang.Math2.parseBin("100")
});
};