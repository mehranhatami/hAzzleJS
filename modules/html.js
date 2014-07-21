/*!
 * HTML
 */
var win = this,
    doc = win.document,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
    riAH = /<script|\[object/i,
    tagName = /<([\w:]+)/,

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

    append: function (node) {
        var self = this;
        return this.each(function (el, i) {
            ManipulationMethod(el, i, node, self, 'append', 'beforeend');
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

    prepend: function (node) {
        var self = this;
        return this.each(function (el, i) {
            ManipulationMethod(el, i, node, self, 'prepend', 'afterbegin');
        });
    },

    /**
     * Insert content after each element in the set of matched elements.
     *
     * @param {String/Object} node
     * @return {hAzzle}
     *
     */

    after: function (node) {
        var self = this;
        return this.each(function (el, i) {
            ManipulationMethod(el, i, node, self, 'after', 'afterend');
        });
    },

    /**
     * Insert content before each element in the set of matched elements.
     *
     * @param {String/Object} node
     * @return {hAzzle}
     *
     */

    before: function (node) {
        var self = this;
        return this.each(function (el, i) {
            ManipulationMethod(el, i, node, self, 'before', 'beforebegin');
        });
    },

    /**
     * Insert every element in the set of matched elements to the
     * end of the target.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    appendTo: function (node) {
        return injectMethods(this, node, 'appendTo');
    },

    /**
     * Insert every element in the set of matched elements to the
     * beginning of the target.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prependTo: function (node) {
        return injectMethods(this, node, 'prependTo');
    },

    /**
     * @param {hAzzle|string|Element|Array} target
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertBefore: function (node) {
        return injectMethods(this, node, 'insertBefore');
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertAfter: function (node) {
        return injectMethods(this, node, 'insertAfter');
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
            hAzzle.clearData(el);
            hAzzle.each(stabilizeHTML(arg, self, i), function (i) {
                if (el.parentElement) {
                    el.parentElement.replaceChild(i, el);
                }
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

var stabilizeHTML = hAzzle.stabilizeHTML = function (node, elems, clone) {

    if (!node) {
        return;
    }
    var i = 0,
        l = node.length,
        ret;

    if (typeof node === 'string') {

        return hAzzle.create(node);
    }

    if (hAzzle.isNode(node)) {

        node = [node];
    }

    // temporary solution
    if (node.nodeType === 3) {
        return [node];
    }

    if (clone) {

        ret = [];

        // don't change original array

        for (; i < l; i++) {

            ret[i] = hAzzle.cloneNode(elems[i], node[i]);
        }

        return ret;
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
 * - re-factoring
 *
 */

hAzzle.create = function (html, context) {

    if (html === '') {
        return;
    }


    var tag = html.match(singleTag),
        matches,

        // Prevent XSS vulnerability

        defaultContext = typeof doc.implementation.createHTMLDocument === 'function' ?
        doc.implementation.createHTMLDocument() :
        doc;


    context = context || defaultContext;

    if (typeof html === 'string') {

        // Create single script tag

        if (simpleScriptTagRe.test(html)) {
            matches = html.match(simpleScriptTagRe);
            doc.createElement('script').src = matches[1];
            return [doc.createElement('script')];
        }

        // Single tag

        if (tag) return [context.createElement(tag[1])];

        var el = context.createElement('div'),
            els = [],
            p = tag ? htmlMap[tag[1].toLowerCase()] : null,
            dep = p ? p[2] + 1 : 1,
            ns = p && p[3],
            pn = 'parentNode';


        if (p) el.innerHTML = (p[0] + html + p[1]);


        else el.innerHTML = html;

        while (dep--) {

            if (el.firstChild) {

                el = el.firstChild;
            }
        }

        if (ns && el && el.nodeType !== 1) {

            el = el.nextElementSibling;
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


// Append, prepend, before and after manipulation methods

function ManipulationMethod(elem, count, html, chain, method, iah) {

    // Accepted nodeTypes

    var types = [1, 9, 11];

    // Use insertAdjutantHTML (iAH) if a valid 'string'

    if (!iAh(elem, html, iah, types)) {

        if (types[elem.nodeType]) {

            hAzzle.each(stabilizeHTML(html, chain, count), function (count) {

                if (method === 'append') {
                    elem.appendChild(count);
                }
                if (method === 'prepend') {
                    elem.insertBefore(count, elem.firstChild, true);
                }
                if (method === 'after') {
                    elem.parentElement.insertBefore(count, elem.nextSibling);
                }
                if (method === 'before') {
                    elem.parentElement.insertBefore(count, elem);
                }
            });
        }
    }
}

// appendTo, prependTo, insertBefore, insertAfter manipulation methods

function injectMethods(elem, html, method) {

    return injectHTML.call(elem, html, elem, function (t, el) {
        try {
            if (method === 'appendTo') {

                t.appendChild(el);
            }
            if (method === 'prependTo') {

                t.insertBefore(el, t.firstChild);
            }
            if (method === 'insertBefore') {

                t.parentElement.insertBefore(el, t);
            }
            if (method === 'insertAfter') {

                var sibling = t.nextElementSibling;

                if (sibling) {

                    sibling.parentElement.insertBefore(el, sibling);

                } else {

                    t.parentElement.appendChild(el);
                }
            }
        } catch (e) {}
    }, 1);
}

/**
 * insertAdjacentHTML method
 *
 * @param {Object} elem
 * @param {String} html
 * @param {String} dir
 * @return {hAzzle}
 */

function iAh(elem, html, dir) {
    var tag = (tagName.exec(html) || ['', ''])[1].toLowerCase(),
        pNode = elem.parentElement;
    if (typeof html === 'string' && hAzzle.documentIsHTML && !riAH.test(tag) && !htmlMap[tag]) {
        if (elem.insertAdjacentHTML && pNode && pNode.nodeType === 1) {
            elem.insertAdjacentHTML(dir, html.replace(uniqueTags, '<$1></$2>'));
            return true;
        }
        return false;
    }
    return false;
}