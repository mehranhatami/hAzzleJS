// trigger.js

var doc = this.document,
    focusinoutblur = /^(?:focusinfocus|focusoutblur)$/;

// Extend hAzzle.event

hAzzle.event.trigger = function(evt, data, elem, handlers) {
    var i, cur, tmp, bubbleType, ontype, handle, special,
        eventPath = [elem || doc],
        type = callType(evt),
        namespaces = callNamespaces(evt);

    cur = tmp = elem = elem || doc;

    // Check if valid type

    if (!validity(elem, type)) {
        return;
    }

    // Check for namespace

    if (hAzzle.inArray(type, '.') >= 0) {
        namespaces = type.split('.');
        type = namespaces.shift();
        namespaces.sort();
    }
    ontype = type.indexOf(':') < 0 && 'on' + type;


    evt = getEvent(elem, evt, handlers, namespaces, type);

    data = data === null ? [evt] : hAzzle.mergeArray(data, [evt]);

    special = hAzzle.event.special[type] || {};

    // Check for valid handlers

    if (!validHandlers(elem, handlers, data, special)) {
        return;
    }

    if (!handlers && !special.noBubble && !hAzzle.isWindow(elem)) {

        bubbleType = special.delegateType || type;

        cur = getCur(cur, type, bubbleType);

        for (; cur; cur = cur.parentElement) {

            eventPath.push(cur);
            tmp = cur;
        }

        if (tmp === getDocument(elem)) {
            eventPath.push(tmp.defaultView || tmp.parentWindow || window);
        }
    }

    // Fire handlers on the event path
    i = 0;

    while ((cur = eventPath[i++]) && !evt.isPropagationStopped()) {

        evt.type = i > 1 ?
            bubbleType :
            special.bindType || type;

        // Get the hAzzle handler

        handle = getHandler(cur, evt);

        // If handler exist, 'apply' data to it

        if (handle) {

            handle.apply(cur, data);
        }

        // Native handler

        handle = ontype && cur[ontype];

        if (handle && handle.apply && hAzzle.legalTypes(cur)) {

            evt.result = handle.apply(cur, data);

            if (evt.result === false) {

                evt.preventDefault();
            }
        }
    }
    evt.type = type;

    // If nobody prevented the default action, do it now

    if (!handlers && !evt.isDefaultPrevented()) {

        if ((!special._default || special._default.apply(eventPath.pop(), data) === false) &&

            hAzzle.legalTypes(elem)) {

            if (ontype && hAzzle.isFunction(elem[type]) && !hAzzle.isWindow(elem)) {

                tmp = elem[ontype];

                if (tmp) {
                    elem[ontype] = null;
                }

                hAzzle.event.triggered = type;
                elem[type]();
                hAzzle.event.triggered = undefined;

                if (tmp) {

                    elem[ontype] = tmp;
                }
            }
        }
    }

    return evt.result;
};

/* ============================ UTILITY METHODS =========================== */


// Check for valid nodeType, and not triggered before

function validity(elem, type) {
    if ((elem.nodeType === 3 || elem.nodeType === 8) ||
        focusinoutblur.test(type + hAzzle.event.triggered)) {
        return false;
    }
    return true;
}

// Call for event type

function callType(evt) {
    return hAzzle.hasOwn.call(evt, 'type') ? evt.type : evt;
}

// Call for namespaces

function callNamespaces(evt) {
    return hAzzle.hasOwn.call(evt, 'namespace') ? evt.namespace.split('.') : [];
}

// Call for current element

function getCur(cur, type, bubbleType) {
    if (!focusinoutblur.test(bubbleType + type)) {
        return cur.parentElement;
    }
    return cur;
}

/**
 * Get correct 'event' for the trigger() function
 *
 * @param {Object} elem
 * @param {String} evt
 * @param {Function|Undefined} handler
 * @param {Object|Undefined} ns
 * @param {String} type
 * @return {Object}
 */

function getEvent(elem, evt, handler, ns, type) {

    evt = evt[hAzzle.expando] ? evt : new hAzzle.Event(type, typeof evt === 'object' && evt);
    evt.isTrigger = handler ? 2 : 3;
    evt.namespace = ns.join('.');
    evt.namespace_re = evt.namespace ? newNS(ns) : null;
    evt.result = undefined;

    if (!evt.target) {
        evt.target = evt.srcElement || elem;
    }

    return evt;
}

// Check for valid handlers

function validHandlers(elem, fn, data, special) {
    if (!fn && special.trigger &&
        special.trigger.apply(elem, data) === false) {
        return false;
    }
    return true;
}

// Get document from element

function getDocument(elem) {
    return (elem.ownerDocument || doc);
}

// Create new namespace

function newNS(ns) {
    return new RegExp('(^|\\.)' + ns.join('\\.(?:.*\\.|)') + '(\\.|$)');
}

// Get event handler

function getHandler(cur, evt) {
    return (hAzzle.getPrivate(cur, 'events') || {})[evt.type] &&
        hAzzle.getPrivate(cur, 'handle');
}