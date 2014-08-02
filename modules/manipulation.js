/*!
 * Manipulation
 *
 * NOTE!!
 *
 * hAzzle are using DOM Level 4 for most of the
 * DOM manipulation methods - see doml4.js for the pollify.
 *
 * This gives better performance, and:
 *
 * - no need for dealing with fragments
 * - call and apply of functions
 *
 * DOM Level 4 are not standard yet.
 * Only in draft: http://www.w3.org/TR/2014/WD-dom-20140710/
 *
 * Things can therefor change, and bugs occour.
 *
 * One example: In older webkit we can't apply
 * fragment on checkboxes, but this should have
 * been fixed in newer webkit that hAzzle supports.
 *
 * IF bugs happen, then we need to patch the
 * doml4.js, don't do any changes in this module.
 *
 * Support if insertAdjacentHTML are removed, because
 * it's slower with all the patches / fixes that needs
 * to get it to work.
 *
 * Kenny F.
 */
var rnoInnerhtml = /<(?:script|style|link)/i,
    rtagName = /<([\w:]+)/,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

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
     * Get html from element.
     * Set html to element.
     *
     * @param {String} value
     * @return {hAzzle|string}
     */

    html: function(value) {

        var elem = this[0] || {};

        if (value === undefined && elem.nodeType === 1) {

            return elem.innerHTML;
        }

        // If 'function'

        if (typeof value === 'function') {

            return this.each(function(el, i) {

                var self = hAzzle(el);

                // Call the same function again

                self.html(value.call(el, i, self.html()));
            });
        }

        // Remove all data and avoid memory leaks before
        // appending HTML

        if (typeof value === 'string' && !rnoInnerhtml.test(value) &&
            !htmlMap[(rtagName.exec(value) || ['', ''])[1].toLowerCase()]) {

            return this.empty().each(function(elem) {

                value = value.replace(uniqueTags, '<$1></$2>');

                try {

                    if (elem.nodeType === 1) {

                        elem.innerHTML = value;
                    }

                    elem = 0;

                } catch (e) {}
            });
        }

        // Fallback to 'append if 'value' are not a plain string value

        if (elem) {

            this.empty().append(value);
        }
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

        return hAzzle.setter(this, function(value) {
            return value === undefined ?
                hAzzle.getText(this) :
                this.empty().each(function() {
                    if (this.nodeType === 1 ||
                        this.nodeType === 11 ||
                        this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
        }, null, value, arguments.length);
    },

    // DOM Manipulation method

    Manipulation: function(html, method, nType) {

        var len = this.length > 1,
            set = this,
            self,
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

                if (len) {

                    elems = hAzzle.clone(this, true, true);

                } else {

                    elems = this;
                }

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
        this.each(function(elem) {
            hAzzle.clearData(elem);
            hAzzle.each(stabilizeHTML([arg]), function(html) {
                elem.replace(html);
            });
        });

        // Force removal if there was no new content (e.g., from empty arguments)
        return arg && (arg.length || arg.nodeType) ? this : this.remove();
    }

});



/* =========================== PRIVATE FUNCTIONS ========================== */

/**
 * Stabilize HTML
 * @param {Object} node
 * @param {Object} elems
 * @param {Numbers} clone
 */

var stabilizeHTML = function(node) {

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

/**
 * Create HTML
 *
 * Internal usage, we have html.js module for
 * creating html.
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
    } while ((el = el.nextElementSibling));

    hAzzle.each(els, function(el) {
        if (el[pn]) {
            el[pn].removeChild(el);
        }
    });
    return els;
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
    append: /* nodeTypes */ [1, 9, 11],
    prepend: /* nodeTypes */ [1, 9, 11],
    before: '',
    after: '',
}, function(nType, name) {
    hAzzle.Core[name] = function() {
        return this.Manipulation(arguments, name, nType);
    };
});

/** AppendTo, prependTo, insertBefore, insertAfter
 *
 * Note!! This methods works similar to jQuery, but
 * people can be confused simply because we can't select an element on the
 * page and insert it after another in the same way as jQuery.
 *
 * To get this to work for hAzzle, we can do:
 *
 * hAzzle.html('div{hello}').appendTo( '#test' );
 *
 * hAzzle.html('div{hello}').insertAfter( '#test' );
 *
 */

hAzzle.each({
    appendTo: 'append',
    prependTo: 'prepend',
    insertBefore: 'before',
    insertAfter: 'after',
    replaceAll: 'replaceWith'
}, function(original, prop) {
    hAzzle.Core[prop] = function(node) {
        var insert = hAzzle(node),
            i = 0,
            elems, last = insert.length - 1;
        for (; i <= last; i++) {
            elems = i === last ? this : this.clone(true);
            hAzzle(insert[i])[original](elems);
        }
    };
});