/**
 * The Render Engine
 * Manual Testing Harness
 *
 * Runs the manual tests.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1516 $
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
R.debug.Console.setDebugLevel(1);

R.Engine.define({
	"class": "TypesTest",
	"requires": [
		"R.engine.Game",
		"R.math.Math2D",
		"R.math.Point2D",
		"R.math.Rectangle2D",
		"R.math.Point2"
	]
});


/**
 * @class Testing new simple types
 */
var TypesTest = function() {
	return R.engine.Game.extend({

	constructor: null,
	testName: null,

	/**
	 * Called to set up the game, download any resources, and initialize
	 * the game to its running state.
	 */
	setup: function(){
		// Set the FPS of the game
		R.Engine.setFPS(30);

		var p2a = new R.math.Point2(1, 5);
		var p2b = new R.math.Point2(250, 7);
				
		TypesTest.log("p2a: " + p2a);				
		TypesTest.log("p2b: " + p2b);				

		TypesTest.log("p2a(add): " + p2a.add(p2b));				
		TypesTest.log("p2a(sub): " + p2a.sub(p2b));				
		TypesTest.log("p2b(mul): " + p2b.mul(2));				
		TypesTest.log("p2b.castTo(R.math.Point2D).convole(p2a): " + p2b.castTo(R.math.Point2D).convolve(p2a));
		TypesTest.log("p2b.castTo(R.math.Vector2D).len(): " + p2b.castTo(R.math.Vector2D).len());				

	},

	log: function(txt) {
		$("div.output").append($("<span>").text(txt)).append($("<br/>")).scrollTop(500000);
	}      
});

}