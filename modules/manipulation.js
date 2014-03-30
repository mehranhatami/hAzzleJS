var
booleans = /^(checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped|noresize|declare|nohref|noshade|truespeed|inert|formnovalidate|allowfullscreen|declare|seamless|sortable|typemustmatch)$/i,
    rnoInnerhtml = /<(?:script|style|link)/i,
    rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    rtagName = /<([\w:]+)/,
    byTag = 'getElementsByTagName',
    wrapMap = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        thead: [1, "<table>", "</table>"],
        col: [2, "<table><colgroup>", "</colgroup></table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

        _default: [0, "", ""]
    };


function RemoveAttr(elem, value) {
    var name, propName,
        i = 0,
        attrNames = value && value.match((/\S+/g));

    if (attrNames && hAzzle.nodeType(1, elem)) {
        while ((name = attrNames[i++])) {
            propName = hAzzle.propFix[name] || name;
            if (booleans.test(name)) {
                elem[propName] = false;
            }

            elem.removeAttribute(name);
        }
    }
}

hAzzle.extend({


    propFix: {
        "for": "htmlFor",
        "class": "className"
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

    getText: function (elem) {
        var node, ret = "",
            i = 0;

        if (!elem.nodeType) {
            // If no nodeType, this is expected to be an array
            for (; node = elem[i++];) ret += hAzzle.getText(node);

        } else if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || hAzzle.nodeType(11, elem)) {

            if (hAzzle.isString(elem.textContent)) return elem.textContent;
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += hAzzle.getText(elem);

        } else if (hAzzle.nodeType(3, elem) || hAzzle.nodeType(4, elem)) {
            return elem.nodeValue;
        }
        return ret;
    }

});

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
                if (hAzzle.nodeType(1, this) || hAzzle.nodeType(9, this) || hAzzle.nodeType(11, this)) {
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
            return elem.innerHTML;
        }

        if (hAzzle.isString(value) && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

            value = value.replace(rxhtmlTag, "<$1></$2>");

            return this.each(function (index, elem) {
                if (hAzzle.nodeType(1, elem)) {
                    elem.innerHTML = value || "";
                }
            })

            elem = 0;
        }
        return this[0] && this[0].innerHTML;
    },

    empty: function () {

        var _this = this,
            children;

        // Loop through all elements

        for (var i = _this.length; i--;) {

            // ... and get all the "ugly" children we want to remove

            children = _this[i][byTag]('*')

            for (var x = children.length; x--;) {

                children[i].remove();
            }
        }

        // So far, so happy. Let us get rid of the textcontext on the parents	

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
        })
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
        })
    },


    /**
     * Get or set the value of a form element
     */

    val: function (value) {

        var elem = this[0];

        if (!value) {
            return elem && hAzzle.getValue(elem);
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

        })
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
                })
            })
        }
        return typeof value === 'undefined' ? this[0] && getAttribute(this[0], name) : this.each(function (index, element) {

            if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element) || hAzzle.nodeType(2, element)) {
                return;
            }

            element.setAttribute(name, value + "");
        })
    },

    /**
     * Remove a given attribute from an element
     */

    removeAttr: function (elem, value) {
        return this.each(function (index, element) {
            RemoveAttr(element, value);
        });
    },

    prop: function (name, value) {
        if (typeof name === 'object') {
            return this.each(function (index, element) {

                if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element) || hAzzle.nodeType(2, element)) {
                    return;
                }
                hAzzle.each(name, function (value, key) {
                    element[key] = value;
                })
            })
        }
        if (hAzzle.isUndefined(value)) {

            return this[0] && this[0][name];
        } else {

            if (! hAzzle.nodeType(3, this[0]) || ! hAzzle.nodeType(8, this[0]) || ! hAzzle.nodeType(2, this[0])) {
             return this.put(name, value);
            }
        }

    }

});