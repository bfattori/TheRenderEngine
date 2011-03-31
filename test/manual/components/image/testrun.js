
R.Engine.requires("/components/component.image.js");
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/engine.object2d.js");
R.Engine.requires("/resourceloaders/loader.image.js");

R.Engine.initObject("TestObject", "Object2D", function() {
	
	var TestObject = Object2D.extend({
		
		rect: null,
		
		constructor: function(point, image) {
			this.base();
			this.add(Transform2DComponent.create("move"));
			this.add(ImageComponent.create("image", TestRunner.imageLoader, "redball"));
			
			this.getComponent("move").setPosition(point);
		}		
	});
	
	return TestObject;
});

R.Engine.initObject("TestRunner", null, function() {

	var TestRunner = Base.extend({
		
		constructor: null,
		waitTimer: null,
		imageLoader: null,
		ctx: null,

		viewRect: Rectangle2D.create(0,0,200,200),
		
		run: function() {
			// Set up a canvas for a simple object
			this.ctx = CanvasContext.create("context", 200, 200);
			this.ctx.setBackgroundColor("black");
			
			R.Engine.getDefaultContext().add(this.ctx);
			
			this.imageLoader = ImageLoader.create();
			this.imageLoader.load("redball", ManualTest.getTest() + "/redball.png", 120, 60);
			var self = this;
			this.waitTimer = Timeout.create("resources", 100, function() {
				self.waitForResources();
			});
		},
		
		waitForResources: function() {
			if (this.imageLoader.isReady()) {
				this.waitTimer.destroy();
				this.waitTimer = null;
				this.start();
			} else {
				this.waitTimer.restart();
			}
		},
		
		start: function() {
			this.ctx.add(TestObject.create(Point2D.create(10,10), "redball"));
		}
		
	});

	R.engine.Support.whenReady(TestRunner, function() {
		TestRunner.run();
	});

	return TestRunner;	
});

