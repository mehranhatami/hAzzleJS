/*!
 *  Create / parse HTML
 */
var win = this,
    doc = win.document,
    singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,

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