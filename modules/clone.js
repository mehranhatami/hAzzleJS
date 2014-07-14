/*!
 * Clone DOM nodes
 *
 * Supports:
 *
 * - data cloning
 * - event cloning
 */
var rcheckableType = /^(?:checkbox|radio)$/i,

    // Support: IE<=11+
    // Make sure textarea (and checkbox) defaultValue is properly cloned

    noCC = hAzzle.assert(function (div) {

        var fragment = document.createDocumentFragment(),
            d = fragment.appendChild(div);

        d.innerHTML = "<textarea>x</textarea>";
        return !!div.cloneNode(true).lastChild.defaultValue;
    });

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

    cloneElems = hAzzle.find('*', c);
    elElems = hAzzle.find('*', el);

    var i = 0,
        len = elElems.length;

    // Copy Events

    for (; i < len; i++) {

        hAzzle(cloneElems[i]).cloneEvents(elElems[i]);
    }
    // hAzzle.documentIsHTML are not helping us here
    // we need to check directly with current DOM node
    // This also fixes the IE cloning issues

    if (!noCC && el.nodeType === 1 || el.nodeType === 11 && hAzzle.isXML(el)) {

        for (; i < len; i++) {

            fixInput(elElems[i], cloneElems[i]);
        }

    } else {

        // Clone job done! Clone the textarea if it exist...

        var cloneTextareas = hAzzle.find('textarea', c),
            elTextareas = hAzzle.find('textarea', el),
            a = 0,
            b = elTextareas.length;

        // Copy over textarea content

        if (b) {

            for (; a < b; ++a) {

                hAzzle(cloneTextareas[b]).val(hAzzle(elTextareas[b]).val());
            }
        }
    }

    // Return the cloned set

    return c;
};

// Extend the hAzzle Core
hAzzle.Core.clone = function (deep) {
    return this.twist(function (el) {
        return hAzzle.cloneNode(el, deep);
    });
};