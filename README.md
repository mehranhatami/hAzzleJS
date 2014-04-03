hAzzleJS v. 0.1.8
==================

**hAzzle** is a javascript library that tries it best to be the fastest one, and still be a lightweight alternative. It has build in support for DOM manipulation and events with support for **all modern browsers**, including IE9+. 

**hAzzle** are using native browsers functions - ES5 -, and because of that - it has many things common with underscore.js even the API itself follows the Zepto / jQuery way for easier development of plugins.

Only the Core, and modules for DOM traversing / manipulation, and document ready are available for now. 

Other modules for extending the hAzzle core will follow shortly.

The DOM traversing methods are in average 80% faster then jQuery and Zepto

14.66KB minimized

As of april 1 - 2014 most of the modules are now completed, and hAzzle can be used in webpages.

NOTE!! hAzzle is still in a pre-alpha stage and testing and fixed will be done soon.


###Work in progress:
===================

Animation engine withsupport for CSS transitions and RAF. If not RAF available, it will be a fallback to normal timeout. Here are some features coming:

- RAF
- CSS transition support
- Background animation
- Color animation
- fadeIn and fadeOut
- Paralell animation

and more...

All this will be available in the 0.2 release in a few hours.


<b>Note! </b>

hAzzle is not a jQuery clone, but a stand-alone library with it's own functions, but with some functions in common with other libraries. And hAzzle also use some other functions and techniques. As an example - this library are using:

* insertAdjacentText()
* insertAdjacentHTML()
* insertAdjacentElement()
 
as some of the new features to gain better performance


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
<td style="text-align:left;">6+       </td>
</tr>

<tr>
<td style="text-align:left;"> IE      </td>
<td style="text-align:left;">9+       </td>
</tr>

<tr>
<td style="text-align:left;"> Opera   </td>
<td style="text-align:left;">11.5+    </td>
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
<td style="text-align:left;"> 4.1+ (6.0.1) </td>
</tr>

<tr>
<td style="text-align:left;"> Android           </td>
<td style="text-align:left;"> 4.0+         </td>
</tr>

<tr>
<td style="text-align:left;"> Blackberry        </td>
<td style="text-align:left;"> 10+          </td>
</tr>

<tr>
<td style="text-align:left;"> Opera Mobile      </td>
<td style="text-align:left;"> 11.1+ (12.1) </td>
</tr>

<tr>
<td style="text-align:left;"> Chrome (Android)  </td>
<td style="text-align:left;"> 18+ (18)     </td>
</tr>

<tr>
<td style="text-align:left;"> Firefox (Android) </td>
<td style="text-align:left;"> 15+ (18)     </td>
</tr>

</tbody>
</table>
