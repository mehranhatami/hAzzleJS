/*!
 * Manipulation
 */
var win = this,
    doc = win.document,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
    rnoInnerhtml = /<(?:script|style|link)/i,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
    rreturn = /\r/g,
    wp = /\S+/g,

    isFunction = hAzzle.isFunction,
    isString = hAzzle.isString,

    // We have to close these tags to support XHTML	

    htmlMap = {
        thead: ['<table>', '</table>', 1],
        tr: ['<table><tbody>', '</tbody></table>', 2],
        td: ['<table><tbody><tr>', '</tr></tbody></table>', 3],
        col: ['<table><colgroup>', '</colgroup></table>', 2],
        fieldset: ['<form>', '</form>', 1],
        legend: ['<form><fieldset>', '</fieldset></form>', 2],
        option: ['<select multiple="multiple">', '</select>', 1],
        base: ['_', '', 0, 1]
    },

    // Boolean attributes

    boolAttr = {},

    // Boolean elements

    boolElem = {};

// Support: IE 9
htmlMap.optgroup = htmlMap.option;
htmlMap.script = htmlMap.style = htmlMap.link = htmlMap.param = htmlMap.base;
htmlMap.tbody = htmlMap.tfoot = htmlMap.colgroup = htmlMap.caption = htmlMap.thead;
htmlMap.th = htmlMap.td;

hAzzle.extend({

    // Exact

    exact: function (el, attribute) {
        return el.getAttribute(attribute, 2);
    },

    /**
     * Get / set attribute value
     *
     * @param {String} name
     * @param {String|Object} value

     *
     * @return {Object|String}
     */

    attr: function (name, value) {
        return hAzzle.setter(this, hAzzle.attr, name, value, true);
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeAttr: function (value) {
        return this.each(function (el) {
            hAzzle.removeAttr(el, value);
        });
    },

    /**
     * Check if an element have an attribute
     *
     * @param{String} name
     * @return {Boolean}
     */

    hasAttr: function (name) {
        return name && typeof this.attr(name) !== 'undefined';
    },

    /**
     * Toggle attributes
     *
     * @param{String} attr
     * @param{Boolean} toggle
     * @return {hAzzle}
     */

    toggleAttr: function (attr, toggle) {

        var self = this,
            args = arguments.length;

        // Do nothing if no params provided: (ie fail safely)
        if (args === 0) {

            return self;

            // When toggle arg not provided, add attribute where not present, remove it where prosent:
        } else if (args === 1) {

            return self.each(function (el) {

                hAzzle(el)[hAzzle(el).attr(attr) ? 'removeAttr' : 'addAttr'](attr, attr);

            });

            // Otherwise when both attr & toggle arguments have been provided:
        } else {

            // When toggle is a function, apply it to each element:
            if (isFunction(toggle)) {

                return self.each(function (el) {

                    hAzzle(el)[toggle.call(el) ? 'addAttr' : 'removeAttr'](attr, attr);

                });

                // Or add attr if toggle is true, remove attr if toggle is false:
            } else {

                return self[toggle ? 'addAttr' : 'removeAttr'](attr, attr);

            }

        }
    },

    /**
     * Read or set properties of DOM elements
     *
     * @param {String/Object} name
     * @param {String/Null} value
     * @return {hAzzle}
     */

    prop: function (name, value) {

        return hAzzle.setter(this, hAzzle.prop, name, value, true);
    },

    /**
     * Toggle properties on DOM elements
     */

    toggleProp: function (prop) {
        return this.each(function (el) {
            return el.prop(prop, !el.prop(prop));
        });

    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String} name
     * @return {hAzzle}
     */

    removeProp: function (prop) {
        return this.each(function () {
            delete this[hAzzle.propFix[prop] || prop];
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

        var hooks, ret,
            elem = this[0];

        if (!arguments.length) {

            if (elem) {

                hooks = hAzzle.valHooks[elem.type] || hAzzle.valHooks[elem.nodeName.toLowerCase()];

                if (hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
                    return ret;
                }

                ret = elem.value;

                return isString(ret) ? ret.replace(rreturn, '') : ret === null ? '' : ret;
            }

            return;
        }

        return this.each(function (el, i) {

            var val;

            if (el.nodeType !== 1) {
                return;
            }

            if (isFunction(value)) {

                val = value.call(el, i, hAzzle(el).val());

            } else {

                val = value;
            }

            // Treat null/undefined as ""; convert numbers to string

            if (val === null) {

                val = '';

            } else if (typeof val === 'number') {

                val += '';

            } else if (hAzzle.isArray(val)) {

                val = hAzzle.map(val, function (value) {

                    return value === null ? '' : value + '';
                });
            }

            hooks = hAzzle.valHooks[el.type] || hAzzle.valHooks[el.nodeName.toLowerCase()];

            // If set returns undefined, fall back to normal setting

            if (!hooks || !('set' in hooks) || hooks.set(el, val, 'value') === undefined) {
                el.value = val;
            }
        });
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} html
     * @return {hAzzle|string}
     *
     */

    html: function (value) {

        var el = this[0] || {},
            append = function (el, i) {
                hAzzle.each(stabilizeHTML(value, i), function (node) {
                    el.appendChild(node);
                });
            };

        if (value === undefined && el.nodeType === 1) {

            return el.innerHTML;
        }

        // check if the value are an 'function'

        if (isFunction(value)) {

            return this.each(function (el, i) {
                var self = hAzzle(el);
                // Call the same function again
                self.html(value.call(el, i, self.html()));
            });
        }

        return this.empty().each(function (el, i) {

            if (isString(value) && !specialTags.test(el.tagName) &&
                !rnoInnerhtml.test(el.tagName)) {

                value = value.replace(uniqueTags, '<$1></$2>');

                try {

                    if (el.nodeType === 1) {

                        el.innerHTML = value;
                    }

                    el = 0;

                } catch (e) {}

            } else {

                append(el, i);
            }
        });
    },

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection
     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {hAzzle|String}
     */

    text: function (value) {
        return isFunction(value) ?
            this.each(function (el, i) {
                var self = hAzzle(el);
                self.text(value.call(el, i, self.text()));
            }) :
            value === undefined ? hAzzle.getText(this) :
            this.empty().each(function () {
                if (this.nodeType === 1 || this.nodeType === 9 || this.nodeType === 11) {
                    this.textContent = value;
                }
            });
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */
    append: function (node) {
        return this.each(function (el, i) {
            if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                hAzzle.each(stabilizeHTML(node, i), function (i) {
                    // We don't allow text nodes
                    if (node.nodeType !== 3) {
                        try {
                            el.appendChild(i);
                        } // Die silently
                        catch (e) {}
                    }
                });
            }
        });
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prepend: function (node) {
        return this.each(function (el, i) {
            if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                hAzzle.each(stabilizeHTML(node, i), function (i) {
                    // We don't allow text nodes
                    if (node.nodeType !== 3) {
                        try {
                            el.insertBefore(i, el.firstChild);
                        } // Die silently
                        catch (e) {}
                    }
                });
            }
        });
    },

    /**
     * Append the current element to another
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    appendTo: function (node) {
        return injectHTML.call(this, node, this, function (t, el) {
            try {
                t.appendChild(el);
            } // Die silently
            catch (e) {}
        }, 1);
    },

    /**
     * Prepend the current element to another.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prependTo: function (node) {
        return injectHTML.call(this, node, this, function (t, el) {
            try {
                t.insertBefore(el, t.firstChild);
            } // Die silently
            catch (e) {}
        }, 1);
    },



    /**
     * @param {hAzzle|string|Element|Array} target
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertBefore: function (node) {
        injectHTML.call(this, node, this, function (t, el) {
            try {
                t.parentNode.insertBefore(el, t);
            } // Die silently
            catch (e) {}
        });
        return this;
    },


    /**
     * @param {hAzzle|string|Element|Array} node
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertAfter: function (node) {
        injectHTML.call(this, node, this, function (t, el) {
            var sibling = t.nextSibling;

            try {

                if (sibling) {

                    t.parentNode.insertBefore(el, sibling);

                } else {

                    t.parentNode.appendChild(el);
                }
            } // Die silently
            catch (e) {}
        }, 1);

        return this;

    },

    /**
     * Replace current element with html
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function () {
        var arg = arguments[0],
            self = this;
        return self.each(function (el, i) {
            // Prevent memory leaks
            hAzzle.clearData(el);
            hAzzle.each(stabilizeHTML(arg, self, i), function (i) {
                if (el.parentNode) {
                    el.parentNode.replaceChild(i, el);
                }
            });
        });
    }

});

// Extend the globale hAzzle Object

hAzzle.extend({

    propHooks: {

        tabIndex: {
            get: function (elem) {
                return elem.hasAttribute('tabindex') ||
                    /^(?:input|select|textarea|button)$/i.test(elem.nodeName) ||
                    elem.href ? elem.tabIndex : -1;
            }
        }
    },

    propFix: {
        'for': 'htmlFor',
        'class': 'className'
    },

    nodeHook: {


    },

    boolHook: {

        set: function (elem, value, name) {
            if (value === false) {
                // Remove boolean attributes when set to false
                hAzzle.removeAttr(elem, name);
            } else {
                elem.setAttribute(name, name);
            }
            return name;
        }

    },

    valHooks: {
        option: {
            get: function (elem) {

                var val = elem.getAttribute(name, 2);

                return val !== null ?
                    val :
                    hAzzle.trim(hAzzle.getText(elem));
            }
        },
        select: {
            get: function (elem) {

                // selectbox has special case

                var option,
                    options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === 'select-one' || index < 0,
                    values = one ? null : [],
                    value,
                    max = one ? index + 1 : options.length,
                    i = index < 0 ?
                    max :
                    one ? index : 0;

                for (; i < max; i++) {

                    option = options[i];

                    if ((option.selected || i === index) && !option.disabled &&
                        (hAzzle.features.optDisabled ? !option.disabled : option.getAttribute('disabled') === null) &&
                        (!option.parentNode.disabled || !hAzzle.nodeName(option.parentNode, 'optgroup'))) {

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

            set: function (elem, value) {

                var optionSet, option,
                    options = elem.options,
                    values = hAzzle.makeArray(value),
                    i = options.length;

                while (i--) {

                    option = options[i];

                    if ((option.selected = hAzzle.indexOf(option.value, values) >= 0)) {

                        optionSet = true;
                    }
                }

                // Force browsers to behave consistently when non-matching value is set
                if (!optionSet) {

                    elem.selectedIndex = -1;
                }
                return values;
            }
        }
    },

    attrHooks: {

        type: {
            set: function (elem, value) {

                if (!hAzzle.features.radioValue && value === 'radio' &&
                    hAzzle.nodeName(elem, 'input')) {

                    var val = elem.value;

                    elem.setAttribute('type', value);

                    if (val) {

                        elem.value = val;
                    }

                    return value;
                }
            }
        }

    },

    removeAttr: function (el, value) {
        var name, propName, i = 0,
            attrNames = value && value.match(wp),
            l = attrNames.length;

        for (; i < l; i++) {

            name = attrNames[i];

            propName = hAzzle.propFix[name] || name;

            if (getBooleanAttrName(el, name)) {

                el[propName] = false;

            } else {

                el.removeAttribute(name);
            }
        }
    },

    attr: function (elem, name, value) {

        var hooks, ret,
            nType = elem.nodeType;
        if (!name) {
            return;
        }

        // don't get/set attributes on text, comment and attribute nodes

        if (elem && (nType !== 2 || nType !== 3 || nType !== 8)) {

            if (nType !== 1 || hAzzle.documentIsHTML) {

                name = name.toLowerCase();

                hooks = hAzzle.attrHooks[name] ||
                    getBooleanAttrName(elem, name) ? hAzzle.boolHook : hAzzle.nodeHook;
            }

            if (value !== undefined) {

                if (value === null) {

                    hAzzle.removeAttr(elem, name);

                } else if (hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {

                    return ret;

                } else {

                    /**
                     * Quick way for setting a HTML5 data attribute
                     *
                     * Example:
                     *
                     * hAzzle('#test').attr('-html5', 'cool')
                     *
                     * The result will be:
                     *
                     * data-html5="cool"
                     *
                     *
                     * Less code to write then: 'data-html5', 'cool'
                     *
                     */

                    if (name[0] === "-") {

                        elem.setAttribute('data' + name, value + "");
                        return value;

                    } else {

                        elem.setAttribute(name, value + "");
                        return value;

                    }
                }

            } else if (hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {

                return ret;

            } else {

                ret = elem.getAttribute(name, 2);

                // Non-existent attributes return null, we normalize to undefined

                return ret === null ?
                    undefined :
                    ret;
            }
        }
    },

    // Props to jQuery

    prop: function (elem, name, value) {

        var ret, hooks,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if (!elem || nType === 2 || nType === 3 || nType === 8) {
            return;
        }

        if (nType !== 1 || hAzzle.documentIsHTML) {

            // Fix name and attach hooks
            name = hAzzle.propFix[name] || name;
            hooks = hAzzle.propHooks[name];
        }

        if (typeof value !== 'undefined') {

            return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ?
                ret :
                (elem[name] = value);

        } else {

            return hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null ?
                ret :
                elem[name];
        }
    },

    /**
     * Create HTML
     *
     *  @param {string} html
     *  @param {string} context
     *  @return {hAzzle}
     *
     * 'context' are just an extra parameter so
     * we can create html on CSS nodes as well
     * as document.
     *
     * LEFT TO DO!!
     *
     * - use of documentFragment
     *
     * - Add an similar function to jQuery's keepScript
     *
     */

    create: function (html, context) {

        // Prevent XSS vulnerability

        var tag,
            matches,
            defaultContext = isFunction(doc.implementation.createHTMLDocument) ?
            doc.implementation.createHTMLDocument() :
            doc;

        context = context || defaultContext;

        if (html !== '' && isString(html)) {

            /**
             * Create script tags
             *
             * Example:
             *
             * hAzzle.create('<script src="test">');
             *
             * @return {src}
             */

            if (simpleScriptTagRe.test(html)) {
                matches = html.match(simpleScriptTagRe);
                doc.createElement('script').src = matches[1];
                return [doc.createElement('script')];
            }

            // Single tag

            if ((tag = html.match(singleTag))) {

                return [context.createElement(tag[1])];
            }

            var el = context.createElement('div'),
                els = [],
                p = tag ? htmlMap[tag[1].toLowerCase()] : null,
                dep = p ? p[2] + 1 : 1,
                ns = p && p[3],
                pn = 'parentNode';


            if (p) {

                el.innerHTML = (p[0] + html + p[1]);

            } else {

                el.innerHTML = html;
            }

            while (dep--) {

                if (el.firstChild) {

                    el = el.firstChild;
                }
            }

            if (ns && el && el.nodeType !== 1) {

                el = el.nextSibling;
            }

            do {

                if (!tag || el.nodeType == 1) {

                    els.push(el);
                }

            } while ((el = el.nextSibling));

            hAzzle.each(els, function (el) {

                if (el[pn]) {
                    el[pn].removeChild(el);
                }
            });

            return els;

        } else {

            return hAzzle.isNode(html) ? [html.cloneNode(true)] : [];
        }
    }
}, hAzzle);


/* =========================== PRIVATE FUNCTIONS ========================== */

// Get names on the boolean attributes

function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = boolAttr[name.toLowerCase()];
    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && boolElem[element.nodeName] && booleanAttr;
}

// Stabilize HTML

function stabilizeHTML(node, clone) {
    var i = 0,
        l = node.length,
        ret;

    if (isString(node)) {

        return hAzzle.create(node);
    }

    if (hAzzle.isNode(node)) {

        node = [node];
    }

    if (clone) {

        ret = [];

        // don't change original array

        for (; i < l; i++) {
            ret[i] = hAzzle.cloneNode(node[i]);
        }

        return ret;
    }
    return node;
}


// Inject HTML

function injectHTML(target, node, fn, rev) {

        var i = 0,
            r = [],
            nodes, stabilized;

        if (isString(target) && target.charAt(0) === '<' &&
            target[target.length - 1] === ">" &&
            target.length >= 3) {

            nodes = target;

        } else {

            nodes = hAzzle(target);
        }

        stabilized = stabilizeHTML(nodes);

        // normalize each node in case it's still a string and we need to create nodes on the fly

        hAzzle.each(stabilized, function (t, j) {

            hAzzle.each(node, function (el) {

                if (j > 0) {

                    fn(t, r[i++] = hAzzle.cloneNode(node, el));

                } else {

                    fn(t, r[i++] = el);
                }

            }, null, rev);


        }, this, rev);

        node.length = i;

        hAzzle.each(r, function (e) {

            node[--i] = e;

        }, null, !rev);

        return node;
    }
    /* =========================== INTERNAL ========================== */


// Support: IE9+

if (!hAzzle.features.optSelected) {
    hAzzle.propHooks.selected = {
        get: function (elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
            }
            return null;
        }
    };
}

// Radios and checkboxes getter/setter

hAzzle.each(['radio', 'checkbox'], function () {
    hAzzle.valHooks[this] = {
        set: function (elem, value) {
            if (hAzzle.isArray(value)) {
                if (hAzzle.indexOf(hAzzle(elem).val(), value) >= 0) {
                    return elem.checked;
                }
            }
        }
    };
    if (!hAzzle.features.checkOn) {
        hAzzle.valHooks[this].get = function (elem) {
            if (elem.getAttribute('value') === null) {

                return 'on';

            } else {

                return elem.value;

            }
        };
    }
});

// Boolean attributes and elements

hAzzle.each(('multiple selected checked disabled readOnly required async autofocus ' +
    'autoplay controls defer hidden ismap loop scoped open').split(' '), function (value) {
    boolAttr[value] = value;
});

hAzzle.each('input select option textarea button form details'.split(' '), function (value) {
    boolElem[value.toUpperCase()] = true;
});

/*
 * Before and after
 */

hAzzle.forOwn({
    before: '',
    after: 'nextSibling'
}, function (key, value) {
    hAzzle.Core[key] = function (node) {
        var i = 0, l;
        return this.each(function (el, i) {
            node = stabilizeHTML(node, i);
            l = node.length;
            for (; i < l; i++) {
                if (el.parentNode) {
                    el.parentNode.insertBefore(node[i], el[value]);
                }
            }
        });
    }
});