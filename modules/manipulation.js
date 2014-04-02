/*!
 * Manipulation.js - hAzzle.js module
 *
 * NOTE!! hAzzle don't have a hAzzle(HTML) function for creating HTML like jQuery and Zepto.
 *        All this is taken care of with the append, prpend, before and after function.
 */
var

propMap = {
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
},

    byTag = 'getElementsByTagName',
    // RegExp we are using

    expres = {

        booleans: /^(checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped|noresize|declare|nohref|noshade|truespeed|inert|formnovalidate|allowfullscreen|declare|seamless|sortable|typemustmatch)$/i,
        scriptstylelink: /<(?:script|style|link)/i,
        htmlTags: /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName: /<([\w:]+)/

    },


    // Borrowed from jQuery

    wrapMap = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        thead: [1, "<table>", "</table>"],
        col: [2, "<table><colgroup>", "</colgroup></table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

        _default: [0, "", ""]
    };

function NodeMatching(elem) {
    return hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || hAzzle.nodeType(11, elem) ? true : false;
}

// Global

hAzzle.extend({

    /**
     * Get attributes
     */


    /**
     * Remove attributes
     */

    removeAttr: function (elem, value) {
        var name, propName,
            i = 0,
            attrNames = value && value.match((/\S+/g));

        if (attrNames && hAzzle.nodeType(1, elem)) {
            while ((name = attrNames[i++])) {
                propName = propMap[name] || name;
                if (expres['booleans'].test(name)) {
                    elem[propName] = false;
                }

                elem.removeAttribute(name);
            }
        }
    },

    getValue: function (elem) {

        if (elem.nodeName === 'SELECT' && elem.multiple) {

            var option,
                options = elem.options,
                index = elem.selectedIndex,
                one = elem.type === "select-one" || index < 0,
                values = one ? null : [],
                value,
                max = one ? index + 1 : options.length,
                i = index < 0 ?
                    max :
                    one ? index : 0;

            for (; i < max; i++) {

                option = options[i];

                if ((option.selected || i === index) && !option.disabled &&
                    (!option.parentNode.disabled || !hAzzle.nodeName(option.parentNode, "optgroup"))) {

                    // Get the specific value for the option
                    value = hAzzle(option).val();

                    // We don't need an array for one selects
                    if (one) {
                        return value;
                    }

                    // Multi-Selects return an array
                    values.push(value);
                }
            }
            return values;
        }

        // Return normal value

        return elem.value;
    },

    /**
     * Get text
     */

    getText: function (elem) {
        var node, ret = "",
            i = 0;

        if (!elem.nodeType) {
            // If no nodeType, this is expected to be an array
            for (; node = elem[i++];) ret += hAzzle.getText(node);

        } else if (NodeMatching(elem)) {

            if (hAzzle.isString(elem.textContent)) return elem.textContent;
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += hAzzle.getText(elem);

        } else if (hAzzle.nodeType(3, elem) || hAzzle.nodeType(4, elem)) {
            return elem.nodeValue;
        }
        return ret;
    }
});


// Core

hAzzle.fn.extend({

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection
     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {Object|String}
     */

    text: function (value) {
        return hAzzle.isUndefined(value) ?
            hAzzle.getText(this) :
            this.empty().each(function () {
                if (NodeMatching(this)) {
                    this.textContent = value;
                }
            });
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {Object|String} st
     * @return {Object|String}
     */

    html: function (value) {

        if (hAzzle.isUndefined(value) && hAzzle.nodeType(11, this[0])) {
            return this[0].innerHTML;
        }

        if (hAzzle.isString(value) && !expres['scriptstylelink'].test(value) && !wrapMap[(expres['rtagName'].exec(value) || ["", ""])[1].toLowerCase()]) {

            value = value.replace(expres['htmlTags'], "<$1></$2>");

            return this.each(function () {
                if (hAzzle.nodeType(1, this)) {
                    this.innerHTML = value || "";
                }
            });
        }

        // Return innerHTML only from the first elem in the collection

        return this[0] && this[0].innerHTML;
    },

    /**
     * Remove all childNodes from an element
     *
     * @return {Object}
     */

    empty: function () {

        var children;

        /* We have to loop through all elemets in the collection, and remove
      all children to prevent memory leaks */

        this.each(function () {

            children = this[byTag]('*');

            // Remove all the "ugly" children we want to remove

            for (var i = children.length; i--;) {

                children[i].remove();
            }

        });

        // Get rid of the textcontext on the parents	
        // Firefox support 'textContent' or not??

        return this.put('textContent', '');
    },


    /**
     * Create a deep copy of the element and it's children
     *
     * TODO!!
     *
     *  - Use documentfrag
     *  - Clone data
     *  - Clone events
     */

    clone: function () {
        return this.map(function () {
            return this.cloneNode(true);
        });
    },

    /**
     *  Remove an element from the DOM
     *
     * TODO!!
     *
     *  - Remove events
     *  - Remove data
     */

    remove: function () {
        return this.each(function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        });
    },


    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */
    val: function (value) {

        if (!value) {

            return this[0] && hAzzle.getValue(this[0]);
        }

        return this.each(function (index, elem) {
            var val;

            if (!hAzzle.nodeType(1, elem)) {
                return;
            }

            if (hAzzle.isFunction(value)) {
                val = value.call(elem, index, hAzzle(elem).val());
            } else {
                val = value;
            }

            if (val === null) {

                val = "";

            } else if (typeof val === "number") {
                val += "";
            }

            elem.value = val;
        });
    },

    /**
     * Get attribute from element
     * Set attribute to element collection
     *
     * @param {String} name
     * @param {String|Object} value
     *
     * @return {Object|String}
     */

    attr: function (name, value) {

        if (hAzzle.isObject(name)) {

            return this.each(function (index, element) {

                if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element) || hAzzle.nodeType(2, element)) {
                    return;
                }
                hAzzle.each(name, function (value, key) {
                    element.setAttribute(key, value + "");
                });
            });
        }
        if (hAzzle.isUndefined(value)) {

            var elem = this[0];

            if (name === 'value' && elem.nodeName.toLowerCase() === 'input') {
                return hAzzle.getValue(elem);
            }
            var ret = elem.getAttribute(name);
            // Non-existent attributes return null, we normalize to undefined
            return ret === null ?
                undefined :
                ret;
        }
		
        return this.each(function () {
            hAzzle.nodeType(3, this) || hAzzle.nodeType(8, this) || hAzzle.nodeType(2, this) || this.setAttribute(name, value + "");
        });
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     *
     * @return {Object}
     */

    removeAttr: function (value) {
        var elem, name, propName, i, attrNames = value && value.match((/\S+/g));
        return this.each(function () {
            elem = this;
            i = 0;

            if (attrNames && hAzzle.nodeType(1, elem)) {
                while ((name = attrNames[i++])) {
                    propName = propMap[name] || name;
                    if (expres['booleans'].test(name)) {
                        elem[propName] = false;
                    }

                    elem.removeAttribute(name);
                }
            }
        });
    },

    /**
     * Read or set properties of DOM elements
     *
     * @param {String/Object}
     * @param {String/Null}
     *
     * @return {Object}
     */
    prop: function (name, value) {
        if ("object" === typeof name) return this.each(function (value, element) {
            hAzzle.each(name, function (name, value) {
                name = propMap[name] || name;
                element[name] = value
            })
        });
        name = propMap[name] || name;
        return hAzzle.isUndefined(value) ? this[0] && this[0][name] : this.put(name, value)
   },


    /**
     * Append node to one or more elements.
     *
     * @param {Object|String} html
     * @return {Object}
     *
     */

    append: function (html) {
        return this.each(function () {
            if (hAzzle.isString(html)) {
                this.insertAdjacentHTML('beforeend', html);
            } else {
                if (html instanceof hAzzle) {

                    if (html.length === 1) {
                        return this.appendChild(html[0]);
                    }

                    var _this = this;
                    return hAzzle.each(html, function () {
                        alert(this);
                        _this.appendChild(this);
                    });
                }

                this.appendChild(html);
            }
        });
    },

    /**
     * Prepend node to element.
     *
     * @param {Object|String} html
     * @return {Object}
     *
     */

    prepend: function (html) {
        var first;
        return this.each(function () {
            if (hAzzle.isString(html)) {
                this.insertAdjacentHTML('afterbegin', html);
            } else if (first = this.childNodes[0]) {
                this.insertBefore(html, first);
            } else {
                if (html instanceof hAzzle) {

                    if (html.length === 1) {
                        return this.appendChild(html[0]);
                    }

                    var _this = this;
                    return hAzzle.each(html, function () {
                        alert(this);
                        _this.appendChild(this);
                    });
                }
                this.appendChild(html);
            }
        });
    },

    /**
     * Add node after element.
     *
     * @param {Object|String} html
     * @return {Object}
     */

    after: function (html) {
        var next;
        return this.each(function () {
            if (hAzzle.isString(html)) {
                this.insertAdjacentHTML('afterend', html);
            } else if (next = hAzzle.getClosestNode(this, 'nextSibling')) {

                if (html instanceof hAzzle) {
                    if (this.parentNode) this.parentNode.insertBefore(html[0], next);
                } else {
                    if (this.parentNode) this.parentNode.insertBefore(html, next);
                }
            } else {
                if (html instanceof hAzzle) {
                    if (this.parentNode) this.parentNode.appendChild(html[0]);
                } else {
                    if (this.parentNode) this.parentNode.appendChild(html);
                }
            }
        });
    },

    /**
     * Add node before element.
     *
     * @param {Object|String} html
     * @return {Object}
     */

    before: function (html) {
        return this.each(function () {
            if (hAzzle.isString(html)) {
                this.insertAdjacentHTML('beforebegin', html);
            } else {
                if (html instanceof hAzzle) {
                    if (this.parentNode) this.parentNode.insertBefore(html[0], this);
                } else {
                    if (this.parentNode) this.parentNode.insertBefore(html, this);
                }
            }
        });
    }

});