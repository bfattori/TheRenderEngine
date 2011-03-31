module("engine");

test("Objects", function() {
	expect(10);

	ok( ConsoleRef != null, "ConsoleRef exists" );
	ok( HTMLConsoleRef != null, "HTMLConsoleRef exists" );
	ok( SafariConsoleRef != null, "SafariConsoleRef exists" );
	ok( OperaConsoleRef != null, "OperaConsoleRef exists" );
	ok( FirebugConsoleRef != null, "FirebugConsoleRef exists" );
	ok( Console != null, "Console exists" );
	ok( Assert != null, "Assert exists" );
	ok( AssertWarn != null, "AssertWarn exists" );
	ok( EngineSupport != null, "EngineSupport exists" );
	ok( Engine != null, "Engine exists" );

});

var TestConsoleRef = ConsoleRef.extend({
	output: null,
   constructor: function() {
		this.output = [];
	},
	getOutputLength: function() {
		return this.output.length;
	},
   info: function() {
		this.output.push("info");
	},
   debug: function() {
		this.output.push("debug");
	},
   warn: function() {
		this.output.push("warn");
	},
   error: function() {
		this.output.push("error");
	},
   getClassName: function() {
		return "TestConsoleRef";
	}
});

var tRef = new TestConsoleRef();
R.Engine.setDebugMode(true);
R.debug.Console.setConsoleRef(tRef);

test("Console", function() {
	expect(5);

	R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_NONE);
	R.debug.Console.log("foo");
	equals(tRef.getOutputLength(), 0, "R.debug.Console.DEBUGLEVEL_NONE");

	R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_ERRORS);
	R.debug.Console.debug("foo");
	equals(tRef.getOutputLength(), 0, "R.debug.Console.DEBUGLEVEL_ERRORS");

	R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_VERBOSE);
	R.debug.Console.warn("foo");
	equals(tRef.getOutputLength(), 1, "R.debug.Console.DEBUGLEVEL_VERBOSE");

	R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_DEBUG);
	R.debug.Console.log("foo");
	equals(tRef.getOutputLength(), 1, "R.debug.Console.DEBUGLEVEL_DEBUG");

	R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_WARNINGS);
	R.debug.Console.warn("foo");
	equals(tRef.getOutputLength(), 2, "R.debug.Console.DEBUGLEVEL_WARNINGS");

});

test("Assert", function() {
	expect(3);

	try {
		Assert(false, "Asserting");
	} catch (ex) {
		// We should get an exception
		ok( ex, "Assert threw exception" );
	}
	ok( !R.Engine.started && !R.Engine.running, "Assert stopped engine" );

	R.Engine.startup();
	R.Engine.run();

	ok( R.Engine.running, "Engine started again" );

});

test("AssertWarn", function() {
	expect(1);
	AssertWarn(false, "Asserting");
	equals(tRef.getOutputLength(), 4, "AssertWarn logged a warning");
});

test("EngineSupport", function() {
	expect(12);

	var arr = ["cat", "dog", "mouse", "horse", "pig", "cow"];

	equals(R.engine.Support.indexOf(arr, "mouse"), 2, "indexOf");

	R.engine.Support.arrayRemove(arr, "dog");
	equals( arr.length, 5, "arrayRemove" );

	var newArr = R.engine.Support.filter(arr, function(e) {
		return (e.indexOf("c") == 0);
	});
	equals( newArr.length, 2, "filter");

	var copyArr = [];
	R.engine.Support.forEach(arr, function(e) {
		copyArr.push(e);
	});
	ok( copyArr.length == arr.length, "forEach");

	var fArr = [];
	var rand = [];
	for (var x = 0; x < 10; x++) {
		rand[x] = Math.floor(Math2.random() * 49);
	}
	R.engine.Support.fillArray(fArr, 50, "dog");
	// Test a 10-point random sampling of the array
	ok( (function(){
			for (var k = 0; k < 10; k++) {
				if (fArr[rand[k]] != "dog") {
					return false;
				}
			}
			return true;
		  })(), "fillArray");

	var path = R.engine.Support.getPath("http://www.google.com/ip/index.html");
	equals( path, "http://www.google.com/ip", "getPath" );

	ok( !R.engine.Support.checkBooleanParam("notExist"), "checkBooleanParam" );
	ok( !R.engine.Support.checkStringParam("notExist", "STRING"), "checkStringParam" );
	ok( !R.engine.Support.checkNumericParam("notExist", "NUMBER"), "checkNumericParam" );

	ok( R.engine.Support.getStringParam("notExist", "COW") == "COW", "getStringParam" );
	ok( R.engine.Support.getNumericParam("notExist", 42) == 42, "getNumericParam" );

	hasKey( R.engine.Support.sysInfo(), "browser", "sysInfo has 'browser'" );
});

test("Engine", function() {
	expect(6);

	R.Engine.setDebugMode(true);
	ok( R.Engine.getDebugMode(), "set/getDebugMode" );
	R.Engine.setDebugMode(false);

	R.Engine.setFPS(10);
	equals( R.Engine.fpsClock, 100, "setFPS" );

	var dannyId = R.Engine.create(PooledObject.create("Danny"));
	ok( R.Engine.getObject(dannyId) != null, "create" );

	R.Engine.destroy(R.Engine.getObject(dannyId));
	ok( R.Engine.getObject(dannyId) == null, "destroy" );

	R.Engine.pause();
	ok( !R.Engine.running, "pause" );

	R.Engine.run();
	ok( R.Engine.running, "run" );


});
