
/**
 * Derived from the color selector located @ http://www.daltonlp.com/view/174
 * (c)2007 Lloyd Dalton
 */
var ColorSelector = Base.extend(/** @scope ColorSelector.prototype */{

	id: null,

	// current control position
	sv_image: null,
	x: 0,
	y: 0,
	mouse_x: 0,
	mouse_y: 0,
	hexColor: null,
	hue_offset: 0,
	sat_offset: 0,
	val_offset: 0,
	color_select_bounding_box: null,    // upper-left corner x, upper-left corner y, width, height

	// state information for the controls
	initialized: false,
	active: false,

	h_select_box_focus: false,
	sv_select_box_focus: false,

	callabck: null,

	constructor: function(id, callback, initialColor) {
		this.id = id;
		this.callback = callback;

		// current control position
		this.sv_image="";
		this.x=0;
		this.y=0;
		this.hexcolor="";

		// Local reference for jQuery function handlers
		var self = this;

		this.color_select_box = $("<div>")
			.css("display", "none")
			.attr("id", this.id + "_color_select_box")
			.addClass("color_select_box");

		$(document.body).append(this.color_select_box);

		this.sv_crosshair_horiz_cursor = $("<div>")
			.css("visibility", "hidden")
			.attr("id", this.id + "_sv_crosshair_horiz_cursor")
			.addClass("sv_crosshair_horiz_cursor");

		this.color_select_box.append(this.sv_crosshair_horiz_cursor);

		this.sv_crosshair_vert_cursor = $("<div>")
			.css("visibility", "hidden")
			.attr("id", this.id + "_sv_crosshair_vert_cursor")
			.addClass("sv_crosshair_vert_cursor");

		this.color_select_box.append(this.sv_crosshair_vert_cursor);

		this.sv_crosshair_center_cursor = $("<div>")
			.css("visibility", "hidden")
			.attr("id", this.id + "_sv_crosshair_center_cursor")
			.addClass("sv_crosshair_center_cursor");

		this.color_select_box.append(this.sv_crosshair_center_cursor);

		this.sv_select_box_bg = $("<div>")
			.css({width: "256px", height: "256px"})
			.attr("id", this.id + "_sv_select_box_bg")
			.addClass("sv_select_box_bg");

		this.color_select_box.append(this.sv_select_box_bg);

		this.sv_select_box = $("<div>")
			.css({width: "256px", height: "256px"})
			.attr("id", this.id + "_sv_select_box")
			.addClass("sv_select_box")
			.mousedown(function(evt) { self.sv_select_box_mousedown(evt.originalEvent.layerX, evt.originalEvent.layerY); return false;})
			.mouseup(function() { self.sv_select_box_mouseup(); return false;})
			.mousemove(function(evt) { self.sv_update(evt.originalEvent.layerX, evt.originalEvent.layerY); });

		this.sv_select_box_bg.append(this.sv_select_box);

		this.h_select_box = $("<div>")
			.attr("id", this.id + "_h_select_box")
			.addClass("h_select_box")
			.mousedown(function(evt) { self.h_select_box_mousedown(evt.originalEvent.layerY); return false;})
			.mouseup(function() { self.h_select_box_mouseup(); return false; })
			.mousemove(function(evt) { self.hue_cursor_to_color(evt.originalEvent.layerY); });

		this.color_select_box.append(this.h_select_box);

		this.color_box = $("<div>")
			.attr("id", this.id + "_color_box")
			.addClass("color_box");

		this.color_select_box.append(this.color_box);

		this.color_value_box = $("<div>")
			.attr("id", this.id + "_color_value_box")
			.addClass("color_value_box");

		this.color_box.append(this.color_value_box);

		// ok button
		this.ok_button = $("<div>")
			.attr("id", this.id + "_ok_button")
			.addClass("ok_button")
			.html("ok")
			.click(function() { self.hide(); });

		this.color_select_box.append(this.ok_button);

		// hue cursor
		this.hue_cursor = $("<div>")
			.attr("id", this.id + "_hue_cursor")
			.addClass("hue_cursor");

		this.h_select_box.append(this.hue_cursor);

		// used for mapping between mouse positions and color parameters
		this.hue_offset=0;
		this.sat_offset=0;
		this.val_offset=0;
		this.color_select_bounding_box = new Array(4);    // upper-left corner x, upper-left corner y, width, height

		// state information for the controls
		this.initialized=false;
		this.active=false;
		//alert('this should appear only twice! ' + this.id);
		this.h_select_box_focus=false;
		this.sv_select_box_focus=false;

		// initial values
		if (initialColor) {
			this.setrgb(initialColor)
		} else {
			this.setrgb("#ffffff");
		}
	},

	attach_to_element: function(e) {
		this.x = ColorSelector.docjslib_getRealLeft(e);
		this.y = ColorSelector.docjslib_getRealTop(e) + 22;  // clumsy hack.  Won't work for elements higher than 22 px
	},

	h_select_box_mousedown: function(y) {
		this.h_select_box_focus = true;
		//window.status='(h_select_box_mousedown) ('+mouse_x+','+mouse_y+') ' + this.id + " " + this.h_select_box_focus;
		this.hue_cursor_to_color(y);
	},

	h_select_box_mouseup: function() {
		this.h_select_box_focus = false;
	},

	sv_select_box_mousedown: function(x, y) {
		this.sv_select_box_focus = true;
		//window.status='(sv_select_box_mousedown) ('+mouse_x+','+mouse_y+') ' + this.id + " " + this.sv_select_box_focus;
		this.sv_update(x, y);
	},

	sv_select_box_mouseup: function() {
		this.sv_select_box_focus = false;
	},

	// these functions are tied to events (usually).
	// they are the entry points for whatever color_select does
	show: function(x, y, initialColor)
	{
		this.x = x || 0;
		this.y = y || 0;
		// alert ("show color select");
		this.color_select_bounding_box = [];
		if (initialColor) {
			this.setrgb(initialColor);
		}

		// in mozilla, insert the saturation-value background image
//		if (!document.all && this.sv_image) {
//			this.sv_select_box.style.backgroundImage = "url('"+this.sv_image+"')";
//		}

		// make them visible first so we can substract the position of
		// offsetParent

		this.color_select_box
			.css({
				visibility: "visible",
				display: "block",
				position: "absolute",
				left: this.x,
				top: this.y
			});


		this.color_select_bounding_box[0]=this.x;
		this.color_select_bounding_box[1]=this.y;
		this.color_select_bounding_box[2]=300;
		this.color_select_bounding_box[3]=300;

		this.sv_cursor_draw();

		// position hue cursor
		this.hue_cursor.css("left", (this.h_select_box.css("left") - this.color_select_box.css("left"))-1);
		this.hue_cursor_draw();

		this.initialized=true;
		this.active=true;

		this.update_color_box();
		//console.debug("new hsv: "+ this.hue_cursor_pos +" "+this.sat_cursor_pos+" "+this.val_cursor_pos);
		//console.debug(this.x + " " + this.y);
	},

	hide: function()
	{
		if (this.color_select_box[0]) {
			this.color_select_box.css("display", "none");
		}

		this.active=false;
		this.unfocus();

		this.callback(this.hexcolor);
	},

	toggle_color_select: function()
	{
		if (this.active) {
			this.hide();
		} else {
			this.show();
		}
	},

	update: function() {
		this.sv_update();
		this.hue_cursor_to_color();
	},

	select_disable: function()
	{
		// This function is IE-only!  Moz doesn't need it, and ignores it.
		// When the mouse is dragged, IE attempts to select the DOM objects,
		// which would be ok, but IE applies a dark highlight to the selection.
		// This makes the color select look flickery and bad.
		// The solution is to disable IE's selection event when it occurs when the mouse is over
		// the color select.

		// But that's not quite enough.  We *do* want to be able to select the #FFFFF hex
		// value.  So we only disable IE selection when the mouse is moving the s-v or hue
		// cursor.

		if (this.h_select_box_focus || this.sv_select_box_focus) {
			return true;
		} else {
			return false;
		}
	},

	hue_cursor_to_color: function(y)
	{
		//alert(this.h_select_box_focus);
		// map from the mouse position to the new hue value

		if (!this.h_select_box_focus) return;

		var new_hue_cursor_pos = y;
		//alert(new_hue_cursor_pos);

		// keep the value sensible
		if (new_hue_cursor_pos > 255) {
			new_hue_cursor_pos=255;
		}

		if (new_hue_cursor_pos < 0) {
			new_hue_cursor_pos=0;
		}

		this.hue_cursor_pos = new_hue_cursor_pos;
		this.hue_value = 360 - new_hue_cursor_pos/255*360;

		this.hue_cursor_draw();
		this.cursor_to_color();
	},

	sv_update: function(x, y)
	{
		// map from the mouse position to the new s-v values

		// might be possible to get rid of this
		if (!this.sv_select_box_focus) return;

		var new_sat_cursor_pos = y - 3;
		var new_val_cursor_pos = x - 3;

		// keep the values sensible
		if (new_sat_cursor_pos > 255) {
			new_sat_cursor_pos = 255;
		}

		if (new_sat_cursor_pos < 0) {
			new_sat_cursor_pos = 0;
		}

		if (new_val_cursor_pos > 255) {
			new_val_cursor_pos = 255;
		}

		if (new_val_cursor_pos < 0) {
			new_val_cursor_pos = 0;
		}

		this.sat_cursor_pos = new_sat_cursor_pos;
		this.val_cursor_pos = new_val_cursor_pos;
		//window.status = this.hue_cursor_pos + ","+this.sat_cursor_pos + ","+this.val_cursor_pos +"("+this.sat_offset+ ","+this.val_offset+")";

		this.sv_cursor_draw();
		this.cursor_to_color();

		return;
	},

	hue_cursor_draw: function()
	{
		//if (!this.hue_cursor.style) return;
		//if (!this.sv_select_box_bg.style) return;

		this.hue_cursor.css({
			top: this.hue_cursor_pos+1,
			visibility: "visible" });

		// update sv_select_box background
		var hsvcolor = new Array(this.hue_value,1,255);
		var rgbcolor = ColorSelector.hsv2rgb(hsvcolor);
		var new_color = "rgb("+rgbcolor[0]+", "+rgbcolor[1]+", "+rgbcolor[2]+")";
		this.sv_select_box_bg.css("background", new_color);
		//window.status="hue cursor draw! " + this.hue_cursor.style.left;
	},

	sv_cursor_draw: function()
	{
		//if (!this.sv_crosshair_horiz_cursor.style) return;
		//if (!this.sv_crosshair_vert_cursor.style) return;

		// this is sort of a seat-of-the-pants algorithm for keeping the cursor
		// visible against the s-v background.  There are probably better methods.
		var cursor_color = this.val_cursor_pos;
		if (cursor_color==0) {
			cursor_color=.001;
		}

		cursor_color = Math.round(255/(cursor_color/30));
		if (cursor_color > 255) {
			cursor_color = 255;
		}
		if (cursor_color < 0) {
			cursor_color = 0;
		}

		this.sv_crosshair_vert_cursor.css({
			backgroundColor: "rgb("+cursor_color+","+cursor_color+","+cursor_color+")",
			borderColor: "rgb("+cursor_color+","+cursor_color+","+cursor_color+")"});

		// place the s-v cursors.
		this.sv_crosshair_horiz_cursor.css({
			top: this.sat_cursor_pos+3,
			left: 2,
			visibility: "visible"});

		this.sv_crosshair_vert_cursor.css({
			left: this.val_cursor_pos+3,
			visibility: "visible"});

		//this.cursor_to_color();
		//window.status = (this.sat_cursor_pos+3)+", "+(this.val_cursor_pos+3);
	},

	cursor_to_color: function()
	{
		//calculate real h, s & v
		this.hue_value = ((255-this.hue_cursor_pos)/255*360);
		this.sat_value = (255 - this.sat_cursor_pos)/255;
		//this.sat_value = this.sat_cursor_pos;
		this.val_value = this.val_cursor_pos;
		//console.debug("cursor_to_color: "+ this.hue_value +" "+this.sat_value+" "+this.val_value);

		this.update_color_box();
	},


	unfocus: function()
	{
		//this.h_select_box_focus=false;
		this.sv_select_box_focus=false;
	},

	setrgb: function(c)
	{
		//  hsv:  h = 0-360    s = 0 (gray) - 1.0 (pure color)   v = 0 (black) to 255 (white)
		if (!c.match(/#([0-9]|[A-F]){6}/i)) {  // valid hex #color?
			return false;
		}

		var rgb = ColorSelector.hex2rgb(c.substring(1,7));
		//alert ("hex -> rgb: "+ rgb[0] +" "+rgb[1]+" "+rgb[2]);

		hsv = ColorSelector.rgb2hsv(rgb);

		//alert ("rgb -> hsv: "+ hsv[0] +" "+hsv[1]+" "+hsv[2]);

		this.sethsv(hsv[0],hsv[1],hsv[2]);

		//rgb_again = hsv2rgb(hsv);
		//alert ("hex -> rgb: "+ rgb[0] +" "+rgb[1]+" "+rgb[2]+
		//       "\nrgb -> hsv: "+ hsv[0] +" "+hsv[1]+" "+hsv[2]+
		//       "\nrgb -> hsv -> rgb: "+ rgb_again[0] +" "+rgb_again[1]+" "+rgb_again[2]);
		return true;
	},

	sethsv: function(h, s, v)
	{
		var hsvcolor;

		this.hue_value = h;
		this.sat_value = s;
		this.val_value = v;

		this.hue_cursor_pos = (360 - this.hue_value)/360*255;
		this.sat_cursor_pos = Math.round(255 - 255*this.sat_value);
		this.val_cursor_pos = this.val_value;

		this.update_color_box();
	},

	update_color_box: function()
	{
		var hsvcolor = new Array(this.hue_value,this.sat_value,this.val_value);

		// make them into an rgb color
		var rgbcolor = ColorSelector.hsv2rgb(hsvcolor);

		//rgbcolor[0] = Math.round(rgbcolor[0]/255*100);
		//rgbcolor[1] = Math.round(rgbcolor[1]/255*100);
		//rgbcolor[2] = Math.round(rgbcolor[2]/255*100);

		var new_color = "rgb("+rgbcolor[0]+","+rgbcolor[1]+","+rgbcolor[2]+")";
		//console.debug("rgb: "+ rgbcolor[0] +" "+rgbcolor[1]+" "+rgbcolor[2]);


		// and in hex
		this.hexcolor = "#" +
			ColorSelector.baseconverter(rgbcolor[0],10,16,2) +
			ColorSelector.baseconverter(rgbcolor[1],10,16,2) +
			ColorSelector.baseconverter(rgbcolor[2],10,16,2);


		this.callback(this.hexcolor);

		// display it!
		if (this.color_value_box) {
			this.color_value_box.html(this.hexcolor).css("background", new_color);
		}
	}
}, { /*---------- STATICS -----------*/

	baseconverter: function (number,ob,nb,desired_length)
	{
		// Created 1997 by Brian Risk.  http://members.aol.com/brianrisk
		number += "";  // convert to character, or toUpperCase will fail on some browsers
		number = number.toUpperCase();
		var list = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var dec = 0;
		for (var i = 0; i <=  number.length; i++) {
			dec += (list.indexOf(number.charAt(i))) * (Math.pow(ob , (number.length - i - 1)));
		}

		number = "";
		var magnitude = Math.floor((Math.log(dec))/(Math.log(nb)));
		for (var i = magnitude; i >= 0; i--)
		{
			//--  stupid nedit, thinks the decrement above is a html commment.
			var amount = Math.floor(dec/Math.pow(nb,i));
			number = number + list.charAt(amount);
			dec -= amount*(Math.pow(nb,i));
		}

		var length=number.length;
		if (length<desired_length) {
			for (var i=0;i<desired_length-length;i++) {
				number = "0"+number;
			}
		}

		return number;
	},

	docjslib_getRealTop: function(imgElem) {
		yPos = imgElem.offsetTop;
		tempEl = imgElem.offsetParent;
		while (tempEl != null) {
			yPos += tempEl.offsetTop;
			tempEl = tempEl.offsetParent;
		}
		return yPos;
	},

	docjslib_getRealLeft: function(imgElem) {
		xPos = imgElem.offsetLeft;
		tempEl = imgElem.offsetParent;
		while (tempEl != null) {
			xPos += tempEl.offsetLeft;
			tempEl = tempEl.offsetParent;
		}
		return xPos;
	},

	// RGB, each 0 to 255
	//  hsv:  h = 0-360    s = 0 (gray) - 1.0 (pure color)   v = 0 (black) to 255 (white)
	rgb2hsv: function(rgb) {
	  var r = rgb[0];
	  var g = rgb[1];
	  var b = rgb[2];

	  var h;
	  var s;
		var v = Math.max(Math.max(r, g), b);
		var min = Math.min(Math.min(r, g), b);
	  var delta = v - min;

		// Calculate saturation: saturation is 0 if r, g and b are all 0
	  if (v == 0)
		 s = 0
	  else
		 s = delta / v;

	  if (s==0)
		 h=0;  //achromatic.  no hue
	  else
	  {
		 if (r==v)            // between yellow and magenta [degrees]
			h=60*(g-b)/delta;
		 else if (g==v)       // between cyan and yellow
			h=120+60*(b-r)/delta;
		 else if (b==v)       // between magenta and cyan
			h=240+60*(r-g)/delta;
	  }

	  if (h<0)
		 h+=360;

	  return new Array(h,s,v);
	},

	// RGB, each 0 to 255
	//  hsv:  h = 0-360    s = 0 (gray) - 1.0 (pure color)   v = 0 (black) to 255 (white)
	hsv2rgb: function(hsv) {
	  var h = hsv[0];
	  var s = hsv[1];
	  var v = hsv[2];

	  var r;
	  var g;
	  var b;

	  if (s==0) // achromatic (grey)
		 return new Array(v,v,v);

	  var htemp;

	  if (h==360)
		 htemp=0;
	  else
		 htemp=h;

	  htemp=htemp/60;
	  var i = Math.floor(htemp);   // integer <= h
	  var f = htemp - i;           // fractional part of h

	  var p = v * (1-s);
	  var q = v * (1-(s*f));
	  var t = v * (1-(s*(1-f)));

	  if (i==0) {r=v;g=t;b=p;}
	  if (i==1) {r=q;g=v;b=p;}
	  if (i==2) {r=p;g=v;b=t;}
	  if (i==3) {r=p;g=q;b=v;}
	  if (i==4) {r=t;g=p;b=v;}
	  if (i==5) {r=v;g=p;b=q;}

	  r=Math.round(r);
	  g=Math.round(g);
	  b=Math.round(b);

	  return new Array(r,g,b);
	},

	hex2rgb: function(h) {

	  h = h.replace(/#/,'');
	  // RGB, each 0 to 255
	  var r = Math.round(parseInt(h.substring(0,2),16));
	  var g = Math.round(parseInt(h.substring(2,4),16));
	  var b = Math.round(parseInt(h.substring(4,6),16));
	  //alert("hex2rgb: "+h+" "+r+" "+g+" "+b);

		var results = new Array(r,g,b);
	  return results;
	}
});
