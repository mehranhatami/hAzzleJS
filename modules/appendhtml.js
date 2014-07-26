/*!
 * appendHTML.js
 *
 * NOTE!!
 *
 * This module are using DOM Level 4. Document fragment are not
 * used in this code because its all inside DL4.
 *
 * See DOML4.js module for the DL4 pollify. That pollify will be
 * deleted soon as DL4 become standard in all browsers.
 *
 * In most cases we are not using DL4 either because if pure strings,
 * we are using insertAdjacentHTML() for better performance. DL4 are used
 * as an fallback if no strings given.
 */
var win = this,
    doc = win.document,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    riAH = /<script|\[object/i,
    tagName = /<([\w:]+)/,

    iAHInserters = {
        before: 'beforeBegin',
        after: 'afterEnd',
        prepend: 'afterBegin',
        append: 'beforeEnd'
    },

    JI = {

        'append': function(elem, html) {
            elem.append(html);
        },
        'prepend': function(elem, html) {
            elem.prepend(html);
        },
        'after': function(elem, html) {
            elem.after(html);
        },
        'before': function(elem, html) {
            elem.before(html);
        },
    },

    HI = {

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

    /**
     * Insert content, specified by the parameter, to the end of each element
     * in the set of matched elements.
     *
     * @param {String/Object} node
     * @return {hAzzle}
     *
     */

    append: function(node) {
        var self = this;
        return this.each(function(el, i) {
            ManipulationMethod(el, i, node, self, 'append');
        });
    },

    /**
     * Insert content to the beginning of each element in the set
     * of matched elements.
     *
     * @param {String/Object} node
     * @return {hAzzle}
     *
     */

    prepend: function(node) {
        var self = this;
        return this.each(function(el, i) {
            ManipulationMethod(el, i, node, self, 'prepend');
        });
    },

    /**
     * Insert content after each element in the set of matched elements.
     *
     * @param {String/Object} node
     * @return {hAzzle}
     *
     */

    after: function(node) {
        var self = this;
        return this.each(function(el, i) {
            ManipulationMethod(el, i, node, self, 'after');
        });
    },

    /**
     * Insert content before each element in the set of matched elements.
     *
     * @param {String/Object} node
     * @return {hAzzle}
     *
     */

    before: function(node) {
        var self = this;
        return this.each(function(el, i) {
            ManipulationMethod(el, i, node, self, 'before');
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
        var arg = arguments[0],
            self = this;
        return self.each(function(el, i) {
            hAzzle.clearData(el);
            hAzzle.each(stabilizeHTML(arg, self, i), function(i) {
                // Call DOM Level 4 replace() 
                el.replace(i);
            });
        });
    }
});

/* =========================== PRIVATE FUNCTIONS ========================== */

// Append, prepend, before and after manipulation methods
// insertAdjutantHTML (iAH) are only used for this methods

function ManipulationMethod(elem, count, html, chain, method) {

    if (typeof html === 'string' &&
        elem.insertAdjacentHTML &&
        elem.parentNode && elem.parentNode.nodeType === 1) {
        var tag = (tagName.exec(html) || ['', ''])[1].toLowerCase();
        // Object or HTML-string with declaration of a script element 
        // must not be passed to iAH	
        if (!riAH.test(tag) && !htmlMap[tag]) {
            elem.insertAdjacentHTML(iAHInserters[method], html.replace(uniqueTags, '<$1></$2>'));
        }
    } else {
        if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {
            hAzzle.each(stabilizeHTML(html, chain, count), function(html) {
                JI[method](elem, html);
            });
        }
    }
}

// appendTo, prependTo, insertBefore, insertAfter manipulation methods

function InjectionMethod(elem, html, method) {
    return injectHTML.call(elem, html, elem, function(html, el) {
        try {
            HI[method](el, html);
        } catch (e) {}
    }, 1);
}

/**
 * Stabilize HTML
 * @param {Object} node
 * @param {Object} elems
 * @param {Numbers} clone
 */

var stabilizeHTML = hAzzle.stabilizeHTML = function(node) {
    if (typeof node == 'string') {
        return createHTML(node);
    }
    if (node.nodeType === 3) {
        node = [node];
    } // Temporary
    if (hAzzle.isNode(node)) {
        node = [node];
    }
    return node;
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
 *
 * NOTE!! This function are *only* internal. For creation
 * of HTML. Use the code in html.js
 * as document.
 *
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