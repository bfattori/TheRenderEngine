R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/components/component.domrender.js");
R.Engine.requires("/engine.object2d.js");
R.Engine.requires("/engine.timers.js");

R.Engine.initObject("Player", "Object2D", function() {
	
	var Player = Object2D.extend({
		
		spinRate: null,
		
		constructor: function() {
			this.base("box");
			
			this.add(Transform2DComponent.create("move"));
			this.setPosition(Math2D.randomPoint(HTMLContextTest.getFieldBox()));
			
			// Set the spin rate to a random value
			this.spinRate = 3 + Math2.random() * 5;

			// Add the DOM render component.  This is what
			// causes the transformations to be updated each frame
			// for a simple DOM object.
			this.add(DOMRenderComponent.create("draw"));
			
			// The representation of this object in the HTML context
			this.setElement($("<div>").css({
				width: 100,
				height: 100,
				border: "1px solid white",
				position: "absolute"
			}));
			
			this.setBoundingBox(Rectangle2D.create(0,0,100,100));
			this.setOrigin(50,50);
		},
		
		update: function(renderContext, time) {
			renderContext.pushTransform();
			
			this.setRotation(this.getRotation() + this.spinRate);
			
			this.base(renderContext, time);
			renderContext.popTransform();
		},
		
		setPosition: function(point) {
			this.getComponent("move").setPosition(point);
		},
		
		setRotation: function(angle) {
			this.getComponent("move").setRotation(angle);
		},
		
		getRotation: function() {
			return this.getComponent("move").getRotation();
		}
		
	}, {
		getClassName: function() {
			return "Player";
		}
	});
	
	return Player;
});
