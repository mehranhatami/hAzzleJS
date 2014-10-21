/** 
 * events.js - hAzzle Event Manager module
 *
 * Desktop browsers support:
 *
 *    Chrome 9+
 *    Safari 5.0+
 *    Firefox 18+
 *    Opera 15.1+
 *    Internet Explorer 9+
 *
 * Mobile browsers support:
 *
 *    Google Android 4.0+
 *    Apple iOS 6+
 *    ChromiumOS
 *    FirefoxOS
 *
 * Sources:
 *
 * - http://dean.edwards.name/weblog/2005/10/add-event/
 * - http://dean.edwards.name/weblog/2005/10/add-event2/
 * - http://stackoverflow.com/questions/4034742/understanding-dean-edwards-addevent-javascript
 * - https://github.com/dperini/nwevents
 * - https://github.com/fat/bean
 * - jQuery
 */
hAzzle.define('Events', function() {

    var win = window,
        doc = win.document,
        namespaceRegex = /[^\.]*(?=\..*)\.|.*/,
        nameRegex = /\..*/,
        whiteSpace = /\S+/g,
        docElem = doc.documentElement || {},
        map = {},

        // Include needed modules
        _util = hAzzle.require('Util'),
        _collection = hAzzle.require('Collection'),
        _types = hAzzle.require('Types'),
        _jiesa = hAzzle.require('Jiesa'),
        _detection = hAzzle.require('Detection'),
        _core = hAzzle.require('Core'),

        // regEx

        everything = /.*/,
        keyEvent = /^key/,
        mouseEvent = /^(?:mouse(?!(.*wheel|scroll))|pointer|menu|drag|drop|contextmenu)|click/,
      
        // Properties
        commonProps = ('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
            'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' +
            'srcElement target timeStamp type view which propertyName').split(' '),
        mouseProps = commonProps.concat(('button buttons clientX clientY dataTransfer ' +
            'fromElement offsetX offsetY pageX pageY screenX screenY toElement').split(' ')),
        keyProps = commonProps.concat(('char charCode key keyCode keyIdentifier ' +
            'keyLocation location').split(' '));

    // Firefox specific eventTypes
    if (_detection.isFirefox) {
        commonProps.concat('mozMovementY mozMovementX'.split(' '));
    }
    // WebKit eventTypes
    // Support: Chrome / Opera

    if (_detection.isWebkit) {
        commonProps.concat(('webkitMovementY webkitMovementX').split(' '));
    }

    // specialEvents (e.g. focus and blur)
    var specialEvents = {},

        fixedEvents = {},

        propHooks = [{ // key events
            reg: keyEvent,
            fix: function(original, evt) {
                // Add which for key events
                if (evt.which == null) {
                    evt.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                evt.keyCode = original.keyCode || original.which;
                return keyProps;
            }
        }, { // mouse events

            reg: mouseEvent,
            fix: function(original, evt, type) {

                // Calculate pageX/Y if missing and clientX/Y available
                if (evt.pageX == null && original.clientX != null) {
                    evt.pageX = original.clientX + docElem.scrollLeft - docElem.clientLeft;



                    evt.pageY = original.clientY + docElem.scrollTop - docElem.clientTop;
                }

                // click: 1 === left; 2 === middle; 3 === right
                if (!evt.which && original.button !== undefined) {
                    evt.which = (original.button & 1 ? 1 : (original.button & 2 ? 3 : (original.button & 4 ? 2 : 0)));
                }

                if (type === 'mouseover' || type === 'mouseout') {
                    evt.relatedTarget = original.relatedTarget || original[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
                }
                return mouseProps;
            }
        }, { // everything else
            reg: everything,
            fix: function() {
                return commonProps;
            }
        }],

        // Custom event holder

        customEvents = {},

        // Event fix holder

        fixHooks = {},

        deatch = function(element, fn, condition, args) {

            var call = function(event, eargs) {
                    return fn.apply(element, args ? _collection.slice(eargs).concat(args) : eargs);
                },
                findTarget = function(event, eventElement) {
                    return fn.__kfx2rcf ? fn.__kfx2rcf.ft(event.target, element) : eventElement;
                },
                handler = condition ? function(event) {
                    var target = findTarget(event, this); // deleated event
                    if (condition.apply(target, arguments)) {
                        if (event) {
                            event.currentTarget = target;
                        }
                        return call(event, arguments);
                    }
                } : function(event) {
                    if (fn.__kfx2rcf) event = event.clone(findTarget(event)); // delegated event, fix the fix
                    return call(event, arguments);
                };
            handler.__kfx2rcf = fn.__kfx2rcf;
            return handler;
        },

        // Iterate

        iteratee = function(element, type, original, handler, root, callback) {
            var t, pfx = root ? '_r' : '_$';

            if (!type || type == '*') {

                for (t in map) {
                    if (t.charAt(0) == pfx) {
                        iteratee(element, t.substr(1), original, handler, root, callback);
                    }
                }
            } else {
                var i = 0,
                    l, list = map[pfx + type],
                    all = element == '*';

                if (!list) {
                    return;
                }

                for (l = list.length; i < l; i++) {
                    if ((all || list[i].matches(element, original, handler)) && !callback(list[i], list, i, type)) {
                        return;
                    }
                }
            }
        },
        // Check collection for registered event,
        // match element and handler
        isRegistered = function(element, type, original, root) {
            var i, list = map[(root ? '_r' : '_$') + type];
            if (list) {
                for (i = list.length; i--;) {
                    if (!list[i].root && list[i].matches(element, original, null)) {
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
        // Register an event instance and its parameters
        registrer = function(entry) {

            var contains = !entry.root && !isRegistered(entry.element, entry.type, null, false),
                key = (entry.root ? '_r' : '_$') + entry.type;
            (map[key] || (map[key] = [])).push(entry);
            return contains;
        },
        // Unregister an event instance and its parameters
        unregister = function(entry) {
            iteratee(entry.element, entry.type, null, entry.handler, entry.root, function(entry, list, i) {
                list.splice(i, 1);
                entry.removed = true;
                if (list.length === 0) {
                    delete map[(entry.root ? '_r' : '_$') + entry.type];
                }
                return false;
            });
        },

        rootListener = function(event, type) {

            var listeners = getRegistered(this, type || event.type, null, false),
                l = listeners.length,
                i = 0;

            event = new Event(event, this, true);

            if (type) {
                event.type = type;
            }
            for (; i < l && !event.isImmediatePropagationStopped(); i++) {
                if (!listeners[i].removed) {
                    listeners[i].handler.call(this, event);
                }
            }
        },

        once = function(rm, elem, type, callback, original) {
            return function() {
                callback.apply(this, arguments);
                rm(elem, type, original);
            };
        },

        dispatch = function(elem, type, handler, ns) {

            type = type && type.replace(nameRegex, '');

            var handlers = getRegistered(elem, type, null, false),
                removed = {},
                i, l;

            for (i = 0, l = handlers.length; i < l; i++) {
                if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(ns)) {
                    unregister(handlers[i]);
                    if (!removed[handlers[i].eventType])
                        removed[handlers[i].eventType] = {
                            t: handlers[i].eventType,
                            c: handlers[i].type
                        };
                }
            }

            for (i in removed) {
                if (!isRegistered(elem, removed[i].t, null, false)) {
                    elem.removeEventListener(removed[i].t, rootListener, false);
                }
            }
        },

        findTarget = function(target, selector, root) {
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

        delegate = function(selector, fn) {
            var handler = function(e) {
                var cur = e.target;
                // Don't process clicks on disabled elements
                if (cur.nodeType && cur.disabled !== true) {
                    var m = findTarget(cur, selector, this);
                    if (m) {
                        fn.apply(m, arguments);
                    }
                }
            };

            handler.__kfx2rcf = {
                ft: findTarget, // attach it here for customEvents to use too
                selector: selector
            };
            return handler;
        },

        on = function(elem, types, selector, callback, one) {

            // Check if typeof hAzzle, then wrap it out, and return current elem

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }


            var cb, type, i, args, entry, first, hooks;

            // Types can be a map of types/handlers

            if (typeof types == 'object') {
                if (typeof selector !== 'string') {
                    callback = selector;
                    selector = undefined;
                }
                for (type in types) {
                    on(elem, type, types[type]);
                }
                return;
            }

            // Event delegation

            if (!_types.isType('Function')(selector)) {
                cb = callback;
                args = _collection.slice(arguments, 4);
                callback = delegate(selector, cb);
            } else {
                args = _collection.slice(arguments, 3);
                callback = cb = selector;
            }

            if (typeof callback !== 'function') {
                hAzzle.err(true, 13, 'no handler registred for on() in events.js module');
            }

            // Handle multiple types separated by a space

            types = (types || '').match((whiteSpace)) || [''];


            if (one) {
                callback = once(off, elem, types, callback, cb);
            }

            i = types.length;

            while (i--) {

                first = registrer(entry = new Registry(
                    elem,
                    types[i].replace(nameRegex, ''), // event type
                    callback,
                    cb,
                    types[i].replace(namespaceRegex, '').split('.'), // namespaces
                    args,
                    false // not root
                ));

                if (first) {

                    type = entry.eventType;

                    if ((hooks = specialEvents[type])) {
                        hooks(elem, type);
                    }

                    elem.addEventListener(type, rootListener, false);
                }
            }

            return elem;
        },

        one = function(elem, types, selector, callback) {
            return on(elem, types, selector, callback, 1);
        },

        off = function(elem, types, callback) {

            if (typeof types !== 'string') {
                hAzzle.err(true, 14, "'events' given in off() - events.js module are not valid");
            }

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            var k, type, namespaces, i;

            if (typeof types === 'string' && types.indexOf(' ') > 0) {
                types = (types || '').match((whiteSpace)) || [''];
                for (i = types.length; i--;) {
                    off(elem, types[i], callback);
                }
                return elem;
            }

            type = typeof types === 'string' && types.replace(nameRegex, '');

            if (type && customEvents[type]) {
                type = customEvents[type].base;
            }

            if (!types || typeof types === 'string') {
                if ((namespaces = typeof types === 'string' && types.replace(namespaceRegex, ''))) {
                    namespaces = namespaces.split('.');
                }

                dispatch(elem, type, callback, namespaces);

            } else if (_types.isType('Function')(types)) {
                dispatch(elem, null, types);
            } else {
                for (k in types) {
                    off(elem, k, types[k]);
                }
            }

            return elem;
        },

        trigger = function(elem, type, args) {

            if (elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            var types = (type || '').match((whiteSpace)) || [''],
                i, j, l, call, event, names, handlers, canContinue;

            for (i = types.length; i--;) {

                type = types[i].replace(nameRegex, '');

                if ((names = types[i].replace(namespaceRegex, ''))) {
                    names = names.split('.');
                }
                if (names && args) {
                    event = new Event(null, elem);
                    event.type = type;
                    call = args ? 'apply' : 'call';
                    args = args ? [event].concat(args) : event;
                    for (j = 0, l = handlers.length; j < l; j++) {
                        if (handlers[j].inNamespaces(names)) {
                            handlers[j].handler.call(elem, args);
                        }
                    }
                    canContinue = event.returnValue !== false;
                } else {
                    // 
                    var evt = doc.createEvent('HTMLEvents');
                    evt.detail = arguments;
                    evt.initEvent(type, true, true);
                    canContinue = elem.dispatchEvent(evt);
                }

                return canContinue;

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
                        args.push(kfx2rcf.selector);
                    }
                    args.push(handlers[i].original);
                    on.apply(null, args);
                }
            }
            return elem;
        },

        Event = function(event, elem) {

            // Needed for DOM0 events
            event = event || ((elem.ownerDocument ||
                    elem.document ||
                    elem).parentWindow ||
                win).event;

            this.originalEvent = event;

            if (!event) {
                return;
            }

            var type = event.type,
                // fired element (triggering the event)
                target = event.target || event.srcElement,
                i, l, p, props, fixer;

            // Support: Safari 6.0+, Chrome<28
            this.target = target.nodeType === 3 ? target.parentNode : target;
            this.timeStamp = Date.now(); // Set time event was fixed

            fixer = fixHooks[type];

            // Haven't encountered this event type before, map a fixer function for it

            if (!fixer) {

                fixer = fixedEvents[type];

                if (!fixer) { // haven't encountered this event type before, map a fixer function for it
                    for (i = 0, l = propHooks.length; i < l; i++) {
                        if (propHooks[i].reg.test(type)) { // guaranteed to match at least one, last is .*
                            fixedEvents[type] = fixer = propHooks[i].fix;
                            break;
                        }
                    }
                }

                props = fixer(event, this, type);
                for (i = props.length; i--;) {
                    if (!((p = props[i]) in this) && p in event) this[p] = event[p];
                }
            }
        };

    Event.prototype = {

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

    var Registry = function(elem, type, handler, original, namespaces, args, docElem) {
        return new Registry.prototype.init(elem, type, handler, original, namespaces, args, docElem);
    };

    Registry.prototype = {

        init: function(elem, type, handler, original, namespaces, args, docElem) {

            var customType = customEvents[type];

            if (type == 'unload') {
                // self clean-up
                handler = once(dispatch, elem, type, handler, original);
            }

            if (customType) {
                if (customType.condition) {
                    handler = deatch(elem, handler, customType.condition, args);
                }
                type = customType.base || type;
            }


            this.element = elem;
            this.type = type;
            this.original = original;
            this.namespaces = namespaces;
            this.eventType = type;
            this.target = elem;
            this.root = docElem;
            this.handler = deatch(elem, handler, null, args);
        },


        inNamespaces: function(checkNamespaces) {
            var i, j, c = 0;
            if (!checkNamespaces) {
                return true;
            }
            if (!this.namespaces) {
                return false;
            }
            for (i = checkNamespaces.length; i--;) {
                for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] == this.namespaces[j]) {
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

    Registry.prototype.init.prototype = Registry.prototype;

    // Add event listener

    this.on = function(events, selector, callback) {
        this.each(function(elem) {
            on(elem, events, selector, callback);
        });
    };

    // One
    this.one = function(events, selector, callback) {
        this.each(function(elem) {
            one(elem, events, selector, callback);
        });
    };

    // Remove event listeners
    this.off = function(events, callback) {
        this.each(function(elem) {
            off(elem, events, callback);
        });
    };

    // Trigger events
    this.trigger = function(events, args) {
        this.each(function(elem) {
            trigger(elem, events, args);
        });
    };
    // Clone events
    this.clone = function(dest, events) {
        clone(this.elements[0], dest, events);
    };

    this.hover = function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        },

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
                    return !related ? related == null : (related !== target && !_core.contains(related, target));
                }
            };
        });

    // Shortcuts

    _util.each(('blur change click dblclick error focus focusin focusout keydown keypress ' +
        'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup ' +
        'mousemove resize scroll select submit unload change contextmenu').split(' '), function(name) {
        this[name] = function(callback) {
            return arguments.length > 0 ?
                this.on(name, callback) :
                this.trigger(name);

        };
    }.bind(this));


    return {
        specialEvents: specialEvents,
        propHooks: propHooks,
        mouseProps: mouseProps,
        commonProps: commonProps, 
        on: on,
        one: one,
        off: off,
        clone: clone,
        trigger: trigger,
    };
});