
R.Engine.requires("/components/component.keyboardinput.js");
R.Engine.requires("/engine.baseobject.js");
R.Engine.requires("/engine.object2d.js");

R.Engine.initObject("TestObject", "Object2D", function() {
	
	var TestObject = Object2D.extend({
		
		rect: null,
		
		constructor: function(foo) {
			this.base();
			this.add(KeyboardInputComponent.create("input"));
		},
		
		update: function(ctx, time) {
			this.base(ctx, time);
		},
		
		onKeyDown: function(which, keyCode, ctrlKey, altKey, shiftKey, eventObj) {
			ManualTest.log("keydown: " + which + " [" + keyCode + "] c:" + ctrlKey + " a:" + altKey + " s:" + shiftKey);
		},

		onKeyUp: function(which, keyCode, ctrlKey, altKey, shiftKey, eventObj) {
			ManualTest.log("keyup: " + which + " [" + keyCode + "] c:" + ctrlKey + " a:" + altKey + " s:" + shiftKey);
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

