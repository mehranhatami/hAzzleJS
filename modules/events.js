var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('Events', function() {

    var // Include needed modules
        _util = hAzzle.require('Util'),
        _collection = hAzzle.require('Collection'),
        _jiesa = hAzzle.require('Jiesa'),

        win = window,
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
        overOut = /over|out/,
        cache = [],
        slice = Array.prototype.slice;

    function returnTrue() {
        return true;
    }
    var eventCore = {};
    eventCore.event = {

        'global': {},

        /**
         * Add event to element.
         * Using addEventListener
         *
         * @param {Object} elem
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         */

        addEvent: function(elem, events, selector, fn, /* internal */ one) {

            var originalFn, type, types, i, args, entry, first,
                namespaces, evto;

            // Don't attach events to text/comment nodes 

            if (elem.nodeType === 3 || elem.nodeType === 8 || !events) {

                return;
            }

            /**
             * Attach multiple events on an object.
             *
             * Note!
             *
             * For event delegation, you use:
             *
             *   func:
             *   delegate:
             *
             * wrapped inside an object after the event type.
             * All events will then be delegated
             *
             * Examples:
             *
             * Multiple events
             * ---------------
             *
             *  hAzzle('p'.on(element, {
             *
             *         click: function (e) {},
             *         mouseover: function (e) {},
             *  });
             *
             *
             * Multiple events - event delegation:
             * -----------------------------------
             *
             *  hAzzle( "body" ).on({
             *
             *   click: {
             *
             *     func: function (e) {}
             *     delegate: 'p'
             *  }
             *  });
             *
             */

            if (typeof events === 'object') {

                for (type in events) {

                    if (events.hasOwnProperty(type)) {

                        evto = events[type];

                        if (typeof evto === 'object') {

                            eventCore.event.addEvent.call(this, elem, type, evto.delegate, evto.func);

                        } else {

                            eventCore.event.addEvent.call(this, elem, type, events[type]);
                        }
                    }
                }

                return;
            }

            // Event delegation

            if (typeof selector !== 'function') {
                originalFn = fn;
                args = slice.call(arguments, 4);
                fn = delegate(selector, originalFn);
            } else {
                args = slice.call(arguments, 3);
                fn = originalFn = selector;
            }

            // Handle multiple events separated by a space

            types = (events || "").match(evwhite) || [""];

            // special case for one(), wrap in a self-removing handler

            if (one === 1) {

                fn = eventCore.event.once(eventCore.event.removeEvent, elem, events, fn, originalFn);
            }

            i = types.length;

            while (i--) {

                // event type

                type = types[i].replace(nameRegex, '');

                // There *must* be a type, no attaching namespace-only handlers

                if (!type) {

                    continue;
                }

                /* If event delegation, check for eventHooks

             Note !! This is important. For us to get 'mouseenter'
             to work on delegated events, we use 'hooks'.
             'mouseenter' will then become 'mouseover' and work
             right out of the box.

             A possible problem can occur when we are going to delete
             the delegated events. We have to turn it back to normal
             event type before removing it. 
			 
             It can be done if we are using an hook for this inside
             the function for removing delegated events, and not inside
             the main function itself. This for better performance.

             Keep that in mind !!
			 
			 */

                var hooks = eventCore.eventHooks[type] || {};

                if (hooks && ("delegateType" in hooks)) {
                    type = selector ? hooks.delegateType : type;
                }

                // namespaces

                namespaces = types[i].replace(namespaceRegex, '').split('.').sort();

                first = eventCore.event.put(entry = new Registry(
                    elem,
                    type,
                    fn,
                    originalFn,
                    namespaces,
                    args,
                    false // not root
                ));

                // Add roothandler if we're the first

                if (first) {

                    type = entry.eventType;

                    // Trigger eventHooks if any
                    // e.g. support for "bubbling" focus and blur events

                    hooks = eventCore.eventHooks[type];

                    if (hooks && ("simulate" in hooks)) {
                        hooks.simulate(elem, type);
                    }

                    elem.addEventListener(type, rootListener, false);
                }
            }

            eventCore.event.global[entry.eventType] = true;
        },

        once: function(rm, element, type, fn, originalFn) {
            // wrap the handler in a handler that does a remove as well
            return function() {
                fn.apply(this, arguments);
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
         *  eventCore( delegated node, root node).off()
         *
         */

        removeEvent: function(elem, evt, selector, fn) {

            var k, type, namespaces, i;

            if (!elem) {
                return;
            }

            if (selector === false || typeof selector === "function") {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }

            // eventCore.inArray() are faster then native indexOf, and this
            // has to be fast

            if (typeof evt === 'string' && _collection.inArray(evt, ' ') > 0) {

                // Handle multiple events separated by a space

                evt = (evt || "").match(evwhite) || [""];

                i = evt.length;

                while (i--) {

                    this.removeEvent(elem, evt[i], selector, fn);
                }

                return elem;
            }

            // Check for namespace

            if (typeof evt === 'string') {

                type = evt.replace(nameRegex, '');
            }

            if (type) {

                // Checks if any "type" need special threatment
                // e.g. mouseenter and mouseleave

                var hooks = eventCore.eventHooks[type];

                if (hooks && ("specialEvents" in hooks)) {
                    type = hooks.specialEvents.name || type;
                }
            }

            if (!evt || typeof evt === 'string') {

                // namespace

                if ((namespaces = typeof evt === 'string' && evt.replace(namespaceRegex, ''))) {

                    namespaces = namespaces.split('.').sort();
                }

                eventCore.event.remove(elem, type, fn, namespaces, selector);

            } else if (typeof evt === 'function') {

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

        clone: function(element, from, type) {
            var handlers = eventCore.event.get(from, type, null, false),
                l = handlers.length,
                i = 0,
                args, core;

            for (; i < l; i++) {
                if (handlers[i].original) {
                    args = [element, handlers[i].type];
                    if ((core = handlers[i].handler.__kfx2rcf)) {

                        args.push(core);
                    }

                    args.push(handlers[i].original);
                    eventCore.event.addEvent.apply(null, args);
                }
            }
            return element;
        },

        trigger: function(elem, type, args) {

            var cur, types = type.split(' '),
                i = types.length,
                j = 0,
                l, call, evt, names, handlers;

            cur = elem || doc;

            // Don't do events on text and comment nodes

            if (elem.nodeType === 3 || elem.nodeType === 8 || !type) {

                return;
            }

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
                     * window.document.addEventListener("customEvent", handler);
                     *
                     */

                    evt = document.createEvent('HTMLEvents');
                    evt.initEvent(type, true, true, win, 1);
                    elem.dispatchEvent(evt);

                } else {

                    // non-native event, either because of a namespace, arguments or a non DOM element
                    // iterate over all listeners and manually 'fire'

                    handlers = eventCore.event.get(cur, type, null, false);

                    evt = eventCore.Event(null, cur);

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

        remove: function(elem, types, handler, namespaces) {

            var type = types && types.replace(nameRegex, ''),
                handlers = eventCore.event.get(elem, type, null, false),
                removed = [],
                i = 0,
                j,
                l = handlers.length;

            for (; i < l; i++) {

                if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
                    eventCore.event.del(handlers[i]);
                    if (!removed[handlers[i].type]) {
                        removed[handlers[i].type] = handlers[i].type;
                    }
                }
            }

            // Remove the root listener if this is the last one

            for (j in removed) {
                if (!eventCore.event.has(elem, removed[j], null, false)) {
                    elem.removeEventListener(removed[j], rootListener, false);
                }
            }
        },

        map: {},

        // This functions are developed with inspiration from Bean

        loopThrough: function(elem, type, original, handler, root, fn) {

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

        has: function(elem, type, original, root) {

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

        get: function(elem, type, original, root) {
            var entries = [];
            this.loopThrough(elem, type, original, null, root, function(entry) {
                return entries.push(entry);
            });
            return entries;
        },

        put: function(entry) {
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

        del: function(entry) {

            var self = this;

            this.loopThrough(entry.element, entry.type, null, entry.handler, entry.root, function(entry, list, i) {

                list.splice(i, 1);

                entry.removed = true;

                if (list.length === 0) {

                    delete self.map[(entry.root ? 'r' : '#') + entry.type];
                }
                return false;
            });
        },

        entries: function() {
            var t, entries = [],
                self = this;

            for (t in self.map) {
                if (t.charAt(0) == '#') {
                    entries = entries.concat(self.map[t]);
                }
            }

            return entries;
        },
        fixHook: {},

        // Common properties for all event types

        props: ('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail ' +
            'eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget ' +
            'shiftKey srcElement target timeStamp type view which propertyName').split(' '),

        // Return all common properties

        common: function() {
            return eventCore.event.props;
        },

        keyHooks: function(event, original) {

            original.keyCode = event.keyCode || event.which;

            return 'char charCode key keyCode keyIdentifier keyLocation location'.split(' ');
        },

        mouseHooks: function(event, original, type) {

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
            if (overOut.test(type)) {
                original.relatedTarget = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
            }

            return 'button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' ');
        },

        textHooks: function() {

            return 'data';
        },

        mouseWheelHooks: function() {

            return ('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
                'axis button buttons clientX clientY dataTransfer ' +
                'fromElement offsetX offsetY pageX pageY screenX screenY toElement').split(' ');
        },

        touchHooks: function() {

            return 'touches targetTouches changedTouches scale rotation'.split(' ');
        },

        messageHooks: function() {

            return 'data origin source'.split(' ');
        },

        popstateHooks: function() {

            return 'state';
        }
    };

    eventCore.eventHooks = {};


    eventCore.Event = function(event, element) {

        // Allow instantiation without the 'new' keyword
        if (!(this instanceof eventCore.Event)) {
            return new eventCore.Event(event, element);
        }

        if (!arguments.length) {
            return;
        }

        event = event || ((element.ownerDocument || element.document || element).parentWindow || win).event;

        if (!event) {

            return;
        }

        var self = this,
            type = event.type,
            target = event.target || event.srcElement,
            i, p, props, cleaned;

        self.originalEvent = event;
        self.target = target && target.nodeType === 3 ? target.parentNode : target;

        cleaned = eventCore.event.fixHook[type];

        if (!cleaned) {

            eventCore.event.fixHook[type] = cleaned =

                // focusIn / focusOut

                //        focusinoutEvent.test(type) ? eventCore.event.focusinout :

                mouseEvent.test(type) ? eventCore.event.mouseHooks :

                // keys

                keyEvent.test(type) ? eventCore.event.keyHooks :

                // text

                textEvent.test(type) ? eventCore.event.textHooks :

                // mouseWheel

                mouseWheelEvent.test(type) ? eventCore.event.mouseWheelHooks :

                // touch and gestures

                touchEvent.test(type) ? eventCore.event.touchHooks :

                // popstate

                popstateEvent.test(type) ? eventCore.event.popstateHooks :

                // messages

                messageEvent.test(type) ? eventCore.event.messageHooks :

                // common

                eventCore.event.common;
        }

        props = cleaned(event, self);

        props = eventCore.event.props;

        for (i = props.length; i--;) {

            if (!((p = props[i]) in this) && p in event) this[p] = event[p];
        }

        return self;
    };

    /* =========================== EVENT PROPAGATION ========================== */

    eventCore.Event.prototype = {

        preventDefault: function() {

            var e = this.originalEvent;

            this.isDefaultPrevented = returnTrue;

            if (e && e.preventDefault) {

                e.preventDefault();

            } else {

                e.returnValue = false;
            }
        },
        stopPropagation: function() {

            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if (e && e.stopPropagation) {

                e.stopPropagation();

            } else {

                e.cancelBubble = true;
            }
        },

        // Set a "stopped" property so that a custom event can be inspected

        stop: function() {
            this.stopped = true;
            this.preventDefault();
            this.stopPropagation();

        },

        stopImmediatePropagation: function() {

            var e = this.originalEvent;

            if (e && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }

            this.isImmediatePropagationStopped = returnTrue;
        },
        isImmediatePropagationStopped: function() {

            var toE = this.originalEvent;

            if (toE.isImmediatePropagationStopped) {

                return toE.isImmediatePropagationStopped();
            }
        },
        clone: function(currentTarget) {
            //TODO: this is ripe for optimisation, new events are *expensive*
            // improving this will speed up delegated events
            var ne = eventCore.Event(this, this.element);
            ne.currentTarget = currentTarget;
            return ne;
        }
    };

    // Registry

    function Registry(element, type, handler, original, namespaces, args, root) {

        // Checks if any "type" need special threatment
        // e.g. mouseenter and mouseleave

        var reg = this,
            hooks = eventCore.eventHooks[type];

        if (hooks && ("specialEvents" in hooks)) {
            handler = reg.twistedBrain(element, handler, hooks.specialEvents.handler, args);
            type = hooks.specialEvents.name || type;
        }

        // If unload, remove the listener 
        if (type === 'unload') {

            handler = eventCore.event.once(eventCore.event.remove, element, type, handler, original);
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

        twistedBrain: function(element, fn, condition, args) {
            var call = function(event, eargs) {
                    return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
                },

                // Get correct target for delegated events

                getTarget = function(evt, eventElement) {
                    var target = fn.__kfx2rcf ? findTarget(fn.__kfx2rcf.selector, evt.target, this) : eventElement;
                    fn.__kfx2rcf.currentTarget = target;
                    return target;
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

    /* =========================== PRIVATE FUNCTIONS ========================== */

    /**
     * Root listener
     *
     * @param {String} evt
     * @param {String} type
     * @return {hAzzle}
     */

    function rootListener(evt, type) {

        var listeners = eventCore.event.get(this, type || evt.type, null, false),
            l = listeners.length,
            i = 0;

        evt = eventCore.Event(evt, this, true);

        if (type) {

            evt.type = type;
        }

        for (; i < l && !evt.isImmediatePropagationStopped(); i++) {

            if (!listeners[i].removed) {

                listeners[i].handler.call(this, evt);
            }
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

        var i, matches = cache[selector] ? cache[selector] : cache[selector] = _jiesa.find(selector, elem);
        for (; target !== elem; target = target.parentNode || elem) {
            if (matches !== null) {

                // Note!! if you use an while-loop here, you are sending
                // Firefox into infinity with huge crach

                for (i = matches.length; i--;) {
                    if (matches[i] === target) {
                        return target;
                    }
                }
            }
        }
    }

    function delegate(selector, fn) {

        // Todo!  Add RAF support 

        function handler(e) {

            var cur = e.target,
                type = e.type;

            if (cur.nodeType && (!e.button || type !== 'click')) {

                // Don't process clicks on disabled elements

                if (e.target.disabled !== true || type !== 'click') {

                    var m = null;

                    if (handler.__kfx2rcf) {
                        m = handler.__kfx2rcf.currentTarget;
                    }
                    if (m) {

                        return fn.apply(m, arguments);
                    }
                }
            }
        }

        handler.__kfx2rcf = {

            // Don't conflict with Object.prototype properties

            selector: selector + ' '
        };

        return handler;
    }

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
            eventCore.event.addEvent(el, events, selector, fn);
        });
    };
    this.one = function(events, selector, fn) {
        return this.each(function(el) {
            eventCore.event.addEvent(el, events, selector, fn, 1);
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

    this.off = function(events, selector, fn) {
        return this.each(function(el) {
            eventCore.event.removeEvent(el, events, selector, fn);
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
            eventCore.event.trigger(el, type, args);
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
            eventCore.event.clone(el, cloneElem, type);
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
    
    return {
        /*     on: on,
             one: one,
             off: off,
             clone: clone,
             trigger: fire,*/
    };
});