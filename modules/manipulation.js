/*!
 * Manipulation.js - hAzzle.js module
 *
 * NOTE!! hAzzle don't have a hAzzle(HTML) function for creating HTML like jQuery and Zepto.
 *        All this is taken care of with the append, prpend, before and after function.
 */
var

byTag = 'getElementsByTagName',
    // RegExp we are using

    expr = {

        booleans: /^(checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped|noresize|declare|nohref|noshade|truespeed|inert|formnovalidate|allowfullscreen|declare|seamless|sortable|typemustmatch)$/i,
        scriptstylelink: /<(?:script|style|link)/i,
        htmlTags: /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName: /<([\w:]+)/

    },

    propertyFix = {
        "for": "htmlFor",
        "class": "className"
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

    getAttr: function (element, name) {
        if (name === 'value' && element.nodeName.toLowerCase() == 'input') {
            return hAzzle.getValue(element);
        }
        return element.getAttribute(name);
    },

    /**
     * Remove attributes
     */

    removeAttr: function (elem, value) {
        var name, propName,
            i = 0,
            attrNames = value && value.match((/\S+/g));

        if (attrNames && hAzzle.nodeType(1, elem)) {
            while ((name = attrNames[i++])) {
                propName = propertyFix[name] || name;
                if (expr['booleans'].test(name)) {
                    elem[propName] = false;
                }

                elem.removeAttribute(name);
            }
        }
    },

    getValue: function (elem) {

        // HTML Option

        if (elem.multiple) {
            return hAzzle(elem).find('option').filter(function (option) {
                return option.selected && !option.disabled;
            }).pluck('value');
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

        if (hAzzle.isString(value) && !expr['scriptstylelink'].test(value) && !wrapMap[(expr['rtagName'].exec(value) || ["", ""])[1].toLowerCase()]) {

            value = value.replace(expr['htmlTags'], "<$1></$2>");

            return this.each(function (index, elem) {
                if (hAzzle.nodeType(1, elem)) {
                    elem.innerHTML = value || "";
                }
                elem = 0;
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

        this.each(function (index, elem) {

            children = elem[byTag]('*');

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
        return this.map(function (index, element) {
            return element.cloneNode(true);
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
        return this.each(function (index, element) {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
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
            return elem && hAzzle.getValue(this[0]);
        }

        return this.each(function (index, element) {
            var val;

            if (!hAzzle.nodeType(1, element)) {
                return;
            }

            if (hAzzle.isFunction(value)) {
                val = value.call(this, index, hAzzle(this).val());
            } else {
                val = value;
            }

            if (val === null) {

                val = "";

            } else if (typeof val === "number") {
                val += "";
            }

            element.value = val;
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

        if (typeof name === 'object') {
            return this.each(function (index, element) {

                if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element) || hAzzle.nodeType(2, element)) {
                    return;
                }
                hAzzle.each(name, function (value, key) {
                    element.setAttribute(key, value + "");
                });
            });
        }
        return typeof value === 'undefined' ? this[0] && hAzzle.getAttr(this[0], name) : this.each(function (index, element) {

            if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element) || hAzzle.nodeType(2, element)) {
                return;
            }

            element.setAttribute(name, value + "");
        });
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     *
     * @return {Object}
     */

    removeAttr: function (elem, value) {
        if (!value) return;
        return this.each(function (index, element) {
            hAzzle.removeAttr(element, value);
        });
    },

    prop: function (name, value) {
        if (hAzzle.isObject(name)) {
            return this.each(function (element) {
                if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element) || hAzzle.nodeType(2, element)) {
                    return;
                }
                hAzzle.each(name, function (value, key) {
                    element[key] = propertyFix[value] || value;
                })
            })
        }
        return hAzzle.isUndefined(value) ? this.elem[0] && this.elems[0][name] : this.put(propertyFix[name] || name, value)
    },

    removeProp: function (name) {
        return this.each(function () {
            delete this[propertyFix[name] || name];
        });
    },


    /**
     * Append node to one or more elements.
     *
     * @param {Object|String} html
     * @return {Object}
     *
     * @speed: 62% faster then jQuery and 86% faster then Zepto
     */

    append: function (html) {
        return this.each(function (index, elem) {
            if (hAzzle.isString(html)) {
                elem.insertAdjacentHTML('beforeend', html);
            } else {
                if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(11, elem) || hAzzle.nodeType(9, elem)) {
                    elem.appendChild(html);
                }
            }
        });
    },

    /**
     * Prepend node to element.
     *
     * @param {Object|String} html
     * @return {Object}
     *
     * @speed: 62% faster then jQuery and 86% faster then Zepto
     */

    prepend: function (html) {
        var first;
        return this.each(function (index, elem) {
            if (hAzzle.isString(html)) {
                elem.insertAdjacentHTML('afterbegin', html);
            } else if (first = elem.childNodes[0]) {
                elem.insertBefore(html, first);
            } else {
                if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(11, elem) || hAzzle.nodeType(9, elem)) {
                    elem.appendChild(html);
                }
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
        var next
        return this.each(function (index, elem) {
            if (hAzzle.isString(html)) {
                elem.insertAdjacentHTML('afterend', html);
            } else if (next = hAzzle.getClosestNode(elem, 'nextSibling')) {
                if (elem.parentNode) elem.parentNode.insertBefore(html, next);
            } else {
                if (elem.parentNode) elem.parentNode.appendChild(html);
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
        return this.each(function (index, elem) {
            if (hAzzle.isString(html)) {
                elem.insertAdjacentHTML('beforebegin', html);
            } else {
                if (elem.parentNode) elem.parentNode.insertBefore(html, elem);
            }
        });
    }

});