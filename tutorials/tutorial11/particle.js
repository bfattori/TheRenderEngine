R.Engine.requires("/engine.math2d.js");
R.Engine.requires("/engine.particles.js");

R.Engine.initObject("SimpleParticle", "Particle", function() {

/**
 * @class A simple particle
 *
 * @param pos {Point2D} The starting position of the particle.  A
 *            velocity vector will be derived from this position.
 */
var SimpleParticle = Particle.extend(/** @scope SimpleParticle.prototype */{

   vec: null,
   decel: 0,
	invVel: null,

   constructor: function(pos, ttl, decel) {
      this.base(ttl || 2000);
      var p = pos.get();
      this.setPosition(p.x, p.y);

      var a = Math.floor(Math2.random() * 360);
      this.vec = Math2D.getDirectionVector(Point2D.ZERO, SimpleParticle.ref, a);
      var vel = 1 + (Math2.random() * 10);
      this.vec.mul(vel);
      this.decel = decel;
		this.invVel = Vector2D.create(0,0);
   },

   destroy: function() {
      this.vec.destroy();
		this.invVel.destroy();
      this.base();
   },
   
   release: function() {
      this.base();
      this.vec = null;
		this.invVel = null;
      this.decel = 0;
   },

   /**
    * Called by the particle engine to draw the particle to the rendering
    * context.
    *
    * @param renderContext {RenderContext} The rendering context
    * @param time {Number} The engine time in milliseconds
    */
   draw: function(renderContext, time) {
      if (this.decel > 0 && this.vec.len() > 0) {
         this.invVel.set(this.vec).neg();
         this.invVel.mul(this.decel);
         this.vec.add(this.invVel);
      }
      
      this.getPosition().add(this.vec);
 
      var colr = "#fff";
      var s = time - this.getBirth();
      var e = this.getTTL() - this.getBirth();
      colr = 255 - Math.floor(255 * (s / e));
      colr += (-10 + (Math.floor(Math2.random() * 20)));
      var fb = (Math2.random() * 100);
      if (fb > 90) {
         colr = 255;
      }

      colr = "#" + (colr.toString(16) + colr.toString(16) + colr.toString(16));

      renderContext.setFillStyle(colr);
      renderContext.drawPoint(this.getPosition());
   }

}, {
   getClassName: function() {
      return "SimpleParticle";
   },

   // A simple reference point for the "up" vector
   ref: Point2D.create(0, -1)
});

return SimpleParticle;

});
