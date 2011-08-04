/*
  Machine.js
  by mary rose cook
  http://github.com/maryrosecook/machinejs

  Make behaviour trees in JavaScript.
  See index.html for an example.

  Uses Base.js by Dean Edwards.  Thanks, Dean.
*/
var b=null;function g(d){return function(){return d}}
(function(){var d=Base.extend({constructor:function(){},r:function(a,c,f){return this.k(a,b,c,f||c)},k:function(a,c,f,d){var e=b,e=a.t==!0?new i(a.identifier,a.test,a.a,c,f,d):new j(a.identifier,a.test,a.a,c,f,d);e.l=a.l;for(var h in a.children)e.children[e.children.length]=this.k(a.children[h],e,f);return e}},{f:g("Machine")});window.MachineJS=d;var d=Base.extend({identifier:b,test:b,a:b,parent:b,children:b,e:b,d:b,l:b,constructor:function(a,c,f,d,e,h){this.identifier=a;this.test=c;this.a=f;this.parent=
d;this.e=e;this.d=h;this.children=[]},w:function(){this.h()&&this.q();var a=this.p();return a!==b?a.g():this.b()?this:this.i().g()},p:function(){var a=this.a;if(a===void 0){var c=this.n();if(c!==b)a=c.a}return a!==b?this[a].call(this):b},m:function(){return this.children.length>0||this instanceof i},h:function(){return!this.m()},b:function(){var a=this.test;a===void 0&&(a="can"+this.identifier[0].toUpperCase()+this.identifier.substring(1,this.identifier.length));return this.d[a]!==void 0?this.d[a].call(this.e):
!0},u:function(){return this.j(this.children)},j:function(a){for(var c in a)if(a[c].b())return a[c];return b},v:function(){if(this.h()){var a=!1,c;for(c in this.parent.children){var d=this.parent.children[c];if(this.identifier==d.identifier)a=!0;else if(a&&d.b())return d}}else if(a=this.j(this.children),a!==b)return a;return this.i()},c:function(a){return this.parent===b?b:a.call(this.parent)===!0?this.parent:this.parent.c(a)},n:function(){return this.c(function(){return this.a!==void 0&&this.a!==
b})},i:function(){return this.c(function(){return this.b()})},o:function(a){return this.c(function(){return this.identifier==a})}},{f:g("Node")}),j=d.extend({g:function(){return this},q:function(){this.d[this.identifier].call(this.e)}},{f:g("State")}),i=d.extend({g:function(){return this[this.a].call(this)},s:function(){return this.o(this.identifier)}},{f:g("Pointer")})})();