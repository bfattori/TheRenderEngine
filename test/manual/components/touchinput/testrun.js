
R.Engine.requires("/components/component.touchinput.js");
R.Engine.requires("/engine.baseobject.js");
R.Engine.requires("/engine.object2d.js");

R.Engine.initObject("TestObject", "Object2D", function() {
	
	var TestObject = Object2D.extend({
		
		rect: null,
		
		constructor: function(foo) {
			this.base();
			this.add(TouchInputComponent.create("input", true));
		},
		
		update: function(ctx, time) {
			this.base(ctx, time);
		},
		
		onTouchStart: function(touches, eventObj) {
			ManualTest.log("START touches: " + touches.length + " [" + touches[0].get() + "]");
		},

		onTouchEnd: function(touches, eventObj) {
			ManualTest.log("END touches: " + touches.length);
		},

		onTouchMove: function(touches, eventObj) {
			ManualTest.log("MOVE touches: " + touches.length + " [" + touches[0].get() + "]");
		}
		
	});
	
	return TestObject;
});

R.Engine.initObject("TestRunner", null, function() {

	var TestRunner = Base.extend({
		
		constructor: null,

		run: function() {
			ManualTest.showOutput();
			
			R.Engine.getDefaultContext().add(TestObject.create());
		}
		
	});

	R.engine.Support.whenReady(TestRunner, function() {
		TestRunner.run();
	});

	return TestRunner;	
});

