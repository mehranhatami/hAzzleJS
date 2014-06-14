/**
 * Checks for support for matchesSelector, with
 * fallback to QSA
 */
var win = this,
    doc = win.document,
    proto = Element.prototype,
    mS;

/**
 * Vendor function.
 */

var mS = proto.matches || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;

/**
 * Check for matches
 */

function match(elem, selector) {

    return mS.call(elem, selector);
}

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

/**
 * We have to fall back to QSA if
 * matchesSelector not supported e.g ie 9
 */

function query(elem, selector) {

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

/**
 *  Check if there is an match with the child nodes
 */

function matchChild(elem, selector) {

    checkParent(elem);
    return match(elem, selector);
}

/** Expand matchesSelector to the global
 *  hAzzle object
 */

if (mS) {

    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    var div = doc.createElement('div'),

        supportsOrphans = match(div, 'div');

    hAzzle.matchesSelector = supportsOrphans ? match : matchChild;

    if (div.parentNode) {
        div.parentNode.removeChild(div);
    }

    // Avoid memory leak

    div = null;

} else {

    // QSA
    hAzzle.matchesSelector = query;
}