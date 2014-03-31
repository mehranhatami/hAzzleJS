    var win = window,
        addEvent = 'addEventListener',
        removeEvent = 'removeEventListener',
        own = 'hasOwnProperty',
        call = 'call',
        doc = document || {},
        root = doc.documentElement || {},

        prefixCache = [],

       expro = { 
	   
        namespaceRegex: /[^\.]*(?=\..*)\.|.*/,
        nameRegex: /\..*/
	   
	   },

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,
        ObjProto = Object.prototype,

        /**
         * Create reference for speeding up the access to the prototype.
         */

        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,

        nativeKeys = Object.keys || function (obj) {
            if (obj !== Object(obj)) throw "Syntax error, unrecognized expression: Invalid object";
            var keys = [];
            for (var key in obj)
                if (own[call](obj, key)) keys.push(key);
            return keys;
        };

    function check(evt) {
        if (evt = evt.relatedTarget) {
            var ac;
            if (ac = evt !== this)
                if (ac = "xul" !== evt.prefix)
                    if (ac = !/document/.test(this.toString())) {
                        a: {
                            for (; evt = evt.parentNode;)
                                if (evt === this) {
                                    evt = 1;
                                    break a;
                                }
                            evt = 0;
                        }
                        ac = !evt;
                    }
            evt = ac;
        } else evt = null === evt;
        return evt;
    }
    var specialThreatment = {

        disabeled: function (el, type) {
            if (el.disabeled && type === "click") return true;
        },
        nodeType: function (el) { // Don't do events on text and comment nodes 
            if (el.nodeType === 3 || el.nodeType === 8) return true;
        }
    },

        customEvents = {
            mouseenter: {
                base: 'mouseover',
                condition: check
            },
            mouseleave: {
                base: 'mouseout',
                condition: check
            },
            mousewheel: {
                base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel'
            }
        },

        // Includes some event props shared by different events

        commonProps = ["altKey", "bubbles", "cancelable", "ctrlKey", "currentTarget", "eventPhase", "metaKey", "relatedTarget", "shiftKey", "target", "timeStamp", "view", "which"],

        // some event types need special handling and some need special properties, do that all here

        typeFixers = [{ // key events
            reg: /^key/,
            fix: function (event, newEvent) {
                newEvent.keyCode = event.keyCode || event.which;
                return commonProps.concat(["char", "charCode", "key", "keyCode"]);
            }
        }, { // mouse events
            reg: /^(?:mouse|contextmenu)|click/,
            fix: function (event, newEvent) {

                newEvent.rightClick = event.which === 3 || event.button === 2;

                newEvent.pos = {
                    x: 0,
                    y: 0
                };

                // Calculate pageX/Y if missing and clientX/Y available

                if (event.pageX || event.pageY) {
                    newEvent.clientX = event.pageX;
                    newEvent.clientY = event.pageY;
                } else if (event.clientX || event.clientY) {
                    newEvent.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft;
                    newEvent.clientY = event.clientY + doc.body.scrollTop + root.scrollTop;
                }

                return commonProps.concat(["button", "buttons", "clientX", "clientY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement"]);
            }
        }, { // mouse wheel events
            reg: /mouse.*(wheel|scroll)/i,
            fix: function () {
                return ["button", "buttons", "clientX", "clientY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement", "wheelDelta", "wheelDeltaX", "wheelDeltaY", "wheelDeltaZ", "axis"];
            }
        }, { // TextEvent
            reg: /^text/i,
            fix: function () {
                return commonProps.concat(["data"]);
            }
        }, { // touch and gesture events
            reg: /^touch|^gesture/i,
            fix: function () {
                return commonProps.concat(["touches", "targetTouches", "changedTouches", "scale", "rotation"]);
            }
        }, { // message events
            reg: /^message$/i,
            fix: function () {
                return commonProps.concat(["data", "origin", "source"]);
            }
        }, { // popstate events
            reg: /^popstate$/i,
            fix: function () {
                return commonProps.concat(["state"]);
            }
        }, { // everything else
            reg: /.*/,
            fix: function () {
                return commonProps;
            }
        }]

        ,
        typeFixerMap = {} // used to map event types to fixer functions (above), a basic cache mechanism

        , Event = function (event, element) {

            if (!arguments.length) return;

            event = event || ((element.ownerDocument || element.document || element).parentWindow || win).event;

            this.originalEvent = event;

            if (!event) return;

            var type = event.type,
                target = event.target,
                i, l, p, props, fixer;

            this.target = target && target.nodeType === 3 ? target.parentNode : target;

            fixer = typeFixerMap[type];

            if (!fixer) { // haven't encountered this event type before, map a fixer function for it
                for (i = 0, l = typeFixers.length; i < l; i++) {
                    if (typeFixers[i].reg.test(type)) { // guaranteed to match at least one, last is .*
                        typeFixerMap[type] = fixer = typeFixers[i].fix;
                        break;
                    }
                }
            }

            props = fixer(event, this, type);

            for (i = props.length; i--;) {
                if (!((p = props[i]) in this) && p in event) this[p] = event[p];
            }
        };

    Event.prototype = {

        preventDefault: function () {
            if (this.originalEvent.preventDefault) this.originalEvent.preventDefault();
            else this.originalEvent.returnValue = false;
        },
        stopPropagation: function () {
            if (this.originalEvent.stopPropagation) this.originalEvent.stopPropagation();
            else this.originalEvent.cancelBubble = true;
        },
        stop: function () {
            this.preventDefault();
            this.stopPropagation();
            this.stopped = true;
        },
        stopImmediatePropagation: function () {
            if (this.originalEvent.stopImmediatePropagation) this.originalEvent.stopImmediatePropagation();
            this.isImmediatePropagationStopped = function () {
                return true;
            };
        },
        isImmediatePropagationStopped: function () {
            return this.originalEvent.isImmediatePropagationStopped && this.originalEvent.isImmediatePropagationStopped();
        }
    };

    function wrappedHandler(element, fn, condition, args) {
        var call = function (event, eargs) {
            return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
        }, findTarget = function (event, eventElement) {
                return fn._RachelleDel ? fn._RachelleDel.ft(event.target, element) : eventElement;
            }, handler = condition ? function (event) {
                var target = findTarget(event, this); // delegated event
                if (condition.apply(target, arguments)) {
                    if (event) event.currentTarget = target;
                    return call(event, arguments);
                }
            } : function (event) {
                return call(event, arguments);
            };
        handler._RachelleDel = fn._RachelleDel;
        return handler;
    }

    function Access(element, type, handler, original, namespaces, args) {

        if (!(this instanceof Access)) return false;

        var customType = customEvents[type];

        if (type === 'unload') handler = once(removeListener, element, type, handler, original);

        if (customType) {
            if (customType.condition) {
                handler = wrappedHandler(element, handler, customType.condition, args);
            }

            type = customType.base || type;
        }

        this.element = element;
        this.type = type;
        this.original = original;
        this.namespaces = namespaces;
        this.eventType = type;
        this.target = element;
        this.handler = wrappedHandler(element, handler, null, args);
    }

    // given a list of namespaces, is our entry in any of them?

    Access.prototype = {

        inNamespaces: function (checkNamespaces) {
            var i, j, c = 0;
            if (!checkNamespaces) return true;
            if (!this.namespaces) return false;
            for (i = checkNamespaces.length; i--;) {
                for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] == this.namespaces[j]) c++;
                }
            }
            return checkNamespaces.length === c;
        },

        // match by element, original fn (opt), handler fn (opt)
        matches: function (checkElement, checkOriginal, checkHandler) {
            return this.element === checkElement &&
                (!checkOriginal || this.original === checkOriginal) &&
                (!checkHandler || this.handler === checkHandler);
        }
    };



    var registry = (function () {

        var map = {};

        function forAll(element, type, original, handler, root, fn) {
            var pfx = root ? 'r' : '$';
            if (!type || type === '*') {
                // search the whole registry
                for (var t in map) {
                    if (t.charAt(0) === pfx) {
                        forAll(element, t.substr(1), original, handler, root, fn);
                    }
                }
            } else {
                var i = 0,
                    l, list = map[pfx + type],
                    all = element === '*';
                if (!list) return;
                for (l = list.length; i < l; i++) {
                    if ((all || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) return;
                }
            }
        }
        return {
            has: function (element, type, original, root) {
                if (root = map[(root ? "r" : "$") + type])
                    for (type = root.length; type--;)
                        if (!root[type].root && root[type].matches(element, original, null)) return true;
                return false;
            },
            get: function (element, type, original, root) {
                var entries = [];
                forAll(element, type, original, null, root, function (entry) {
                    entries.push(entry);
                });
                return entries;
            },
            put: function (entry) {
                var has = !entry.root && !this.has(entry.element, entry.type, null, false),
                    key = (entry.root ? 'r' : '$') + entry.type;
                (map[key] || (map[key] = [])).push(entry);
                return has;
            },
            del: function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
                    list.splice(i, 1);
                    entry.removed = true;
                    if (list.length === 0) delete map[(entry.root ? 'r' : '$') + entry.type];
                    return false;
                });
            }
        };
    }());
	
    // we attach this listener to each DOM event that we need to listen to, only once
    // per event type per DOM element
    function subHandler(event, type) {
        var listeners = registry.get(this, type || event.type, null, false),
            l = listeners.length,
            i = 0;

        event = new Event(event, this, true);
        if (type) event.type = type;

        // iterate through all handlers registered for this type, calling them unless they have
        // been removed by a previous handler or stopImmediatePropagation() has been called
        for (; i < l && !event.isImmediatePropagationStopped(); i++) {
            if (!listeners[i].removed) listeners[i].handler.call(this, event);
        }
    }

    function once(rm, element, type, fn, originalFn) {
        return function () {
            fn.apply(this, arguments);
            rm(element, type, originalFn);
        };
    }


    /**
     *   Remove event listener
     **/
    function removeListener(el, events, handler, namespaces) {

        events = events && events.replace(expr['nameRegex'], "");

        var handlers = registry.get(el, events, null, false),
            i = 0,
            l;

        events = {};

        // Namespace

        for (l = handlers.length; i < l; i++) handler && handlers[i].original !== handler || !handlers[i].inNamespaces(namespaces) || (registry.del(handlers[i]), events[handlers[i].eventType] || (events[handlers[i].eventType] = {
            t: handlers[i].eventType,
            c: handlers[i].type
        }));

        // For improved speed we are using object keys with fallback to for / in loop

        handler = nativeKeys(events);

        for (namespaces = handler.length; namespaces--;)
            if (!registry.has(el, events[handler[namespaces]].t, null, false) && el[removeEvent]) el[removeEvent](events[handler[namespaces]].t, subHandler, false);
    }



    // set up a delegate helper using the given selector, wrap the handler function
    function delegate(selector, fn) {

        function findTarget(target, root) {
            var i, array = hAzzle.isString(selector) ? hAzzle.select(selector, root) : selector;
            for (; target && target !== root; target = target.parentNode) {
                for (i = array.length; i--;) {
                    if (array[i] === target) return target;
                }
            }
        }

        function handler(e) {
            if (e.target.disabled !== true) {
                var match = findTarget(e.target, this);
                if (match) fn.apply(match, arguments);
            }
        }

        handler._RachelleDel = {
            ft: findTarget // attach it here for customEvents to use too
            ,
            selector: selector
        };
        return handler;
    }

    /**
     * off(element[, eventType(s)[, handler ]])
     */

    function off(el, typeSpec, fn) {
        var isTypeStr = hAzzle.isString(typeSpec),
            type, namespaces, i;

        if (isTypeStr && typeSpec.indexOf(' ') > 0) {

            // off(el, 't1 t2 t3', fn) or off(el, 't1 t2 t3')

            typeSpec = typeSpec.split(typeSpec);

            for (i = typeSpec.length; i--;)
                off(el, typeSpec[i], fn);
            return el;
        }

        type = isTypeStr && typeSpec.replace(expr['nameRegex'], '');

        if (type && customEvents[type]) type = customEvents[type].base;

        if (!typeSpec || isTypeStr) {
            // off(el) or off(el, t1.ns) or off(el, .ns) or off(el, .ns1.ns2.ns3)
            if (namespaces = isTypeStr && typeSpec.replace(expro['namespaceRegex'], '')) namespaces = namespaces.split('.');
            removeListener(el, type, fn, namespaces);
        } else if (hAzzle.isFunction(typeSpec)) {
            // off(el, fn);
            removeListener(el, null, typeSpec);
        } else {

            // off(el, { t1: fn1, t2, fn2 })
            for (var te = nativeKeys(typeSpec), ii = te.length; ii--;) {
                off(el, te[ii], typeSpec[te[ii]]);
            }
        }

        return el;
    }

    /**
     * on(el, eventType(s)[, selector], handler[, args ])
     */


    function on(el, events, selector, fn, /* INTERNAL */ one) {
        var originalFn, type, types, i, args, entry, first;

        // Dont' allow click on disabeled elements, or events on text and comment nodes

        if ((el.disabeled && specialThreatment[disabeled](el, type)) || specialThreatment.nodeType(el)) return false;

        if (selector === undefined && typeof events === 'object')
            for (type = nativeKeys(events), i = type.length; i--;) on.call(this, el, type[i], events[type[i]]);
        else {

            // Delegated event

            if (!hAzzle.isFunction(selector)) {
                originalFn = fn;
                args = slice.call(arguments, 4);
                fn = delegate(selector, originalFn);
            } else {
                args = slice.call(arguments, 3);
                fn = originalFn = selector;
            }

            types = events.split(' ');

            // One

            if (one) fn = once(off, el, events, fn, originalFn);

            for (i = types.length; i--;) {
                first = registry.put(entry = new Access(
                    el, types[i].replace(expr['nameRegex'], '') // event type
                    , fn, originalFn, types[i].replace(expro['namespaceRegex'], '').split('.') // namespaces
                    , args, false
                ));

                // First event of this type on this el, add root listener

                if (first) el[addEvent](entry.eventType, subHandler, false);
            }
            return el;
        }
    }



    hAzzle.fn.extend({

        /**
         * Add event to element
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} callback
         * @return {Object}
         */

        on: function (events, selector, fn, /* INTERNAL */ one) {
            var el;
            return this.each(function () {
                el = this;
                var originalFn, type, types, i, args, entry, first;

                // Dont' allow click on disabeled elements, or events on text and comment nodes

                if ((el.disabeled && specialThreatment[disabeled](el, type)) || specialThreatment.nodeType(el)) return false;

                if (selector === undefined && typeof events === 'object')
                    for (type = nativeKeys(events), i = type.length; i--;) on.call(this, el, type[i], events[type[i]]);
                else {

                    // Delegated event

                    if (!hAzzle.isFunction(selector)) {
                        originalFn = fn;
                        args = slice.call(arguments, 4);
                        fn = delegate(selector, originalFn);
                    } else {
                        args = slice.call(arguments, 3);
                        fn = originalFn = selector;
                    }

                    types = events.split(' ');

                    // One

                    if (one) fn = once(off, el, events, fn, originalFn);

                    for (i = types.length; i--;) {
                        first = registry.put(entry = new Access(
                            el, types[i].replace(expr['nameRegex'], '') // event type
                            , fn, originalFn, types[i].replace(expro['namespaceRegex'], '').split('.') // namespaces
                            , args, false
                        ));

                        // First event of this type on this el, add root listener

                        if (first) el[addEvent](entry.eventType, subHandler, false);
                    }
                    return el;
                }

            });
        },

        /**
         * Same as on() but the event will "die" after the first time it's triggered
         **/

        one: function (events, fn, delfn) {
            return this.on(events, fn, delfn, true);
        },

        /**
         * Remove event from element
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} callback
         * @return {Object}
         */

        off: function (events, fn) {
            return this.each(function () {
                off(this, events, fn);
            });
        }

    });


    hAzzle.extend({

        /**
         * Trigger specific event for element collection
         *
         * @param {Object|String} type
         * @return {Object}
         */

        trigger: function (el, type, args) {

            if (hAzzle.isString(el)) el = hAzzle.select(el)[0];
            else el = el[0];

            var types = type.split(' '),
                i, j, l, call, event, names, handlers;

            if ((el.disabeled && specialThreatment[disabeled](el, type)) || specialThreatment.nodeType(el)) return false;

            for (i = types.length; i--;) {
                type = types[i].replace(expr['nameRegex'], '');
                if (names = types[i].replace(expro['namespaceRegex'], '')) names = names.split('.');
                if (!names && !args) {
                    var HTMLEvt = doc.createEvent('HTMLEvents');
                    HTMLEvt['initEvent'](type, true, true, win, 1);
                    el.dispatchEvent(HTMLEvt);

                } else {
                    handlers = registry.get(el, type, null, false);
                    event = new Event(null, el);
                    event.type = type;
                    call = args ? 'apply' : 'call';
                    args = args ? [event].concat(args) : event;
                    for (j = 0, l = handlers.length; j < l; j++) {
                        if (handlers[j].inNamespaces(names)) {
                            handlers[j].handler[call](el, args);
                        }
                    }
                }
            }
            return el;
        }
    });