var isFunction = hAzzle.isFunction,
    isString = hAzzle.isString,

    slice = Array.prototype.slice,

    handlers = {},
    specialEvents = {},
    focusinSupported = 'onfocusin' in window,

    focus = {
        focus: 'focusin',
        blur: 'focusout'
    },

    hover = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
    };


var returnTrue = function () {
    return true;
},
    returnFalse = function () {
        return false;
    },
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
    };

/**
 * Event Core Functions ( ECF )
 */

function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[hAzzle.getUID(element)] || []).filter(function (handler) {
        return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || hAzzle.getUID(handler.fn) === hAzzle.getUID(fn)) && (!selector || handler.sel == selector);
    });
}


function _remove(element, events, fn, selector, capture) {
    var id = hAzzle.getUID(element);
    (events || '').split(/\s/).forEach(function (event) {
        findHandlers(element, event, fn, selector).forEach(function (handler) {
            delete handlers[id][handler.i];
            if ('removeEventListener' in element)
                element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
        });
    });
}

function parse(event) {
    var parts = ('' + event).split('.');
    return {
        e: parts[0],
        ns: parts.slice(1).sort().join(' ')
    };
}

function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type;
}

function eventCapture(handler, captureSetting) {
    return handler.del &&
        (!focusinSupported && (handler.e in focus)) || !! captureSetting;
}


function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
        source || (source = event);

        hAzzle.each(eventMethods, function (name, predicate) {
            var sourceMethod = source[name];
            event[name] = function () {
                this[predicate] = returnTrue;
                return sourceMethod && sourceMethod.apply(source, arguments);
            };
            event[predicate] = returnFalse;
        });

        if (source.defaultPrevented !== undefined ? source.defaultPrevented :
            'returnValue' in source ? source.returnValue === false :
            source.getPreventDefault && source.getPreventDefault());
        event.isDefaultPrevented = returnTrue;
    }
    return event;
}


hAzzle.event = {
    add: add,
    remove: remove
};

function createProxy(event) {
    var key, proxy = {
            originalEvent: event
        };
    for (key in event)
        if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

    return compatible(proxy, event);
}

function add(element, events, fn, data, selector, delegator, capture) {

    var id = hAzzle.getUID(element),
        set = (handlers[id] || (handlers[id] = []));

    hAzzle.each(events.split(/\s/), function (_, event) {

        if (event == 'ready') return hAzzle(document).ready(fn);
        var handler = parse(event);
        handler.fn = fn;
        handler.sel = selector;
        // emulate mouseenter, mouseleave
        if (handler.e in hover) fn = function (e) {
            var related = e.relatedTarget;
            if (!related || (related !== this && !hAzzle.contains(this, related)))
                return handler.fn.apply(this, arguments);
        };
        handler.del = delegator;
        var callback = delegator || fn;
        handler.proxy = function (e) {
            e = compatible(e);
            if (e.isImmediatePropagationStopped()) return;
            e.data = data;
            var result = callback.apply(element, e._args === undefined ? [e] : [e].concat(e._args));
            if (result === false) e.preventDefault(), e.stopPropagation();
            return result;
        };
        handler.i = set.length;
        set.push(handler);
        if ('addEventListener' in element)
            element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
    });
}


hAzzle.fn.extend({

    /**
     * 'on' is such a common word in javascript libraries, so I can't avoid using it
     */

    on: function (types, selector, data, callback, one) {

        var autoRemove, delegator;

        if (typeof types === "object") {
            if (!isString(selector)) {
                data = data || selector;
                selector = undefined;
            }

            for (var type in types) {

                this.on(type, selector, data, types[type], one);

            }
            return this;
        }

        if (data === null && callback === null) {
            // ( types, fn )
            callback = selector;
            data = selector = undefined;
        } else if (callback === null) {
            if (typeof selector === "string") {
                // ( types, selector, fn )
                callback = data;
                data = undefined;
            } else {
                // ( types, data, fn )
                callback = data;
                data = selector;
                selector = undefined;
            }
        }
        if (callback === false) {
            callback = returnFalse;
        } else if (!callback) {
            return this;
        }

        return this.each(function (_, element) {

            if (one) {
                autoRemove = function (e) {
                    _remove(element, e.type, callback);
                    return callback.apply(this, arguments);
                };
            }

            if (selector) {
                delegator = function (e) {
                    var evt, match = hAzzle(e.target).closest(selector, element).get(0);
                    if (match && match !== element) {
                        evt = hAzzle.extend(createProxy(e), {
                            currentTarget: match,
                            liveFired: element
                        });
                        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
                    }
                };
            }

            add(element, types, callback, data, selector, delegator || autoRemove);
        });

    },
    one: function (types, selector, data, callback) {
        return this.on(types, selector, data, callback, true);
    },

    off: function (event, selector, callback) {
        var $this = this;

        if (!isString(selector) && !isFunction(callback) && callback !== false)
            callback = selector, selector = undefined;

        if (callback === false) callback = returnFalse;

        return $this.each(function () {
            _remove(this, event, callback, selector);
        });
    },

    trigger: function (event, args) {
        event = (isString(event) || hAzzle.isPlainObject(event)) ? hAzzle.Event(event) : compatible(event);
        event._args = args;
        return this.each(function () {
            // items in the collection might not be DOM elements
            if ('dispatchEvent' in this) this.dispatchEvent(event);
            else hAzzle(this).triggerHandler(event, args);
        });
    },

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    triggerHandler: function (event, args) {
        var e, result;
        this.each(function (_, element) {
            e = createProxy(isString(event) ? hAzzle.Event(event) : event);
            e._args = args;
            e.target = element;
            hAzzle.each(findHandlers(element, event.type || event), function (_, handler) {
                result = handler.proxy(e);
                if (e.isImmediatePropagationStopped()) return false;
            });
        });
        return result;
    },

    bind: function (event, data, callback) {
        return this.on(event, data, callback);
    },
    unbind: function (event, callback) {
        return this.off(event, callback);
    }

});




hAzzle.Event = function (type, props) {
    if (!isString(type)) props = type, type = props.type;
    var event = document.createEvent(specialEvents[type] || 'Events'),
        bubbles = true;
    if (props)
        for (var name in props)(name == 'bubbles') ? (bubbles = !! props[name]) : (event[name] = props[name]);
    event.initEvent(type, bubbles, true);
    return compatible(event);
};




// shortcut methods for `.bind(event, fn)` for each event type
hAzzle.each(('focusin focusout load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select keydown keypress keyup error').split(' '), function (_, event) {
    hAzzle.fn[event] = function (callback) {
        return callback ?
            this.bind(event, callback) :
            this.trigger(event);
    };
});


hAzzle.each(['focus', 'blur'], function (_, name) {
    hAzzle.fn[name] = function (callback) {
        if (callback) this.bind(name, callback);
        else this.each(function () {
            try {
                this[name]();
            } catch (e) {}
        });
        return this;
    };
});