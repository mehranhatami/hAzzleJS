// events.js

var doc = this.document,
    rnotwhite = (/\S+/g),
    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    namespaceRegex = /^([^.]*)(?:\.(.+)|)$/,
    
	own = hAzzle.hasOwn,
	
	
    // Holder for eventHooks

    eventHooks = hAzzle.eventHooks = {},

   /**
    * Holder for eventCore
	*
	* Contains:
	*
	* - eventHooks
	* - uniqueId 
	* - feature / bug checks
	*/ 

    eventCore = hAzzle.eventCore = {

        UID: 1,

        // feature / bug detection

        has: {

            'api-bubbles': 'onfocusin' in window
        },

        global: {},

        // Set unique ID for each handler

        setID: function () {

            return 'hEvt_' + eventCore.UID++;
        }
   }
   
   hAzzle.event = {
        /**
         * Add event to element.
         *
         * @param {Object} elem
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         */

        add: function (elem, types, handler, data, selector) {

            var handleObjIn, eventHandle, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = hAzzle.data(elem);

            if (!elemData) {
                return;
            }

            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            // Make sure that the handler has a unique ID, used to find/remove it later

            if (!handler.guid) {
                handler.guid = eventCore.setID();
            }

            // Init the element's event structure and main handler, if this is the first
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {

                eventHandle = elemData.handle = function (e) {
                    return typeof hAzzle !== undefined && eventCore.triggered !== e.type ?
                        hAzzle.event.preparation.apply(this, arguments) : undefined;
                };
            }

            // Handle multiple events separated by a space

            types = (types || '').match(rnotwhite) || [''];

            t = types.length;

            while (t--) {

                // event type	

                tmp = namespaceRegex.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || '').split('.').sort();

                // There *must* be a type, no attaching namespace-only handlers
                if (!type) {
                    continue;
                }

                // If event changes its type, use the special event handlers for the changed type
                special = eventHooks.special[type] || {};

                // If selector defined, determine special event api type, otherwise given type
                type = (selector ? special.delegateType : special.bindType) || type;

                // Update special based on newly reset type
                special = eventHooks.special[type] || {};

                // handleObj is passed to all event handlers
                handleObj = hAzzle.shallowCopy({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && hAzzle.Jiesa.regex.changer.test(selector),
                    namespace: namespaces.join('.')
                }, handleObjIn);

                // Init the event handler queue if we're the first

                if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;

                    // Only use addEventListener if the special events handler returns false
                    if (!special.setup ||
                        special.setup.call(elem, data, namespaces, eventHandle) === false) {

                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);
                        }
                    }
                }

                if (special.add) {

                    special.add.call(elem, handleObj);

                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add to the element's handler list, delegates in front
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }

                // Keep track of which events have ever been used, for event optimization
                eventCore.global[type] = true;
            }

        },

        /**
         * Remove an event handler.
         *
         * @param {Object} elem
         * @param {String} types
         * @param {Function} handler
         * @param {String} selector
         * @param {String} mappedTypes
         * @param {Function} fn
         *
         */

        remove: function (elem, types, handler, selector, mappedTypes) {

            var j, origCount, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = hAzzle.hasData(elem) && hAzzle.data(elem);
				
				if(hAzzle.hasData(elem)) {
				
				elemData = hAzzle.data(elem);	
				
				}
				

            if (!elemData || !(events = elemData.events)) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = (types || '').match(rnotwhite) || [''];
            t = types.length;

            while (t--) {

                tmp = namespaceRegex.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || '').split('.').sort();

                // Unbind all events (on this namespace, if provided) for the element
                if (!type) {
                    for (type in events) {
                        hAzzle.event.remove(elem, type + types[t], handler, selector, true);
                    }
                    continue;
                }

                special = eventHooks.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                handlers = events[type] || [];

                tmp = tmp[2] && newNS(namespaces);

                // Remove matching events

                origCount = j = handlers.length;

                while (j--) {
                    handleObj = handlers[j];

                    if ((mappedTypes || origType === handleObj.origType) &&
                        (!handler || handler.guid === handleObj.guid) &&
                        (!tmp || tmp.test(handleObj.namespace)) &&
                        (!selector || selector === handleObj.selector ||
                            selector === 'sub' && handleObj.selector)) {
                        handlers.splice(j, 1);

                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if (origCount && !handlers.length) {
                    if (!special.shutdown ||
                        special.shutdown.call(elem, namespaces, elemData.handle) === false) {

                        hAzzle.removeEvent(elem, type, elemData.handle);
                    }

                    delete events[type];
                }
            }

            // Remove the expando if it's no longer used
            if (hAzzle.isEmptyObject(events)) {
                delete elemData.handle;
                hAzzle.removeData(elem, 'events');
            }
        },

     trigger: function (evt, data, elem, onlyHandlers) {

            var i, cur, tmp, bubbleType, ontype, handle, special,
			    nType = elem.nodeType,
                eventPath = [elem || doc],
				type = own.call(evt, 'type') ? evt.type : evt,
				namespaces = own.call(evt, 'namespace') ? evt.namespace.split('.') : [];

                cur = tmp = elem = elem || doc;

            if (nType === 3 || nType === 8) {
				
                return;
            }


            if (rfocusMorph.test(type + eventCore.triggered)) {
				
                return;
            }

            if (hAzzle.inArray(type, '.') >= 0) {
                namespaces = type.split('.');
                type = namespaces.shift();
                namespaces.sort();
            }

            ontype = hAzzle.inArray(type, ':') < 0 && 'on' + type;

            evt = evt[hAzzle.expando] ?
                evt :
                new hAzzle.Event(type, typeof evt === 'object' && evt);

            // Trigger bitmask: & 1 for native handlers; & 2 for hAzzle (always true)
            evt.isTrigger = onlyHandlers ? 2 : 3;
            evt.namespace = namespaces.join('.');
            evt.namespace_re = evt.namespace ? newNS(namespaces) : null;

            evt.result = undefined;
			
            if (!evt.target) {
				
                evt.target = elem;
            }

		   data = data == null ? [ evt ] : hAzzle.makeArray( data, [ event ] );

			special = eventHooks.special[type] || {};
			
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }

            if (!onlyHandlers && !special.noBubble && !hAzzle.isWindow(elem)) {

                bubbleType = special.delegateType || type;
				
                if (!rfocusMorph.test(bubbleType + type)) {
					
                    cur = cur.parentElement;
                }
                for (; cur; cur = cur.parentElement) {
					
                    eventPath.push(cur);
                    tmp = cur;
                }

                if (tmp === getDocument(elem)) {
					
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                }
            }

            // Fire handlers on the event path
            i = 0;
            while ((cur = eventPath[i++]) && !evt.isPropagationStopped()) {

                evt.type = i > 1 ?
                    bubbleType :
                    special.bindType || type;

                // hAzzle handler
                handle = (hAzzle.data(cur, 'events') || {})[evt.type] &&
                    hAzzle.data(cur, 'handle');
                if (handle) {
                    handle.apply(cur, data);
                }

                // Native handler
                handle = ontype && cur[ontype];
                if (handle && handle.apply && hAzzle.legalTypes(cur)) {
                    evt.result = handle.apply(cur, data);
                    if (evt.result === false) {
                        evt.preventDefault();
                    }
                }
            }
            evt.type = type;

            // If nobody prevented the default action, do it now
            if (!onlyHandlers && !evt.isDefaultPrevented()) {

                if ((!special._default || special._default.apply(eventPath.pop(), data) === false) &&
                
				    hAzzle.legalTypes(elem)) {

                    if (ontype && hAzzle.isFunction(elem[type]) && !hAzzle.isWindow(elem)) {

                        tmp = elem[ontype];

                        if (tmp) {
							
                            elem[ontype] = null;
                        }

                        eventCore.triggered = type;
                        elem[type]();
                        eventCore.triggered = undefined;

                        if (tmp) {
							
                            elem[ontype] = tmp;
                        }
                    }
                }
            }

            return evt.result;
        },

        preparation: function (evt) {

            evt = hAzzle.props.propFix(evt);

            var i, j, ret, matched, handleObj,
                handlerQueue = [],
                args = slice.call(arguments),
                handlers = (hAzzle.data(this, 'events') || {})[evt.type] || [],
                special = eventHooks.special[evt.type] || {};

            // Use the fix-ed hAzzle.Event rather than the (read-only) native event
            args[0] = evt;
            evt.delegateTarget = this;

            // Call the prePreparation hook for the mapped type, and let it bail if desired
            if (special.prePrep && special.prePrep.call(this, evt) === false) {
                return;
            }

            // Determine handlers
            handlerQueue = hAzzle.event.handlers.call(this, evt, handlers);

            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while ((matched = handlerQueue[i++]) && !evt.isPropagationStopped()) {
                evt.currentTarget = matched.elem;

                j = 0;
                while ((handleObj = matched.handlers[j++]) &&
                    !evt.isImmediatePropagationStopped()) {
                    if (!evt.namespace_re || evt.namespace_re.test(handleObj.namespace)) {
                        evt.handleObj = handleObj;
                        evt.data = handleObj.data;

                        ret = ((eventHooks.special[handleObj.origType] || {}).handle ||
                            handleObj.handler).apply(matched.elem, args);

                        if (ret !== undefined) {
                            if ((evt.result = ret) === false) {
                                evt.preventDefault();
                                evt.stopPropagation();
                            }
                        }
                    }
                }
            }

            // Call the postPrep hook for the mapped type
            if (special.postPrep) {
                special.postPrep.call(this, evt);
            }

            return evt.result;
        },

        handlers: function (event, handlers) {
            var i, matches, sel, handleObj,
                handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;

            if (delegateCount && cur.nodeType && (!event.button || event.type !== 'click')) {

                for (; cur !== this; cur = cur.parentElement || this) {

                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (cur.disabled !== true || event.type !== 'click') {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];

                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + ' ';

                            if (matches[sel] === undefined) {

                                matches[sel] = handleObj.needsContext ?
                                    hAzzle(sel, this).index(cur) >= 0 :
                                    hAzzle.matches(sel, [cur]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({
                                elem: cur,
                                handlers: matches
                            });
                        }
                    }
                }
            }

            // Add the remaining (directly-bound) handlers
            if (delegateCount < handlers.length) {
                handlerQueue.push({
                    elem: this,
                    handlers: handlers.slice(delegateCount)
                });
            }

            return handlerQueue;
        }
    };

hAzzle.removeEvent = function (elem, type, handle) {
    if (elem.removeEventListener) {
        elem.removeEventListener(type, handle, false);
    }
};


hAzzle.Event = function (src, props) {

    if (src && src.type) {
        this.originalEvent = src;
        this.type = src.type;
        this.isDefaultPrevented = src.defaultPrevented ||
            src.defaultPrevented === undefined &&
            src.returnValue === false ?
            returnTrue :
            returnFalse;

    } else {
        this.type = src;
    }

    if (props) {
		
        hAzzle.shallowCopy(this, props);
    }

    // Create a timestamp if incoming event doesn't have one
    this.timeStamp = src && src.timeStamp || hAzzle.now();

    // Mark it as fixed
    this[hAzzle.expando] = true;
};

// hAzzle.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html

hAzzle.Event.prototype = {

    constructor: hAzzle.Event,

    isDefaultPrevented: returnFalse,

    isPropagationStopped: returnFalse,

    isImmediatePropagationStopped: returnFalse,
   
    // Prevent default action
   
    preventDefault: function () {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;

        if (e && e.preventDefault) {
            e.preventDefault();
        }
    },
	
	// Stop event propagation
	 
    stopPropagation: function () {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation: function () {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if (e && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    },

   // Block any further event processing

    stop: function () {

        this.stopped = true;
        this.preventDefault();
        this.stopPropagation();
    }
};



hAzzle.extend({

    on: function (types, selector, data, fn, /*INTERNAL*/ one) {

        var origFn, type;

        if (typeof types === 'object') {

            if (typeof selector !== 'string') {

                data = data || selector;
                selector = undefined;
            }

            for (type in types) {

            this.on(type, selector, data, types[type], one);				
            }
            return this;
        }

        if (data == null && fn == null) {
            // ( types, fn )
            fn = selector;
            data = selector = undefined;
        } else if (fn == null) {
            if (typeof selector === 'string') {
                // ( types, selector, fn )
                fn = data;
                data = undefined;
            } else {
                // ( types, data, fn )
                fn = data;
                data = selector;
                selector = undefined;
            }
        }
        if (fn === false) {
            fn = returnFalse;
        } else if (!fn) {
            return this;
        }

        if (one === 1) {
            origFn = fn;

			fn = once(fn);

            // Use same guid so caller can remove using origFn
            fn.guid = origFn.guid || (origFn.guid = eventCore.setID());
        }
        return this.each(function () {
            hAzzle.event.add(this, types, fn, data, selector);
        });
    },
    one: function (types, selector, data, fn) {
        return this.on(types, selector, data, fn, 1);
    },
    off: function (types, selector, fn) {
        var handleObj, type;
        if (types && types.preventDefault && types.handleObj) {
            handleObj = types.handleObj;
            hAzzle(types.delegateTarget).off(
                handleObj.namespace ?
                handleObj.origType + '.' + handleObj.namespace :
                handleObj.origType,
                handleObj.selector,
                handleObj.handler
            );
            return this;
        }
        if (typeof types === 'object') {
            // ( types-object [, selector] )
            for (type in types) {
                this.off(type, selector, types[type]);
            }
            return this;
        }
        if (selector === false || typeof selector === 'function') {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if (fn === false) {
            fn = returnFalse;
        }
        return this.each(function () {
            hAzzle.event.remove(this, types, fn, selector);
        });
    },

    trigger: function (type, data) {
        return this.each(function () {
            hAzzle.event.trigger(type, data, this);
        });
    },
    triggerHandler: function (type, data) {
        var elem = this[0];
        if (elem) {
            return hAzzle.event.trigger(type, data, elem, true);
        }
    }
});

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

function once(fn) {
   return function (evt) {
 // wrap the handler in a handler that does a remove as well
      hAzzle().off(evt);
         return fn.apply(this, arguments);
    };
}

// Get document from element

function getDocument(elem) {
 return (elem.ownerDocument || doc);
}

// Create new namespace

function newNS(ns) {
   return new RegExp('(^|\\.)' + ns.join('\\.(?:.*\\.|)') + '(\\.|$)')
}