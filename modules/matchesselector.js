/**
 * Checks for support for matchesSelector, with
 * fallback to QSA
 */
var win = this,
    doc = win.document,
    proto = Element.prototype,
    mS = proto.matches ||
    proto.webkitMatchesSelector ||
    proto.mozMatchesSelector ||
    proto.msMatchesSelector ||
    proto.oMatchesSelector;

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

hAzzle.supportsOrphans = assert(function (div) {
    return mS.call(div, 'div');
});

/** Expand matchesSelector to the global
 *  hAzzle object
 */

hAzzle.matchesSelector = function (elem, selector) {

    // If matchesSelector support

    if (mS) {

        // disconnected nodes are said to be in a document fragment in IE 9

        if (hAzzle.supportsOrphans || elem.doc && elem.doc.nodeType !== 11) {

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