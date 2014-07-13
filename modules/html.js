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

    isString = hAzzle.isString,

    nextNode = 'nextElementSibling',
    parentNode = 'parentElement',

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
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */
    append: function (node) {
        return this.each(function (el, i) {
            if (!iAh(this, node, 'beforeend')) {
                if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                    hAzzle.each(stabilizeHTML(node, i), function (i) {

                        try {
                            el.appendChild(i);
                        } // Die silently
                        catch (e) {}
                    });
                }
             }
        });
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prepend: function (node) {
        return this.each(function (el, i) {
            if (!iAh(this, node, 'afterbegin')) {
                if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                    hAzzle.each(stabilizeHTML(node, i), function (i) {
                        try {
                            el.insertBefore(i, el.firstChild);
                        } // Die silently
                        catch (e) {}
                    });
                }
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
            t.insertBefore(el, t.firstChild);
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
                t[parentNode].insertBefore(el, t);
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
            var sibling = t[nextNode];
            if (sibling) {
                t[parentNode].insertBefore(el, sibling);
            } else {
                t[parentNode].appendChild(el);
            }
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
                if (el[parentNode]) {
                    el[parentNode].replaceChild(i, el);
                }
            });
        });
    }

});




/* =========================== PRIVATE FUNCTIONS ========================== */

// Stabilize HTML

var stabilizeHTML = hAzzle.stabilizeHTML = function(node, clone) {

    var i = 0,
        l = node.length,
        ret;

    if (isString(node)) {

        return hAzzle.create(node);
    }
    if (node.nodeType === 3) {

        return [node];
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
};


// Inject HTML

function injectHTML(target, node, fn, rev) {

    var i = 0,
        r = [],
        nodes, stabilized;

    if (isString(target) && target.charAt(0) === '<' &&
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

function iAh(elem, html, dir) {
    var tag = (tagName.exec(html) || ['', ''])[1].toLowerCase();
    if (isString(html) && hAzzle.documentIsHTML && !riAH.test(tag) && !htmlMap[tag]) {
        if (elem.insertAdjacentHTML && elem.parentNode && elem.parentNode.nodeType === 1) {
            elem.insertAdjacentHTML(dir, html.replace(uniqueTags, '<$1></$2>'));
            return true;
        }
        return false;
    }
    return false;
}


/*
 * Before and after
 */

hAzzle.forOwn({
    before: '',
    after: nextNode
}, function (value, key) {
    hAzzle.Core[key] = function (node) {
        var i = 0,
            l;
        return this.each(function (el, a) {
            if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                node = stabilizeHTML(node, a);

                l = node.length;
                for (; i < l; i++) {
                    if (el[parentNode]) {
                        try {
                            el[parentNode].insertBefore(node[i], el[value]);
                        } catch (e) {}

                    }
                }
            }
        });
    };
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
 * LEFT TO DO!!
 *
 * - use of documentFragment
 *
 * - Add an similar function to jQuery's keepScript
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