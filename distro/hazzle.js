/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0d Release Candidate
 * Released under the MIT License.
 *
 * Date: 2014-11-1
 */
 
(function() {

    var
    // Quick-lookup for hAzzle(id)

        idOnly = /^#([\w\-]*)$/,

        // Holder for all modules

        modules = {},

        version = '1.0.0a-rc',

        codename = 'new-age',

        // Throws an error if `condition` is `true`.

        err = function(condition, code, message) {
            if (condition) {
                var e = new Error('[hAzzle-' + code + '] ' + message);
                e.code = code;
                throw e;
            }
        },
        // Returns an instance for `name`

        require = function(name) {
            return modules[name];
        },

        // Defines a module for `name: String`, `fn: Function`,

        define = function(name, fn) {

            // Check arguments
            err(typeof name !== 'string', 1, 'id must be a string "' + name + '"');
            err(modules[name], 2, 'module already included "' + name + '"');
            err(typeof fn !== 'function', 3, 'function body for "' + name + '" must be an function "' + fn + '"');

            modules[name] = fn.call(hAzzle.prototype);
        },

        validTypes = function(elem) {
            return elem && (elem.ELEMENT_NODE || elem.DOCUMENT_NODE);
        },

        // Define a local copy of hAzzle
        // NOTE! Everything need to be returned as an array
        // so important to wrap [] around the 'sel' to avoid
        // errors

         hAzzle = function(sel, ctx) {

            // hAzzle(), hAzzle(null), hAzzle(undefined), hAzzle(false)
            if (!sel) {
                return;
            }
            // Allow instantiation without the 'new' keyword
            if (!(this instanceof hAzzle)) {
                return new hAzzle(sel, ctx);
            }

            if (sel instanceof hAzzle) {
                return sel;
            }

            // Include required module

            var m, els, _util = hAzzle.require('Util'),
               // Document ready
                _ready = hAzzle.require('Ready');

            // If a function is given, call it when the DOM is ready

            if (typeof sel === 'function') {
                if (modules.Ready) {
                    _ready.ready(sel);
                } else {
                    err(true, 6, 'ready.js module not installed');
                }
            }

            if (typeof sel === 'string') {

                // Quick look-up for hAzzle(#id)

                if ((m = idOnly.exec(sel)) && !ctx) {
                    els = [document.getElementById(m[1])];
                }

                if (els === null || els === undefined) {

                    // The 'find' method need to have a boolean value set to 'true', to 
                    // work as expected. Else it will behave like the global .find method

                    els = this.find(sel, ctx, true);
                }
                // hAzzle([dom]) 
            } else if (isArray(sel)) {
                els = _util.unique(_util.filter(sel, validTypes));
                // hAzzle(dom)
            } else if (this.isNodeList(sel)) {
                els = _util.filter(_util.makeArray(sel), validTypes);
                // hAzzle(dom)
            } else if (sel.nodeType) {
                // If it's a html fragment, create nodes from it
                if (sel.nodeType === 11) {
                    // This children? Are they an array or not?
                    els = sel.children;
                } else {
                    els = [sel];
                }
                // window     
            } else if (sel === window) {
                els = [sel];
            } else {
                els = [];
            }

            // Create a new hAzzle collection from the nodes found
            // NOTE!! If undefined, set length to 0, and
            // elements to an empty array [] to avoid hAzzle
            // throwing errors

            if (els === undefined) {
                this.length = 0;
                this.elements = [];
            } else {
                this.elements = els;
                this.length = els.length;
            }
            return this;
        };

    // Expose

    hAzzle.err = err;
    hAzzle.installed = modules;
    hAzzle.require = require;
    hAzzle.define = define;
    hAzzle.codename = codename;
    hAzzle.version = version;

    // Hook hAzzle on the window object

    window.hAzzle = hAzzle;

}(window));

var hAzzle = window.hAzzle || (window.hAzzle = {});

// support.js'
// NOTE! support.js module are not the same as has.js, and should not be merged into one 
hAzzle.define('Support', function() {

    // Feature detection of elements
    var cls, MultipleArgs, sortDetached,
        noCloneChecked, supportBorderRadius,

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

        optSelected, radioValue,
        input = document.createElement('input'),
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    input.type = 'checkbox';

    // Support: IE<=11+

    optSelected = opt.selected;

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

    assert(function(adiv) {
        var fragment = document.createDocumentFragment(),
            div = fragment.appendChild(adiv),
            input = document.createElement('input');

        input.setAttribute('type', 'radio');
        input.setAttribute('checked', 'checked');
        input.setAttribute('name', 't');

        div.appendChild(input);

        // Support: IE<=11+
        // Make sure textarea (and checkbox) defaultValue is properly cloned
        div.innerHTML = '<textarea>x</textarea>';
        noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;

    });
    assert(function(div) {
        supportBorderRadius = div.style.borderRadius != null;
    });

    return {
        assert: assert,
        optSelected: optSelected,
        radioValue: radioValue,
        imcHTML: imcHTML,
        classList: cls,
        multipleArgs: MultipleArgs,
        sortDetached: sortDetached,
        noCloneChecked: noCloneChecked,
        cS: !!document.defaultView.getComputedStyle,
        borderRadius: supportBorderRadius
    };
});

// has.js- feature detection
hAzzle.define('has', function() {

    var
        ua = navigator.userAgent,
        win = window,
        doc = win.document,
        element = doc && doc.createElement('div'),
        _toString = Object.prototype.toString,
        hasCache = {},

        // IE feature detection
        // Props: Velocity.js 
        ie = (function() {

            if (doc.documentMode) {
                return doc.documentMode;
            } else {
                for (var i = 7; i > 4; i--) {
                    var div = doc.createElement('div');

                    div.innerHTML = '<!--[if IE ' + i + ']><span></span><![endif]-->';

                    if (div.getElementsByTagName('span').length) {
                        div = null;

                        return i;
                    }
                }
            }

            return undefined;
        })(),
        // Return the current value of the named feature
        has = function(name) {
            if (typeof hasCache[name] == 'function') {
                hasCache[name] = hasCache[name](win, doc, element);
            }
            return hasCache[name]; // Boolean
        },
        // Register a new feature test for some named feature.
        add = function(name, test, now) {
            hasCache[name] = now ? test(win, doc, element) : test;
        },
        // Deletes the contents of the element passed to test functions.
        clearElement = function(elem) {
            if (elem) {
                while (elem.lastChild) {
                    elem.removeChild(elem.lastChild);
                }
            }
            return elem;
        };

    // XPath

    add('xpath', function() {
        return !!doc.evaluate;
    });

    // Air 

    add('air', function() {
        return !!win.runtime;
    });

    // Detects native support for the Dart programming language

    add('dart', function() {
        return !!(win.startDart || doc.startDart);
    });

    // Detects native support for promises

    add('promise', function() {
        return !!win.Promise;
    });

    // mobile

    add('mobile', function() {
        return /^Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    });

    // android

    add('android', function() {
        return /^Android/i.test(ua);
    });

    // opera
    add('opera', function() {
        // Opera 8.x+ can be detected with `window.opera`
        // This is a safer inference than plain boolean type conversion of `window.opera`
        // But note that the newer Opera versions (15.x+) are using the webkit engine
        return _toString.call(window.opera) === '[object Opera]';
    });


    // Firefox
    add('firefox', function() {
        return typeof InstallTrigger !== 'undefined';
    });

    // Chrome
    add('chrome', function() {
        return win.chrome;
    });

    // Webkit
    add('webkit', function() {
        return 'WebkitAppearance' in doc.documentElement.style;
    });

    // Safari
    add('safari', function() {
        return _toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    });

    // Safari
    add('ie', function() {
        return false || !!doc.documentMode;
    });

    // Touch support

    add('touch', function() {
        return 'ontouchstart' in document ||
            ('onpointerdown' in document && navigator.maxTouchPoints > 0) ||
            window.navigator.msMaxTouchPoints;
    });

    // Touch events 

    add('touchEvents', function() {
        return 'ontouchstart' in document;
    });

    // Pointer Events

    add('pointerEvents', function() {
        return 'onpointerdown' in document;
    });

    add('MSPointer', function() {
        return 'msMaxTouchPoints' in navigator; //IE10+
    });

    return {
        has: has,
        add: add,
        clearElement: clearElement,
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
            if (value == null) {
                return true;
            }
            if (isArray(value) || isString(value) || isType('Arguments')(value)) {
                return value.length === 0;
            }
            var key;
            for (key in value)
                if (value != null && Object.prototype.hasOwnProperty.call(value, key)) {
                    return false;
                }
            return true;
        },

        isElement = function(value) {
            return (value && typeof value === 'object' && value.ELEMENT_NODE &&
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
        // This looks bad. Is it worth it?
        isWindow = function(obj) {
            return obj && obj.window === obj;
        },

        // Returns a function that returns `true` if `arg` is of the correct `type`, otherwise `false`.
        // e.g isType('Function')( fn )

        isType = function(type) {
            return type ? function(arg) {
                return _toString.call(arg) === '[object ' + type + ']';
            } : function() {};
        },

        isObject = function(value) {
            // avoid a V8 bug in Chrome 19-20
            // https://code.google.com/p/v8/issues/detail?id=2291
            var type = typeof value;
            return type === 'function' || (value && type === 'object') || false;
        },

        isPlainObject = function(obj) {
            return isType(obj) !== 'object' && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
        },

        isNode = function(elem) {
            return !!elem && typeof elem === 'object' && 'nodeType' in elem;
        },
        isNodeList = function(nodes) {
            var result = Object.prototype.toString.call(nodes);
            // Modern browser such as IE9 / firefox / chrome etc.
            if (result === '[object HTMLCollection]' || result === '[object NodeList]') {
                return true;
            }
            // Detect length and item 
            if (!('length' in nodes) || !('item' in nodes)) {
                return false;
            }
            try {
                if (nodes(0) === null || (nodes(0) && nodes(0).tagName)) return true;
            } catch (e) {
                return false;
            }
            return false;
        },
        // Trio of functions taken from Peter Michaux's article:
        // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
        isHostMethod = function(o, p) {
            var t = typeof o[p];
            return t === 'function' || (!!(t == 'object' && o[p])) || t == 'unknown';
        };

    this.isNodeList = isNodeList;

    return {

        isType: isType,
        isArray: isArray,
        isEmpty: isEmpty,
        isWindow: isWindow,
        isObject: isObject,
        isPlainObject: isPlainObject,
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
        isNodeList: isNodeList,
        isHostMethod: isHostMethod
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

        noop = function() {},

        // Short cut for `hasOwnProperty`.

        has = function(arg, id) {
            return _hasOwn.call(arg, id);
        },

        // Optimized each function
        // Replacement for forEach - ECMAScript 5 15.4.4.18 

        each = function(obj, fn, ctx, rev) {

            if (obj === undefined) {
                return obj;
            }

            if (typeof fn !== 'function') {
                hAzzle.err(true, 5, "'fn' must be a function in util.each()");
            }
            var i, length = obj.length,
                key;


            if (typeof fn == 'function' && typeof ctx === 'undefined' && typeof rev === 'undefined' && _types.isArray(obj)) {
                while (++i < length) {
                    if (fn(obj[i], i, obj) === false) {
                        break;
                    }
                }
            }
            fn = createCallback(fn, ctx);

            if (length === +length) {
                fn = createCallback(fn, ctx);

                for (i = 0; i < length; i++) {
                    // Reverse  
                    i = rev ? obj.length - i - 1 : i;
                    if (fn(obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                if (obj) {
                    for (key in obj) {
                        if (fn(obj[key], key, obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },

        // Internal function that returns an efficient (for current engines) version
        // of the passed-in callback, to be repeatedly applied in other functions.

        createCallback = function(fn, arg, argCount) {
            if (typeof fn === 'function') {
                if (arg === undefined) {
                    return fn;
                }

                var dir = !argCount ? 3 : argCount;

                return dir === 1 ? function(value) {
                        return fn.call(arg, value);
                    } : dir === 2 ?
                    function(value, other) {
                        return fn.call(arg, value, other);
                    } : dir === 3 ?
                    function(value, index, collection) {
                        return fn.call(arg, value, index, collection);
                    } : dir === 4 ?
                    function(accumulator, value, index, collection) {
                        return fn.call(arg, accumulator, value, index, collection);
                    } : function() {
                        return fn.apply(arg, arguments);
                    };

            }
            if (!fn) {
                return identity;
            }
        },
        // Faster alternative then Some - ECMAScript 5 15.4.4.17
        some = function(obj, fn, ctx) {

            if (obj) {

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

        // Extends the destination object `obj` by copying all of the 
        // properties from the `src` object(s)

        mixin = function(obj) {
            if (_types.isObject(obj)) {
                var source, prop, i = 1,
                    length = arguments.length;

                for (; i < length; i++) {
                    source = arguments[i];
                    for (prop in source) {
                        if (has(source, prop)) {
                            obj[prop] = source[prop];
                        }
                    }
                }
            }
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

        iterate = function(value, ctx, argCount) {
            if (!value) {
                return identity;
            }
            if (_types.isType('Function')(value)) {
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

            var prs = pairs(attrs),
                length = prs.length;

            return function(obj) {

                if (!obj) {
                    return !length;
                }
                obj = new Object(obj);
                var i = 0,
                    pair, key;
                for (; i < length; i++) {
                    pair = prs[i];
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
            var keys = _keys(obj),
                length = keys.length,
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

        unique = function(arr, isSorted, fn, ctx) {
            if (!arr) {
                return [];
            }
            if (_types.isBoolean(isSorted)) {
                ctx = fn;
                fn = isSorted;
                isSorted = false;
            }
            if (fn !== undefined) {
                fn = iterate(fn, ctx);
            }

            var result = [],
                seen = [],
                i = 0,
                length = arr.length;

            for (; i < length; i++) {
                var value = arr[i];
                if (isSorted) {
                    if (!i || seen !== value) {
                        result.push(value);
                    }
                    seen = value;
                } else if (fn) {
                    var computed = fn(value, i, arr);
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

        // Replacement for indexOf - ECMAScript 5 15.4.4.14

        indexOf = function(arr, item, isSorted) {

            if (arr == null) {
                return -1;
            }

            var i = 0,
                length = arr.length;

            if (isSorted) {
                if (typeof isSorted === 'number') {

                    if (isSorted < 0) {
                        i = Math.max(0, length + isSorted);
                    } else {
                        i = isSorted;
                    }

                } else {
                    i = sortedIndex(arr, item);
                    return arr[i] === item ? i : -1;
                }
            }
            for (; i < length; i++) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },

        sortedIndex = function(arr, obj, fn, ctx) {
            fn = iterate(fn, ctx, 1);
            var value = fn(obj),
                low = 0,
                high = arr.length;
            while (low < high) {
                var mid = low + high >>> 1;
                if (fn(arr[mid]) < value) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return low;
        },

        // Return the results of applying the callback to each element.
        // ECMAScript 5 15.4.4.19

        map = function(obj, fn, ctx) {
            if (obj) {
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
            }
            return [];
        },

        //  Reduces a collection
        // Replacement for reduce -  ECMAScript 5 15.4.4.21     
        reduce = function(collection, fn, accumulator, args) {

            if (!collection) {
                collection = [];
            }

            fn = createCallback(fn, args, 4);

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

        // Return the elements nodeName

        nodeName = function(el, name) {
            return el && el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
        },

        // Native solution for filtering arrays. 
        // Replacement for filter - ECMAScript 5 15.4.4.20  

        filter = function(arr, fn, ctx) {
            var results = [];
            if (!arr) {
                return results;
            }
            fn = iterate(fn, ctx);
            each(arr, function(val, index, list) {
                if (fn(val, index, list)) {
                    results.push(val);
                }
            });
            return results;
        },

        // Bind a function to a ctx, optionally partially applying any
        // Replacement for bind() - ECMAScript 5 15.3.4.5

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

        // extend
        extend = function(target, source, deep) {
            var key;
            for (key in source)

                if (deep && (_types.isPlainObject(source[key]) || _types.isArray(source[key]))) {
                if (_types.isPlainObject(source[key]) && !_types.isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (_types.isArray(source[key]) && !_types.isArray(target[key])) {
                    target[key] = [];
                }
                extend(target[key], source[key], deep);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        },
        // Check if a element exist in DOM
        isInDocument = function(el) {
            if (!el) {
                return;
            }
            for (var pn = el, html = document.body.parentNode; pn;) {
                if (pn === html) {
                    return true;
                }
                pn = pn.parentNode;
            }
            return false;
        },
        // Faster 'instanceOf' then the native one
        instanceOf = function(item, object) {
            if (item == null) {
                return false;
            }
            var constructor = item.$constructor || item.constructor;
            while (constructor) {
                if (constructor === object) {
                    return true;
                }
                constructor = constructor.parent;
            }
            return item instanceof object;
        };

    return {
        each: each,
        mixin: mixin,
        makeArray: makeArray,
        merge: merge,
        nodeName: nodeName,
        unique: unique,
        indexOf: indexOf,
        instanceOf: instanceOf,
        filter: filter,
        map: map,
        some: some,
        reduce: reduce,
        now: Date.now,
        bind: bind,
        has: has,
        noop: noop,
        extend: extend,
        isInDocument: isInDocument
    };
});
// core.js
hAzzle.define('Core', function() {

    var winDoc = window.document,
        docElem = winDoc.documentElement,
        _support = hAzzle.require('Support'),
        _indexOf = Array.prototype.indexOf,
        _rnative = /^[^{]+\{\s*\[native \w/,
        _matches,
        _CoreCache = {},
        _hasDuplicate,
        _sortInput,
        sortOrder = function(a, b) {
            if (a === b) {
                _hasDuplicate = true;
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

        Core = {

            uidX: 1,
            uidK: 'hAzzle_id',
            expando: 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),

            // Check if this is XML doc or not

            isXML: function(elem) {
                var documentElement = elem && (elem.ownerDocument || elem).documentElement;

                if (documentElement) {
                    return documentElement.nodeName !== 'HTML'
                } else {
                    return false;
                }
            },

            // Get unique XML document ID

            xmlID: function(elem) {
                var uid = elem.getAttribute(this.uidK);

                if (!uid) {
                    uid = this.uidX++;
                    elem.setAttribute(this.uidK, uid);
                }
                return uid;
            },

            // Get unique HTML document ID

            htmlID: function(elem) {
                return elem.uniqueNumber ||
                    (elem.uniqueNumber = this.uidX++);
            },

            native: _rnative.test(docElem.compareDocumentPosition),
            // Set document

            setDocument: function(document) {

                // convert elements / window arguments to document. if document cannot be extrapolated, the function returns.
                var nodeType = document.nodeType,
                    doc = document ? document.ownerDocument || document : winDoc;

                if (nodeType === 9) { // document

                } else if (nodeType) {
                    doc = document.ownerDocument; // node
                } else if (document.navigator) {
                    doc = document.document; // window
                } else {
                    return;
                }

                // Check if it's the old document

                if (this.document === doc) {
                    return;
                }
                // Override default window.document, and set our document

                document = doc;
                this.document = doc;

                var root = document.documentElement,
                    rootID = this.xmlID(root),
                    features = _CoreCache[rootID],
                    feature;

                // Don't run feature detection twice

                if (features) {
                    for (feature in features) {
                        this[feature] = features[feature];
                    }
                    return;
                }

                features = _CoreCache[rootID] = {};
                features.root = root;
                features.isXMLDocument = this.isXML(document);
                features.detectDuplicates = !!_hasDuplicate;
                features.sortStable = Core.expando.split('').sort(sortOrder).join('') === Core.expando;

                // On non-HTML documents innerHTML and getElementsById doesnt work properly
                _support.assert(function(div) {
                    div.innerHTML = '<a id="hAzzle_id"></a>';
                    features.isHTMLDocument = !!document.getElementById('hAzzle_id');
                });

                // If HTML document

                if (!Core.isXML(root)) {

                    // Check if getElementsByTagName('*') returns only elements
                    features.getElementsByTagName = _support.assert(function(div) {
                        div.appendChild(doc.createComment(''));
                        return !div.getElementsByTagName('*').length;
                    }); // IE returns elements with the name instead of just id for getElementsById for some documents
                    features.getById = _support.assert(function(div) {
                        div.innerHTML = '<a name="hAzzle_id"></a><b id="hAzzle_id"></b>';
                        return document.getElementById('hAzzle_id') === div.firstChild;
                    });

                    var rbuggyMatches = Core.rbuggyMatches = [],
                        rbuggyQSA = Core.rbuggyQSA = [];

                    if ((_support.qsa = _rnative.test(doc.querySelectorAll))) {
                        // Build QSA regex
                        // Regex strategy adopted from Diego Perini
                        _support.assert(function(div) {
                            div.innerHTML = "<select msallowcapture=''><option selected=''></option></select>";

                            // Webkit/Opera - :checked should return selected option elements
                            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                            if (!div.querySelectorAll(':checked').length) {
                                rbuggyQSA.push(':checked');
                            }
                        });
                    }

                    if ((features._matchesSelector = _rnative.test((_matches = docElem._matches ||
                            docElem.webkitMatchesSelector ||
                            docElem.mozMatchesSelector ||
                            docElem.oMatchesSelector ||
                            docElem.msMatchesSelector)))) {

                        _support.assert(function(div) {
                            // Check to see if it's possible to do _matchesSelector
                            // on a disconnected node (IE 9)
                            Core.disconnectedMatch = _matches.call(div, 'div');
                        });
                    }

                    rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join('|'));
                    rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join('|'));
                }

                // Contains

                features.contains = Core.native || Core.native.test(docElem.contains) ?
                    function(a, b) {
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
                Core.sortOrder = Core.native ?
                    function(a, b) {

                        // Flag for duplicate removal
                        if (a === b) {
                            _hasDuplicate = true;
                            return 0;
                        }

                        // Sort on method existence if only one input has compareDocumentPosition
                        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                        if (compare) {
                            return compare;
                        }

                        // Calculate position if both inputs belong to the same document
                        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
                            a.compareDocumentPosition(b) : 1;

                        // Disconnected nodes
                        if (compare & 1 ||
                            (!_support.sortDetached && b.compareDocumentPosition(a) === compare)) {

                            // Choose the first element that is related to our preferred document
                            if (a === doc || a.ownerDocument === winDoc && Core.contains(winDoc, a)) {
                                return -1;
                            }
                            if (b === doc || b.ownerDocument === winDoc && Core.contains(winDoc, b)) {
                                return 1;
                            }

                            // Maintain original order
                            return _sortInput ?
                                (_indexOf.call(_sortInput, a) - _indexOf.call(_sortInput, b)) :
                                0;
                        }

                        return compare & 4 ? -1 : 1;
                    } :
                    function(a, b) {
                        // Exit early if the nodes are identical
                        if (a === b) {
                            _hasDuplicate = true;
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
                                _sortInput ?
                                (_indexOf.call(_sortInput, a) - _indexOf.call(_sortInput, b)) :
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
    // Set correct sortOrder

    sortOrder = Core.sortOrder;

    // Set document

    Core.setDocument(winDoc);

    function uniqueSort(results) {

        var elem,
            duplicates = [],
            j = 0,
            i = 0;

        _hasDuplicate = !Core.detectDuplicates;
        _sortInput = !Core.sortStable && results.slice(0);
        results.sort(sortOrder);

        if (_hasDuplicate) {
            while ((elem = results[i++])) {
                if (elem === results[i]) {
                    j = duplicates.push(i);
                }
            }
            while (j--) {
                results.splice(duplicates[j], 1);
            }
        }

        _sortInput = null;

        return results;
    }

    return {
        root: Core.root,
        isXML: Core.isXML,
        isHTML: !Core.isXML(winDoc),
        expando: Core.expando,
        uniqueSort: uniqueSort,
        contains: Core.contains,
        rbuggyQSA: Core.rbuggyQSA
    };
});
// collection.js
hAzzle.define('Collection', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _arrayProto = Array.prototype,
        _concat = _arrayProto.concat,
        _push = _arrayProto.push,

        makeArray = function(arr, results) {
            var ret = results || [];
            if (arr !== undefined) {
                if (_types.isArrayLike(Object(arr))) {
                    _util.merge(ret, _types.isString(arr) ? [arr] : arr);
                } else {
                    _push.call(ret, arr);
                }
            }

            return ret;
        },



        slice = function(array, start, end) {
            if (typeof start === 'undefined') {
                start = 0;
            }
            if (typeof end === 'undefined') {
                end = array ? array.length : 0;
            }
            var index = -1,
                length = end - start || 0,
                result = Array(length < 0 ? 0 : length);

            while (++index < length) {
                result[index] = array[start + index];
            }
            return result;
        };

    /* ------------- INTERNAL ARRAY METHODS ------------------------------- */

    // Convert hAzzle '.elements Array' to a jQuery / Zepto array
    // where 'this' contains the elements. The '.elements Array 
    // will be kept, but it will be possible to run jQuery / Zepto functions

    this.toJqueryZepto = function() {
        var i = this.length,
            els = this.elements;
        while (i--) {
            this[i] = els[i];
        }
        return this;
    };

    // Return an array or a specific DOM element matched by the hAzzle object

    this.get = function(index) {
        var result;
        if (index === undefined) {
            result = slice(this.elements, 0);
        } else if (index < 0) {
            result = this.elements[this.length + index];
        } else {
            result = this.elements[index];
        }
        return result;
    };

    // Get the element at position specified by index from the current collection.
    this.eq = function(index) {
        return hAzzle(index === -1 ? slice(this.elements, this.length - 1) : slice(this.elements, index, index + 1));
    };

    this.reduce = function(fn, accumulator, args) {
        return _util.reduce(this.elements, fn, accumulator, args);
    };

    this.indexOf = function(elem, arr, i) {
        return arr == null ? -1 : _arrayProto.indexOf.call(arr, elem, i);
    };

    this.map = function(fn, args) {
        return hAzzle(_util.map(this.elements, fn, args));
    };

    this.each = function(fn, args, rev) {
        _util.each(this.elements, fn, args, rev);
        return this;
    };

    this.slice = function(start, end) {
        return new hAzzle(slice(this.elements, start, end));
    };

    // Concatenate two elements lists

    this.concat = function() {
        var args = _util.map(slice(arguments), function(arr) {
            return arr instanceof hAzzle ? arr.elements : arr;
        });
        return hAzzle(_concat.apply(this.elements, args));
    };

    // Check the current matched set of elements against a selector, element, or 
    // hAzzle object and return true if at least one of these elements matches the given arguments.

    this.is = function(sel) {
        return this.length > 0 && this.filter(sel).length > 0;
    };

    // Remove elements from the set of matched elements

    this.not = function(sel) {
        return this.filter(sel, true);
    };

    // Determine the position of an element within the set

    this.index = function(node) {
        var els = this.elements;
        if (!node) {
            return (els[0] && els[0].parentElement) ? this.first().prevAll().length : -1;
        }

        // Index in selector
        if (typeof node === 'string') {
            return _util.indexOf(hAzzle(node).elements, els[0]);
        }

        // Locate the position of the desired element
        return _util.indexOf(els, node instanceof hAzzle ? node.elements[0] : node);
    };
    // Concatenate new elements to the '.elements array
    // Similar to jQuery / Zepto .add() method

    this.add = function(sel, ctx) {
        var elements = sel;
        if (typeof sel === 'string') {
            elements = hAzzle(sel, ctx).elements;
        }
        return this.concat(elements);
    };

    // Reduce the set of matched elements to the first in the set, or 
    // to the 'num' first element in the set

    this.first = function(num) {
        return num ? this.slice(0, num) : this.eq(0);
    };

    // Reduce the set of matched elements to the final one in the set, or 
    // to the 'num' last element in the set
    this.last = function(num) {
        return num ? this.slice(this.length - num) : this.eq(-1);
    };

    // Return 'even' elements from the '.elements array'
    this.even = function() {
        return this.filter(function(index) {
            return index % 2 !== 0;
        });
    };
    // Return 'odd' elements from the '.elements array'
    this.odd = function() {
        return this.filter(function(index) {
            return index % 2 === 0;
        });
    };

    // First() and prev()
    _util.each({
        next: 'nextElementSibling',
        prev: 'previousElementSibling'
    }, function(value, prop) {
        this[prop] = function(sel) {
            return this.map(function(elem) {
                return elem[value];
            }).filter(sel);
        };
    }.bind(this));

    // prevAll() and nextAll()
    _util.each({
        prevAll: 'previousElementSibling',
        nextAll: 'nextElementSibling'
    }, function(value, prop) {
        this[prop] = function() {
            var matched = [];
            this.each(function(elem) {
                while ((elem = elem[value]) && elem.nodeType !== 9) {
                    matched.push(elem);
                }
            });
            return hAzzle(matched);
        };
    }.bind(this));


    return {
        makeArray: makeArray,
        slice: slice
    };
});
// jiesa.js
hAzzle.define('Jiesa', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _collection = hAzzle.require('Collection'),
        _support = hAzzle.require('Support'),
        _relativeSel = /^\s*[+~]/,
        _reSpace = /[\n\t\r]/g,
        _idClassTagNameExp = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
        _tagNameAndOrIdAndOrClassExp = /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/,
        _unionSplit = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g,

        // http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]",

        rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
        docElem = window.document.documentElement,

        _matches = docElem.matches ||
        docElem.webkitMatchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector,

        fixedRoot = function(context, query, method) {
            var oldContext = context,
                old = context.getAttribute('id'),
                nid = old || '__hAzzle__',
                hasParent = context.parentNode,
                relativeHierarchySelector = _relativeSel.test(query);

            if (relativeHierarchySelector && !hasParent) {
                return [];
            }
            if (!old) {
                context.setAttribute('id', nid);
            } else {
                nid = nid.replace(/'/g, '\\$&');
            }
            if (relativeHierarchySelector && hasParent) {
                context = context.parentNode;
            }
            var selectors = query.match(_unionSplit);
            for (var i = 0; i < selectors.length; i++) {
                selectors[i] = "[id='" + nid + "'] " + selectors[i];
            }
            query = selectors.join(",");

            try {
                return method.call(context, query);
            } finally {
                if (!old) {
                    oldContext.removeAttribute('id');
                }
            }
        },

        matchesSelector = function(elem, sel, ctx) {

            if (ctx && ctx.nodeType !== 9) {
                // doesn't support three args, use rooted id trick
                return fixedRoot(ctx, sel, function(query) {
                    return _matches(elem, query);
                });
            }
            // we have a native matchesSelector, use that
            return _matches.call(elem, sel);
        },

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

        containsClass = function(el, klass) {
            if (_support.classList) {
                return el.classList.contains(klass);
            } else {
                return (' ' + el.className + ' ').replace(_reSpace, ' ').indexOf(klass) >= 0;
            }
        },

        normalizeCtx = function(root) {
            if (!root) {
                return document;
            }
            if (typeof root === 'string') {
                return Jiesa(root);
            }
            if (!root.nodeType && arrayLike(root)) return root[0]
            return root
        },
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

        Jiesa = function(sel, ctx) {
            var m, nodeType, elem, results = [];

            ctx = normalizeCtx(ctx);

            if (!sel || typeof sel !== 'string') {
                return results;
            }

            if ((nodeType = ctx.nodeType) !== 1 && nodeType !== 9 && nodeType !== 11) {
                return [];
            }

            // Split selectors by comma if it's exists.
            if (_util.indexOf(sel, ',') !== -1 && (m = sel.split(','))) {
                // Comma separated selectors. E.g $('p, a');
                // unique result, e.g 'ul id=foo class=foo' should not appear two times.
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

                if ((m = _idClassTagNameExp.exec(sel))) {
                    if ((sel = m[1])) {
                        if (nodeType === 9) {
                            elem = ctx.getElementById(sel);
                            if (elem && elem.id === sel) {
                                return [elem];
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
                } else if ((m = _tagNameAndOrIdAndOrClassExp.exec(sel))) {
                    var result = ctx.getElementsByTagName(m[1]),
                        id = m[2],
                        className = m[3];
                    _util.each(result, function(el) {
                        if (el.id === id || containsClass(el, className)) {
                            results.push(el);
                        }
                    });
                    return results;
                } else { // Fallback to QSA  

                    // NOTE! QSA are temporary. In v. 1.1 QSA will be gone
                    if (_support.qsa && _core.rbuggyQSA.length) {
                        if (ctx.nodeType === 1 && ctx.nodeName.toLowerCase() !== 'object') {
                            return _collection.slice(fixedRoot(ctx, sel, ctx.querySelectorAll));
                        } else {
                            // we can use the native qSA
                            return _collection.slice(ctx.querySelectorAll(sel));
                        }
                    }
                }
            }
        },
        matches = function(elem, sel, ctx) {

            if (sel.nodeType) {
                return elem === sel;
            }
            // Set document vars if needed
            if ((elem.ownerDocument || elem) !== document) {
                _core.setDocument(elem);
            }

            // Make sure that attribute selectors are quoted
            sel = typeof sel === 'string' ? sel.replace(rattributeQuotes, "='$1']") : sel;

            // If instance of hAzzle

            if (sel instanceof hAzzle) {
                return _util.some(sel.elements, function(sel) {
                    return matches(elem, sel);
                });
            }

            if (elem === document) {
                return false;
            }


            if (_core && _core.isHTML) {

                try {
                    var ret = matchesSelector(elem, sel, ctx);

                    // IE 9's matchesSelector returns false on disconnected nodes
                    if (ret || _core.disconnectedMatch ||
                        // As well, disconnected nodes are said to be in a document
                        // fragment in IE 9
                        elem.document && elem.document.nodeType !== 11) {
                        return ret;
                    }
                } catch (e) {}
            }
            // FIX ME!! Fallback solution need to be developed here!
        };

    // Find is not the same as 'Jiesa', but a optimized version for 
    // better performance

    this.find = function(selector, context, /*internal*/ internal) {

        // Only for use by hAzzle.js module

        if (internal) {
            return Jiesa(selector, context);
        }

        if (typeof selector === 'string') {

            // Single look-up should always be faster then multiple look-ups

            if (this.length === 1) {
                return hAzzle(Jiesa(selector, this.elements[0]));
            } else {
                return _util.reduce(this.elements, function(els, element) {
                    return hAzzle(els.concat(_collection.slice(Jiesa(selector, element))));
                }, []);
            }
        }

        var i,
            len = this.length,
            self = this.elements;

        return hAzzle(_util.filter(hAzzle(selector).elements, function(node) {
            for (i = 0; i < len; i++) {
                if (_core.contains(self[i], node)) {
                    return true;
                }
            }
        }));
    };

    // Filter element collection

    this.filter = function(selector, not) {

        if (selector === undefined) {
            return this;
        }
        if (typeof selector === 'function') {
            var els = [];
            this.each(function(el, index) {
                if (selector.call(el, index)) {
                    els.push(el);
                }
            });

            return hAzzle(els);

        } else {
            return this.filter(function() {
                return matchesSelector(this, selector) != (not || false);
            });
        }
    };

    return {
        matchesSelector: matchesSelector,
        matches: matches,
        find: Jiesa
    };
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
                var parentElement = this.parentElement;
                if (parentElement) {
                    parentElement.insertBefore(
                        applyToFragment(arguments), this
                    );
                }
            },
            'after',
            function after() {
                if (this.parentElement) {
                    if (this.nextSibling) {
                        this.parentElement.insertBefore(
                            applyToFragment(arguments), this.nextSibling
                        );
                    } else {
                        this.parentElement.appendChild(
                            applyToFragment(arguments)
                        );
                    }
                }
            },
            'replace',
            function replace() {
                if (this.parentElement) {
                    this.parentElement.replaceChild(
                        applyToFragment(arguments), this
                    );
                }
            },
            'remove',
            function remove() {
                if (this.parentElement) {
                    this.parentElement.removeChild(this);
                }
            },
            'matches', (
                ElementPrototype.matchesSelector ||
                ElementPrototype.webkitMatchesSelector ||
                ElementPrototype.mozMatchesSelector ||
                ElementPrototype.msMatchesSelector ||
                // FIX ME!! Need a better solution for this in hAzzle
                function matches(selector) {
                    var parentElement = this.parentElement;
                    return !!parentElement && -1 < indexOf.call(
                        parentElement.querySelectorAll(selector),
                        this
                    );
                }
            )
        ],
        // slice = properties.slice,
        i = properties.length;

    // Loop through
    for (; i; i -= 2) {
        if (!(properties[i - 2] in ElementPrototype)) {
            ElementPrototype[properties[i - 2]] = properties[i - 1];
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