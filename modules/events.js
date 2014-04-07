var isFunction = hAzzle.isFunction,
    isString = hAzzle.isString,

    slice = Array.prototype.slice,

    specialEvents = {},
    focusinSupported = 'onfocusin' in window,

    focus = {
        focus: 'focusin',
        blur: 'focusout'
    },

    hover = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
    },

    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
    };


function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}



/**
 * Event Core Functions ( ECF )
 */

function handlers(element) {
    return element._hAzzle_handlers || (element._hAzzle_handlers = []);
}


function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers(element) || []).filter(function (handler) {
        return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || hAzzle.getUID(handler.fn) === hAzzle.getUID(fn)) && (!selector || handler.sel == selector);
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
    return handler.del && (!focusinSupported && (handler.e in focus)) || !! captureSetting;
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
		
				if( !e) {
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
    var key, proxy = {
            originalEvent: event
        };
    for (key in event)
        if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

    return compatible(proxy, event);
}




hAzzle.fn.extend({

    /**
     * 'on' is such a common word in javascript libraries, so I can't avoid using it
     */

    on: function (types, selector, data, callback, one) {
    
	 var autoRemove, delegator, type;
	
    if (types && !isString(types)) {
    
	 for (type in types) {

       this.on(type, selector, data, types[type], one);
	 }
      return this;
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false) {
      callback = data, data = selector, selector = undefined
	}
	
    if (isFunction(data) || data === false) {
      callback = data, data = undefined
	}
        return this.each(function (_, element) {

            if (one) {
                autoRemove = function (e) {
                    hAzzle.event.remove(element, e.type, callback);
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

            hAzzle.event.add(element, types, callback, data, selector, delegator || autoRemove);
        });

    },
    one: function (types, selector, data, callback) {
        return this.on(types, selector, data, callback, true);
    },

    off: function (types, selector, fn ) {
        
       if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}

        if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}

        return this.each(function () {
            hAzzle.event.remove(this, types, fn, selector);
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
            this.each(function (i, element) {
                e = createProxy(isString(event) ? hAzzle.Event(event) : event);
                e._args = args;
                e.target = element;
                hAzzle.each(findHandlers(element, event.type || event), function (i, handler) {
                    result = handler.proxy(e);
                    if (e.isImmediatePropagationStopped()) return false;
                });
            });
            return result;
    },
	
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

hAzzle.event = {

    add: function (element, events, fn, data, selector, delegator, capture) {

      if(hAzzle.nodeType(3, element) ||  hAzzle.nodeType(8, element)) return;

        // Set handler on the element
		
		var set = handlers(element);

       // Handle multiple events separated by comma

        hAzzle.each(events.split(/\s/), function (_, event) {

            if (event == 'ready') return hAzzle(document).ready(fn);
            var handler = parse(event);
            handler.fn = fn;
            handler.sel = selector;

            // Emulate mouseenter, mouseleave

            if (handler.e in hover) fn = function (e) {
                var related = e.relatedTarget;
                if (!related || (related !== this && !hAzzle.contains(this, related)));
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
            if ( element.addEventListener ) {
                element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
			}
        });
    },

    remove: function (element, events, fn, selector, capture) {
        (events || '').split(/\s/).forEach(function (evt) {
            findHandlers(element, evt, fn, selector).forEach(function (handler) {
                delete handlers(element)[handler.i];

                if ( element.removeEventListener ) {
                    element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
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

  /**
   * Shortcut methods for 'on'
   */


hAzzle.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function (_, name) {

    // Handle event binding

    hAzzle.fn[name] = function (data, fn) {
        if (fn == null) {
            fn = data;
            data = null;
        }

        return arguments.length > 0 ?
            this.on(name, null, data, fn) :
            this.trigger(name);
    };
});