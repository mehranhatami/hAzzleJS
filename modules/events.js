/* Event handler
 *
 * NOTE!! This event system are different from jQuery, and more powerfull. The basic funcions are the same,
 * but hAzzle supports different types of namespaces, multiple handlers etc. etc.
 *
 * Example on a multiple handler:
 *
 *     hAzzle('p').on({
 *        click: function (e) { alert('click') },
 *        mouseover: function (e) { alert('mouse')  }
 *     });
 *
 * hAzzle don't support multiple delegated selectors like:
 *
 *  $( "#dataTable tbody tr" )
 *
 * Todo!! Fix this maybe!!
 */
; (function ($) {

    var win = window,
        doc = document || {},
        root = doc.documentElement || {},
        isString = $.isString,
        isFunction = $.isFunction,

        // Cached handlers

        container = {},

        specialsplit = /\s*,\s*|\s+/,
        rkeyEvent = /^key/, // key
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/, // mouse
        ns = /[^\.]*(?=\..*)\.|.*/, // Namespace regEx
        names = /\..*/,

        // Event and handlers we have fixed

        treated = {},

        // Some prototype references we need


        substr = String.prototype.substr,
        slice = Array.prototype.slice,
        concat = Array.prototype.concat,
        toString = Object.prototype.toString,

        threatment = {

            // Don't do events on disabeled nodes

            disabeled: function (el, type) {
                if (el.disabeled && type === "click") return true;
            },

            // Don't do events on text and comment nodes 

            nodeType: function (el) {
                if ($.nodeType(3, el) || $.nodeType(8, el)) return true;
            }
        },

        special = {
            pointerenter: {
                fix: "pointerover",
                condition: checkPointer
            },

            pointerleave: {
                fix: "pointerout",
                condition: checkPointer
            },
            mouseenter: {
                fix: 'mouseover',
                condition: checkMouse
            },
            mouseleave: {
                fix: 'mouseout',
                condition: checkMouse
            },
            mousewheel: {
                fix: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel'
            }
        },

        // Includes some event props shared by different events

        commonProps = "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" ");

    // Check mouse

    function checkMouse(evt) {
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

    /**
  * FIX ME!!  I don't have a pointer device so can't fix this. Maybe in the future.
              But need to run a check about this condition here.
  */

    function checkPointer(evt) {
        return evt;
    }


    $.extend($, {

        // Event hooks

        eventHooks: {

            // Mouse and key props are borrowed from jQuery

            keys: function (evt, original) {
                original.keyCode = evt.keyCode || evt.which;
                return commonProps.concat(["char", "charCode", "key", "keyCode"]);

            },
            mouse: function (evt, original) {

                original.rightClick = evt.which === 3 || evt.button === 2;

                original.pos = {
                    x: 0,
                    y: 0
                };

                // Calculate pageX/Y if missing and clientX/Y available

                if (evt.pageX || evt.pageY) {
                    original.clientX = evt.pageX;
                    original.clientY = evt.pageY;
                } else if (evt.clientX || evt.clientY) {
                    original.clientX = evt.clientX + doc.body.scrollLeft + root.scrollLeft;
                    original.clientY = evt.clientY + doc.body.scrollTop + root.scrollTop;
                }

                return commonProps.concat("button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "));
            }
        },

        Kernel: function (element, type, handler, original, namespaces, args) {

            // Allow instantiation without the 'new' keyword

            if (!(this instanceof $.Kernel)) {
                return new $.Kernel(element, type, handler, original, namespaces, args);
            }

            var _special = special[type],
                evt = this;

            // Only load the event once upon unload

            if (type === 'unload') {

                handler = $.Events.once($.Events.removeListener, element, type, handler, original);
            }

            if (_special) {
                if (_special.condition) {
                    handler = $.Events.wrappedHandler(element, handler, _special.condition, args);
                }

                type = _special.fix || type;
            }

            evt.element = element;
            evt.type = type;
            evt.original = original;
            evt.namespaces = namespaces;
            evt.eventType = type;
            evt.target = element;
            evt.handler = $.Events.wrappedHandler(element, handler, null, args);
        }
    });


    $.Kernel.prototype = {

        inNamespaces: function (checkNamespaces) {

            var i, j, c = 0;

            if (!checkNamespaces) {

                return true;
            }

            if (!this.namespaces) {

                return false;
            }

            for (i = checkNamespaces.length; i--;) {
                for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] == this.namespaces[j]) c++;
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

    $.extend($.fn, {

        /**
         * Bind a DOM event to element
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         * @param {Boolean} one
         * @return {Object}
         */

        on: function (events, selector, fn, one) {
            return this.length === 1 ? $.Events.add(this[0], events, selector, fn, one) :
                this.each(function () {
                    $.Events.add(this, events, selector, fn, one);
                });
        },

        /**
         * Bind a DOM event but trigger it once before removing it
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         * @return {Object}
         **/

        one: function (types, selector, fn) {
            return this.on(types, selector, fn, 1);
        },

        /**
         * Unbind an event from the element
         *
         * @param {String} events
         * @param {Function} fn
         * @return {Object}
         */

        off: function (events, fn) {
            return this.length === 1 ? $.Events.off(this[0], events, fn) :
                this.each(function () {
                    $.Events.off(this, events, fn)
                });
        },

        /**
         * Triggers an event of specific type with optional extra arguments
         *
         * @param {Object|String} type
         * @param {Object|String} args
         * @return {Object}
         */

        trigger: function (type, args) {

            var el = this[0];

            var types = type.split(specialsplit),
                i, j, l, call, evt, names, handlers;

            if (threatment['disabeled'](el, type) || threatment['nodeType'](el)) return false;

            for (i = types.length; i--;) {
                type = types[i].replace(names, '');
                if (names = types[i].replace(ns, '')) names = names.split('.');
                if (!names && !args) {
                    var HTMLEvt = doc.createEvent('HTMLEvents');
                    HTMLEvt['initEvent'](type, true, true, win, 1);
                    el.dispatchEvent(HTMLEvt);

                } else {

                    handlers = $.Events.getHandler(el, type, null, false);
                    evt = new Event(null, el);
                    evt.type = type;
                    call = args ? 'apply' : 'call';
                    args = args ? [evt].concat(args) : evt;
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

    // hAzzle.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html

    function Event(evt, element) {

        if (!arguments.length) return;

        evt = evt || ((element.ownerDocument || element.document || element).parentWindow || win).evt;

        this.originalEvent = evt;

        if (!evt) return;

        var type = evt.type,
            target = evt.target,
            i, p, props, fixHook;

        this.target = target && $.nodeType(3, target) ? target.parentNode : target;

        fixHook = treated[type];

        if (!fixHook) {

            treated[type] = fixHook = rmouseEvent.test(type) ? $.eventHooks['mouse'] :
                rkeyEvent.test(type) ? $.eventHooks['keys'] :
                function () {
                    return commonProps;
            };
        }

        props = fixHook(evt, this, type);

        for (i = props.length; i--;) {
            if (!((p = props[i]) in this) && p in evt) this[p] = evt[p];
        }
    }


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
        },
        clone: function (currentTarget) {
            var ne = new Event(this, this.element);
            ne.currentTarget = currentTarget;
            return ne;
        }
    };

    $.Events = {

        // Add event listener

        add: function (el, events, selector, fn, one) {

            var originalFn, type, types, i, args, entry, first;

            // Dont' allow click on disabeled elements, or events on text and comment nodes

            if (threatment['disabeled'](el, events) || threatment['nodeType'](el)) return false;

            // Types can be a map of types/handlers
            // TODO!! This is not working on delegated events, have to fix this ASAP !!

            if ($.isUndefined(selector) && $.isObject(events))

                for (type in events) {

                if (events.hasOwnProperty(type)) {
                    $.Events.add.call(this, el, type, events[type]);
                }

            } else {

                // Delegated event

                if (!isFunction(selector)) {
                    originalFn = fn;
                    args = slice.call(arguments, 4);
                    fn = $.Events.delegate(selector, originalFn);

                } else {
                    args = slice.call(arguments, 3);
                    fn = originalFn = selector;
                }

                // One

                if (one === 1) {

                    // Make a unique handlet that get removed after first time it's triggered
                    fn = $.Events.once($.Events.off, el, events, fn, originalFn);
                }

                // Handle multiple events separated by a space

                types = events.split(specialsplit);

                for (i = types.length; i--;) {
                    first = $.Events.putHandler(entry = $.Kernel(
                        el, types[i].replace(names, '') // event type
                        , fn, originalFn, types[i].replace(ns, '').split('.') // namespaces
                        , args, false
                    ));

                    // Add root listener only if we're the first

                    if (first) {

                        el.addEventListener(entry.eventType, $.Events.rootListener, false);

                    }
                }
                return el;
            }
        },

        // Remove event listener

        off: function (el, typeSpec, fn) {

            var isTypeStr = isString(typeSpec),
                type, namespaces, i;

            if (isTypeStr && $.indexOf(typeSpec, ' ') > 0) {

                typeSpec = typeSpec.split(typeSpec);

                for (i = typeSpec.length; i--;)
                    $.Events.off(el, typeSpec[i], fn);
                return el;
            }

            type = isTypeStr && typeSpec.replace(names, '');

            if (type && special[type]) type = special[type].fix;

            if (!typeSpec || isTypeStr) {

                // Namespace

                if (namespaces = isTypeStr && typeSpec.replace(ns, '')) namespaces = namespaces.split('.');

                // Remove the listener

                $.Events.removeListener(el, type, fn, namespaces);

            } else if (isFunction(typeSpec)) {

                $.Events.removeListener(el, null, typeSpec);

            } else {

                if (typeSpec) {

                    for (var k in typeSpec) {

                        if (typeSpec.hasOwnProperty(k)) $.Events.off(el, k, typeSpec[k]);
                    }
                }
            }

            return el;
        },

        /**
         * Set up a delegate helper using the given selector, wrap the handler function
         * We are using the "find" function to search through the 'elems stack' to find
         * the selector
         */

        delegate: function (selector, fn) {
            function findTarget(target, root) {
                var i, array = isString(selector) ? $(root).find(selector) : selector;

                for (; target && target !== root; target = target.parentNode) {

                    if (array !== null) {

                        // No need to run a expensive loop if the array length are 1						

                        if (array.length === 1) {

                            if (array[0] === target) return target;

                        } else {

                            for (i = array.length; i--;) {
                                if (array[i] === target) return target;
                            }
                        }
                    }
                }
            }

            function handler(e) {
                if (e.target.disabled !== true) {
                    var m = findTarget(e.target, this);
                    if (m) {
                        fn.apply(m, arguments);
                    }
                }
            }

            handler.__handlers = {
                ft: findTarget,
                selector: selector
            };
            return handler;
        },

        /**
         * Remove the event listener
         */

        removeListener: function (element, type, handler, ns) {

            type = type && type.replace(names, '');

            type = $.Events.getHandler(element, type, null, false);

            var removed = {};

            // No point to continue if no event attached on the element

            if (type) {

                var i = 0,
                    l = type.length;

                for (; i < l; i++) {
                    if ((!handler || type[i].original === handler) && type[i].inNamespaces(ns)) {
                        $.Events.delHandler(type[i]);
                        if (!removed[type[i].eventType])
                            removed[type[i].eventType] = {
                                t: type[i].eventType,
                                c: type[i].type
                            };
                    }
                }

                for (i in removed) {
                    if (!$.Events.hasHandler(element, removed[i].t, null, false)) {
                        element.removeEventListener(removed[i].t, $.Events.rootListener, false);
                    }
                }
            }
        },

        once: function (rm, element, type, handler, callback) {
            return function () {
                handler.apply(this, arguments);
                rm(element, type, callback);
            };
        },

        rootListener: function (evt, type) {
            var listeners = $.Events.getHandler(this, type || evt.type, null, false),
                l = listeners.length,
                i = 0;

            evt = new Event(evt, this, true);

            for (; i < l && !evt.isImmediatePropagationStopped(); i++) {

                if (!listeners[i].removed) listeners[i].handler.call(this, evt);
            }
        },

        wrappedHandler: function (element, fn, condition, args) {

            function call(evt, eargs) {

                return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
            }

            function findTarget(evt, eventElement) {

                return fn.__handlers ? fn.__handlers.ft(evt.target, element) : eventElement;
            }

            var handler = condition ? function (evt) {

                var target = findTarget(evt, this); // delegated event

                if (condition.apply(target, arguments)) {
                    if (evt) evt.currentTarget = target;
                    return call(evt, arguments);
                }
            } : function (evt) {
                if (fn.__handlers) evt = evt.clone(findTarget(evt));
                return call(evt, arguments);
            };

            handler.__handlers = fn.__handlers;
            return handler;
        },

        findIt: function (element, type, original, handler, root, fn) {

            if (!type || type === '*') {

                for (var t in container) {

                    if (t.charAt(0) === root ? 'r' : '#') {
                        $.Events.findIt(element, t.substr(1), original, handler, root, fn);
                    }
                }

            } else {

                var i = 0,
                    l,
                    list = container[root ? 'r' : '#' + type];

                if (!list) {

                    return;
                }

                for (l = list.length; i < l; i++) {

                    if ((element === '*' || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) return;
                }
            }
        },

        hasHandler: function (element, type, original, root) {

            if (root = container[(root ? "r" : "#") + type])
                for (type = root.length; type--;)
                    if (!root[type].root && root[type].matches(element, original, null)) return true;
            return false;
        },
        getHandler: function (element, type, original, root) {

            var entries = [];

            $.Events.findIt(element, type, original, null, root, function (entry) {
                entries.push(entry);
            });
            return entries;
        },
        putHandler: function (entry) {
            var has = !entry.root && !this.hasHandler(entry.element, entry.type, null, false),
                key = (entry.root ? 'r' : '#') + entry.type;
            (container[key] || (container[key] = [])).push(entry);
            return has;
        },
        // Find handlers for event delegation
        delHandler: function (entry) {
            $.Events.findIt(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
                list.splice(i, 1);
                entry.removed = true;
                if (list.length === 0) delete container[(entry.root ? 'r' : '#') + entry.type];
                return false;
            });
        }
    };

    // Shortcut methods for 'on'

    $.each("hover;blur; focus;focusin;focusout;load;resize;scroll;unload;click;dblclick;mousedown;mouseup;mousemove;mouseover;mouseout;mouseenter;mouseleave;change;select;submit;keydown;keypress;keyup;error;contextmenu".split(";"), function () {

        var name = this;

        // Handle event binding

        $.fn[name] = function (data, fn) {

            //events, fn, delfn, one

            if (arguments.length > 0) {

                this.on(name, data, fn)

            }
        };
    });

})(hAzzle);