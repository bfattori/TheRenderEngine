
R.Engine.requires("/components/component.mouseinput.js");
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/engine.baseobject.js");
R.Engine.requires("/engine.object2d.js");

R.Engine.initObject("TestObject", "Object2D", function() {
	
	var TestObject = Object2D.extend({
		
		rect: null,
		
		constructor: function(foo) {
			this.base();
			this.add(MouseInputComponent.create("input"));
			this.rect = Rectangle2D.create(50, 50, 80, 80);
			
		},
		
		update: function(ctx, time) {
			this.base(ctx, time);
			ctx.pushTransform();
			ctx.setFillStyle("yellow");
			ctx.drawFilledRectangle(this.rect);
			ctx.popTransform();
		},
		
		getWorldBox: function() {
			return this.rect;
		},
		
		onMouseMove: function(mouseInfo) {
			if (Math2D.boxPointCollision(TestRunner.viewRect, mouseInfo.position)) {
				ManualTest.log("mousemove: " + mouseInfo.position.x + "," + mouseInfo.position.y);
			}
		},

		onMouseDown: function(mouseInfo) {
			ManualTest.log("mousedown: " + mouseInfo.button);
		},
		
		onMouseUp: function(mouseInfo) {
			ManualTest.log("mouseup");
		},
		
		onMouseOver: function(mouseInfo) {
			ManualTest.log("MOUSE OVER");
		},

		onMouseOut: function(mouseInfo) {
			ManualTest.log("MOUSE OUT");
		}
		
	});
	
	return TestObject;
});

R.Engine.initObject("TestRunner", null, function() {

	var TestRunner = Base.extend({
		
		constructor: null,

		viewRect: Rectangle2D.create(0,0,200,200),
		
		run: function() {
			ManualTest.showOutput();
			
			// Set up a canvas for a simple object
			var ctx = CanvasContext.create("context", 200, 200);
			ctx.setBackgroundColor("black");
			
			R.Engine.getDefaultContext().add(ctx);
			
			// Create the object and add it
			ctx.add(TestObject.create());
		}
		
	});

	R.engine.Support.whenReady(TestRunner, function() {
		TestRunner.run();
	});

	return TestRunner;	
});

