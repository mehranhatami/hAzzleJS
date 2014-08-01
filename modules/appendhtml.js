//  appendHTML.js
var doc = this.document,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

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
htmlMap.style = htmlMap.table = htmlMap.base;

hAzzle.extend({

    // DOM Manipulation method

    Manipulation: function(html, method, nType) {

        var len = this.length > 1,
            elems;

        return this.each(function(el) {

            if (nType && !hAzzle.inArray(nType, el)) {

                return;
            }

            elems = stabilizeHTML(html, this.ownerDocument);

            hAzzle.each(elems, function() {

                elems = len ? hAzzle.clone(this, true, true) : this, el;

                if (method === 'append' ||
                    method === 'prepend') {

                    elems = manipulationTarget(elems);
                }
                el[method](elem);
            });
        });
    },

    /**
     * Insert every element in the set of matched elements to the
     * end of the target.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    appendTo: function(node) {
        return InjectionMethod(this, node, 'appendTo');
    },

    /**
     * Insert every element in the set of matched elements to the
     * beginning of the target.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prependTo: function(node) {
        return InjectionMethod(this, node, 'prependTo');
    },

    /**
     * @param {hAzzle|string|Element|Array} target
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertBefore: function(node) {
        return InjectionMethod(this, node, 'insertBefore');
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertAfter: function(node) {
        return InjectionMethod(this, node, 'insertAfter');
    },

    /**
     * Replace current element with html
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function() {
        return this.each(function(elem) {
            hAzzle.clearData(elem);
            hAzzle.each(stabilizeHTML(arguments[0]), function(i) {
                elem.replace(i);
            });
        });
    }
});

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

            if (typeof elem === "string") {

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
        el = doc.createElement('div'),
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
    return hAzzle.nodeName(elem, "table") &&
        hAzzle.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ?

        elem.getElementsByTagName("tbody")[0] ||
        elem.appendChild(elem.ownerDocument.createElement("tbody")) :
        elem;
}

/* =========================== INTERNAL ========================== */

// Append, prepend, before and after

hAzzle.each({
    append: [1, 9, 11],
    prepend: [1, 9, 11],
    before: '',
    after: '',
}, function(name, nType) {
    hAzzle.Core[name] = function() {
        return this.Manipulation(arguments, name, nType);
    };
});