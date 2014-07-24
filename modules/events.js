/** 
 * events.js - hAzzle Event Manager
 *
 * Desktop browsers support:
 *
 *    Chrome 9+
 *    Safari 5.0+
 *    Firefox 16+
 *    Opera 15.0+
 *    Internet Explorer 9+
 *
 * Mobile browsers support:
 *
 *    Google Android 4.1+
 *    Apple iOS 6+
 *    ChromiumOS
 *    FirefoxOS
 *
 * Sources:
 *
 * - http://dean.edwards.name/weblog/2005/10/add-event/
 * - http://dean.edwards.name/weblog/2005/10/add-event2/
 * - http://stackoverflow.com/questions/4034742/understanding-dean-edwards-addevent-javascript
 * - https://github.com/dperini/nwevents/blob/master/src/nwevents.js
 * - jQuery
 */
var doc = this.document,
    expando = hAzzle.expando,
    inArray = hAzzle.inArray,
    Jiesa = hAzzle.Jiesa,
    whiteRegex = (/\S+/g),
    focusinoutblur = /^(?:focusinfocus|focusoutblur)$/,
    namespaceRegex = /^([^.]*)(?:\.(.+)|)$/,

    slice = Array.prototype.slice,

    // Public object for eventHooks

    eventHooks = hAzzle.eventHooks = {

        // Private object for special events / handlers

        special: {}
    },

    /**
     * Holder for eventCore
     * Kept in an isolated Object so we don't
     * expose it to the global scope
     *
     * Contains:
     *
     * - uniqueId
     * - feature / bug checks
     */

    eventCore = hAzzle.eventCore = {

        version: 'hAzzleEvents-0.45a',

        // A counter used to create unique IDs

        UID: 1,

        // Feature / bug detection

        has: {

            'api-bubbles': 'onfocusin' in window,
        },

        global: {},

        // Set unique ID for each handler

        setID: function () {

            return 'hEvt_' + eventCore.UID++;
        }
    };

// Expose to the global scope

hAzzle.bubbles = eventCore.has['api-bubbles'];

// hAzzle event

   
hAzzle.event = {

    /**
     * Add event to element.
     *
     * @param {Object} elem
     * @param {String|Object} types
     * @param {Function} handler
     * @param {String|Undefined} data
     * @param {String|Undefined} selector
     */

    add: function (elem, types, handler, data, selector) {

        var objHandler, eventHandler, tmp,
            special, handlers, type, namespaces, origType,
            eventData = hAzzle.data(elem),
            events,
            handleObj, t;

        if (!eventData) {
            return;
        }

        events = eventData.events;

        if (handler.handler) {
            objHandler = handler;
            handler = objHandler.handler;
            selector = objHandler.selector;
        }

        // Assign each event handler a unique ID

        if (!handler.guid) {

            handler.guid = eventCore.setID();
        }

        // Create a hash table of event types for the element

        if (!events) {

            events = eventData.events = {};
        }

        // Create a hash table of event handlers for each element/event pair

        if (!(eventHandler = eventData.handle)) {

            eventHandler = eventData.handle = Listener();
        }

        // Get multiple events

        types = getTypes(types);

        t = types.length;

        while (t--) {

            // event type	

            tmp = namespaceRegex.exec(types[t]) || [];
            type = origType = tmp[1];
            namespaces = (tmp[2] || '').split('.').sort();

            // There *must* be a type, no attaching namespace-only handlers

            if (!type) {

                continue;
            }

            special = eventHooks.special[type] || {};

            type = (selector ? special.delegateType : special.bindType) || type;

            special = eventHooks.special[type] || {};

            // Take a shallowCopy of the object

            handleObj = hAzzle.shallowCopy({
                type: type,
                origType: origType,
                data: data,
                handler: handler,
                guid: handler.guid,
                selector: selector,
                needsContext: selector && Jiesa.regex.changer.test(selector),
                namespace: namespaces.join('.')
            }, objHandler);

            // Init the event handler queue if we're the first

            handlers = events[type];

            if (!handlers) {
                handlers = events[type] = [];
                handlers.delegateCount = 0;

                if (!special.setup ||
                    special.setup.call(elem, data, namespaces, eventHandler) === false) {

                    // Add the listener

                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandler, false);
                    }
                }
            }

            if (special.add) {

                special.add.call(elem, handleObj);

                if (!handleObj.handler.guid) {

                    handleObj.handler.guid = handler.guid;
                }
            }

            if (selector) {

                handlers.splice(handlers.delegateCount++, 0, handleObj);

            } else {

                handlers.push(handleObj);
            }

            eventCore.global[type] = true;
        }

    },

    /**
     * Remove an event handler.
     *
     * @param {Object} elem
     * @param {String} types
     * @param {Function} handler
     * @param {String} selector
     * @param {String} mt
     * @param {Function} fn
     *
     */

    remove: function (elem, types, handler, selector, mt) {

        var j, origCount, tmp,
            events, t, handleObj,
            special, handlers, type, namespaces, origType,
            eventData = hAzzle.hasData(elem) && hAzzle.data(elem);

        // If no data exist on the object, save it

        if (hAzzle.hasData(elem)) {

            eventData = hAzzle.data(elem);
        }

        if (!eventData || !(events = eventData.events)) {
            return;
        }

        // Get multiple events

        types = getTypes(types);
        t = types.length;

        while (t--) {

            tmp = namespaceRegex.exec(types[t]) || [];
            type = origType = tmp[1];
            namespaces = (tmp[2] || '').split('.').sort();

            if (!type) {

                for (type in events) {

                    hAzzle.event.remove(elem, type + types[t], handler, selector, true);
                }

                continue;
            }

            special = eventHooks.special[type] || {};
            type = (selector ? special.delegateType : special.bindType) || type;
            handlers = events[type] || [];

            tmp = tmp[2] && newNS(namespaces);

            // Remove matching events

            origCount = j = handlers.length;

            while (j--) {

                handleObj = handlers[j];

                if ((mt || origType === handleObj.origType) &&
                    (!handler || handler.guid === handleObj.guid) &&
                    (!tmp || tmp.test(handleObj.namespace)) &&
                    (!selector || selector === handleObj.selector ||
                        selector === 'sub' && handleObj.selector)) {
                    handlers.splice(j, 1);

                    if (handleObj.selector) {

                        handlers.delegateCount--;
                    }

                    if (special.remove) {

                        special.remove.call(elem, handleObj);
                    }
                }
            }

            if (origCount && !handlers.length) {
                if (!special.shutdown ||
                    special.shutdown.call(elem, namespaces, eventData.handle) === false) {

                    if (elem.removeEventListener) {
                        elem.removeEventListener(type, eventData.handle, false);
                    }
                }

                delete events[type];
            }
        }

        if (hAzzle.isEmptyObject(events)) {

            delete eventData.handle;
            hAzzle.removeData(elem, 'events');
        }
    },

    trigger: function (evt, data, elem, handlers) {

        var i, cur, tmp, bubbleType, ontype, handle, special,
            eventPath = [elem || doc],
            type = callType(evt),
            namespaces = callNamespaces(evt);

        cur = tmp = elem = elem || doc;

        // Check if valid type

        if (!valid(elem, type)) {
            return;
        }

        // Check for namespace

        if (inArray(type, '.') >= 0) {
            namespaces = type.split('.');
            type = namespaces.shift();
            namespaces.sort();
        }
            ontype = type.indexOf(':') < 0 && 'on' + type;
 evt = getEvent(elem, evt, handlers, namespaces, type);

        data = data === null ? [evt] : hAzzle.mergeArray(data, [evt]);

        special = eventHooks.special[type] || {};

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

                    eventCore.triggered = type;
                    elem[type]();
                    eventCore.triggered = undefined;

                    if (tmp) {

                        elem[ontype] = tmp;
                    }
                }
            }
        }

        return evt.result;
    },

      handle: function (evt) {

        if (!evt) {

            return;
        }

        // Grab the event object

        evt = hAzzle.props.propFix(evt);

        var i, j, ret, matched, handleObj,
            queue = [],
            args = slice.call(arguments),
            handlers = (hAzzle.data(this, 'events') || {})[evt.type] || [],
            special = eventHooks.special[evt.type] || {};

        args[0] = evt;
        evt.delegateTarget = this;

        // Call the prePreparation hook for the mapped type, and let it bail if desired
        if (special.prePrep && special.prePrep.call(this, evt) === false) {
            return;
        }

        // Determine handlers
        queue = hAzzle.event.handlers.call(this, evt, handlers);

        i = 0;
        while ((matched = queue[i++]) && !evt.isPropagationStopped()) {

            // bound element (listening the event)

            evt.currentTarget = matched.elem;

            j = 0;
            while ((handleObj = matched.handlers[j++]) &&
                !evt.isImmediatePropagationStopped()) {
                if (!evt.namespace_re || evt.namespace_re.test(handleObj.namespace)) {
                    evt.handleObj = handleObj;
                    evt.data = handleObj.data;

                    ret = ((eventHooks.special[handleObj.origType] || {}).handle ||
                        handleObj.handler).apply(matched.elem, args);

                    if (ret !== undefined) {
                        if ((evt.result = ret) === false) {
                            evt.preventDefault();
                            evt.stopPropagation();
                        }
                    }
                }
            }
        }

        // Call the postPrep hook for the mapped type
        if (special.postPrep) {
            special.postPrep.call(this, evt);
        }

        return evt.result;
    },
        handlers: function (evt, handlers) {
        var i, matches, sel, handleObj,
            queue = [],
            cur = evt.target,
            delegateCount = handlers.delegateCount;

        if (delegateCount && cur.nodeType && (!evt.button || evt.type !== 'click')) {

            for (; cur !== this; cur = cur.parentElement || this) {

                // Don't process clicks on disabled elements

                if (cur.disabled !== true || evt.type !== 'click') {

                    matches = [];

                    for (i = 0; i < delegateCount; i++) {

                        handleObj = handlers[i];

                        // Don't conflict with Object.prototype properties

                        sel = handleObj.selector + ' ';

                        if (matches[sel] === undefined) {

                            matches[sel] = handleObj.needsContext ?
                                hAzzle(sel, this).index(cur) >= 0 :
                                hAzzle.matches(sel, [cur]).length;
                        }

                        if (matches[sel]) {

                            matches.push(handleObj);
                        }
                    }

                    if (matches.length) {

                        queue.push({
                            elem: cur,
                            handlers: matches
                        });
                    }
                }
            }
        }

        if (delegateCount < handlers.length) {

            queue.push({
                elem: this,
                handlers: handlers.slice(delegateCount)
            });
        }

        return queue;
    }
};


hAzzle.Event = function (src, props) {

    if (src && src.type) {
        this.originalEvent = src;
        this.type = src.type;
        this.isDefaultPrevented = src.defaultPrevented ||
            src.defaultPrevented === undefined &&
            src.returnValue === false ?
            returnTrue :
            returnFalse;

    } else {
        this.type = src;
    }

    if (props) {
		
        hAzzle.shallowCopy(this, props);
    }

    // Create a timestamp if incoming event doesn't have one
    this.timeStamp = src && src.timeStamp || hAzzle.now();

    // Mark it as fixed
    this[hAzzle.expando] = true;
};

hAzzle.Event.prototype = {

    constructor: hAzzle.Event,

    /* =========================== EVENT PROPAGATION ========================== */

    isDefaultPrevented: returnFalse,

    isPropagationStopped: returnFalse,

    isImmediatePropagationStopped: returnFalse,

    // Prevent default action

    preventDefault: function () {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;

        if (e && e.preventDefault) {
            e.preventDefault();
        }
    },

    // Stop event propagation

    stopPropagation: function () {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation: function () {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if (e && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    },

    // Block any further event processing

    stop: function () {

        this.stopped = true;
        this.preventDefault();

        if (this.stopPropagation) {

            this.stopPropagation();

        } else {

            this.cancelBubble = true;
        }
    }
};


/* ============================ UTILITY METHODS =========================== */

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

// Get document from element

function getDocument(elem) {
    return (elem.ownerDocument || doc);
}

// Create new namespace

function newNS(ns) {
    return new RegExp('(^|\\.)' + ns.join('\\.(?:.*\\.|)') + '(\\.|$)');
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

    evt = evt[expando] ? evt : new hAzzle.Event(type, typeof evt === 'object' && evt);
    evt.isTrigger = handler ? 2 : 3;
    evt.namespace = ns.join('.');
    evt.namespace_re = evt.namespace ? newNS(ns) : null;
    evt.result = undefined;

    if (!evt.target) {

        // try to use evt.srcElement if we can

        evt.target = evt.srcElement || elem;
    }

    return evt;
}

/**
 * Listener
 * @return {Function}
 */

function Listener() {
    return function (e) {
        return typeof hAzzle !== undefined && eventCore.triggered !== e.type ?
            hAzzle.event.handle.apply(this, arguments) : undefined;
    };
}

// Handle multiple events separated by a space

function getTypes(types) {
    return (types || '').match(whiteRegex) || [''];
}

// Check for valid nodeType, and not triggered before

function valid(elem, type) {
    if ((elem.nodeType === 3 || elem.nodeType === 8) ||
        focusinoutblur.test(type + eventCore.triggered)) {
        return false;
    }
    return true;
}

// Check for valid handlers

function validHandlers(elem, fn, data, special) {
    if (!fn && special.trigger &&
        special.trigger.apply(elem, data) === false) {
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

// Get event handler

function getHandler(cur, evt) {
    return (hAzzle.data(cur, 'events') || {})[evt.type] &&
        hAzzle.data(cur, 'handle');
}