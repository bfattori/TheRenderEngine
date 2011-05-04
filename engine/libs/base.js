/*
 Base, version 1.0.2
 Copyright 2006, Dean Edwards
 License: http://creativecommons.org/licenses/LGPL/2.1/
 */
var Base=function(){arguments.length&&(this==window?Base.prototype.extend.call(arguments[0],arguments.callee.prototype):this.extend(arguments[0]))};Base.version="1.0.2";
Base.prototype={extend:function(b,c){var d=Base.prototype.extend;if(arguments.length==2){var e=this[b],g=this.constructor?this.constructor.prototype:null;if(e instanceof Function&&c instanceof Function&&e.valueOf()!=c.valueOf()&&/\bbase\b/.test(c)){var a=c,c=function(){var b=this.base;this.base=e;this.baseClass=g;var c=a.apply(this,arguments);this.base=b;this.baseClass=this;return c};c.valueOf=function(){return a};c.toString=function(){return String(a)}}return this[b]=c}else if(b){var h={toSource:null},
i=["toString","valueOf"];Base._prototyping&&(i[2]="constructor");for(var j=0;f=i[j];j++)b[f]!=h[f]&&d.call(this,f,b[f]);for(var f in b)h[f]||d.call(this,f,b[f])}return this},base:function(){}};
Base.extend=function(b,c){var d=Base.prototype.extend;b||(b={});Base._prototyping=!0;var e=new this;d.call(e,b);var g=e.constructor;e.constructor=this;delete Base._prototyping;var a=function(){Base._prototyping||g.apply(this,arguments);this.constructor=a};a.prototype=e;a.extend=this.extend;a.implement=this.implement;a.create=this.create;a.getClassName=this.getClassName;a.toString=function(){return String(g)};a.isInstance=function(b){return b instanceof a};d.call(a,c);d=g?a:e;d.init instanceof Function&&
d.init();if(a.getClassName)d.className=a.getClassName();return d};Base.implement=function(){};Base.create=function(){};Base.getClassName=function(){return"Base"};Base.isInstance=function(){};