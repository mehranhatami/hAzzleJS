/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0d Release Candidate
 * Released under the MIT License.
 *
 * Date: 2014-11-02
 */
(function(){var d=/^#([\w\-]*)$/,m={},l={},q=function(a,e,n){if(a)throw a=Error("[hAzzle-"+e+"] "+n),a.code=e,a;},t=function(a){return a&&(a.ELEMENT_NODE||a.DOCUMENT_NODE)},p=function(a,e){if(a){if(!(this instanceof p))return new p(a,e);if(a instanceof p)return a;var n,h,s=p.require("Util"),f=p.require("Ready");"function"===typeof a&&(l.Ready?f.ready(a):q(!0,6,"ready.js module not installed"));if("string"===typeof a){if((n=d.exec(a))&&!e&&(h=[document.getElementById(n[1])]),null===h||void 0===h)h=
this.find(a,e,!0)}else h=a instanceof Array?s.unique(s.filter(a,t)):this.isNodeList(a)?s.filter(s.makeArray(a),t):a.nodeType?11===a.nodeType?a.children:[a]:a===window?[a]:[];void 0===h?(this.length=0,this.elements=[]):(this.elements=h,this.length=h.length);return this}};p.err=q;p.installed=l;p.require=function(a){return m[a]};p.define=function(a,e){q("string"!==typeof a,1,'id must be a string "'+a+'"');q(m[a],2,'module already included "'+a+'"');q("function"!==typeof e,3,'function body for "'+a+'" must be an function "'+
e+'"');l[a]=!0;m[a]=e.call(p.prototype)};p.codename="new-age";p.version="1.0.0a-rc";window.hAzzle=p})(window);var hAzzle=window.hAzzle||(window.hAzzle={});
hAzzle.define("Support",function(){var d,m,l,q,t,p=function(h){var a=document.createElement("fieldset");try{return!!h(a)}catch(f){return!1}finally{a.parentNode&&a.parentNode.removeChild(a)}},a,e;l=document.createElement("input");a=document.createElement("select").appendChild(document.createElement("option"));l.type="checkbox";a=a.selected;l=document.createElement("input");l.value="t";l.type="radio";e="t"===l.value;var n;n="function"===typeof document.implementation.createHTMLDocument?!0:!1;p(function(h){h.classList.add("a",
"b");d=!!document.documentElement.classList;m=/(^| )a( |$)/.test(h.className)&&/(^| )b( |$)/.test(h.className)});l=p(function(h){return h.compareDocumentPosition(document.createElement("div"))&1});p(function(h){h=document.createDocumentFragment().appendChild(h);var a=document.createElement("input");a.setAttribute("type","radio");a.setAttribute("checked","checked");a.setAttribute("name","t");h.appendChild(a);h.innerHTML="<textarea>x</textarea>";q=!!h.cloneNode(!0).lastChild.defaultValue});p(function(h){t=
null!=h.style.borderRadius});return{assert:p,optSelected:a,radioValue:e,imcHTML:n,classList:d,multipleArgs:m,sortDetached:l,noCloneChecked:q,cS:!!document.defaultView.getComputedStyle,borderRadius:t}});
hAzzle.define("has",function(){var d=navigator.userAgent,m=window,l=m.document,q=l&&l.createElement("div"),t=Object.prototype.toString,p={},a=function(){if(l.documentMode)return l.documentMode;for(var a=7;4<a;a--){var h=l.createElement("div");h.innerHTML="\x3c!--[if IE "+a+"]><span></span><![endif]--\x3e";if(h.getElementsByTagName("span").length)return a}}(),e=function(a,h,e){p[a]=e?h(m,l,q):h};e("xpath",function(){return!!l.evaluate});e("air",function(){return!!m.runtime});e("dart",function(){return!(!m.startDart&&
!l.startDart)});e("promise",function(){return!!m.Promise});e("mobile",function(){return/^Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(d)});e("android",function(){return/^Android/i.test(d)});e("opera",function(){return"[object Opera]"===t.call(window.opera)});e("firefox",function(){return"undefined"!==typeof InstallTrigger});e("chrome",function(){return m.chrome});e("webkit",function(){return"WebkitAppearance"in l.documentElement.style});e("safari",function(){return 0<t.call(window.HTMLElement).indexOf("Constructor")});
e("ie",function(){return!!l.documentMode});e("touch",function(){return"ontouchstart"in document||"onpointerdown"in document&&0<navigator.maxTouchPoints||window.navigator.msMaxTouchPoints});e("touchEvents",function(){return"ontouchstart"in document});e("pointerEvents",function(){return"onpointerdown"in document});e("MSPointer",function(){return"msMaxTouchPoints"in navigator});return{has:function(a){"function"==typeof p[a]&&(p[a]=p[a](m,l,q));return p[a]},add:e,clearElement:function(a){if(a)for(;a.lastChild;)a.removeChild(a.lastChild);
return a},ie:a}});
hAzzle.define("Types",function(){var d,m=Object.prototype.toString,l=Array.isArray,q={},t="Arguments Array Boolean Date Error Function Map Number Object RegExp Set StringWeakMap ArrayBuffer Float32Array Float64Array Int8Array Int16Array Int32ArrayUint8Array Uint8ClampedArray Uint16Array Uint32Array".split(" ");for(d=t.length;d--;)q["[object "+t[d]+"]"]=!0;t="ArrayBuffer Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint8ClampedArray Uint16Array Uint32Array".split(" ");for(d=
t.length;d--;)q["[object "+t[d]+"]"]=!1;var p=function(a){return"string"===typeof a},a=function(a){return"number"===typeof a},e=function(a){return a&&a.window===a},n=function(a){return a?function(e){return m.call(e)==="[object "+a+"]"}:function(){}};this.isNodeList=d=function(a){var e=Object.prototype.toString.call(a);if("[object HTMLCollection]"===e||"[object NodeList]"===e)return!0;if(!("length"in a&&"item"in a))return!1;try{if(null===a(0)||a(0)&&a(0).tagName)return!0}catch(f){}return!1};return{isType:n,
isArray:l,isEmpty:function(a){if(null==a)return!0;if(l(a)||p(a)||n("Arguments")(a))return 0===a.length;for(var e in a)if(null!=a&&Object.prototype.hasOwnProperty.call(a,e))return!1;return!0},isWindow:e,isObject:function(a){var e=typeof a;return"function"===e||a&&"object"===e||!1},isPlainObject:function(a){return"object"!==n(a)&&!e(a)&&Object.getPrototypeOf(a)==Object.prototype},isEmptyObject:function(a){for(var e in a)return!1;return!0},isNode:function(a){return!!a&&"object"===typeof a&&"nodeType"in
a},isElement:function(a){return a&&"object"===typeof a&&a.ELEMENT_NODE&&-1<m.call(a).indexOf("Element")||!1},isString:p,isArrayLike:function(a){return a&&"object"===typeof a&&"number"===typeof a.length&&q[m.call(a)]||!1},isNumber:a,isBoolean:function(a){return"boolean"===typeof a},isNumeric:function(a){return!l(a)&&0<=a-parseFloat(a)+1},isNaN:function(e){return a(e)&&e!=+e},isDefined:function(a){return"undefined"!==typeof a},isUndefined:function(a){return"undefined"===typeof a},isNodeList:d,isHostMethod:function(a,
e){var f=typeof a[e];return"function"===f||!("object"!=f||!a[e])||"unknown"==f}}});hAzzle.define("Text",function(){var d=function(m){if(m){var l,q="",t=0,p=m.length;l=m.nodeType;if(!l)for(;t<p;t++)l=m[t++],8!==l.nodeType&&(q+=d(l));else if(1===l||9===l||11===l){t=m.textContent;if("string"===typeof t)return m.textContent;for(m=m.firstChild;m;m=m.nextSibling)q+=d(m)}else if(3===l||4===l)return m.nodeValue;return q}};return{getText:d}});
hAzzle.define("Util",function(){var d=hAzzle.require("Types"),m=Object.prototype.hasOwnProperty,l=Array.prototype.slice,q=Object.keys,t=function(g,a){return m.call(g,a)},p=function(g,c,r,k){if(void 0===g)return g;"function"!==typeof c&&hAzzle.err(!0,5,"'fn' must be a function in util.each()");var u,b=g.length,f;if("function"==typeof c&&"undefined"===typeof r&&"undefined"===typeof k&&d.isArray(g))for(;++u<b&&!1!==c(g[u],u,g););c=a(c,r);if(b===+b)for(c=a(c,r),u=0;u<b&&(u=k?g.length-u-1:u,!1!==c(g[u],
u,g));u++);else if(g)for(f in g)if(!1===c(g[f],f,g))break;return g},a=function(g,a,c){if("function"===typeof g){if(void 0===a)return g;c=c?c:3;return 1===c?function(k){return g.call(a,k)}:2===c?function(k,c){return g.call(a,k,c)}:3===c?function(k,c,r){return g.call(a,k,c,r)}:4===c?function(c,r,b,f){return g.call(a,c,r,b,f)}:function(){return g.apply(a,arguments)}}if(!g)return n},e=function(g,c,r){return g?d.isType("Function")(g)?a(g,c,r):d.isObject(g)?h(g):f(g):n},n=function(g){return g},h=function(g){var a=
s(g),c=a.length;return function(g){if(!g)return!c;g=Object(g);for(var u=0,b,f;u<c;u++)if(b=a[u],f=b[0],b[1]!==g[f]||!(f in g))return!1;return!0}},s=function(g){for(var a=q(g),c=a.length,k=Array(c),b=0;b<c;b++)k[b]=[a[b],g[a[b]]];return k},f=function(g){return function(a){return a[g]}},c=function(g,a,c){if(null==g)return-1;var k=0,b=g.length;if(c)if("number"===typeof c)k=0>c?Math.max(0,b+c):c;else{c=e(void 0,void 0,1);for(var k=c(a),b=0,f=g.length;b<f;){var h=b+f>>>1;c(g[h])<k?b=h+1:f=h}k=b;return g[k]===
a?k:-1}for(;k<b;k++)if(g[k]===a)return k;return-1},b=function(g,a,c){for(var k in a)c&&(d.isPlainObject(a[k])||d.isArray(a[k]))?(d.isPlainObject(a[k])&&!d.isPlainObject(g[k])&&(g[k]={}),d.isArray(a[k])&&!d.isArray(g[k])&&(g[k]=[]),b(g[k],a[k],c)):void 0!==a[k]&&(g[k]=a[k])};return{each:p,mixin:function(a){if(d.isObject(a))for(var c,b,k=1,f=arguments.length;k<f;k++)for(b in c=arguments[k],c)t(c,b)&&(a[b]=c[b]);return a},makeArray:function(a){if(a instanceof Array)return a;for(var c=-1,b=a.length,k=
Array(b);++c<b;)k[c]=a[c];return k},merge:function(a,c){for(var b=+c.length,k=0,f=a.length;k<b;k++)a[f++]=c[k];a.length=f;return a},nodeName:function(a,c){return a&&a.nodeName&&a.nodeName.toLowerCase()===c.toLowerCase()},unique:function(a,b,r,k){if(!a)return[];d.isBoolean(b)&&(k=r,r=b,b=!1);void 0!==r&&(r=e(r,k));k=[];for(var f=[],w=0,h=a.length;w<h;w++){var n=a[w];if(b)w&&f===n||k.push(n),f=n;else if(r){var l=r(n,w,a);0>c(f,l)&&(f.push(l),k.push(n))}else 0>c(k,n)&&k.push(n)}return k},indexOf:c,instanceOf:function(a,
c){if(null==a)return!1;for(var b=a.$constructor||a.constructor;b;){if(b===c)return!0;b=b.parent}return a instanceof c},filter:function(a,c,b){var k=[];if(!a)return k;c=e(c,b);p(a,function(a,g,b){c(a,g,b)&&k.push(a)});return k},map:function(a,c,b){if(a){c=e(c,b);b=a.length!==+a.length&&q(a);for(var k=(b||a).length,f=Array(k),h,d=0;d<k;d++)h=b?b[d]:d,f[d]=c(a[h],h,a);return f}return[]},some:function(a,c,b){if(a){c=e(c,b);var k=a.length!==+a.length&&k(a);b=(k||a).length;var f,h;for(f=0;f<b;f++)if(h=
k?k[f]:f,c(a[h],h,a))return!0}return!1},reduce:function(c,b,f,k){c||(c=[]);b=a(b,k,4);var e=c.length!==+c.length&&q(c),h=(e||c).length,d=0,n;3>arguments.length&&(h||hAzzle.err(!0,7," no collection length exist in collection.reduce()"),f=c[e?e[d++]:d++]);for(;d<h;d++)n=e?e[d]:d,f=b(f,c[n],n,c);return f},now:Date.now,bind:function(a,c){var b=2<arguments.length?l.call(arguments,2):[],k;"string"===typeof c&&(k=a[c],c=a,a=k);return"function"!==typeof a||c instanceof RegExp?c:b.length?function(){return arguments.length?
a.apply(c||this,b.concat(l.call(arguments,0))):a.apply(c||this,b)}:function(){return arguments.length?a.apply(c||this,arguments):a.call(c||this)}},has:t,noop:function(){},extend:b,isInDocument:function(a){if(a){for(var c=document.body.parentNode;a;){if(a===c)return!0;a=a.parentNode}return!1}}}});
hAzzle.define("Core",function(){var d=window.document,m=d.documentElement,l=hAzzle.require("Support"),q=Array.prototype.indexOf,t=/^[^{]+\{\s*\[native \w/,p,a={},e,n,h=function(a,b){a===b&&(e=!0);return 0},s=function(a,b){var g=b&&a,f=g&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||-2147483648)-(~a.sourceIndex||-2147483648);if(f)return f;if(g)for(;g=g.nextSibling;)if(g===b)return-1;return a?1:-1},f={uidX:1,uidK:"hAzzle_id",expando:"hAzzle-"+String(Math.random()).replace(/\D/g,""),isXML:function(a){return(a=
a&&(a.ownerDocument||a).documentElement)?"HTML"!==a.nodeName:!1},xmlID:function(a){var b=a.getAttribute(this.uidK);b||(b=this.uidX++,a.setAttribute(this.uidK,b));return b},htmlID:function(a){return a.uniqueNumber||(a.uniqueNumber=this.uidX++)},"native":t.test(m.compareDocumentPosition),setDocument:function(c){var b=c.nodeType,g=c?c.ownerDocument||c:d;if(9!==b)if(b)g=c.ownerDocument;else if(c.navigator)g=c.document;else return;if(this.document!==g){this.document=c=g;var b=c.documentElement,v=this.xmlID(b),
r=a[v],k;if(!r){r=a[v]={};r.root=b;r.isXMLDocument=this.isXML(c);r.detectDuplicates=!!e;r.sortStable=f.expando.split("").sort(h).join("")===f.expando;l.assert(function(a){a.innerHTML='<a id="hAzzle_id"></a>';r.isHTMLDocument=!!c.getElementById("hAzzle_id")});if(!f.isXML(b)){r.getElementsByTagName=l.assert(function(a){a.appendChild(g.createComment(""));return!a.getElementsByTagName("*").length});r.getById=l.assert(function(a){a.innerHTML='<a name="hAzzle_id"></a><b id="hAzzle_id"></b>';return c.getElementById("hAzzle_id")===
a.firstChild});var b=f.rbuggyMatches=[],u=f.rbuggyQSA=[];(l.qsa=t.test(g.querySelectorAll))&&l.assert(function(a){a.innerHTML="<select msallowcapture=''><option selected=''></option></select>";a.querySelectorAll(":checked").length||u.push(":checked")});(r._matchesSelector=t.test(p=m._matches||m.webkitMatchesSelector||m.mozMatchesSelector||m.oMatchesSelector||m.msMatchesSelector))&&l.assert(function(a){f.disconnectedMatch=p.call(a,"div")});u=u.length&&new RegExp(u.join("|"));b=b.length&&new RegExp(b.join("|"))}r.contains=
f["native"]||f["native"].test(m.contains)?function(a,c){var b=9===a.nodeType?a.documentElement:a,k=c&&c.parentNode;return a===k||!!(k&&1===k.nodeType&&(b.contains?b.contains(k):a.compareDocumentPosition&&a.compareDocumentPosition(k)&16))}:function(a,c){if(c)for(;c=c.parentNode;)if(c===a)return!0;return!1};f.sortOrder=f["native"]?function(a,c){if(a===c)return e=!0,0;var b=!a.compareDocumentPosition-!c.compareDocumentPosition;if(b)return b;b=(a.ownerDocument||a)===(c.ownerDocument||c)?a.compareDocumentPosition(c):
1;return b&1||!l.sortDetached&&c.compareDocumentPosition(a)===b?a===g||a.ownerDocument===d&&f.contains(d,a)?-1:c===g||c.ownerDocument===d&&f.contains(d,c)?1:n?q.call(n,a)-q.call(n,c):0:b&4?-1:1}:function(a,c){if(a===c)return e=!0,0;var b,k=0;b=a.parentNode;var f=c.parentNode,r=[a],h=[c];if(!b||!f)return a===g?-1:c===g?1:b?-1:f?1:n?q.call(n,a)-q.call(n,c):0;if(b===f)return s(a,c);for(b=a;b=b.parentNode;)r.unshift(b);for(b=c;b=b.parentNode;)h.unshift(b);for(;r[k]===h[k];)k++;return k?s(r[k],h[k]):r[k]===
d?-1:h[k]===d?1:0};b=null}for(k in r)this[k]=r[k]}}},h=f.sortOrder;f.setDocument(d);return{root:f.root,isXML:f.isXML,isHTML:!f.isXML(d),expando:f.expando,uniqueSort:function(a){var b,g=[],d=0,r=0;e=!f.detectDuplicates;n=!f.sortStable&&a.slice(0);a.sort(h);if(e){for(;b=a[r++];)b===a[r]&&(d=g.push(r));for(;d--;)a.splice(g[d],1)}n=null;return a},contains:f.contains,rbuggyQSA:f.rbuggyQSA}});
hAzzle.define("Collection",function(){var d=hAzzle.require("Util"),m=hAzzle.require("Types"),l=Array.prototype,q=l.concat,t=l.push,p=function(a,e,d){"undefined"===typeof e&&(e=0);"undefined"===typeof d&&(d=a?a.length:0);var h=-1;d=d-e||0;for(var l=Array(0>d?0:d);++h<d;)l[h]=a[e+h];return l};this.toJqueryZepto=function(){for(var a=this.length,e=this.elements;a--;)this[a]=e[a];return this};this.get=function(a){return void 0===a?p(this.elements,0):0>a?this.elements[this.length+a]:this.elements[a]};this.eq=
function(a){return hAzzle(-1===a?p(this.elements,this.length-1):p(this.elements,a,a+1))};this.reduce=function(a,e,n){return d.reduce(this.elements,a,e,n)};this.indexOf=function(a,e,d){return null==e?-1:l.indexOf.call(e,a,d)};this.map=function(a,e){return hAzzle(d.map(this.elements,a,e))};this.each=function(a,e,n){d.each(this.elements,a,e,n);return this};this.slice=function(a,e){return new hAzzle(p(this.elements,a,e))};this.concat=function(){var a=d.map(p(arguments),function(a){return a instanceof
hAzzle?a.elements:a});return hAzzle(q.apply(this.elements,a))};this.is=function(a){return 0<this.length&&0<this.filter(a).length};this.not=function(a){return this.filter(a,!0)};this.index=function(a){var e=this.elements;return a?"string"===typeof a?d.indexOf(hAzzle(a).elements,e[0]):d.indexOf(e,a instanceof hAzzle?a.elements[0]:a):e[0]&&e[0].parentElement?this.first().prevAll().length:-1};this.add=function(a,e){var d=a;"string"===typeof a&&(d=hAzzle(a,e).elements);return this.concat(d)};this.first=
function(a){return a?this.slice(0,a):this.eq(0)};this.last=function(a){return a?this.slice(this.length-a):this.eq(-1)};this.even=function(){return this.filter(function(a){return 0!==a%2})};this.odd=function(){return this.filter(function(a){return 0===a%2})};d.each({next:"nextElementSibling",prev:"previousElementSibling"},function(a,e){this[e]=function(e){return this.map(function(e){return e[a]}).filter(e)}}.bind(this));d.each({prevAll:"previousElementSibling",nextAll:"nextElementSibling"},function(a,
e){this[e]=function(){var e=[];this.each(function(d){for(;(d=d[a])&&9!==d.nodeType;)e.push(d)});return hAzzle(e)}}.bind(this));return{makeArray:function(a,e){var l=e||[];void 0!==a&&(m.isArrayLike(Object(a))?d.merge(l,m.isString(a)?[a]:a):t.call(l,a));return l},slice:p}});
hAzzle.define("Jiesa",function(){var d=hAzzle.require("Util"),m=hAzzle.require("Core"),l=hAzzle.require("Collection"),q=hAzzle.require("Support"),t=/^\s*[+~]/,p=/[\n\t\r]/g,a=/^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,e=/^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/,n=/([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g,h=RegExp("=[\\x20\\t\\r\\n\\f]*([^\\]'\"]*?)[\\x20\\t\\r\\n\\f]*\\]","g"),s=window.document.documentElement,f=s.matches||s.webkitMatchesSelector||s.mozMatchesSelector||s.oMatchesSelector||s.msMatchesSelector,
c=function(a,c,b){var g=a,f=a.getAttribute("id"),e=f||"__hAzzle__",d=a.parentNode,r=t.test(c);if(r&&!d)return[];f?e=e.replace(/'/g,"\\$&"):a.setAttribute("id",e);r&&d&&(a=a.parentNode);c=c.match(n);for(d=0;d<c.length;d++)c[d]="[id='"+e+"'] "+c[d];c=c.join(",");try{return b.call(a,c)}finally{f||g.removeAttribute("id")}},b=function(a,b,g){return g&&9!==g.nodeType?c(g,b,function(c){return f(a,c)}):f.call(a,b)},g=function(a){return a?"string"===typeof a?v(a):!a.nodeType&&arrayLike(a)?a[0]:a:document},
v=function(b,f){var r,h,n,s=[];f=g(f);if(!b||"string"!==typeof b)return s;if(1!==(h=f.nodeType)&&9!==h&&11!==h)return[];if(-1!==d.indexOf(b,",")&&(r=b.split(",")))return d.each(r,function(a){d.each(v(a),function(a){m.contains(s,a)||s.push(a)})}),s;if(m.isHTML)if(r=a.exec(b))if(b=r[1]){if(9===h)return(n=f.getElementById(b))&&n.id===b?[n]:[];if(f.ownerDocument&&(n=f.ownerDocument.getElementById(b))&&m.contains(f,n)&&n.id===r)return[n]}else{if(b=r[2])return l.slice(f.getElementsByClassName(b));if(b=
r[3])return l.slice(f.getElementsByTagName(b))}else{if(r=e.exec(b)){h=f.getElementsByTagName(r[1]);var t=r[2],x=r[3];d.each(h,function(a){var c;(c=a.id===t)||(c=q.classList?a.classList.contains(x):0<=(" "+a.className+" ").replace(p," ").indexOf(x));c&&s.push(a)});return s}if(q.qsa&&m.rbuggyQSA.length)return 1===f.nodeType&&"object"!==f.nodeName.toLowerCase()?l.slice(c(f,b,f.querySelectorAll)):l.slice(f.querySelectorAll(b))}},r=function(a,c,g){if(c.nodeType)return a===c;(a.ownerDocument||a)!==document&&
m.setDocument(a);c="string"===typeof c?c.replace(h,"='$1']"):c;if(c instanceof hAzzle)return d.some(c.elements,function(c){return r(a,c)});if(a===document)return!1;if(m&&m.isHTML)try{var f=b(a,c,g);if(f||m.disconnectedMatch||a.document&&11!==a.document.nodeType)return f}catch(e){}};this.find=function(a,c,b){if(b)return v(a,c);if("string"===typeof a)return 1===this.length?hAzzle(v(a,this.elements[0])):d.reduce(this.elements,function(c,b){return hAzzle(c.concat(l.slice(v(a,b))))},[]);var f,g=this.length,
e=this.elements;return hAzzle(d.filter(hAzzle(a).elements,function(a){for(f=0;f<g;f++)if(m.contains(e[f],a))return!0}))};this.filter=function(a,c){if(void 0===a)return this;if("function"===typeof a){var f=[];this.each(function(c,b){a.call(c,b)&&f.push(c)});return hAzzle(f)}return this.filter(function(){return b(this,a)!=(c||!1)})};return{matchesSelector:b,matches:r,find:v}});
hAzzle.define("Strings",function(){var d=String.prototype.trim,m=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,l=/[A-Z]/g,q=/^#x([\da-fA-F]+)$/,t=/^#(\d+)$/,p=/[&<>"']/g,a=/^-ms-/,e=/-([\da-z])/gi,n=[],h={lt:"<",gt:">",quot:'"',apos:"'",amp:"&"},s={},f=function(a,c){return c.toUpperCase()},c=function(a){return"-"+a.charAt(0).toLowerCase()},b;for(b in h)s[h[b]]=b;s["'"]="#39";return{capitalize:function(a){return a&&"string"===typeof a?a.charAt(0).toUpperCase()+a.slice(1):""},unCapitalize:function(a){return a&&
"string"===typeof a?a.charAt(0).toLowerCase()+a.slice(1):""},hyphenate:function(a){return"string"===typeof a?a?a.replace(l,c):a:(a="number"===typeof a?""+a:"")?"data-"+a.toLowerCase():a},camelize:function(c){return c&&"string"===typeof c?n[c]?n[c]:n[c]=c.replace(a,"ms-").replace(e,f):"number"===typeof c||"boolean"===typeof c?""+c:c},trim:function(a){return null==a?"":d?"string"===typeof a?a.trim():a:(a+"").replace(m,"")},escapeHTML:function(a){return a.replace(p,function(a){return"&"+s[a]+";"})},
unescapeHTML:function(a){return a.replace(/\&([^;]+);/g,function(a,c){var b;return c in h?h[c]:(b=c.match(q))?String.fromCharCode(parseInt(b[1],16)):(b=c.match(t))?String.fromCharCode(~~b[1]):a})}}});
hAzzle.define("Storage",function(){function d(){this.expando=p.expando+Math.random()}function m(f,c,b){if(void 0===b&&1===f.nodeType)if(b="data-"+c.replace(e,"-$1").toLowerCase(),b=f.getAttribute(b),"string"===typeof b){try{b="true"===b?!0:"false"===b?!1:"null"===b?null:+b+""===b?+b:a.test(b)?JSON.parse(b+""):b}catch(g){}s.set(f,c,b)}else b=void 0;return b}var l=hAzzle.require("Util"),q=hAzzle.require("Strings"),t=hAzzle.require("Types"),p=hAzzle.require("Core"),a=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
e=/([A-Z])/g,n=/\S+/g;d.accepts=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};d.prototype={register:function(a,c){var b={};b[this.expando]={value:c||{},writable:!0,configurable:!0};a.nodeType?a[this.expando]={value:c||{}}:Object.defineProperties(a,b);return a[this.expando]},cache:function(a,c){if(!d.accepts(a))return{};var b=a[this.expando];return b?b:this.register(a,c)},set:function(a,c,b){if(a){var g;a=this.cache(a);if("string"===typeof c)a[c]=b;else if(t.isEmptyObject(a))l.mixin(a,
c);else for(g in c)a[g]=c[g];return a}},access:function(a,c,b){if(void 0===c||c&&"string"===typeof c&&void 0===b)return b=this.get(a,c),void 0!==b?b:this.get(a,q.camelize(c));this.set(a,c,b);return void 0!==b?b:c},get:function(a,c){var b=this.cache(a);return void 0!==b&&void 0===c?b:b[c]},release:function(a,c){var b,g,e=this.cache(a);if(void 0===c)this.register(a);else for(t.isArray(c)?g=c.concat(c.map(q.camelize)):(b=q.camelize(c),c in e?g=[c,b]:(g=b,g=e[g]?[g]:g.match(n)||[])),b=g.length;b--;)delete e[g[b]]},
hasData:function(a){return!t.isEmptyObject(a[this.expando]||{})},flush:function(a){a[this.expando]&&delete a[this.expando]}};var h=new d,s=new d;this.data=function(a,c){var b,g,e,d=this.elements[0],k=d&&d.attributes;if(void 0===a){if(this.length&&(e=s.get(d),1===d.nodeType&&!h.get(d,"hasDataAttrs"))){for(b=k.length;b--;)k[b]&&(g=k[b].name,0===g.indexOf("data-")&&(g=q.camelize(g.slice(5)),m(d,g,e[g])));h.set(d,"hasDataAttrs",!0)}return e}if("object"===typeof a)return this.each(function(c){s.set(c,
a)});var l=q.camelize(a);if(d&&void 0===c){e=s.get(d,a);if(void 0!==e)return e;e=s.get(d,l);var n=h.get(this,"hasDataAttrs"),p=-1!==a.indexOf("-");if(void 0!==e)return e;e=m(d,l,void 0);if(void 0!==e)return e}else this.each(function(b){var e=s.get(b,l);s.set(b,l,c);p&&void 0!==e&&s.set(b,a,c);p&&void 0===n&&s.set(b,a,c)})};this.removeData=function(a){return this.each(function(c){s.release(c,a)})};return{"private":h,data:s}});
hAzzle.define("curCSS",function(){var d=hAzzle.require("has"),m=hAzzle.require("Core"),l=hAzzle.require("Types"),q=hAzzle.require("Util"),t=hAzzle.require("Support"),p=hAzzle.require("Storage"),a=window.document.documentElement,e=!!document.defaultView.getComputedStyle,n=t.computedStyle&&d.has("webkit")?function(a){var b;if(1===a.nodeType){var e=a.ownerDocument.defaultView;b=e.getComputedStyle(a,null);!b&&a.style&&(a.style.display="",b=e.getComputedStyle(a,null))}return b||{}}:function(a){if(a&&null!==
a.ownerDocument){var b=!1;if(a)return void 0!==a.ownerDocument&&(b=a.ownerDocument.defaultView),t.cS?b&&e?b.opener?b.getComputedStyle(a,null):window.getComputedStyle(a,null):a.style:a.style}return""},h=function(a){if(a)return void 0===p["private"].get(a,"computed")&&p["private"].access(a,"computed",{computedStyle:null}),p["private"].get(a,"computed")},s=function(a){return null===h(a).computedStyle?h(a).computedStyle=n(a):h(a).computedStyle},f=function(a,b,e){"object"===typeof a&&a instanceof hAzzle&&
(a=a.elements[0]);var h=0;if(!e){if("height"===b&&"border-box"!==f(a,"boxSizing").toString().toLowerCase())return a.offsetHeight-(parseFloat(f(a,"borderTopWidth"))||0)-(parseFloat(f(a,"borderBottomWidth"))||0)-(parseFloat(f(a,"paddingTop"))||0)-(parseFloat(f(a,"paddingBottom"))||0);if("width"===b&&"border-box"!==f(a,"boxSizing").toString().toLowerCase())return a.offsetWidth-(parseFloat(f(a,"borderLeftWidth"))||0)-(parseFloat(f(a,"borderRightWidth"))||0)-(parseFloat(f(a,"paddingLeft"))||0)-(parseFloat(f(a,
"paddingRight"))||0)}if(h=s(a))return(d.ie||d.has("firefox"))&&"borderColor"===b&&(b="borderTopColor"),h=9===d.ie&&"filter"===b?h.getPropertyValue(b):h[b],""!==h||m.contains(a.ownerDocument,a)||(h=a.style[b]),"auto"!==h||"top"!==b&&"right"!==b&&"bottom"!==b&&"left"!==b||(e=f(a,"position"),"fixed"!==e&&("absolute"!==e||"left"!==b&&"top"!==b))||(h=hAzzle(a).position()[b]+"px"),void 0!==h?h+"":h};this.offset=function(a){if(arguments.length)return void 0===a?this.elements:this.each(function(b,e){var d=
a,k,h,g,r=f(b,"position"),n=hAzzle(b),s={};"static"===r&&(b.style.position="relative");g=n.offset();h=f(b,"top");k=f(b,"left");("absolute"===r||"fixed"===r)&&-1<(h+k).indexOf("auto")?(k=n.position(),h=k.top,k=k.left):(h=parseFloat(h)||0,k=parseFloat(k)||0);l.isType("function")(d)&&(d=d.call(b,e,g));null!=d.top&&(s.top=d.top-g.top+h);null!=d.left&&(s.left=d.left-g.left+k);"using"in d?d.using.call(b,s):n.css(s)});var b,e=this.elements[0],d=e&&e.ownerDocument;if(d){b=d.documentElement;if(!m.contains(b,
e))return{top:0,left:0};var h=e.getBoundingClientRect(),k="fixed"===f(e,"position"),d=l.isWindow(d)?d:9===d.nodeType&&d.defaultView;return{top:h.top+e.parentNode.scrollTop+(k?0:d.pageYOffset)-b.clientTop,left:h.left+e.parentNode.scrollLeft+(k?0:d.pageXOffset)-b.clientLeft}}};this.position=function(a){var b=this.offset(),e=this.elements[0],d=0,h=0,k={top:0,left:0};if(this.elements[0])return e=e.parentNode,q.nodeName(e,"html")||(d+=e.scrollLeft,h+=e.scrollTop),k={top:b.top-d,left:b.left-h},a&&(a=hAzzle(a))?
(b=a.getPosition(),{top:k.top-b.top-parseInt(f(a,"borderLeftWidth"))||0,left:k.left-b.left-parseInt(f(a,"borderTopWidth"))||0}):k};this.offsetParent=function(){return this.map(function(){for(var c=this.offsetParent||a;c&&!q.nodeName(c,"html")&&"static"===f(c,"position");)c=c.offsetParent;return c||a})};return{computed:h,styles:s,css:f}});
hAzzle.define("Units",function(){var d=hAzzle.require("curCSS"),m=hAzzle.require("Support"),l=/^(left$|right$|margin|padding)/,q=/^(relative|absolute|fixed)$/,t=/^(top|bottom)$/,p=function(a,e,n,h){if(""===e||"px"===e)return a;if("%"===e){l.test(h)?h="width":t.test(h)&&(h="height");if(n=q.test(d.css(n,"position"))?n.offsetParent:n.parentNode)if(h=parseFloat(d.css(n,h)),0!==h)return a/h*100;return 0}if("em"===e)return a/parseFloat(d.css(n,"fontSize"));if(void 0===p.unity){var s=p.unity={};m.assert(function(a){a.style.width=
"100cm";document.body.appendChild(a);s.mm=a.offsetWidth/1E3});s.cm=10*s.mm;s["in"]=2.54*s.cm;s.pt=1*s["in"]/72;s.pc=12*s.pt}return(e=p.unity[e])?a/e:a};return{units:p}});
hAzzle.define("Setters",function(){var d=hAzzle.require("Util"),m=hAzzle.require("Core"),l=hAzzle.require("Types"),q=/\S+/g,t=/\r/g,p="multiple selected checked disabled readonly required async autofocus compact nowrap declare noshade hreflang onload srcnoresize defaultChecked autoplay controls defer autocomplete hidden tabindex readonly type accesskey dropzone spellcheck ismap loop scoped open".split(" "),a={},e={},n={"class":"className","for":"htmlFor"},h={get:{},set:{}},s={get:{},set:{}},f={get:{},
set:{}},c=function(a){return a instanceof hAzzle?a.elements:a},b=function(b,d){b=c(b);var f,h,g=0,l=d&&d.match(q);if(l&&1===b.nodeType)for(;f=l[g++];){h=n[f]||f;var s=b,m=a[f.toLowerCase()];m&&e[s.nodeName]&&m?b[h]=!1:b.removeAttribute(f);b.removeAttribute(f)}},g=function(a,e,d){var f=(a=c(a))?a.nodeType:void 0,h,g;if(f&&(3!==f||8!==f||2!==f)){if("undefined"===typeof a.getAttribute)return v(a,e,d);if(f=1!==f||!m.isXML(a))e=e.toLowerCase(),h=s["undefined"===d?"get":"set"][e]||null;if(void 0===d){if(h&&
(g=h.get(a,e))&&null!==g)return g;g=a.getAttribute(e,2);return null==g?void 0:g}if(d){if(h&&void 0!==(g=h.set(a,d,e)))return g;a.setAttribute(e,d+"")}else b(a,e)}return""},v=function(a,b,e){var d=(a=c(a))?a.nodeType:void 0,f,g;if(!d||3===d||8===d||2===d)return"";if(1!==d||m.isHTML)b=n[b]||b,f="undefined"===e?h.get[b]:h.set[b];return"undefined"!==typeof e?f&&void 0!==(g=f.set(a,e,b))?g:a[b]=e:f&&null!==(g=f(a,b))?g:a[b]};this.val=function(a){var b,c,e;c=this.elements[0];if(arguments.length)return e=
l.isType("Function")(a),this.each(function(c,h){var g;1===c.nodeType&&(g=e?a.call(c,h,hAzzle(c).val()):a,null==g?g="":"number"===typeof g?g+="":l.isArray(g)&&(g=d.map(g,function(a){return null==a?"":a+""})),b=f.set[c.type]||f.set[c.nodeName.toLowerCase()],b&&void 0!==b(c,g,"value")||(c.value=g))});if(c){if(b=f.get[c.type]||f.get[c.nodeName.toLowerCase()])return b(c,"value");c=c.value;return"string"===typeof c?c.replace(t,""):null==c?"":c}};this.toggleProp=function(a){return this.each(function(b){return b.prop(a,
!b.prop(a))})};this.prop=function(a,b){var c=this.elements;if("object"===typeof a)return this.each(function(b){d.each(a,function(a,c){v(b,c,a)})});if("undefined"===typeof b)return v(c[0],a);this.each(c,function(c){v(c,a,b)})};this.toggleProp=function(a){return this.each(function(b){return b.prop(a,!b.prop(a))})};this.removeProp=function(a){return this.each(function(){delete this[n[a]||a]})};this.removeAttr=function(a){return this.each(function(c){b(c,a)})};this.attr=function(a,b){var c=this.elements;
return"object"===typeof a?this.each(function(b){d.each(a,function(a,c){g(b,c,a)})}):"undefined"===typeof b?g(c[0],a):this.each(function(c){g(c,a,b)})};d.each(p,function(b){a[p[b]]=p[b]});d.each("input select option textarea button form details".split(" "),function(a){e[a.toUpperCase()]=!0});d.each("cellPadding cellSpacing maxLength rowSpan colSpan useMap frameBorder contentEditable textContent valueType tabIndex readOnly type accessKey tabIndex dropZone spellCheck hrefLang isMap srcDoc mediaGroup autoComplete noValidate radioGroup".split(" "),
function(a){n[a.toLowerCase()]=a});return{attrHooks:s,propHooks:h,valHooks:f,propMap:n,boolAttr:a,boolElem:e,removeAttr:b,attr:g,prop:v}});hAzzle.define("attrHooks",function(){var d=hAzzle.require("Util"),m=hAzzle.require("Support"),l=hAzzle.require("Setters");d.mixin(l.attrHooks.set,{type:function(l,t){if(!m.radioValue&&"radio"===t&&d.nodeName(l,"input")){var p=l.value;l.setAttribute("type",t);p&&(l.value=p);return t}}});return{}});
hAzzle.define("propHooks",function(){var d=hAzzle.require("Util"),m=hAzzle.require("Support"),l=hAzzle.require("Setters");d.mixin(l.propHooks.get,{tabIndex:function(d){return d.hasAttribute("tabindex")||/^(?:input|select|textarea|button)$/i.test(d.nodeName)||d.href?d.tabIndex:-1}});m.optSelected||(l.propHooks.get.selected=function(d){(d=d.parentNode)&&d.parentNode&&d.parentNode.selectedIndex;return null});return{}});
hAzzle.define("valHooks",function(){var d=hAzzle.require("Util"),m=hAzzle.require("Strings"),l=hAzzle.require("Text"),q=hAzzle.require("Types"),t=hAzzle.require("Collection"),p=hAzzle.require("Support"),a=hAzzle.require("Setters"),e=function(a,e,d){var f=a.length;for(d=0>d?Math.max(0,f+d):d||0;d<f;d++)if(a[d]===e)return d;return-1};d.mixin(a.valHooks.set,{select:function(a,d){for(var l,f,c=a.options,b=t.makeArray(d),g=c.length;g--;)if(f=c[g],f.selected=0<=e(b,f.value))l=!0;l||(a.selectedIndex=-1);
return b}});d.mixin(a.valHooks.get,{option:function(a){var d=a.getAttribute(name,2);return null!==d?d:m.trim(l.getText(a))},select:function(a){var d=a.selectedIndex,e="select-one"===a.type;a=a.options;var f=[],c,b,g;if(0>d)return"";g=e?d:0;for(b=e?d+1:a.length;g<b;g++)if(c=a[g],c.selected&&(p.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentElement.disabled||"OPTGROUP"!==c.parentElement.tagName)){c=hAzzle(c).val();if(e)return c;f.push(c)}return e&&!f.length&&a.length?a[d].value:
f}});d.each(["radio","checkbox"],function(d){a.valHooks.set[d]=function(a,d){if(q.isArray(d))return a.checked=0<=e(d,hAzzle(a).val())}})});
(function(d){function m(a){return"string"===typeof a?d.document.createTextNode(a):a}function l(a){var e=d.document.createDocumentFragment(),f=t.call(a,0),c=0,b=a.length;if(1===a.length)return m(a[0]);for(;c<b;c++)try{e.appendChild(m(f[c]))}catch(g){}return e}for(var q=Array.prototype,t=q.slice,p=q.indexOf,q=(d.Element||d.Node||d.HTMLElement).prototype,a=["append",function(){this.appendChild(l(arguments))},"prepend",function(){this.firstChild?this.insertBefore(l(arguments),this.firstChild):this.appendChild(l(arguments))},
"before",function(){var a=this.parentElement;a&&a.insertBefore(l(arguments),this)},"after",function(){this.parentElement&&(this.nextSibling?this.parentElement.insertBefore(l(arguments),this.nextSibling):this.parentElement.appendChild(l(arguments)))},"replace",function(){this.parentElement&&this.parentElement.replaceChild(l(arguments),this)},"remove",function(){this.parentElement&&this.parentElement.removeChild(this)},"matches",q.matchesSelector||q.webkitMatchesSelector||q.mozMatchesSelector||q.msMatchesSelector||
function(a){var d=this.parentElement;return!!d&&-1<p.call(d.querySelectorAll(a),this)}],e=a.length;e;e-=2)q[a[e-2]]||(q[a[e-2]]=a[e-1]);try{new d.CustomEvent("?")}catch(n){d.CustomEvent=function(a,d){function e(a,b,d,f){this.initEvent(a,b,d);this.detail=f}return function(c,b){var g=document.createEvent(a);if("string"!==typeof c)throw Error("An event name must be provided");"Event"===a&&(g.initCustomEvent=e);null==b&&(b=d);g.initCustomEvent(c,b.bubbles,b.cancelable,b.detail);return g}}(d.CustomEvent?
"CustomEvent":"Event",{bubbles:!1,cancelable:!1,detail:null})}})(window);