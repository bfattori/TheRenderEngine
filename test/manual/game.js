/**
 * The Render Engine
 * Manual Testing Harness
 *
 * Runs the manual tests.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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

R.Engine.initObject("ManualTest", "Game", function(){

   /**
    * @class Simple harness to load tests into.
    */
   var ManualTest = Game.extend({
   
      constructor: null,
		testName: null,
      
      /**
       * Called to set up the game, download any resources, and initialize
       * the game to its running state.
       */
      setup: function(){
         // Set the FPS of the game
         R.Engine.setFPS(30);

			this.testName = R.engine.Support.getStringParam("test", "");
			if (this.testName != "") {
				// Load a known file
				TestRunner = {};
				Game.load("/" + this.testName + "/testrun.js");
			}		
      },
		
		getTest: function() {
			return this.testName;
		},
		
		showOutput: function() {
			$("div.output").css("display", "block");
		},
		
		log: function(txt) {
			$("div.output").append($("<span>").text(txt)).append($("<br/>")).scrollTop(500000);
		}      
   });
   
   return ManualTest;
   
});
