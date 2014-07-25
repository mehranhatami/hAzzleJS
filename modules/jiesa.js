/**
 * Jiesa selector engine
 *
 * Contains:
 *
 * - Jiesa selector engine
 * - Jiesa.findOne
 *
 * - Various bug checks
 */
 
var Jiesa = hAzzle.Jiesa,

    // Default document

    doc = this.document,

    documentIsHTML = hAzzle.documentIsHTML,

    push = Array.prototype.push,

    // Various regEx

    sibling = /[+~]/,

    quickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rtrim = /^[\x20\t\r\n\f]+|((?:^|[^\\])(?:\\.)*)[\x20\t\r\n\f]+$/g;

// Extend the Jiesa Object

hAzzle.extend({

    /**
     * Jiesa selector engine
     *
     * @param {String} selector
     * @param {String/Object/Array} context
     * @param {Array} results
     * @param {Boolean} single
     * @return {hAzzle}
     *
     * 'single' are used if we want to use
     * querySelector and not querySelectorAll
     */

    find: function(selector, context, results, /* INTERNAL */ single) {

        var quickMatch = quickExpr.exec(selector),
            nodeType;

        // Set correct document

        if ((context ? context.ownerDocument || context : doc) !== document) {
            // Overwrite if needed
            doc = hAzzle.setDocument(context);
        }

        context = context || doc;
        results = results || [];

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        // Activate QSA if 'single' {true}

        Jiesa.useNative = single ? true : false;

        if (documentIsHTML) {

            // Quick match

            if (quickMatch) {

                qM(selector, context, quickMatch);
            }

            // If querySelectorAll are activated, and not buggy,
            // existing, and no XML doc - use QSA. If not, fallback
            // to the internal selector engine 

            if (Jiesa.has['api-QSA'] && !Jiesa.has['bug-QSA']) {

                // Use 'querySelector' if single{true}, otherwise use 'querySelectorAll'
                return buggyQSA(context, selector, single ?
                    context.querySelector :
                    context.querySelectorAll);
            }
        }
       
	    // Run the parser

        return hAzzle.merge(results, Jiesa.parse(selector.replace(rtrim, "$1"), context));
    },

    /**
     * Find the first matched element by selector
     * @param {String} selector
     * @param {String/Object/Array} context
     * @return {hAzzle}
     */

    findOne: function(selector, context) {
        return this.find(selector, context, null, true);
    },

}, Jiesa);

// Do a quick match on the frequently used selectors

function qM(selector, context, quickMatch) {
    var results = [],
        m, elem;
    if ((m = quickMatch[1])) {
        if (context.nodeType === 9) {
            elem = context.getElementById(m);
            if (elem && elem.parentNode) {
                if (elem.id === m) {
                    results.push(elem);
                    return results;
                }
            } else {
                return results;
            }
        } else {

            if (context.ownerDocument && ((elem = context.ownerDocument.getElementById(m))) &&
                hAzzle.contains(context, elem) && elem.id === m) {
                results.push(elem);
                return results;
            }
        }

    // Tag

    } else if (quickMatch[2]) {
        push.apply(results, context.getElementsByTagName(selector));
        return results;

    // Class

    } else if (context.getElementsByClassName) {
        push.apply(results, context.getElementsByClassName(quickMatch[3]));
        return results;
    }
}

// Fixes buggy QSA
// Thanks to Andrew Dupont for the technique

var buggyQSA = function(context, selector, method) {

    var old = true,
        nid = "__hAzzle__";

    if (context !== doc) {

        old = context.getAttribute('id');

        if (old) {

            nid = old.replace(/'/g, "\\$&");

        } else {

            context.setAttribute('id', nid);
        }

        nid = "[id='" + nid + "'] ";

        context = sibling.test(selector) ? context.parentElement : context;
        selector = nid + selector.split(',').join(',' + nid);
    }

    try {

        return method.call(context, selector);

    } finally {

        if (!old) {

            context.removeAttribute("id");
        }
    }
};

// Expand to the global hAzzle object

hAzzle.find = Jiesa.find;
hAzzle.findOne = Jiesa.findOne;

// Boolean true / false
// If 'true', QSA got activated

hAzzle.useNative = Jiesa.useNative = false;