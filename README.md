hAzzle
======

[![Build Status](https://travis-ci.org/hazzlejs/hAzzleJS.svg?branch=master)](https://travis-ci.org/hazzlejs/hAzzleJS) [![Code Climate](https://codeclimate.com/github/hazzlejs/hAzzleJS.png)](https://codeclimate.com/github/hazzlejs/hAzzleJS) [![Coverage Status](https://coveralls.io/repos/mehranhatami/hAzzleJS/badge.png?branch=master)](https://coveralls.io/r/mehranhatami/hAzzleJS?branch=master)

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
<td style="text-align:left;">6+       </td>
</tr>

<tr>
<td style="text-align:left;"> Safari  </td>
<td style="text-align:left;">5+       </td>
</tr>

<tr>
<td style="text-align:left;"> Firefox </td>
<td style="text-align:left;">9+       </td>
</tr>

<tr>
<td style="text-align:left;"> IE      </td>
<td style="text-align:left;">9+       </td>
</tr>

<tr>
<td style="text-align:left;"> Opera   </td>
<td style="text-align:left;">13.5+    </td>
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
<td style="text-align:left;"> 4.2+         </td>
</tr>

<tr>
<td style="text-align:left;"> Blackberry        </td>
<td style="text-align:left;"> 9.0+          </td>
</tr>

<tr>
<td style="text-align:left;"> Opera Mobile      </td>
<td style="text-align:left;"> 13.1+ (13.1) </td>
</tr>

<tr>
<td style="text-align:left;"> Chrome (Android)  </td>
<td style="text-align:left;"> 16+ (16)     </td>
</tr>

<tr>
<td style="text-align:left;"> Firefox (Android) </td>
<td style="text-align:left;"> 16+ (18)     </td>
</tr>

</tbody>
</table>

**hAzzle** are a stand-alone library with main focus on uing pure, native Javascript, and be as fast as possible. And have a small code base.

It's modular and you can use only the modules you want and need.

If you are familiar with other libraries such as jQuery, hAzzle shouldn't be too hard to use. Some of the same syntax are used, but there are major differences. The main difference is that you need to load a module before you can use a function in the global scope. I suggest you see the documentation for this, but here is an quick example:

####jQuery way of doing it:

**$.each( {}, function() {} );**

####In hAzzle you do:

**// Load the util.js module**

**var _util = hAzzle.require('Util');**

**_util.each( {}, function() {} );**

Everything are concidered as an array in hAzzle, even the DOM elements. This give you a option to use
similar functions that you may know from Loadash and underscore.js

hAzzle have now reached RC stage, and are feature complete. It can be used as a normal Javascript library.

Bugs can occur, so report back to me as soon as you discover some - if you do !

Folder 'modules' contains modules - not part of the main core.

##### NOTE!! The **Core folder** contains modules for the whole Core, but you are not forced to use them all. If you only need **map()**, **each()** and this functions, you **only** have to include **hazzle.js** and **util.js**. 

Everything are modular, so use the modules you need, but be aware that a few modules need each other. Example **types.js**

hAzzle also support modern Javascript and also a DOM Level 4 shim. So for the **manipulation.js** to work, you need to include the **doml4.js** module.


**Correct module order for the Core:**

* core/hAzzle.js 
* core/dom/support.js 
* core/dom/core.js 
* core/util/detection.js 
* core/util/types.js 
* core/util/util.js 
* core/dp,/ready.js 
* core/util/text.js 
* core/elements/collection.js 
* core/selector/jiesa.js 
* core/elements/manipulation.js 
* core/util/strings.js 
* core/util/storage.js 
* core/elements/curcss.js 
* core/util/units.js 
* core/elements/style.js 
* core/util/csshooks.js 
* core/elements/setters.js 
* core/util/attrhooks.js 
* core/util/prophooks.js 
* core/util/boolhooks.js 
* core/util/valhooks.js 
* core/elements/events.js 
* core/util/eventhooks.js 
* core/util/specialevents.js 
* core/elements/traversing.js 
* core/elements/classes.js 
* core/elements/visibility.js 
* core/util/doml4.js 

* modules/dimensions.js 
* modules/xhr.js 
* modules/jsonxml.js 
