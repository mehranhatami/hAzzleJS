hAzzle
======

[![Build Status](https://travis-ci.org/hazzlejs/hAzzleJS.svg?branch=master)](https://travis-ci.org/hazzlejs/hAzzleJS) [![Code Climate](https://codeclimate.com/github/hazzlejs/hAzzleJS.png)](https://codeclimate.com/github/hazzlejs/hAzzleJS) [![Coverage Status](https://coveralls.io/repos/mehranhatami/hAzzleJS/badge.png?branch=master)](https://coveralls.io/r/mehranhatami/hAzzleJS?branch=master)

**hAzzle** is a modular javascript library written from the ground-up with modern browsers in mind, supporting all the new technology and features. It is an attempt to bring together the best from all familiar libraries such as **jQuery**, **Underscore**, **Loadash**, and **Zepto**, borrowing from both browser and node.js code patterns.

It's biggest design goal is to be as minimal as possible, and give the controll back to you in form of modules, and this is the main reason why **hAzzle** is built as a collection of modules. 

The Core contains only the basic code needed for the modules to work. On top of the Core is the module layer. You can use it whole, or just import specific modules you need. The API should be familiar to everyone who has worked with some of the libraries mentioned above.

One important thing to note is that **hAzzle** doesn't try to subclass Array in any way. A **hAzzle instance** is just a standard object, with the current elements selection stored in the **.elements array**. This gives you option to use all **ES5** / **ES6** functions methods, or deal with the **.elements array** with the same methods you find in libraries such as **Underscore** and **Loadash**.

This alone gives you over 100 different ways to deal with the **.elements array**, and you are not restricted to a few methods as you find in **jQuery** / **Zepto**. 

The **util.js module** ( part of the Core) uses some of this native functions. And a couple of other functions such as **odd()** and **even()**.

**hAzzle** also provide some of the same **DOM traversing methods** you might know from **jQuery** / **Zepto** like **.siblings()**, **.has()**, **.children()**, etc. in the **traversing.js module**.

You will also find similar methods like **.eq()**, **.prev()**, **.nextAll()*, **.next()** e.g. in the **collection.js module** ( part of the Core) to traverse through the **.elements array**

Other methodds such as **.addClass()**, **.prepend()**, **.text()**, **.html()** e.g. are all included in the **module folder**.

jQuery / Zepto
---------------
**hAzzle** are **not** compatible with **jQuery** / **Zepto**, but if you use only this modules:

* hazzle.js
* support.js
* core.js
* jiesa.js
 
and use this command on the set of elements:

**.toJqueryZepto()**

the **.elements array** will be converted to **jQuery / Zepto style** and you can develop your own functions in the same way as you do for this libraries.

**Note! hazzle will work as before, so you can actually use both hAzzle and jQuery / Zepto methods together**

Your modules
--------------

You can develop your own modules for **hAzzle**. If you do so, upload them to the **public folder** with a sub-directory that has the same name as your plugin.

**Important!!** Don't forget to add a **dependency list** document in the root of your directory so other developers know what **hAzzle modules** to include together with the **Core** to get your module to work.

DOM Level 4 (DL4)
------------------

 **hAzzle** has a build in polify in the Core supporting the most common features. And also fixes a couple of cross-browser issues (e.g. IE9 and IE10's customEvent() are not usable as a constructor. The polify can't be removed, and needed for some of the modules (not part of the Core) to work. 

* prepend
* append
* before
* after
* replace
* remove
* matches
* customEvent

Why is the Core so big?
---------------------
The hAzzle Core are not so big comparing to other libraries, and contains a lot more then the Javascript library. It take care of cross-browser, setting right document (HTML / XML), feature detection and more.

I give a quick example on the benefits using the Core comparing to jQuery library.

Let's say you want to append() some content. With hAzzle and DL4, you do it like this:

```javascript
<div id="d">Hello! </div>
document.getElementById('d').append('new content');
```

**2 lines of code**, and pure, native Javascript is all it takes to append content.

Comparing to **jQuery**, to archive the same you have to add over **60 lines of code**:

https://github.com/jquery/jquery/blob/master/src/manipulation.js#L194

and you are stricted to use jQuery for this methods.

How to use
-------------
You can use all functions internally in the same way as you do in jQuery / Zepto. 

```javascript
hAzzle('#id').eq(1).append('new content');
```
or a each example:

```javascript
this.each(function(elem) {
});
```
**NOTE!** The **this** keyword pointing to the window itself, and not the element like you may be used to from **jQuery** / **Zepto**

This change in internal each() gives you a native Javascript option to bind the elements to the Window object.

```javascript
this.each(function(elem) {
this['hello'] = function() { console.log('Hello!'); });
}.bind(this));

Then you can access it like this:

hAzzle('p').hello();

and it will show you 'Hello!' in the console log
```
For the methods **find()**, **filter()**, **reduce()** e.g. you can use the **this** keyword as a reference to the elemetns
itself.

**hAzzle** are more powerfull then this, and you can choose to include and use only the modules you want ( Core need to be loaded on the page first)

In the each() example above, we can also do it like this:

```javascript
var _util = hAzzle.require('Util');
var obj = {a:'1', b:'2'};

_util.each(obj, function(a, b) {}) 
```
**Note!** Mostly all functions can be used this way. There are a few exceptions, and this is restricted for internal uage with the **. elements array**

```javascript

// Get the elements array
var _arr  = hAzzle('p')

The array can be used like this:

console.log(_arr.elements)
```

Natives ES5 / ES6 on the **.elements array** are easy as well.

```javascript

// Get the elements array
var _arr  = hAzzle('p').elements

and then some natives:

_arr.reverse()
_arr.sort()
_arr.find()
_arr.filter()

```
Adding / removing classes can be done same way:

```javascript

hAzzle('p').addClass('test')
or
var _cls = hAzzle.require('Classes');

// hAzzle 
_cls.addClass(hAzzle('p'), 'test')

// native
_cls.addClass(document.getElementById('example'), 'test')

```
**Note!** If you include all modules you have a complete library like **jQuery** / **Zepto**, and you have mostly the same methods with a **big** exception. Everything are done the native way with hAzzle, so nothing are compatible with the mentioned libraries. Meaning you can't copy a function from **hAzzle** and hope it works for **jQuery**, because it won't.

However. You can make jQuery work on hAzzle.

```javascript

// Make jQuery / Zepto work
var _arr  = hAzzle('p').toJqueryZepto();

the created _arr would look like

_arr[0] elem
_arr[1] elem
_arr[2] elem

```
Now you can use **jQuery / Zepto** methods as you are used too. But you can also use **hAzzle** methods together
with this functions.

**UnderscoreJS** and **Loadash** can be used as well. 

```javascript

// Get the elements array
var _arr  = hAzzle('p').elements;

// Include the library you want, and then use the methods like this:

_arr {method}

and you are dealing with the array.
```
It's also easy to create your own methods. No examples given, but with the **. elements array** as illustrated below you can use all native methods or **UnderscoreJS** // **Loadash** and create your own methods with the array.

Module order ( Core)
---------------------
Correct module order for the Core if you need to test individual modules:

* core/hAzzle.js
* core/util/has.js
* core/dom/support.js
* core/dom/core.js
* core/dom/test.js
* core/util/types.js
* core/util/util.js
* core/util/text.js
* core/elements/collection.js
* core/selector/jiesa.js
* core/util/strings.js
* core/util/storage.js
* core/elements/curcss.js
* core/util/units.js
* core/elements/setters.js
* core/util/attrhooks.js
* core/util/prophooks.js
* core/util/boolhooks.js
* core/util/valhooks.js
* core/util/doml4.js

Module order (module folder)
----------------------------

* modules/attributes.js
* modules/style.js
* modules/csshooks.js
* modules/dimensions.js
* modules/xhr.js
* modules/ready.js
* modules/classes.js

* modules/traversing.js
* modules/visibility.js
* modules/jsonxml.js
* modules/manipulation.js

Browser compatiblity
--------------------

<table>
<thead>
<tr>
<th id="browser" style="text-align:left;"> Browser </th>
<th id="version" style="text-align:left;"> Version </th>
</tr>
</thead>

<tbody>
<tr>
<td style="text-align:left;"> Chrome  </td>
<td style="text-align:left;">20+       </td>
</tr>

<tr>
<td style="text-align:left;"> Safari  </td>
<td style="text-align:left;">6       </td>
</tr>

<tr>
<td style="text-align:left;"> Firefox </td>
<td style="text-align:left;">22+       </td>
</tr>

<tr>
<td style="text-align:left;"> IE      </td>
<td style="text-align:left;">9+       </td>
</tr>

<tr>
<td style="text-align:left;"> Opera   </td>
<td style="text-align:left;">15+    </td>
</tr>

</tbody>
</table>

<table>
<thead>
<tr>
<th id="browser" style="text-align:left;"> Browser           </th>
<th id="version" style="text-align:left;"> Version      </th>
</tr>
</thead>

<tbody>
<tr>
<td style="text-align:left;"> iOS               </td>
<td style="text-align:left;"> 6.0.1 </td>
</tr>

<tr>
<td style="text-align:left;"> Android           </td>
<td style="text-align:left;"> 4.0+         </td>
</tr>

<tr>
<td style="text-align:left;"> Blackberry        </td>
<td style="text-align:left;"> 9.0+          </td>
</tr>

<tr>
<td style="text-align:left;"> Opera Mobile      </td>
<td style="text-align:left;"> 13.1+  </td>
</tr>

<tr>
<td style="text-align:left;"> Chrome (Android)  </td>
<td style="text-align:left;"> 22+      </td>
</tr>

<tr>
<td style="text-align:left;"> Firefox (Android) </td>
<td style="text-align:left;"> 24+      </td>
</tr>

</tbody>
</table>



