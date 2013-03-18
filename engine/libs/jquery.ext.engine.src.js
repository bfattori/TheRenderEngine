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

// Some new browser types we'd like to be able to detect
var userAgent = navigator.userAgent.toLowerCase();

// Add back the R.browser object
R.browser = {};

$.extend(R.browser, {
    chrome:/chrome/.test(userAgent),
    firefox:/firefox/.test(userAgent),
    Wii:/nintendo wii/.test(userAgent),
    android:/android/.test(userAgent) && /AppleWebKit/.test(userAgent),
    safariMobile:/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent),
    WiiMote:((window.opera && window.opera.wiiremote) ? window.opera.wiiremote : null),
    WiiScreenWidth:800,
    WiiScreenHeight:460
});

// Chrome version
if (R.browser.chrome) {
    R.browser.version = /chrome\/([\d\.]*)\b/.exec(userAgent)[1];
}

// Firefox version
if (R.browser.firefox) {
    R.browser.version = /firefox\/([\d\.]*)\b/.exec(userAgent)[1];
}

/* Addition of some selectors that jQuery doesn't provide:
 *
 * + ":in(X-Y)" - Select elements with an index between X and Y, inclusive.
 * + ":inx(X-Y)" - Select elements with an index between X and Y, exclusive.
 * + ":notin(X-Y)" - Select elements with an index outside X and Y, inclusive.
 * + ":notinx(X-Y)" - Select elements with an index outside X and Y, exclusive.
 */
jQuery.extend(jQuery.expr[':'],
    {
        "in":function (a, i, m) {
            var l = parseInt(m[3].split("-")[0]);
            var h = parseInt(m[3].split("-")[1]);
            return (i >= l && i <= h);
        },
        "inx":function (a, i, m) {
            var l = parseInt(m[3].split("-")[0]);
            var h = parseInt(m[3].split("-")[1]);
            return (i > l && i < h);
        },
        "notin":function (a, i, m) {
            var l = parseInt(m[3].split("-")[0]);
            var h = parseInt(m[3].split("-")[1]);
            return (i <= l || i >= h);
        },
        "notinx":function (a, i, m) {
            var l = parseInt(m[3].split("-")[0]);
            var h = parseInt(m[3].split("-")[1]);
            return (i < l || i > h);
        },
        "siblings":"jQuery(a).siblings(m[3]).length>0",
        "parents":"jQuery(a).parents(m[3]).length>0"
    });