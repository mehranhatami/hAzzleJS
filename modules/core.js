var winDoc = this.document,
    docElem = winDoc.documentElement,
    setDocument,
    contains,
    cnative = /^[^{]+\{\s*\[native \w/,

    indexOf = Array.prototype.indexOf,

    me = 1 << 31,

    hasDuplicate,

    sortOrder = function(a, b) {
        if (a === b) {
            hasDuplicate = true;
        }
        return 0;
    };

hAzzle.features['api-stableSort'] = hAzzle.expando.split("").sort(sortOrder).join("") === hAzzle.expando;
hAzzle.features['api-sortInput'] = false;
hAzzle.features['bug-detectDuplicates'] = !!hasDuplicate;
hAzzle.features['sortOrder'] = sortOrder;
hAzzle.features['sort-bug'] = hAzzle.assert(function(div1) {
    // Should return 1, but returns 4 (following)
    return div1.compareDocumentPosition(document.createElement('div')) & 1;
});

// Convert elements / window arguments to document. if document cannot be extrapolated, the function returns.

var setDocument = hAzzle.setDocument = function(node) {

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

    // Checks if this is an XML or HTML doc
    // If XML doc, set to false, else keep it's original value

    hAzzle.documentIsHTML = !hAzzle.isXML(doc);

    // Quick iFrame check

    if (parent && parent !== parent.top) {

        parent.addEventListener("unload", function() {

            setDocument();

        }, false);
    }

    // Return the document

    return doc;
};

// Set correct document

winDoc = setDocument();

/**
 * Check if an element contains another element
 *
 * docElem are called from here, because at this point it can have been
 * overwritten by setDocument()
 *
 */

contains = (docElem.contains || docElem.compareDocumentPosition) ? function(parent, node) {

    var adown, bup = node && node.parentNode;

    if (parent.nodeType === 9) {

        adown = parent.documentElement;

    } else {

        adown = parent;
    }

    return parent === bup || !!(bup && bup.nodeType === 1 && (
        adown.contains ?
        adown.contains(bup) :
        parent.compareDocumentPosition && parent.compareDocumentPosition(bup) & 16
    ));
} : function(parent, node) {
    while (node && (node = node.parentNode))
        if (node === parent) {
            return true;
        }
    return false;
};

// Sort

hAzzle.features.sortOrder = sortOrder = cnative.test(docElem.compareDocumentPosition) ?

    function(a, b) {

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
            (!hAzzle.features['sort-bug'] && b.compareDocumentPosition(a) === compare)) {

            // Choose the first element that is related to our preferred document
            if (a === winDoc || a.ownerDocument === winDoc && contains(winDoc, a)) {
                return -1;
            }
            if (b === winDoc || b.ownerDocument === winDoc && contains(winDoc, b)) {
                return 1;
            }

            // Maintain original order
            return hAzzle.features['api-sortInput'] ?
                (indexOf.call(hAzzle.features['api-sortInput'], a) - indexOf.call(hAzzle.features['api-sortInput'], b)) :
                0;
        }

        return compare & 4 ? -1 : 1;
    } :
    function(a, b) {
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
            return a === winDoc ? -1 :
                b === winDoc ? 1 :
                aup ? -1 :
                bup ? 1 :
                hAzzle.features['api-sortInput'] ?
                (indexOf.call(hAzzle.features['api-sortInput'], a) - indexOf.call(hAzzle.features['api-sortInput'], b)) :
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

/**
 * Check if element is inside of context
 *
 * @param {Object} context
 * @param {Object} elem
 * @return {Boolean}
 */
hAzzle.contains = function(context, elem) {
    // Set document vars if needed
    if ((context.ownerDocument || context) !== document) {
        setDocument(context);
    }
    return contains(context, elem);
};

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck(a, b) {
    var cur = b && a,
        diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
        (~b.sourceIndex || me) -
        (~a.sourceIndex || me);

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

/* =========================== GLOBAL FUNCTIONS ========================== */

hAzzle.docElem = docElem;

hAzzle.unique = function(results) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0,
        apis = hAzzle.features['api-sortInput'];

    // Unless we *know* we can detect duplicates, assume their presence
    hasDuplicate = !hAzzle.features['bug-detectDuplicates'];

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