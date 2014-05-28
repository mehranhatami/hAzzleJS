/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.6
 * Released under the MIT License.
 *
 * Date: 2014-05-28
 */
(function (win, undefined) {

  // hAzzle already defined, leave now

  if (win.hAzzle) {

    return;
  }

  var doc = win.document,
    html = doc.documentElement,

    // Establish the object that gets returned to break out of a loop iteration.

    breaker = {},

    // DOM ready related

    readyList = [],
    readyFired = false,
    readyEventHandlersInstalled = false,

    /**
     * Prototype references.
     */

    ArrayProto = Array.prototype,

    /**
     * Save a reference to some core methods
     */

    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = Object.prototype.toString,
    trim = String.prototype.trim,

    /*
     * Unique ID
     */

    uid = {
      current: 0,
      next: function () {
        var id = ++this.current + '';
        return 'hAzzle_' + id;
      }
    },

    // Define a local copy of hAzzle

    hAzzle = function (selector, context) {
      return new Core(selector, context);
    };


  // Init Core

  function Core(selector, context) {

    this.length = 0;

    if (selector) {

      // Domready

      if (typeof selector === 'function') {
        return hAzzle.ready(selector);
      }
      selector = typeof selector === 'string' ? hAzzle.select(selector, context) : hAzzle.unique(!selector.nodeType &&
        typeof selector.length !== 'undefined' ?
        selector : [selector]);
      var i = this.length = selector.length;
      while (i--) {
        this[i] = selector[i];
      }
    }
  }

  /**
   * hAzzle prototype
   */

  Core.prototype = {

    /**
     * Returns a new array with the result of calling callback on each element of the array
     * @param {function} fn
     * @return {hAzzle}
     */

    twist: function (fn) {
      var elems = this,
        i = 0,
        len = elems.length;
      for (i = len; i--;) {
        return hAzzle(fn(elems[i]));
      }
    },

    twin: function (callback) {
      return hAzzle(hAzzle.map(this, function (elem, i) {
        return callback.call(elem, i, elem);
      }));
    },

    /**
     * @param {function} fn
     * @param {Object} obj
     * @return {hAzzle}
     */

    each: function (fn, obj) {
      return hAzzle.each(this, fn, obj);
    },

    /**
     * @param {Function} fn
     * @param {Object} obj
     * @return {hAzzle}
     */

    deepEach: function (fn, obj) {
      return hAzzle.deepEach(this, fn, obj);
    },

    /**
     * @param {Function} callback
     * @param {Function} func
     * @return {Array}
     */

    map: function (callback, func) {
      var m = [],
        n, i = 0,
        self = this,
        len = self.length;
      for (; i < len; i++) {
        n = callback.call(self, self[i], i);
        if (func) {
          if (func(n)) {
            m.push(n);
          }
        } else {
          m.push(n);
        }
      }
      return m;
    }
  };

  /**
   * Extend the contents of two objects
   */

  hAzzle.extend = function (destination, source) {
    for (var property in destination) {
      // Objects only
      if (destination[property] && destination[property].constructor && typeof destination[property] === 'object') {
        (source || Core.prototype)[property] = destination[property] || {};
      } else {
        if (destination.hasOwnProperty(property)) {
          (source || Core.prototype)[property] = destination[property];
        }
      }
    }
  };




  hAzzle.extend({

    type: function (obj) {
      if (obj === null) {
        return obj + '';
      }
      return toString.call(obj);
    },
    is: function (kind, obj) {
      return hAzzle.indexOf(kind, this.type(obj)) >= 0;
    },
    isEmpty: function (str, ignoreWhitespace) {
      return str === null || !str.length || ignoreWhitespace && /^\s*$/.test(str);
    },
    isDate: function (val) {
      return !!(val && val.getTimezoneOffset && val.setUTCFullYear);
    },
    isRegExp: function (r) {
      return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
    },
    isArguments: function (a) {
      return !!(a && Object.prototype.hasOwnProperty.call(a, 'callee'));
    },
    isObject: function (obj) {
      return obj === Object(obj);
    },
    isEmptyObject: function (obj) {
      var name;
      for (name in obj) {
        return false;
      }
      return true;
    },
    isNumeric: function (obj) {
      // parseFloat NaNs numeric-cast false positives (null|true|false|'')
      // ...but misinterprets leading-number strings, particularly hex literals ('0x...')
      // subtraction forces infinities to NaN
      return !hAzzle.isArray(obj) && obj - parseFloat(obj) >= 0;
    },
    isBlank: function (str) {
      return hAzzle.trim(str).length === 0;
    },
    isArray: Array.isArray,
    isWindow: function (obj) {
      return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    },
    isFile: function (obj) {
      return toString.call(obj) === '[object File]';
    },
    isBlob: function (obj) {
      return toString.call(obj) === '[object Blob]';
    },
    isDocument: function (obj) {
      return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
    },
    isNull: function (obj) {
      return obj === null;
    },
    isBoolean: function (value) {
      return value === true || value === false;
    },
    error: function (msg) {
      throw new Error(msg);
    },
    isNumber: function (o) {
      return toString.call(o) === '[object Number]';
    },
    isString: function (o) {
      return toString.call(o) === '[object String]';
    },
    isFunction: function (o) {
      return toString.call(o) === '[object Function]';
    },
    isDefined: function (o) {
      return o !== void 0;
    },
    isUndefined: function (o) {
      return o === void 0;
    },
    IsNaN: function (val) {
      return typeof val === 'number' && val !== +val;
    },
    isElement: function (o) {
      return o && o.nodeType === 1 || o.nodeType === 9;
    },
    isNodeList: function (obj) {
      return obj && hAzzle.is([
        'nodelist',
        'htmlcollection',
        'htmlformcontrolscollection'
      ], obj);
    },

    /** 
     * Return current time
     */

    now: Date.now,

    /**
     * Determine if the array or object contains a given value
     */

    indexOf: function (array, obj) {
      if (obj === null) {
        return false;
      }
      var i = 0,
        l = array.length;
      for (; i < l; i++) {
        if (obj === array[i]) {
          return i;
        }
      }
      return !1;
    },

    // Keep the identity function around for default iterators.

    identity: function (value) {
      return value;
    },

    /**
     * Determine whether all of the elements match a truth test.
     */

    every: function (obj, predicate, context) {

      predicate = predicate || hAzzle.identity;

      var result = true;
      if (obj === null) {
        return result;
      }
      hAzzle.each(obj, function (value, index, list) {
        if (!(result = result && predicate.call(context, value, index, list))) {
          return breaker;
        }
      });
      return !!result;
    },

    /**
     *  Determine if at least one element in the object matches a truth test.
     */

    any: function (obj, predicate, context) {

      predicate = predicate || hAzzle.identity;
      var result = false;
      if (obj === null) {
        return result;
      }
      hAzzle.each(obj, function (value, index, list) {
        if (result || (result = predicate.call(context, value, index, list))) {
          return breaker;
        }
      });
      return !!result;
    },

    /**
     * this allows method calling for setting values
     *
     * @example
     * hAzzle(elements).css('color', function (el) {
     *   return el.getAttribute('data-original-color')
     * })
     *
     * @param {Element} el
     * @param {function (Element)|string}
     * @return {string}
     */
    setter: function setter(el, v) {
      return typeof v == 'function' ? v.call(el, el) : v;
    },

    /**
     * Run callback for each element in the collection
     * @param {hAzzle|Array} ar
     * @param {function(Object, number, (hAzzle|Array))} fn
     * @param {Object} scope
     * @param {boolean} arg
     * @return {hAzzle|Array}
     */

    each: function (ar, fn, scope, arg) {
      if (!ar) {
        return;
      }
      var ind, i = 0,
        l = ar.length;
      for (; i < l; i++) {
        ind = arg ? ar.length - i - 1 : i;
        fn.call(scope || ar[ind], ar[ind], ind, ar);
      }
      return ar;
    },


    /**
     * @param {hAzzle|Array} ar
     * @param {function(Object, number, (hAzzle|Array))} fn
     * @param {Object} scope
     * @return {hAzzle|Array}
     */

    deepEach: function (ar, fn, scope) {
      var i = 0,
        l = ar.length;
      for (; i < l; i++) {
        if (ar[i].nodeName && (ar[i].nodeType === 1 || ar[i].nodeType === 11)) {
          hAzzle.deepEach(ar[i].childNodes, fn, scope);
          fn.call(scope || ar[i], ar[i], i, ar);
        }
      }
      return ar;
    },

    /**
     * @param {hAzzle|Array} ar
     * @param {function(Object, number, (hAzzle|Array))} fn
     * @param {Object=} scope
     * @return {boolean}
     */

    some: function (ar, fn, scope) {
      var i = 0,
        j = ar.length;
      for (; i < j; ++i) {
        if (fn.call(scope || null, ar[i], i, ar)) {
          return true;
        }
      }
      return false;
    },
    normalize: function (node, clone) {
      var i, l, ret;
      if (typeof node === 'string') {
        return hAzzle.create(node);
      }
      if (hAzzle.isNode(node)) {
        node = [node];
      }
      if (clone) {
        ret = [];
        // don't change original array
        for (i = 0, l = node.length; i < l; i++) {
          ret[i] = hAzzle.cloneNode(node[i]);
        }
        return ret;
      }
      return node;
    },

    /**
     *  Convert dashed to camelCase; used by the css and data modules
     *
     * @param {string} str
     * @return {string}
     */

    camelize: function (str) {
      return str.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase();
      });
    },


    arrayLike: function (o) {
      return (typeof o === 'object' && isFinite(o.length));
    },

    /**
     * @param {string} s
     * @return {string}
     */

    decamelize: function (str) {
      return str ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : str;
    },

    /**
     * Unique
     */

    unique: function (ar) {
      var a = [],
        i = -1,
        j,
        has,
        len = ar.length;
      while (++i < len) {
        j = -1;
        has = false;
        while (++j < a.length) {
          if (a[j] === ar[i]) {
            has = true;
            break;
          }
        }
        if (!has) {

          a.push(ar[i]);
        }
      }
      return a;
    },

    /**
     * Check if an element exist in an array
     */
    inArray: function (elem, arr, i) {
      var iOff = function (_find, i) {
        if (typeof i === 'undefined') {
          i = 0;
        }
        if (i < 0) {
          i += this.length;
        }
        if (i < 0) {
          i = 0;
        }
        for (var n = this.length; i < n; i++) {
          if (i in this && this[i] === _find) {
            return i;
          }
        }
        return -1;
      };
      return arr === null ? -1 : iOff.call(arr, elem, i);
    },

    map: function (elems, callback, arg) {
      var value, i = 0,
        length = elems.length,
        ret = [];
      // Go through the array, translating each of the items to their new values
      if (toString.call(elems) === '[object String]') {

        for (i in elems) {
          if (elems.hasOwnProperty(i)) {
            value = callback(elems[i], i, arg);
            if (value !== null) {
              ret.push(value);
            }
          }
        }
      } else {

        for (; i < length; i++) {
          value = callback(elems[i], i, arg);
          if (value !== null) {
            ret.push(value);
          }
        } // Go through every key on the object,
      }
      // Flatten any nested arrays
      return concat.apply([], ret);
    },

    /**
     * Remove empty whitespace from beginning and end of a string
     *
     * @param{String} str
     * @return{String}
     *
     * String.prototype.trim() are only supported in IE9+ Standard mode,
     * so we need a fallback solution for that
     */

    trim: trim ? function (text) {
      return text === null ? '' : trim.call(text);
    } : function (text) {
      return text === null ? '' : text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    isNode: function (node) {
      return node && node.nodeName && (node.nodeType === 1 || node.nodeType === 11);
    },

    pluck: function (array, property) {
      return array.map(function (item) {
        return item[property];
      });
    },

    /**
     * Get text
     */

    getText: function (elem) {
      var node, ret = '',
        i = 0;
      if (!elem.nodeType) {
        // If no nodeType, this is expected to be an array
        for (;
          (node = elem[i++]);) {
          ret += hAzzle.getText(node);
        }
      } else if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {
        if (typeof elem.textContent === 'string') {
          return elem.textContent;
        }
        for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
          ret += hAzzle.getText(elem);
        }
      } else if (elem.nodeType === 3 || elem.nodeType === 4) {
        return elem.nodeValue;
      }
      return ret;
    },

    /**
     *  Global ID for objects
     *  Return or compute a unique ID
     *
     * @param{Object} elem
     * @return{Object}
     */

    getUID: function (el) {
      return el && (el.hAzzle_id || (el.hAzzle_id = uid.next()));
    },

    /**
     * Check if it's an XML or HTML document
     */

    isXML: function (elem) {
      return elem && (elem.ownerDocument || elem).documentElement.nodeName !== 'HTML';
    },

    /**
     * Return the elements nodeName
     */

    nodeName: function (el, name) {
      return el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
    },

    /*
     * Finds the elements of an array which satisfy a filter function.
     */

    grep: function (elems, callback, inv, args) {
      var ret = [],
        retVal,
        i = 0,
        length = elems.length;
      inv = !! inv;
      for (; i < length; i++) {
        if (i in elems) { // check existance
          retVal = !! callback.call(args, elems[i], i); // set callback this
          if (inv !== retVal) {
            ret.push(elems[i]);
          }
        }
      }
      return ret;
    },

    // Nothing
    noop: function () {},

    /**
     * Return all the elements that pass a truth test.
     *
     * @param {String|nodeType|Function} sel
     * @return {Array}
     *
     */

    filter: function (obj, predicate, context) {
      var results = [];
      if (obj === null) {
        return results;
      }
      hAzzle.each(obj, function (value, index, list) {
        if (predicate.call(context, value, index, list)) {
          results.push(value);
        }
      });
      return results;
    },

    /**
     * DOM ready
     */

    ready: function (callback, context) {

      // context are are optional, but document by default

      context = context || doc;

      if (readyFired) {
        setTimeout(function () {
          callback(context);
        }, 1);
        return;
      } else {

        // add the function and context to the list

        readyList.push({
          fn: callback,
          ctx: context
        });
      }
      // if document already ready to go, schedule the ready function to run
      if (doc.readyState === 'complete') {

        setTimeout(ready, 1);

      } else if (!readyEventHandlersInstalled) {

        // otherwise if we don't have event handlers installed, install them

        doc.addEventListener('DOMContentLoaded', ready, false);
        // backup is window load event
        window.addEventListener('load', ready, false);

        readyEventHandlersInstalled = true;
      }
    },

    // Invoke a method (with arguments) on every item in a collection.

    invoke: function (obj, method) {
      var args = slice.call(arguments, 2),
        isFunc = typeof method === 'function';
      return hAzzle.map(obj, function (value) {
        return (isFunc ? method : value[method]).apply(value, args);
      });
    },

    /**
     * Throttle through a function
     */

    throttle: function (func, wait, options) {
      var context, args, result, timeout = null,
        previous = 0;
      if (!options) {
        options = options = {};
      }
      var later = function () {
        previous = options.leading === false ? 0 : hAzzle.now();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
      };
      return function () {
        var now = hAzzle.now();
        if (!previous && options.leading === false) {
          previous = now;
        }
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },

    /**
     * Returns a standard or browser-prefixed methods (moz, webkit, ms, o) if found.
     */

    prefix: function (key, obj) {
      var result, upcased = key[0].toUpperCase() + key.slice(1),
        prefix, prefixes = [
          'moz',
          'webkit',
          'ms',
          'o'
        ];
      obj = obj || window;
      result = obj[key];
      if (result) {
        return result;
      }
      while ((prefix = prefixes.shift())) {
        if ((result = obj[prefix + upcased])) {
          break;
        }
      }
      return result;
    },

    /**
     * DOM traversing
     */

    nodes: function (el, dir, /*INTERNAL */ until) {

      var matched = [];
      //TODO Kenny: truncate is defined but never used
      //truncate = until !== 'undefined';

      while ((el = el[dir]) && el.nodeType !== 9) {
        if (el.nodeType === 1) {
          if (hAzzle(el).is(until)) {
            break;
          }
          matched.push(el);
        }
      }
      return matched;
    }

  }, hAzzle);


  // call this when the document is ready
  // this function protects itself against being called more than once

  function ready() {

    if (!readyFired) {
      // this must be set to true before we start calling callbacks
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        // if a callback here happens to add new ready handlers,
        // the docReady() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list

        readyList[i].fn.call(window, readyList[i].ctx);
      }
      // allow any closures held by these functions to free
      readyList = [];
    }
  }


  /**
   * Check if an element contains another element
   
   */

  hAzzle.contains = 'compareDocumentPosition' in html ? function (container, element) {
    var pos = (container.compareDocumentPosition(element) & 16);
    return (pos === 16);
  } : function (container, element) {
    return container !== element && container.contains(element);
  };

  // Expose hAzzle to the global object
  if (typeof exports === 'object') {
    // node export
    module.exports = hAzzle;
  } else if (typeof define === 'function' && define.amd) {
    // amd anonymous module registration
    define(function () {
      return hAzzle;
    });
  } else {
    // browser global
    win.hAzzle = hAzzle;
  }

})(this);