/*!
 * Clone DOM nodes
 *
 * Supports:
 *
 * - data cloning
 * - event cloning
 */
var rcheckableType = /^(?:checkbox|radio)$/i;

/**
 * Helper function for cloning select and textareas e.g.
 */

function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();
    // checkbox / radio
    if (nodeName === 'input' && rcheckableType.test(src.type)) {
        dest.checked = src.checked;
        // textarea
    } else if (nodeName === 'input' || 'textarea' === nodeName) {
        dest.defaultValue = src.defaultValue;
    }
}

hAzzle.cloneNode = function (el, deep) {

    if (!el) {

        return;
    }

    var c = el.cloneNode(deep || true),
        cloneElems, elElems;

    hAzzle(c).cloneEvents(el);

    // Copy the events from the original to the clone
    // We could have used Jiesa.parse() here,
    // but we don't know if native QSA are used
    // or not. 

    cloneElems = hAzzle.select('*', c);
    elElems = hAzzle.select('*', el);

    var i = 0,
        len = elElems.length;

    // Copy Events

    for (; i < len; i++) {

        hAzzle(cloneElems[i]).cloneEvents(elElems[i]);
    }
    // hAzzle.documentIsHTML are not helping us here
    // we need to check directly with current DOM node
    // This also fixes the IE cloning issues

    if (!hAzzle.features.noCloneChecked && el.nodeType === 1 || el.nodeType === 11 && hAzzle.hAzzle.isXML(el)) {

        for (; i < len; i++) {

            fixInput(elElems[i], cloneElems[i]);
        }

    } else {

        // Clone job done! Copy radio, checkbox and textarea if any...

        var cloneTextareas = hAzzle.select('textarea', c),
            elTextareas = hAzzle.select('textarea', el),
            a = 0,
            b = elTextareas.length;

        // Copy over the cloned elements data

        for (; a < b; ++a) {

            hAzzle(cloneTextareas[b]).val(hAzzle(elTextareas[b]).val());
        }
    }

    // Return the cloned set

    return c;
};

// Extend the hAzzle Core
hAzzle.Core['clone'] = function (deep) {
    return this.twist(function (el) {
        return hAzzle.cloneNode(el, deep);
    });
};