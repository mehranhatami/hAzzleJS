// Event handler

 var win = window,
     namespaceRegex = /[^\.]*(?=\..*)\.|.*/,
     nameRegex = /\..*/,
     addEvent = 'addEventListener',
     removeEvent = 'removeEventListener',
     own = 'hasOwnProperty',
     call = 'call',
     doc = document || {},
     root = doc.documentElement || {},

     container = {},

     rkeyEvent = /^key/,
     rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,

     threated = {},

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

     threatment = {

         // Don't do events on disabeled nodes

         disabeled: function (el, type) {
             if (el.disabeled && type === "click") return true;
         },

         // Don't do events on text and comment nodes 

         nodeType: function (el) {
             if (hAzzle.nodeType(3, el) || hAzzle.nodeType(8, el)) return true;
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


 function Event(evt, element) {

     // Allow instantiation without the 'new' keyword
     if (!(this instanceof Event)) {
         return new Event(evt, element);
     }

     if (!arguments.length) return;

     evt = evt || ((element.ownerDocument || element.document || element).parentWindow || win).evt;

     this.originalEvent = evt;

     if (!evt) return;

     var type = evt.type,
         target = evt.target,
         i, l, p, props, fixHook;

     this.target = target && target.nodeType === 3 ? target.parentNode : target;

     fixHook = threated[type];

     if (!fixHook) {

         // More or less the same way as jQuery does it, but
		 // I introduced "eventHooks" to it's possible to check
		 // against other events too.

         threated[type] = fixHook = rmouseEvent.test(type) ? hAzzle.eventHooks['mouse'] :
             rkeyEvent.test(type) ? hAzzle.eventHooks['keys'] :
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
         var ne = Event(this, this.element);
         ne.currentTarget = currentTarget;
         return ne;
     }
 };
 // Same as jQuery / Zepto
 
 hAzzle.Events = {
     
	 // Add event listener
     
	 add: function (el, events, selector, fn, one) {
         var originalFn, type, types, i, args, entry, first;

         // Dont' allow click on disabeled elements, or events on text and comment nodes

         if (threatment['disabeled'](el, events) || threatment['nodeType'](el)) return false;

         if (selector === undefined && typeof events === 'object')

             for (type in events) {
                 if (events.hasOwnProperty(type)) {
                     hAzzle.Events.add.call(this, el, type, events[type]);
                 }
             } else {

                 // Delegated event

                 if (!hAzzle.isFunction(selector)) {
                     originalFn = fn;
                     args = slice.call(arguments, 4);
                     fn = hAzzle.Events.delegate(selector, originalFn);
                 } else {
                     args = slice.call(arguments, 3);
                     fn = originalFn = selector;
                 }

                 types = events.split(' ');

                 // One

                 if (one === 1) fn = hAzzle.Events.once(hAzzle.Events.remove, el, events, fn, originalFn);

                 for (i = types.length; i--;) {
                     first = hAzzle.Events.put(entry = hAzzle.Kernel(
                         el, types[i].replace(nameRegex, '') // event type
                         , fn, originalFn, types[i].replace(namespaceRegex, '').split('.') // namespaces
                         , args, false
                     ));

                     // First event of this type on this el, add root listener

                     if (first) el[addEvent](entry.eventType, hAzzle.Events.rootListener, false);
                 }
                 return el;
             }

     },
     
	 // Remove event listener
     
	 remove: function (el, typeSpec, fn) {
         var isTypeStr = hAzzle.isString(typeSpec),
             type, namespaces, i;

         if (isTypeStr && typeSpec.indexOf(' ') > 0) {

             // off(el, 't1 t2 t3', fn) or off(el, 't1 t2 t3')

             typeSpec = typeSpec.split(typeSpec);

             for (i = typeSpec.length; i--;)
                 hAzzle.Events.remove(el, typeSpec[i], fn);
             return el;
         }

         type = isTypeStr && typeSpec.replace(nameRegex, '');

         if (type && special[type]) type = special[type].fix;

         if (!typeSpec || isTypeStr) {
             // off(el) or off(el, t1.ns) or off(el, .ns) or off(el, .ns1.ns2.ns3)
             if (namespaces = isTypeStr && typeSpec.replace(namespaceRegex, '')) namespaces = namespaces.split('.');
             hAzzle.Events.removeListener(el, type, fn, namespaces);
         } else if (hAzzle.isFunction(typeSpec)) {
             // off(el, fn);
             hAzzle.Events.removeListener(el, null, typeSpec);
         } else {

             for (var k in typeSpec) {
                 if (typeSpec.hasOwnProperty(k)) hAzzle.Events.remove(el, k, typeSpec[k]);
             }
         }

         return el;
     },

     /**
      * Set up a delegate helper using the given selector, wrap the handler function
      */

     delegate: function (selector, fn) {

         function findTarget(target, root) {
             var i, array = hAzzle.isString(selector) ? hAzzle.select(selector, root) : selector;
             for (; target && target !== root; target = target.parentNode) {
                 if (array !== null) {
                     for (i = array.length; i--;) {
                         if (array[i] === target) return target;
                     }
                 }
             }
         }

         function handler(e) {
             if (e.target.disabled !== true) {
                 var match = findTarget(e.target, this);
                 if (match) fn.apply(match, arguments);
             }
         }

         handler.__handlers = {
             ft: findTarget // attach it here for special to use too
             ,
             selector: selector
         };
         return handler;
     },

     removeListener: function (element, orgType, handler, namespaces) {

         var type = orgType && orgType.replace(nameRegex, ''),
             handlers = hAzzle.Events.get(element, type, null, false),
             removed = {}, i, l;

             // Namespace
         for (i = 0, l = handlers.length; i < l; i++) {
             if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
                 hAzzle.Events.del(handlers[i]);
                 if (!removed[handlers[i].eventType])
                     removed[handlers[i].eventType] = {
                         t: handlers[i].eventType,
                         c: handlers[i].type
                     };
             }
         }

         for (i in removed) {
             if (!hAzzle.Events.has(element, removed[i].t, null, false)) {
                 // last listener of this type, remove the rootListener
                 element[removeEvent](removed[i].t, hAzzle.Events.rootListener, false);
             }
         }
     },

     once: function (rm, element, type, fn, originalFn) {
         return function () {
             fn.apply(this, arguments);
             rm(element, type, originalFn);
         };
     },

     rootListener: function (evt, type) {
         var listeners = hAzzle.Events.get(this, type || evt.type, null, false),
             l = listeners.length,
             i = 0;

         evt = Event(evt, this, true);
         if (type) evt.type = type;

         // iterate through all handlers registered for this type, calling them unless they have
         // been removed by a previous handler or stopImmediatePropagation() has been called
         for (; i < l && !evt.isImmediatePropagationStopped(); i++) {
             if (!listeners[i].removed) listeners[i].handler.call(this, evt);
         }
     },

     wrappedHandler: function (element, fn, condition, args) {
         var call = function (evt, eargs) {
             return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
         }, findTarget = function (evt, eventElement) {
                 return fn.__handlers ? fn.__handlers.ft(evt.target, element) : eventElement;
             }, handler = condition ? function (evt) {
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
         var pfx = root ? 'r' : '$';
         if (!type || type === '*') {
             for (var t in container) {
                 if (t.charAt(0) === pfx) {
                     hAzzle.Events.findIt(element, t.substr(1), original, handler, root, fn);
                 }
             }
         } else {

             var i = 0,
                 l, list = container[pfx + type],
                 all = element === '*';
             if (!list) return;
             for (l = list.length; i < l; i++) {
                 if ((all || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) return;
             }
         }
     },

     has: function (element, type, original, root) {
         if (root = container[(root ? "r" : "$") + type])
             for (type = root.length; type--;)
                 if (!root[type].root && root[type].matches(element, original, null)) return true;
         return false;
     },
     get: function (element, type, original, root) {
         var entries = [];
         hAzzle.Events.findIt(element, type, original, null, root, function (entry) {
             entries.push(entry);
         });
         return entries;
     },
     put: function (entry) {
         var has = !entry.root && !this.has(entry.element, entry.type, null, false),
             key = (entry.root ? 'r' : '$') + entry.type;
         (container[key] || (container[key] = [])).push(entry);
         return has;
     },
     del: function (entry) {
         hAzzle.Events.findIt(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
             list.splice(i, 1);
             entry.removed = true;
             if (list.length === 0) delete container[(entry.root ? 'r' : '$') + entry.type];
             return false;
         });
     }
 };

 hAzzle.extend({

     eventHooks: {

         keys: function (event, newEvent) {
             newEvent.keyCode = event.keyCode || event.which;
             return commonProps.concat(["char", "charCode", "key", "keyCode"]);

         },
         mouse: function (event, newEvent) {

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

             return commonProps.concat("button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "));
         }
     },

     Kernel: function (element, type, handler, original, namespaces, args) {

         // Allow instantiation without the 'new' keyword

         if (!(this instanceof hAzzle.Kernel)) {
             return new hAzzle.Kernel(element, type, handler, original, namespaces, args);
         }

         var _special = special[type];

         // Only load the event once upon unload

         if (type === 'unload') handler = hAzzle.Events.once(hAzzle.Events.removeListener, element, type, handler, original);

         if (_special) {
             if (_special.condition) {
                 handler = hAzzle.Events.wrappedHandler(element, handler, _special.condition, args);
             }

             type = _special.fix || type;
         }

         this.element = element;
         this.type = type;
         this.original = original;
         this.namespaces = namespaces;
         this.eventType = type;
         this.target = element;
         this.handler = hAzzle.Events.wrappedHandler(element, handler, null, args);
     }

 });

 hAzzle.Kernel.prototype['inNamespaces'] = function (checkNamespaces) {

     var i, j, c = 0;
     if (!checkNamespaces) return true;
     if (!this.namespaces) return false;
     for (i = checkNamespaces.length; i--;) {
         for (j = this.namespaces.length; j--;) {
             if (checkNamespaces[i] == this.namespaces[j]) c++;
         }
     }
     return checkNamespaces.length === c;
 };

 hAzzle.Kernel.prototype['matches'] = function (checkElement, checkOriginal, checkHandler) {
     return this.element === checkElement &&
         (!checkOriginal || this.original === checkOriginal) &&
         (!checkHandler || this.handler === checkHandler);
 };


 hAzzle.fn.extend({

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
         return this.each(function () {
             hAzzle.Events.add(this, events, selector, fn, one);
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
         return this.each(function () {
             hAzzle.Events.remove(this, events, fn);
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

         var types = type.split(' '),
             i, j, l, call, evt, names, handlers;

         if (threatment['disabeled'](el, type) || threatment['nodeType'](el)) return false;

         for (i = types.length; i--;) {
             type = types[i].replace(nameRegex, '');
             if (names = types[i].replace(namespaceRegex, '')) names = names.split('.');
             if (!names && !args) {
                 var HTMLEvt = doc.createEvent('HTMLEvents');
                 HTMLEvt['initEvent'](type, true, true, win, 1);
                 el.dispatchEvent(HTMLEvt);

             } else {
                 handlers = hAzzle.Events.get(el, type, null, false);
                 evt = Event(null, el);
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

 // Shortcut methods for 'on'

 hAzzle.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
     "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
     "change select submit keydown keypress keyup error contextmenu").split(" "), function (_, name) {

     // Handle event binding

     hAzzle.fn[name] = function (data, fn) {
         //events, fn, delfn, one
         return arguments.length > 0 ?
             this.on(name, data, fn) :
             this.trigger(name);
     };
 });