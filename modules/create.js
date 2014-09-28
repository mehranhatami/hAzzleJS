// create.js
var
    cSpace = /^\s*<([^\s>]+)/,
    cTagR = /\s*<script +src=['"]([^'"]+)['"]>/,
    table = ['<table>', '</table>', 1],
    td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
    option = ['<select>', '</select>', 1],
    noscope = ['_', '', 0, 1],
    tagMap = {
        style: table,
        table: table,
        thead: table,
        tbody: table,
        tfoot: table,
        colgroup: table,
        caption: table,
        tr: ['<table><tbody>', '</tbody></table>', 2],
        th: td,
        td: td,
        col: ['<table><colgroup>', '</colgroup></table>', 2],
        fieldset: ['<form>', '</form>', 1],
        legend: ['<form><fieldset>', '</fieldset></form>', 2],
        option: option,
        optgroup: option,
        script: noscope,
        link: noscope,
        param: noscope,
        base: noscope,
    },

    createScriptFromHtml = function(html, context) {
        var scriptEl = context.createElement('script'),
            matches = html.match(cTagR);

        scriptEl.src = matches[1];
        return scriptEl;
    },

    create = function(node, context) {

        // Mitigate XSS vulnerability

        var defaultContext = hAzzle.isFunction(document.implementation.createHTMLDocument) ? 
            document.implementation.createHTMLDocument() : 
            document,
            ctx = context || defaultContext,
            fragment = ctx.createDocumentFragment();

        if (typeof node == 'string' && node !== '') {

            if (cTagR.test(node)) {
                return [createScriptFromHtml(node, context)];
            }

            // Deserialize a standard representation

            var i, tag = node.match(cSpace),
                el = fragment.appendChild(ctx.createElement('div')),
                els = [],
                map = tag ? tagMap[tag[1].toLowerCase()] : null,
                dep = map ? map[2] + 1 : 1,
                ns = map && map[3],
                pn = 'parentNode';

            el.innerHTML = map ? (map[0] + node + map[1]) : node;

            while (dep--) {
                el = el.firstChild;
            }

            // for IE NoScope, we may insert cruft at the begining just to get it to work

            if (ns && el && el.nodeType !== 1) {
                el = el.nextSibling;
            }

            do {
                if (!tag || el.nodeType == 1) {
                    els.push(el);
                }
            } while (el = el.nextSibling);

            for (i in els) {
                if (els[i][pn]) {
                    els[i][pn].removeChild(els[i]);
                }
            }
            return els;

        } else if (hAzzle.isNode(node)) {
            return [node.cloneNode(true)];
        }
    };

// Expose

hAzzle.create = create;

// Create it parseable

hAzzle.parseHTML = function(html, context) {
    return hAzzle(hAzzle.create(html, context));
};