/**
 * Core
 *
 * Core function for hAzzle and Jiesa selector engine.
 * Contains functions to sort DOM nodes, and
 * functions only for Jiesa
 */
var win = this,

    // Default document

    doc = win.document,

    // Expando

    expando = hAzzle.expando,

    ElemProto = (win.Element || win.Node || win.HTMLElement).prototype,

    matches,
	
	native = /^[^{]+\{\s*\[native \w/,

    push = Array.prototype.push,

    // Core methods for DOM

    domCore = {

        'api-stableSort': expando.split("").sort(sortOrder).join("") === expando,
        'api-sortInput': false
    },

    sortOrder = function (a, b) {
        // Flag for duplicate removal
        if (a === b) {

            domCore['api-sortInput'] = true;
            return 0;
        }

        var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);

        if (compare) {
            // Disconnected nodes
            if (compare & 1) {

                // Choose the first element that is related to our document
                if (a === doc || hAzzle.contains(doc, a)) {
                    return -1;
                }
                if (b === doc || hAzzle.contains(doc, b)) {
                    return 1;
                }

                // Maintain original order
                return 0;
            }

            return compare & 4 ? -1 : 1;
        }

        // Not directly comparable, sort on existence of method
        return a.compareDocumentPosition ? -1 : 1;
    };

/* =========================== SELECTOR ENGINE HOLDER ========================== */

var Jiesa = hAzzle.Jiesa = {

    sortOrder: sortOrder,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters

    whitespace: "[\\x20\\t\\r\\n\\f]",
    runescape: new RegExp("\\\\([\\da-f]{1,6}" + this.whitespace + "?|(" + this.whitespace + ")|.)", "ig"),
    funescape: function (_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        // Support: Firefox<24
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    }
};

// Expose Jiesa to the global hAzzle object

hAzzle.Jiesa = Jiesa;

/* =========================== UNIQUE SORT FUNCTION ========================== */

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */

hAzzle.unique = function (results) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0,
        apis = domCore['api-sortInput'];

    // Unless we *know* we can detect duplicates, assume their presence

    apis = !domCore['api-stableSort'] && results.slice(0);

    results.sort(sortOrder);

    if (apis) {
        while ((elem = results[i++])) {
            if (elem === results[i]) {
                j = duplicates.push(i);
            }
        }
        while (j--) {
            results.splice(duplicates[j], 1);
        }
    }

    apis = null;

    return results;
};

// Set up Jiesa

hAzzle.extend({

    version: '0.0.3c',

    has: {

        // Detect if the browser supports classList
        'api-classList': !!document.documentElement.classList,

        // Feature detect if the browser supports QSA

        'api-QSA': !!doc.querySelectorAll,

        // Feature detect if the browser supports MatchesSelector

        'api-mS': native.test((matches = ElemProto.matches ||
            ElemProto.webkitMatchesSelector ||
            ElemProto.mozMatchesSelector ||
            ElemProto.oMatchesSelector ||
            ElemProto.msMatchesSelector))
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