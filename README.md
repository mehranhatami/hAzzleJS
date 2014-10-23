hAzzle
======

[![Build Status](https://travis-ci.org/hazzlejs/hAzzleJS.svg?branch=master)](https://travis-ci.org/hazzlejs/hAzzleJS) [![Code Climate](https://codeclimate.com/github/hazzlejs/hAzzleJS.png)](https://codeclimate.com/github/hazzlejs/hAzzleJS) [![Coverage Status](https://coveralls.io/repos/mehranhatami/hAzzleJS/badge.png?branch=master)](https://coveralls.io/r/mehranhatami/hAzzleJS?branch=master)

**hAzzle** is a modular javascript library written from the ground-up with modern browsers in mind. It is an attempt to bring together the best from all familiar libraries such as **jQuery**, **Underscore**, **Loadash**, and **Zepto**, borrowing from both browser and node.js code patterns.

It's biggest design goal is to be as minimal as possible, and give the controll back to you in form of modules, and this is the main reason why **hAzzle** is built as a collection of modules. 

The Core contains only the basic code needed for the modules to work. On top of the Core is the module layer. You can use it whole, or just import specific modules you need. The API should be familiar to everyone who has worked with some of the libraries mentioned above.

One important thing to note is that **hAzzle** doesn't try to subclass Array in any way. A hAzzle instance is just a standard object, with the current elements selection stored in the .elements array. This gives you option to use use all **ES5** / **ES6** functions methods, or deal with the .elements array with the same methods you find in libraries such as Underscore and Loadash.

This alone gives you over 100 diferetn ways to deal with the .elements array, and you are not restricted to a few methods as you find in **jQuery** / **Zepto**.

The **util.js module** ( part of the Core) uses some of the native functions.


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



