/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0a-alpha
 * Released under the MIT License.
 *
 * Date: 2014-10-14
 */
(function() {

    var
    // Quick-lookup for hAzzle(id)

        idOnly = /^#([\w\-]*)$/,

        // Minimalist module system

        modules = {},

        // Keep track of installed modules. Hopefully people won't spoof this... would be daft.

        installed = {},

        version = {
            full: '1.0.0a-alpha',
            major: 1,
            minor: 0,
            dot: 0,
            codeName: 'new-era'
        },

        // Throws an error if `condition` is `true`.

        err = function(condition, code, message) {
            if (condition) {
                var e = new Error('[hAzzle-' + code + '] ' + message);
                e.code = code;
                throw e;
            }
        },

        // Returns an instance for `id`

        require = function(id) {
            return modules[id];
        },

        // Defines a module for `id: String`, `fn: Function`,

        define = function(id, fn) {

            // Check arguments
            err(typeof id !== 'string', 1, 'id must be a string "' + id + '"');
            err(modules[id], 2, 'id already defined "' + id + '"');
            err(typeof fn !== 'function', 3, 'function body for "' + id + '" must be an function "' + fn + '"');

            // append to module object
            installed[id] = true;

            modules[id] = fn.call(hAzzle.prototype);
        },

        validTypes = function(elem) {
            return elem && (elem.nodeType === 1 || elem.nodeType === 9);
        },

        // Define a local copy of hAzzle
        // NOTE! Everything need to be returned as an array
        // so important to wrap [] around the 'sel' to avoid
        // errors

        hAzzle = function(sel, ctx) {

            if (!sel) {
                return;
            }

            if (!(this instanceof hAzzle)) {
                return new hAzzle(sel, ctx);
            }

            if (sel instanceof hAzzle) {
                return sel;
            }

            // Include required module

            var m, _util = hAzzle.require('Util'),
                _ready = hAzzle.require('Ready');

            if (typeof sel === 'function') {
                _ready.ready(sel);
            }

            if (typeof sel === 'string') {

                // Quick look-up for hAzzle(#id)

                if ((m = idOnly.exec(sel)) && !ctx) {
                    this.elements = [document.getElementById(m[1])];
                }

                if (this.elements === null || this.elements === undefined) {
                    this.elements = this.jiesa(sel, ctx);
                }
                // array   
            } else if (sel instanceof Array) {
                this.elements = _util.unique(_util.filter(sel, validTypes));
                // nodeList
            } else if (_util.isNodeList(sel)) {
                this.elements = _util.filter(_util.makeArray(sel), validTypes);
                // nodeType
            } else if (sel.nodeType) {
                // document fragment
                if (sel.nodeType === 11) {
                    // This children? Are they an array or not?
                    this.elements = sel.children;
                } else {
                    this.elements = [sel];
                }
                // window     
            } else if (sel === window) {
                this.elements = [sel];
            } else {
                this.elements = [];
            }

            // If undefined, set length to 0, and
            // elements to an empty array [] to avoid hAzzle
            // throwing errors

            if (this.elements === undefined) {
                this.length = 0;
                this.elements = [];
            } else {
                this.length = this.elements.length;
            }
            return this;
        };


    // Define constructor
    hAzzle.prototype = {
        constructor: hAzzle
    };

    // Expose to the global scope

    hAzzle.version = version.full;
    hAzzle.err = err;
    hAzzle.installed = installed;
    hAzzle.require = require;
    hAzzle.define = define;

    // Hook hAzzle on the window object

    window.hAzzle = hAzzle;

}(window));

var hAzzle = window.hAzzle || (window.hAzzle = {});

// jsonxml.js
hAzzle.define('Jsonxml', function() {

    // Parse JSON    

    var parseJSON = function(data) {
            return typeof data === 'string' ?
                JSON.parse(data + '') :
                data;
        },

        // Parse XML

        parseXML = function(data) {

            var xml, tmp;

            // If no string, return null 

            if (!data || typeof data !== 'string') {
                return null;
            }

            // Support: IE9
            try {

                tmp = new DOMParser();
                xml = tmp.parseFromString(data, 'text/xml');

            } catch (e) {

                xml = undefined;
            }

            if (!xml || xml.getElementsByTagName('parsererror').length) {
                hAzzle.err(true, 8, 'Invalid XML: "' + data + '"');
            }
            return xml;
        };

    return {
        parseJSON: parseJSON,
        parseXML: parseXML
    };
});

// support.js
hAzzle.define('Support', function() {

    // Feature detection of elements
    var cls, MultipleArgs, sortDetached,
        assert = function(fn) {

            var el = document.createElement('fieldset');

            try {
                return !!fn(el);
            } catch (e) {
                return false;
            } finally {

                // Remove from its parent by default
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
                // release memory in IE
                el = null;
            }
        },

        checkOn, optSelected, radioValue,
        input = document.createElement('input'),
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    input.type = 'checkbox';

    // Support: iOS<=5.1, Android<=4.2+
    // Default value for a checkbox should be 'on'
    checkOn = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    optSelected = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = document.createElement('input');
    input.value = 't';
    input.type = 'radio';
    radioValue = input.value === 't';

    var imcHTML = (function() {

        if (typeof document.implementation.createHTMLDocument === 'function') {
            return true;
        }
        return false;
    }());

    // classList and MultipleArgs detections

    assert(function(div) {

        div.classList.add('a', 'b');
        // Detect if the browser supports classList
        cls = !!document.documentElement.classList;
        // Detect if the classList API supports multiple arguments
        // IE11-- don't support it

        MultipleArgs = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
    });

    sortDetached = assert(function(div) {
        // Should return 1, but returns 4 (following)
        return div.compareDocumentPosition(document.createElement('div')) & 1;
    });


    return {
        assert: assert,
        checkOn: checkOn,
        optSelected: optSelected,
        radioValue: radioValue,
        imcHTML: imcHTML,
        classList: cls,
        multipleArgs: MultipleArgs
    };
});

// detection.js
hAzzle.define('Detection', function() {

    var ua = navigator.userAgent,

        // Special detection for IE, because we got a lot of trouble
        // with it. Damn IE!!

        ie = (function() {

            if (document.documentMode) {
                return document.documentMode;
            } else {
                for (var i = 7; i > 4; i--) {
                    var div = document.createElement('div');

                    div.innerHTML = '<!--[if IE ' + i + ']><span></span><![endif]-->';

                    if (div.getElementsByTagName('span').length) {
                        div = null;

                        return i;
                    }
                }
            }

            return undefined;
        })();

    return {

        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        isAndroid: /Android/i.test(ua),
        isOpera: !!window.opera || ua.indexOf(' OPR/') >= 0,
        isFirefox: typeof InstallTrigger !== 'undefined', // Firefox
        isChrome: window.chrome,
        isSafari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        isIE: false || !!document.documentMode, // IE
        isWebkit: 'WebkitAppearance' in document.documentElement.style,
        ie: ie

    };
});

// types.js
hAzzle.define('Types', function() {

    var i,
        _toString = Object.prototype.toString,
        isArray = Array.isArray,
        arrayLikeClasses = {};

    var positive = ('Arguments Array Boolean Date Error Function Map Number Object RegExp Set String' +
        'WeakMap ArrayBuffer Float32Array Float64Array Int8Array Int16Array Int32Array' +
        'Uint8Array Uint8ClampedArray Uint16Array Uint32Array').split(' ');

    i = positive.length;

    while (i--) {
        arrayLikeClasses['[object ' + positive[i] + ']'] = true;
    }

    var negative = ('ArrayBuffer Float32Array Float64Array Int8Array Int16Array Int32Array ' +
        'Uint8Array Uint8ClampedArray Uint16Array Uint32Array').split(' ');

    i = negative.length;
    while (i--) {

        arrayLikeClasses['[object ' + negative[i] + ']'] = false;
    }

    var isString = function(value) {
            return typeof value === 'string';
        },

        isArrayLike = function(value) {
            return (value && typeof value === 'object' && typeof value.length === 'number' &&
                arrayLikeClasses[_toString.call(value)]) || false;
        },
        isNumber = function(value) {
            return typeof value === 'number';
        },
        isBoolean = function(value) {
            return typeof value === 'boolean';
        },
        isNumeric = function(obj) {
            return !isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
        },

        isEmpty = function(value) {
            var i = 0;
            return isArray(value) ? value.length === 0 :
                isObject(value) ? (function() {
                    var _;
                    for (_ in value) {
                        i++;
                        break;
                    }
                    return (i === 0);
                }()) :
                value === '';
        },
        isElement = function(value) {
            return (value && typeof value === 'object' && value.nodeType === 1 &&
                _toString.call(value).indexOf('Element') > -1) || false;
        },

        isNaN = function(value) {
            // `NaN` as a primitive is the only value that is not equal to itself
            return isNumber(value) && value != +value;
        },

        isUndefined = function(value) {
            return typeof value === 'undefined';
        },

        isDefined = function(value) {
            return typeof value !== 'undefined';
        },

        isEmptyObject = function(obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        isWindow = function(obj) {
            return obj && obj.window === obj;
        },

        // Returns a function that returns `true` if `arg` is of the correct `type`, otherwise `false`.
        createIsType = function(type) {
            return type ? function(arg) {
                return _toString.call(arg) === '[object ' + type + ']';
            } : function() {};
        },

        // ## isObject
        // Returns `true` if argument is an object, otherwise `false`.
        isObject = function(value) {
            // avoid a V8 bug in Chrome 19-20
            // https://code.google.com/p/v8/issues/detail?id=2291
            var type = typeof value;
            return type === 'function' || (value && type === 'object') || false;
        },

        isNode = function(elem) {
            return !!elem && typeof elem === 'object' && 'nodeType' in elem;
        };

    return {
        isFile: createIsType('File'),
        isBlob: createIsType('Blob'),
        isRegExp: createIsType('RegExp'),
        isArguments: createIsType('Arguments'),
        isFunction: createIsType('Function'),
        isDate: createIsType('Date'),
        type: createIsType,
        isArray: isArray,
        isEmpty: isEmpty,
        isWindow: isWindow,
        isObject: isObject,
        isEmptyObject: isEmptyObject,
        isNode: isNode,
        isElement: isElement,
        isString: isString,
        isArrayLike: isArrayLike,
        isNumber: isNumber,
        isBoolean: isBoolean,
        isNumeric: isNumeric,
        isNaN: isNaN,
        isDefined: isDefined,
        isUndefined: isUndefined,
    };
});

// ready.js
hAzzle.define('Ready', function() {

    var

        _util = hAzzle.require('Util'),

        // Static property indicating whether DOM is ready.

        isReady = false,

        // List of functions to be executed after DOM is ready.

        readyList = [],

        /**
         * Specify a function to execute when the DOM is fully loaded.
         *
         * @param {Function} callback
         */

        ready = function(callback) {

            // Handler
            var readyHandler = function() {
                if (!isReady) {
                    isReady = true;
                    ready = function(callback) {
                        return callback(hAzzle);
                    };

                    _util.each(readyList, function(callback) {
                        // Remove the handlers
                        document.removeEventListener('DOMContentLoaded', readyHandler, false);
                        window.removeEventListener('load', readyHandler, false);
                        // Execute the callback
                        callback(hAzzle);
                    });
                    readyList = []; // Clear the ready list
                }
            };

            // Catch cases where hAzzle.ready() is called after the browser event has already occurred.
            if (document.readyState === 'complete') {
                readyHandler();
            } else {
                if (document.addEventListener) { // Standards-based browsers support DOMContentLoaded
                    // Use the handy event callback
                    document.addEventListener('DOMContentLoaded', readyHandler, false);
                    // A fallback to window.onload, that will always work
                    window.addEventListener('load', readyHandler, false);
                }
                ready = function(callback) {
                    readyList.push(callback);
                };
                return ready(callback);
            }
        };

    return {

        isReady: isReady,
        readyList: readyList,
        ready: ready
    };
});

// text.js
hAzzle.define('Text', function() {

    var getText = function(elem) {

        if (elem) {

            var node, ret = '',
                i = 0,
                l = elem.length,
                etc, nodetype = elem.nodeType;

            if (!nodetype) {

                for (; i < l; i++) {

                    node = elem[i++];

                    // Do not traverse comment nodes
                    ret += getText(node);
                }

            } else if (nodetype === 1 ||
                nodetype === 9 ||
                nodetype === 11) {

                etc = elem.textContent;

                if (typeof etc === 'string') {
                    return elem.textContent;
                } else {

                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += getText(elem);

                    }
                }
            } else if (nodetype === 3 || nodetype === 4) {
                return elem.nodeValue;
            }
            return ret;
        }
        return;
    };
    return {
        getText: getText
    };
});

// util.js
hAzzle.define('Util', function() {

    var // Modules

        _types = hAzzle.require('Types'),

        // Save a reference to some core methods

        _arrayProto = Array.prototype,
        _objectProto = Object.prototype,
        _hasOwn = _objectProto.hasOwnProperty,
        _slice = _arrayProto.slice,
        _keys = Object.keys,
        _toString = _objectProto.toString,

        // Short cut for `hasOwnProperty`.

        has = function(arg, id) {
            return _hasOwn.call(arg, id);
        },

        // Optimized each function

        each = function(obj, fn, ctx, rev) {

            if (obj == null) {
                return obj;
            }

            if (typeof fn !== 'function') {
                hAzzle.err(true, 5, "'fn' must be a function in util.each()");
            }

            fn = createCallback(fn, ctx);

            var i, length = obj.length;

            if (length === +length) {
                // Quick each optimizing for no arguments
                if (!ctx) {

                    i = -1;
                    while (++i < length) {
                        // Reverse feature 
                        i = rev ? obj.length - i - 1 : i;
                        if (fn(obj[i], i, obj) === false) {
                            break;
                        }
                    }
                } else {

                    for (i = 0; i < length; i++) {
                        // Reverse feature 
                        i = rev ? obj.length - i - 1 : i;
                        if (fn(obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            } else {
                if (obj) {
                    var keys = _keys(obj);

                    for (i = 0, length = keys.length; i < length; i++) {

                        if (fn(obj[keys[i]], keys[i], obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },

        // Internal function that returns an efficient (for current engines) version
        // of the passed-in callback, to be repeatedly applied in other functions.

        createCallback = function(func, ctx, argCount) {
            if (typeof func === 'function') {
                if (ctx === undefined) {
                    return func;
                }

                var dir = argCount == null ? 3 : argCount;

                switch (dir) {

                    case 1:
                        return function(value) {
                            return func.call(ctx, value);
                        };
                    case 2:
                        return function(value, other) {
                            return func.call(ctx, value, other);
                        };
                    case 3:
                        return function(value, index, collection) {
                            return func.call(ctx, value, index, collection);
                        };
                    case 4:
                        return function(accumulator, value, index, collection) {
                            return func.call(ctx, accumulator, value, index, collection);
                        };
                }
                return function() {
                    return func.apply(ctx, arguments);
                };
            }
            if (func == null) {
                return identity;
            }
        },

        some = function(obj, fn, ctx) {

            if (obj == null) {
                return false;
            }
            fn = iterate(fn, ctx);

            var keys = obj.length !== +obj.length && keys(obj),
                length = (keys || obj).length,
                index, currentKey;
            for (index = 0; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                if (fn(obj[currentKey], currentKey, obj)) {
                    return true;
                }
            }
            return false;
        },
        merge = function(first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;
        },

        // Set / delete hashKeys on objects

        setHash = function(obj, hash) {
            if (hash) {
                obj.hashKey = hash;
            } else {
                delete obj.hashKey;
            }
        },

        removeHash = function(obj, hash) {
            delete obj.hashKey;
        },

        // Extends the destination object `obj` by copying all of the 
        // properties from the `src` object(s)
        // The 'hashKey' will automatically be copied over to the
        // destination object `obj` if it exist on the 'src' object(s)

        extend = function(obj) {
            if (!_types.isObject(obj)) {
                return obj;
            }

            var source, prop, i = 1,
                hash = obj.hashKey,
                length = arguments.length;

            for (; i < length; i++) {
                source = arguments[i];
                for (prop in source) {
                    if (has(source, prop)) {
                        obj[prop] = source[prop];
                    }
                }
            }
            setHash(obj, hash);
            return obj;
        },
        makeArray = function(nodeList) {

            if (nodeList instanceof Array) {
                return nodeList;
            }
            var index = -1,
                length = nodeList.length,
                array = Array(length);

            while (++index < length) {
                array[index] = nodeList[index];
            }
            return array;
        },

        inherits = function(child, parent) {
            extend(child, parent);

            function Ctor() {
                this.constructor = child;
            }
            Ctor.prototype = parent.prototype;
            child.prototype = new Ctor();
            child.__super__ = parent.prototype;
            return child;
        },

        isElement = function(element) {
            return element && (element.nodeType === 1 || element.nodeType === 9);
        },

        isNodeList = function(obj) {
            return obj && is(['nodelist', 'htmlcollection', 'htmlformcontrolscollection'], obj);
        },

        iterate = function(value, ctx, argCount) {
            if (value == null) {
                return identity;
            }
            if (_types.isFunction(value)) {
                return createCallback(value, ctx, argCount);
            }
            if (_types.isObject(value)) {
                return matches(value);
            }
            return property(value);
        },

        // Keep the identity function around for default iteratees.
        identity = function(value) {
            return value;
        },

        // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
        matches = function(attrs) {

            var pairs = pairs(attrs),
                length = pairs.length;
            return function(obj) {
                if (obj == null) {
                    return !length;
                }
                obj = new Object(obj);
                var i = 0,
                    pair, key;
                for (; i < length; i++) {
                    pair = pairs[i];
                    key = pair[0];
                    if (pair[1] !== obj[key] || !(key in obj)) {
                        return false;
                    }
                }
                return true;
            };
        },

        // Convert an object into a list of `[key, value]` pairs.
        pairs = function(obj) {
            var keys = _keys(obj).
            length = keys.length.
            pairs = Array(length),
                i = 0;
            for (; i < length; i++) {
                pairs[i] = [keys[i], obj[keys[i]]];
            }
            return pairs;
        },

        property = function(key) {
            return function(obj) {
                return obj[key];
            };
        },

        unique = function(array, isSorted, fn, ctx) {
            if (array == null) return [];
            if (_types.isBoolean(isSorted)) {
                ctx = fn;
                fn = isSorted;
                isSorted = false;
            }
            if (fn != null) {
                fn = iterate(fn, ctx);
            }

            var result = [],
                seen = [],
                i = 0,
                length = array.length;

            for (; i < length; i++) {
                var value = array[i];
                if (isSorted) {
                    if (!i || seen !== value) {
                    result.push(value);
                    }
                    seen = value;
                } else if (fn) {
                    var computed = fn(value, i, array);
                    if (indexOf(seen, computed) < 0) {
                        seen.push(computed);
                        result.push(value);
                    }
                } else if (indexOf(result, value) < 0) {
                    result.push(value);
                }
            }
            return result;
        },

        indexOf = function(array, item, isSorted) {

            if (array == null) {
                return -1;
            }

            var i = 0,
                length = array.length;

            if (isSorted) {
                if (typeof isSorted === 'number') {
                    i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
                } else {
                    i = sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            for (; i < length; i++)
                if (array[i] === item) {
                    return i;
                }
            return -1;
        },

        sortedIndex = function(array, obj, fn, ctx) {
            fn = iterate(fn, ctx, 1);
            var value = fn(obj),
                low = 0,
                high = array.length;
            while (low < high) {
                var mid = low + high >>> 1;
                if (fn(array[mid]) < value) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return low;
        },

        // Return the results of applying the callback to each element.
        map = function(obj, fn, ctx) {
            if (obj == null) {
                return [];
            }
            fn = iterate(fn, ctx);
            var keys = obj.length !== +obj.length && _keys(obj),
                length = (keys || obj).length,
                results = Array(length),
                currentKey, index = 0;
            for (; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                results[index] = fn(obj[currentKey], currentKey, obj);
            }
            return results;
        },

        pluck = function(array, prop) {
            return map(array, function(item) {
                return item[prop];
            });
        },

        _apply = function(ctx, fn, applyArgs, cutoff, fromLeft) {

            if (typeof fn === 'string') {
                fn = ctx[fn];
            }
            return function() {
                var args = _slice.call(arguments, 0, cutoff || Infinity);

                if (applyArgs) {
                    args = fromLeft ? applyArgs.concat(args) : args.concat(applyArgs);
                }
                if (typeof ctx === 'number') {
                    ctx = args[ctx];
                }

                return fn.apply(ctx || this, args);
            };
        },

        applyRight = function(ctx, fn, applyArgs, cutoff) {
            return _apply(ctx, fn, applyArgs, cutoff);
        },

        applyLeft = function(ctx, fn, applyArgs, cutoff) {
            return _apply(ctx, fn, applyArgs, cutoff, true);
        },

        curry = function(fn) {
            return applyLeft(this, fn, _slice.call(arguments, 1));
        },

        type = function(obj) {
            var ref = _toString.call(obj).match(/\s(\w+)\]$/);
            return ref && ref[1].toLowerCase();
        },

        is = function(kind, obj) {
            return kind.indexOf(type(obj)) >= 0;
        },

        // Determines whether an object can have data

        acceptData = function(owner) {
            // Accepts only:
            //  - Node
            //    - Node.ELEMENT_NODE
            //    - Node.DOCUMENT_NODE
            //  - Object
            //    - Any
            /* jshint -W018 */
            return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
        },

        // Return the elements nodeName

        nodeName = function(el, name) {
            return el && el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
        },

        // Native solution for filtering arrays. 

        filter = function(obj, fn, ctx) {
            var results = [];
            if (obj == null) {
                return results;
            }
            fn = iterate(fn, ctx);
            each(obj, function(value, index, list) {
                if (fn(value, index, list)) {
                    results.push(value);
                }
            });
            return results;
        },

        // Bind a function to a ctx, optionally partially applying any

        bind = function(fn, ctx) {

            var curryArgs = arguments.length > 2 ?
                _slice.call(arguments, 2) : [],
                tmp;

            if (typeof ctx === 'string') {

                tmp = fn[ctx];
                ctx = fn;
                fn = tmp;
            }

            if (typeof fn === 'function' && !(ctx instanceof RegExp)) {
                return curryArgs.length ? function() {
                    return arguments.length ?
                        fn.apply(ctx || this, curryArgs.concat(_slice.call(arguments, 0))) :
                        fn.apply(ctx || this, curryArgs);
                } : function() {
                    return arguments.length ?
                        fn.apply(ctx || this, arguments) :
                        fn.call(ctx || this);
                };

            } else {
                return ctx;
            }
        },
        int = function(str) {
            return parseInt(str, 10);
        };

    return {
        each: each,
        extend: extend,
        makeArray: makeArray,
        merge: merge,
        acceptData: acceptData,
        createCallback: createCallback,
        inherits: inherits,
        isElement: isElement,
        isNodeList: isNodeList,
        nodeName: nodeName,
        unique: unique,
        pluck: pluck,
        applyRight: applyRight,
        applyLeft: applyLeft,
        curry: curry,
        type: type,
        is: is,
        sortedIndex: sortedIndex,
        indexOf: indexOf,
        property: property,
        matches: matches,
        pairs: pairs,
        filter: filter,
        map: map,
        some: some,
        now: Date.now,
        bind: bind,
        has: has,
        int: int,
        setHash: setHash,
        removeHash: removeHash
    };
});

// core.js
hAzzle.define('Core', function() {

    var winDoc = window.document,
        _support = hAzzle.require('Support'),
        cache = {},
        _indexOf = Array.prototype.indexOf,
        expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),
        hasDuplicate,
        sortInput,
        sortOrder = function(a, b) {
            if (a === b) {
                hasDuplicate = true;
            }
            return 0;
        },

        siblingCheck = function(a, b) {
            var cur = b && a,
                diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
                (~b.sourceIndex || 1 << 31) -
                (~a.sourceIndex || 1 << 31);

            // Use IE sourceIndex if available on both nodes
            if (diff) {
                return diff;
            }

            // Check if b follows a
            if (cur) {
                while ((cur = cur.nextSibling)) {
                    if (cur === b) {
                        return -1;
                    }
                }
            }

            return a ? 1 : -1;
        },

        // Create a unique object that hold all info, so we can cache it,
        // and gain better performance

        Core = {
            // A global XML counter for each document
            duidX: 1,
            duidK: 'hAzzle-uniqueid',

            isNativeCode: function(fn) {
                return (/\{\s*\[native code\]\s*\}/).test('' + fn);
            },

            isXML: function(elem) {
                var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                return documentElement ? documentElement.nodeName !== "HTML" : false;
            },
            getUIDXML: function(node) {
                var uid = node.getAttribute(this.duidK);
                if (!uid) {
                    uid = this.duidX++;
                    node.setAttribute(this.duidK, uid);
                }
                return uid;
            },

            getUIDHTML: function(node) {
                return node.uniqueNumber || (node.uniqueNumber = this.duidX++);
            },

            // sort based on the setDocument documentSorter method.

            sort: function(results) {
                if (!this.documentSorter) return results;
                results.sort(this.documentSorter);
                return results;
            },

            setDocument: function(document) {

                // convert elements / window arguments to document. if document cannot be extrapolated, the function returns.
                var nodeType = document.nodeType;

                var doc = document ? document.ownerDocument || document : winDoc;

                if (nodeType === 9); // document
                else if (nodeType) {
                    doc = document.ownerDocument; // node
                } else if (document.navigator) {
                    doc = document.document; // window
                } else {
                    return;
                }

                // check if it's the old document

                if (this.document === doc) {
                    return;
                }
                // Override default window.document, and set our document

                document = doc;
                this.document = doc;

                // check if we have done feature detection on this document before

                var root = document.documentElement,
                    rootUid = this.getUIDXML(root),
                    features = cache[rootUid],
                    feature;

                if (features) {
                    for (feature in features) {
                        this[feature] = features[feature];
                    }
                    return;
                }

                features = cache[rootUid] = {};

                features.root = root;
                features.isXMLDocument = this.isXML(document);

                features.detectDuplicates = !!hasDuplicate;

                // Sort stability

                features.sortStable = expando.split('').sort(sortOrder).join('') === expando;

                features.brokenGEBTN = features.idGetsName = features.brokenCheckedQSA = features.isHTMLDocument = false;

                var starSelectsClosed, starSelectsComments,
                    selected, id = 'hAzzle_uniqueid',
                    testNode = document.createElement('div'),
                    testRoot = document.body || document.head || root;

                testRoot.appendChild(testNode);

                // On non-HTML documents innerHTML and getElementById doesnt work properly

                try {
                    testNode.innerHTML = '<a id="' + id + '"></a>';
                    features.isHTMLDocument = !!document.getElementById(id);
                } catch (e) {}

                if (features.isHTMLDocument) {

                    testNode.style.display = 'none';

                    // Check if getElementsByTagName('*') returns only elements
                    testNode.appendChild(document.createComment(''));
                    starSelectsComments = !testNode.getElementsByTagName('*').length;

                    // IE returns closed nodes (EG:'</foo>') for getElementsByTagName('*') for some documents
                    try {
                        testNode.innerHTML = 'foo</foo>';
                        selected = testNode.getElementsByTagName('*');
                        starSelectsClosed = (selected && !!selected.length && selected[0].nodeName.charAt(0) === '/');
                    } catch (e) {}

                    features.brokenGEBTN = starSelectsComments || starSelectsClosed;

                    // Support: IE<10
                    // Check if getElementById returns elements by name
                    // The broken getElementById methods don't pick up programatically-set names,
                    // so use a roundabout getElementsByName test

                    try {

                        testNode.innerHTML = '<a name="' + id + '"></a><b id="' + id + '"></b>';
                        features.idGetsName = document.getElementById(id) === testNode.firstChild;
                    } catch (e) {}


                    if (testNode.querySelectorAll) {

                        // Webkit/Opera - :checked should return selected option elements
                        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                        try {
                            testNode.innerHTML = '<select><option selected="selected">a</option></select>';
                            features.brokenCheckedQSA = !testNode.querySelectorAll(':checked').length;
                        } catch (e) {}
                    }
                }

                try {
                    root.hAzzle_expando = 1;
                    delete root.hAzzle_expando;
                    features.getUID = this.getUIDHTML;
                } catch (e) {
                    features.getUID = this.getUIDXML;
                }

                // Avoid memory leaks 

                testRoot.removeChild(testNode);
                testNode = selected = testRoot = null;

                // Element contains another
                // Purposefully does not implement inclusive descendent
                // As in, an element does not contain itself

                features.contains = Core.isNativeCode(root.compareDocumentPosition) ? function(a, b) {
                        var adown = a.nodeType === 9 ? a.documentElement : a,
                            bup = b && b.parentNode;
                        return a === bup || !!(bup && bup.nodeType === 1 && (
                            adown.contains ?
                            adown.contains(bup) :
                            a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                        ));
                    } :
                    function(a, b) {
                        if (b) {
                            while ((b = b.parentNode)) {
                                if (b === a) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };

                // Document order sorting
                // Credits to Sizzle (http://sizzlejs.com/)

                features.documentSorter = (root.compareDocumentPosition) ? function(a, b) {

                    // Flag for duplicate removal
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    // Sort on method existence if only one input has compareDocumentPosition
                    var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                    if (compare) {
                        return compare;
                    }

                    // Calculate position if both inputs belong to the same document
                    compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
                        a.compareDocumentPosition(b) :

                        // Otherwise we know they are disconnected
                        1;

                    // Disconnected nodes
                    if (compare & 1 || (!_support.sortDetached && b.compareDocumentPosition(a) === compare)) {

                        // Choose the first element that is related to our preferred document
                        if (a === doc || a.ownerDocument === winDoc && features.contains(winDoc, a)) {
                            return -1;
                        }
                        if (b === doc || b.ownerDocument === winDoc && features.contains(winDoc, b)) {
                            return 1;
                        }

                        // Maintain original order
                        return sortInput ?
                            (_indexOf.call(sortInput, a) - _indexOf.call(sortInput, b)) :
                            0;
                    }

                    return compare & 4 ? -1 : 1;
                } : function(a, b) {
                    // Exit early if the nodes are identical
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    var cur,
                        i = 0,
                        aup = a.parentNode,
                        bup = b.parentNode,
                        ap = [a],
                        bp = [b];

                    // Parentless nodes are either documents or disconnected
                    if (!aup || !bup) {
                        return a === doc ? -1 :
                            b === doc ? 1 :
                            aup ? -1 :
                            bup ? 1 :
                            sortInput ?
                            (_indexOf.call(sortInput, a) - _indexOf.call(sortInput, b)) :
                            0;

                        // If the nodes are siblings, we can do a quick check
                    } else if (aup === bup) {
                        return siblingCheck(a, b);
                    }


                    // Otherwise we need full lists of their ancestors for comparison
                    cur = a;
                    while ((cur = cur.parentNode)) {
                        ap.unshift(cur);
                    }
                    cur = b;
                    while ((cur = cur.parentNode)) {
                        bp.unshift(cur);
                    }

                    // Walk down the tree looking for a discrepancy
                    while (ap[i] === bp[i]) {
                        i++;
                    }

                    return i ?
                        // Do a sibling check if the nodes have a common ancestor

                        siblingCheck(ap[i], bp[i]) :

                        // Otherwise nodes in our document sort first
                        ap[i] === winDoc ? -1 :
                        bp[i] === winDoc ? 1 :
                        0;
                };

                root = null;

                for (feature in features) {
                    this[feature] = features[feature];
                }
            }
        };

    // Set correct document
    Core.setDocument(document);

    var uniqueSort = function(results) {
        var elem,
            duplicates = [],
            j = 0,
            i = 0;

        // Unless we *know* we can detect duplicates, assume their presence
        hasDuplicate = !Core.detectDuplicates;
        sortInput = !Core.sortStable && results.slice(0);
        results.sort(sortOrder);

        if (hasDuplicate) {
            while ((elem = results[i++])) {
                if (elem === results[i]) {
                    j = duplicates.push(i);
                }
            }
            while (j--) {
                results.splice(duplicates[j], 1);
            }
        }

        // Clear input after sorting to release objects
        // See https://github.com/jquery/sizzle/pull/225
        sortInput = null;

        return results;
    };

    return {
        Core: Core,
        root: Core.document,
        uniqueSort: uniqueSort,
        getAttribute: Core.getAttribute,
        contains: Core.contains,
        isXML: Core.isXML,
        isHTML: !Core.isXML(document),
        expando: expando
    };
});

// matches.js
hAzzle.define('Matches', function() {

    /**
     * IMPORTANT!! This module are not finished at all. Still a lot to do:
     *
     * - check if matchesSelector are buggy and fallback to Jiesa if it is
     * - check for matchesSelector support
     * - and a lot more...
     */

    var _util = hAzzle.require('Util'),
        _collection = hAzzle.require('Collection')
    _jiesa = hAzzle.require('Jiesa'),
        matchesSelector,

        rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,

        matches = function(element, selector) {
            var match;

            if (!element || !_util.isElement(element) || !selector) {
                return false;
            }

            if (selector.nodeType) {
                return element === selector;
            }

            // If instance of hAzzle

            if (selector instanceof hAzzle) {
                return _util.some(selector.elements, function(selector) {
                    return matches(element, selector);
                });
            }

            if (element === document) {
                return false;
            }

            var quick = rquickIs.exec(selector);

            if (quick) {
                //   0  1    2   3          4
                // [ _, tag, id, attribute, class ]
                if (quick[1]) {
                    quick[1] = quick[1].toLowerCase();
                }
                if (quick[3]) {
                    quick[3] = quick[3].split('=');
                }
                if (quick[4]) {
                    quick[4] = ' ' + quick[4] + ' ';
                }
            }

            if (quick) {
                return (
                    (!quick[1] || element.nodeName.toLowerCase() === quick[1]) &&
                    (!quick[2] || element.id === quick[2]) &&
                    (!quick[3] || (quick[3][1] ? element.getAttribute(quick[3][0]) === quick[3][1] : element.hasAttribute(quick[3][0]))) &&
                    (!quick[4] || (' ' + element.className + ' ').indexOf(quick[4]) >= 0)
                );
            }

            try {

                if (typeof selector !== 'string') {
                    return selector;
                }
                return element.matches(selector)
            } catch (e) {

                match = _jiesa.find(element.parentNode, selector).indexOf(element) >= 0;

                return match;
            }
        }

    return {
        matches: matches
    };
});

// collection.js
hAzzle.define('Collection', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _arrayProto = Array.prototype,
        _keys = Object.keys,
        _concat = _arrayProto.concat,
        _push = _arrayProto.push,
        inArray = function(elem, arr, i) {
            return arr == null ? -1 : _arrayProto.indexOf.call(arr, elem, i);
        },
        makeArray = function(arr, results) {
            var ret = results || [];

            if (arr != null) {
                if (_types.isArrayLike(Object(arr))) {
                    _util.merge(ret, _util.isString(arr) ? [arr] : arr);
                } else {
                    _push.call(ret, arr);
                }
            }

            return ret;
        },
        removeValue = function(array, value) {
            var index = indexOf(array, value);
            if (index >= 0) {
                array.splice(index, 1);
            }
            return value;
        },
        //  Reduces a collection
        reduce = function(collection, fn, accumulator, args) {

            if (collection == null) {
                collection = [];
            }

            fn = _util.createCallback(fn, args, 4);

            var keys = collection.length !== +collection.length && _keys(collection),
                length = (keys || collection).length,
                index = 0,
                currentKey;

            if (arguments.length < 3) {

                if (!length) {
                    hAzzle.err(true, 7, ' no collection length exist in collection.reduce()');
                }

                accumulator = collection[keys ? keys[index++] : index++];
            }
            for (; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                accumulator = fn(accumulator, collection[currentKey], currentKey, collection);
            }
            return accumulator;
        },

        slice = function(array, start, end) {

            var e = end,
                length = array.length,
                result = [];

            start = fixedIndex(length, Math.max(-array.length, start), 0);

            e = fixedIndex(end < 0 ? length : length + 1, end, length);

            end = e === null || e > length ? end < 0 ? 0 : length : e;

            while (start !== null && start < end) {
                result.push(array[start++]);
            }
            return result;
        },

        // Given an index & length, return a 'fixed' index, fixes non-numbers & negative indexes

        fixedIndex = function(length, index, def) {
            if (index < 0) {
                index = length + index;
            } else if (index < 0 || index >= length) {
                return null;
            }
            return !index && index !== 0 ? def : index;
        },
        // Determines the number of elements in an array, the number of properties an object has, or
        // the length of a string.
        size = function(obj, ownPropsOnly) {
            var count = 0,
                key;

            if (_types.isArray(obj) || _types.isString(obj)) {
                return obj.length;
            } else if (_types.isObject(obj)) {
                for (key in obj)
                    if (!ownPropsOnly || _util.has(key)) {
                        count++;
                    }
            }

            return count;
        };

    // Core function, so this one has to be fast!!!!!!
    this.get = function(index) {
        return index == null ? slice(this.elements) :
            this.elements[fixedIndex(this.length, index, 0)];
    };

    this.eq = function(index) {
        // We have to explicitly null the selection since .get()
        // returns the whole collection when called without arguments.
        return hAzzle(index == null ? '' : this.get(index));
    };

    this.reduce = function(fn, accumulator, args) {
        return reduce(this.elements, fn, accumulator, args);
    };

    this.indexOf = function(elem, arr, i) {
        return arr == null ? -1 : _arrayProto.indexOf.call(arr, elem, i);
    };

    this.map = function(fn, args) {
        return new hAzzle(_util.map(this.elements, fn, args));
    };

    this.each = function(fn, args, rev) {
        _util.each(this.elements, fn, args, rev);
        return this;
    };

    this.iterate = function(fn, args) {
        return function(a, b, c, d) {
            return this.each(function(element) {
                fn.call(args, element, a, b, c, d);
            });
        };
    };

    this.slice = function(start, end) {
        return new hAzzle(slice(this.elements, start, end));
    };

    // Concatenate two elements lists
    this.concat = function() {
        var args = _util.map(slice(arguments), function(arr) {
            return arr instanceof hAzzle ? arr.elements : arr;
        });
        return new hAzzle(_concat.apply(this.elements, args));
    };

    this.pluck = function(prop) {
        return _util.pluck(this.elements, prop);
    };

    return {
        makeArray: makeArray,
        removeValue: removeValue,
        slice: slice,
        reduce: reduce,
        size: size,
        inArray: inArray
    };
});

// jiesa.js
hAzzle.define('Jiesa', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _collection = hAzzle.require('Collection'),
        _support = hAzzle.require('Support'),

        reSpace = /[\n\t\r]/g,
        idClassTagNameExp = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
        tagNameAndOrIdAndOrClassExp = /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/;

    /**
     * Determine if the element contains the klass.
     * Uses the `classList` api if it's supported.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
     *
     * @param {Object} el
     * @param {String} klass
     *
     * @return {Array}
     */

    function containsClass(el, klass) {
        if (_support.classList) {
            return el.classList.contains(klass);
        } else {
            return (' ' + el.className + ' ').replace(reSpace, ' ').indexOf(klass) >= 0;
        }
    }

    /**
     * Find elements by selectors.
     *
     * Supported:
     * - #foo
     * - .foo
     * - div (tagname)
     *
     * @param {String} sel The selector string
     * @param {Object} ctx The context. Default is document.
     * @param {Bool} c Save to cache? Default is true.
     */

    function Jiesa(sel, ctx) {
        var m, nodeType, elem, results = [];

        ctx = ctx || document;

        if (!sel || typeof sel !== 'string') {
            return results;
        }

        if ((nodeType = ctx.nodeType) !== 1 && nodeType !== 9 && nodeType !== 11) {
            return [];
        }

        // Split selectors by comma if it's exists.
        if (_util.indexOf(sel, ',') !== -1 && (m = sel.split(','))) {
            // Comma separated selectors. E.g $('p, a');
            // unique result, e.g "ul id=foo class=foo" should not appear two times.
            _util.each(m, function(el) {
                _util.each(Jiesa(el), function(el) {
                    // FIXME! For better performance, do a test to see if we only can
                    // use inArray() here, and not bother the DOM.
                    if (!_core.contains(results, el)) {
                        results.push(el);
                    }
                });
            });
            return results;
        }

        if (_core.isHTML) {

            if ((m = idClassTagNameExp.exec(sel))) {
                if ((sel = m[1])) {
                    if (nodeType === 9) {
                        elem = ctx.getElementById(sel);
                        if (elem && elem.parentNode) {
                            if (elem.id === sel) {
                                return [elem];
                            }
                        } else {
                            return [];
                        }
                    } else {
                        // Context is not a document
                        if (ctx.ownerDocument && (elem = ctx.ownerDocument.getElementById(sel)) &&
                            _core.contains(ctx, elem) && elem.id === m) {
                            return [elem];
                        }
                    }
                } else if ((sel = m[2])) {
                    return _collection.slice(ctx.getElementsByClassName(sel));
                } else if ((sel = m[3])) {
                    return _collection.slice(ctx.getElementsByTagName(sel));
                }
                // E.g. hAzzle( 'span.selected' )  
            } else if ((m = tagNameAndOrIdAndOrClassExp.exec(sel))) {
                var result = ctx.getElementsByTagName(m[1]),
                    id = m[2],
                    className = m[3];
                _util.each(result, function(el) {
                    if (el.id === id || containsClass(el, className)) {
                        results.push(el);
                    }
                });
                return results;
            } else {
                return _collection.slice(document.querySelectorAll(sel));
            }
        }
    }

    this.jiesa = Jiesa;

    return {
        find: Jiesa
    };
});

// dom.js
hAzzle.define('Dom', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _collection = hAzzle.require('Collection'),
        _matches = hAzzle.require('Matches'),
        _jiesa = hAzzle.require('Jiesa'),

        rquick = /^(?:(\w+)|\.([\w\-]+))$/,

        // Creates a new hAzzle instance applying a filter if necessary
        _create = function(elements, selector) {
            return selector == null ? new hAzzle(elements) : new hAzzle(elements).filter(selector);
        };

    this.find = function(selector) {

        if (typeof selector === 'string') {

            if (this.length === 1) {

                var elements, elem = this.elements[0],
                    quickMatch = rquick.exec(selector);

                if (quickMatch) {

                    if (quickMatch[1]) {
                        // speed-up: 'TAG'
                        elem = _create(elem.getElementsByTagName(selector));

                    } else {
                        // speed-up: '.CLASS'
                        elem = _create(elem.getElementsByClassName(quickMatch[2]));
                    }
                }

                return _create(_collection.slice(_jiesa.find(selector, this.elements[0])));

            } else {
                elements = _collection.reduce(this.elements, function(els, element) {
                    return _create(_core.uniqueSort(els.concat(_collection.slice(_jiesa.find(selector, element)))));
                }, []);
            }
        }
        var i,
            len = this.length,
            self = this.elements;

        return _create(_util.filter(hAzzle(selector).elements, function(node) {
            for (i = 0; i < len; i++) {
                if (_core.contains(self[i], node)) {
                    return true;
                }
            }
        }));
    };

    // Implement the identical functionality for filter and not
    this.filter = function(selector, not) {
        var elems = this.elements;

        if (typeof selector === 'function') {
            var fn = selector;
            return _create(_util.filter(elems, function(elem, index) {
                return fn.call(elem, elem, index) != (not || false);
            }));
        }
        if (selector && selector[0] === '!') {
            selector = selector.slice(1);
            not = true;
        }

        return _create(_util.filter(elems, function(elem) {
            return _matches.matches(elem, selector) != (not || false);
        }));
    };

    return {
        _create: _create

    };
});

// strings.js
hAzzle.define('Strings', function() {
    var
    // Save a reference to some core methods

        nTrim = String.prototype.trim,

        // Support: Android<4.1

        nNTrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

        // Hyphenate RegExp

        sHyphenate = /[A-Z]/g,

        // Capitalize RegExp

        sCapitalize = /\b[a-z]/g,

        // Microsoft RegExp

        msPrefix = /^-ms-/,

        // camlize RegExp

        dashAlpha = /-([\da-z])/gi,

        // manualLowercase regExp

        capitalizedChars = /[A-Z]/g,

        // manualUppercase regExp

        nonCapitalizedChars = /[a-z]/g,

        // Cache array for hAzzle.camelize()

        camelCache = [],

        // Used by hAzzle.capitalize as callback to replace()

        fcapitalize = function(letter) {
            return letter.toUpperCase();
        },

        // Used by hAzzle.camelize as callback to replace()

        fcamelize = function(all, letter) {
            return letter.toUpperCase();
        },
        // Used by hAzzle.hyphenate as callback to replace()

        fhyphenate = function(letter) {
            return ('-' + letter.charAt(0).toLowerCase());
        },

        // Converts the specified string to lowercase.

        lowercase = function(str) {
            return typeof str === 'string' ? str.toLowerCase() : str;
        },
        // Converts the specified string to uppercase
        uppercase = function(str) {
            return typeof str === 'string' ? str.toUpperCase() : str;
        },
        manualLowercase = function(str) {
            /* jshint bitwise: false */
            return typeof str === 'string' ? str.replace(capitalizedChars, function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) | 32);
            }) : str;
        },
        manualUppercase = function(str) {
            /* jshint bitwise: false */
            return typeof str === 'string' ? str.replace(nonCapitalizedChars, function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) & ~32);
            }) : str;
        },

        capitalize = function(str) {
            return str ? str.replace(sCapitalize, fcapitalize) : str;
        },

        // Convert camelCase to hyphenate
        // e.g. boxSizing -> box-sizing

        hyphenate = function(str) {
            return str ? str.replace(sHyphenate, fhyphenate) : str;
        },

        // Convert dashed to camelCase
        // Support: IE9-11+
        camelize = function(str) {
            if (str) {
                return camelCache[str] ? camelCache[str] :
                    camelCache[str] = str.replace(msPrefix, "ms-").replace(dashAlpha, fcamelize);
            }
            return str;
        },

        // Remove leading and trailing whitespaces of the specified string.

        trim = function(str) {
            return str == null ? '' : nTrim ? (typeof str === 'string' ? str.nTrim() : str) :
                // Any idiots still using Android 4.1 ?
                (str + '').replace(nNTrim, '');
        };

    // Credit: AngularJS    
    // String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
    // locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
    // with correct but slower alternatives.

    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    return {

        capitalize: capitalize,
        hyphenate: hyphenate,
        camelize: camelize,
        trim: trim,
        lowercase: lowercase,
        uppcase: uppercase,
        manualLowercase: manualLowercase,
        manualUppercase: manualUppercase,
    };
});

// storage.js
hAzzle.define('Storage', function() {

    var _util = hAzzle.require('Util'),
        _strings = hAzzle.require('Strings'),
        _types = hAzzle.require('Types'),
        _core = hAzzle.require('Core'),
        _shtmlRegEx = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        _scharRegEx = /([A-Z])/g,
        _sWhiteRegex = (/\S+/g);

    function Storage() {
        this.expando = _core.expando + Math.random();
    }

    Storage.accepts = _util.acceptData;

    Storage.prototype = {

        register: function(owner, initial) {
            var descriptor = {};

            // Secure cache in a non-enumerable, configurable, writable property
            // configurability must be true to allow the property to be
            // deleted with the delete operator

            descriptor[this.expando] = {
                value: initial || {},
                writable: true,
                configurable: true
            };

            if (owner.nodeType) {
                owner[this.expando] = {
                    value: initial || {}
                };
                // Only use ES5 defineProperty for non-nodes
            } else {
                Object.defineProperties(owner, descriptor);
            }

            return owner[this.expando];
        },
        cache: function(owner, initial) {

            // Always return an empty object.
            if (!Storage.accepts(owner)) {
                return {};
            }

            // Check if the owner object already has a cache
            var cache = owner[this.expando];

            // If so, return it
            if (cache) {
                return cache;
            }

            // If not, register one
            return this.register(owner, initial);
        },
        set: function(owner, data, value) {
            var prop,
                cache = this.cache(owner);

            // Handle: [ owner, key, value ] args
            if (typeof data === "string") {
                cache[data] = value;

                // Handle: [ owner, { properties } ] args
            } else {
                // Fresh assignments by object are shallow copied
                if (_types.isEmptyObject(cache)) {

                    _util.extend(cache, data);
                    // Otherwise, copy the properties one-by-one to the cache object
                } else {
                    for (prop in data) {
                        cache[prop] = data[prop];
                    }
                }
            }
            return cache;
        },
        get: function(owner, key) {
            var cache = this.cache(owner);
            return cache !== undefined && key === undefined ? cache : cache[key];
        },
        access: function(owner, key, value) {
            var stored;

            if (key === undefined ||
                ((key && typeof key === "string") && value === undefined)) {

                stored = this.get(owner, key);

                return stored !== undefined ?
                    stored : this.get(owner, _strings.camelize(key));
            }

            this.set(owner, key, value);

            // Since the "set" path can have two possible entry points
            // return the expected data based on which path was taken[*]
            return value !== undefined ? value : key;
        },
        release: function(owner, key) {
            var i, name, camel,
                cache = this.cache(owner);

            if (key === undefined) {
                this.register(owner);

            } else {
                // Support array or space separated string of keys
                if (_types.isArray(key)) {
                    name = key.concat(key.map(_strings.camelize));
                } else {
                    camel = _strings.camelize(key);
                    // Try the string as a key before any manipulation
                    if (key in cache) {
                        name = [key, camel];
                    } else {
                        // If a key with the spaces exists, use it.
                        // Otherwise, create an array by matching non-whitespace
                        name = camel;
                        name = cache[name] ? [name] : (name.match(_sWhiteRegex) || []);
                    }
                }

                i = name.length;

                while (i--) {
                    delete cache[name[i]];
                }
            }
        },
        hasData: function(owner) {
            return !_types.isEmptyObject(
                owner[this.expando] || {}
            );
        },
        flush: function(owner) {
            if (owner[this.expando]) {
                delete owner[this.expando];
            }
        }
    };

    var _privateData = new Storage(),
        _userData = new Storage();


    /**
     * Store arbitrary data associated with the matched elements or return the
     * value at the named data store for the first element in the set of matched
     * elements.
     *
     * @param  {String|Object|Array}  key
     * @param  {Object}               value
     * @return {Object|String }
     */

    this.data = function(key, value) {

        var i, name, data,
            elem = this.elements[0],
            attrs = elem && elem.attributes;

        // Gets all values

        if (key === undefined) {

            if (this.length) {

                data = _userData.get(elem);

                if (elem.nodeType === 1 && !_privateData.get(elem, 'hasDataAttrs')) {

                    i = attrs.length;

                    while (i--) {

                        if (attrs[i]) {

                            name = attrs[i].name;

                            if (name.indexOf('data-') === 0) {

                                name = _strings.camelize(name.slice(5));
                                dataAttr(elem, name, data[name]);
                            }
                        }
                    }

                    _privateData.set(elem, 'hasDataAttrs', true);
                }
            }

            return data;
        }

        // Sets multiple values

        if (typeof key === 'object') {

            return this.each(function(elem) {
                _userData.set(elem, key);
            });
        }
        var camelKey = _strings.camelize(key);

        if (elem && value === undefined) {

            data = _userData.get(elem, key);

            if (data !== undefined) {

                return data;
            }

            data = _userData.get(elem, camelKey);

            var hasDataAttrs = _privateData.get(this, 'hasDataAttrs'),
                isHyphenated = key.indexOf('-') !== -1;

            if (data !== undefined) {

                return data;
            }

            data = dataAttr(elem, camelKey, undefined);

            if (data !== undefined) {

                return data;
            }

            // We tried really hard, but the data doesn't exist.

            return;
        }

        // Set the data...

        this.each(function(elem) {

            var data = _userData.get(elem, camelKey);
            _userData.set(elem, camelKey, value);

            if (isHyphenated && data !== undefined) {
                _userData.set(elem, key, value);
            }

            if (isHyphenated && hasDataAttrs === undefined) {
                _userData.set(elem, key, value);
            }
        });
    };

    /**
     * Remove attributes from element collection
     *
     * @param {String} key

     *
     * @return {Object}
     */

    this.removeData = function(key) {
        return this.each(function(elem) {
            _userData.release(elem, key);
        });
    };

    function dataAttr(elem, key, data) {

        var name;

        if (data === undefined && elem.nodeType === 1) {

            name = 'data-' + key.replace(_scharRegEx, '-$1').toLowerCase();

            data = elem.getAttribute(name);

            if (typeof data === 'string') {
                try {
                    data = data === 'true' ? true :
                        data === 'false' ? false :
                        data === 'null' ? null :
                        // Only convert to a number if it doesn't change the string
                        +data + '' === data ? +data :
                        _shtmlRegEx.test(data) ? JSON.parse(data + '') : data;
                } catch (e) {}

                // Make sure we set the data so it isn't changed later
                _userData.set(elem, key, data);

            } else {

                data = undefined;
            }
        }

        return data;
    }

    return {
        privateData: _privateData,
        flushData: _userData.flush,
        hasData: _userData.hasData,
        data: _userData.access,
        removeData: _userData.release
    };
});


// curcss.js
hAzzle.define('curCSS', function() {

    var _detection = hAzzle.require('Detection'),
        _storage = hAzzle.require('Storage'),

        sLnline = /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
        sListitem = /^(li)$/i,
        sTablerow = /^(tr)$/i,

        computedStyle = !!document.defaultView.getComputedStyle,

        computedValues = _detection.isWebkit ? function(elem) {
            var s;
            if (elem.nodeType === 1) {
                var dv = elem.ownerDocument.defaultView;
                s = dv.getComputedStyle(elem, null);
                if (!s && elem.style) {
                    elem.style.display = '';
                    s = dv.getComputedStyle(elem, null);
                }
            }
            return s || {};
        } :

        function(elem) {
            var view = false;
            if (elem && elem !== window) {

                if (elem.ownerDocument !== undefined) {
                    view = elem.ownerDocument.defaultView;
                }
                // Support: IE<=11+, Firefox<=30+
                // IE throws on elements created in popups
                // FF meanwhile throws on frame elements through 'defaultView.getComputedStyle'
                return view && computedStyle ?
                    (view.opener ? view.getComputedStyle(elem, null) :
                        window.getComputedStyle(elem, null)) : elem.style;
            }
            return null;
        },
        computedCSS = function(elem) {
            if (elem) {
                if (_storage.privateData.get(elem, 'computed') === undefined) {
                    _storage.privateData.access(elem, 'computed', {
                        computedStyle: null,
                    });
                }
                return _storage.privateData.get(elem, 'computed');
            }
        },
        getStyles = function(elem) {
            var computed;
            if (computedCSS(elem).computedStyle === null) {
                console.log('caching');
                computed = computedCSS(elem).computedStyle = computedValues(elem);
            } else {
                console.log('cached');
                computed = computedCSS(elem).computedStyle;
            }

            return computed;
        },

        curHeight = function(elem, toggleDisplay) {
            var contentBoxHeight = elem.offsetHeight -
                (parseFloat(curCSS(elem, 'borderTopWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderBottomWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingTop')) || 0) -
                (parseFloat(curCSS(elem, 'paddingBottom')) || 0);

            revertDisplay(elem, toggleDisplay);

            return contentBoxHeight;
        },
        curWidth = function(elem, toggleDisplay) {
            var contentBoxWidth = elem.offsetWidth -
                (parseFloat(curCSS(elem, 'borderLeftWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderRightWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingLeft')) || 0) -
                (parseFloat(curCSS(elem, 'paddingRight')) || 0);

            revertDisplay(elem, toggleDisplay);

            return contentBoxWidth;
        },

        revertDisplay = function(elem, toggleDisplay) {
            if (toggleDisplay) {
                elem.style.display = 'none';
            }
        },

        getDisplayType = function(elem) {
            var tagName = elem.tagName.toLowerCase();
            if (sLnline.test(tagName)) {
                return 'inline';
            }
            if (sListitem.test(tagName)) {
                return 'list-item';
            }
            if (sTablerow.test(tagName)) {
                return 'table-row';
            }
            return 'block';
        },

        // Prop to jQuery for the name!

        curCSS = function(elem, prop, force) {

            if (typeof elem === 'object' && elem instanceof hAzzle) {
                elem = elem.elements[0];
            }

            var computedValue = 0,
                toggleDisplay = false;

            if ((prop === 'height' || prop === 'width') && curCSS(elem, 'display') === 0) {
                toggleDisplay = true;
                elem.style.display = hAzzle.getDisplayType(elem);
            }

            if (!force) {

                if (prop === 'height' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curHeight(elem, toggleDisplay);
                } else if (prop === 'width' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curWidth(elem, toggleDisplay);
                }
            }

            var computedStyle = getStyles(elem);

            if ((_detection.ie ||
                    _detection.isFirefox) && prop === 'borderColor') {
                prop = 'borderTopColor';
            }

            // Support: IE9
            // getPropertyValue is only needed for .css('filter')

            if (_detection === 9 && prop === 'filter') {
                computedValue = computedStyle.getPropertyValue(prop);
            } else {
                computedValue = computedStyle[prop];
            }

            if (computedValue === '' || computedValue === null) {
                computedValue = elem.style[prop];
            }

            if (computedValue === 'auto' && (prop === 'top' || prop === 'right' || prop === 'bottom' || prop === 'left')) {

                var position = curCSS(elem, 'position');

                if (position === 'fixed' || (position === 'absolute' && (prop === 'left' || prop === 'top'))) {
                    computedValue = hAzzle(elem).position()[prop] + 'px';
                }
            }
            return computedValue;
        };

    return {
        computedCSS: computedCSS,
        getStyles: getStyles,
        curCSS: curCSS,
        getDisplayType: getDisplayType
    };
});

// units.js
hAzzle.define('Units', function() {
    var _curcss = hAzzle.require('curCSS'),
        _support = hAzzle.require('Support'),

        leftRightMargPad = /^(left$|right$|margin|padding)/,
        relAbsFixed = /^(relative|absolute|fixed)$/,
        topBottom = /^(top|bottom)$/,

        // Converts one unit to another

        units = function(px, unit, elem, prop) {

            if (unit === '' ||
                unit === 'px') {

                return px; // Don't waste time if there is no conversion to do.
            }

            if (unit === '%') {

                if (leftRightMargPad.test(prop)) {

                    prop = 'width';

                } else if (topBottom.test(prop)) {

                    prop = 'height';
                }

                elem = relAbsFixed.test(_curcss.curCSS(elem, 'position')) ?
                    elem.offsetParent : elem.parentNode;

                if (elem) {

                    prop = parseFloat(_curcss.curCSS(elem, prop));

                    if (prop !== 0) {

                        return px / prop * 100;
                    }
                }
                return 0;
            }

            if (unit === 'em') {

                return px / parseFloat(_curcss.curCSS(elem, 'fontSize'));
            }

            // The first time we calculate how many pixels there is in 1 meter
            // for calculate what is 1 inch/cm/mm/etc.

            if (units.unity === undefined) {

                var u = units.unity = {};

                _support.assert(function(div) {

                    div.style.width = '100cm';
                    document.body.appendChild(div);
                    u.mm = div.offsetWidth / 1000;
                });

                u.cm = u.mm * 10;
                u.in = u.cm * 2.54;
                u.pt = u.in * 1 / 72;
                u.pc = u.pt * 12;
            }

            // If the unity specified is not recognized we return the value.

            unit = units.unity[unit];

            return unit ? px / unit : px;
        };

    return {
        units: units
    };
});

hAzzle.define('Style', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _units = hAzzle.require('Units'),
        _strings = hAzzle.require('Strings'),
        _curcss = hAzzle.require('curCSS'),

        unitlessProps = ('zoom box-flex columns counter-reset volume stress overflow flex-grow ' +
            'column-count flex-shrink flex-height order orphans widows rotate3d flipped ' +
            'transform ms-flex-order transform-origin perspective transform-style ' +
            'ms-flex-negative ms-flex-positive transform-origin perspective ' +
            'perspective-origin backface-visibility scale scale-x scale-y scale-z ' +
            'scale3d reflect-x-y reflect-z reflect-y reflect ' +
            'background-color border-bottom-color border-left-color border-right-color border-top-color ' +
            'color column-rule-color outline-color text-decoration-color text-emphasis-color ' +
            'alpha z-index font-weight opacity red green blue').split(' '),

        sNumbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,

        prefixElement = document.createElement('div'),

        prefixMatches = {},

        cssProps = {
            'float': 'cssFloat'
        },

        unitless = {},

        cssHooks = {
            get: {},
            set: {}
        },

        prefixCheck = function(prop) {
            // If this property has already been checked, return the cached value
            if (prefixMatches[prop]) {
                return [prefixMatches[prop], true];
            } else {
                var vendors = ['', 'Webkit', 'Moz', 'ms', 'O'];

                for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
                    var propertyPrefixed;

                    if (i === 0) {
                        propertyPrefixed = prop;
                    } else {
                        // Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter).
                        propertyPrefixed = vendors[i] + prop.replace(/^\w/, function(match) {
                            return match.toUpperCase();
                        });
                    }

                    // Check if the browser supports this property as prefixed
                    if (typeof prefixElement.style[propertyPrefixed] === 'string') {
                        // Cache the match
                        prefixMatches[prop] = propertyPrefixed;

                        return [propertyPrefixed, true];
                    }
                }

                // If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed.
                return [prop, false];
            }
        },

        // getCSS

        getCSS = function(elem, name) {

            var val, hooks, computed, style,
                origName = _strings.camelize(name);

            if (elem) {

                style = elem.style;

                name = prefixCheck(name)[0];

                // Try prefixed name followed by the unprefixed name
                hooks = cssHooks.get[name] || cssHooks.get[origName];

                // If a hook was provided get the computed value from there
                val = hooks ? hooks(elem, true) : val;

                if (!computed && val === undefined) {
                    style = _curcss.getStyles(elem);
                    val = hooks ? hooks(elem, true) : style[name];
                    computed = true;
                }

                return val;
            }
        },

        // setCSS        

        setCSS = function(elem, name, value) {

            var ret, style, hook, type;

            if (elem && (elem.nodeType !== 3 || elem.nodeType !== 8)) {

                type = typeof value;

                name = _strings.camelize(name);

                // Auto-prefixing

                name = prefixCheck(name)[0];

                style = elem.style;

                if (value !== undefined) {

                    hook = cssHooks.set[name];

                    // Convert '+=' or '-=' to relative numbers
                    if (type === 'string' && (ret = sNumbs.exec(value))) {

                        value = _units.units(_curcss.curCSS(elem, name), ret[3], elem, name) + (ret[1] + 1) * ret[2];
                        type = 'number';
                    }

                    // If a number was passed in, add 'px' (except for certain CSS properties)

                    if (type === 'number' && !unitless[name]) {
                        value += ret && ret[3] ? ret[3] : 'px';
                    }

                    if (hook) {
                        hook(elem, name, value);
                    } else {
                        elem.style[name] = value;
                    }

                } else {
                    hook = cssHooks.get[name];

                    if (cssHooks.get[name] && (ret = cssHooks.get[name](elem, false))) {
                        return ret;
                    }

                    return style[name];
                }
            }
        };

    this.css = function(name, value) {

        var node = this.elements;

        // jQuery method

        if (_types.isArray(name)) {

            var map = {},
                i = name.length;

            while (i--) {
                map[name[i]] = getCSS(node[0], name[i], false);
            }

            return map;
        }

        if (value === undefined) {

            if (typeof name == 'string') {
                return node[0] && getCSS(node[0], name);
            }

            // Object

            return this.each(function(elem) {
                var val;
                for (val in name) {
                    setCSS(elem, value, name[value]);
                }
            });
        }

        // Set style
        return this.each(function(elem) {
            setCSS(elem, name, value);
        });
    };

    // Populate the unitless properties list

    _util.each(unitlessProps, function(prop) {
        unitless[_strings.camelize(prop)] = true;
    });

    return {
        cssProps: cssProps,
        unitless: unitless,
        getCSS: getCSS,
        setCSS: setCSS
    };
});

// csshooks.js
hAzzle.define('cssHooks', function() {

    var _util = hAzzle.require('Util'),
        _detection = hAzzle.require('Detection'),
        _style = hAzzle.require('Style'),
        _ccs = hAzzle.require('curCSS');

    // Fixes Chrome bug / issue

    if (_detection.isChrome) {
        _style.cssHooks.textDecoration = {
            get: function(elem, computed) {
                if (computed) {

                    //Chrome 31-36 return text-decoration-line and text-decoration-color
                    //which are not expected yet.
                    //see https://code.google.com/p/chromium/issues/detail?id=342126
                    var ret = _ccs.curCSS(elem, 'text-decoration');
                    //We cannot assume the first word as 'text-decoration-style'
                    if (/\b(inherit|(?:und|ov)erline|blink|line\-through|none)\b/.test(ret)) {
                        return RegExp.$1;
                    }
                }
            }
        };
    }

    // Getter    
    _util.extend(_style.cssHooks.get, {
        'opacity': function(elem, computed) {
            if (computed) {
                // We should always get a number back from opacity
                var ret = _ccs.curCSS(elem, 'opacity');
                return ret === '' ? '1' : ret;
            }
        }
    });

    return {};
});


// manipulation.js
hAzzle.define('Manipulation', function() {

    var _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _getText = hAzzle.require('Text'),
        scriptStyle = /<(?:script|style|link)/i,
        tagName = /<([\w:]+)/,
        htmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        whitespace = /^\s*<([^\s>]+)/,
        scriptTag = /\s*<script +src=['"]([^'"]+)['"]>/,
        table = ['<table>', '</table>', 1],
        td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
        option = ['<select>', '</select>', 1],
        noscope = ['_', '', 0, 1],

        tagMap = {
            style: table,
            table: table,
            thead: table,
            tbody: table,
            tfoot: table,
            colgroup: table,
            caption: table,
            tr: ['<table><tbody>', '</tbody></table>', 2],
            th: td,
            td: td,
            col: ['<table><colgroup>', '</colgroup></table>', 2],
            fieldset: ['<form>', '</form>', 1],
            legend: ['<form><fieldset>', '</fieldset></form>', 2],
            option: option,
            optgroup: option,
            script: noscope,
            link: noscope,
            param: noscope,
            base: noscope
        },

        createHTML = function(html, context) {
            return new hAzzle(create(html, context));
        },

        createScriptFromHtml = function(html, context) {
            var scriptEl = context.createElement('script'),
                matches = html.match(scriptTag);
            scriptEl.src = matches[1];
            return scriptEl;
        },

        deepEach = function(array, fn, context) {
            if (array) {
                var index = array.length;
                while (index--) {
                    if (_types.isNode(array[index])) {
                        deepEach(array[index].children, fn, context);
                        fn.call(context || array[index], array[index], index, array);
                    }
                }
            }
            return array;
        },

        create = function(node, context) {
            if (node) {
                // Mitigate XSS vulnerability

                var defaultContext = _support.imcHTML ?
                    document.implementation.createHTMLDocument() :
                    document,
                    ctx = context || defaultContext,
                    fragment = ctx.createDocumentFragment();

                if (typeof node === 'string' && node !== '') {

                    /* Check for 'script tags' (e.g <script type="text/javascript" src="doml4.js"></script>, and
                       create it if match 
                     */
                    if (scriptTag.test(node)) {
                        return [createScriptFromHtml(node, context)];
                    }

                    // Deserialize a standard representation

                    var i, tag = node.match(whitespace),
                        sandbox = fragment.appendChild(ctx.createElement('div')),
                        els = [],
                        map = tag ? tagMap[tag[1].toLowerCase()] : null,
                        dep = map ? map[2] + 1 : 1,
                        noScoop = map && map[3];

                    if (map) {
                        sandbox.innerHTML = (map[0] + node + map[1]);
                    } else {
                        sandbox.innerHTML = node;
                    }

                    while (dep--) {
                        sandbox = sandbox.firstChild;
                    }

                    // for IE NoScope, we may insert cruft at the begining just to get it to work

                    if (noScoop && sandbox && sandbox.nodeType !== 1) {
                        sandbox = sandbox.nextSibling;
                    }

                    do {
                        if (!tag || sandbox.nodeType == 1) {
                            els.push(sandbox);
                        }
                    } while (sandbox = sandbox.nextSibling);

                    for (i in els) {
                        if (els[i].parentNode) {
                            els[i].parentNode.removeChild(els[i]);
                        }
                    }

                    return els;

                } else if (_util.isNode(node)) {
                    return [node.cloneNode(true)];
                }
            }
        },
        // Grab childnodes

        grab = function(context, tag) {
            var ret = context.getElementsByTagName(tag || '*');
            return tag === undefined || tag && _util.nodeName(context, tag) ?
                _util.merge([context], ret) :
                ret;
        },

        // Removes the data associated with an element
        // This 'clearData' function will be fixed later on

        clearData = function(elems) {
            var elem, i = 0;
            for (;
                (elem = elems[i]) !== undefined; i++) {
                // Coming soon as events are fixed !!
            }
        },

        normalize = function(node, clone) {

            var i, l, ret;

            if (typeof node === 'string') {
                return create(node);
            }

            if (node instanceof hAzzle) {
                node = node.elements;
            }

            if (_types.isNode(node)) {
                node = [node];
            }

            if (clone) {
                ret = []; // don't change original array
                for (i = 0, l = node.length; i < l; i++) {
                    ret[i] = node[i].cloneNode(true);
                }
                return ret;
            }
            return node;
        },
        createGlobal = function(elem, content, method) {
            if (typeof content === 'string' &&
                _core.isXML(elem) &&
                elem.parentNode && elem.parentNode.nodeType === 1) {
                elem.insertAdjacentHTML(method, content.replace(htmlTag, '<$1></$2>'));
            } else {
                _util.each(normalize(content, 0), function(relatedNode) {
                    elem[method](relatedNode); // DOM Level 4
                });
            }
        },
        prepend = function(elem, content) {
            createGlobal(elem, content, 'prepend');
        },

        append = function(elem, content) {
            createGlobal(elem, content, 'append');
        };

    // insertAdjacentHTML method for append, prepend, before and after

    this.iAHMethod = function(method, html, fn) {
        return this.each(function(elem, index) {
            if (typeof html === 'string' &&
                _core.isXML(elem) &&
                elem.parentNode && elem.parentNode.nodeType === 1) {
                elem.insertAdjacentHTML(method, html.replace(htmlTag, '<$1></$2>'));
            } else {
                fn(elem, index);
            }
        });
    };

    this.append = function(content) {
        return this.iAHMethod('beforeend', content, function(node, state) {
            if (node.nodeType === 1 || node.nodeType === 11 || node.nodeType === 9) {
                _util.each(normalize(content, state), function(relatedNode) {
                    node.appendChild(relatedNode); // DOM Level 4
                });
            }
        });
    };

    this.prepend = function(content) {
        return this.iAHMethod('afterbegin', content, function(node, state) {
            if (node.nodeType === 1 || node.nodeType === 11 || node.nodeType === 9) {
                _util.each(normalize(content, state), function(relatedNode) {
                    node.prepend(relatedNode); // DOM Level 4
                });
            }
        });
    };

    this.before = function(content) {
        return this.iAHMethod('beforebegin', content, function(node, state) {
            _util.each(normalize(content, state), function(relatedNode) {
                node.before(relatedNode); // DOM Level 4

            });
        });
    };

    this.after = function(content) {
        return this.iAHMethod('afterend', content, function(node, state) {
            _util.each(normalize(content, state), function(relatedNode) {
                node.after(relatedNode); // DOM Level 4
            });
        });
    };

    this.appendTo = function(content) {
        return this.domManip(content, function(node, el) {
            node.appendChild(el);
        });
    };

    this.prependTo = function(content) {
        return this.domManip(content, function(node, el) {
            node.insertBefore(el, node.firstChild);
        });
    };

    this.insertBefore = function(content) {
        return this.domManip(content, function(node, el) {
            node.parentNode.insertBefore(el, node);
        });
    };

    this.insertAfter = function(content) {
        return this.domManip(content, function(node, el) {
            var sibling = node.nextSibling;
            sibling ?
                node.parentNode.insertBefore(el, sibling) :
                node.parentNode.appendChild(el);
        }, 1);
    };

    // Same as 'ReplaceWith' in jQuery

    this.replace = function(html) {
        return this.each(function(el, i) {
            _util.each(normalize(html, i), function(i) {
                el.replace(i); // DOM Level 4
            });
        });
    };

    // Thanks to jQuery for the function name!!

    this.domManip = function(content, fn, /*reverse */ rev) {

        var i = 0,
            r = [];

        // Nasty looking code, but this has to be fast

        var self = this.elements,
            elems, nodes;

        if (typeof content === 'string' &&
            content[0] === '<' &&
            content[content.length - 1] === '>' &&
            content.length >= 3) {
            nodes = content;

        } else {
            nodes = hAzzle(content);
        }

        // Start the iteration and loop through the content

        _util.each(normalize(nodes), function(elem, index) {
            _util.each(self, function(el) {
                elems = index > 0 ? el.cloneNode(true) : el;
                if (elem) {
                    fn(elem, elems);
                }
            }, null, rev);

        }, this, rev);
        self.length = i;
        _util.each(r, function(e) {
            self[--i] = e;
        }, null, !rev);
        return self;
    };

    // Text

    this.text = function(value) {
        return value === undefined ?
            _getText.getText(this.elements) :
            this.empty().each(function(elem) {
                if (elem.nodeType === 1 ||
                    elem.nodeType === 11 ||
                    elem.nodeType === 9) {
                    elem.textContent = value;
                }
            });
    };

    // HTML

    this.html = function(value) {

        var elem = this.elements[0],
            i = 0,
            l = this.length;

        if (value === undefined && elem.nodeType === 1) {
            return elem.innerHTML;
        }
        // See if we can take a shortcut and just use innerHTML

        if (typeof value === 'string' && !scriptStyle.test(value) &&
            !tagMap[(tagName.exec(value) || ['', ''])[1].toLowerCase()]) {

            value = value.replace(htmlTag, '<$1></$2>'); // DOM Level 4

            try {

                for (; i < l; i++) {

                    elem = this.elements[i] || {};

                    // Remove element nodes and prevent memory leaks
                    if (elem.nodeType === 1) {
                        clearData(grab(elem, false));
                        elem.innerHTML = value;
                    }
                }

                elem = 0;

                // If using innerHTML throws an exception, use the fallback method
            } catch (e) {}
        }

        if (elem) {
            return this.empty().append(value);
        }
    };

    this.deepEach = function(fn, scope) {
        return deepEach(this, fn, scope);
    };

    this.detach = function() {
        return this.each(function(el) {
            if (el.parentElement) {
                el.parentElement.removeChild(el);
            }
        });
    };

    this.empty = function() {
        return this.each(function(el) {
            deepEach(el.children, clearData);
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        });
    };

    this.remove = function() {
        this.deepEach(clearData);
        return this.detach();
    };

    this.clone = function(deep) {
        return this.map(function(elem) {
            return elem.cloneNode(deep);
        });
    };

    return {
        grab: grab,
        clearData: clearData,
        create: create,
        createHTML: createHTML,
        append: append,
        prepend: prepend
    };
});

// setters.js
hAzzle.define('Setters', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _detection = hAzzle.require('Detection'),
        _concat = Array.prototype.concat,
        SVGAttributes = 'width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2',
        whiteSpace = /\S+/g,
        rreturn = /\r/g,
        boolElemArray = ('input select option textarea button form details').split(' '),
        boolAttrArray = ('multiple selected checked disabled readonly required ' +
            'async autofocus compact nowrap declare noshade hreflang onload src' +
            'noresize defaultChecked autoplay controls defer autocomplete ' +
            'hidden tabindex readonly type accesskey dropzone spellcheck ismap loop scoped open').split(' '),
        boolAttr = {}, // Boolean attributes
        boolElem = {}, // Boolean elements

        propMap = {
            'class': 'className',
            'for': 'htmlFor',
        },
        attrHooks = {
            get: {},
            set: {}
        },
        propHooks = {
            get: {},
            set: {}
        },
        nodeHooks = {
            get: {},
            set: {}
        },
        boolHooks = {
            get: {},
            set: {}
        },
        valHooks = {
            get: {},
            set: {}
        },

        SVGAttribute = function(prop) {

            if (_detection.ie || (_detection.isAndroid && !_detection.isChrome)) {
                SVGAttributes += '|transform';
            }

            return new RegExp('^(' + SVGAttributes + ')$', 'i').test(prop);
        },

        // Get names on the boolean attributes

        getBooleanAttrName = function(elem, name) {
            // check dom last since we will most likely fail on name
            var booleanAttr = boolAttr[name.toLowerCase()];
            // booleanAttr is here twice to minimize DOM access
            return booleanAttr && boolElem[elem.nodeName] && booleanAttr;
        },

        removeAttr = function(el, value) {

            var name, propName, i = 0,

                keys = typeof value === 'string' ?

                // String

                value.match(whiteSpace) :

                // Merge arrays

                _concat(value),

                l = keys.length;

            for (; i < l; i++) {

                name = keys[i];

                // Get the properties

                propName = propMap[name] || name;

                if (getBooleanAttrName(el, name)) {

                    el[propName] = false;

                } else {

                    el.removeAttribute(name);
                }
            }
        },

        Attr = function(elem, name, value) {
            var hooks, ret, nType = elem.nodeType,
                notxml;

            // don't get/set attributes on text, comment and attribute nodes
            if (elem && (nType !== 3 || nType !== 8 || nType !== 2)) {


                // Fallback to prop when attributes are not supported
                if (typeof elem.getAttribute === 'undefined') {
                    return Prop(elem, name, value);
                }

                notxml = nType !== 1 || !_core.isXML(elem);

                if (notxml) {

                    name = name.toLowerCase();
                    hooks = (attrHooks[value === 'undefined' ? 'get' : 'set'][name] || null) ||
                        getBooleanAttrName(elem, name) ?
                        boolHooks[value === 'undefined' ?
                            'get' : 'set'][name] : nodeHooks[value === 'undefined' ? 'get' : 'set'][name];
                }

                // Get attribute

                if (value === undefined) {

                    if (hooks && (ret = hooks.get(elem, name))) {
                        if (ret !== null) {
                            return ret;
                        }
                    }

                    ret = elem.getAttribute(name, 2);
                    // Non-existent attributes return null, we normalize to undefined
                    return ret == null ?
                        undefined :
                        ret;
                }

                // Set attribute            

                if (value === null) {
                    removeAttr(elem, name);
                } else if (hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                    return ret;
                } else {
                    elem.setAttribute(name, value + '');
                }
            }
        },

        Prop = function(elem, name, value) {

            var ret, hook, nType = elem.nodeType;

            if (elem && (nType !== 2 || nType !== 3 || nType !== 8)) {

                if (nType !== 1 || _core.isHTML) {

                    // Fix name and attach hooks
                    name = propMap[name] || name;
                    hook = value === 'undefined' ? propHooks.get[name] : propHooks.set[name];
                }

                if (typeof value !== 'undefined') {

                    return hook && (ret = hook.set(elem, value, name)) !== undefined ?
                        ret :
                        (elem[name] = value);

                } else {

                    return hook && (ret = hook(elem, name)) !== null ?
                        ret :
                        elem[name];
                }

            }
        };

    this.val = function(value) {

        var hooks, ret, isFunction,
            elem = this.elements[0];

        if (!elem && !elem.nodeName) {
            return;
        }

        if (!arguments.length) {
            if (elem) {
                hooks = valHooks.get[elem.type] ||
                    valHooks.get[elem.nodeName.toLowerCase()];

                if (hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
                    return ret;
                }

                ret = elem.value;

                return typeof ret === 'string' ?
                    // Handle most common string cases
                    ret.replace(rreturn, '') :
                    // Handle cases where value is null/undef or number
                    ret == null ? '' : ret;
            }

            return;
        }

        isFunction = _types.isFunction(value);

        return this.each(function(elem, index) {
            var val;

            if (elem.nodeType !== 1) {
                return;
            }

            if (isFunction) {
                val = value.call(elem, index, hAzzle(elem).val());
            } else {
                val = value;
            }

            // Treat null/undefined as ""; convert numbers to string
            if (val == null) {
                val = '';

            } else if (typeof val === "number") {
                val += '';

            } else if (_types.isArray(val)) {
                val = _util.map(val, function(value) {
                    return value == null ? "" : value + "";
                });
            }

            hooks = valHooks.set[elem.type] || valHooks.set[elem.nodeName.toLowerCase()];

            // If set returns undefined, fall back to normal setting
            if (!hooks || hooks(elem, val, 'value') === undefined) {
                elem.value = val;
            }
        });
    };


    this.hasAttr = function(name) {
        return name && typeof this.attr(name) !== 'undefined';
    };

    // Toggle properties on DOM elements

    this.toggleProp = function(prop) {
        return this.each(function(elem) {
            return elem.prop(prop, !elem.prop(prop));
        });
    };

    this.prop = function(name, value) {
        var elem = this.elements;
        if (typeof name === 'object') {
            return this.each(function(elem) {
                _util.each(name, function(value, key) {
                    Prop(elem, key, value);
                });
            });
        }

        if (typeof value === 'undefined') {
            return Prop(elem[0], name);
        }

        this.each(elem, function(elem) {
            Prop(elem, name, value);

        });
    };

    // Toggle properties on DOM elements

    this.toggleProp = function(prop) {
        return this.each(function(elem) {
            return elem.prop(prop, !elem.prop(prop));
        });
    };

    this.removeAttr = function(value) {
        return this.each(function(elem) {
            removeAttr(elem, value);
        });
    };

    this.attr = function(name, value) {

        var elem = this.elements;

        if (typeof name === 'object') {
            return this.each(function(elem) {
                _util.each(name, function(value, key) {
                    Attr(elem, key, value);
                });
            });
        }
        return typeof value === 'undefined' ?
            Attr(elem[0], name) :
            this.each(function(elem) {
                Attr(elem, name, value);
            });
    };

    //  Check if  element has an attribute

    this.hasAttr = function(name) {
        return name && typeof this.attr(name) !== 'undefined';
    };

    _util.each(boolAttrArray, function(prop) {
        boolAttr[boolAttrArray[prop]] = boolAttrArray[prop];
    });

    _util.each(boolElemArray, function(prop) {
        boolElem[prop.toUpperCase()] = true;
    });

    // Populate propMap
    _util.each(['cellPadding', 'cellSpacing', 'maxLength', 'rowSpan',
        'colSpan', 'useMap', 'frameBorder', 'contentEditable', 'textContent', 'valueType',
        'tabIndex', 'readOnly', 'type', 'accessKey', 'tabIndex', 'dropZone', 'spellCheck',
        'hrefLang', 'isMap', 'srcDoc', 'mediaGroup', 'autoComplete', 'noValidate',
        'radioGroup'
    ], function(prop) {

        propMap[prop.toLowerCase()] = prop;
    });

    return {
        attrHooks: attrHooks,
        propHooks: propHooks,
        boolHooks: boolHooks,
        nodeHooks: nodeHooks,
        valHooks: valHooks,
        propMap: propMap,
        boolAttr: boolAttr,
        boolElem: boolElem,
        attr: Attr,
        prop: Prop,
        removeAttr: removeAttr,
        getBooleanAttrName: getBooleanAttrName,
        SVGAttribute: SVGAttribute
    };
});
// attrhooks.js
hAzzle.define('attrHooks', function() {

    var _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _setters = hAzzle.require('Setters');

    // Setter
    _util.extend(_setters.attrHooks.set, {

        'type': function(elem, value) {
            if (!_support.radioValue && value === 'radio' &&
                _util.nodeName(elem, 'input')) {
                var val = elem.value;
                elem.setAttribute('type', value);
                if (val) {
                    elem.value = val;
                }
                return value;
            }
        },
        // Title hook for DOM        

        'title': function(elem, value) {
            (elem = document.documentElement ? window.document : elem).title = value;
        }
    });
    // Getter    
    _util.extend(_setters.attrHooks.get, {
        'title': function(elem) {
            return elem === document.documentElement ? window.document.title : elem.title;
        }
    });
   return {};
});


// prophooks.js
hAzzle.define('propHooks', function() {

    var _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _setters = hAzzle.require('Setters'),

        _focusable = /^(?:input|select|textarea|button)$/i;

    // Getter    
    _util.extend(_setters.propHooks.get, {
        'tabIndex': function(elem) {
            return elem.hasAttribute('tabindex') ||
                focusable.test(elem.nodeName) || elem.href ?
                elem.tabIndex :
                -1;
        }
    });

    if (!_support.optSelected) {
        _setters.propHooks.get.selected = function(elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
            }
            return null;
        };
    }
      return {};
});

// boolhooks.js
hAzzle.define('boolHooks', function () {

        var _setters = hAzzle.require('Setters');

    // Setter    

    _setters.boolHooks.set = function (elem, value, name) {
        if (value === false) {
            // Remove boolean attributes when set to false
            removeAttr(elem, name);
        } else {
            elem.setAttribute(name, name);
        }
        return name;
    };
    
    return {};
});

// valhooks.js
hAzzle.define('valHooks', function() {

    var _util = hAzzle.require('Util'),
        _strings = hAzzle.require('Strings'),
        _getText = hAzzle.require('getText'),
        _types = hAzzle.require('Types'),
        _collection = hAzzle.require('Collection'),
        _setters = hAzzle.require('Setters');

    // Setter
    _util.extend(_setters.valHooks.set, {

        'select': function(elem, value) {
            var optionSet, option,
                options = elem.options,
                values = _collection.makeArray(value),
                i = options.length;

            while (i--) {
                option = options[i];
                if ((option.selected = _collection.inArray(option.value, values) >= 0)) {
                    optionSet = true;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if (!optionSet) {
                elem.selectedIndex = -1;
            }
            return values;
        }
    });

    // Getter    
    _util.extend(_setters.valHooks.get, {

        'option': function(elem) {

            var val = elem.getAttribute(name, 2);

            return val !== null ?
                val :
                _strings.trim(_getText.getText(elem));
        },

        'select': function(elem, value) {

            // Selectbox has special case

            var option, options = elem.options,
                index = elem.selectedIndex,
                one = elem.type === 'select-one' || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0;

            for (; i < max; i++) {

                option = options[i];

                if ((option.selected || i === index) &&
                    option.getAttribute('disabled') === null &&
                    (!option.parentNode.disabled || !_util.nodeName(option.parentNode, 'optgroup'))) {

                    // Get the specific value for the option

                    value = hAzzle(option).val();

                    // We don't need an array for one selects

                    if (one) {
                        return value;
                    }

                    // Multi-Selects return an array
                    values.push(value);
                }
            }
            return values;
        }
    });


    // Radios and checkboxes setter

    _util.each(['radio', 'checkbox'], function(val) {
        _setters.valHooks.set[val] = function(elem, value) {
            if (_types.isArray(value)) {
                return (elem.checked = _collection.inArray(hAzzle(elem).val(), value) >= 0);
            }
        };
    });
});

hAzzle.define('Events', function() {

    var util = hAzzle.require('Util'),
        query = hAzzle.require('Jiesa'),
        _matches = hAzzle.require('Matches'),
        _id = hAzzle.require('Id'),
        _slice = Array.prototype.slice;

    // General-purpose event emitter
    // -----------------------------

    function EventEmitter() {
        this.events = {};
        this.context = null;
    }

    // Adds a handler to the events list
    EventEmitter.prototype.addListener = function(event, handler) {
        var handlers = this.events[event] || (this.events[event] = []);
        handlers.push(handler);
        return this;
    };

    // Add a handler that can only get called once
    EventEmitter.prototype.once = function(event, handler) {
        var self = this;

        function suicide() {
            handler.apply(this, arguments);
            self.removeListener(event, suicide);
        }
        return this.addListener(event, suicide);
    };

    // Removes a handler from the events list
    EventEmitter.prototype.removeListener = function(event, handler) {
        var self = this,
            handlers = this.events[event];

        if (event === '*') {
            if (!handler) {
                this.events = {};
            } else {
                util.each(this.events, function(handlers, event) {
                    self.removeListener(event, handler);
                });
            }
        } else if (handler && handlers) {
            handlers.splice(handlers.indexOf(handler), 1);
            if (handlers.length === 0) {
                delete this.events[event];
            }
        } else {
            delete this.events[event];
        }
        return this;
    };

    // Calls all handlers that match the event type
    EventEmitter.prototype.emit = function(event, a1, a2, a3) {
        var handlers = this.events[event],
            context = this.context || this;

        if (handlers) {
            // Preserve array state during the loop, otherwise manipulating events
            // inside a callback will cause offset errors.

            handlers = handlers.slice(0);

            var ln = handlers.length,
                i = -1;
            // Optimize for most common cases
            switch (arguments.length) {
                case 2:
                    while (++i < ln) handlers[i].call(context, a1);
                    break;
                case 1:
                    while (++i < ln) handlers[i].call(context);
                    break;
                case 3:
                    while (++i < ln) handlers[i].call(context, a1, a2);
                    break;
                case 4:
                    while (++i < ln) handlers[i].call(context, a1, a2, a3);
                    break;
                default:
                    var args = _slice.call(arguments, 1);
                    while (++i < ln) handlers[i].apply(context, args);
            }
        }

        return this;
    };

    EventEmitter.prototype.proxy = function(event) {
        return util.applyLeft(this, this.emit, [event]);
    };

    // Utility methods
    // -----------------------------

    var emitters = {};

    function getEmitter(element) {
        var id = _id.getUid(element);
        return emitters[id] || (emitters[id] = new DOMEventEmitter(element));
    }

    function getType(event) {
        var index = event.indexOf(' ');
        return index > 0 ? event.substr(0, index) : event;
    }

    function getSelector(event) {
        var index = event.indexOf(' ');
        return index > 0 ? event.substr(index) : '';
    }

    function createEvent(type, properties) {
        if (typeof type != 'string') {
            type = type.type;
        }
        var isMouse = ['click', 'mousedown', 'mouseup', 'mousemove'].indexOf(type) != -1,
            event = document.createEvent(isMouse ? 'MouseEvent' : 'Event');
        if (properties) {
            util.extend(event, properties);
        }
        event.initEvent(type, true, true);
        return event;
    }

    // DOM event emitter
    // -----------------------------

    /*
        Creates one event emitter per element, proxies DOM events to it. This way
        we can keep track of the functions so that they can be removed from the
        elements by reference when you call .removeListener() by event name.   
    */

    function DOMEventEmitter(element) {
        EventEmitter.call(this);
        this.element = element;
        this.proxied = {};
    }

    util.inherits(DOMEventEmitter, EventEmitter);

    DOMEventEmitter.prototype._proxy = function(event) {
        return function(DOMEvent) {
            var selector = getSelector(event),
                context = this.element;
            // delegate behavior
            if (selector) {
                context = DOMEvent.target;
                while (context && !_matches.matches(context, selector)) {
                    context = context !== this.element && context.parentNode;
                }
                if (!context || context == this.element) {
                    return;
                }
            }
            this.context = context;
            this.emit(event, DOMEvent, this.element);
        }.bind(this);
    };

    DOMEventEmitter.prototype.proxy = function(event) {
        return this.proxied[event] || (this.proxied[event] = this._proxy(event));
    };

    DOMEventEmitter.prototype.addListener = function(event, handler) {
        EventEmitter.prototype.addListener.call(this, event, handler);
        if (!this.proxied[event]) {
            this.element.addEventListener(getType(event), this.proxy(event), false);
        }
        return this;
    };

    DOMEventEmitter.prototype.removeListener = function(event, handler) {
        if (event.indexOf('*') >= 0) {
            var self = this,
                re = new RegExp('^' + event.replace('*', '\\b'));
            // *      : remove all events
            // type * : remove delegate events
            // type*  : remove delegate and undelegate
            util.each(this.events, function(handlers, event) {
                if (re.test(event)) {
                    self.removeListener(event, handler);
                }
            });
        } else {
            var proxy = this.proxied[event];
            EventEmitter.prototype.removeListener.call(this, event, handler);
            if (!this.events[event] && proxy) {
                this.element.removeEventListener(getType(event), proxy, false);
                delete this.proxied[event];
            }
        }
        return this;
    };

    function acceptMultipleEvents(method) {
        var _method = DOMEventEmitter.prototype[method];
        DOMEventEmitter.prototype[method] = function(event, handler) {
            var self = this;
            if (typeof event !== 'string') {
                util.each(event, function(handler, event) {
                    _method.call(self, event, handler);
                });
            } else {
                _method.call(self, event, handler);
            }
            return self;
        };
    }

    ['addListener', 'once', 'removeListener'].forEach(acceptMultipleEvents);

    DOMEventEmitter.prototype.destroy = function() {
        return this.removeListener('*');
    };

    DOMEventEmitter.prototype.trigger = function(event, data) {
        if (!(event instanceof window.Event)) {
            event = createEvent(event);
        }
        event.data = data;
        this.element.dispatchEvent(event);
        return this;
    };

    // Exported methods
    // -----------------------------

    var exports = {};

    function emitterProxy(method, element, event, handler) {
        getEmitter(element)[method](event, handler);
    };


    ['addListener', 'removeListener', 'once', 'trigger'].forEach(function(method) {
        // Create a function proxy for the method
        var fn = util.curry(emitterProxy, method);

        exports[method] = fn;
        this[method] = this.iterate(fn);
    }.bind(this));

    // Aliases
    // -----------------------------


    [EventEmitter.prototype, DOMEventEmitter.prototype, this].forEach(function(obj) {
        obj.on = obj.addListener;
    });

    // Global event bus / pub-sub
    // -----------------------------

    var EE = new EventEmitter;

    hAzzle.subscribe = EE.addListener.bind(EE);
    hAzzle.unsubscribe = EE.removeListener.bind(EE);
    hAzzle.publish = EE.emit.bind(EE);

    return {
        EventEmitter: EventEmitter,
        DOMEventEmitter: DOMEventEmitter,
        getEmitter: getEmitter,
        createEvent: createEvent,
        on: exports.addListener,
        once: exports.once,
        off: exports.removeListener,
        trigger: exports.trigger
    };
});

// traversing.js
hAzzle.define('Traversing', function() {

    var _jiesa = hAzzle.require('Jiesa'),
        _dom = hAzzle.require('Dom'),
        _matches = hAzzle.require('Matches'),
        _collection = hAzzle.require('Collection'),
        _core = hAzzle.require('Core'),
        _util = hAzzle.require('Util');

    this.contains = function(selector) {
        var matches;
        return _dom._create(_collection.reduce(this.elements, function(elements, element) {
            matches = _jiesa.find(element, selector);
            return elements.concat(matches.length ? element : null);
        }, []));
    };

    this.is = function(selector) {
        return this.length > 0 && this.filter(selector).length > 0;
    };

    this.not = function(selector) {
        return this.filter(selector, true);
    };

    // Determine the position of an element within the set
    this.index = function(selector) {
        return selector == null ?
            this.parent().children().indexOf(this.elements[0]) :
            this.elements.indexOf(new hAzzle(selector).elements[0]);
    };

    this.add = function(selector, ctx) {
        var elements = selector;
        if (typeof selector === 'string') {
            elements = new hAzzle(selector, ctx).elements;
        }
        return this.concat(elements);
    };

    this.has = function(selector) {
        return _dom._create(_util.filter(
            this.elements,
            _util.isElement(selector) ? function(el) {
                return _core.contains(selector, el);
            } : typeof selector === 'string' && selector.length ? function(el) {
                return _jiesa.find(selector, el).length;
            } : function() {
                return false;
            }
        ));
    };

    // Returns `element`'s first following sibling

    this.next = function(selector) {
        return this.map(function(elem) {
            return elem.nextElementSibling;
        }).filter(selector || '*');
    };

    // Returns `element`'s first previous sibling

    this.prev = function(selector) {
        return this.map(function(elem) {
            return elem.previousElementSibling;
        }).filter(selector || '*');
    };

    this.first = function(index) {
        return index ? this.slice(0, index) : this.eq(0);
    };

    this.last = function(index) {
        return index ? this.slice(this.length - index) : this.eq(-1);
    };

    // Returns all sibling elements for nodes
    // Optionally takes a query to filter the sibling elements.

    this.siblings = function(selector) {

        var ret = [],
            i, nodes;

        this.each(function(element) {

            nodes = element.parentElement.children;

            i = nodes.length;

            while (i--) {
                if (nodes[i] !== element) {
                    ret.push(nodes[i]);
                }
            }
        });
        return _dom._create(ret, selector);
    };

    // Returns immediate parent elements
    // Optionally takes a query to filter the parent elements.

    this.ancestor = function(selector) {
        return _dom._create(this.pluck('parentElement'), selector);
    };

    // Returns all parent elements for nodes
    // Optionally takes a query to filter the child elements.

    this.ancestors = function(selector) {
        var ancestors = [],
            elements = this.elements,
            fn = function(elem) {
                if (elem && (elem = elem.parentElement) && elem !== document && _util.indexOf(ancestors, elem) < 0) {
                    ancestors.push(elem);
                    return elem;
                }
            };

        while (elements.length > 0 && elements[0] !== undefined) {
            elements = _util.map(elements, fn);
        }

        if (this.length > 1) {
            // Remove duplicates
            _core.uniqueSort(ancestors);
            // Reverse order for parents
            ancestors.reverse();
        }
        return _dom._create(ancestors, selector);
    };

    // Returns closest parent that matches query

    this.closest = function(selector, ctx) {
        var cur,
            i = 0,
            l = this.length,
            matched = [];

        for (; i < l; i++) {
            for (cur = this.elements[i]; cur && cur !== ctx; cur = cur.parentNode) {
                // Always skip document fragments
                if (cur.nodeType < 11 && 
                        cur.nodeType === 1 &&
                        _matches.matches(cur, selector)) {

                    matched.push(cur);
                    break;
                }
            }
        }

        return hAzzle(matched.length > 1 ? _core.uniqueSort(matched) : matched);
    };

    // Returns all immediate child elements for nodes

    this.children = function(selector) {
        return _dom._create(_collection.reduce(this.elements, function(els, elem) {
            var children = _collection.slice(elem.children);
            return els.concat(children);
        }, []), selector);
    };

    return {};
});

// classes.js
hAzzle.define('Classes', function() {

    var _support = hAzzle.require('Support'),
        _util = hAzzle.require('Util'),
        _storage = hAzzle.require('Storage'),
        _strings = hAzzle.require('Strings'),
        _types = hAzzle.require('Types'),
        whitespace = (/\S+/g),
        reSpace = /[\n\t\r]/g,

        addRemove = function(elem, classes, nativeMethodName, fn, done) {
            if (elem) {
                var length, i,
                    based = false;

                // Support for array (e.g. ['hello', 'world']

                classes = _types.isString(classes) ?
                    classes :
                    _types.isArray(classes) ?
                    classes.join(' ') : '';

                if (nativeMethodName === 'remove' && !classes) {
                    elem.className = '';
                }

                // use native classList property if possible

                if (_support.classList) {

                    // Flag native

                    based = true;

                    fn = function(elem, cls) {
                        return elem.classList[nativeMethodName](cls);
                    };
                }

                classes = (classes || '').match(whitespace) || [];

                // Some browsers (e.g. IE) don't support multiple  arguments

                if (based && _support.multipleArgs) {
                    elem.classList[nativeMethodName].apply(elem.classList, classes);
                } else {

                    length = classes.length;

                    for (i = 0; i < length; i++) {
                        fn(elem, classes[i]);
                    }
                }
                // Callback function (if provided) that will be fired after the
                // className value has been added / removed to / from the element 

                if (_types.isFunction(done)) {
                    done.call(elem, elem);
                }
            }
        },

        hasClass = function(elem, classes) {

            elem = elem.length ? elem : [elem];

            var className = ' ' + classes + ' ',
                els = elem.length ? elem : [elem],
                i = 0,
                cls = _support.classList,
                l = els.length;

            for (; i < l; i++) {
                if (els[i].nodeType === 1) {
                    if (cls) {
                        if (els[i].classList.contains(classes)) {
                            return true;
                        }
                    } else {
                        if ((' ' + els[i].className + ' ').replace(reSpace, ' ').indexOf(className) >= 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        // addClass - can take single elem or array of elements

        addClass = function(elem, classes, /*optional*/ fn) {

            var els = elem.length ? elem : [elem];
            _util.each(els, function(elem) {
                return addRemove(elem, classes, 'add', function(elem, cls) {

                    var cur = (' ' + elem.className + ' ').replace(reSpace, ' '),
                        finalValue;

                    if (cur.indexOf(' ' + cls + ' ') < 0) {
                        cur += cls + ' ';
                    }

                    // Only assign if different to avoid unneeded rendering.
                    finalValue = _strings.trim(cur);
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
                    }
                }, fn);
            });
        },

        // removeClass - can take single elem or array of elements

        removeClass = function(elem, classes, /*optional*/ fn) {

            var els = elem.length ? elem : [elem];

            _util.each(els, function(elem) {
                return addRemove(elem, classes, 'remove', function(elem, cls) {

                    var cur = (' ' + elem.className + ' ').replace(reSpace, ' '),
                        finalValue;

                    if (cur.indexOf(' ' + cls + ' ') >= 0) {
                        cur = cur.replace(' ' + cls + ' ', ' ');
                    }
                    // Only assign if different to avoid unneeded rendering.
                    finalValue = cls ? _strings.trim(cur) : '';
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
                    }

                }, fn);
            });
        },
        setClass = function(element, /* classe(s) to be added*/ add, /* classe(s) to be removed*/ remove, fn) {
            addClass(elem, add, fn);
            removeClass(elem, remove, fn);
        },

        // NOTE! Use use non-native classList solution for 'toggleClass'
        // because of bugs in IE and some other browsers ( IE10, iOS, Nokia phones e.g.) 
        // One nasty exaple is the fact that IE10+ doesn't support the toggle boolean flag.

        // Toggles the presence of CSS class `className` on `element`.

        toggleClass = function(elem, value, stateVal) {

            var els = elem.length ? elem : [elem],
                type = typeof value;

            if (typeof stateVal === 'boolean' && type === 'string') {
                return stateVal ? addClass(els, value) : removeClass(els, value);
            }
            var i = 0,
                len = els.length;

            for (; i < len; i++) {

                elem = els[i];

                if (type === 'string') {
                    // Toggle individual class names
                    var className,
                        self = hAzzle(elem),
                        classNames = value.match(whitespace) || [];

                    i = 0;

                    while ((className = classNames[i++])) {
                        // Check each className given, space separated list
                        if (self.hasClass(className)) {
                            self.removeClass(className);
                        } else {
                            self.addClass(className);
                        }
                    }

                    // Toggle whole class name
                } else if (value === undefined || type === 'boolean') {
                    if (elem.className) {
                        // store className if set
                        _storage.privateData.set(elem, '__className__', elem.className);
                    }
                    elem.className = elem.className || value === false ?
                        '' :
                        _storage.privateData.get(this, '__className__') || '';
                }
            }
        };


    this.hasClass = function(classes) {
        return hasClass(this.elements, classes);
    };

    // Add the given CSS class to element

    this.addClass = function(classes, fn) {
        return typeof classes === 'function' ?
            this.each(function(elem, index) {
                hAzzle(elem).addClass(classes.call(elem, index, elem.className));
            }) : addClass(this.elements, classes, fn);
    };

    // Removes CSS class `className` from `element`.

    this.removeClass = function(classes) {
        removeClass(this.elements, classes);
    };

    this.toggleClass = function(value, stateVal) {
        return toggleClass(this.elements, value, stateVal);

    };

    return {
        addClass: addClass,
        removeClass: removeClass,
        setClass: setClass,
        hasClass: hasClass,
        toggleClass: toggleClass
    };
});

// visibility.js
hAzzle.define('Visibility', function() {

    var _style = hAzzle.require('Style'),
        _core = hAzzle.require('Core'),
        _storage = hAzzle.require('Storage'),
        iframe, doc,
        elemdisplay = {
            HTML: 'block',
            BODY: 'block'
        },

        isHidden = function(elem) {
            return _style.curCSS(elem, 'display') === 'none' || !_core.contains(elem.ownerDocument, elem);
        },

        showHide = function(elements, show) {
            var display, elem, hidden,
                values = [],
                index = 0,
                length = elements.length;

            for (; index < length; index++) {

                elem = elements[index];

                if (!elem.style) {
                    continue;
                }

                values[index] = _storage.privateData.access(elem, 'cssDisplay');
                display = elem.style.display;
                if (show) {
                    if (!values[index] && display === 'none') {
                        elem.style.display = '';
                    }

                    if (elem.style.display === '' && isHidden(elem)) {

                        values[index] = _storage.privateData.access(elem, 'cssDisplay', getDisplay(elem.nodeName));
                    }
                } else {
                    hidden = isHidden(elem);
                    if (display && display !== 'none' || !hidden) {
                        _storage.privateData.set(elem, 'cssDisplay', hidden ? display : _style.curCSS(elem, 'display'));
                    }
                }
            }

            // Set the display of most of the elements in a second loop
            // to avoid the constant reflow
            for (index = 0; index < length; index++) {
                elem = elements[index];
                if (!elem.style) {
                    continue;
                }
                if (!show || elem.style.display === 'none' || elem.style.display === '') {
                    elem.style.display = show ? values[index] || '' : 'none';
                }
            }

            return elements;
        },

        getDisplay = function(nodeName) {

            var display = elemdisplay[nodeName];

            if (!display) {

                var body = document.body,
                    elem = hAzzle('<' + nodeName + '>').appendTo(body);

                display = elem.css('display');
                elem.remove();

                if (display === 'none' || display === '') {
                    // No iframe to use yet, so create it

                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.frameBorder = iframe.width = iframe.height = 0;
                        iframe.display = 'block !important!';
                    }

                    body.appendChild(iframe);

                    if (!doc || !iframe.createElement) {
                        doc = (iframe.contentWindow || iframe.contentDocument).document;
                        // Support IE
                        doc.write('<!doctype html><html><body>');
                        doc.close();
                    }

                    elem = doc.createElement(nodeName);

                    doc.body.appendChild(elem);

                    display = _style.curCSS(elem, 'display');
                    body.removeChild(iframe);
                }

                // Store the correct default display
                elemdisplay[nodeName] = display;
            }

            return elemdisplay[nodeName];
        },

        show = function(elem) {
            return showHide(elem, true);
        },
        hide = function(elem) {
            return showHide(elem);
        };

    this.show = function() {
        return showHide(this.elements, true);
    };

    this.hide = function() {
        return showHide(this.elements);
    };


    this.toggle = function(state, /*optional*/ fn) {

        if (!fn && typeof state === 'function') {
            fn = state;
            state = '';
        } else if (typeof state === 'boolean') {
            return state ? this.show() : this.hide();
        }

        return this.each(function(elem) {
            if (isHidden(elem)) {
                hAzzle(elem).show();
            } else {
                hAzzle(elem).hide();
            }

            if (fn) {
                fn.call(elem, elem);
                // Set to false so it  get fired only once
                fn = false;
            }
        });
    };

    return {
        show: show,
        hide: hide,
        isHidden: isHidden
    };
});

// raf.js
hAzzle.define('Raf', function() {

    var nRAF,
        nCAF,
        perf = window.performance,
        perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow),
        now = perfNow ? function() {
            return perfNow.call(perf);
        } : function() { // -IE9
            return Date.now();
        },
        appleiOS = /iP(ad|hone|od).*OS (6|7)/,
        nav = window.navigator.userAgent;
    // Grab the native request and cancel functions.

    (function() {

        var top, timeLast;

        // Test if we are within a foreign domain. Use raf from the top if possible.

        try {
            // Accessing .name will throw SecurityError within a foreign domain.
            window.top.name;
            top = window.top;
        } catch (e) {
            top = window;
        }

        nRAF = top.requestAnimationFrame;
        nCAF = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;

        if (!nRAF) {

            // Get the prefixed one

            nRAF = top.webkitRequestAnimationFrame || // Chrome <= 23, Safari <= 6.1, Blackberry 10
                top.msRequestAnimationFrame ||
                top.mozRequestAnimationFrame ||
                top.msRequestAnimationFrame || function(callback) {
                    var timeCurrent = Date.now(),
                        timeDelta;

                    /* Dynamically set delay on a per-tick basis to match 60fps. */
                    /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
                    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                    timeLast = timeCurrent + timeDelta;

                    return setTimeout(function() {
                        callback(timeCurrent + timeDelta);
                    }, timeDelta);
                };

            nCAF = top.webkitCancelAnimationFrame ||
                top.webkitCancelRequestAnimationFrame ||
                top.msCancelRequestAnimationFrame ||
                top.mozCancelAnimationFrame || function(id) {
                    clearTimeout(id);
                };
        }

        nRAF && !appleiOS.test(nav) && nRAF(function() {
            RAF.hasNative = true;
        });
    }());

    function RAF(options) {

        if (!(this instanceof RAF)) {
            return new RAF.prototype.init(options);
        }

        return new RAF.prototype.init(options);
    }

    RAF.prototype = {

        constructor: RAF,

        defaultFPS: 60,

        init: function(options) {

            options = options ? options :
                typeof options == 'number' ? {
                    frameRate: options
                } : {};

            this.frameRate = options.frameRate || this.defaultFPS;
            this.frameLength = 1000 / this.frameRate;
            this.isCustomFPS = this.frameRate !== this.defaultFPS;

            // timeout ID
            this.timeoutId = null;

            // callback

            this.callbacks = {};

            // last 'tick' time

            this.lastTickTime = 0;

            // tick counter

            this.tickCounter = 0;

            // use native {Booleans}

            this.useNative = false;

            options.useNative != null || (this.useNative = true);
        },

        hasNative: false,

        request: function(callback) {

            var self = this,
                delay;

            ++this.tickCounter;

            if (RAF.hasNative && self.useNative &&
                !this.isCustomFPS) {
                return nRAF(callback);
            }

            if (!callback) {
                hAzzle.err(true, 9, 'Not enough arguments for rAF to work with');
            }

            if (this.timeoutId === null) {

                delay = this.frameLength + this.lastTickTime - Date.now();

                if (delay < 0) {
                    delay = 0;
                }

                this.timeoutId = window.setTimeout(function() {

                    var id;

                    self.lastTickTime = Date.now();
                    self.timeoutId = null;
                    self.tickCounter++;

                    for (id in self.callbacks) {

                        if (self.callbacks[id]) {

                            if (RAF.hasNative && self.useNative) {
                                nRAF(self.callbacks[id]);
                            } else {
                                self.callbacks[id](self.perfNow());
                            }

                            delete self.callbacks[id];
                        }
                    }
                }, delay);
            }

            // Need to check 'callbacks' not are undefined, else it throws
            // and nothing will work. Better to die silently!

            if (self.callbacks !== undefined) {
                self.callbacks[this.tickCounter] = callback;
                return this.tickCounter;
            }
        },

        cancel: function(id) {

            if (this.hasNative && this.useNative) {
                nCAF(id);
            }

            delete this.callbacks[id];
        },

        perfNow: function() {
            return now() - this.navigationStart;
        },

        navigationStart: Date.now()
    };

    RAF.prototype.init.prototype = RAF.prototype;

    var _raf = new RAF();

    this.requestAnimationFrame = function(fn) {
        return _raf.request(fn)
    };

    this.cancelAnimationFrame = function(id) {
        return _raf.cancel(id)
    };

    return {
        rAF: RAF,
        performanceNow: perfNow,
        pnow: now
    }
});

/**
 * DOM 4 shim / pollify for hAzzle
 *
 * This pollify covers:
 *
 * - append
 * - prepend
 * - before
 * - after
 * - replace
 * - remove
 * - matches
 */
(function(window) {

    'use strict';

    var _slice = Array.prototype.slice,
        property,

        ElementPrototype = (window.Element ||
            window.Node ||
            window.HTMLElement).prototype,

        properties = [
            'append',
            function append() {
                this.appendChild(
                    applyToFragment(arguments)
                );
            },
            'prepend',
            function prepend() {
                if (this.firstChild) {
                    this.insertBefore(
                        applyToFragment(arguments), this.firstChild
                    );
                } else {
                    this.appendChild(
                        applyToFragment(arguments)
                    );
                }
            },
            'before',
            function before() {
                var parentNode = this.parentNode;
                if (parentNode) {
                    parentNode.insertBefore(
                        applyToFragment(arguments), this
                    );
                }
            },
            'after',
            function after() {
                if (this.parentNode) {
                    if (this.nextSibling) {
                        this.parentNode.insertBefore(
                            applyToFragment(arguments), this.nextSibling
                        );
                    } else {
                        this.parentNode.appendChild(
                            applyToFragment(arguments)
                        );
                    }
                }
            },
            'replace',
            function replace() {
                if (this.parentNode) {
                    this.parentNode.replaceChild(
                        applyToFragment(arguments), this
                    );
                }
            },
            'remove',
            function remove() {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            },
            'matches', (
                ElementPrototype.matchesSelector ||
                ElementPrototype.webkitMatchesSelector ||
                ElementPrototype.mozMatchesSelector ||
                ElementPrototype.msMatchesSelector ||
                function matches(selector) {
                    var parentNode = this.parentNode;
                    return !!parentNode && -1 < indexOf.call(
                        parentNode.querySelectorAll(selector),
                        this

                    );
                }
            )
        ],
        // slice = properties.slice,
        i = properties.length;


    // Loop through
    for (; i; i -= 2) {

        property = properties[i - 2];

        if (!(property in ElementPrototype)) {
            ElementPrototype[property] = properties[i - 1];
        }
    }

    // Create TextNode if string, else
    // return the node untouched

    function stringNode(node) {
        return typeof node === 'string' ?
            window.document.createTextNode(node) : node;
    }

    // Apply the node to the fragment

    function applyToFragment(nodes) {

        var fragment = window.document.createDocumentFragment(),
            container = _slice.call(nodes, 0),
            i = 0,
            l = nodes.length;

        if (nodes.length === 1) {
            return stringNode(nodes[0]);
        }

        for (; i < l; i++) {

            try {
                fragment.appendChild(stringNode(container[i]));
            } catch (e) {}
        }

        return fragment;
    }

}(window));