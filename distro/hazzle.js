/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0c Release Candidate
 * Released under the MIT License.
 *
 * Date: 2014-10-26
 */
(function() {

    var
    // Quick-lookup for hAzzle(id)

        idOnly = /^#([\w\-]*)$/,

        // Holder for all modules

        modules = {},

        // Keep track of installed modules. Hopefully people won't spoof this... would be daft.

        installed = {},

        version = {
            full: '1.0.0a-rc',
            major: 1,
            minor: 0,
            dot: 0,
            codeName: 'new-age'
        },

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

            // append to module object
            installed[name] = true;

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

            var m, _util = hAzzle.require('Util'),
                _ready = hAzzle.require('Ready');

            // If a function is given, call it when the DOM is ready

            if (typeof sel === 'function') {
                if (installed.Ready) {
                    _ready.ready(sel);
                } else {
                    err(true, 6, 'ready.js module not installed');
                }
            }

            if (typeof sel === 'string') {

                // Quick look-up for hAzzle(#id)

                if ((m = idOnly.exec(sel)) && !ctx) {
                    this.elements = [document.getElementById(m[1])];
                }

                if (this.elements === null || this.elements === undefined) {

                    // The 'find' method need to have a boolean value set to 'true', to 
                    // work as expected. Else it will behave like the global .find method

                    this.elements = this.find(sel, ctx, true);
                }
                // hAzzle([dom]) 
            } else if (sel instanceof Array) {
                this.elements = _util.unique(_util.filter(sel, validTypes));
                // hAzzle(dom)
            } else if (this.isNodeList(sel)) {
                this.elements = _util.filter(_util.makeArray(sel), validTypes);
                // hAzzle(dom)
            } else if (sel.nodeType) {
                // If it's a html fragment, create nodes from it
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

            // Create a new hAzzle collection from the nodes found
            // NOTE!! If undefined, set length to 0, and
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

    // Expose

    hAzzle.version = version.full;
    hAzzle.err = err;
    hAzzle.installed = installed;
    hAzzle.require = require;
    hAzzle.define = define;

    // Hook hAzzle on the window object

    window.hAzzle = hAzzle;

}(window));

var hAzzle = window.hAzzle || (window.hAzzle = {});

// support.js'
// NOTE! support.js module are not the same as has.js, and should not be merged into one 
hAzzle.define('Support', function() {

    // Feature detection of elements
    var cls, MultipleArgs, sortDetached,
        noCloneChecked,

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

    return {
        assert: assert,
        optSelected: optSelected,
        radioValue: radioValue,
        imcHTML: imcHTML,
        classList: cls,
        multipleArgs: MultipleArgs,
        sortDetached: sortDetached,
        noCloneChecked: noCloneChecked,
        cS: !!document.defaultView.getComputedStyle
    };
});

// has.js- feature detection
hAzzle.define('has', function() {

    var
        ua = navigator.userAgent,
        win = window,
        doc = win.document,
        element = doc && doc.createElement('div'),
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
               if(typeof hasCache[name] == 'function'){
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
        return !!(doc.evaluate);
    });

    // Air 

    add('air', function() {
        return !!(win.runtime);
    });

    // Detects native support for the Dart programming language

    add('dart', function() {
        return !!(win.startDart || doc.startDart);
    });

    // Detects native support for promises

    add('promise', function() {
        return !!(win.Promise);
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
        return !!win.opera || ua.indexOf(' OPR/') >= 0;
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
        return Object.prototype.toString.call(win.HTMLElement).indexOf('Constructor') > 0;
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
            // Take a shortcut if this is a instanceof hAzzle 
            if (value instanceof hAzzle && value.length > 0) {
                return false;
            } else {
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
            }
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
        isFunction: isType('Function'),
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
// text.js
hAzzle.define('Text', function() {

    var getText = function(elem) {

        if (elem) {

            var node, text = '',
                i = 0,
                l = elem.length,
                etc, nodetype = elem.nodeType;

            if (!nodetype) {

                for (; i < l; i++) {

                    node = elem[i++];

                    ///Skip comments.
                    if (node.nodeType !== 8) {
                        text += getText(node);
                    }
                }

            } else if (nodetype === 1 ||
                nodetype === 9 ||
                nodetype === 11) {

                etc = elem.textContent;

                if (typeof etc === 'string') {
                    return elem.textContent;
                } else {

                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        text += getText(elem);
                    }
                }
            } else if (nodetype === 3 || nodetype === 4) { // Text or CDataSection

                // Use nodedValue so we avoid that <br/> tags e.g, end up in
                // the text as any sort of line return.

                return elem.nodeValue;
            }
            return text;
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

            fn = createCallback(fn, ctx);

            var i, length = obj.length;

            if (length === +length) {
                for (i = 0; i < length; i++) {
                    // Reverse  
                    i = rev ? obj.length - i - 1 : i;
                    if (fn(obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                if (obj) {
                    var key;
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

        createCallback = function(func, ctx, argCount) {
            if (typeof func === 'function') {
                if (ctx === undefined) {
                    return func;
                }

                var dir = !argCount ? 3 : argCount;

                return dir === 1 ? function(value) {
                        return func.call(ctx, value);
                    } : dir === 2 ?
                    function(value, other) {
                        return func.call(ctx, value, other);
                    } : dir === 3 ?
                    function(value, index, collection) {
                        return func.call(ctx, value, index, collection);
                    } : dir === 4 ?
                    function(accumulator, value, index, collection) {
                        return func.call(ctx, accumulator, value, index, collection);
                    } : function() {
                        return func.apply(ctx, arguments);
                    };

            }
            if (!func) {
                return identity;
            }
        },
        // Faster alternative then Some - ECMAScript 5 15.4.4.17
        some = function(obj, fn, ctx) {

            if (!obj) {
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

        // Extends the destination object `obj` by copying all of the 
        // properties from the `src` object(s)

        mixin = function(obj) {
            if (!_types.isObject(obj)) {

                return obj;
            }

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

        isElement = function(element) {
            return element && (element.nodeType === 1 || element.nodeType === 9);
        },

        iterate = function(value, ctx, argCount) {
            if (!value) {
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

        // Determines whether an object can have data

        acceptData = function(owner) {
            return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
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
        reject = function(a, fn, scope) {
            var r = [],
                i = 0,
                j = 0,
                l = a.length;
            for (; i < l; i++) {
                if (i in a) {
                    if (fn.call(scope, a[i], i, a)) {
                        continue;
                    }
                    r[j++] = a[i];
                }
            }
            return r;
        },
        consoleLog = function(msg) {
            if (typeof console !== 'undefined' && _types.isHostMethod(console, 'log')) {
                console.log(msg);
            }
        }

    return {
        each: each,
        mixin: mixin,
        makeArray: makeArray,
        merge: merge,
        acceptData: acceptData,
        createCallback: createCallback,
        isElement: isElement,
        nodeName: nodeName,
        unique: unique,
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
        noop: function() {},
        extend: extend,
        reject: reject,
        consoleLog: consoleLog
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
        _keys = Object.keys,
        _concat = _arrayProto.concat,
        _push = _arrayProto.push,
        inArray = function(elem, array, i) {
            return array === undefined ? -1 : _arrayProto.indexOf.call(array, elem, i);
        },
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

        //  Reduces a collection
        // Replacement for reduce -  ECMAScript 5 15.4.4.21     
        reduce = function(collection, fn, accumulator, args) {

            if (!collection) {
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
        return index === -1 ? hAzzle(slice(this.elements, this.length - 1)) : hAzzle(slice(this.elements, index, index + 1));
    };

    this.reduce = function(fn, accumulator, args) {
        return reduce(this.elements, fn, accumulator, args);
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
        slice: slice,
        reduce: reduce,
        inArray: inArray
    };
});

// jiesa.js
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

        // Holder for pseudo selectors

        pseudos = {},

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
            var selectors = query.match(_unionSplit),
                i = 0;
            for (; i < selectors.length; i++) {
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
                    if (_support.qsa && !_core.rbuggyQSA.length) {
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
        matches = function(elem, sel) {

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

                // Do a quick lookup and check for pseudo selectors directly without
                // touching the DOM

                if (pseudos[sel]) {

                    return pseudos[sel](elem)

                } else {

                    try {
                        var ret = matchesSelector(elem, sel);

                        // IE 9's matchesSelector returns false on disconnected nodes
                        if (ret || _core.disconnectedMatch ||
                            // As well, disconnected nodes are said to be in a document
                            // fragment in IE 9
                            elem.document && elem.document.nodeType !== 11) {
                            return ret;
                        }
                    } catch (e) {}
                }
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
                return _collection.reduce(this.elements, function(els, element) {
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

    this.filter = function(sel, not) {

        if (sel === undefined) {
            return this;
        }

        var elems = this.elements,
            ret = [];
        if (typeof sel === 'function') {
            this.each(function(elem, index) {
                if (sel.call(elem, index, elem)) {
                    ret.push(elem);
                }
            });
        } else if (typeof sel === 'string') {
            // Single element lookup are faster then multiple elements
            if (this.length === 1 && elems[0].nodeType === 1) {
                return hAzzle(matchesSelector(elems[0], sel));
            } else {
                _util.each(elems, function(elem) {

                    if (matches(elem, sel) !== (not || false) && elem.nodeType === 1) {
                        ret.push(elem);
                    }
                });
            }
            return hAzzle(ret);
        }
    };

    return {
        matchesSelector: matchesSelector,
        matches: matches,
        pseudos: pseudos,
        find: Jiesa
    };
});
// pseudos.js
hAzzle.define('pseudos', function() {

    var _util = hAzzle.require('Util'),
        _jiesa = hAzzle.require('Jiesa');

    _util.mixin(_jiesa.pseudos, {

        ':hidden': function(elem) {

            var style = elem.style;
            if (style) {
                if (style.display === 'none' ||
                    style.visibility === 'hidden') {
                    return true;
                }
            }
            return elem.type === 'hidden';
        },

        ':visible': function(elem) {
            return !_jiesa.pseudos[':hidden'](elem);

        },
        ':active': function(elem) {
            return elem === document.activeElement;
        },

        ':empty': function(elem) {
            // DomQuery and jQuery get this wrong, oddly enough.
            // The CSS 3 selectors spec is pretty explicit about it, too.
            var cn = elem.childNodes,
                cnl = elem.childNodes.length,
                nt,
                x = cnl - 1;

            for (; x >= 0; x--) {

                nt = cn[x].nodeType;

                if ((nt === 1) || (nt === 3)) {
                    return false;
                }
            }
            return true;
        },
        ':text': function(elem) {
            var attr;
            return elem.nodeName.toLowerCase() === 'input' &&
                elem.type === 'text' &&
                ((attr = elem.getAttribute('type')) === null ||
                    attr.toLowerCase() === 'text');
        },
        ':button': function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === 'input' && elem.type === 'button' ||
                name === 'button';
        },
        ':input': function(elem) {
            return /^(?:input|select|textarea|button)$/i.test(elem.nodeName);
        },
        ':selected': function(elem) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (elem.parentNode) {
                elem.parentNode.selectedIndex;
            }
            return elem.selected === true;
        }
    });

    // Add button/input type pseudos

    _util.each({
        radio: true,
        checkbox: true,
        file: true,
        password: true,
        image: true
    }, function(value, prop) {
        _jiesa.pseudos[':' + prop] = createInputPseudo(prop);
    });

    _util.each({
        submit: true,
        reset: true
    }, function(value, prop) {
        _jiesa.pseudos[':' + prop] = createButtonPseudo(prop);
    });

    function createInputPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === 'input' && elem.type === type.toLowerCase();
        };
    }

    function createButtonPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return (name === 'input' || name === 'button') && elem.type === type.toLowerCase();
        };
    }

    function createDisabledPseudo(disabled) {
        return function(elem) {
            return (disabled || 'label' in elem || elem.href) && elem.disabled === disabled ||
                'form' in elem && elem.disabled === false && (
                    elem.isDisabled === disabled ||
                    elem.isDisabled !== !disabled &&
                    ('label' in elem) !== disabled
                );
        };
    }
    _jiesa.pseudos[':enabled'] = createDisabledPseudo(false);
    _jiesa.pseudos[':disabled'] = createDisabledPseudo(true);
    return {};
});

// strings.js
hAzzle.define('Strings', function() {
    var
    // Aliasing to the native function

        nTrim = String.prototype.trim,

        // Support: Android<4.1

        nNTrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

        // Hyphenate RegExp

        sHyphenate = /[A-Z]/g,

        // Capitalize RegExp

        sCapitalize = /\b[a-z]/g,

        // UnescapeHTML RegExp

        unEscapeFirst = /^#x([\da-fA-F]+)$/,

        // UnescapeHTML RegExp

        unEscapeLast = /^#(\d+)$/,

        // escapeHTML regExp

        escHTML = /[&<>"']/g,

        // Microsoft RegExp

        msPrefix = /^-ms-/,

        // camlize RegExp

        dashAlpha = /-([\da-z])/gi,

        // Cache array for hAzzle.camelize()

        camelCache = [],

        escapeMap = {
            lt: '<',
            gt: '>',
            quot: '"',
            apos: "'",
            amp: '&'
        },

        reversedescapeMap = {},

        // Used by capitalize as callback to replace()

        fcapitalize = function(letter) {
            return letter.toUpperCase();
        },

        // Used by camelize as callback to replace()

        fcamelize = function(all, letter) {
            return letter.toUpperCase();
        },
        // Used by hyphenate as callback to replace()

        fhyphenate = function(letter) {
            return ('-' + letter.charAt(0).toLowerCase());
        },

        capitalize = function(str) {
            return str ? str.replace(sCapitalize, fcapitalize) : str;
        },

        // Convert a string from camel case to 'CSS case', where word boundaries are
        // described by hyphens ('-') and all characters are lower-case.
        // e.g. boxSizing -> box-sizing

        hyphenate = function(str) {
            if (typeof str === 'string') {
                return str ? str.replace(sHyphenate, fhyphenate) : str;
            } else {
                str = typeof str === 'number' ? '' + str : '';
            }
            return str ? ('data-' + str.toLowerCase()) : str;
        },

        // Convert a string to camel case notation.
        // Support: IE9-11+
        camelize = function(str) {
            if (str && typeof str === 'string') {

                return camelCache[str] ? camelCache[str] :
                    // Remove data- prefix and convert remaining dashed string to camelCase
                    camelCache[str] = str.replace(msPrefix, "ms-").replace(dashAlpha, fcamelize); // -a to A
            }
            // Deal with 'number' and 'boolean'
            return typeof str === 'number' || typeof str === 'boolean' ? '' + str : str;
        },

        // Remove leading and trailing whitespaces of the specified string.

        trim = function(str) {
            return str == null ? '' : nTrim ? (typeof str === 'string' ? str.trim() : str) :
                // Who are still using Android 4.1 ?
                (str + '').replace(nNTrim, '');
        },
        truncate = function(str, length, truncateStr) {
            if (!str) {
                return '';
            }
            str = String(str);
            truncateStr = truncateStr || '...';
            length = ~~length;
            return str.length > length ? str.slice(0, length) + truncateStr : str;
        },
        escapeHTML = function(str) {
            return str.replace(escHTML, function(m) {
                return '&' + reversedescapeMap[m] + ';';
            });
        },
        unescapeHTML = function(str) {
            return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
                var m;
                if (entityCode in escapeMap) {
                    return escapeMap[entityCode];
                } else if ((m = entityCode.match(unEscapeFirst))) {
                    return String.fromCharCode(parseInt(m[1], 16));
                } else if ((m = entityCode.match(unEscapeLast))) {
                    return String.fromCharCode(~~m[1]);
                } else {
                    return entity;
                }
            });
        };

    for (var key in escapeMap) {
        reversedescapeMap[escapeMap[key]] = key;
    }
    reversedescapeMap["'"] = '#39';

    return {

        capitalize: capitalize,
        hyphenate: hyphenate,
        camelize: camelize,
        trim: trim,
        escapeHTML: escapeHTML,
        unescapeHTML: unescapeHTML,
        truncate: truncate
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
            if (owner) {
                var prop,
                    cache = this.cache(owner);

                // Handle: [ owner, key, value ] args
                if (typeof data === 'string') {
                    cache[data] = value;

                    // Handle: [ owner, { properties } ] args
                } else {
                    // Fresh assignments by object are shallow copied
                    if (_types.isEmptyObject(cache)) {

                        _util.mixin(cache, data);
                        // Otherwise, copy the properties one-by-one to the cache object
                    } else {
                        for (prop in data) {
                            cache[prop] = data[prop];
                        }
                    }
                }
                return cache;
            }
        },
        access: function(owner, key, value) {
            var stored;

            if (key === undefined ||
                ((key && typeof key === 'string') && value === undefined)) {

                stored = this.get(owner, key);

                return stored !== undefined ?
                    stored : this.get(owner, _strings.camelize(key));
            }

            this.set(owner, key, value);

            // Since the 'set' path can have two possible entry points
            // return the expected data based on which path was taken[*]
            return value !== undefined ? value : key;
        },
        get: function(owner, key) {
            var cache = this.cache(owner);
            return cache !== undefined && key === undefined ? cache : cache[key];
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
        private: _privateData,
        data: _userData
    };
});
// curcss.js
hAzzle.define('curCSS', function() {

    var _has = hAzzle.require('has'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _storage = hAzzle.require('Storage'),

        docElem = window.document.documentElement,

        computedStyle = !!document.defaultView.getComputedStyle,

        computedValues = _support.computedStyle && _has.has('webkit') ? function(elem) {
            // Looks stupid, but gives better performance in Webkit browsers
            var str;
            if (elem.nodeType === 1) {
                var dv = elem.ownerDocument.defaultView;
                str = dv.getComputedStyle(elem, null);
                if (!str && elem.style) {
                    elem.style.display = '';
                    str = dv.getComputedStyle(elem, null);
                }
            }
            return str || {};
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
                return _support.cS ? (view && computedStyle ?
                    (view.opener ? view.getComputedStyle(elem, null) :
                        window.getComputedStyle(elem, null)) : elem.style) : elem.style;
            }
            return null;
        },
        computedCSS = function(elem) {
            if (elem) {
                if (_storage.private.get(elem, 'computed') === undefined) {
                    _storage.private.access(elem, 'computed', {
                        computedStyle: null
                    });
                }
                return _storage.private.get(elem, 'computed');
            }
        },
        getStyles = function(elem) {
            var computed;
            if (computedCSS(elem).computedStyle === null) {
                computed = computedCSS(elem).computedStyle = computedValues(elem);
            } else {
                computed = computedCSS(elem).computedStyle;
            }

            return computed;
        },
        curHeight = function(elem) {
            return elem.offsetHeight -
                (parseFloat(curCSS(elem, 'borderTopWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderBottomWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingTop')) || 0) -
                (parseFloat(curCSS(elem, 'paddingBottom')) || 0);
        },
        curWidth = function(elem) {
            return elem.offsetWidth -
                (parseFloat(curCSS(elem, 'borderLeftWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderRightWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingLeft')) || 0) -
                (parseFloat(curCSS(elem, 'paddingRight')) || 0);
        },
        // Prop to jQuery for the name!

        curCSS = function(elem, prop, force) {

            if (typeof elem === 'object' && elem instanceof hAzzle) {
                elem = elem.elements[0];
            }
            var computedValue = 0;

            if (!force) {

                if (prop === 'height' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curHeight(elem);
                } else if (prop === 'width' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curWidth(elem);
                }
            }

            var computedStyle = getStyles(elem);

            if (computedStyle) {

                // IE and Firefox do not return a value for the generic borderColor -- they only return 
                // individual values for each border side's color.

                if ((_has.ie || _has.has('firefox')) && prop === 'borderColor') {
                    prop = 'borderTopColor';
                }

                // Support: IE9
                // getPropertyValue is only needed for .css('filter')

                if (_has.ie === 9 && prop === 'filter') {
                    computedValue = computedStyle.getPropertyValue(prop);
                } else {
                    computedValue = computedStyle[prop];
                }

                // Fall back to the property's style value (if defined) when computedValue returns nothing

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
            }
        },

        setOffset = function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = curCSS(elem, 'position'),
                curElem = hAzzle(elem),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if (position === 'static') {
                elem.style.position = 'relative';
            }

            curOffset = curElem.offset();
            curCSSTop = curCSS(elem, 'top');
            curCSSLeft = curCSS(elem, 'left');
            calculatePosition = (position === 'absolute' || position === 'fixed') &&
                (curCSSTop + curCSSLeft).indexOf('auto') > -1;

            // Need to be able to calculate position if either
            // top or left is auto and position is either absolute or fixed
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;

            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }

            if (_types.isType('function')(options)) {
                options = options.call(elem, i, curOffset);
            }

            if (options.top != null) {
                props.top = (options.top - curOffset.top) + curTop;
            }
            if (options.left != null) {
                props.left = (options.left - curOffset.left) + curLeft;
            }

            if ('using' in options) {
                options.using.call(elem, props);

            } else {
                curElem.css(props);
            }
        };

    this.offset = function(options) {
        if (arguments.length) {
            return options === undefined ?
                this.elements :
                this.each(function(elem, i) {
                    setOffset(elem, options, i);
                });
        }
        var docElem, elem = this.elements[0],
            doc = elem && elem.ownerDocument;

        if (!doc) {
            return;
        }

        docElem = doc.documentElement;

        // Make sure it's not a disconnected DOM node
        if (!_core.contains(docElem, elem)) {
            return {
                top: 0,
                left: 0
            };
        }
        // All major browsers supported by hAzzle supports getBoundingClientRect, so no
        // need for a workaround

            var bcr = elem.getBoundingClientRect(),
                isFixed = (curCSS(elem, 'position') == 'fixed'),
                win = _types.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;
            return {
                top: bcr.top + elem.parentNode.scrollTop + ((isFixed) ? 0 : win.pageYOffset) - docElem.clientTop,
                left: bcr.left + elem.parentNode.scrollLeft + ((isFixed) ? 0 : win.pageXOffset) - docElem.clientLeft
            };
    };

    this.position = function(relative) {

        var offset = this.offset(),
            elem = this.elements[0],
            scroll = {
                top: 0,
                left: 0
            },
            position = {
                top: 0,
                left: 0
            };

        if (!this.elements[0]) {
            return;
        }

        elem = elem.parentNode;
        
       if( !_util.nodeName(elem, 'html')) {
            scroll.top += elem.scrollLeft;
            scroll.left += elem.scrollTop;
        }
         position = {
            top: offset.top - scroll.top,
            left: offset.left - scroll.left
        };

        if (relative && (relative = hAzzle(relative))) {
            var relativePosition = relative.getPosition();
            return {
                top: position.top - relativePosition.top - parseInt(curCSS(relative, 'borderLeftWidth')) || 0,
                y: position.left - relativePosition.left - parseInt(curCSS(relative, 'borderTopWidth')) || 0
            };
        }
        return position;
    };

    this.offsetParent = function() {
        return this.map(function() {
            var offsetParent = this.offsetParent || docElem;

            while (offsetParent && (!_util.nodeName(offsetParent, 'html') &&
                    curCSS(offsetParent, 'position') === 'static')) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || docElem;
        });
    };

    return {
        computed: computedCSS,
        getStyles: getStyles,
        css: curCSS
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

                elem = relAbsFixed.test(_curcss.css(elem, 'position')) ?
                    elem.offsetParent : elem.parentNode;

                if (elem) {

                    prop = parseFloat(_curcss.css(elem, prop));

                    if (prop !== 0) {

                        return px / prop * 100;
                    }
                }
                return 0;
            }

            if (unit === 'em') {

                return px / parseFloat(_curcss.css(elem, 'fontSize'));
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

// setters.js
hAzzle.define('Setters', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _has = hAzzle.require('has'),
        _strings = hAzzle.require('Strings'),
        _concat = Array.prototype.concat,
        SVGAttributes = 'width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2',
        whiteSpace = /\S+/g,
        wreturn = /\r/g,
        wrapBrackets = /^[\[\s]+|\s+|[\]\s]+$/g, // replace whitespace, trim [] brackets
        arrWhitespace = /\s*[\s\,]+\s*/,
        escapeDots = /\\*\./g, // find periods w/ and w/o preceding backslashes
        boolElemArray = ('input select option textarea button form details').split(' '),
        boolAttrArray = ('multiple selected checked disabled readonly required ' +
            'async autofocus compact nowrap declare noshade hreflang onload src' +
            'noresize defaultChecked autoplay controls defer autocomplete ' +
            'hidden tabindex readonly type accesskey dropzone spellcheck ismap loop scoped open').split(' '),
        boolAttr = {}, // Boolean attributes
        boolElem = {}, // Boolean elements

        propMap = {
            // properties renamed to avoid clashes with reserved words  
            'class': 'className',
            'for': 'htmlFor'
        },
        forcePropNames = {
            innerHTML: 1,
            textContent: 1,
            className: 1,
            htmlFor: _has.has('ie'),
            value: 1
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

            if (_has.ie || (_has.has('android') && !_has.has('chrome'))) {
                SVGAttributes += '|transform';
            }

            return new RegExp('^(' + SVGAttributes + ')$', 'i').test(prop);
        },

        getElem = function(elem) {
            if (elem instanceof hAzzle) {
                return elem.elements;
            }
            return elem;

        },

        // Get names on the boolean attributes

        getBooleanAttrName = function(elem, name) {
            // check dom last since we will most likely fail on name
            var booleanAttr = boolAttr[name.toLowerCase()];
            // booleanAttr is here twice to minimize DOM access
            return booleanAttr && boolElem[elem.nodeName] && booleanAttr;
        },

        // Removes an attribute from an HTML element.

        removeAttr = function(elem, value) {

            elem = getElem(elem);

            var name, propName,
                i = 0,
                keys = typeof value === 'string' ? value.match(whiteSpace) : _concat(value),
                l = keys.length;

            for (; i < l; i++) {

                name = keys[i];

                // Get the properties

                propName = propMap[name] || name;

                if (getBooleanAttrName(elem, name)) {
                    elem[propName] = false;
                } else {
                    elem.removeAttribute(name);
                }
            }
        },

        // Toggle attributes        

        toggleAttr = function(elem, attr, force) {

            elem = getElem(elem);

            typeof force == 'boolean' || (force = null == Attr(elem, attr) === false);

            var opposite = !force;

            force ? Attr(elem, attr, '') : removeAttr(elem, attr);

            return elem[attr] === opposite ? elem[attr] = force : force;

        },

        // Convert list of attr names or data- keys into a selector.

        toAttrSelector = function(list, prefix, join) {
            var l, s, i = 0,
                j = 0,
                emp = '',
                arr = [];
            prefix = true === prefix;
            list = typeof list == 'string' ? list.split(arrWhitespace) : typeof list == 'number' ? '' + list : list;
            for (l = list.length; i < l;) {
                s = list[i++];
                s = prefix ? _strings.hyphenate(s) : s.replace(wrapBrackets, emp);
                s && (arr[j++] = s);
            }
            // Escape periods to allow atts like `[data-the.wh_o]`
            // @link api.jquery.com/category/selectors/
            // @link stackoverflow.com/q/13283699/770127
            return false === join ? arr : j ? '[' + arr.join('],[').replace(escapeDots, '\\\\.') + ']' : emp;
        },

        // get/set attribute

        Attr = function(elem, name, value) {

            elem = getElem(elem);

            var nodeType = elem ? elem.nodeType : undefined,
                hooks, ret, notxml, forceProp = forcePropNames[name];

            if (!nodeType || nodeType === 3 || nodeType === 8 || nodeType === 2) {
                return '';
            }
            // don't get/set attributes on text, comment and attribute nodes


            // Fallback to prop when attributes are not supported
            if (typeof elem.getAttribute === 'undefined') {
                return Prop(elem, name, value);
            }

            notxml = nodeType !== 1 || !_core.isXML(elem);

            if (notxml) {

                name = name.toLowerCase();
                hooks = (attrHooks[value === 'undefined' ? 'get' : 'set'][name] || null) ||
                    getBooleanAttrName(elem, name) ?
                    boolHooks[value === 'undefined' ?
                        'get' : 'set'][name] : nodeHooks[value === 'undefined' ? 'get' : 'set'][name];
            }

            // getAttribute

            if (value === undefined) {

                if (hooks && (ret = hooks.get(elem, name))) {
                    if (ret !== null) {
                        return ret;
                    }
                }
                if (name == 'textContent') {
                    return Prop(elem, name);
                }
                ret = elem.getAttribute(name, 2);
                // Non-existent attributes return null, we normalize to undefined
                return ret == null ?
                    undefined :
                    ret;
            }

            // setAttribute          

            if (!value) {
                removeAttr(elem, name);
            } else if (hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                return ret;
            } else {
                if (forceProp || typeof value == 'boolean' || _types.isFunction(value)) {
                    return Prop(elem, name, value);
                }
                elem.setAttribute(name, value + '');
            }
        },

        Prop = function(elem, name, value) {

            elem = getElem(elem);

            var nodeType = elem ? elem.nodeType : undefined,
                hook, ret;

            if (!nodeType || nodeType === 3 || nodeType === 8 || nodeType === 2) {
                return '';
            }
            if (nodeType !== 1 || _core.isHTML) {

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
        };

    this.val = function(value) {

        var hooks, ret, isFunction,
            elem = this.elements[0];

        if (!arguments.length) {
            if (elem) {
                hooks = valHooks.get[elem.type] ||
                    valHooks.get[elem.nodeName.toLowerCase()];

                if (hooks) {
                    return hooks(elem, 'value');
                }

                ret = elem.value;

                return typeof ret === 'string' ?
                    // Handle most common string cases
                    ret.replace(wreturn, '') :
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

            // Treat null/undefined as ''; convert numbers to string
            if (val == null) {
                val = '';

            } else if (typeof val === 'number') {
                val += '';

            } else if (_types.isArray(val)) {
                val = _util.map(val, function(value) {
                    return value == null ? '' : value + '';
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

    this.removeProp = function(name) {
        return this.each(function() {
            delete this[propMap[name] || name];
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

    // Populate propMap - all properties written as camelCase
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
        toggleAttr: toggleAttr,
        toAttrSelector: toAttrSelector,
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
    _util.mixin(_setters.attrHooks.set, {

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
        }
    });
    return {};
});

// prophooks.js
hAzzle.define('propHooks', function() {

    var _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _setters = hAzzle.require('Setters');

    _util.mixin(_setters.propHooks.get, {
        'tabIndex': function(elem) {
            return elem.hasAttribute('tabindex') ||
                /^(?:input|select|textarea|button)$/i.test(elem.nodeName) || elem.href ?
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
hAzzle.define('boolHooks', function() {

    var _setters = hAzzle.require('Setters');

    _setters.boolHooks.set = function(elem, value, name) {
        // If value is false, remove the attribute
        if (value === false) {
            _setters.removeAttr(elem, name);
            // If value is not false, set the same name value (checked = 'checked')
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
        _text = hAzzle.require('Text'),
        _types = hAzzle.require('Types'),
        _collection = hAzzle.require('Collection'),
        _support = hAzzle.require('Support'),
        _setters = hAzzle.require('Setters');

    // Setter
    _util.mixin(_setters.valHooks.set, {

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
    _util.mixin(_setters.valHooks.get, {

        'option': function(elem) {

            var val = elem.getAttribute(name, 2);

            return val !== null ?
                val :
                _strings.trim(_text.getText(elem));
        },

        'select': function(elem) {

            var index = elem.selectedIndex,
                // Single box type attribute for select-one
                // Checkbox type attribute for select-multiple
                one = elem.type === 'select-one',
                options = elem.options,
                vals = [],
                val, max, option, i;

            if (index < 0) {
                return '';
            }

            i = one ? index : 0;
            max = one ? index + 1 : options.length;
            for (; i < max; i++) {
                option = options[i];
                // Traverse the option element when the elements needed to filter out disabled
                if (option.selected && (_support.optDisabled ? !option.disabled : option.getAttribute('disabled') === null) &&
                    (!option.parentElement.disabled || option.parentElement.tagName !== 'OPTGROUP')) {

                    val = hAzzle(option).val();

                    if (one) {
                        return val;
                    }

                    vals.push(val);
                }
            }

            if (one && !vals.length && options.length) {
                return options[index].value;
            }

            return vals;
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