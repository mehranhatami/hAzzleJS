var win = this,
    winDoc = win.document,
    contains,
    docElem = winDoc.documentElement,
    setDocument,
    contains,
    native = /^[^{]+\{\s*\[native \w/,

    indexOf = Array.prototype.indexOf,

    MAX_NEGATIVE = 1 << 31,
    expando = 'hAzzle' + Math.random() + '-kf',

    ElemProto = (win.Element || win.Node || win.HTMLElement).prototype,

    matches,

    hasDuplicate,

    sortOrder = function (a, b) {
        if (a === b) {
            hasDuplicate = true;
        }
        return 0;
    },

    // Core methods for DOM

    domCore = {

        'api-stableSort': expando.split("").sort(sortOrder).join("") === expando,
        'api-sortInput': false,
        'bug-detectDuplicates': !!hasDuplicate,
    },

    // Set up Jiesa - the selector engine

    Jiesa = {

        version: '0.0.3d',

        sortOrder: sortOrder,

        has: {

            // Detect if the browser supports classList
            'api-classList': !!winDoc.documentElement.classList,

            // Feature detect if the browser supports QSA

            'api-QSA': !!winDoc.querySelectorAll,

            // Feature detect if the browser supports MatchesSelector

            'api-mS': native.test((matches = ElemProto.matches ||
                ElemProto.webkitMatchesSelector ||
                ElemProto.mozMatchesSelector ||
                ElemProto.oMatchesSelector ||
                ElemProto.msMatchesSelector)),

            'sort-bug': hAzzle.assert(function (div1) {
                // Should return 1, but returns 4 (following)
                return div1.compareDocumentPosition(document.createElement("div")) & 1;
            })
        }
    };

// Convert elements / window arguments to document. if document cannot be extrapolated, the function returns.

var setDocument = hAzzle.setDocument = function (node) {

    var doc = node ? node.ownerDocument || node : winDoc,
        parent = doc.defaultView;

    // If no document and documentElement is available, return

    if (doc === document || doc.nodeType !== 9 || !hAzzle.docElem) {

        return document;
    }

    // set the new document

    winDoc = document = doc;

    // Set correct documentElement for hAzzle to use

    docElem = doc.documentElement;
    alert(docElem);
    // Checks if this is an XML or HTML doc
    // If XML doc, set to false, else keep it's original value

    hAzzle.documentIsHTML = !hAzzle.isXML(doc);

    // Quick iFrame check

    if (parent && parent !== parent.top) {

        parent.addEventListener("unload", function () {

            setDocument();

        }, false);
    }

    sortOrder = native.test(docElem.compareDocumentPosition) ?
        function (a, b) {

            // Flag for duplicate removal
            if (a === b) {
                hasDuplicate = true;
                return 0;
            }

            // Sort on method existence if only one input has compareDocumentPosition
            var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
            if (compare) {
                return compare;
            }

            // Calculate position if both inputs belong to the same document
            compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
                a.compareDocumentPosition(b) :

                // Otherwise we know they are disconnected
                1;

            // Disconnected nodes
            if (compare & 1 ||
                (!Jiesa.has['sort-bug'] && b.compareDocumentPosition(a) === compare)) {

                // Choose the first element that is related to our preferred document
                if (a === doc || a.ownerDocument === winDoc && contains(winDoc, a)) {
                    return -1;
                }
                if (b === doc || b.ownerDocument === winDoc && contains(winDoc, b)) {
                    return 1;
                }

                // Maintain original order
                return domCore['api-sortInput'] ?
                    (indexOf.call(domCore['api-sortInput'], a) - indexOf.call(domCore['api-sortInput'], b)) :
                    0;
            }

            return compare & 4 ? -1 : 1;
        } :
        function (a, b) {
            // Exit early if the nodes are identical
            if (a === b) {
                hasDuplicate = true;
                return 0;
            }

            var cur,
                i = 0,
                aup = a.parentNode,
                bup = b.parentNode,
                ap = [a],
                bp = [b];

            // Parentless nodes are either documents or disconnected
            if (!aup || !bup) {
                return a === doc ? -1 :
                    b === doc ? 1 :
                    aup ? -1 :
                    bup ? 1 :
                    domCore['api-sortInput'] ?
                    (indexOf.call(domCore['api-sortInput'], a) - indexOf.call(domCore['api-sortInput'], b)) :
                    0;

                // If the nodes are siblings, we can do a quick check
            } else if (aup === bup) {
                return siblingCheck(a, b);
            }

            // Otherwise we need full lists of their ancestors for comparison
            cur = a;
            while ((cur = cur.parentNode)) {
                ap.unshift(cur);
            }
            cur = b;
            while ((cur = cur.parentNode)) {
                bp.unshift(cur);
            }

            // Walk down the tree looking for a discrepancy
            while (ap[i] === bp[i]) {
                i++;
            }

            return i ?
                // Do a sibling check if the nodes have a common ancestor
                siblingCheck(ap[i], bp[i]) :

                // Otherwise nodes in our document sort first
                ap[i] === winDoc ? -1 :
                bp[i] === winDoc ? 1 :
                0;
        };


    // Return the document

    return doc;
};


// Set correct document

winDoc = hAzzle.setDocument();


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
    div.appendChild(winDoc.createComment(''));
    return div.getElementsByTagName('*').length > 0;
});

/**
 * Check for getElementById bug
 * Support: IE<10
 */
Jiesa.has["bug-GEBI"] = hAzzle.assert(function (div) {
    hAzzle.docElem.appendChild(div).id = expando;
    return winDoc.getElementsByName > 0 || winDoc.getElementsByName(expando).length;
});


/**
 * Check if an element contains another element
 *
 * docElem are called from here, because at this point it can have been
 * overwritten by setDocument()
 *
 */

contains = native.test(docElem.compareDocumentPosition) || native.test(docElem.contains) ? function (a, b) {

    var adown,
        bup = b && b.parentNode;

    if (a.nodeType === 9) {

        adown = a.documentElement;

    } else {

        adown = a;
    }

    return a === bup || !!(bup && bup.nodeType === 1 && (
        adown.contains ?
        adown.contains(bup) :
        a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
    ));
} : function (a, b) {

    if (b) {
        while ((b = b.parentElement)) {
            if (b === a) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Check if element is inside of context
 *
 * @param {Object} context
 * @param {Object} elem
 * @return {Boolean}
 */
hAzzle.contains = function (context, elem) {
    // Set document vars if needed
    if ((context.ownerDocument || context) !== document) {
        setDocument(context);
    }
    return contains(context, elem);
};

// Initialize against the default document




/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck(a, b) {
    var cur = b && a,
        diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
        (~b.sourceIndex || MAX_NEGATIVE) -
        (~a.sourceIndex || MAX_NEGATIVE);

    // Use IE sourceIndex if available on both nodes
    if (diff) {
        return diff;
    }

    // Check if b follows a
    if (cur) {
        while ((cur = cur.nextSibling)) {
            if (cur === b) {
                return -1;
            }
        }
    }

    return a ? 1 : -1;
}

/* =========================== EXTEND JIESA ========================== */

hAzzle.extend({
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

}, Jiesa);


/* =========================== GLOBAL FUNCTIONS ========================== */

hAzzle.docElem = docElem;
hAzzle.expando = expando;
hAzzle.Jiesa = Jiesa;
hAzzle.unique = function (results) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0,
        apis = domCore['api-sortInput'];

    // Unless we *know* we can detect duplicates, assume their presence
    hasDuplicate = !domCore['bug-detectDuplicates'];

    results.sort(sortOrder);

    if (hasDuplicate) {
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