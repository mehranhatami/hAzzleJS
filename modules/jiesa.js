/**
 * Jiesa selector engine
 *
 * Contains:
 *
 * - Jiesa selector engine
 *
 * - Various bug checks
 */
var win = this,

    Jiesa = hAzzle.Jiesa,

    // Default document

    doc = win.document,

    // Expando

    expando = "hAzzle" + -(new Date()),

    push = Array.prototype.push,

    // Various regEx we will need

    sibling = /[+~]/,

    escaped = /'|\\/g,

    quickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rtrim = /^[\x20\t\r\n\f]+|((?:^|[^\\])(?:\\.)*)[\x20\t\r\n\f]+$/g;

// Set up Jiesa

hAzzle.extend({

    version: '0.0.2a',

    has: {

        // Feature detect if the browser supports QSA

        'api-QSA': !!doc.querySelectorAll,

    },

    cache: {}

}, Jiesa);

// Feature / Bug detection

// QSA supported, test for bugs

Jiesa.has['bug-QSA'] = Jiesa.has['api-QSA'] ? hAzzle.assert(function (div) {
    div.innerHTML = "<p class='QsA'>Jiesa</p>";
    return div.querySelectorAll(".QsA").length === 0;
}) : false

/**
 * Check if getElementsByTagName ("*") returns only elements
 */

Jiesa.has["bug-GEBTN"] = hAzzle.assert(function (div) {
    div.appendChild(doc.createComment(''));
    return div.getElementsByTagName('*').length > 0;
});

/**
 * Check for getElementById bug
 * Support: IE<10
 */
Jiesa.has["bug-GEBI"] = hAzzle.assert(function (div) {
    hAzzle.docElem.appendChild(div).id = expando;
    return doc.getElementsByName > 0 || doc.getElementsByName(expando).length;
});

/**
 * Support testing using an element
 * @param {Function} fn
 */


// Extend Jiesa

hAzzle.extend({

    /**
     * Jiesa selector engine
     *
     * @param {String} selector
     * @param {String/Object/Array}	context
     * @param {Array} results
     * @param {Boolean} single
     * @return {hAzzle}
     *
     * 'single' are used if we want to use
     * querySelector and not querySelectorAll
     */

    find: function (selector, context, results, /* INTERNAL */ single) {

        var elem, quickMatch = quickExpr.exec(selector),
            m, nodeType;

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

        if (hAzzle.documentIsHTML) {

            if (quickMatch) {

                if ((m = quickMatch[1])) {
                    if (nodeType === 9) {
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

                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
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

            // If querySelectorAll are activated, and not buggy,
            // existing, and not XML doc,
            // we can use QSA. If not, we fallback
            // to our internal selector engine

            if (Jiesa.useNative && Jiesa.has['api-QSA'] && !Jiesa.has['bug-QSA']) {

                var old = true,
                    nid = expando;

                if (context !== doc) {

                    // Thanks to Andrew Dupont for the technique

                    old = context.getAttribute('id');

                    if (old) {

                        nid = old.replace(escaped, '\\$&');

                    } else {

                        context.setAttribute('id', nid);
                    }

                    nid = "[id='" + nid + "'] ";

                    context = sibling.test(selector) ? context.parentElement : context;
                    selector = nid + selector.split(',').join(',' + nid);
                }

                try {

                    // Use 'querySelector' if single{true}, otherwise use 'querySelectorAll'

                    if (single) {

                        return [context.querySelector(selector)];

                    } else {

                        push.apply(results, context.querySelectorAll(selector));
                        return results;
                    }

                } finally {

                    if (!old) {

                        context.removeAttribute("id");
                    }
                }
            }
        }
        // Run the parser

        return hAzzle.merge(results, Jiesa.parse(selector.replace(rtrim, "$1"), context));
    },

    /**
     * Find the first matched element by css selector
     * @param {String} selector
     * @param {String/Object/Array}	context
     * @return {hAzzle}
     */
    findOne: function (selector, context) {
        return this.find(selector, context, null, true);
    }

}, Jiesa);

// Expost to the globale hAzzle object

hAzzle.find = Jiesa.find;
hAzzle.findOne = Jiesa.findOne;

// Boolean true / false
// If 'true', QSA got activated

hAzzle.useNative = Jiesa.useNative = false;