/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0d Release Candidate
 * Released under the MIT License.
 *
 * Date: 2014-11-1
 */
(function(){var d=/^#([\w\-]*)$/,l={},h={},p={full:"1.0.0a-rc",major:1,minor:0,dot:0,codeName:"new-age"},m=function(a,b,k){if(a)throw a=Error("[hAzzle-"+b+"] "+k),a.code=b,a;},q=function(a){return a&&(a.ELEMENT_NODE||a.DOCUMENT_NODE)},b=function(a,g){if(a){if(!(this instanceof b))return new b(a,g);if(a instanceof b)return a;var k;k=b.require("Util");var r=b.require("Ready");"function"===typeof a&&(h.Ready?r.ready(a):m(!0,6,"ready.js module not installed"));if("string"===typeof a){if((k=d.exec(a))&&
!g&&(this.elements=[document.getElementById(k[1])]),null===this.elements||void 0===this.elements)this.elements=this.find(a,g,!0)}else a instanceof Array?this.elements=k.unique(k.filter(a,q)):this.isNodeList(a)?this.elements=k.filter(k.makeArray(a),q):this.elements=a.nodeType?11===a.nodeType?a.children:[a]:a===window?[a]:[];void 0===this.elements?(this.length=0,this.elements=[]):this.length=this.elements.length;return this}};b.err=m;b.installed=h;b.require=function(a){return l[a]};b.define=function(a,
g){m("string"!==typeof a,1,'id must be a string "'+a+'"');m(l[a],2,'module already included "'+a+'"');m("function"!==typeof g,3,'function body for "'+a+'" must be an function "'+g+'"');h[a]=!0;l[a]=g.call(b.prototype)};b.codename=p.codename;b.version=p.full;b.major=p.major;b.minor=p.minor;b.dot=p.dot;window.hAzzle=b})(window);var hAzzle=window.hAzzle||(window.hAzzle={});
hAzzle.define("Support",function(){var d,l,h,p,m,q=function(k){var a=document.createElement("fieldset");try{return!!k(a)}catch(b){return!1}finally{a.parentNode&&a.parentNode.removeChild(a)}},b,a;h=document.createElement("input");b=document.createElement("select").appendChild(document.createElement("option"));h.type="checkbox";b=b.selected;h=document.createElement("input");h.value="t";h.type="radio";a="t"===h.value;var g;g="function"===typeof document.implementation.createHTMLDocument?!0:!1;q(function(k){k.classList.add("a",
"b");d=!!document.documentElement.classList;l=/(^| )a( |$)/.test(k.className)&&/(^| )b( |$)/.test(k.className)});h=q(function(k){return k.compareDocumentPosition(document.createElement("div"))&1});q(function(k){k=document.createDocumentFragment().appendChild(k);var a=document.createElement("input");a.setAttribute("type","radio");a.setAttribute("checked","checked");a.setAttribute("name","t");k.appendChild(a);k.innerHTML="<textarea>x</textarea>";p=!!k.cloneNode(!0).lastChild.defaultValue});q(function(k){m=
null!=k.style.borderRadius});return{assert:q,optSelected:b,radioValue:a,imcHTML:g,classList:d,multipleArgs:l,sortDetached:h,noCloneChecked:p,cS:!!document.defaultView.getComputedStyle,borderRadius:m}});
hAzzle.define("has",function(){var d=navigator.userAgent,l=window,h=l.document,p=h&&h.createElement("div"),m=Object.prototype.toString,q={},b=function(){if(h.documentMode)return h.documentMode;for(var a=7;4<a;a--){var k=h.createElement("div");k.innerHTML="\x3c!--[if IE "+a+"]><span></span><![endif]--\x3e";if(k.getElementsByTagName("span").length)return a}}(),a=function(a,k,b){q[a]=b?k(l,h,p):k};a("xpath",function(){return!!h.evaluate});a("air",function(){return!!l.runtime});a("dart",function(){return!(!l.startDart&&
!h.startDart)});a("promise",function(){return!!l.Promise});a("mobile",function(){return/^Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(d)});a("android",function(){return/^Android/i.test(d)});a("opera",function(){return"[object Opera]"===m.call(window.opera)});a("firefox",function(){return"undefined"!==typeof InstallTrigger});a("chrome",function(){return l.chrome});a("webkit",function(){return"WebkitAppearance"in h.documentElement.style});a("safari",function(){return 0<m.call(window.HTMLElement).indexOf("Constructor")});
a("ie",function(){return!!h.documentMode});a("touch",function(){return"ontouchstart"in document||"onpointerdown"in document&&0<navigator.maxTouchPoints||window.navigator.msMaxTouchPoints});a("touchEvents",function(){return"ontouchstart"in document});a("pointerEvents",function(){return"onpointerdown"in document});a("MSPointer",function(){return"msMaxTouchPoints"in navigator});return{has:function(a){"function"==typeof q[a]&&(q[a]=q[a](l,h,p));return q[a]},add:a,clearElement:function(a){if(a)for(;a.lastChild;)a.removeChild(a.lastChild);
return a},ie:b}});
hAzzle.define("Types",function(){var d,l=Object.prototype.toString,h=Array.isArray,p={},m="Arguments Array Boolean Date Error Function Map Number Object RegExp Set StringWeakMap ArrayBuffer Float32Array Float64Array Int8Array Int16Array Int32ArrayUint8Array Uint8ClampedArray Uint16Array Uint32Array".split(" ");for(d=m.length;d--;)p["[object "+m[d]+"]"]=!0;m="ArrayBuffer Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint8ClampedArray Uint16Array Uint32Array".split(" ");for(d=
m.length;d--;)p["[object "+m[d]+"]"]=!1;var q=function(a){return"string"===typeof a},b=function(a){return"number"===typeof a},a=function(a){return a&&a.window===a},g=function(a){return a?function(b){return l.call(b)==="[object "+a+"]"}:function(){}};this.isNodeList=d=function(a){var b=Object.prototype.toString.call(a);if("[object HTMLCollection]"===b||"[object NodeList]"===b)return!0;if(!("length"in a&&"item"in a))return!1;try{if(null===a(0)||a(0)&&a(0).tagName)return!0}catch(f){}return!1};return{isType:g,
isArray:h,isEmpty:function(a){if(null==a)return!0;if(h(a)||q(a)||g("Arguments")(a))return 0===a.length;for(var b in a)if(null!=a&&Object.prototype.hasOwnProperty.call(a,b))return!1;return!0},isWindow:a,isObject:function(a){var b=typeof a;return"function"===b||a&&"object"===b||!1},isPlainObject:function(b){return"object"!==g(b)&&!a(b)&&Object.getPrototypeOf(b)==Object.prototype},isEmptyObject:function(a){for(var b in a)return!1;return!0},isNode:function(a){return!!a&&"object"===typeof a&&"nodeType"in
a},isElement:function(a){return a&&"object"===typeof a&&a.ELEMENT_NODE&&-1<l.call(a).indexOf("Element")||!1},isString:q,isArrayLike:function(a){return a&&"object"===typeof a&&"number"===typeof a.length&&p[l.call(a)]||!1},isNumber:b,isBoolean:function(a){return"boolean"===typeof a},isNumeric:function(a){return!h(a)&&0<=a-parseFloat(a)+1},isNaN:function(a){return b(a)&&a!=+a},isDefined:function(a){return"undefined"!==typeof a},isUndefined:function(a){return"undefined"===typeof a},isNodeList:d,isHostMethod:function(a,
b){var f=typeof a[b];return"function"===f||!("object"!=f||!a[b])||"unknown"==f}}});hAzzle.define("Text",function(){var d=function(l){if(l){var h,p="",m=0,q=l.length;h=l.nodeType;if(!h)for(;m<q;m++)h=l[m++],8!==h.nodeType&&(p+=d(h));else if(1===h||9===h||11===h){m=l.textContent;if("string"===typeof m)return l.textContent;for(l=l.firstChild;l;l=l.nextSibling)p+=d(l)}else if(3===h||4===h)return l.nodeValue;return p}};return{getText:d}});
hAzzle.define("Util",function(){var d=hAzzle.require("Types"),l=Object.prototype.hasOwnProperty,h=Array.prototype.slice,p=Object.keys,m=function(n,a){return l.call(n,a)},q=function(n,a,c,u){if(void 0===n)return n;"function"!==typeof a&&hAzzle.err(!0,5,"'fn' must be a function in util.each()");var e,f=n.length,g;if("function"==typeof a&&"undefined"===typeof c&&"undefined"===typeof u&&d.isArray(n))for(;++e<f&&!1!==a(n[e],e,n););a=b(a,c);if(f===+f)for(a=b(a,c),e=0;e<f&&(e=u?n.length-e-1:e,!1!==a(n[e],
e,n));e++);else if(n)for(g in n)if(!1===a(n[g],g,n))break;return n},b=function(n,a,c){if("function"===typeof n){if(void 0===a)return n;c=c?c:3;return 1===c?function(c){return n.call(a,c)}:2===c?function(c,b){return n.call(a,c,b)}:3===c?function(c,b,e){return n.call(a,c,b,e)}:4===c?function(c,b,e,f){return n.call(a,c,b,e,f)}:function(){return n.apply(a,arguments)}}if(!n)return g},a=function(a,c,e){return a?d.isType("Function")(a)?b(a,c,e):d.isObject(a)?k(a):f(a):g},g=function(a){return a},k=function(a){var c=
r(a),b=c.length;return function(a){if(!a)return!b;a=Object(a);for(var n=0,e,f;n<b;n++)if(e=c[n],f=e[0],e[1]!==a[f]||!(f in a))return!1;return!0}},r=function(a){for(var c=p(a),b=c.length,e=Array(b),f=0;f<b;f++)e[f]=[c[f],a[c[f]]];return e},f=function(a){return function(c){return c[a]}},c=function(n,c,b){if(null==n)return-1;var e=0,f=n.length;if(b)if("number"===typeof b)e=0>b?Math.max(0,f+b):b;else{b=a(void 0,void 0,1);for(var e=b(c),f=0,d=n.length;f<d;){var g=f+d>>>1;b(n[g])<e?f=g+1:d=g}e=f;return n[e]===
c?e:-1}for(;e<f;e++)if(n[e]===c)return e;return-1},e=function(a,c,b){for(var f in c)b&&(d.isPlainObject(c[f])||d.isArray(c[f]))?(d.isPlainObject(c[f])&&!d.isPlainObject(a[f])&&(a[f]={}),d.isArray(c[f])&&!d.isArray(a[f])&&(a[f]=[]),e(a[f],c[f],b)):void 0!==c[f]&&(a[f]=c[f])};return{each:q,mixin:function(a){if(d.isObject(a))for(var c,b,e=1,f=arguments.length;e<f;e++)for(b in c=arguments[e],c)m(c,b)&&(a[b]=c[b]);return a},makeArray:function(a){if(a instanceof Array)return a;for(var c=-1,b=a.length,e=
Array(b);++c<b;)e[c]=a[c];return e},merge:function(a,c){for(var b=+c.length,e=0,f=a.length;e<b;e++)a[f++]=c[e];a.length=f;return a},nodeName:function(a,c){return a&&a.nodeName&&a.nodeName.toLowerCase()===c.toLowerCase()},unique:function(n,b,e,f){if(!n)return[];d.isBoolean(b)&&(f=e,e=b,b=!1);void 0!==e&&(e=a(e,f));f=[];for(var g=[],k=0,h=n.length;k<h;k++){var l=n[k];if(b)k&&g===l||f.push(l),g=l;else if(e){var p=e(l,k,n);0>c(g,p)&&(g.push(p),f.push(l))}else 0>c(f,l)&&f.push(l)}return f},indexOf:c,instanceOf:function(a,
c){if(null==a)return!1;for(var b=a.$constructor||a.constructor;b;){if(b===c)return!0;b=b.parent}return a instanceof c},filter:function(c,b,e){var f=[];if(!c)return f;b=a(b,e);q(c,function(a,c,n){b(a,c,n)&&f.push(a)});return f},map:function(c,b,e){if(c){b=a(b,e);e=c.length!==+c.length&&p(c);for(var f=(e||c).length,g=Array(f),d,k=0;k<f;k++)d=e?e[k]:k,g[k]=b(c[d],d,c);return g}return[]},some:function(c,b,e){if(c){b=a(b,e);var f=c.length!==+c.length&&f(c);e=(f||c).length;var g,d;for(g=0;g<e;g++)if(d=
f?f[g]:g,b(c[d],d,c))return!0}return!1},reduce:function(a,c,e,f){a||(a=[]);c=b(c,f,4);var g=a.length!==+a.length&&p(a),d=(g||a).length,k=0,h;3>arguments.length&&(d||hAzzle.err(!0,7," no collection length exist in collection.reduce()"),e=a[g?g[k++]:k++]);for(;k<d;k++)h=g?g[k]:k,e=c(e,a[h],h,a);return e},now:Date.now,bind:function(a,c){var b=2<arguments.length?h.call(arguments,2):[],e;"string"===typeof c&&(e=a[c],c=a,a=e);return"function"!==typeof a||c instanceof RegExp?c:b.length?function(){return arguments.length?
a.apply(c||this,b.concat(h.call(arguments,0))):a.apply(c||this,b)}:function(){return arguments.length?a.apply(c||this,arguments):a.call(c||this)}},has:m,noop:function(){},extend:e,isInDocument:function(a){if(a){for(var c=document.body.parentNode;a;){if(a===c)return!0;a=a.parentNode}return!1}}}});
hAzzle.define("Core",function(){var d=window.document,l=d.documentElement,h=hAzzle.require("Support"),p=Array.prototype.indexOf,m=/^[^{]+\{\s*\[native \w/,q,b={},a,g,k=function(c,b){c===b&&(a=!0);return 0},r=function(a,b){var f=b&&a,g=f&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||-2147483648)-(~a.sourceIndex||-2147483648);if(g)return g;if(f)for(;f=f.nextSibling;)if(f===b)return-1;return a?1:-1},f={uidX:1,uidK:"hAzzle_id",expando:"hAzzle-"+String(Math.random()).replace(/\D/g,""),isXML:function(a){return(a=
a&&(a.ownerDocument||a).documentElement)?"HTML"!==a.nodeName:!1},xmlID:function(a){var b=a.getAttribute(this.uidK);b||(b=this.uidX++,a.setAttribute(this.uidK,b));return b},htmlID:function(a){return a.uniqueNumber||(a.uniqueNumber=this.uidX++)},"native":m.test(l.compareDocumentPosition),setDocument:function(c){var e=c.nodeType,n=c?c.ownerDocument||c:d;if(9!==e)if(e)n=c.ownerDocument;else if(c.navigator)n=c.document;else return;if(this.document!==n){this.document=c=n;var e=c.documentElement,t=this.xmlID(e),
s=b[t],u;if(!s){s=b[t]={};s.root=e;s.isXMLDocument=this.isXML(c);s.detectDuplicates=!!a;s.sortStable=f.expando.split("").sort(k).join("")===f.expando;h.assert(function(a){a.innerHTML='<a id="hAzzle_id"></a>';s.isHTMLDocument=!!c.getElementById("hAzzle_id")});if(!f.isXML(e)){s.getElementsByTagName=h.assert(function(a){a.appendChild(n.createComment(""));return!a.getElementsByTagName("*").length});s.getById=h.assert(function(a){a.innerHTML='<a name="hAzzle_id"></a><b id="hAzzle_id"></b>';return c.getElementById("hAzzle_id")===
a.firstChild});var e=f.rbuggyMatches=[],v=f.rbuggyQSA=[];(h.qsa=m.test(n.querySelectorAll))&&h.assert(function(a){a.innerHTML="<select msallowcapture=''><option selected=''></option></select>";a.querySelectorAll(":checked").length||v.push(":checked")});(s._matchesSelector=m.test(q=l._matches||l.webkitMatchesSelector||l.mozMatchesSelector||l.oMatchesSelector||l.msMatchesSelector))&&h.assert(function(a){f.disconnectedMatch=q.call(a,"div")});v=v.length&&new RegExp(v.join("|"));e=e.length&&new RegExp(e.join("|"))}s.contains=
f["native"]||f["native"].test(l.contains)?function(a,c){var b=9===a.nodeType?a.documentElement:a,e=c&&c.parentNode;return a===e||!!(e&&1===e.nodeType&&(b.contains?b.contains(e):a.compareDocumentPosition&&a.compareDocumentPosition(e)&16))}:function(a,c){if(c)for(;c=c.parentNode;)if(c===a)return!0;return!1};f.sortOrder=f["native"]?function(c,b){if(c===b)return a=!0,0;var e=!c.compareDocumentPosition-!b.compareDocumentPosition;if(e)return e;e=(c.ownerDocument||c)===(b.ownerDocument||b)?c.compareDocumentPosition(b):
1;return e&1||!h.sortDetached&&b.compareDocumentPosition(c)===e?c===n||c.ownerDocument===d&&f.contains(d,c)?-1:b===n||b.ownerDocument===d&&f.contains(d,b)?1:g?p.call(g,c)-p.call(g,b):0:e&4?-1:1}:function(c,b){if(c===b)return a=!0,0;var e,f=0;e=c.parentNode;var k=b.parentNode,h=[c],l=[b];if(!e||!k)return c===n?-1:b===n?1:e?-1:k?1:g?p.call(g,c)-p.call(g,b):0;if(e===k)return r(c,b);for(e=c;e=e.parentNode;)h.unshift(e);for(e=b;e=e.parentNode;)l.unshift(e);for(;h[f]===l[f];)f++;return f?r(h[f],l[f]):h[f]===
d?-1:l[f]===d?1:0};e=null}for(u in s)this[u]=s[u]}}},k=f.sortOrder;f.setDocument(d);return{root:f.root,isXML:f.isXML,isHTML:!f.isXML(d),expando:f.expando,uniqueSort:function(c){var b,n=[],d=0,h=0;a=!f.detectDuplicates;g=!f.sortStable&&c.slice(0);c.sort(k);if(a){for(;b=c[h++];)b===c[h]&&(d=n.push(h));for(;d--;)c.splice(n[d],1)}g=null;return c},contains:f.contains,rbuggyQSA:f.rbuggyQSA}});
hAzzle.define("Collection",function(){var d=hAzzle.require("Util"),l=hAzzle.require("Types"),h=Array.prototype,p=h.concat,m=h.push,q=function(b,a,g){"undefined"===typeof a&&(a=0);"undefined"===typeof g&&(g=b?b.length:0);var d=-1;g=g-a||0;for(var h=Array(0>g?0:g);++d<g;)h[d]=b[a+d];return h};this.toJqueryZepto=function(){for(var b=this.length,a=this.elements;b--;)this[b]=a[b];return this};this.get=function(b){return void 0===b?q(this.elements,0):0>b?this.elements[this.length+b]:this.elements[b]};this.eq=
function(b){return hAzzle(-1===b?q(this.elements,this.length-1):q(this.elements,b,b+1))};this.reduce=function(b,a,g){return d.reduce(this.elements,b,a,g)};this.indexOf=function(b,a,g){return null==a?-1:h.indexOf.call(a,b,g)};this.map=function(b,a){return hAzzle(d.map(this.elements,b,a))};this.each=function(b,a,g){d.each(this.elements,b,a,g);return this};this.slice=function(b,a){return new hAzzle(q(this.elements,b,a))};this.concat=function(){var b=d.map(q(arguments),function(a){return a instanceof
hAzzle?a.elements:a});return hAzzle(p.apply(this.elements,b))};this.is=function(b){return 0<this.length&&0<this.filter(b).length};this.not=function(b){return this.filter(b,!0)};this.index=function(b){var a=this.elements;return b?"string"===typeof b?d.indexOf(hAzzle(b).elements,a[0]):d.indexOf(a,b instanceof hAzzle?b.elements[0]:b):a[0]&&a[0].parentElement?this.first().prevAll().length:-1};this.add=function(b,a){var g=b;"string"===typeof b&&(g=hAzzle(b,a).elements);return this.concat(g)};this.first=
function(b){return b?this.slice(0,b):this.eq(0)};this.last=function(b){return b?this.slice(this.length-b):this.eq(-1)};this.even=function(){return this.filter(function(b){return 0!==b%2})};this.odd=function(){return this.filter(function(b){return 0===b%2})};d.each({next:"nextElementSibling",prev:"previousElementSibling"},function(b,a){this[a]=function(a){return this.map(function(a){return a[b]}).filter(a)}}.bind(this));d.each({prevAll:"previousElementSibling",nextAll:"nextElementSibling"},function(b,
a){this[a]=function(){var a=[];this.each(function(d){for(;(d=d[b])&&9!==d.nodeType;)a.push(d)});return hAzzle(a)}}.bind(this));return{makeArray:function(b,a){var g=a||[];void 0!==b&&(l.isArrayLike(Object(b))?d.merge(g,l.isString(b)?[b]:b):m.call(g,b));return g},slice:q}});
hAzzle.define("Jiesa",function(){var d=hAzzle.require("Util"),l=hAzzle.require("Core"),h=hAzzle.require("Collection"),p=hAzzle.require("Support"),m=/^\s*[+~]/,q=/[\n\t\r]/g,b=/^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,a=/^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/,g=/([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g,k=RegExp("=[\\x20\\t\\r\\n\\f]*([^\\]'\"]*?)[\\x20\\t\\r\\n\\f]*\\]","g"),r=window.document.documentElement,f=r.matches||r.webkitMatchesSelector||r.mozMatchesSelector||r.oMatchesSelector||r.msMatchesSelector,
c=function(a,c,b){var e=a,f=a.getAttribute("id"),n=f||"__hAzzle__",d=a.parentNode,h=m.test(c);if(h&&!d)return[];f?n=n.replace(/'/g,"\\$&"):a.setAttribute("id",n);h&&d&&(a=a.parentNode);c=c.match(g);for(d=0;d<c.length;d++)c[d]="[id='"+n+"'] "+c[d];c=c.join(",");try{return b.call(a,c)}finally{f||e.removeAttribute("id")}},e=function(a,b,e){return e&&9!==e.nodeType?c(e,b,function(c){return f(a,c)}):f.call(a,b)},n=function(a){return a?"string"===typeof a?t(a):!a.nodeType&&arrayLike(a)?a[0]:a:document},
t=function(e,f){var g,k,r,m=[];f=n(f);if(!e||"string"!==typeof e)return m;if(1!==(k=f.nodeType)&&9!==k&&11!==k)return[];if(-1!==d.indexOf(e,",")&&(g=e.split(",")))return d.each(g,function(a){d.each(t(a),function(a){l.contains(m,a)||m.push(a)})}),m;if(l.isHTML)if(g=b.exec(e))if(e=g[1]){if(9===k)return(r=f.getElementById(e))&&r.id===e?[r]:[];if(f.ownerDocument&&(r=f.ownerDocument.getElementById(e))&&l.contains(f,r)&&r.id===g)return[r]}else{if(e=g[2])return h.slice(f.getElementsByClassName(e));if(e=
g[3])return h.slice(f.getElementsByTagName(e))}else{if(g=a.exec(e)){k=f.getElementsByTagName(g[1]);var s=g[2],w=g[3];d.each(k,function(a){var c;(c=a.id===s)||(c=p.classList?a.classList.contains(w):0<=(" "+a.className+" ").replace(q," ").indexOf(w));c&&m.push(a)});return m}if(p.qsa&&l.rbuggyQSA.length)return 1===f.nodeType&&"object"!==f.nodeName.toLowerCase()?h.slice(c(f,e,f.querySelectorAll)):h.slice(f.querySelectorAll(e))}},s=function(a,c,b){if(c.nodeType)return a===c;(a.ownerDocument||a)!==document&&
l.setDocument(a);c="string"===typeof c?c.replace(k,"='$1']"):c;if(c instanceof hAzzle)return d.some(c.elements,function(c){return s(a,c)});if(a===document)return!1;if(l&&l.isHTML)try{var f=e(a,c,b);if(f||l.disconnectedMatch||a.document&&11!==a.document.nodeType)return f}catch(n){}};this.find=function(a,c,b){if(b)return t(a,c);if("string"===typeof a)return 1===this.length?hAzzle(t(a,this.elements[0])):d.reduce(this.elements,function(c,b){return hAzzle(c.concat(h.slice(t(a,b))))},[]);var e,f=this.length,
n=this.elements;return hAzzle(d.filter(hAzzle(a).elements,function(a){for(e=0;e<f;e++)if(l.contains(n[e],a))return!0}))};this.filter=function(a,c){if(void 0===a)return this;if("function"===typeof a){var b=[];this.each(function(c,e){a.call(c,e)&&b.push(c)});return hAzzle(b)}return this.filter(function(){return e(this,a)!=(c||!1)})};return{matchesSelector:e,matches:s,find:t}});
hAzzle.define("Strings",function(){var d=String.prototype.trim,l=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,h=/[A-Z]/g,p=/^#x([\da-fA-F]+)$/,m=/^#(\d+)$/,q=/[&<>"']/g,b=/^-ms-/,a=/-([\da-z])/gi,g=[],k={lt:"<",gt:">",quot:'"',apos:"'",amp:"&"},r={},f=function(a,c){return c.toUpperCase()},c=function(a){return"-"+a.charAt(0).toLowerCase()},e;for(e in k)r[k[e]]=e;r["'"]="#39";return{capitalize:function(a){return a&&"string"===typeof a?a.charAt(0).toUpperCase()+a.slice(1):""},unCapitalize:function(a){return a&&
"string"===typeof a?a.charAt(0).toLowerCase()+a.slice(1):""},hyphenate:function(a){return"string"===typeof a?a?a.replace(h,c):a:(a="number"===typeof a?""+a:"")?"data-"+a.toLowerCase():a},camelize:function(c){return c&&"string"===typeof c?g[c]?g[c]:g[c]=c.replace(b,"ms-").replace(a,f):"number"===typeof c||"boolean"===typeof c?""+c:c},trim:function(a){return null==a?"":d?"string"===typeof a?a.trim():a:(a+"").replace(l,"")},escapeHTML:function(a){return a.replace(q,function(a){return"&"+r[a]+";"})},
unescapeHTML:function(a){return a.replace(/\&([^;]+);/g,function(a,c){var b;return c in k?k[c]:(b=c.match(p))?String.fromCharCode(parseInt(b[1],16)):(b=c.match(m))?String.fromCharCode(~~b[1]):a})}}});
hAzzle.define("Storage",function(){function d(){this.expando=q.expando+Math.random()}function l(f,c,e){if(void 0===e&&1===f.nodeType)if(e="data-"+c.replace(a,"-$1").toLowerCase(),e=f.getAttribute(e),"string"===typeof e){try{e="true"===e?!0:"false"===e?!1:"null"===e?null:+e+""===e?+e:b.test(e)?JSON.parse(e+""):e}catch(d){}r.set(f,c,e)}else e=void 0;return e}var h=hAzzle.require("Util"),p=hAzzle.require("Strings"),m=hAzzle.require("Types"),q=hAzzle.require("Core"),b=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
a=/([A-Z])/g,g=/\S+/g;d.accepts=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};d.prototype={register:function(a,c){var b={};b[this.expando]={value:c||{},writable:!0,configurable:!0};a.nodeType?a[this.expando]={value:c||{}}:Object.defineProperties(a,b);return a[this.expando]},cache:function(a,c){if(!d.accepts(a))return{};var b=a[this.expando];return b?b:this.register(a,c)},set:function(a,c,b){if(a){var d;a=this.cache(a);if("string"===typeof c)a[c]=b;else if(m.isEmptyObject(a))h.mixin(a,
c);else for(d in c)a[d]=c[d];return a}},access:function(a,c,b){if(void 0===c||c&&"string"===typeof c&&void 0===b)return b=this.get(a,c),void 0!==b?b:this.get(a,p.camelize(c));this.set(a,c,b);return void 0!==b?b:c},get:function(a,c){var b=this.cache(a);return void 0!==b&&void 0===c?b:b[c]},release:function(a,c){var b,d,k=this.cache(a);if(void 0===c)this.register(a);else for(m.isArray(c)?d=c.concat(c.map(p.camelize)):(b=p.camelize(c),c in k?d=[c,b]:(d=b,d=k[d]?[d]:d.match(g)||[])),b=d.length;b--;)delete k[d[b]]},
hasData:function(a){return!m.isEmptyObject(a[this.expando]||{})},flush:function(a){a[this.expando]&&delete a[this.expando]}};var k=new d,r=new d;this.data=function(a,c){var b,d,g,h=this.elements[0],m=h&&h.attributes;if(void 0===a){if(this.length&&(g=r.get(h),1===h.nodeType&&!k.get(h,"hasDataAttrs"))){for(b=m.length;b--;)m[b]&&(d=m[b].name,0===d.indexOf("data-")&&(d=p.camelize(d.slice(5)),l(h,d,g[d])));k.set(h,"hasDataAttrs",!0)}return g}if("object"===typeof a)return this.each(function(c){r.set(c,
a)});var q=p.camelize(a);if(h&&void 0===c){g=r.get(h,a);if(void 0!==g)return g;g=r.get(h,q);var B=k.get(this,"hasDataAttrs"),z=-1!==a.indexOf("-");if(void 0!==g)return g;g=l(h,q,void 0);if(void 0!==g)return g}else this.each(function(b){var e=r.get(b,q);r.set(b,q,c);z&&void 0!==e&&r.set(b,a,c);z&&void 0===B&&r.set(b,a,c)})};this.removeData=function(a){return this.each(function(c){r.release(c,a)})};return{"private":k,data:r}});
hAzzle.define("curCSS",function(){var d=hAzzle.require("has"),l=hAzzle.require("Core"),h=hAzzle.require("Types"),p=hAzzle.require("Util"),m=hAzzle.require("Support"),q=hAzzle.require("Storage"),b=window.document.documentElement,a=!!document.defaultView.getComputedStyle,g=m.computedStyle&&d.has("webkit")?function(a){var b;if(1===a.nodeType){var f=a.ownerDocument.defaultView;b=f.getComputedStyle(a,null);!b&&a.style&&(a.style.display="",b=f.getComputedStyle(a,null))}return b||{}}:function(c){if(c&&null!==
c.ownerDocument){var b=!1;if(c)return void 0!==c.ownerDocument&&(b=c.ownerDocument.defaultView),m.cS?b&&a?b.opener?b.getComputedStyle(c,null):window.getComputedStyle(c,null):c.style:c.style}return""},k=function(a){if(a)return void 0===q["private"].get(a,"computed")&&q["private"].access(a,"computed",{computedStyle:null}),q["private"].get(a,"computed")},r=function(a){return null===k(a).computedStyle?k(a).computedStyle=g(a):k(a).computedStyle},f=function(a,b,g){"object"===typeof a&&a instanceof hAzzle&&
(a=a.elements[0]);var h=0;if(!g){if("height"===b&&"border-box"!==f(a,"boxSizing").toString().toLowerCase())return a.offsetHeight-(parseFloat(f(a,"borderTopWidth"))||0)-(parseFloat(f(a,"borderBottomWidth"))||0)-(parseFloat(f(a,"paddingTop"))||0)-(parseFloat(f(a,"paddingBottom"))||0);if("width"===b&&"border-box"!==f(a,"boxSizing").toString().toLowerCase())return a.offsetWidth-(parseFloat(f(a,"borderLeftWidth"))||0)-(parseFloat(f(a,"borderRightWidth"))||0)-(parseFloat(f(a,"paddingLeft"))||0)-(parseFloat(f(a,
"paddingRight"))||0)}if(h=r(a))return(d.ie||d.has("firefox"))&&"borderColor"===b&&(b="borderTopColor"),h=9===d.ie&&"filter"===b?h.getPropertyValue(b):h[b],""!==h||l.contains(a.ownerDocument,a)||(h=a.style[b]),"auto"!==h||"top"!==b&&"right"!==b&&"bottom"!==b&&"left"!==b||(g=f(a,"position"),"fixed"!==g&&("absolute"!==g||"left"!==b&&"top"!==b))||(h=hAzzle(a).position()[b]+"px"),void 0!==h?h+"":h};this.offset=function(a){if(arguments.length)return void 0===a?this.elements:this.each(function(b,e){var d=
a,g,k,l,n=f(b,"position"),p=hAzzle(b),r={};"static"===n&&(b.style.position="relative");l=p.offset();k=f(b,"top");g=f(b,"left");("absolute"===n||"fixed"===n)&&-1<(k+g).indexOf("auto")?(g=p.position(),k=g.top,g=g.left):(k=parseFloat(k)||0,g=parseFloat(g)||0);h.isType("function")(d)&&(d=d.call(b,e,l));null!=d.top&&(r.top=d.top-l.top+k);null!=d.left&&(r.left=d.left-l.left+g);"using"in d?d.using.call(b,r):p.css(r)});var b,d=this.elements[0],g=d&&d.ownerDocument;if(g){b=g.documentElement;if(!l.contains(b,
d))return{top:0,left:0};var k=d.getBoundingClientRect(),p="fixed"===f(d,"position"),g=h.isWindow(g)?g:9===g.nodeType&&g.defaultView;return{top:k.top+d.parentNode.scrollTop+(p?0:g.pageYOffset)-b.clientTop,left:k.left+d.parentNode.scrollLeft+(p?0:g.pageXOffset)-b.clientLeft}}};this.position=function(a){var b=this.offset(),d=this.elements[0],g=0,h=0,k={top:0,left:0};if(this.elements[0])return d=d.parentNode,p.nodeName(d,"html")||(g+=d.scrollLeft,h+=d.scrollTop),k={top:b.top-g,left:b.left-h},a&&(a=hAzzle(a))?
(b=a.getPosition(),{top:k.top-b.top-parseInt(f(a,"borderLeftWidth"))||0,left:k.left-b.left-parseInt(f(a,"borderTopWidth"))||0}):k};this.offsetParent=function(){return this.map(function(){for(var a=this.offsetParent||b;a&&!p.nodeName(a,"html")&&"static"===f(a,"position");)a=a.offsetParent;return a||b})};return{computed:k,styles:r,css:f}});
hAzzle.define("Units",function(){var d=hAzzle.require("curCSS"),l=hAzzle.require("Support"),h=/^(left$|right$|margin|padding)/,p=/^(relative|absolute|fixed)$/,m=/^(top|bottom)$/,q=function(b,a,g,k){if(""===a||"px"===a)return b;if("%"===a){h.test(k)?k="width":m.test(k)&&(k="height");if(g=p.test(d.css(g,"position"))?g.offsetParent:g.parentNode)if(k=parseFloat(d.css(g,k)),0!==k)return b/k*100;return 0}if("em"===a)return b/parseFloat(d.css(g,"fontSize"));if(void 0===q.unity){var r=q.unity={};l.assert(function(a){a.style.width=
"100cm";document.body.appendChild(a);r.mm=a.offsetWidth/1E3});r.cm=10*r.mm;r["in"]=2.54*r.cm;r.pt=1*r["in"]/72;r.pc=12*r.pt}return(a=q.unity[a])?b/a:b};return{units:q}});
hAzzle.define("Setters",function(){var d=hAzzle.require("Util"),l=hAzzle.require("Core"),h=hAzzle.require("Types"),p=hAzzle.require("has"),m=hAzzle.require("Strings"),q=Array.prototype.concat,b="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2",a=/\S+/g,g=/\r/g,k=/^[\[\s]+|\s+|[\]\s]+$/g,r=/\s*[\s\,]+\s*/,f=/\\*\./g,c="multiple selected checked disabled readonly required async autofocus compact nowrap declare noshade hreflang onload srcnoresize defaultChecked autoplay controls defer autocomplete hidden tabindex readonly type accesskey dropzone spellcheck ismap loop scoped open".split(" "),e=
{},n={},t={"class":"className","for":"htmlFor"},s={innerHTML:1,textContent:1,className:1,htmlFor:p.has("ie"),value:1},u={get:{},set:{}},v={get:{},set:{}},B={get:{},set:{}},z={get:{},set:{}},A={get:{},set:{}},C=function(a){return a instanceof hAzzle?a.elements:a},D=function(a,b){var c=e[b.toLowerCase()];return c&&n[a.nodeName]&&c},w=function(b,c){b=C(b);for(var e,d,f=0,g="string"===typeof c?c.match(a):q(c),h=g.length;f<h;f++)e=g[f],d=t[e]||e,D(b,e)?b[d]=!1:b.removeAttribute(e)},y=function(a,b,c){var e=
(a=C(a))?a.nodeType:void 0,d,f,g=s[b];if(!e||3===e||8===e||2===e)return"";if("undefined"===typeof a.getAttribute)return x(a,b,c);1===e&&l.isXML(a)||(b=b.toLowerCase(),d=u["undefined"===c?"get":"set"][b]||D(a,b)?z["undefined"===c?"get":"set"][b]:B["undefined"===c?"get":"set"][b]);if(void 0===c){if(d&&(f=d.get(a,b))&&null!==f)return f;if("textContent"==b)return x(a,b);f=a.getAttribute(b,2);return null==f?void 0:f}if(c){if(d&&void 0!==(f=d.set(a,c,b)))return f;if(g||"boolean"==typeof c||h.isType("Function")(c))return x(a,
b,c);a.setAttribute(b,c+"")}else w(a,b)},x=function(a,b,c){var e=(a=C(a))?a.nodeType:void 0,f,d;if(!e||3===e||8===e||2===e)return"";if(1!==e||l.isHTML)b=t[b]||b,f="undefined"===c?v.get[b]:v.set[b];return"undefined"!==typeof c?f&&void 0!==(d=f.set(a,c,b))?d:a[b]=c:f&&null!==(d=f(a,b))?d:a[b]};this.val=function(a){var b,c,e;c=this.elements[0];if(arguments.length)return e=h.isType("Function")(a),this.each(function(c,f){var g;1===c.nodeType&&(g=e?a.call(c,f,hAzzle(c).val()):a,null==g?g="":"number"===
typeof g?g+="":h.isArray(g)&&(g=d.map(g,function(a){return null==a?"":a+""})),b=A.set[c.type]||A.set[c.nodeName.toLowerCase()],b&&void 0!==b(c,g,"value")||(c.value=g))});if(c){if(b=A.get[c.type]||A.get[c.nodeName.toLowerCase()])return b(c,"value");c=c.value;return"string"===typeof c?c.replace(g,""):null==c?"":c}};this.hasAttr=function(a){return a&&"undefined"!==typeof this.attr(a)};this.toggleProp=function(a){return this.each(function(b){return b.prop(a,!b.prop(a))})};this.prop=function(a,b){var c=
this.elements;if("object"===typeof a)return this.each(function(b){d.each(a,function(a,c){x(b,c,a)})});if("undefined"===typeof b)return x(c[0],a);this.each(c,function(c){x(c,a,b)})};this.toggleProp=function(a){return this.each(function(b){return b.prop(a,!b.prop(a))})};this.removeProp=function(a){return this.each(function(){delete this[t[a]||a]})};this.removeAttr=function(a){return this.each(function(b){w(b,a)})};this.attr=function(a,b){var c=this.elements;return"object"===typeof a?this.each(function(b){d.each(a,
function(a,c){y(b,c,a)})}):"undefined"===typeof b?y(c[0],a):this.each(function(c){y(c,a,b)})};this.hasAttr=function(a){return a&&"undefined"!==typeof this.attr(a)};d.each(c,function(a){e[c[a]]=c[a]});d.each("input select option textarea button form details".split(" "),function(a){n[a.toUpperCase()]=!0});d.each("cellPadding cellSpacing maxLength rowSpan colSpan useMap frameBorder contentEditable textContent valueType tabIndex readOnly type accessKey tabIndex dropZone spellCheck hrefLang isMap srcDoc mediaGroup autoComplete noValidate radioGroup".split(" "),
function(a){t[a.toLowerCase()]=a});return{attrHooks:u,propHooks:v,boolHooks:z,nodeHooks:B,valHooks:A,propMap:t,boolAttr:e,boolElem:n,attr:y,prop:x,removeAttr:w,toggleAttr:function(a,b,c){a=C(a);"boolean"==typeof c||(c=null==y(a,b)===!1);var e=!c;c?y(a,b,""):w(a,b);return a[b]===e?a[b]=c:c},toAttrSelector:function(a,b,c){var e,d,g=0,h=0,l=[];b=!0===b;a="string"==typeof a?a.split(r):"number"==typeof a?""+a:a;for(e=a.length;g<e;)d=a[g++],(d=b?m.hyphenate(d):d.replace(k,""))&&(l[h++]=d);return!1===c?
l:h?"["+l.join("],[").replace(f,"\\\\.")+"]":""},getBooleanAttrName:D,SVGAttribute:function(a){if(p.ie||p.has("android")&&!p.has("chrome"))b+="|transform";return(new RegExp("^("+b+")$","i")).test(a)}}});hAzzle.define("attrHooks",function(){var d=hAzzle.require("Util"),l=hAzzle.require("Support"),h=hAzzle.require("Setters");d.mixin(h.attrHooks.set,{type:function(h,m){if(!l.radioValue&&"radio"===m&&d.nodeName(h,"input")){var q=h.value;h.setAttribute("type",m);q&&(h.value=q);return m}}});return{}});
hAzzle.define("propHooks",function(){var d=hAzzle.require("Util"),l=hAzzle.require("Support"),h=hAzzle.require("Setters");d.mixin(h.propHooks.get,{tabIndex:function(d){return d.hasAttribute("tabindex")||/^(?:input|select|textarea|button)$/i.test(d.nodeName)||d.href?d.tabIndex:-1}});l.optSelected||(h.propHooks.get.selected=function(d){(d=d.parentNode)&&d.parentNode&&d.parentNode.selectedIndex;return null});return{}});
hAzzle.define("boolHooks",function(){var d=hAzzle.require("Setters");d.boolHooks.set=function(l,h,p){!1===h?d.removeAttr(l,p):l.setAttribute(p,p);return p};return{}});
hAzzle.define("valHooks",function(){var d=hAzzle.require("Util"),l=hAzzle.require("Strings"),h=hAzzle.require("Text"),p=hAzzle.require("Types"),m=hAzzle.require("Collection"),q=hAzzle.require("Support"),b=hAzzle.require("Setters"),a=function(a,b,d){var f=a.length;for(d=0>d?Math.max(0,f+d):d||0;d<f;d++)if(a[d]===b)return d;return-1};d.mixin(b.valHooks.set,{select:function(b,d){for(var h,f,c=b.options,e=m.makeArray(d),l=c.length;l--;)if(f=c[l],f.selected=0<=a(e,f.value))h=!0;h||(b.selectedIndex=-1);
return e}});d.mixin(b.valHooks.get,{option:function(a){var b=a.getAttribute(name,2);return null!==b?b:l.trim(h.getText(a))},select:function(a){var b=a.selectedIndex,d="select-one"===a.type;a=a.options;var f=[],c,e,h;if(0>b)return"";h=d?b:0;for(e=d?b+1:a.length;h<e;h++)if(c=a[h],c.selected&&(q.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentElement.disabled||"OPTGROUP"!==c.parentElement.tagName)){c=hAzzle(c).val();if(d)return c;f.push(c)}return d&&!f.length&&a.length?a[b].value:
f}});d.each(["radio","checkbox"],function(d){b.valHooks.set[d]=function(b,d){if(p.isArray(d))return b.checked=0<=a(d,hAzzle(b).val())}})});
(function(d){function l(a){return"string"===typeof a?d.document.createTextNode(a):a}function h(a){var b=d.document.createDocumentFragment(),h=p.call(a,0),m=0,f=a.length;if(1===a.length)return l(a[0]);for(;m<f;m++)try{b.appendChild(l(h[m]))}catch(c){}return b}for(var p=Array.prototype.slice,m=(d.Element||d.Node||d.HTMLElement).prototype,q=["append",function(){this.appendChild(h(arguments))},"prepend",function(){this.firstChild?this.insertBefore(h(arguments),this.firstChild):this.appendChild(h(arguments))},
"before",function(){var a=this.parentElement;a&&a.insertBefore(h(arguments),this)},"after",function(){this.parentElement&&(this.nextSibling?this.parentElement.insertBefore(h(arguments),this.nextSibling):this.parentElement.appendChild(h(arguments)))},"replace",function(){this.parentElement&&this.parentElement.replaceChild(h(arguments),this)},"remove",function(){this.parentElement&&this.parentElement.removeChild(this)},"matches",m.matchesSelector||m.webkitMatchesSelector||m.mozMatchesSelector||m.msMatchesSelector||
function(a){var b=this.parentElement;return!!b&&-1<indexOf.call(b.querySelectorAll(a),this)}],b=q.length;b;b-=2)q[b-2]in m||(m[q[b-2]]=q[b-1])})(window);