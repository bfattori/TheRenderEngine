/**
 * The Render Engine
 * jQuery Extensions for The Render Engine
 *
 * @author: Brett Fattori (brettf@renderengine.com)
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
var userAgent=navigator.userAgent.toLowerCase();$.extend(jQuery.browser,{chrome:/chrome/.test(userAgent),firefox:/firefox/.test(userAgent),Wii:/nintendo wii/.test(userAgent),android:/android/.test(userAgent)&&/AppleWebKit/.test(userAgent),safariMobile:/iphone|ipad|ipod/.test(userAgent)&&/safari/.test(userAgent),WiiMote:window.opera&&window.opera.wiiremote?window.opera.wiiremote:null,WiiScreenWidth:800,WiiScreenHeight:460});if(jQuery.browser.chrome)jQuery.browser.version=/chrome\/([\d\.]*)\b/.exec(userAgent)[1];
if(jQuery.browser.firefox)jQuery.browser.version=/firefox\/([\d\.]*)\b/.exec(userAgent)[1];
jQuery.extend(jQuery.expr[":"],{"in":function(b,c,a){b=parseInt(a[3].split("-")[0]);a=parseInt(a[3].split("-")[1]);return c>=b&&c<=a},inx:function(b,c,a){b=parseInt(a[3].split("-")[0]);a=parseInt(a[3].split("-")[1]);return c>b&&c<a},notin:function(b,c,a){b=parseInt(a[3].split("-")[0]);a=parseInt(a[3].split("-")[1]);return c<=b||c>=a},notinx:function(b,c,a){b=parseInt(a[3].split("-")[0]);a=parseInt(a[3].split("-")[1]);return c<b||c>a},siblings:"jQuery(a).siblings(m[3]).length>0",parents:"jQuery(a).parents(m[3]).length>0"});