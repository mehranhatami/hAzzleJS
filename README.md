hAzzleJS v. 0.9.9d RC3
======

[![Build Status](https://travis-ci.org/hazzlejs/hAzzleJS.svg?branch=master)](https://travis-ci.org/hazzlejs/hAzzleJS) [![Code Climate](https://codeclimate.com/github/hazzlejs/hAzzleJS.png)](https://codeclimate.com/github/hazzlejs/hAzzleJS) [![Coverage Status](https://coveralls.io/repos/mehranhatami/hAzzleJS/badge.png?branch=master)](https://coveralls.io/r/mehranhatami/hAzzleJS?branch=master)

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

**Correct module order for the Core:**

*  hAzzle.js
*  raf.js
*  support.js
*  core.js
*  detection.js
*  types.js
*  util.js
*  ready.js
*  text.js
*  collection.js
*  jiesa.js
*  matches.js
*  create.js
*  manipulation.js
*  strings.js
*  storage.js
*  curcss.js
*  units.js
*  style.js
*  csshooks.js
*  setters.js
*  attrhooks.js
*  prophooks.js
*  boolhooks.js
*  valhooks.js
*  events.js
*  eventhooks.js
*  specialevents.js
*  traversing.js
*  classes.js
*  visibility.js
*  doml4.js

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
