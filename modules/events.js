/*!
 * Event handler
 *
 * Mehran!
 *
 * Important!
 *
 * - Avoid non-left-click bubbling in Firefox
 * - Make sure everything is working with iFrame
 * - Fix the delegation problem as mentioned before. Clone the DOM tree etc as I wrote in an email
 * - For delegated events, try to put nodes in an array as illustrated in an email to you
 * - Fix all comments with your name
 * - Delegate handlers only called once
 * - Add support for Cordova 2.5 (WebKit)
 * - Prevent triggered image.load events from bubbling to window.load
 * - Fix blur()
 * - Fix focusout / focusIn for Firefox
 * - For cross-browser consistency, make sure we don't do click events on links
 * - Create 'bubbling' focus and blur events
 *
 * Good luck!
 *
 * Kenny
 *
 *****/
var win = window,
  doc = document || {},
  root = doc.documentElement || {},

  // Cached handlers
  container = {},

  specialsplit = /\S*,\S*|\S+/g,

  // key
  rkeyEvent = /^key/,

  // mouse
  rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,

  // touch and gestures 
  touchEvent = /^touch|^gesture/i,

  // focus
  // focusRegEx = /^(?:focusinfocus|focusoutblur)$/,
  focusinoutRegEx = /^(?:focusin|focusout)$/,

  overOutRegex = /over|out/,

  // Namespace regEx   
  ns = /[^\.]*(?=\..*)\.|.*/,

  names = /\..*/,

  // Event and handlers we have fixed
  treated = {},
  // Some prototype references we need
  //substr = String.prototype.substr,
  slice = Array.prototype.slice,
  //concat = Array.prototype.concat,
  push = Array.prototype.push,

  special = {
    pointerenter: {
      fix: 'pointerover',
      condition: check
    },
    pointerleave: {
      fix: 'pointerout',
      condition: check
    },
    mouseenter: {
      fix: 'mouseover',
      condition: check
    },
    mouseleave: {
      fix: 'mouseout',
      condition: check
    },
    mousewheel: {
      fix: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel'
    }
  },
  // Includes some event props shared by different events
  commonProps = 'attrChange attrName detail altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which type getModifierState isTrusted relatedNode scrElement propertyName data origin source state'.split(' ');

function check(evt) {
  var related = evt.relatedTarget;
  return !related ? related === null : related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !hAzzle.contains(related, this);
}

hAzzle.extend({
  eventHooks: {
    common: function () {
      return commonProps;
    },

    focusinout: function ( /*evt, original*/ ) {
      return commonProps;
    },

    keys: function (evt, original) {
      // Add which for key events
      original.keyCode = evt.keyCode || evt.which;
      return commonProps.concat('char charCode key keyCode keyIdentifier keyLocation location'.split(' '));
    },
    mouse: function (evt, original, type) {
      // click: 1 === left; 2 === middle; 3 === right
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
      if (overOutRegex.test(type)) {
        original.relatedTarget = evt.relatedTarget || evt[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
      }
      return commonProps.concat('button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement dataTransfer fromElement'.split(' '));
    },
    touch: function () {
      return commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '));
    }
  },
  Kernel: function (element, type, handler, original, namespaces, args) {
    var _special = special[type],
      evt = this;

    // Only load the event once upon unload
    if (type === 'unload') {
      handler = hAzzle.Events.once(hAzzle.Events.removeListener, element, type, handler, original);
    }
    if (_special) {
      if (_special.condition) {
        handler = hAzzle.Events.wrappedHandler(element, handler, _special.condition, args);
      }
      type = _special.fix || type;
    }
    evt.element = element;
    evt.type = type;
    evt.original = original;
    evt.namespaces = namespaces;

    evt.eventType = type;
    evt.target = element || doc;
    evt.handler = hAzzle.Events.wrappedHandler(element, handler, null, args);
  }
}, hAzzle);


hAzzle.Kernel.prototype = {
  inNamespaces: function (checkNamespaces) {
    var i, j, c = 0;
    if (!checkNamespaces) {
      return true;
    }
    if (!this.namespaces) {
      return false;
    }
    i = checkNamespaces.length;
    while (i--) {
      for (j = this.namespaces.length; j--;) {
        if (checkNamespaces[i] === this.namespaces[j]) {
          c++;
        }
      }
    }
    return checkNamespaces.length === c;
  },
  matches: function (checkElement, checkOriginal, checkHandler) {
    return this.element === checkElement && (!checkOriginal || this.original === checkOriginal) && (!checkHandler || this.handler === checkHandler);
  }
};

hAzzle.extend({

  /**
   * Add event to element
   *
   * @param {String} events
   * @param {String} selector
   * @param {Function} fn
   * @param {Function} one
   * @return {Object}
   */

  on: function (events, selector, fn, /*INTERNAL */ one) {
    return this.each(function () {
      hAzzle.Events.add(this, events, selector, fn, one);
    });
  },

  /**
   * Same as on() but the event will 'die' after the first time it's triggered
   */

  one: function (types, selector, fn) {
    return this.on(types, selector, fn, 1);
  },

  /**
   * Remove event from element
   *
   * @param {String} events
   * @param {Function} fn
   * @return {Object}
   */
  off: function (events, fn) {
    return this.each(function () {
      hAzzle.Events.off(this, events, fn);
    });
  },

  /**
   * Execute all handlers and behaviors attached to the matched elements for the given event type.
   *
   * @param {Object|String} type
   * @param {String} args
   * @return {Object}
   */

  trigger: function (type, args) {

    var el = this[0],
      types = (type || '').match(specialsplit) || [''],
      i = types.length,
      j, l, call, evt, names, handlers;

    // Don't do events on text and comment nodes
    if (el && (el.nodeType === 3 || el.nodeType === 8)) {
      return;
    }

    while (i--) {
      type = types[i].replace(names, '');
      if ((names = types[i].replace(ns, ''))) {
        names = names.split('.');
      }
      if (!names && !args) {
        var HTMLEvt = doc.createEvent('HTMLEvents');
        HTMLEvt.initEvent(type, true, true, win, 1);
        el.dispatchEvent(HTMLEvt);
      } else {
        handlers = hAzzle.Events.getHandler(el, type, null, false);
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
  },
  cloneEvents: function (from, type) {
    return this.each(function () {
      hAzzle.cloneEvents(this, from, type);
    });
  }
});

/**
 * Clone event handlers - used in the clone.js module
 */

hAzzle.cloneEvents = function (element, from, type) {
  var handlers = hAzzle.Events.getHandler(from, type, null, false),
    l = handlers.length,
    i = 0,
    args, hDlr;

  for (; i < l; i++) {
    if (handlers[i].original) {
      args = [
        element,
        handlers[i].type
      ];
      if ((hDlr = handlers[i].handler.__handler)) {
        args.push(hDlr.selector);
      }
      args.push(handlers[i].original);
      hAzzle.Events.add.apply(null, args);
    }
  }
  return element;
};

// hAzzle.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html

function Event(evt, element) {

  if (!arguments.length) {
    return;
  }

  evt = evt || ((element.ownerDocument || element.document || element).parentWindow || win).evt;

  this.originalEvent = evt;

  if (!evt) {
    return;
  }

  var type = evt.type,
    target = evt.target,
    i, p, props, fixHook;

  this.target = target && target.nodeType === 3 ? target.parentNode : target;

  fixHook = treated[type];

  if (!fixHook) {

    fixHook = 'common';

    if (rmouseEvent.test(type)) {
      fixHook = 'mouse';
    }

    //leave focus and blur do their
    //} else if (focusRegEx.test(type)) {
    else if (focusinoutRegEx.test(type)) {
      fixHook = 'focusinout';
    } else if (touchEvent.test(type)) {
      fixHook = 'touch';
    } else if (rkeyEvent.test(type)) {
      fixHook = 'keys';
    }

    fixHook = hAzzle.eventHooks[fixHook];

    treated[type] = fixHook;
  }

  props = fixHook(evt, this, type);

  for (i = props.length; i--;) {
    if (!((p = props[i]) in this) && p in evt) {
      this[p] = evt[p];
    }
  }
}

Event.prototype = {

  preventDefault: function () {

    var e = this.originalEvent;

    this.isDefaultPrevented = function () {
      return true;
    };

    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

  },
  stopPropagation: function () {
    var e = this.originalEvent;

    this.isPropagationStopped = function () {
      return true;
    };

    if (e && e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  },
  stop: function () {
    var e = this;
    e.preventDefault();
    e.stopPropagation();
    e.stopped = true;
  },
  stopImmediatePropagation: function () {
    var e = this.originalEvent;
    this.isImmediatePropagationStopped = function () {
      return true;
    };
    if (e && e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }
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
hAzzle.Events = {
  add: function (el, events, selector, fn, one) {
    var originalFn, type, types, i, args, entry, first;

    // Don't attach events to noData or text/comment nodes (allow plain objects tho)
    if (el.nodeType === 3 || el.nodeType === 8 || !events) {
      return;
    }

    /**
     * Mehran!!!
     *
     * TODO!! This is not working on delegated events, have to fix this ASAP !!
     *
     * So you know what's going on. This is for multiple handlers.
     *
     * Example:
     *
     *  // multiple handlers
     * hAzzle( 'button' ).first().on({
     *  click: function (e) { alert('clicked'); },
     *  mouseover: function (e) { alert('mouseover'); }
     *  });
     *
     *
     * So, Mehran! You have to find an way to get this to work with delegated events
     *
     */

    if (typeof selector === 'undefined' && typeof events === 'object')
      for (type in events) {
        if (events.hasOwnProperty(type)) {

          // Mehran !  Note!!		events[type] are the function itself

          hAzzle.Events.add.call(this, el, type, events[type]);
        }

      } else {

        // Delegated event

        if (typeof selector !== 'function') {
          originalFn = fn;
          args = slice.call(arguments, 4);
          fn = hAzzle.Events.delegate(selector, originalFn);
        } else {
          args = slice.call(arguments, 3);
          fn = originalFn = selector;
        }

        // One
        if (one === 1) {

          // Make a unique handler that get removed after first time it's triggered
          fn = hAzzle.Events.once(hAzzle.Events.off, el, events, fn, originalFn);
        }
        // Handle multiple events separated by a space

        types = (events || '').match(specialsplit) || [''];

        i = types.length;

        while (i--) {
          first = hAzzle.Events.putHandler(entry = new hAzzle.Kernel(el, types[i].replace(names, ''), fn, originalFn, types[i].replace(ns, '').split('.'), args, false));
          // Add root listener only if we're the first
          if (first) {
            hAzzle.Events.addRootListener(el, entry);
          }
        }
        return el;
      }
  },

  addRootListener: function (el, entry) {

    el.addEventListener(entry.eventType, hAzzle.Events.rootListener, false);

  },

  // Detach an event or set of events from an element

  off: function (el, typeSpec, fn) {
    var isTypeStr = typeof typeSpec === 'string',
      type, namespaces, i, k;

    if (isTypeStr && hAzzle.inArray(typeSpec, ' ') > 0) {
      typeSpec = typeSpec.split(typeSpec);

      // Mehran ! Check if you can use a while loop here

      for (i = typeSpec.length; i--;) {
        hAzzle.Events.off(el, typeSpec[i], fn);
      }
      return el;
    }

    type = isTypeStr && typeSpec.replace(names, '');

    if (type && special[type]) {
      type = special[type].fix;
    }

    if (!typeSpec || isTypeStr) {

      // Namespace

      // Mehran! Maybe an trim() here? You have to test and check if that works!

      if ((namespaces = isTypeStr) && typeSpec.replace(ns, '')) {
        namespaces = namespaces.split('.');
      }
      // Remove the listener
      hAzzle.Events.removeListener(el, type, fn, namespaces);

    } else if (typeof typeSpec !== 'function') {
      hAzzle.Events.removeListener(el, null, typeSpec);
    } else {
      if (typeSpec) {
        for (k in typeSpec) {
          if (typeSpec.hasOwnProperty(k)) {
            hAzzle.Events.off(el, k, typeSpec[k]);
          }
        }
      }
    }
    return el;
  },
  findTarget: function (selector, target, root) {
    if (root === win) {
      root = doc;
    }
    var i, matches = hAzzle(selector, root);
    for (; target !== root; target = target.parentNode || root) {
      if (matches !== null) {
        for (i = matches.length; i--;) {
          if (matches[i] === target) {
            return target;
          }
        }
      }
    }
  },
  delegate: function (selector, fn) {
    function handler(e) {
      var cur = e.target;
      if (cur.nodeType && (!e.button || e.type !== 'click')) {
        // Don't process clicks on disabled elements
        if (e.target.disabled !== true || e.type !== 'click') {
          var m = null;
          if (handler.__handlers) {
            m = handler.__handlers.currentTarget;
          }
          if (m) {
            return fn.apply(m, arguments);
          }
        }
      }
    }
    handler.__handlers = {
      selector: selector
    };
    return handler;
  },
  removeListener: function (element, type, handler, ns) {
    type = type && type.replace(names, '');
    type = hAzzle.Events.getHandler(element, type, null, false);
    var removed = {};
    // No point to continue if no event attached on the element
    if (type) {
      var i = 0,
        l = type.length;

      for (; i < l; i++) {
        if ((!handler || type[i].original === handler) && type[i].inNamespaces(ns)) {
          hAzzle.Events.delHandler(type[i]);
          if (!removed[type[i].eventType]) {
            removed[type[i].eventType] = {
              t: type[i].eventType,
              c: type[i].type
            };
          }
        }
      }
      for (i in removed) {
        if (!hAzzle.Events.hasHandler(element, removed[i].t, null, false)) {
          element.removeEventListener(removed[i].t, hAzzle.Events.rootListener, false);
        }
      }
    }
  },
  /***/
  once: function (rm, element, type, handler, callback) {
    return function () {
      handler.apply(this, arguments);
      rm(element, type, callback);
    };
  },
  rootListener: function (evt, type) {
    var listeners = hAzzle.Events.getHandler(this, type || evt.type, null, false),
      l = listeners.length,
      i = 0;
    evt = new Event(evt, this, true);
    for (; i < l && !evt.isImmediatePropagationStopped(); i++) {
      if (!listeners[i].removed) {
        listeners[i].handler.call(this, evt);
      }
    }
  },
  wrappedHandler: function (element, fn, condition, args) {
    function call(evt, eargs) {
      return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
    }

    function getTarget(evt, eventElement) {
      var target = fn.__handlers ? hAzzle.Events.findTarget(fn.__handlers.selector, evt.target, this) : eventElement;
      fn.__handlers.currentTarget = target;
      return target;
    }
    var handler = condition ? function (evt) {
        var target = getTarget(evt, this);
        // delegated event
        if (condition.apply(target, arguments)) {
          if (evt) {
            evt.currentTarget = target;
          }
          return call(evt, arguments);
        }
      } : function (evt) {
        if (fn.__handlers) {
          evt = evt.clone(getTarget(evt));
        }
        return call(evt, arguments);
      };
    handler.__handlers = fn.__handlers;
    return handler;
  },
  findIt: function (element, type, original, handler, root, fn) {
    if (!type || type === '*') {
      for (var t in container) {
        if (t.charAt(0) === root ? 'r' : '#') {
          hAzzle.Events.findIt(element, t.substr(1), original, handler, root, fn);
        }
      }
    } else {
      var i = 0,
        l, list = container[root ? 'r' : '#' + type];
      if (!list) {
        return;
      }
      for (l = list.length; i < l; i++) {
        if ((element === '*' || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) {
          return;
        }
      }
    }
  },
  hasHandler: function (element, type, original, root) {
    if ((root = container[(root ? 'r' : '#') + type])) {
      for (type = root.length; type--;) {
        if (!root[type].root && root[type].matches(element, original, null)) {
          return true;
        }
      }
    }
    return false;
  },
  getHandler: function (element, type, original, root) {
    var entries = [];
    hAzzle.Events.findIt(element, type, original, null, root, function (entry) {
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
  delHandler: function (entry) {
    hAzzle.Events.findIt(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
      list.splice(i, 1);
      entry.removed = true;
      if (list.length === 0) {
        delete container[(entry.root ? 'r' : '#') + entry.type];
      }
      return false;
    });
  }
};


// Short cut function for frequently used functions

hAzzle.each(['click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change',
  'select', 'keypress', 'keyup', 'focus', 'focusout', 'hover', 'resize', 'dblclick', 'scroll'
], function (name) {
  hAzzle.Core[name] = function (data, fn) {
    return this.on(name, data, fn);
  };
});
