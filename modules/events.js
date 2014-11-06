var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.include([
    'util',
    'core',
    'collection',
    'has',
    'types',
    'jiesa'
], function(_util, _core, _collection, _has, _types, _jiesa) {

    var win = window,
        doc = window.document || {},
        evwhite = (/\S+/g),
        mouseEvent = /^click|mouse(?!(.*wheel|scroll))|menu|pointer|contextmenu|drag|drop/i,
        keyEvent = /^key/,
        namespaceRegex = /^([^\.]*(?=\..*)\.|.*)/,
        nameRegex = /(\..*)/,
        textEvent = /^text/i,
        mouseWheelEvent = /mouse.*(wheel|scroll)|wheel/i,
        touchEvent = /^touch|^gesture/i,
        messageEvent = /^message$/i,
        popstateEvent = /^popstate$/i,
        map = {},
        fixHook = {},
        propHook = {},
        eventTranslation = {},

        // Common properties for all event types

        commonProps = ('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
            'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' +
            'srcElement target timeStamp type view which propertyName').split(' '),
        mouseProps = ('button buttons clientX clientY dataTransfer ' +
            'fromElement offsetX offsetY pageX pageY screenX screenY toElement').split(' '),
        mouseWheelProps = mouseProps.concat(('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
            'deltaY deltaX deltaZ').split(' ')),
        keyProps = ('char charCode key keyCode keyIdentifier ' +
            'keyLocation location').split(' '),
        textProps = ('data').split(' '),
        touchProps = ('touches changedTouches targetTouches scale rotation').split(' '),
        messageProps = ('data origin source').split(' '),
        stateProps = ('state').split(' ');

    // Firefox specific eventTypes
    if (_has.has('firefox')) {
        commonProps.concat('mozMovementY mozMovementX'.split(' '));
    }
    // WebKit eventTypes
    // Support: Chrome / Opera

    if (_has.has('webkit')) {
        commonProps.concat(('webkitMovementY webkitMovementX').split(' '));
    }

    var global = {},

        // Add event to element

        addEvent = function(elem, events, selector, fn, /* internal */ one) {

            // Check if typeof hAzzle, then wrap it out, and return current elem

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            var original, type, types, i, args, entry, first,
                namespaces, nodeType = elem ? elem.nodeType : undefined;

            // Don't attach events to text/comment nodes 

            if (!nodeType || nodeType === 3 || nodeType === 8 || !events) {
                return;
            }

            // Types can be a map of types/handlers

            if (_types.isType('Object')(events)) {
                for (type in events) {
                    fn = events[type];
                    if (selector === undefined) {
                        selector = fn;
                        fn = undefined;
                    }
                    addEvent(elem, type, selector, fn);
                }
                return;
            }

            // Event delegation

            if (!_types.isType('Function')(selector)) {
                original = fn;
                args = _collection.slice(arguments, 4);
                fn = delegate(selector, original);
            } else {
                args = _collection.slice(arguments, 3);
                fn = original = selector;
            }

            // If not a valid callback, stop here

            if (typeof fn !== 'function') {
                hAzzle.err(true, 13, 'no handler registred for on() in events.js module');
            }

            // Handle multiple events separated by a space

            types = (events || '').match(evwhite) || [''];

            // special case for one(), wrap in a self-removing handler

            if (one) {
                fn = once(removeEvent, elem, events, fn, original);
            }

            i = types.length;

            while (i--) {

                // event type

                type = (eventTranslation[types[i]] ? eventTranslation[types[i]].base : types[i]).replace(nameRegex, '');

                // There *must* be a type, no attaching namespace-only handlers

                if (!type) {
                    continue;
                }

                // namespaces

                namespaces = types[i].replace(namespaceRegex, '').split('.'); // namespaces

                // Registrer
                first = register(entry = Registry(
                    elem,
                    type, // event type
                    fn,
                    original,
                    namespaces,
                    args,
                    false // not root
                ));

                if (first) {
                    elem.addEventListener(entry.eventType, rootHandler, false);
                }
            }
            // Keep track of which events have ever been used, for event optimization
            global[entry.eventType] = true;
        },

        one = function(elem, events, selector, fn) {
            addEvent(elem, events, selector, fn, 1);
        },
        // Detach an event or set of events from an element

        removeEvent = function(elem, types, selector, fn) {

            var k, type, namespaces, i;

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            if (!elem) {
                hAzzle.err(true, 17, 'no element exist in removeEvent() in events.js module');
                return;
            }

            // removeEvent(el, 't1 t2 t3', fn) or off(el, 't1 t2 t3')
            if (typeof types === 'string' && _collection.inArray(types, ' ') > 0) {

                // Once for each type.namespace in types; type may be omitted
                types = (types || '').match(evwhite) || [''];

                i = types.length;

                while (i--) {

                    removeEvent(elem, types[i], selector, fn);
                }

                return elem;
            }

            // Namespace

            if (typeof types === 'string') {
                type = types.replace(nameRegex, '');
            }

            if (type && eventTranslation[type]) {
                type = eventTranslation[type].base;
            }

            if (!types || typeof types === 'string') {
                // removeEvent(el) or off(el, t1.ns) or removeEvent(el, .ns) or removeEvent(el, .ns1.ns2.ns3)
                if ((namespaces = typeof types === 'string' && types.replace(namespaceRegex, ''))) {
                    namespaces = namespaces.split('.');
                }
                removeHandlers(elem, type, fn, namespaces, selector);
            } else if (typeof types === 'function') {
                // removeEvent(el, fn)
                removeHandlers(elem, null, types, null, selector);
            } else {
                // removeEvent(el, { t1: fn1, t2, fn2 })
                for (k in types) {
                    if (types.hasOwnProperty(k)) {
                        this.removeEvent(elem, k, types[k]);
                    }
                }
            }
            return elem;
        },

        clone = function(elem, from, type) {
            var handlers = getRegistered(from, type, null, false),
                l = handlers.length,
                i = 0,
                args, kfx2rcf;

            for (; i < l; i++) {
                if (handlers[i].original) {
                    args = [elem, handlers[i].type];
                    if ((kfx2rcf = handlers[i].handler.__kfx2rcf)) {

                        args.push(kfx2rcf);
                    }
                    args.push(handlers[i].original);
                    addEvent.apply(null, args);
                }
            }
            return elem;
        },

        //  Fires a custom event with the current element as its target.
        fire = function(elem, type, args) {

            var cur, types = type.split(' '),
                i = types.length,
                j = 0,
                nodeType = elem ? elem.nodeType : undefined,
                l, call, evt, names, handlers;

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            cur = elem || doc;

            // Don't do events on text and comment nodes

            if (!nodeType || nodeType === 3 || nodeType === 8 || !type) {
                return;
            }

            for (; i--;) {

                type = types[i].replace(nameRegex, '');

                if ((names = types[i].replace(namespaceRegex, ''))) {
                    names = names.split('.');
                }

                if (names && args) {

                    // non-native event, either because of a namespace, arguments or a non DOM element
                    // iterate over all listeners and manually 'fire'

                    handlers = getRegistered(cur, type, null, false);

                    evt = Event(null, cur);
                    evt.type = type;
                    call = args ? 'apply' : 'call';
                    args = args ? [evt].concat(args) : evt;

                    for (j = 0, l = handlers.length; j < l; j++) {
                        if (handlers[j].inNamespaces(names)) {
                            handlers[j].handler.apply(cur, args);
                        }
                    }
                } else {

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
                     * hAzzle('p').fire('customEvent');
                     *
                     * window.document.addEventListener('customEvent', handler);
                     *
                     * Width arguments:
                     * ----------------
                     *
                     * hAzzle('p').on('partytime', function(e) {
                     *       console.log(e.detail) // Console.log:  'Object { cheeseburger=true}'
                     * });
                     *
                     * hAzzle('p').fire('partytime', {'detail':{'cheeseburger':true}});
                     *
                     */

                    // create and dispatch the event

                    evt = new CustomEvent(type, args);
                    elem.dispatchEvent(evt);
                }
            }
            return elem;
        },
        once = function(rm, elem, type, fn, original) {
            return function() {
                fn.apply(this, arguments);
                rm(elem, type, original);
            };
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

        removeHandlers = function(elem, types, handler, namespaces) {

            var type = types && (eventTranslation[types] ? eventTranslation[types].base : types).replace(nameRegex, ''),
                handlers = getRegistered(elem, type, null, false),
                removed = [],
                i = 0,
                j, l = handlers.length;

            for (; i < l; i++) {

                if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
                    unregister(handlers[i]);
                    if (!removed[handlers[i].type]) {
                        removed[handlers[i].type] = handlers[i].type;
                    }
                }
            }

            // Remove the root listener if this is the last one

            for (j in removed) {
                if (!isRegistered(elem, removed[j], null, false)) {
                    elem.removeEventListener(removed[j], rootHandler, false);
                }
            }
        },

        // Iterate

        iteratee = function(elem, type, original, handler, root, fn) {

            var pfx = root ? '@' : '#',
                t;
            if (!type || (type === '*')) {
                for (t in map) {
                    if (t.charAt(0) === pfx) {
                        iteratee(elem, t.substr(1), original, handler, root, fn);
                    }
                }
            } else {
                var i, l, list = map[pfx + type],
                    all = elem === '*';

                if (!list) {
                    return;
                }

                for (i = 0, l = list.length; i < l; i++) {
                    if ((all || list[i].matches(elem, original, handler)) && !fn(list[i], list, i, type)) {
                        return;
                    }
                }
            }
        },
        // Check collection for registered event,
        // match element and handler
        isRegistered = function(elem, type, original, root) {
            var i, list = map[(root ? '@' : '#') + type];
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

        // List event handlers bound to
        // a given object for each type

        getRegistered = function(elem, type, original, root) {
            var entries = [];
            iteratee(elem, type, original, null, root, function(entry) {
                return entries.push(entry);
            });
            return entries;
        },

        register = function(entry) {
            var contains = !entry.root && !isRegistered(entry.element, entry.type, null, false),
                key = (entry.root ? '@' : '#') + entry.type;
            (map[key] || (map[key] = [])).push(entry);
            return contains;
        },

        unregister = function(entry) {

            iteratee(entry.element, entry.type, null, entry.handler, entry.root, function(entry, list, i) {
                list.splice(i, 1);
                entry.removed = true;
                if (list.length === 0) {
                    delete map[(entry.root ? '@' : '#') + entry.type];
                }
                return false;
            });
        },

        rootHandler = function(evt, type) {
            var listeners = getRegistered(this, type || evt.type, null, false),
                l = listeners.length,
                i = 0;

            evt = Event(evt, this);

            if (type) {
                evt.type = type;
            }

            for (; i < l && !evt.isImmediatePropagationStopped(); i++) {
                if (!listeners[i].removed) {
                    listeners[i].handler.call(this, evt);
                }
            }
        },

        // EVENT DELEGATION
        // Fix me! Add observer pattern for event delegation

        delegateTarget = function(event, sel, ctx) {
            var cur = event.target;
            ctx = ctx || document.documentElement;
            // Make sure the 'target' has a nodeType, and don't process clicks on disabled elements
            if (cur.nodeType && (!event.button || event.type !== 'click') && cur.disabled !== true) {
                if (cur !== ctx) {
                    return _jiesa.matches(cur, sel, /* third arg (from/root/refNode) */ ctx) ? cur : false;
                }
            }
            return false;
        },
        // Event delegate
        delegate = function(sel, fn) {
            var handler = function(event) {
                var match = delegateTarget(event, sel, this);
                if (match) {
                    fn.apply(match, arguments);
                }
            };
            handler.__kfx2rcf = {
                ft: delegateTarget,
                selector: sel
            };
            return handler;
        },

        createEventHandler = function(element, fn, condition, args) {

            var getTarget = function(evt, eventElement) { // Get delegate target
                    return fn.__kfx2rcf ? fn.__kfx2rcf.ft(evt, element) : eventElement;
                },

                handler = condition ? function(event) {
                    var target = getTarget(event, this);
                    if (condition.apply(target, arguments)) {
                        if (event) {
                            event.currentTarget = target;
                        }
                        return fn.apply(element, args ? _collection.slice(arguments).concat(args) : arguments);
                    }
                } : function(event) {


                    if (fn.__kfx2rcf) {

                        event = event.clone(getTarget(event));
                    }

                    return fn.apply(element, args ? _collection.slice(arguments).concat(args) : arguments);
                };
            handler.__kfx2rcf = fn.__kfx2rcf;
            return handler;
        },

        Event = function(event, elem) {
            return new Event.prototype.init(event, elem);
        };

    Event.prototype = {

        constructor: Event,
        init: function(event, elem) {

            // Needed for DOM0 events

            event = event || ((elem.ownerDocument ||
                    elem.document ||
                    elem).parentWindow ||
                win).event;

            this.originalEvent = event;

            if (!event) {
                return;
            }

            // Support: Cordova 2.5 (WebKit)
            // All events should have a target; Cordova deviceready doesn't
            if (!event.target) {
                event.target = document;
            }
            var type = event.type,
                // fired element (triggering the event)
                target = event.target || event.srcElement || document,
                i, p, props, cleaned;


            this.target = target.nodeType === 3 ? target.parentElement : target; // Support: Safari 6.0+, Chrome<28
            this.timeStamp = Date.now(); // Set time event was fixed

            cleaned = fixHook[type];

            if (!cleaned) {

                fixHook[type] =

                    keyEvent.test(type) ? function(event, original) { // keys
                        // Add which for key events
                        if (!event.which) {
                            event.which = original.charCode != null ? original.charCode : original.keyCode;
                        }
                        return keyProps;
                    } :
                    mouseEvent.test(type) ? function(event, original, type) { // mouse

                        var eventDoc, doc, body, button = original.button;

                        // Calculate pageX/Y if missing and clientX/Y available
                        if (event.pageX == null && original.clientX != null) {

                            eventDoc = event.target.ownerDocument || document;
                            doc = eventDoc.documentElement;
                            body = eventDoc.body;

                            event.pageX = original.clientX +
                                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                                (doc && doc.clientLeft || body && body.clientLeft || 0);
                            event.pageY = original.clientY +
                                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                                (doc && doc.clientTop || body && body.clientTop || 0);
                        }


                        // click: 1 === left; 2 === middle; 3 === right
                        if (!event.which && button !== undefined) {
                            event.which = button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0));
                        }

                        if (type === 'mouseover' || type === 'mouseenter') {
                            original.relatedTarget = event.relatedTarget || event.fromElement;
                        } else if (type === 'mouseout' || type === 'mouseleave') {
                            original.relatedTarget = event.relatedTarget || event.toElement;
                        }

                        return mouseProps;
                    } :
                    textEvent.test(type) ? function() { // text
                        return textProps;
                    } :
                    mouseWheelEvent.test(type) ? function(event, original, type) { // mouseWheel
                        if (type === 'wheel') {
                            event.deltaMode = original.deltaMode;
                            event.deltaX = original.deltaX;
                            event.deltaY = original.deltaY;
                            event.deltaZ = original.deltaZ;
                        } else {
                            event.type = 'wheel';
                            event.deltaMode = 0; // deltaMode === 0 => scrolling in pixels (in Chrome default wheelDeltaY is 120)
                            event.deltaX = -1 * original.wheelDeltaX;
                            event.deltaY = -1 * original.wheelDeltaY;
                            event.deltaZ = 0; // not supported
                        }

                        return mouseWheelProps;
                    } :
                    touchEvent.test(type) ? function() { // touch and gestures
                        return touchProps;
                    } :
                    popstateEvent.test(type) ? function() { // popstate
                        return stateProps;
                    } :
                    messageEvent.test(type) ? function() { // messages
                        return messageProps;
                    } :
                    function() { // common
                        return commonProps;
                    };
            }

            props = commonProps.concat(fixHook[type](this, event, type));

            for (i = props.length; i--;) {
                if (!((p = props[i]) in this) && p in event) {
                    this[p] = event[p];
                }
            }
            return this;
        },

        // Prevent default action

        preventDefault: function() {
            var e = this.originalEvent;
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },

        // Stop event propagation

        stopPropagation: function() {
            var e = this.originalEvent;
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        // Block any further event processing
        stop: function() {
            this.preventDefault();
            this.stopPropagation();

            // Set a 'stopped' property so that a custom event can be inspected
            // after the fact to determine whether or not it was stopped.
            this.stopped = true;
        },

        stopImmediatePropagation: function() {
            var e = this.originalEvent;
            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            this.isImmediatePropagationStopped = function() {
                return true;
            };
        },
        isImmediatePropagationStopped: function() {
            var e = this.originalEvent;

            return e.isImmediatePropagationStopped && e.isImmediatePropagationStopped();
        },
        clone: function(target) {
            var nE = Event(this, this.element);
            nE.currentTarget = target;
            return nE;
        }
    };

    Event.prototype.init.prototype = Event.prototype;

    // Registry

    var Registry = function(element, type, handler, original, ns, args, root) {
        return new Registry.prototype.init(element, type, handler, original, ns, args, root);
    };

    Registry.prototype = {
        constructor: Registry,
        init: function(element, type, handler, original, ns, args, root) {

            var customType = eventTranslation[type];

            // If unload, remove the listener 
            if (type === 'unload') {
                handler = once(removeHandlers, element, type, handler, original);
            }

            if (customType) {
                if (customType.handler) {
                    handler = createEventHandler(element, handler, customType.handler, args);
                }
                type = customType.base || type;
            }

            this.element = element;
            this.type = type;
            this.original = original;
            this.namespaces = ns;
            this.eventType = type;
            this.target = element;
            this.root = root;
            this.handler = createEventHandler(element, handler, null, args);
        },

        // Checks if there are any namespaces when we are
        // using the fire() function

        inNamespaces: function(checkNamespaces) {

            var self = this,
                index, subdex, count = 0;

            if (!checkNamespaces) {
                return true;
            }

            if (!this.namespaces) {
                return false;
            }

            index = checkNamespaces.length;

            while (index--) {
                for (subdex = self.namespaces.length; subdex--;) {
                    if (checkNamespaces[index] === self.namespaces[index]) {
                        count++;
                    }
                }
            }
            return checkNamespaces.length === count;
        },

        matches: function(elem, original, handler) {
            return this.element === elem &&
                (!original || this.original === original) &&
                (!handler || this.handler === handler);
        }
    };

    Registry.prototype.init.prototype = Registry.prototype;

    // Add event to element

    this.on = function(events, selector, fn) {
        return this.each(function(el) {
            addEvent(el, events, selector, fn);
        });
    };

    this.one = function(events, selector, fn) {
        return this.each(function(el) {
            addEvent(el, events, selector, fn, 1);
        });
    };

    // Remove event from element

    this.off = function(events, fn) {
        return this.each(function(el) {
            removeEvent(el, events, fn);
        });
    };

    // Trigger specific event for element collection

    this.fire = function(type, args) {
        return this.each(function(el) {
            fire(el, type, args);
        });
    };

    this.hover = function(fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    };

    // Clone events attached to elements

    this.cloneEvents = function(cloneElem, type) {
        return this.each(function(el) {
            return clone(el, cloneElem, type);
        });
    };

    //  Fires a custom event of name `eventName` with `element` as its target.

    this.customEvent = function(eventName, detail, bubble, cancel) {
        var event = new CustomEvent(eventName, {
            detail: _types.isType('Object')(detail) ? detail : {},
            bubbles: _types.isBoolean(bubble) ? bubble : false,
            cancelable: _types.isBoolean(cancel) ? cancel : false
        });
        this.elements[0].dispatchEvent(event);
    };

    this.ready = function(callback) {
        this.elements[0].addEventListener('DOMContentLoaded', callback, false);
    };

    _util.each(('blur focus focusin focusout load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select submit keydown keypress keyup error contextmenu').split(' '), function(prop) {

        // Handle event binding
        this[prop] = function(data, fn) {
            return arguments.length > 0 ?
                this.on(prop, data, fn) :
                this.fire(prop);
        };

    }.bind(this));

    // Mouse wheel

    eventTranslation.mousewheel = {
        base: 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll'
    };

    // Populate the custom event list

    _util.each({
        mouseenter: 'mouseover',
        mouseleave: 'mouseout',
        pointerenter: 'pointerover',
        pointerleave: 'pointerout'
    }, function(fix, orig) {
        eventTranslation[orig] = {
            base: fix,
            handler: function(event) {
                var target = this,
                    related = event.relatedTarget;

                if (related == null) {
                    return true;
                }
                if (!related) {
                    return false;
                }
                // For mousenter/leave call the handler if related is outside the target.
                return (related !== target && related.prefix !== 'xul' && !/document/.test(target.toString()) !== 'document' && !_core.contains(target, related));
            }
        };
    });

    return {
        propHook: propHook,
        on: addEvent,
        one: one,
        off: removeEvent,
        clone: clone,
        fire: fire
    };
});
