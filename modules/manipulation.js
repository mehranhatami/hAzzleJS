/*!
 * Manipulation
 */
var rnoInnerhtml = /<(?:script|style|link)/i,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    rreturn = /\r/g,

    appendMethods = {

        'appendTo': function(el, html) {
            html.appendChild(el);
        },
        'prependTo': function(el, html) {
            html.insertBefore(el, html.firstChild);
        },
        'insertBefore': function(el, html) {
            html.before(el);
        },
        'insertAfter': function(el, html) {
            el.after(html, el);
        }
    },

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
    };

// Support: IE 9

htmlMap.optgroup = htmlMap.option;
htmlMap.script = htmlMap.style = htmlMap.link = htmlMap.param = htmlMap.base;
htmlMap.tbody = htmlMap.tfoot = htmlMap.colgroup = htmlMap.caption = htmlMap.thead;
htmlMap.th = htmlMap.td;
//   htmlMap.style = htmlMap.table = htmlMap.base;

hAzzle.extend({

    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */

    val: function(value) {

        var hooks, ret,
            elem = this[0];

        if (!arguments.length) {

            if (elem) {

                hooks = hAzzle.valHooks[elem.type] || hAzzle.valHooks[elem.nodeName.toLowerCase()];

                if (hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {

                    return ret;
                }

                ret = elem.value;

                return typeof ret === 'string' ? ret.replace(rreturn, '') : ret === null ? '' : ret;
            }

            return;
        }

        return this.each(function(el, i) {

            var val;

            if (el.nodeType !== 1) {
                return;
            }

            if (typeof value === 'function') {

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

                val = hAzzle.map(val, function(value) {

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

    html: function(value) {

        var el = this[0] || {},
            append = function(el, i) {
                hAzzle.each(hAzzle.stabilizeHTML(value, i), function(node) {
                    el.appendChild(node);
                });
            };

        if (value === undefined && el.nodeType === 1) {

            return el.innerHTML;
        }

        // check if the value are an 'function'

        if (typeof value === 'function') {

            return this.each(function(el, i) {

                var self = hAzzle(el);
                // Call the same function again
                self.html(value.call(el, i, self.html()));
            });
        }

        return this.empty().each(function(el, i) {

            if (typeof value === 'string' && !specialTags.test(el.tagName) &&
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

    text: function(value) {
        return typeof value === 'function' ?
            this.each(function(el, i) {
                var self = hAzzle(el);
                self.text(value.call(el, i, self.text()));
            }) :
            value === undefined ? hAzzle.getText(this) :
            this.empty().each(function() {
                if (this.nodeType === 1 || this.nodeType === 9 || this.nodeType === 11) {
                    this.textContent = value;
                }
            });
    },

    // DOM Manipulation method

    Manipulation: function(html, method, nType) {

        var len = this.length > 1,
            elems;

        return this.each(function(el) {

            // Check for valid nodeType

            if (nType && !hAzzle.inArray(nType, el)) {

                return;
            }

            // Stabilize HTML

            elems = stabilizeHTML(html, this.ownerDocument);

            // Iterate through the elements

            hAzzle.each(elems, function() {

                elems = len ? hAzzle.clone(this, true, true) : this, el;

                if (method === 'append' ||
                    method === 'prepend') {

                    elems = manipulationTarget(elems);
                }

                // Do the DOM Level 4 magic

                el[method](elems);
            });
        });
    },

    /**
     * Replace current element with html
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function() {
        var arg = arguments[0];
        return this.each(function(elem) {
            hAzzle.clearData(elem);
            hAzzle.each(stabilizeHTML(arguments[0]), function(i) {
                elem.replace(i);
            });
        });

        // Force removal if there was no new content (e.g., from empty arguments)
        return arg && (arg.length || arg.nodeType) ? this : this.remove();
    }

});


// Extend the globale hAzzle Object

hAzzle.extend({

    valHooks: {
        option: {
            get: function(elem) {

                var val = elem.getAttribute(name, 2);

                return val !== null ?
                    val :
                    hAzzle.trim(hAzzle.getText(elem));
            }
        },
        select: {
            get: function(elem) {

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

                    if ((option.selected || i === index) &&
                        option.getAttribute('disabled') === null &&
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

            set: function(elem, value) {

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
    }

}, hAzzle);

/* =========================== PRIVATE FUNCTIONS ========================== */

/**
 * Stabilize HTML
 * @param {Object} node
 * @param {Object} elems
 * @param {Numbers} clone
 */

var stabilizeHTML = hAzzle.stabilizeHTML = function(node) {

    var ret = [],
        elem, i;

    if (node) {

        i = node.length;

        while (i--) {

            elem = node[i];

            // String

            if (typeof elem === 'string') {

                return createHTML(elem);

                // nodeType

            } else if (elem.nodeType) { // Handles Array, hAzzle, DOM NodeList collections

                ret.push(elem);

                // Textnode

            } else {

                ret = hAzzle.merge(ret, elem);
            }
        }
    }
    return ret;
};

// Inject HTML

function injectHTML(target, node, fn, rev) {

    var i = 0,
        r = [],
        nodes, stabilized;

    if (typeof target === 'string' && target.charAt(0) === '<' &&
        target[target.length - 1] === '>' &&
        target.length >= 3) {

        nodes = target;

    } else {

        nodes = hAzzle(target);
    }

    stabilized = stabilizeHTML(nodes);

    // normalize each node in case it's still a string and we need to create nodes on the fly

    hAzzle.each(stabilized, function(t, j) {

        hAzzle.each(node, function(el) {

            if (j > 0) {

                fn(t, r[i++] = hAzzle.cloneNode(node, el));

            } else {

                fn(t, r[i++] = el);
            }

        }, null, rev);


    }, this, rev);

    node.length = i;

    hAzzle.each(r, function(e) {

        node[--i] = e;

    }, null, !rev);

    return node;
}

/**
 * Create HTML
 *
 *  @param {string} html
 *  @param {string} context
 *  @return {hAzzle}
 */

function createHTML(html) {

    var tag = html.match(singleTag),
        el = document.createElement('div'),
        els = [],
        p = tag ? htmlMap[tag[1].toLowerCase()] : null,
        dep = p ? p[2] + 1 : 1,
        ns = p && p[3],
        pn = 'parentNode';

    el.innerHTML = p ? (p[0] + html + p[1]) : html;

    while (dep--) {
        el = el.firstChild;
    }

    if (ns && el && el.nodeType !== 1) {
        el = el.nextElementSibling;
    }
    do {
        if (!tag || el.nodeType == 1) {
            els.push(el);
        }
    } while (el = el.nextElementSibling);

    hAzzle.each(els, function(el) {
        el[pn] && el[pn].removeChild(el);
    });
    return els;
}

// appendTo, prependTo, insertBefore, insertAfter manipulation methods

function InjectionMethod(elem, html, method) {
    return injectHTML.call(elem, html, elem, function(html, el) {
        try {
            appendMethods[method](el, html);
        } catch (e) {}
    }, 1);
}

function manipulationTarget(elem, content) {
    return hAzzle.nodeName(elem, 'table') &&
        hAzzle.nodeName(content.nodeType !== 11 ? content : content.firstChild, 'tr') ?
        elem.getElementsByTagName('tbody')[0] ||
        elem.appendChild(elem.ownerDocument.createElement('tbody')) :
        elem;
}

/* =========================== INTERNAL ========================== */

// Append, prepend, before and after

hAzzle.each({
    append: [1, 9, 11],
    prepend: [1, 9, 11],
    before: '',
    after: '',
}, function(nType, name) {
    hAzzle.Core[name] = function() {
        return this.Manipulation(arguments, name, nType);
    };
});

// AappendTo, prependTo, insertBefore, insertAfter

hAzzle.each(['appendTo', 'prependTo', 'insertBefore', 'insertAfter'], function(prop) {
    hAzzle.Core[prop] = function(node) {
        return InjectionMethod(this, node, prop);
    }
});

// Radios and checkboxes setter

hAzzle.each(['radio', 'checkbox'], function() {
    hAzzle.valHooks[this] = {
        set: function(elem, value) {
            if (hAzzle.isArray(value)) {
                var val = hAzzle(elem).val(),
                    checked = hAzzle.indexOf(val, value) >= 0;
                // Set the value
                elem.checked = checked;
                return;
            }
        }
    };
});