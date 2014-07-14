var win = this,
    doc = win.document || {},

    // Make sure we always are on the correct document

    docElem = hAzzle.docElem,
    evwhite = (/\S+/g),
    namespaceRegex = /^([^\.]*(?=\..*)\.|.*)/,
    nameRegex = /(\..*)/,
    cache = [],
    slice = Array.prototype.slice,

    isString = hAzzle.isString,
    isFunction = hAzzle.isFunction,

    fixHook = {},

    eC = hAzzle.event = {

        map: {},

        /**
         * Add event to element.
         * Using addEventListener
         *
         * @param {Object} elem
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         * @param {Undefined/Function} args
         * @param {Undefined/Object} of
         */

        addEvent: function (elem, events, selector, fn, /* internal */ one, args, of) {

            var type, types, i, first,
                hooks, elt = elem.nodeType,
                namespaces;

            // Don't attach events to text/comment nodes 

            if (elem || elt !== 3 || elt !== 8 || !events) {

                // Handle multiple events separated by a space

                if (typeof events === 'string') {

                    types = (events || '').match(evwhite) || [''];

                } else {

                    return;
                }

                // special case for one(), wrap in a self-removing handler

                if (one === 1) {

                    fn = hAzzle.event.once(hAzzle.event.removeEvent, elem, events, fn, of);
                }

                i = types.length;

                while (i--) {

                    // event type

                    type = types[i].replace(nameRegex, '');

                    // There *must* be a type, no attaching namespace-only handlers

                    if (!type) {

                        continue;
                    }

                    hooks = hAzzle.eventHooks[type] || {};

                    if (selector && hooks.delegateType) {

                        type = hooks.delegateType;
                    }

                    namespaces = types[i].replace(namespaceRegex, '').split('.').sort();


                    first = FirstRun(elem, type, fn, of, namespaces, args, false);

                    // Add roothandler if we're the first

                    if (first) {

                        type = first.eventType;

                        // Trigger eventHooks if any
                        // e.g. support for 'bubbling' focus and blur events

                        hooks = hAzzle.eventHooks[type] || {};

                        if (hooks.simulate) {
                            hooks.simulate(elem, type);
                        }

                        elem.addEventListener(type, rootListener, false);
                    }
                }
            }
        },

        once: function (rm, element, type, fn, originalFn) {
            // wrap the handler in a handler that does a remove as well
            return function (el) {
                fn.apply(el, arguments);
                rm(element, type, originalFn);
            };
        },

        /**
         * Remove an event handler.
         *
         * @param {Object} el
         * @param {String} selector
         * @param {String} type
         * @param {Function} fn
         *
         *
         * FIX ME!!
         *
         * Left to do with this function is to remove
         * handlers on delegated events.
         *
         * For now we can do:
         *
         *  hAzzle( delegated node, root node).off()
         *
         */

        removeEvent: function (elem, evt, selector, fn) {

            var k, type, namespaces, i, hooks;

            if (!elem) {

                return;
            }

            if (selector === false || typeof selector === 'function') {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }

            // hAzzle.inArray() are faster then native indexOf, and this
            // has to be fast

            if (isString(evt) && hAzzle.inArray(evt, ' ') > 0) {

                // Handle multiple events separated by a space

                evt = (evt || '').match(evwhite) || [''];

                i = evt.length;

                while (i--) {

                    this.removeEvent(elem, evt[i], selector, fn);
                }

                return elem;
            }

            // Check for namespace

            if (isString(evt)) {

                type = evt.replace(nameRegex, '');
            }

            if (type) {

                // Checks if any 'type' need special threatment
                // e.g. mouseenter and mouseleave

                hooks = hAzzle.eventHooks[type] || {};

                if (hooks.specialEvents) {

                    type = hooks.specialEvents;
                }
            }

            if (!evt || isString(evt)) {

                // namespace

                if ((namespaces = isString(evt) && evt.replace(namespaceRegex, ''))) {

                    namespaces = namespaces.split('.').sort();
                }

                hAzzle.event.remove(elem, type, fn, namespaces, selector);

            } else if (isFunction(evt)) {

                // removeEvent(el, fn)

                this.remove(elem, null, evt, null, selector);

            } else {

                // removeEvent(el, { t1: fn1, t2, fn2 })

                for (k in evt) {

                    if (evt.hasOwnProperty(k)) {

                        this.removeEvent(elem, k, evt[k]);
                    }
                }
            }

            return elem;
        },

        /**
         * Clone events attached to elements
         *
         * @param {Object} element
         * @param {Object} from
         * @param {String} type (e.g. 'click', 'mouseover')
         * @return {hAzzle}
         */

        clone: function (elem, from, type) {
            var handlers = hAzzle.event.get(from, type, null, false),
                l = handlers.length,
                i = 0;

            //move out 'apply' from loops
            var applyAddEvent = (function (elem, handlers) {
                return function (i) {
                    var args, core;
                    if (handlers[i].original) {
                        args = [elem, handlers[i].type];
                        if ((core = handlers[i].handler.__hAzzle)) {

                            args.push(hAzzle.selector);
                        }

                        args.push(handlers[i].original);
                        hAzzle.event.addEvent.apply(null, args);
                    }
                };
            })(elem, handlers);

            for (; i < l; i++) {
                applyAddEvent(i);
            }

            return elem;
        },

        trigger: function (elem, type, args) {

            var cur, types = type.split(' '),
                i = types.length,
                j = 0,
                et = elem.nodeType,
                l, call, evt, names, handlers;

            cur = elem || doc;

            // Don't do events on text and comment nodes

            if (et === 3 || et === 8 || !type) {

                while (i--) {

                    type = types[i].replace(nameRegex, '');

                    if ((names = types[i].replace(namespaceRegex, ''))) {

                        names = names.split('.');
                    }

                    if (!names && !args) {

                        /**
                         * Create custom events.
                         *
                         * These events can be listened by hAzzle via `on`,
                         * and by pure javascript via `addEventListener`
                         *
                         * Examples:
                         *
                         * hAzzle('p').on('customEvent', handler);
                         *
                         * hAzzle('p').trigger('customEvent');
                         *
                         * window.document.addEventListener('customEvent', handler);
                         *
                         */

                        evt = doc.createEvent('HTMLEvents');
                        evt.initEvent(type, true, true, win, 1);
                        elem.dispatchEvent(evt);

                    } else {

                        // non-native event, either because of a namespace, arguments or a non DOM element
                        // iterate over all listeners and manually 'fire'

                        handlers = hAzzle.event.get(cur, type, null, false);

                        evt = new hAzzle.Event(null, cur);

                        evt.type = type;

                        call = args ? 'apply' : 'call';

                        args = args ? [evt].concat(args) : evt;

                        l = handlers.length;

                        for (; j < l; j++) {

                            if (handlers[j].inNamespaces(names)) {

                                handlers[j].handler.apply(cur, args);
                            }
                        }
                    }
                }
            }
        },

        /**
         * Detach an event or set of events from an element
         *
         * There are many different methods for removing events:
         *
         *  hAzzle.('p').off(handler);
         *
         *  hAzzle.('p').off('click');
         *
         *  hAzzle.('p').off('click', handler);
         *
         *  hAzzle.('p').off('click mouseover');
         *
         *  hAzzle.('p').off({ click: clickHandler, keyup: keyupHandler });
         *
         *  hAzzle.('p').off();
         *
         */

        remove: function (elem, types, handler, namespaces /*, selector*/ ) {
            //the question here is what are we going to do with this selector argument
            var type = types && types.replace(nameRegex, ''),
                handlers = hAzzle.event.get(elem, type, null, false),
                removed = [],
                i = 0,
                j,
                l = handlers.length;

            for (; i < l; i++) {

                if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
                    hAzzle.event.unregister(handlers[i]);
                    if (!removed[handlers[i].type]) {
                        removed[handlers[i].type] = handlers[i].type;
                    }
                }
            }

            // Remove the root listener if this is the last one

            for (j in removed) {
                if (!hAzzle.event.has(elem, removed[j], null, false)) {
                    elem.removeEventListener(removed[j], rootListener, false);
                }
            }
        },

        // This functions are developed with inspiration from Bean

        loopThrough: function (elem, type, original, handler, root, fn) {

            var pfx = root ? 'r' : '#',
                t, self = this;

            if (!type || type == '*') {
                for (t in self.map) {
                    if (t.charAt(0) == pfx) {
                        self.loopThrough(elem, t.substr(1), original, handler, root, fn);
                    }
                }
            } else {

                var i = 0,
                    l,
                    list = self.map[pfx + type],
                    all = elem == '*';

                if (!list) {

                    return;
                }

                l = list.length;

                for (; i < l; i++) {

                    if ((all || list[i].matches(elem, original, handler)) && !fn(list[i], list, i, type)) {

                        return;
                    }
                }
            }
        },

        has: function (elem, type, original, root) {

            var i, list = this.map[(root ? 'r' : '#') + type];

            if (list) {

                i = list.length;

                while (i--) {

                    if (!list[i].root && list[i].matches(elem, original, null)) {

                        return true;
                    }
                }
            }
            return false;
        },

        get: function (elem, type, original, root) {
            var entries = [];
            this.loopThrough(elem, type, original, null, root, function (entry) {

                return entries.push(entry);
            });
            return entries;
        },

        // Add an event to the element's event registry.

        register: function (entry) {

            var has = !entry.root && !this.has(entry.element, entry.type, null, false),
                key;

            if (entry.root) {

                key = 'r' + entry.type;

            } else {

                key = '#' + entry.type;
            }

            (this.map[key] || (this.map[key] = [])).push(entry);

            return has;
        },

        // Remove an event from the element's event registry.

        unregister: function (entry) {

            var self = this;

            this.loopThrough(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {

                list.splice(i, 1);

                entry.removed = true;

                if (list.length === 0) {

                    delete self.map[(entry.root ? 'r' : '#') + entry.type];
                }
                return false;
            });
        },

        entries: function () {
            var t, entries = [],
                self = this;

            for (t in self.map) {
                if (t.charAt(0) == '#') {
                    entries = entries.concat(self.map[t]);
                }
            }

            return entries;
        }
    };

hAzzle.eventHooks = {};


hAzzle.Event = function (event, element) {

    if (arguments.length && event) {

        var self = this,
            pW = (element.ownerDocument || element.document || element).parentWindow,
            evt = event || pW.event,
            type = evt.type,
            target = evt.target || evt.srcElement,
            l = hAzzle.event.typeFixers.length,
            i = 0,
            p, props, cleaned;

        self.originalEvent = evt;

        self.target = target;

        // overwrite if nodeType 3

        if (target && target.nodeType === 3) {

            self.target = target.parentElement;
        }

        cleaned = fixHook[type];

        if (!cleaned) {

            for (; i < l; i++) {
                if (hAzzle.event.typeFixers[i].reg.test(type)) { // guaranteed to match at least one, last is .*
                    fixHook[type] = cleaned = hAzzle.event.typeFixers[i].fix;
                    break;
                }
            }
        }

        props = cleaned(event, this, type);

        for (i = props.length; i--;) {
            if (!((p = props[i]) in this) && p in event) this[p] = event[p];
        }

        return self;

    }
};

/* =========================== EVENT PROPAGATION ========================== */

hAzzle.Event.prototype = {

    preventDefault: function () {

        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;

        if (e && e.preventDefault) {

            e.preventDefault();

        } else {

            e.returnValue = false;
        }
    },
    stopPropagation: function () {

        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if (e && e.stopPropagation) {

            e.stopPropagation();

        } else {

            e.cancelBubble = true;
        }
    },

    // Set a 'stopped' property so that a custom event can be inspected

    stop: function () {
        this.stopped = true;
        this.preventDefault();
        this.stopPropagation();
    },

    stopImmediatePropagation: function () {

        var e = this.originalEvent;

        if (e && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }

        this.isImmediatePropagationStopped = returnTrue;
    },
    isImmediatePropagationStopped: function () {

        var toE = this.originalEvent;

        if (toE.isImmediatePropagationStopped) {

            return toE.isImmediatePropagationStopped();
        }
    },
    clone: function (currentTarget) {
        var ne = new hAzzle.Event(this, this.element);
        ne.currentTarget = currentTarget;
        return ne;
    }
};

// Registry

function Registry(element, type, handler, original, namespaces, args, root) {

    // Checks if any 'type' need special threatment
    // e.g. mouseenter and mouseleave

    var reg = this,
        hooks = hAzzle.eventHooks[type];

    if (hooks && ('specialEvents' in hooks)) {
        handler = reg.twistedBrain(element, handler, hooks.specialEvents.handler, args);
        type = hooks.specialEvents.name || type;
    }

    // If unload, remove the listener 
    if (type === 'unload') {

        handler = hAzzle.event.once(hAzzle.event.remove, element, type, handler, original);
    }

    reg.element = element;
    reg.type = type;
    reg.original = original;
    reg.namespaces = namespaces;
    reg.eventType = type;
    reg.target = element;

    // Deprecated ??

    reg.addEventListener = !!this.target.addEventListener;
    reg.root = root;
    reg.handler = reg.twistedBrain(element, handler, null, args);
}


Registry.prototype = {

    twistedBrain: function (element, fn, condition, args) {
        var call = function (event, eargs) {
                return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
            },

            // Get correct target for delegated events

            getTarget = function (evt, eventElement) {
                var target = fn.__hAzzle ? findTarget(fn.__hAzzle.selector, evt.target, this) : eventElement;
                fn.__hAzzle.currentTarget = target;
                return target;
            },

            handler = condition ? function (event) {

                var target = getTarget(event, this);

                if (condition.apply(target, arguments)) {

                    if (event) {

                        event.currentTarget = target;
                    }

                    return call(event, arguments);
                }
            } : function (event) {

                //check if it is a delegated events
                if (fn.__hAzzle) {

                    event = event.clone(getTarget(event));
                }

                return call(event, arguments);
            };
        handler.__hAzzle = fn.__hAzzle;
        return handler;
    },

    /**
     * Checks if there are any namespaces when we are
     * using the trigger() function
     */

    inNamespaces: function (checkNamespaces) {

        var self = this,
            i, j, c = 0;

        if (!checkNamespaces) {

            return true;
        }

        if (!self.namespaces) {

            return false;
        }

        i = checkNamespaces.length;

        while (i--) {

            for (j = self.namespaces.length; j--;) {
                if (checkNamespaces[i] === self.namespaces[j]) {

                    c++;
                }
            }
        }
        return checkNamespaces.length === c;
    },

    matches: function (checkElement, checkOriginal, checkHandler) {
        return this.element === checkElement &&
            (!checkOriginal || this.original === checkOriginal) &&
            (!checkHandler || this.handler === checkHandler);
    }
};

/* =========================== PRIVATE FUNCTIONS ========================== */

function returnTrue() {
    return true;
}

/**
 * Root listener
 *
 * A 'rootlistener' are attached to each DOM event that we need to listen to, only once
 * per event type per DOM element
 *
 * @param {String} evt
 * @param {String} type
 * @return {hAzzle}
 */



function rootListener(evt, type) {

    var listeners = hAzzle.event.get(this, type || evt.type, null, false);

    evt = new hAzzle.Event(evt, this, true);

    if (type) {
        evt.type = type;
    }

    triggerListeners(evt, listeners, this);
}


function triggerListeners(evt, listeners, thisArg) {
    var l = listeners.length,
        i = 0;

    var notifyListener = (function (evt, listeners, thisArg) {
        return function (i) {

            if (!listeners[i].removed) {


                listeners[i].handler.call(thisArg, evt);
            }

        };
    })(evt, listeners, thisArg);

    if (listeners >= 2) {
        for (; i < l && !evt.isImmediatePropagationStopped(); i++) {
            notifyListener(i);
        }
    } else {
        notifyListener(0);
    }
}

/**
 * Event delegation core function
 *
 * The selector can either be an string, or series of
 * strings splitted by comma
 *
 * Examples:
 *
 * 'p'
 * 'p', 'div', 'span'
 *
 * You can delegate events like this:
 *
 * hAzzle(document).on('click', 'p', function(e) {}
 *
 * or
 *
 * hAzzle(document).on('click', ['p', 'div', 'span'], function(e) {}
 *
 * or
 *
 * hAzzle(document).on('click', hAzzle('p'), function(e) {}
 *
 */

function findTarget(selector, target, elem) {

    elem = elem || docElem;

    // We can never find CSS nodes in the window itself
    // so direct it back to document if elem = window

    elem = (elem === win) ? docElem : elem;

    var i, matches = cache[selector] ? cache[selector] : cache[selector] = hAzzle(selector, elem);
    for (; target !== elem; target = target.parentElement || elem) {

        if (matches !== null) {
            for (i = matches.length; i--;) {
                if (matches[i] === target) {
                    return target;
                }
            }
        }
    }
}

// Delegate handler

function delegate(selector, fn) {

    function handler(e) {

        var cur = e.target,
            type = e.type;

        if (cur.nodeType && (!e.button || type !== 'click')) {

            // Don't process clicks on disabled elements

            if (e.target.disabled !== true || type !== 'click') {

                var m = null;

                if (handler.__hAzzle) {
                    m = handler.__hAzzle.currentTarget;
                }
                if (m) {

                    return fn.apply(m, arguments);
                }
            }
        }
    }

    handler.__hAzzle = {

        // Don't conflict with Object.prototype properties

        selector: selector + ' '
    };

    return handler;
}

function FirstRun(elem, type, fn, of, namespaces, args, root) {

    var entry = new Registry(
        elem,
        type,
        fn,
        of,
        namespaces,
        args,
        root
    );

    // Register the new entry

    hAzzle.event.register(entry);

    return entry;
}


hAzzle.extend({

    /**
     * Add event to element
     *
     * @param {String} events
     * @param {String} selector
     * @param {Function} fn
     * @return {hAzzle}
     */

    on: function (types, selector, fn) {

        var type, e, originalFn, args;

        if (typeof types === 'object') {

            for (type in types) {

                if (types.hasOwnProperty(type)) {

                    e = types[type];

                    if (typeof e === 'object') {

                        this.on(type, e.delegate, e.func);

                    } else {

                        this.on(type, types[type]);
                    }
                }
            }
        }

        // Event delegation

        if (typeof selector === 'function') {

            args = slice.call(arguments, 3);
            fn = originalFn = selector;

        } else {

            originalFn = fn;
            args = slice.call(arguments, 4);
            fn = delegate(selector, originalFn);
        }

        // Add the listener

        return this.each(function () {
            hAzzle.event.addEvent(this, types, selector, fn, null, originalFn, args);
        });

    },
    one: function (events, selector, fn) {
        return this.each(function (el) {
            hAzzle.event.addEvent(el, events, selector, fn, 1);
        });
    },

    /**
     * Remove event from element
     *
     * @param {String} events
     * @param {String} selector
     * @param {Function} fn
     * @return {hAzzle}
     */

    off: function (events, selector, fn) {
        return this.each(function (el) {
            eC.removeEvent(el, events, selector, fn);
        });
    },

    /**
     * Trigger specific event for element collection
     *
     * @param {String} type
     * @return {hAzzle}
     */

    trigger: function (type, args) {

        return this.each(function (el) {
            eC.trigger(el, type, args);
        });
    },

    hover: function (fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    },

    focus: function () {
        return this.each(function (el) {
            return el.focus();
        });

    },
    blur: function () {
        return this.each(function (el) {
            return el.blur();
        });
    },

    /**
     * Clone events attached to elements
     *
     * @param {Object} cloneElem
     * @param {String} type (e.g. 'click', 'mouseover')
     * @return {hAzzle}
     */

    cloneEvents: function (cloneElem, type) {
        return this.each(function (el) {
            eC.clone(el, cloneElem, type);
        });
    }
});