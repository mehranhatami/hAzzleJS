/*!
 * Manipulation
 */
var win = this,
    doc = win.document,
    //    singleTag = /^\s*<([^\s>]+)/,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
    wp = /\S+/g,

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

    hooks = {

        'SELECT': function (elem) {

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

        'OPTION': function (elem) {

            var val = elem.getAttribute(name, 2);

            return val !== null ?
                val :
                hAzzle.trim(hAzzle.getText(elem));
        }
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

    iAh = function (el, direction, html) {
        if (el && el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
            el.insertAdjacentHTML(direction, hAzzle.trim(html));
        }
    };

// Support: IE 9
htmlMap.optgroup = htmlMap.option;
htmlMap.script = htmlMap.style = htmlMap.link = htmlMap.param = htmlMap.base;
htmlMap.tbody = htmlMap.tfoot = htmlMap.colgroup = htmlMap.caption = htmlMap.thead;
htmlMap.th = htmlMap.td;

function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = boolean_attr[name.toLowerCase()];
    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
}

function cSFH(html) {
    var scriptEl = doc.createElement('script'),
        matches = html.match(simpleScriptTagRe);
    scriptEl.src = matches[1];
    return scriptEl;
}

hAzzle.extend({


    exact: function (el, attribute) {
        return el.getAttribute(attribute, 2);
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

        var elem = this[0],
            nType = elem && elem.nodeType;

        if (!elem) {

            return;
        }

        // don't get/set attributes on text, comment and attribute nodes
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        if (typeof elem.getAttribute === typeof undefined) {

            return this.prop(name, value);
        }

        if (typeof value === 'undefined') {

            // Checks if a 'hook' exist for this...:

            if (hooks[elem.nodeName]) {

                return hooks[elem.nodeName](elem);
            }

            elem = elem.getAttribute(name, 2);

            return elem === null ? undefined : elem;
        }

        if (value === null) {

            this.removeAttr(name);
        }

        // Value is set - no need for hooks on this one...

        if (elem.nodeName === 'SELECT') {

            var optionSet, option,
                options = elem.options,
                values = hAzzle.makeArray(value),
                i = options.length;

            while (i--) {
                option = options[i];
                if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
                    optionSet = true;
                }
            }

            if (!optionSet) {
                elem.selectedIndex = -1;
            }
            return values;

        } else {

            elem.setAttribute(name, value + '');
            return value;
        }
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeAttr: function (value) {

        var name, propName, i = 0,
            attrNames = value && value.match(wp);

        return this.each(function (el) {

            if (attrNames && el.nodeType === 1) {

                while ((name = attrNames[i++])) {

                    propName = hAzzle.propFix[name] || name;

                    if (getBooleanAttrName(el, name)) {

                        el[propName] = false;

                    } else {

                        el.removeAttribute(name);
                    }
                }
            }
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
     * Sets an HTML5 data attribute
     *
     * @param{String} dataAttribute
     * @param{String} dataValue
     *
     * @return {hAzzle}
     */

    dataAttr: function (dataAttribute, dataValue) {

        if (!dataAttribute || typeof dataAttribute !== 'string') {
            return false;
        }
        var key;

        //if dataAttribute is an object, we will use it to set a data attribute for every key
        if (typeof (dataAttribute) === 'object') {
            for (key in dataAttribute) {
                this.attr('data-' + key, dataAttribute[key]);
            }

            return this;
        }

        //if a value was passed, we'll set that value for the specified dataAttribute
        else if (dataValue) {
            return this.attr('data-' + dataAttribute, dataValue);
        }

        // lastly, try to just return the requested dataAttribute's value from the element
        else {
            var value = this.attr('data-' + dataAttribute);

            // specifically checking for undefined in case 'value' ends up evaluating to false

            if (typeof value === 'undefined') {
                return;
            }

            return value;
        }
    },

    toggleAttr: function (attr, toggle) {

        var self = this,
            args = arguments.length;

        // Do nothing if no params provided: (ie fail safely)
        if (args === 0) {

            return self;

            // When toggle arg not provided, add attribute where not present, remove it where prosent:
        } else if (args === 1) {

            return self.each(function () {

                hAzzle(this)[hAzzle(this).attr(attr) ? 'removeAttr' : 'attr'](attr, attr);

            });

            // Otherwise when both attr & toggle arguments have been provided:
        } else {

            // When toggle is a function, apply it to each element:
            if (typeof toggle === 'function') {

                return this.each(function () {

                    hAzzle(this)[toggle.call(this) ? 'attr' : 'removeAttr'](attr, attr);

                });

                // Or add attr if toggle is truthy, remove attr if toggle is falsey:
            } else {

                return this[toggle ? 'attr' : 'removeAttr'](attr, attr);
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
        var el = this[0];
        return typeof name === 'object' ? this.each(function (el) {
            var a;
            for (a in name) {
                hAzzle.prop(el, a, name[a]);
            }
        }) : typeof value === 'undefined' ? el && el[hAzzle.propFix[name] || name] : property(this[0], name, value);
    },

    /**
     * Toggle properties
     */

    toggleProp: function (property) {
        return this.each(function (el) {
            return el.prop(property, !el.prop(property));
        });

    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String} name
     * @return {hAzzle}
     */

    removeProp: function (name) {
        return this.each(function () {
            delete this[hAzzle.propFix[name] || name];
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

        if (arguments.length) {

            return this.each(function (elem, index) {

                var val;

                if (elem.nodeType !== 1) {
                    return;
                }

                if (typeof value === 'function') {
                    val = value.call(elem, index, hAzzle(elem).val());

                } else {

                    val = value;
                }

                if (val === null) {

                    val = '';

                } else if (typeof val === 'number') {

                    val += '';

                } else if (hAzzle.isArray(val)) {

                    val = hAzzle.map(val, function (value) {

                        return value === null ? '' : value + '';
                    });
                }

                if (elem.type === 'radio' || elem.type === 'checkbox') {
                    elem.checked = (hAzzle.inArray(hAzzle(elem).val(), value) >= 0);
                    return elem.checked;
                }

                if (elem.type === 'select') {

                    var optionSet, option,
                        options = elem.options,
                        values = hAzzle.makeArray(value),
                        i = options.length;

                    while (i--) {
                        option = options[i];
                        if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
                            optionSet = true;
                        }
                    }

                    // force browsers to behave consistently when non-matching value is set

                    if (!optionSet) {

                        elem.selectedIndex = -1;
                    }

                    return values;
                }

                elem.value = val;
            });

        } else {

            var el = this[0],
                ret;

            if (!hAzzle.features.checkOn) {

                return el.getAttribute('value') === null ? 'on' : el.value;
            }

            ret = hooks[el.tagName] ? hooks[el.tagName](el) : el.value;

            return typeof ret === 'string' ? ret.replace(/\r\n/g, '') : ret === null ? '' : ret;
        }
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} html
     * @return {hAzzle|string}
     *
     * Mehran! I removed insertAjacentHTML ( aih ) from this function
     * else we need extra validations etc, and that slow things down.
     *
     */

    html: function (value) {

        var el = this[0] || {};

        if (typeof value === 'undefined' && el.nodeType === 1) {
            return this[0].innerHTML;
        }

        if (typeof value === "function") {
            this.each(function (el, i) {
                var self = hAzzle(el);
                self.html(value.call(el, i, self.html()));
            });
        }

        var append = function (el, i) {
            hAzzle.each(hAzzle.normalize(value, i), function (node) {
                el.appendChild(node);
            });
        };

        return this.empty().each(function (el, i) {

            if (typeof value === 'string' && !specialTags.test(el.tagName)) {

                // Mehran!! Why didn't you stop any memory leaks here? 

                value = value.replace(uniqueTags, '<$1></$2>');

                // Remove stored data on the object to avoid memory leaks

                hAzzle.removeData(el);

                // Get rid of existing children

                el.textContent = '';

                // Do innerHTML

                el.innerHTML = value;

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
        if (typeof value === 'function') {
            return this.each(function (el, i) {
                var self = hAzzle(el);
                self.text(value.call(el, i, self.text()));
            });
        }
        return typeof value === "undefined" ? hAzzle.getText(this[0]) :
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
        return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, 'beforeend', node);
            }) : this.each(function (el, i) {
                if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                    hAzzle.each(hAzzle.normalize(node, i), function (i) {
                        // We don't allow text nodes
                        if (node.nodeType !== 3) {
                            el.appendChild(i);
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
        return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, 'afterbegin', node);
            }) : this.each(function (el, i) {
                if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                    var first = el.firstChild;
                    hAzzle.each(hAzzle.normalize(node, i), function (i) {
                        // We don't allow text nodes
                        if (node.nodeType !== 3) {
                            el.insertBefore(i, first);

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
        injectHTML.call(this, node, this, function (t, el) {
            t.appendChild(el);
        }, 1);
        return this;
    },

    /**
     * Prepend the current element to another.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prependTo: function (node) {
        return injectHTML.call(this, node, this, function (t, el) {
            t.insertBefore(el, t.firstChild);
        }, 1);
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    before: function (node) {
        return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, 'beforebegin', node);
            }) : this.each(function (el, i) {
                hAzzle.each(hAzzle.normalize(node, i), function (i) {
                    el.parentNode.insertBefore(i, el);
                });
            });
    },


    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    after: function (node) {
        return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, 'afterend', node);
            }) : this.each(function (el, i) {
                hAzzle.each(hAzzle.normalize(node, i), function (i) {
                    el.parentNode.insertBefore(i, el.nextSibling);
                }, null, 1);
            });
    },


    /**
     * @param {hAzzle|string|Element|Array} target
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertBefore: function (node) {
        injectHTML.call(this, node, this, function (t, el) {
            t.parentNode.insertBefore(el, t);
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

            if (sibling) {
                t.parentNode.insertBefore(el, sibling);
            } else {
                t.parentNode.appendChild(el);
            }

        }, 1);
        return this;
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function (node) {
        hAzzle(hAzzle.normalize(node)).insertAfter(this);
        return this.remove();
    }

});

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
 */

hAzzle.create = function (html, context) {

    // Prevent XSS vulnerability

    var tag,
        defaultContext = typeof doc.implementation.createHTMLDocument === "function" ?
        doc.implementation.createHTMLDocument() :
        doc;

    context = context || defaultContext;

    if (html !== '' && typeof html === 'string') {

        // Create script tags

        if (simpleScriptTagRe.test(html)) {
            return [cSFH(html)];
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

        el.innerHTML = p ? (p[0] + html + p[1]) : html;

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

};


function injectHTML(target, node, fn, rev) {

    var i = 0,
        r = [],

        // Try to avoid XSS if we can

        nodes = typeof target === 'string' && target.charAt(0) === '<' &&
        target[target.length - 1] === ">" &&
        target.length >= 3 ? target : hAzzle(target);

    // normalize each node in case it's still a string and we need to create nodes on the fly

    hAzzle.each(hAzzle.normalize(nodes), function (t, j) {

        hAzzle.each(node, function (el) {

            fn(t, r[i++] = j > 0 ? hAzzle.cloneNode(node, el) : el);

        }, null, rev);

    }, this, rev);

    node.length = i;

    hAzzle.each(r, function (e) {

        node[--i] = e;

    }, null, !rev);

    return node;
}


hAzzle.propHooks = {

    tabIndex: {
        get: function (elem) {
            return elem.hasAttribute('tabindex') ||
                /^(?:input|select|textarea|button)$/i.test(elem.nodeName) ||
                elem.href ? elem.tabIndex : -1;
        }
    }
}

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

hAzzle.extend({

    propFix: {
        'for': 'htmlFor',
        'class': 'className'
    },

    // Props to jQuery

    prop: function (elem, name, value) {

        var ret, hooks, notxml,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if (!elem || nType === 2 || nType === 3 || nType === 8) {
            return;
        }

        notxml = nType !== 1 || !!hAzzle.isXML(elem.ownerDocument || elem);

        if (notxml) {
            // Fix name and attach hooks
            name = hAzzle.propFix[name] || name;
            hooks = hAzzle.propHooks[name];
        }

        if (typeof value !== 'undefined') {

            return hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : (elem[name] = value);

        } else {

            return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ?
                ret :
                elem[name];
        }
    }
}, hAzzle)