var

// Get the properties right

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

    // Boolean attributes and elements

    boolean_attr = {
        'multiple': true,
        'selected': true,
        'checked': true,
        'disabled': true,
        'readOnly': true,
        'required': true,
        'open': true
    },

    boolean_elements = {
        'input': true,
        'select': true,
        'option': true,
        'textarea': true,
        'button': true,
        'form': true,
        'details': true
    },

    tagExpander = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/),
    rtagName = /<([\w:]+)/,
    rhtml = /<|&#?\w+;/,
    rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
    rscriptType = /^$|\/(?:java|ecma)script/i,
    rscriptTypeMasked = /^true\/(.*)/,
    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

    cached = [];

function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = boolean_attr[name.toLowerCase()];
    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
}

/**
 * Check if the elem matches the current nodeType
 */

function NodeMatching(elem) {
    return hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || hAzzle.nodeType(11, elem) ? true : false;
}


/**
 * Disable "script" tags
 **/


function disableScript(elem) {
    elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
    return elem;
}

/**
 * Restore "script" tags
 **/


function restoreScript(elem) {
    var m = rscriptTypeMasked.exec(elem.type);
    m ? elem.type = m[1] : elem.removeAttribute("type");
    return elem;
}



// Global

hAzzle.extend({
    /**
     * HTML Hook created for the future. If hAzzle need to support HTML6 or other
     * HTML tags, it's easy enough to do it from plugins
     */

    htmlHooks: {

        regex: /<([\w:]+)/,

        'option': function () {

            return [1, "<select multiple='multiple'>", "</select>"];
        },

        'thead': function () {

            return [1, "<table>", "</table>"];

        },

        'col': function () {

            return [2, "<table><colgroup>", "</colgroup></table>"];

        },
        'tr': function () {

            return [2, "<table><tbody>", "</tbody></table>"];

        },
        'td': function () {

            return [3, "<table><tbody><tr>", "</tr></tbody></table>"];

        }
    },

    Hooks: {

        'SELECT': function (elem) {

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
        },

        'OPTION': function (elem) {
            var val = hAzzle(elem).filter(function (option) {
                return option.selected && !option.disabled;
            }).pluck('value');

            return val !== null ? val : hAzzle.trim(getText(elem));

        }
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
    },

    prop: function (elem, name, value) {
        // don't get/set properties on text, comment and attribute nodes
        if (!(hAzzle.nodeType(2, elem) || hAzzle.nodeType(3, elem) || hAzzle.nodeType(8, elem))) {
            return name = propMap[name] || name, value !== undefined ? elem[name] = value : elem[name];
        }
    },

    attr: function (elem, name, value) {
        if (!(hAzzle.nodeType(2, elem) || hAzzle.nodeType(3, elem) || hAzzle.nodeType(8, elem))) {

            if ("undefined" === typeof elem.getAttribute) return hAzzle.prop(elem, name, value);

            if (hAzzle.isUndefined(value)) {


                if (hAzzle.Hooks[elem.nodeName]) {

                    return hAzzle.Hooks[elem.nodeName](elem);
                }
                elem = elem.getAttribute(name);
                return null === elem ? undefined : elem;
            }

            return elem.setAttribute(name, value + "");
        }
    },

    Evaluated: function (elems, refElements) {
        var i = 0,
            l = elems.length;

        for (; i < l; i++) {
            hAzzle.data(elems[i], "evaluated", !refElements || hAzzle.data(refElements[i], "evaluated"));
        }
    },

    parseHTML: function (data, context, keepScripts) {

        if (!data || typeof data !== "string") {
            return null;
        }

        if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
        }
        context = context || document;

        var parsed = rsingleTag.exec(data),
            scripts = !keepScripts && [];

        // Single tag

        if (parsed) {
            return [context.createElement(parsed[1])];
        }

        parsed = hAzzle.createHTML([data], context, scripts);

        if (scripts && scripts.length) {
            hAzzle(scripts).remove();
        }

        return hAzzle.merge([], parsed.childNodes);
    },

    /*
	  Create the HTML
	  *
	  * Support for HTML 6 through the 'htmlHooks'
	   *
	*/

    createHTML: function (elems, context, scripts, selection) {

        var elem, tmp, tag, wrap, contains, j,
            fragment = context.createDocumentFragment(),
            nodes = [],
            i = 0,
            l = elems.length;

        hAzzle.each(elems, function (_, elem) {

            if (elem || elem === 0) {

                // Add nodes directly

                if (typeof elem === "object") {

                    hAzzle.merge(nodes, elem.nodeType ? [elem] : elem);

                } else if (!rhtml.test(elem)) {

                    nodes.push(context.createTextNode(elem));

                } else { // Suport for HTML 6

                    tmp = tmp || fragment.appendChild(context.createElement("div"));

                    // RegEx used here is to recognize HTML5 tags, but can be extended through the 'hook'

                    tag = (hAzzle.htmlHooks['regex'].exec(elem) || ["", ""])[1].toLowerCase();

                    wrap = hAzzle.htmlHooks[tag] || [0, "", ""];

                    tmp.innerHTML = wrap[1] + elem.replace(tagExpander, "<$1></$2>") + wrap[2];

                    // Descend through wrappers to the right content
                    j = wrap[0];

                    while (j--) {
                        tmp = tmp.lastChild;
                    }

                    hAzzle.merge(nodes, tmp.childNodes);

                    tmp = fragment.firstChild;

                    tmp.textContent = "";
                }
            }
        });

        // Remove wrapper from fragment
        fragment.textContent = "";

        i = 0;
        while ((elem = nodes[i++])) {

            if (selection && hAzzle.indexOf.call(selection, elem) === -1) continue;

            contains = hAzzle.contains(elem.ownerDocument, elem);

            // Append to fragment

            tmp = hAzzle.getChildren(fragment.appendChild(elem), "script");

            if (contains) {

                hAzzle.Evaluated(tmp);
            }

            // Capture executables
            if (scripts) {
                j = 0;
                while ((elem = tmp[j++])) {
                    if (rscriptType.test(elem.type || "")) {
                        scripts.push(elem);
                    }
                }
            }
        }

        return fragment;
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
     * @param {String} dir
     * @return {Object|String}
     */

    text: function (value, dir) {

        if (arguments.length) {

            // Avoid memory leaks, do empty()

            this.empty().each(function () {

                if (NodeMatching(this)) {

                    // Firefox does not support insertAdjacentText 

                    if (typeof HTMLElement !== 'undefined' && HTMLElement.prototype.insertAdjacentText) {

                        this.insertAdjacentText('beforeEnd', value);

                    } else {

                        this.textContent = value;
                    }
                }
            });

        } else {

            // Get the textvalue

            return hAzzle.getText(this);
        }
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} value
     * @param {String} keep
     * @return {Object|String}
     */

    html: function (value, keep) {

        if (!arguments.length && hAzzle.nodeType(1, this[0])) {

            return this[0].innerHTML;

        } else {

            // We could have used 'this' inside the loop, but faster if we don't

            return this.each(function (_, elem) {

                /**
                 * 'keep' if we want to keep the existing children of the node and add some more.
                 */
                if (keep && hAzzle.nodeType(1, elem)) {

                    // insertAdjacentHTML are supported by all major browsers

                    elem.insertAdjacentHTML('beforeend', value || '');

                } else {

                    if (hAzzle.nodeType(1, elem)) {

                        if (typeof value === "string" && !/<(?:script|style|link)/i.test(value) && !hAzzle.htmlHooks[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

                            // Do some magic

                            value = cached[value] ? cached[value] : cached[value] = value.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, "<$1></$2>");

                            // Remove stored data on the object to avoid memory leaks

                            hAzzle(elem).removeData();

                            // Get rid of existing children

                            elem.textContent = '';

                            // Do innerHTML

                            elem.innerHTML = value;
                        }
                    }
                }
            });
        }
        return this.empty().append(value);
    },

    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */

    val: function (value) {

        if (arguments.length) {

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
            })

        } else {

            var elem = this[0];

            return hAzzle.Hooks[elem.tagName] ? hAzzle.Hooks[elem.tagName](elem) : elem.value;

        }

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
        return hAzzle.isObject(name) ? this.each(function (index, element) {
            hAzzle.each(name, function (key, value) {
                hAzzle.attr(element, key, value);
            });
        }) : hAzzle.isUndefined(value) ? hAzzle.attr(this[0], name) : this.length === 1 ? hAzzle.attr(this[0], name, value) : this.each(function () {
            return hAzzle.attr(this, name, value);
        })
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
                    if (getBooleanAttrName(elem, name)) {
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
        return hAzzle.isObject(name) ? this.each(function (value, element) {
            hAzzle.each(name, function (key, value) {
                hAzzle.prop(element, key, value);
            });
        }) : hAzzle.isUndefined(value) ? this[0] && this[0][propMap[name] || name] : hAzzle.prop(element, key, value);
    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String}
     *
     * @return {Object}
     */

    removeProp: function (name) {

        return this.each(function () {
            delete this[propMap[name] || name];
        });
    },

    /**
     * Replace each element in the set of matched elements with the provided new content
     *
     * @param {String} html
     * @return {Object}
     */

    replaceWith: function (html) {
        return this.before(html).remove();
    },

    /**
     * Append the current element to another
     *
     * @param {Object|String} sel
     * @return {Object}
     */

    appendTo: function (sel) {
        return this.each(function () {
            hAzzle(sel).append(this);
        });
    },

    /**
     * Prepend the current element to another.
     *
     * @param {Object|String} sel
     * @return {Object}
     */

    prependTo: function (sel) {
        return this.each(function () {
            hAzzle(sel).prepend(this);
        });
    },


    manipulateDOM: function (args, callback) {

        // Flatten any nested arrays
        args = concat.apply([], args);

        var fragment, first, scripts, hasScripts, node, doc,
            i = 0,
            l = this.length,
            set = this,
            iNoClone = l - 1,
            value = args[0],
            isFunction = hAzzle.isFunction(value);

        // We can't cloneNode fragments that contain checked, in WebKit
        if (isFunction ||
            (l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value))) {
            return this.each(function (index) {
                var self = set.eq(index);
                if (isFunction) {
                    args[0] = value.call(this, index, self.html());
                }
                self.manipulateDOM(args, callback);
            });
        }

        if (l) {
            fragment = hAzzle.createHTML(args, this[0].ownerDocument, false, this);
            first = fragment.firstChild;

            if (fragment.childNodes.length === 1) {
                fragment = first;
            }

            if (first) {
                scripts = hAzzle.map(hAzzle.getChildren(fragment, "script"), disableScript);
                hasScripts = scripts.length;

                // Use the original fragment for the last item instead of the first because it can end up
                // being emptied incorrectly in certain situations (#8070).
                for (; i < l; i++) {
                    node = fragment;

                    if (i !== iNoClone) {
                        node = hAzzle.clone(node, true, true);

                        // Keep references to cloned scripts for later restoration
                        if (hasScripts) {
                            // Support: QtWebKit
                            // hAzzle.merge because push.apply(_, arraylike) throws
                            hAzzle.merge(scripts, hAzzle.getChildren(node, "script"));
                        }
                    }

                    callback.call(this[i], node, i);
                }

                if (hasScripts) {
                    doc = scripts[scripts.length - 1].ownerDocument;

                    // Reenable scripts
                    hAzzle.map(scripts, restoreScript);

                    // Evaluate executable scripts on first document insertion
                    for (i = 0; i < hasScripts; i++) {

                        node = scripts[i];
                        if (rscriptType.test(node.type || "") && !hAzzle.data(node, "evaluated") && hAzzle.contains(doc, node)) {

                            if (node.src) {
                                // Optional AJAX dependency, but won't run scripts if not present
                                if (hAzzle._evalUrl) {
                                    hAzzle._evalUrl(node.src);
                                }
                            } else {
                                hAzzle.Evaluated(node.textContent.replace(rcleanScript, ""));
                            }
                        }
                    }
                }
            }
        }

        return this;
    },

    /**
     * Wrap html string with a `div` or wrap special tags with their containers.
     *
     * @param {String} html
     * @return {Object}
     */

    wrap: function (html) {

        var isFunction = hAzzle.isFunction(html);

        return this.each(function (i) {
            hAzzle(this).wrapAll(hAzzle.isFunction(html) ? html.call(this, i) : html);
        });
    },

    /**
     *  Wrap an HTML structure around the content of each element in the set of matched elements.
     *
     * @param {String} html
     * @return {Object}
     *
     */

    wrapAll: function (html) {

        if (this[0]) {

            hAzzle(this[0]).before(html = hAzzle(html, this[0].ownerDocument).eq(0)); //.clone(true));

            var children;
            // drill down to the inmost element
            while ((children = html.children()).length) html = children.first();

            hAzzle(html).append(this);
        }
        return this;
    },

    wrapInner: function (html) {
        if (hAzzle.isFunction(html)) {
            return this.each(function (i) {
                hAzzle(this).wrapInner(html.call(this, i));
            });
        }

        return this.each(function () {
            var self = hAzzle(this),
                contents = self.contents();

            if (contents.length) {
                contents.wrapAll(html);

            } else {
                self.append(html);
            }
        });

    },

    /**
     *  Wrap an HTML structure around the content of each element in the set of matched elements.
     *
     * @param {String} html
     * @return {Object}
     *
     */

    unwrap: function () {
        this.parent().each(function () {
            if (!hAzzle.nodeName(this, "body")) {
                hAzzle(this).replaceWith(hAzzle(this).children()).remove();
            }
        });
        return this;
    }
});


/**
 * Extend the HTMLHook
 */

hAzzle.each(['optgroup', 'tbody', 'tfoot', 'colgroup', 'caption'], function (name) {
    hAzzle.htmlHooks[name] = function () {
        return hAzzle.htmlHooks['thead'];
    };
});

/* 
 * Prepend, Append, Befor and After
 *
 *  NOTE!!!
 *
 *  If 'html' are plain text, we use the insertAdjacentHTML to inject the content.
 *	   This method is faster, and now supported by all major browsers.
 *
 *	   If not a pure string, we have to go the long way jQuery walked before us :)
 *
 *	   K.F
 */


hAzzle.each({
    prepend: "afterbegin",
    append: "beforeend"
}, function (name, second) {

    hAzzle.fn[name] = function (html) {
        // Take the easy and fastest way if it's a string
        if (typeof html === 'string') {
            return this.each(function (_, elem) {
                if (NodeMatching(this)) {
                    elem.insertAdjacentHTML(second, html);
                }
            });
        } else { // The long walk :(
            return this.manipulateDOM(arguments, function (elem) {
                if (NodeMatching(this)) {

                    var target = hAzzle.nodeName(this, "table") &&
                        hAzzle.nodeName(hAzzle.nodeType(11, elem) ? elem : elem.firstChild, "tr") ?
                        this.getElementsByTagName("tbody")[0] ||
                        elem.appendChild(this.ownerDocument.createElement("tbody")) :
                        this;
                    // Choose correct method	
                    name === 'prepend' ? target.insertBefore(elem, target.firstChild) : target.appendChild(elem);
                }
            });
        }
    };
});

/**
 * Before and After
 */

hAzzle.each({
    before: "beforebegin",
    after: "afterend"
}, function (name, second) {

    hAzzle.fn[name] = function (html) {
        if (hAzzle.isString(html)) {
            return this.each(function () {
                this.insertAdjacentHTML(second, html);
            });
        }
        return this.manipulateDOM(arguments, function (elem) {
            if (this.parentNode) {
                this.parentNode.insertBefore(elem, name === 'after' ? this : this.nextSibling);
            }
        });
    }
});