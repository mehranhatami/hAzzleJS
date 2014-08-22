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
var whiteRegex = (/\S+/g),
    gtl = /\.+\s/,
    gtr = /\.+$/,
    namespaceRegex = /^([^.]*)(?:\.(.+)|)$/,
    speci = /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i,
    slice = Array.prototype.slice,

    // Public object for eventHooks

    eventHooks = hAzzle.eventHooks = {};

// hAzzle event

hAzzle.event = {

    global: {},

    /**
     * Add event to element.
     *
     * @param {Object} elem
     * @param {String|Object} types
     * @param {Function} handler
     * @param {String|Undefined} data
     * @param {String|Undefined} selector
     */

    add: function(elem, types, handler, data, selector) {

        var objHandler, eventHandler, tmp,
            special, handlers, type, namespaces, origType,
            eventData = hAzzle.getPrivate(elem),
            events, handleObj, t;

        if (!eventData) {
            return;
        }

        if (handler.handler) {
            objHandler = handler;
            handler = objHandler.handler;
            selector = objHandler.selector;
        }

        // Assign each event handler a unique ID

        if (!handler.guid) {
            handler.guid = hAzzle.getID(true, 'hEvt_');
        }

        // Create a hash table of event types for the element

        if (!(events = eventData.events)) {

            events = eventData.events = {};
        }

        // Create a hash table of event handlers for each element/event pair

        if (!(eventHandler = eventData.handle)) {

            eventHandler = eventData.handle = function(e) {
                return typeof hAzzle !== 'undefined' && hAzzle.event.triggered !== e.type ?
                    hAzzle.event.handle.apply(this, arguments) : undefined;
            };
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
                needsContext: selector && speci.test(selector),
                namespace: namespaces.join('.')
            }, objHandler);

            // Init the event handler queue if we're the first

            if (!(handlers = events[type])) {

                handlers = events[type] = [];
                handlers.delegateCount = 0;

                if (!special.setup ||
                    special.setup.call(elem, data, namespaces, eventHandler) === false) {

                    // Add the listener

                    hAzzle.addEvent(elem, type, eventHandler);
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

            hAzzle.event.global[type] = true;
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

    remove: function(elem, types, handler, selector, mt) {

        var j, origCount, tmp,
            events, t, handleObj,
            special, handlers, type, namespaces, origType,
            eventData = hAzzle.hasPrivate(elem) && hAzzle.getPrivate(elem);

        if (!eventData || !(events = eventData.events)) {
            return;
        }

        // Remove empty namespace (ie trailing dots)

        types = types.replace(gtl, ' ').replace(gtr, '');

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
            tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
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

                    hAzzle.removeEvent(type, eventData.handle, false);
                }

                delete events[type];
            }
        }

        if (hAzzle.isEmptyObject(events)) {

            delete eventData.handle;
            delete eventData.events;
        }
    },

    handle: function(evt) {

        // Grab the event object

        evt = hAzzle.event.fix(evt);

        var i, j, ret, matched, handleObj,
            queue = [],
            args = slice.call(arguments),
            handlers = (hAzzle.getPrivate(this, 'events') || {})[evt.type] || [],
            special = eventHooks.special[evt.type] || {};

        args[0] = evt;
        evt.delegateTarget = this;

        // Call the prePreparation hook for the mapped type, and let it bail if desired
        if (special.prePrep && special.prePrep.call(this, evt) === false) {
            return;
        }

        // Determine handlers

        queue = hAzzle.event.handlers.call(this, evt, handlers);

        i = queue.length;

        while (i-- && !evt.isPropagationStopped()) {

            matched = queue[i];

            evt.currentTarget = matched.elem;

            j = 0;

            while ((handleObj = matched.handlers[j++]) &&
                !evt.isImmediatePropagationStopped()) {
                if (handleObj.namespace === "_" ||
                    !evt.rnamespace || evt.rnamespace.test(handleObj.namespace)) {
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
        if (special.postDispatch) {
            special.postDispatch.call(this, evt);
        }

        return evt.result;
    },

    handlers: function(evt, handlers) {

        var i, matches, sel, handleObj,
            queue = [],
            cur = evt.target,
            delegateCount = handlers.delegateCount;

        if (delegateCount && cur.nodeType && (!evt.button || evt.type !== 'click')) {

            for (; cur !== this; cur = cur.parentNode || this) {

                // Don't process clicks on disabled elements

                if (cur.disabled !== true || evt.type !== 'click') {

                    matches = [];

                    i = delegateCount;

                    while (i--) {

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

hAzzle.Event = function(src, props) {
    // Allow instantiation without the 'new' keyword
    if (!(this instanceof hAzzle.Event)) {
        return new hAzzle.Event(src, props);
    }

    if (src && src.type) {
        this.originalEvent = src;
        this.type = src.type;
        this.isDefaultPrevented = src.defaultPrevented ||
            src.defaultPrevented === undefined ?
            returnTrue :
            returnFalse;

        // Create target properties
        this.target = src.target;
        this.currentTarget = src.currentTarget;
        this.relatedTarget = src.relatedTarget;

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
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function() {

            var e = this.originalEvent;

            this.isDefaultPrevented = returnTrue;

            if (e && e.preventDefault) {
                e.preventDefault();
            }
        },

        // Stop event propagation

        stopPropagation: function() {

            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        },

        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            this.isImmediatePropagationStopped = returnTrue;

            if (e && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }

            this.stopPropagation();
        },

        // Block any further event processing

        stop: function() {

            this.stopped = true;
            this.preventDefault();

            if (this.stopPropagation) {

                this.stopPropagation();

            } else {

                this.cancelBubble = true;
            }
        }
    }
    /* ============================ UTILITY METHODS =========================== */

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

// Handle multiple events separated by a space

function getTypes(types) {
    return (types || '').match(whiteRegex) || [''];
}

// Globalize it

hAzzle.extend({

    addEvent: function(elem, type, handler) {
        if (elem.addEventListener) {
            elem.addEventListener(type, handler, false);
        }
    },

    removeEvent: function(elem, type, handle) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }
    }
}, hAzzle);