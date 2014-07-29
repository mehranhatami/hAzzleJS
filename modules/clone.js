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

    noCC = hAzzle.assert(function(div) {
        div.innerHTML = "<textarea>the unknown</textarea>";
        return !!div.cloneNode(true).firstChild.defaultValue;
    })

/* ============================ GLOBAL FUNCTIONS =========================== */

hAzzle.cloneNode = function(elem, shallow, deep) {

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

hAzzle.extend({

    /**
     * Clone events
     *
     * @param {Object} source
     * @param {String} filter
     *
     */
    cloneEvent: function(source, filter) {
        if (this.length) {
            var source = typeof source === 'string' ? hAzzle(source) : source,
                eventList = getEventList(source, filter);
            this.each(hAzzle.proxy(copyEvent, this, eventList));
        }

        return this;

    },

    clone: function(shallow, deep) {
        shallow = shallow === null ? false : shallow;
        deep = deep === null ? shallow : deep;
        return this.map(function() {
            return hAzzle.cloneNode(this, shallow, deep);
        });
    }
});


/* ============================ PRIVATE FUNCTIONS =========================== */

// Clone and copy events

function cloneCopyEvent(src, dest) {
    var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

    if (dest.nodeType !== 1) {
        return;
    }

    if (hAzzle.hasPrivate(src)) {
        pdataOld = hAzzle.private(src);
        pdataCur = hAzzle.setPrivate(dest, pdataOld);
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
        hAzzle.setData.set(dest, udataCur);
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

function getEventList(source, filter) {

    // Make a copy of source event list to avoid delete

    var eventKey, eventList = hAzzle.shallowCopy({}, hAzzle.private(source[0], 'events')),
        selectedEventList = {};

    if (filter && filter !== true) {
        selectedEventList = (filter instanceof Array) ?
            filter :
            filter.replace(/\s+/gi, ' ').split(' ');


        for (eventKey in eventList) {

            if (!eventList.hasOwnProperty(eventKey)) {

                continue;
            }

            if (selectedEventList.indexOf(eventKey) === -1) {

                eventList[eventKey] = null;

                delete eventList[eventKey];
            }
        }
    }

    return eventList;
}

/**
 * Copy events
 *
 * @param {Object} eventList
 */
 
function copyEvent(eventList) {

    if (!eventList) {

        return;
    }

    var eventKey, i;

    for (eventKey in eventList) {

        if (!eventList.hasOwnProperty(eventKey)) {

            continue;
        }

        i = eventList[eventKey].length;

        while (i--) {

            hAzzle.event.add(this[0], eventKey, eventList[eventKey][i]);
        }
    }
}