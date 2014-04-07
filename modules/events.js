var isFunction = hAzzle.isFunction,
    isString = hAzzle.isString,

    slice = Array.prototype.slice,

    specialEvents = {},
    focusinSupported = 'onfocusin' in window,

    _focus = {
        focus: 'focusin',
        blur: 'focusout'
    },

    _mouse = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
    },

    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
    };

/******************************************
 * Event Core Functions ( ECF )
 ******************************************/

/**
 * Handlers
 *
 * In hAzzle each event handler is attached to the element, and
 * we check here if the element has the handler we search for,
 * or not.
 *
 * @param {Object} element
 * @return {Object}
 */

function handlers(element) {
    return element._hdlers || (element._hdlers = []);
}

/**
 * Find event handler
 *
 * @param {Object} element
 * @param {Function} event
 * @param {String} fn
 * @param {Function} selector
 * @return {Object}
 */

  function findHandlers(element, event, fn, selector) {
	
	// Check for namespace
	
    event = getEventParts(event);
    
	// If namespace event...
	
	if (event.ns) var matcher = matcherFor(event.ns);
    
	return (handlers(element) || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || hAzzle.getUID(handler.fn) === hAzzle.getUID(fn))
        && (!selector || handler.sel == selector);
    });
  }

/**
 * Get event parts.
 *
 * @param {String} event
 *
 * @return {Object}
 */

function getEventParts(event) {
    var parts = ('' + event).split('.');
    return {
        e: parts[0],
        ns: parts.slice(1).sort().join(' ')
    };
}


function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

/**
 * Get real event.
 *
 * @param {String} event
 *
 * @return {String}
 */

function realEvent(type) {
    return _mouse[type] || (focusinSupported && _focus[type]) || type;
}


function BubbleCatching(handler, boobleSetting) {
    return handler.del && (!focusinSupported && (_focus[handler.e])) || !! boobleSetting;
}

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

/**
 * Deal with preventDefault, stopPropagation, stopImmediatePropagation
 */

function compatible(event, source) {

    if (source || !event.isDefaultPrevented) {
        source || (source = event);

        hAzzle.each(eventMethods, function (name, predicate) {

            var sourceMethod = source[name];

            event[name] = function () {

                this[predicate] = returnTrue;

                var e = this.originalEvent;

                if (!e) {
                    return;
                }

                return sourceMethod && sourceMethod.apply(source, arguments);
            };
            event[predicate] = returnFalse;
        });

        if (source.defaultPrevented !== undefined ? source.defaultPrevented :
            'returnValue' in source ? source.returnValue === false :
            source.getPreventDefault && source.getPreventDefault())
            event.isDefaultPrevented = returnTrue;
    }
    return event;
}


function createProxy(event) {
    var key,
        proxy = {
            originalEvent: event
        };

    for (key in event)
        if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

    return compatible(proxy, event);
}

hAzzle.proxy = function (fn, context) {
    if (isFunction(fn)) {
        var passedArgs = slice.call(arguments, 2),
            proxyFn = function () {
                return fn.apply(context, passedArgs.length ? passedArgs : arguments);
            };
        proxyFn.hAzzle_id = hAzzle.getUID(fn);
        return proxyFn;
    } else if (isString(context)) {
        return hAzzle.proxy(fn[context], fn);
    } else {
        throw new TypeError("expected function");
    }
};

hAzzle.fn.extend({

    /**
     * Add event to element
     *
     * @param {String/Object} events
     * @param {String} selector
     * @param {string} data
     * @param {Function} fn
     * @param {Boolean} one
     * @return {Object}
     */

    on: function (events, selector, data, fn, one) {

        var autoRemove, delegator, type;

        if (events && !isString(events)) {

            for (type in events) {

                this.on(type, selector, data, events[type], one);
            }
            return this;
        }

        if (!isString(selector) && !isFunction(fn) && fn !== false) {
            fn = data, data = selector, selector = undefined;
        }

        if (isFunction(data) || data === false) {
            fn = data, data = undefined;
        }
        return this.each(function (_, element) {

            if (one) {
                autoRemove = function (e) {
                    hAzzle.event.remove(element, e.type, fn);
                    return fn.apply(this, arguments);
                };
            }

            // Event delegation
            if (selector) {

                delegator = function (e) {
                    var evt, match = hAzzle(e.target).closest(selector, element).get(0);
                    if (match && match !== element) {
                        evt = hAzzle.extend(createProxy(e), {
                            currentTarget: match,
                            liveFired: element
                        });
                        return (autoRemove || fn).apply(match, [evt].concat(slice.call(arguments, 1)));
                    }
                };
            }

            hAzzle.event.add(element, events, fn, data, selector, delegator || autoRemove);
        });

    },

    /**
     * Add event to element only once
     * The event will be removed after the first time it's triggered
     *
     * @param {String/Object} events
     * @param {String} selector
     * @param {string} data
     * @param {Function} fn
     * @return {Object}
     */

    one: function (events, selector, data, fn) {
        return this.on(events, selector, data, fn, true);
    },

    /**
     * Remove event from element
     *
     * @param {String} events
     * @param {String} selector
     * @param {Function} fn
     * @return {Object}
     */

    off: function (events, selector, fn) {

        if (typeof events === "object") {
            // ( types-object [, selector] )
            for (var type in events) {
                this.off(type, selector, events[type]);
            }
            return this;
        }

        if (selector === false || typeof selector === "function") {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if (fn === false) {
            fn = returnFalse;
        }

        return this.each(function () {
            hAzzle.event.remove(this, events, fn, selector);
        });
    },

    trigger: function (events, args) {
        events = (isString(events) || hAzzle.isPlainObject(events)) ? hAzzle.events(events) : compatible(events);
        events._args = args;
        return this.each(function () {
            // items in the collection might not be DOM elements
            if ('dispatchEvent' in this) this.dispatchEvent(events);
            else hAzzle(this).triggerHandler(events, args);
        });
    },

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    triggerHandler: function (events, args) {
        var e, result;
        this.each(function (i, element) {
            e = createProxy(isString(events) ? hAzzle.Event(events) : events);
            e._args = args;
            e.target = element;
            hAzzle.each(findHandlers(element, events.type || events), function (_, handler) {
                result = handler.proxy(e);
                if (e.isImmediatePropagationStopped()) return false;
            });
        });
        return result;
    },

    hover: function (fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    }
});

hAzzle.event = {


    /**
     * Add event to element.
     * Using addEventListener or attachEvent (IE)
     *
     * @param {Object} el
     * @param {String} events
     * @param {Function} fn
     * @param {String} selector
     */
    add: function (element, events, fn, data, selector, delegator, bubble) {

        if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element)) return;

        // Set handler on the element

        var set = handlers(element);

        // Handle multiple events seperated by a space

        hAzzle.each(events.split(/\s/), function (index, type) {

            if (type == 'ready') return hAzzle(fn);

            // Namespace check

            var handler = getEventParts(type);
            handler.fn = fn;
            handler.sel = selector;

            if (_mouse[handler.e]) {

                fn = function (e) {
                    var related = e.relatedTarget;
                    if (!related || (related !== this && !hAzzle.contains(this, related)));
                    return handler.fn.apply(this, arguments);
                };

            }

            handler.del = delegator;

            var cb = delegator || fn;

            handler.proxy = function (e) {
                e = compatible(e);
                if (e.isImmediatePropagationStopped()) return;
                e.data = data;
                var result = cb.apply(element, e._args === undefined ? [e] : [e].concat(e._args));
                if (result === false) e.preventDefault(), e.stopPropagation();
                return result;
            };
            handler.i = set.length;
            set.push(handler);
            if (element.addEventListener) {
                element.addEventListener(realEvent(handler.e), handler.proxy, BubbleCatching(handler, bubble));
            }
        });
    },

    /**
     * Remove event to element.
     *
     * @param {Object} el
     * @param {String} events
     * @param {Function} fn
     * @param {String} selector
     */
    remove: function (element, events, fn, selector, bubble) {
        hAzzle.each((events || '').split(/\s/), function (_, evt) {
            hAzzle.each(findHandlers(element, evt, fn, selector), function (_, handler) {
                delete handlers(element)[handler.i];
                if (element.removeEventListener) {
                    element.removeEventListener(realEvent(handler.e), handler.proxy, BubbleCatching(handler, bubble));
                }
            });
        });
    }
};

hAzzle.Event = function (type, props) {

    if (!isString(type)) props = type, type = props.type;

    var event = document.createEvent(specialEvents[type] || 'Events'),
        bubbles = true;

    if (props)

        for (var name in props)(name == 'bubbles') ? (bubbles = !! props[name]) : (event[name] = props[name]);

    event.initEvent(type, bubbles, true);

    return compatible(event);
};

// Shortcut methods for 'on'

hAzzle.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu").split(" "), function (_, name) {

    // Handle event binding

    hAzzle.fn[name] = function (data, fn) {

        if (fn === null) {
            fn = data;
            data = null;
        }

        return arguments.length > 0 ?
            this.on(name, null, data, fn) :
            this.trigger(name);
    };
});