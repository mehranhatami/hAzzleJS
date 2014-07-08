/**
 * Jiesa selector engine
 *
 * Contains:
 *
 * - Jiesa selector engine
 * - Jiesa.findOne
 * - Jiesa.matchesSelector 
 *
 * - Various bug checks
 */
 
var win = this,

    Jiesa = hAzzle.Jiesa,

    // Default document

    doc = win.document,

    docElem = hAzzle.docElem,

    documentIsHTML = hAzzle.documentIsHTML,

    matches,

    // Expando

    expando = "hAzzle" + -(new Date()),

    push = Array.prototype.push,

    // Various regEx

    sibling = /[+~]/,

    escaped = /'|\\/g,

    native = /^[^{]+\{\s*\[native \w/,

    quickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rtrim = /^[\x20\t\r\n\f]+|((?:^|[^\\])(?:\\.)*)[\x20\t\r\n\f]+$/g,

    quotes = /=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g;

// Set up Jiesa

hAzzle.extend({

    version: '0.0.2b',

    has: {

        // Feature detect if the browser supports QSA

        'api-QSA': !!doc.querySelectorAll,

        // Feature detect if the browser supports MatchesSelector

        'api-mS': native.test((matches = docElem.matches ||
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector))
    }

}, Jiesa);

// Feature / Bug detection

// QSA supported, test for bugs

Jiesa.has['bug-QSA'] = Jiesa.has['api-QSA'] ? hAzzle.assert(function (div) {
    div.innerHTML = "<p class='QsA'>Jiesa</p>";
    return div.querySelectorAll(".QsA").length === 0 ? false :
        // Check for broken :checked pseudo in Webkit/Opera
        !div.querySelectorAll(":checked").length ? false : true;
}) : false;

// matchesSelector supported, test for bugs

Jiesa.has['bug-mS'] = Jiesa.has['api-mS'] ? hAzzle.assert(function (div) {

    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    return matches.call(div, "div") ? false :
        // This should fail with an exception
        // Gecko does not error, returns false instead
        matches.call(div, "[s!='']:x") ? false : true;
}) : false;

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

        if (documentIsHTML) {

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
            // existing, and no XML doc - use QSA. If not, fallback
            // to the internal selector engine 

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
     * Find the first matched element by selector
     * @param {String} selector
     * @param {String/Object/Array}	context
     * @return {hAzzle}
     */

    findOne: function (selector, context) {
        return this.find(selector, context, null, true);
    },

    /**
     * Find element matched by selector
     * @param {String} selector
     * @param {Object}	elem
     * @return {Boolean}
     */

    matchesSelector: function (elem, selector) {

        // Set correct document

        if ((elem ? elem.ownerDocument || elem : doc) !== document) {
            // Overwrite if needed
            doc = hAzzle.setDocument(elem);
        }

        // Make sure that attribute selectors are quoted

        selector = selector.replace(quotes, "='$1']");

        // If matchesSelector support

        if (Jiesa.has['api-mS'] && documentIsHTML) {

            // disconnected nodes are said to be in a document fragment in IE 9

            if (Jiesa.has['bug-mS'] || elem.doc && elem.doc.nodeType !== 11) {


                return matches.call(elem, selector);

            } else {

                checkParent(elem);
                return matches.call(elem, selector);
            }

        } else {

            // append to fragment if no parent

            checkParent(elem);

            // match elem with all selected elems of parent

            var els = elem.parentNode.querySelectorAll(selector),
                i = 0,
                len = els.length;

            // Do a quick loop

            for (; i < len; i++) {

                // return true if match

                if (els[i] === elem) {

                    return true;
                }
            }

            // otherwise return false
            return false;
        }
    }

}, Jiesa);


/**
 * Append to fragment
 */

function checkParent(elem) {

    // not needed if already has parent

    if (elem.parentNode) {

        return;
    }

    var fragment = document.createDocumentFragment();

    fragment.appendChild(elem);
    return fragment;
}

// Expost to the globale hAzzle object

hAzzle.find = Jiesa.find;
hAzzle.findOne = Jiesa.findOne;
hAzzle.matchesSelector = Jiesa.matchesSelector;

// Boolean true / false
// If 'true', QSA got activated

hAzzle.useNative = Jiesa.useNative = false;