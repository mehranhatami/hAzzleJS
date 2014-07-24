/*!
 * Clone DOM nodes
 *
 * Supports:
 *
 * - data cloning
 * - event cloning
 */

/* ============================ FEATURE / BUG DETECTION =========================== */

var rcheckableType = /^(?:checkbox|radio)$/i,

    // Support: IE<=11+
    // Make sure textarea (and checkbox) defaultValue is properly cloned

    noCC = hAzzle.assert(function (div) {

        var fragment = document.createDocumentFragment(),
            d = fragment.appendChild(div);

        d.innerHTML = "<textarea>x</textarea>";
        return !!div.cloneNode(true).lastChild.defaultValue;
    });

/* ============================ GLOBAL FUNCTIONS =========================== */

hAzzle.cloneNode = function (elem, shallow, deep) {

    var i, l, srcElements, destElements,
        clone = elem.cloneNode(true),
        nType = elem.nodeType;

    if (!noCC && (nType === 1 || nType === 11) &&
        !hAzzle.isXML(elem)) {

        destElements = grab(clone);
        srcElements = grab(elem);

        for (i = 0, l = srcElements.length; i < l; i++) {
            fixInput(srcElements[i], destElements[i]);
        }
    }

    if (shallow) {

        if (deep) {

            srcElements = srcElements || grab(elem);
            destElements = destElements || grab(clone);

            for (i = 0, l = srcElements.length; i < l; i++) {

                cloneCopyEvent(srcElements[i], destElements[i]);
            }

        } else {
            cloneCopyEvent(elem, clone);
        }
    }

    // Return the cloned set
    return clone;
};

/* ============================ CORE FUNCTIONS =========================== */

hAzzle.Core.clone = function (shallow, deep) {
    shallow = shallow === null ? false : shallow;
    deep = deep === null ? shallow : deep;
    return this.twist(function (el) {
        return hAzzle.cloneNode(el, shallow, deep);
    });
};

/* ============================ PRIVATE FUNCTIONS =========================== */

// Clone and copy events

function cloneCopyEvent(src, dest) {
    var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

    if (dest.nodeType !== 1) {
        return;
    }

    if (hAzzle.data(src)) {

        pdataOld = hAzzle.data(src);
        pdataCur = hAzzle.data(dest, pdataOld);

        events = pdataOld.events;

        if (events) {
            delete pdataCur.handle;
            pdataCur.events = {};

            for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                    hAzzle.event.add(dest, type, events[type][i]);
                }
            }
        }
    }
    if (hAzzle.hasData(src)) {
        udataOld = hAzzle.data(src);
        udataCur = hAzzle.shallowCopy({}, udataOld);
        hAzzle.data(dest, udataCur);
    }
}

// Grab childnodes

function grab(context) {
    return hAzzle.merge([context], hAzzle.find('*', context));
}

// Fix the input

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