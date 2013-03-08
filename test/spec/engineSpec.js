describe("Suite R: ", function () {

   it("R should be defined", function () {
      expect(R).toBeDefined();
   });

   it("R.global should be the window object", function () {
      expect(R.global).toBe(window);
   });

   it("cannot redefine package in R namespace", function() {
      expect(function() { R.namespace('lang'); }).toThrow("Namespace 'lang' already defined!");
   });

   it("R._unsupported() should throw an exception", function() {
      expect(function() { R._unsupported('unsupp', 'fakeClass'); }).toThrow("Object fakeClass has no method 'getClassName'");
   });

   it("All namespaces", function() {
      expect(R.debug).toBeDefined();
      expect(R.lang).toBeDefined();
      expect(R.struct).toBeDefined();
      expect(R.math).toBeDefined();
      expect(R.engine).toBeDefined();
      expect(R.collision).toBeDefined();
      expect(R.collision.broadphase).toBeDefined();
      expect(R.components).toBeDefined();
      expect(R.components.input).toBeDefined();
      expect(R.components.transform).toBeDefined();
      expect(R.components.logic).toBeDefined();
      expect(R.components.logic.behaviors).toBeDefined();
      expect(R.components.collision).toBeDefined();
      expect(R.components.render).toBeDefined();
      expect(R.components.physics).toBeDefined();
      expect(R.objects).toBeDefined();
      expect(R.particles).toBeDefined();
      expect(R.physics).toBeDefined();
      expect(R.rendercontexts).toBeDefined();
      expect(R.resources).toBeDefined();
      expect(R.resources.loaders).toBeDefined();
      expect(R.resources.types).toBeDefined();
      expect(R.sound).toBeDefined();
      expect(R.storage).toBeDefined();
      expect(R.text).toBeDefined();
      expect(R.ui).toBeDefined();
      expect(R.util).toBeDefined();
      expect(R.util.console).toBeDefined();

   });

   describe("Methods of R namespace", function () {
      var func, str, arr, obj, num, nil;

      beforeEach(function() {
         func = function() { return 'function'; };
         str = '13';
         arr = ['function','array','object'];
         obj = { 'function': true, 'array': false, 'add': function(a,b) { return a + b; } };
         num = 12;
         nil = null;
      });

      it("R.isFunction() should be true", function () {
         expect(R.isFunction(func)).toBeTruthy();
         expect(R.isFunction(str)).toBeFalsy();
      });

      it("R.isString() should be true", function () {
         expect(R.isString(str)).toBeTruthy();
         expect(R.isString(arr)).toBeFalsy();
      });

      it("R.isArray() should be true", function () {
         expect(R.isArray(arr)).toBeTruthy();
         expect(R.isArray(obj)).toBeFalsy();
      });

      it("R.isNumber() should be true", function () {
         expect(R.isNumber(num)).toBeTruthy();
         expect(R.isNumber(str)).toBeFalsy();
      });

      it("R.isEmpty() should be true", function () {
         expect(R.isEmpty(nil)).toBeTruthy();
         expect(R.isEmpty(str)).toBeFalsy();
      });
   });

   describe("Clock", function() {
      it('tests the R.now() method', function() {
         var before, flag = false, after;

         runs(function() {
            before = R.now();

            setTimeout(function() {
               after = R.now();
               flag = true;
            }, 100);
         });

         waitsFor(function() {
            return flag;
         }, 'The timer to expire', 500);

         runs(function() {
            expect(after).toBeGreaterThan(before);
         });

      });
   });
});

describe("Debug Console", function() {

   describe("Reference console", function() {
      var ref;

      beforeEach(function() {
         ref = new R.debug.ConsoleRef();
      });

      it("should be named R.debug.ConsoleRef", function() {
         expect(ref.getClassName()).toBe("R.debug.ConsoleRef");
      });

      it("should have five logging methods", function() {
         expect(ref.debug).toBeDefined();
         expect(ref.info).toBeDefined();
         expect(ref.warn).toBeDefined();
         expect(ref.error).toBeDefined();
         expect(ref.trace).toBeDefined();
      });

   });

   describe("Console", function() {
      var ref;
      beforeEach(function() {
         ref = new R.debug.ConsoleRef();
         spyOn(ref, 'debug');
         spyOn(ref, 'info');
         spyOn(ref, 'warn');
         spyOn(ref, 'error');
         spyOn(ref, 'trace');

         R.debug.Console.setConsoleRef(ref);
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_DEBUG);
      });

      it("should be in debug mode", function() {
         expect(R.debug.Console.getDebugLevel()).toBe(R.debug.Console.DEBUGLEVEL_DEBUG);
      });

      it("should NOT log any messages", function() {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_NONE);
         R.debug.Console.log("debug message");
         R.debug.Console.debug("debug message");
         R.debug.Console.info("debug message");
         R.debug.Console.warn("debug message");
         R.debug.Console.error("debug message");
         expect(ref.debug).not.toHaveBeenCalled();
         expect(ref.info).not.toHaveBeenCalled();
         expect(ref.warn).not.toHaveBeenCalled();
         expect(ref.error).not.toHaveBeenCalled();
      });

      it("should log a message", function() {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_VERBOSE);
         R.debug.Console.log("debug message");
         expect(ref.debug).toHaveBeenCalledWith("debug message");
      });

      it("should log an info", function() {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_DEBUG);
         R.debug.Console.debug("info message");
         expect(ref.info).toHaveBeenCalledWith("info message");
      });

      it("should log a warning", function() {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_WARNINGS);
         R.debug.Console.warn("warning message");
         expect(ref.warn).toHaveBeenCalledWith("warning message");
      });

      it("should log an error", function() {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_ERRORS);
         R.debug.Console.error("error message");
         expect(ref.error).toHaveBeenCalledWith("error message");
      });

      it("should NOT log an info in ERRORS mode", function() {
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_ERRORS);
         R.debug.Console.debug("error message");
         expect(ref.debug).not.toHaveBeenCalled();
      });
   });

   describe("Assertions", function() {
      var ref;
      beforeEach(function() {
         ref = new R.debug.ConsoleRef();
         spyOn(ref, 'warn');

         R.debug.Console.setConsoleRef(ref);
         R.debug.Console.setDebugLevel(R.debug.Console.DEBUGLEVEL_DEBUG);
      });

      it("should test Assert()", function() {
         expect(function() { Assert(true, "No error"); }).not.toThrow("No error");
         expect(function() { Assert(false, "Error"); }).toThrow("Error");
      });

      it("should test AssertWarn()", function() {
         AssertWarn(false, "Warning Will Robinson!");
         expect(ref.warn).toHaveBeenCalled();
      })
   });
});

describe("Math2", function() {
   var rnd;
   beforeEach(function() {
      rnd = R.lang.Math2.seed(2);
   });

   it("should be max integer (4294967295)", function() {
      expect(R.lang.Math2.MAX_INT).toBe(4294967295);
   });

   it("should be a repeatable random", function() {
      expect(R.lang.Math2.randomInt()).toEqual(2207042835);
      expect(R.lang.Math2.randomInt()).toEqual(1495354368);
      expect(R.lang.Math2.randomInt()).toEqual(3763702784);
   });

   it("should be a random number less than 50", function() {
      expect(R.lang.Math2.randomRange(1, 50, true)).toBeLessThan(51);
   });

   it("should parse 0010011 binary as 19 decimal", function() {
      expect(R.lang.Math2.parseBin("0010011")).toBe(19);
   });

   it("should convert 128 decimal to 0x80 hex", function() {
      expect(R.lang.Math2.toHex(128)).toEqual("0x80");
   });

   it("should parse 23 decimal as 10111 binary", function() {
      expect(R.lang.Math2.toBinary(23)).toEqual("10111");
   });
});

describe("EngineSupport", function() {
   var arr;
   beforeEach(function() {
      arr = [1, 2, 3, "dog", "cat", "bird"];
   });

   it("should find the index of 'cat'", function() {
      expect(R.engine.Support.indexOf(arr, 'cat')).not.toBe(-1);
   });

   it("should remove 3 from the array", function() {
      R.engine.Support.arrayRemove(arr, 3);
      expect(arr).not.toContain(3);
   });

   it("should see an empty string", function() {
      expect(R.engine.Support.isEmpty("")).toBeTruthy();
   });

   it("should filter the array to only include strings", function() {
      var filtered = R.engine.Support.filter(arr, function(item) {
         return R.isString(item);
      });

      expect(filtered.length).toBe(3);
      expect(R.isNumber(filtered[0])).toBeFalsy();
   });

   it("should duplicate the array using forEach", function() {
      var newArray = [];
      R.engine.Support.forEach(arr, function(el) {
         newArray.push(el);
      });

      expect(arr).toEqual(newArray);
   });

   it("should fill a new array with zeros", function() {
      var newArray = [];
      R.engine.Support.fillArray(newArray, 10, 0);

      expect(newArray.length).toBe(10);
      expect(newArray[0]).toEqual(newArray[9]);
   });

   it("should get the path from a URL not including the trailing slash", function() {
      expect(R.engine.Support.getPath("http://www.google.com/foo/bar/baz.html")).toBe("http://www.google.com/foo/bar");
   });

   // TODO: Check query params, etc.

   xit("should wait for an object to be available", function() {
      var obj;

      runs(function() {
         setTimeout(function() {
            obj = {
               bar: null,
               foo: function() { this.bar = "foo"; }
            };
         }, 200);
      });

      waitsFor(function() {
         R.engine.Support.whenReady(obj, function() {
            obj.foo();
         });
      }, 1500);

      runs(function() {
         expect(obj.bar).toEqual("foo");
      });
   });
});

describe("Linker", function() {

   R.engine.BaseDummyClass = Base.extend({
   }, {
      getClassName: function() {
         return "R.engine.BaseDummyClass";
      }
   });

   R.engine.DummyClass = function() {
      return R.engine.BaseDummyClass.extend({
      }, {
         getClassName: function() {
            return "R.engine.DummyClass";
         }
      });
   };

   beforeEach(function() {
      spyOn(R.engine.Linker, '_initClass').andCallThrough();
   });

   it("should define a class without any dependencies and immediately initialize it", function() {
      R.Engine.define({
      	"class": "R.engine.DummyClass"
      });

      expect(R.engine.Linker._initClass).toHaveBeenCalled();
      expect(R.engine.Linker.resolvedClasses['R.engine.DummyClass']).toBeDefined();
      expect(R.engine.DummyClass.getClassName()).toBe("R.engine.DummyClass");
   });

});

describe("Engine", function() {
   beforeEach(function() {
      spyOn(R.Engine, 'startup').andCallThrough();
      spyOn(R.Engine, 'shutdown').andCallThrough();
   });

   it("should start the engine", function() {
       runs(function() {
           expect(R.Engine.running).toBeFalsy();
       });

      R.Engine.startup();

       waitsFor(function() {
           return true;
       }, 'The engine classes to load', 3000);

       runs(function() {
           expect(R.engine.Game).toBeDefined();
       });


      expect(R.Engine.started).toBeTruthy();
   });

   it("should shutdown the engine", function() {
      R.Engine.shutdown();
      expect(R.Engine.running).toBeFalsy();
   });
});

describe("Events Engine", function() {
   it("should fail", function() {
      expect(true).toBeFalsy();
   });
});

describe("PooledObject", function() {
   it("should fail", function() {
      expect(true).toBeFalsy();
   });
});

describe("BaseObject", function() {
   it("should fail", function() {
      expect(true).toBeFalsy();
   });
});

describe("GameObject", function() {
   it("should fail", function() {
      expect(true).toBeFalsy();
   });
});

describe("Object2d", function() {
   it("should fail", function() {
      expect(true).toBeFalsy();
   });
});

describe("Game", function() {
   it("should fail", function() {
      expect(true).toBeFalsy();
   });
});