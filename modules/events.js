var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('Events', function() {

    var win = window,
        doc = window.document || {},
        docElem = doc.documentElement,
        evwhite = (/\S+/g),
        mouseEvent = /^click|mouse(?!(.*wheel|scroll))|menu|pointer|contextmenu|drag|drop/i,
        keyEvent = /^key/,
        namespaceRegex = /^([^\.]*(?=\..*)\.|.*)/,
        nameRegex = /(\..*)/,
        textEvent = /^text/i,
        mouseWheelEvent = /mouse.*(wheel|scroll)/i,
        touchEvent = /^touch|^gesture/i,
        messageEvent = /^message$/i,
        popstateEvent = /^popstate$/i,
        map = {},

        customEvents = {},

        // Include needed modules
        _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _collection = hAzzle.require('Collection'),
        _types = hAzzle.require('Types'),
        _jiesa = hAzzle.require('Jiesa'),
        slice = Array.prototype.slice,

        global = {},

        // Add event to element

        addEvent = function(elem, events, selector, fn, /* internal */ one) {

            // Check if typeof hAzzle, then wrap it out, and return current elem

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            var original, type, types, i, args, entry, first,
                namespaces;

            // Don't attach events to text/comment nodes 

            if (elem.nodeType === 3 || elem.nodeType === 8 || !events) {
                return;
            }

            // Types can be a map of types/handlers

            if (_types.isType(events) === 'object') {
                if (typeof selector !== 'string') {
                    fn = selector;
                    selector = undefined;
                }
                for (type in events) {
                    addEvent(elem, type, events[type]);
                }
                return;
            }

            // Event delegation

            if (!_types.isFunction(selector)) {
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

                type = types[i].replace(nameRegex, '');

                // There *must* be a type, no attaching namespace-only handlers

                if (!type) {

                    continue;
                }

                // namespaces

                namespaces = types[i].replace(namespaceRegex, '').split('.'); // namespaces

                // Registrer
                first = register(entry = new Registry(
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

            global[entry.eventType] = true;
        },

        once = function(rm, elem, type, fn, original) {
            return function() {
                fn.apply(this, arguments);
                rm(elem, type, original);
            };
        },

        // Remove event from element

        removeEvent = function(elem, types, selector, fn) {

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            var k, type, namespaces, i;

            if (!elem) {
                return;
            }

            if (typeof types === 'string' && _collection.inArray(types, ' ') > 0) {

                types = (types || '').match(evwhite) || [''];

                i = types.length;

                while (i--) {
                    this.removeEvent(elem, types[i], selector, fn);
                }

                return elem;
            }

            // Check for namespace

            if (typeof types === 'string') {
                type = types.replace(nameRegex, '');
            }

            if (type && customEvents[type]) {
                type = customEvents[type].base;
            }

            if (!types || typeof types === 'string') {

                // namespace

                if ((namespaces = typeof types === 'string' && types.replace(namespaceRegex, ''))) {
                    namespaces = namespaces.split('.');
                }

                removeHandlers(elem, type, fn, namespaces, selector);

            } else if (typeof types === 'function') {
                removeHandlers(elem, null, types, null, selector);
            } else {
                for (k in types) {
                    if (types.hasOwnProperty(k)) {
                        this.removeEvent(elem, k, types[k]);
                    }
                }
            }

            return elem;
        },

        clone = function(element, from, type) {
            var handlers = getRegistered(from, type, null, false),
                l = handlers.length,
                i = 0,
                args, kfx2rcf;

            for (; i < l; i++) {
                if (handlers[i].original) {
                    args = [element, handlers[i].type];
                    if ((kfx2rcf = handlers[i].handler.__kfx2rcf)) {

                        args.push(kfx2rcf);
                    }
                    args.push(handlers[i].original);
                    addEvent.apply(null, args);
                }
            }
            return element;
        },

        // Trigger specific event for element collection
        trigger = function(elem, type, args) {

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            // Don't do events on text and comment nodes

            if (elem.nodeType === 3 || elem.nodeType === 8 || !type) {
                return;
            }

            var cur, types = type.split(' '),
                i = types.length,
                j = 0,
                canContinue,
                l, call, evt, names, handlers;

            cur = elem || doc;

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
                    canContinue = event.returnValue !== false;
                } else {

                    evt = document.createEvent('HTMLEvents');
                    evt.initEvent(type, true, true, win, 1);
                    canContinue = elem.dispatchEvent(evt);
                }
                return canContinue;
            }
            return elem;
        },

        removeHandlers = function(elem, types, handler, namespaces) {

            var type = types && types.replace(nameRegex, ''),
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

            var pfx = root ? '€' : '#',
                t;

            if (!type || type == '*') {
                for (t in map) {
                    if (t.charAt(0) == pfx) {
                        iteratee(elem, t.substr(1), original, handler, root, fn);
                    }
                }
            } else {

                var i = 0,
                    l,
                    list = map[pfx + type],
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
        // Check collection for registered event,
        // match element and handler
        isRegistered = function(elem, type, original, root) {

            var i, list = map[(root ? '€' : '#') + type];

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

        // List event handlers bound to a given object for each type

        getRegistered = function(elem, type, original, root) {
            var entries = [];
            iteratee(elem, type, original, null, root, function(entry) {
                return entries.push(entry);
            });
            return entries;
        },

        register = function(entry) {
            var contains = !entry.root && !isRegistered(entry.element, entry.type, null, false),
                key;

            if (entry.root) {
                key = '€' + entry.type;
            } else {
                key = '#' + entry.type;
            }

            (map[key] || (map[key] = [])).push(entry);

            return contains;
        },

        unregister = function(entry) {

            iteratee(entry.element, entry.type, null, entry.handler, entry.root, function(entry, list, i) {

                list.splice(i, 1);

                entry.removed = true;

                if (list.length === 0) {

                    delete map[(entry.root ? '€' : '#') + entry.type];
                }
                return false;
            });
        },

        fixHook = {},

        // Common properties for all event types

        props = ('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail ' +
            'eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget ' +
            'shiftKey srcElement target timeStamp type view which propertyName').split(' '),

        // Return all common properties

        common = function() {
            return props;
        },

        keyHooks = function(event, original) {

            original.keyCode = event.keyCode || event.which;

            return 'char charCode key keyCode keyIdentifier keyLocation location'.split(' ');
        },

        mouseHooks = function(event, original, type) {

            original.rightClick = event.which === 3 || event.button === 2;
            original.pos = {
                x: 0,
                y: 0
            };

            if (event.pageX || event.pageY) {
                original.clientX = event.pageX;
                original.clientY = event.pageY;
            } else if (event.clientX || event.clientY) {
                original.clientX = event.clientX + document.body.scrollLeft + docElem.scrollLeft;
                original.clientY = event.clientY + document.body.scrollTop + docElem.scrollTop;
            }
            if (type === 'mouseover' || type === 'mouseout') {
                original.relatedTarget = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
            }

            return 'button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' ');
        },

        textHooks = function() {

            return 'data';
        },

        mouseWheelHooks = function() {

            return ('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
                'axis button buttons clientX clientY dataTransfer ' +
                'fromElement offsetX offsetY pageX pageY screenX screenY toElement').split(' ');
        },

        touchHooks = function() {

            return 'touches targetTouches changedTouches scale rotation'.split(' ');
        },

        messageHooks = function() {

            return 'data origin source'.split(' ');
        },

        popstateHooks = function() {

            return 'state';
        };

    var Event = function(event, elem) {

        // Allow instantiation without the 'new' keyword
        if (!(this instanceof Event)) {
            return new Event(event, elem);
        }

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
            target = event.target || event.srcElement,
            i, p, props, cleaned;

        // Support: Safari 6.0+, Chrome<28
        this.target = target.nodeType === 3 ? target.parentNode : target;
        this.timeStamp = Date.now(); // Set time event was fixed

        cleaned = fixHook[type];

        if (!cleaned) {

            fixHook[type] = cleaned =

                mouseEvent.test(type) ? mouseHooks :

                // keys

                keyEvent.test(type) ? keyHooks :

                // text

                textEvent.test(type) ? textHooks :

                // mouseWheel

                mouseWheelEvent.test(type) ? mouseWheelHooks :

                // touch and gestures

                touchEvent.test(type) ? touchHooks :

                // popstate

                popstateEvent.test(type) ? popstateHooks :

                // messages

                messageEvent.test(type) ? messageHooks :

                // common

                common;
        }

        props = cleaned(event, this, type);

        props = props;

        for (i = props.length; i--;) {

            if (!((p = props[i]) in this) && p in event) {

                this[p] = event[p];

            }
        }

        return this;
    };

    /* =========================== EVENT PROPAGATION ========================== */

    Event.prototype = {
        constructor: Event,
        // prevent default action

        preventDefault: function() {
            var e = this.originalEvent;
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },

        // stop event propagation

        stopPropagation: function() {
            var e = this.originalEvent;
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        // block any further event processing
        stop: function() {
            this.preventDefault();
            this.stopPropagation();
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
            var nE = new Event(this, this.element);
            nE.currentTarget = target;
            return nE;
        }
    };

    // Registry

    function Registry(element, type, handler, original, namespaces, args, root) {

        var customType = customEvents[type];

        // If unload, remove the listener 
        if (type === 'unload') {
            handler = once(removeHandlers, element, type, handler, original);
        }

        if (customType) {
            if (customType.condition) {
                handler = this.createEventHandler(element, handler, customType.condition, args);

            }
            type = customType.base || type;
        }

        this.element = element;
        this.type = type;
        this.original = original;
        this.namespaces = namespaces;
        this.eventType = type;
        this.target = element;
        this.root = root;
        this.handler = this.createEventHandler(element, handler, null, args);
    }


    Registry.prototype = {

        createEventHandler: function(element, fn, condition, args) {


            var call = function(event, eargs) {
                    return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
                },

                // Get correct target for delegated events

                getTarget = function(evt, eventElement) {
                    return fn.__kfx2rcf ? fn.__kfx2rcf.ft(evt.target, element) : eventElement;
                },

                handler = condition ? function(event) {
                    var target = getTarget(event, this);
                    if (condition.apply(target, arguments)) {
                        if (event) {

                            event.currentTarget = target;
                        }

                        return call(event, arguments);
                    }
                } : function(event) {

                    if (fn.__kfx2rcf) {

                        event = event.clone(getTarget(event));
                    }

                    return call(event, arguments);
                };
            handler.__kfx2rcf = fn.__kfx2rcf;
            return handler;
        },

        /**
         * Checks if there are any namespaces when we are
         * using the trigger() function
         */

        inNamespaces: function(checkNamespaces) {

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

                // Fix me! Goes into infinity loop and crach Firefox
                // if we try to use while-loop here

                for (j = self.namespaces.length; j--;) {
                    if (checkNamespaces[i] === self.namespaces[j]) {

                        c++;
                    }
                }
            }
            return checkNamespaces.length === c;
        },

        matches: function(checkElement, checkOriginal, checkHandler) {
            return this.element === checkElement &&
                (!checkOriginal || this.original === checkOriginal) &&
                (!checkHandler || this.handler === checkHandler);
        }
    };


    function rootHandler(evt, type) {

        var listeners = getRegistered(this, type || evt.type, null, false),
            l = listeners.length,
            i = 0;

        evt = Event(evt, this, true);

        if (type) {

            evt.type = type;
        }

        for (; i < l && !evt.isImmediatePropagationStopped(); i++) {

            if (!listeners[i].removed) {

                listeners[i].handler.call(this, evt);
            }
        }
    }

    // Find event delegate
    var findDelegate = function(target, selector, root) {

            if (root) {

                var i, els = typeof selector === 'string' ? _jiesa.find(selector, root, true) : root;

                for (; target && target !== root; target = target.parentElement) {
                    for (i = els.length; i--;) {
                        if (els[i] === target) {
                            return target;
                        }
                    }
                }
            }
        },
        // Event delegate

        delegate = function(selector, fn) {

            var handler = function(e) {
                var cur = e.target;
                // Don't process clicks on disabled elements
                if (cur.nodeType && cur.disabled !== true) {
                    var m = findDelegate(cur, selector, this);
                    if (m) {
                        fn.apply(m, arguments);
                    }
                }
            };

            handler.__kfx2rcf = {
                ft: findDelegate,
                selector: selector
            };
            return handler;
        };

    /**
     * Add event to element
     *
     * @param {String} events
     * @param {String} selector
     * @param {Function} fn
     * @return {hAzzle}
     */

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

    /**
     * Remove event from element
     *
     * @param {String} events
     * @param {String} selector
     * @param {Function} fn
     * @return {hAzzle}
     */

    this.off = function(events, fn) {
        return this.each(function(el) {
            removeEvent(el, events, fn);
        });
    };

    /**
     * Trigger specific event for element collection
     *
     * @param {String} type
     * @return {hAzzle}
     */

    this.trigger = function(type, args) {

        return this.each(function(el) {
            trigger(el, type, args);
        });
    };

    this.hover = function(fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    };

    /**
     * Clone events attached to elements
     *
     * @param {Object} cloneElem
     * @param {String} type (e.g. 'click', 'mouseover')
     * @return {hAzzle}
     */

    this.cloneEvents = function(cloneElem, type) {
        return this.each(function(el) {
            clone(el, cloneElem, type);
        });
    };

    _util.each(('blur focus focusin focusout load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select submit keydown keypress keyup error contextmenu').split(' '), function(prop) {

        // Handle event binding
        this[prop] = function(data, fn) {
            return arguments.length > 0 ?
                this.on(prop, data, fn) :
                this.trigger(prop);
        };


    }.bind(this));


    // Mouse wheel

    customEvents.mousewheel = {
        base: 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll'

    };

    // Populate the custom event list

    _util.each({
        mouseenter: 'mouseover',
        mouseleave: 'mouseout',
        pointerenter: 'pointerover',
        pointerleave: 'pointerout'
    }, function(fix, orig) {
        customEvents[orig] = {
            base: fix,
            condition: function(event) {

                var target = this,
                    related = event.relatedTarget;

                if (related == null) {
                    return true;
                }
                if (!related) {
                    return false;
                }
                return (related !== target && related.prefix != 'xul' && !/document/.test(target.toString()) !== 'document' && !_core.contains(this, related));
            }
        };
    });


    return {

        addEvent: addEvent,
        removeEvent: removeEvent,
        clone: clone,
        fire: trigger
    };
});