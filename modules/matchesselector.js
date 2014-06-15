/**
 * Checks for support for matchesSelector, with
 * fallback to QSA
 *
 * Note! All browsers supports matchesSelector
 * so this 'shim' are only for IE9.
 *
 * QSA can be buggy, but no in IE9, and we are
 * not using QSA in the selector engine, so we
 * avoid any problems.
 */
var win = this,
    doc = win.document,
    orphans,
    quotes = /=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g,
    mS = hAzzle.features.mS;

/**
 * Append to fragment
 */

function checkParent(elem) {

    // not needed if already has parent

    if (elem.parentNode) {
        return;
    }

    var fragment = doc.createDocumentFragment();

    fragment.appendChild(elem);
}

// IE9 supports matchesSelector, but doesn't work on orphaned elems
// check for that

orphans = hAzzle.supportsOrphans = assert(function (div) {
    return mS.call(div, 'div');
});


/** Expand matchesSelector / QSA to the global
 *  hAzzle object
 */

hAzzle.matchesSelector = function (elem, selector) {

    // Set document vars if needed

    if ((elem.ownerDocument || elem) !== document) {

        hAzzle.setDocument(elem);
    }

    selector = selector.replace(quotes, "='$1']");

    // If matchesSelector support

    if (mS && !!hAzzle.isXML(elem)) {

        // disconnected nodes are said to be in a document fragment in IE 9

        if (orphans || elem.doc && elem.doc.nodeType !== 11) {

            return mS.call(elem, selector);

        } else {

            checkParent(elem);
            return mS.call(elem, selector);
        }

    } else {

        // append to fragment if no parent

        checkParent(elem);

        // match elem with all selected elems of parent

        var elems = elem.parentNode.querySelectorAll(selector),
            i = 0,
            len = elems.length;

        // Do a quick loop

        for (; i < len; i++) {

            // return true if match

            if (elems[i] === elem) {

                return true;

            }
        }

        // otherwise return false
        return false;
    }
};