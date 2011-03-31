/**
 * The Render Engine
 * jQuery Extensions for Tools, and Simple JS Templating
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author$
 * @version: $Revision$
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

jQuery.extend({

   /*
    * Call a function by it's string representation.
    * The function will be passed the DOM element which triggered
    * the call.
    */
   callNSFunction: function(fName, obj) {
      fName = fName.split(".");
      var o = window;
      var i = fName.length - 1;
      while (i--) {
         o = o[fName.shift()];
      }
		var fnName = fName.shift();
		if (o[fnName]) {
			o[fnName](obj);	
		} else {
			// Alert the user that the called function doesn't exist
			alert("Function '" + fnName + "' not found!");
		}
      
   }

});

$(document).ready(function() {

   /* For any DOM element that has the "button" CSS class -
    *
    * Wire up a "mouseover" state.  If the element has the attribute
    * "func" assigned, wire up a click for that function call.
    */
   $(".button").hover(function() {
      $(this).addClass("mouseover");
   }, function() {
      $(this).removeClass("mouseover");
   }).each(function() {
      if ($(this).attr("func")) {
         $(this).mousedown(function() {
            $.callNSFunction($(this).attr("func"), this);
         });
      }
   });

   /* For buttons which are part of a group (i.e. they share
    * the same value for the attribute "groupname") only
    * one of the buttons will have the "selected" class.
    */
   $(".button.grouped").mousedown(function() {
      var gName = $(this).attr("groupname");
      $(".button.stateful[groupname=" + gName + "]").removeClass("selected");
      $(this).addClass("selected");
   });

   /* For buttons which have a state this will toggle that
    * state automatically, either assigning or removing the "on"
    * class.
    */
   $(".button.stateful").mousedown(function() {
      if ($(this).hasClass("on")) {
         $(this).removeClass("on");
      } else {
         $(this).addClass("on");
      }
   });
   
   /* For menubar controls
    */
   $(".menuItem").hover(function() {
      $(this).addClass("mouseover");
   }, function() {
      $(this).removeClass("mouseover").removeClass("open");
   }).click(function() {
      $(".menu", this).css("left", $(this).css("left")).css("top", $(this).css("top") + 28).parent().addClass("open");
   });

   $(".menu .item").hover(function() {
      $(this).addClass("mouseover");
   }, function() {
      $(this).removeClass("mouseover");
   }).mousedown(function() {
      if (!$(this).hasClass("disabled")) {
         $.callNSFunction($(this).attr("func"), this);
      }
   });
});

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();
