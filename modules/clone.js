/*!
 * Clone DOM nodes
 *
 * Supports:
 *
 * - data cloning
 * - event cloning
 */
 
var filterSpace = /\s+/gi,
    rcheckableType = /^(?:checkbox|radio)$/i;

/**
 * Clone events - copy events from an element to another
 *
 * @param {Object} source
 * @param {String} filter
 * @return {hAzzle}
 */

hAzzle.Core.cloneEvent = function(source, filter) {

        if (this.length && source && filter) {

            var eventList = getEventList(source, filter);

            // Wrap the hAzzle Object around the 'source' to gain
            // access to the Core.prototype if a 'string'

            if (typeof source === 'string') {

                source = hAzzle(source);
            }

            return this.each(hAzzle.proxy(copyEvent, this, eventList));
        }

        return this;
    },

    /**
     * Create a deep copy of the set of matched elements.
     *
     * @param {Boolean} shallow
     * @param {Boolean} deep
     * @return {hAzzle}
     *
     */

    hAzzle.Core.clone = function(shallow, deep) {

        if (shallow === null) {

            shallow = false;
        }

        if (deep === null) {

            deep = shallow;
        }

        return this.map(function() {
            return hAzzle.clone(this, shallow, deep);
        });
    };

/* ============================ PRIVATE FUNCTIONS =========================== */

function getEventList(source, filter) {

    var eventKey,

        // ShallowCopy the source eventList to avoid delete

        eventList = hAzzle.shallowCopy({}, hAzzle.private(source[0], 'events')),

        // Holder for selected events

        selectedEventList = {};

    if (filter && filter !== true) {

        selectedEventList = hAzzle.isArray(filter) ?
            filter :
            filter.replace(filterSpace, ' ').split(' ');

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

hAzzle.clone = function(elem, shallow, deep) {

    var i, l, srcElements, destElements,
        clone = elem.cloneNode(true),
        nType = elem.nodeType;

    if (!hAzzle.features['feature-cloneCheck'] && (nType === 1 || nType === 11) &&
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

                // Clone textareas and select elements

                cloneTextSel(srcElements[i], destElements[i]);

                // Clone Events

                cloneCopyEvent(srcElements[i], destElements[i]);
            }

        } else {

            // Clone textareas and select elements

            cloneTextSel(elem, clone);

            // Clone Events
            cloneCopyEvent(elem, clone);
        }
    }

    // Return the cloned set
    return clone;
}

function cloneTextSel(src, dest) {

    var i, j, l, m,

        // Textareas

        srcTextarea = hAzzle.find('textarea', src),
        destTextarea = hAzzle.find('textarea', dest),

        // Select

        srcSelects = hAzzle.find('select', src),
        destSelects = hAzzle.find('select', dest);

    i = srcTextarea.length;

    if (i) {
        while (i--) {

            hAzzle(destTextarea[i]).val(hAzzle(srcTextarea[i]).val());
        }
    }

    i = 0;
    l = srcSelects.length;

    if (l) {
        for (; i < l; ++i) {
            for (j = 0, m = srcSelects[i].options.length; j < m; ++j) {
                if (srcSelects[i].options[j].selected === true) {
                    destSelects[i].options[j].selected = true;
                }
            }
        }
    }
}

// Clone and copy events

function cloneCopyEvent(src, dest) {

    var i, l, type, dO, dC, udO, udC, events;

    if (dest.nodeType !== 1) {
        return;
    }

    if (hAzzle.hasPrivate(src)) {
        dO = hAzzle.private(src);
        dC = hAzzle.setPrivate(dest, dO);
        events = dO.events;

        if (events) {
            delete dC.handle;
            dC.events = {};

            for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                    hAzzle.event.add(dest, type, events[type][i]);
                }
            }
        }
    }

    if (hAzzle.hasData(src)) {
        udO = hAzzle.data(src);
        udC = hAzzle.shallowCopy({}, udO);
        hAzzle.setData(dest, udC);
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

