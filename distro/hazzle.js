    /*!
     * hAzzle.js
     * Copyright (c) 2014 Kenny Flashlight
     * Version: 1.0.0 Release Candidate
     * Released under the MIT License.
     *
     * Date: 2014-10-22
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
                    _ready.ready(sel);
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

        // Define constructor
        hAzzle.prototype = {
            constructor: hAzzle
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

// support.js
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

    // has.js
    hAzzle.define('has', function() {

        var
            ua = navigator.userAgent,
            win = window,
            doc = win.document,
            isBrowser =
            // the most fundamental decision: are we in the browser?
            typeof window !== 'undefined' &&
            typeof location !== 'undefined' &&
            typeof document !== 'undefined' &&
            window.location === location &&
            window.document === document,
            doc = isBrowser && document,
            element = doc && doc.createElement('DiV'),
            hasCache = {},

            // IE feature detection

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

            has = function(name) {
                return typeof hasCache[name] === 'function' ?
                    (hasCache[name] = hasCache[name](win, doc, element)) :
                    hasCache[name]; // Boolean
            },

            add = function(name, test, now, force) {
                (typeof hasCache[name] === 'undefined' || force) && (hasCache[name] = test);
                return now && has(name);
            },
            clearElement = function(element) {
                if (element) {
                    while (element.lastChild) {
                        element.removeChild(element.lastChild);
                    }
                }
                return element;
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
                } else if (nodetype === 3 || nodetype === 4) { // Text or CDataSection
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

            extend = function(obj) {
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

            // shallowCopy
            shallowCopy = function(target, source, deep) {
                var key;
                for (key in source)

                    if (deep && (_types.isPlainObject(source[key]) || _types.isArray(source[key]))) {
                    if (_types.isPlainObject(source[key]) && !_types.isPlainObject(target[key])) {
                        target[key] = {};
                    }
                    if (_types.isArray(source[key]) && !_types.isArray(target[key])) {
                        target[key] = [];
                    }
                    shallowCopy(target[key], source[key], deep);
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
            extend: extend,
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
            shallowCopy: shallowCopy,
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
        rnative = /^[^{]+\{\s*\[native \w/,
        matches,
        Core = {},
        CoreCache = {},
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
        };

    Core.uidX = 1;
    Core.uidK = 'hAzzle_id';
    Core.expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),

        // Check if this is XML doc or not

        Core.isXML = function(elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;

            if (documentElement) {
                return documentElement.nodeName !== 'HTML'
            } else {
                return false;
            }
        };

    // Get unique XML document ID

    Core.xmlID = function(elem) {
        var uid = elem.getAttribute(this.uidK);

        if (!uid) {
            uid = this.uidX++;
            elem.setAttribute(this.uidK, uid);
        }
        return uid;
    };

    // Get unique HTML document ID

    Core.htmlID = function(elem) {
        return elem.uniqueNumber ||
            (elem.uniqueNumber = this.uidX++);
    };

    Core.native = rnative.test(docElem.compareDocumentPosition);
    // Set document

    Core.setDocument = function(document) {

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
            features = CoreCache[rootID],
            feature;

        // Don't run feature detection twice

        if (features) {
            for (feature in features) {
                this[feature] = features[feature];
            }
            return;
        }

        features = CoreCache[rootID] = {};
        features.root = root;
        features.isXMLDocument = this.isXML(document);
        features.detectDuplicates = !!hasDuplicate;
        features.sortStable = Core.expando.split('').sort(sortOrder).join('') === Core.expando;

        // on non-HTML documents innerHTML and getElementsById doesnt work properly
        _support.assert(function(div) {
            div.innerHTML = '<a id="hAzzle_id"></a>';
            features.isHTMLDocument = !!document.getElementById('hAzzle_id');
        });

        // iF HTML doc

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

            if ((_support.qsa = rnative.test(doc.querySelectorAll))) {
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

            if ((features.matchesSelector = rnative.test((matches = docElem.matches ||
                    docElem.webkitMatchesSelector ||
                    docElem.mozMatchesSelector ||
                    docElem.oMatchesSelector ||
                    docElem.msMatchesSelector)))) {

                _support.assert(function(div) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9)
                    Core.disconnectedMatch = matches.call(div, 'div');
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
                    return sortInput ?
                        (_indexOf.call(sortInput, a) - _indexOf.call(sortInput, b)) :
                        0;
                }

                return compare & 4 ? -1 : 1;
            } :
            function(a, b) {
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

        sortInput = null;

        return results;
    }

    return {
        root: Core.root,
        isXML: Core.isXML,
        isHTML: !Core.isXML(winDoc),
        expando: Core.expando,
        uniqueSort: uniqueSort,
        contains: Core.contains,
        rbuggyQSA:Core.rbuggyQSA 
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

    this.is = function(sel) {
        return this.length > 0 && this.filter(sel).length > 0;
    };

    // Get elements in list but not with this selector

    this.not = function(sel) {
        return this.filter(sel, true);
    };

    // Determine the position of an element within the set

    this.index = function(sel) {
        return sel === undefined ?
            this.parent().children().indexOf(this.elements[0]) :
            this.elements.indexOf(hAzzle(sel).elements[0]);
    };

    this.add = function(sel, ctx) {
        var elements = sel;
        if (typeof sel === 'string') {
            elements = hAzzle(sel, ctx).elements;
        }
        return this.concat(elements);
    };

    this.first = function(index) {
        return index ? this.slice(0, index) : this.eq(0);
    };

    this.last = function(index) {
        return index ? this.slice(this.length - index) : this.eq(-1);
    };

    this.parentElement = function() {
        return this.parent().children();
    };

    this.firstElementChild = function() {
        return this.children().first();
    };

    this.lastElementChild = function() {
        return this.children().last();
    };

    this.previousElementSibling = function() {
        return this.prev().last();
    };

    this.nextElementSibling = function() {
        return this.next().first();
    };

    this.childElementCount = function() {
        return this.children().length;
    };

    this.size = function() {
        return this.length;
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
            // Note! The native 'bind' method do not give the best performance, but
            // this happen only on pageload. Anyone who wan't to fix this?
    }.bind(this));

    return {
        makeArray: makeArray,
        slice: slice,
        reduce: reduce,
        inArray: inArray
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
                return matches(this, selector) != (not || false);
            });
        }
    };

    return {
        matchesSelector: matchesSelector,
        matches: matches,
        find: Jiesa
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

            // UnescapeHTML RegExp

            unEscapeFirst = /^#x([\da-fA-F]+)$/,

            // UnescapeHTML RegExp

            unEscapeLast = /^#(\d+)$/,

            // escapeHTML regExp

            escHTML = /[&<>"']/g,

            // isBlank regExp 
            iBlank = /^\s*$/,

            // stripTags regExp

            sTags = /<\/?[^>]+>/g,

            // escapeRegExp regExp

            eRegExp = /([.*+?^=!:${}()|[\]\/\\])/g,

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

            escapeChars = {
                lt: '<',
                gt: '>',
                quot: '"',
                apos: "'",
                amp: '&'
            },

            reversedEscapeChars = {},

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
                    // Any idiots still using Android 4.1 ?
                    (str + '').replace(nNTrim, '');
            },
            // Check if a string is blank
            isBlank = function(str) {
                if (!str) {
                    str = '';
                }
                return (iBlank).test(str);
            },

            // Strip tags
            stripTags = function(str) {
                if (!str) {
                    return '';
                }
                return String(str).replace(sTags, '');
            },

            // Convert a stringified primitive into its correct type.
            parse = function(str) {
                var n; // undefined, or becomes number
                return typeof str !== 'string' ||
                    !str ? str : str === 'false' ? false : str === 'true' ? true : str === 'null' ? null : str === 'undefined' ||
                    (n = (+str)) || n === 0 || str === 'NaN' ? n : str;
            },

            contains = function(str, needle) {
                return str.indexOf(needle) >= 0;
            },

            count = function(string, needle) {
                var count = 0,
                    pos = string.indexOf(needle);

                while (pos >= 0) {
                    count += 1;
                    pos = string.indexOf(needle, pos + 1);
                }

                return count;
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
            escapeRegExp = function(str) {
                if (!str == null) {
                    return '';
                }
                return String(str).replace(eRegExp, '\\$1');
            },
            escapeHTML = function(str) {
                return str.replace(escHTML, function(m) {
                    return '&' + reversedEscapeChars[m] + ';';
                });
            },
            unescapeHTML = function(str) {
                return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
                    var m;
                    if (entityCode in escapeChars) {
                        return escapeChars[entityCode];
                    } else if ((m = entityCode.match(unEscapeFirst))) {
                        return String.fromCharCode(parseInt(m[1], 16));
                    } else if ((m = entityCode.match(unEscapeLast))) {
                        return String.fromCharCode(~~m[1]);
                    } else {
                        return entity;
                    }
                });
            };

        // Credit: AngularJS    
        // String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
        // locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
        // with correct but slower alternatives.

        if ('i' !== 'I'.toLowerCase()) {
            lowercase = manualLowercase;
            uppercase = manualUppercase;
        }

        for (var key in escapeChars) {
            reversedEscapeChars[escapeChars[key]] = key;
        }
        reversedEscapeChars["'"] = '#39';

        // Exporting

        return {

            capitalize: capitalize,
            hyphenate: hyphenate,
            camelize: camelize,
            trim: trim,
            lowercase: lowercase,
            uppcase: uppercase,
            manualLowercase: manualLowercase,
            manualUppercase: manualUppercase,
            parse: parse,
            count: count,
            contains: contains,
            isBlank: isBlank,
            stripTags: stripTags,
            escapeHTML: escapeHTML,
            unescapeHTML: unescapeHTML,
            escapeRegExp: escapeRegExp,
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

                            _util.extend(cache, data);
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

            inlineRegEx = /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
            listItemRegEx = /^(li)$/i,
            tablerowRegEx = /^(tr)$/i,

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
                if (inlineRegEx.test(tagName)) {
                    return 'inline';
                }
                if (listItemRegEx.test(tagName)) {
                    return 'list-item';
                }
                if (tablerowRegEx.test(tagName)) {
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

                if (computedStyle) {

                    // IE and Firefox do not return a value for the generic borderColor -- they only return 
                    // individual values for each border side's color.

                    if ((_has.ie || _has.has('firefox')) && prop === 'borderColor') {
                        prop = 'borderTopColor';
                    }

                    // IE9 has a bug in which the 'filter' property must be accessed from 
                    // computedStyle using the getPropertyValue method instead of a direct property lookup. 

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
                    position = curCSS(elem, "position"),
                    curElem = hAzzle(elem),
                    props = {};

                // Set position first, in-case top/left are set even on static elem
                if (position === "static") {
                    elem.style.position = "relative";
                }

                curOffset = curElem.offset();
                curCSSTop = curCSS(elem, "top");
                curCSSLeft = curCSS(elem, "left");
                calculatePosition = (position === "absolute" || position === "fixed") &&
                    (curCSSTop + curCSSLeft).indexOf("auto") > -1;

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

                if ("using" in options) {
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

            var docElem, win,
                elem = this.elements[0],
                box = {
                    top: 0,
                    left: 0
                },
                doc = elem && elem.ownerDocument;

            if (!doc) {
                return;
            }

            docElem = doc.documentElement;

            // Make sure it's not a disconnected DOM node
            if (!_core.contains(docElem, elem)) {
                return box;
            }

            // Support: BlackBerry 5, iOS 3 (original iPhone)
            // If we don't have gBCR, just use 0,0 rather than error
            if (elem.getBoundingClientRect) {
                box = elem.getBoundingClientRect();
            }
            win = _types.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;

            return {
                top: box.top + win.pageYOffset - docElem.clientTop,
                left: box.left + win.pageXOffset - docElem.clientLeft
            };
        };

        this.position = function() {
            if (!this.elements[0]) {
                return;
            }

            var offsetParent, offset,
                elem = this.elements[0],
                parentOffset = {
                    top: 0,
                    left: 0
                };

            // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
            // because it is its only offset parent
            if (curCSS(elem, 'position') === 'fixed') {
                // Assume getBoundingClientRect is there when computed position is fixed
                offset = elem.getBoundingClientRect();

            } else {
                // Get *real* offsetParent
                offsetParent = this.offsetParent();

                // Get correct offsets
                offset = this.offset();

                if (!_util.nodeName(offsetParent.elements[0], 'html')) {

                    parentOffset = offsetParent.offset();
                }

                // Add offsetParent borders

                parentOffset.top += parseFloat(curCSS(offsetParent.elements[0], 'borderTopWidth', true));
                parentOffset.left += parseFloat(curCSS(offsetParent.elements[0], 'borderLeftWidth', true));
            }
            // Subtract offsetParent scroll positions

            parentOffset.top -= offsetParent.scrollTop();
            parentOffset.left -= offsetParent.scrollLeft();
            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - parseFloat(curCSS(elem, 'marginTop', true)),
                left: offset.left - parentOffset.left - parseFloat(curCSS(elem, 'marginLeft', true))
            };
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

    // manipulation.js
    hAzzle.define('Manipulation', function() {

        var _util = hAzzle.require('Util'),
            _support = hAzzle.require('Support'),
            _core = hAzzle.require('Core'),
            _types = hAzzle.require('Types'),
            _text = hAzzle.require('Text'),
            _scriptStyle = /<(?:script|style|link)/i,
            _tagName = /<([\w:]+)/,
            _htmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            _rcheckableType = (/^(?:checkbox|radio)$/i),
            _whitespace = /^\s*<([^\s>]+)/,
            _scriptTag = /\s*<script +src=['"]([^'"]+)['"]>/,
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
                return hAzzle(create(html, context));
            },

            fixInput = function(src, dest) {
                var nodeName = dest.nodeName.toLowerCase();

                // Fails to persist the checked state of a cloned checkbox or radio button.
                if (nodeName === 'input' && _rcheckableType.test(src.type)) {
                    dest.checked = src.checked;

                    // Fails to return the selected option to the default selected state when cloning options
                } else if (nodeName === 'input' || nodeName === 'textarea') {
                    dest.defaultValue = src.defaultValue;
                }
            },
            cloneElem = function(elem, deep) {

                var source = elem.cloneNode(true),
                    destElements,
                    srcElements,
                    i, l;

                // Fix IE cloning issues
                if (!_support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) &&
                    !_core.isXML(elem)) {
                    destElements = grab(source);
                    srcElements = grab(elem);

                    for (i = 0, l = srcElements.length; i < l; i++) {
                        fixInput(srcElements[i], destElements[i]);
                    }
                }
                // If 'deep' clone events
                if (deep && (source.nodeType === 1 || source.nodeType === 9)) {

                    hAzzle(source).cloneEvents(elem);

                    // Copy the events from the original to the clone

                    destElements = grab(source);
                    srcElements = grab(elem);

                    for (i = 0; i < srcElements.length; i++) {
                        hAzzle(destElements[i]).cloneEvents(srcElements[i]);
                    }
                }
                return source;
            },

            createScriptFromHtml = function(html, context) {
                var scriptEl = context.createElement('script'),
                    matches = html.match(_scriptTag);
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
                        if (_scriptTag.test(node)) {
                            return [createScriptFromHtml(node, context)];
                        }

                        // Deserialize a standard representation

                        var i, tag = node.match(_whitespace),
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
                            if (!tag || sandbox.nodeType === 1) {
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

            clearData = function(elems) {

                // No point to continue clearing events if the events.js module
                // are not installed

                if (!hAzzle.installed.Events) {
                    hAzzle.err(true, 17, 'events.js module are not installed');
                }

                var elem, i = 0;

                // If instanceof hAzzle...

                if (elems instanceof hAzzle) {
                    elems = [elems.elements[0]];
                } else {
                    elems = elems.length ? elems : [elems];
                }

                for (;
                    (elem = elems[i]) !== undefined; i++) {
                    // Remove all eventListeners
                    hAzzle(elem).off();
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
                        ret[i] = cloneElem(node[i], true);
                    }
                    return ret;
                }
                return node;
            },
            createGlobal = function(elem, content, method) {
                if (typeof content === 'string' &&
                    _core.isHTML &&
                    elem.parentNode && elem.parentNode.nodeType === 1) {
                    elem.insertAdjacentHTML(method, content.replace(_htmlTag, '<$1></$2>'));
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
                    _core.isHTML &&
                    elem.parentNode && elem.parentNode.nodeType === 1) {
                    elem.insertAdjacentHTML(method, html.replace(_htmlTag, '<$1></$2>'));
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
                _text.getText(this.elements) :
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

            var els = this.elements,
                elem = els[0],
                i = 0,
                l = this.length;

            if (value === undefined && els[0].nodeType === 1) {
                return els[0].innerHTML;
            }
            // See if we can take a shortcut and just use innerHTML

            if (typeof value === 'string' && !_scriptStyle.test(value) &&
                !tagMap[(_tagName.exec(value) || ['', ''])[1].toLowerCase()]) {

                value = value.replace(_htmlTag, '<$1></$2>'); // DOM Level 4

                try {

                    for (; i < l; i++) {

                        elem = els[i] || {};

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
            return deepEach(this.elements, fn, scope);
        };

        this.detach = function() {
            return this.each(function(elem) {
                if (elem.parentElement) {
                    elem.parentElement.removeChild(elem);
                }
            });
        };

        this.empty = function() {
            return this.each(function(elem) {
                // Do a 'deep each' and clear all listeners if any 
                deepEach(elem.children, clearData);
                while (elem.firstChild) {
                    elem.removeChild(elem.firstChild);
                }
            });
        };

        this.remove = function() {
            this.deepEach(clearData);
            return this.detach();
        };

        // 'deep' - let you clone events

        this.clone = function(deep) {
            // Better performance with a 'normal' for-loop then
            // map() or each()       
            var elems = this.elements,
                ret = [],
                i = 0,
                l = this.length;

            for (; i < l; i++) {
                ret[i] = cloneElem(elems[i], deep);
            }
            return hAzzle(ret);
        };

        return {
            clearData: clearData,
            create: create,
            createHTML: createHTML,
            clone: cloneElem,
            append: append,
            prepend: prepend
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
            'class': 'className',
            'for': 'htmlFor'
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

        removeAttr = function(el, value) {

            var name, propName,
                i = 0,
                elem = getElem(el),
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
                hooks, ret, notxml;

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

                ret = elem.getAttribute(name, 2);
                // Non-existent attributes return null, we normalize to undefined
                return ret == null ?
                    undefined :
                    ret;
            }

            // setAttribute          

            if (value === null) {
                removeAttr(elem, name);
            } else if (hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                return ret;
            } else {
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
        toggleAttr:toggleAttr,
        toAttrSelector:toAttrSelector,
        getBooleanAttrName: getBooleanAttrName,
        SVGAttribute: SVGAttribute
    };
});
    // attrhooks.js
    hAzzle.define('attrHooks', function() {

        var _util = hAzzle.require('Util'),
            _support = hAzzle.require('Support'),
            _setters = hAzzle.require('Setters'),
            _docElem = document.documentElement,
            _winDoc = window.document;

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
                (elem = _docElem ? _winDoc : elem).title = value;
            }
        });
        // Getter    
        _util.extend(_setters.attrHooks.get, {
            'title': function(elem) {
                return elem === _docElem ? _winDoc.title : elem.title;
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
    hAzzle.define('boolHooks', function() {

        var _setters = hAzzle.require('Setters');

        // Setter    

        _setters.boolHooks.set = function(elem, value, name) {
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
            _getText = hAzzle.require('Text'),
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
            _has = hAzzle.require('has'),
            _core = hAzzle.require('Core'),

            // regEx

            everything = /.*/,
            keyEvent = /^key/,
            // Treat pointer and drag / drop events like mouse events
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
        if (_has.has('firefox')) {
            commonProps.concat('mozMovementY mozMovementX'.split(' '));
        }
        // WebKit eventTypes
        // Support: Chrome / Opera

        if (_has.has('webkit')) {
            commonProps.concat(('webkitMovementY webkitMovementX').split(' '));
        }

        // specialEvents (e.g. focus and blur)
        var specialEvents = {},

            fixedEvents = {},

            customEvents = {},

            fixHooks = {},

            propHooks = [{ // key events
                reg: keyEvent,
                fix: function(original, evt) {
                    // Add which for key events
                    if (!evt.which) {
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
                        evt.relatedTarget = original.relatedTarget || original[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
                    }
                    return mouseProps;
                }
            }, { // everything else
                reg: everything,
                fix: function() {
                    return commonProps;
                }
            }],

            // Create event handler
            createEventHandler = function(elem, fn, condition, args) {

                var call = function(evt, ergs) {
                        return fn.apply(elem, args ? _collection.slice(ergs).concat(args) : ergs);
                    },

                    findTarget = function(evt, eventElement) {
                        return fn.__kfx2rcf ? fn.__kfx2rcf.ft(evt.target, elem) : eventElement;
                    },
                    handler = condition ? function(evt) {
                        var target = findTarget(evt, this);
                        if (condition.apply(target, arguments)) {
                            if (evt) {
                                evt.currentTarget = target;
                            }
                            return call(evt, arguments);
                        }
                    } : function(evt) {
                        if (fn.__kfx2rcf) {
                            evt = evt.clone(findTarget(evt));
                        }
                        return call(evt, arguments);
                    };
                handler.__kfx2rcf = fn.__kfx2rcf;
                return handler;
            },

            // Iterate

            iteratee = function(elem, type, original, handler, root, callback) {

                var t, prefix = root ? '¤' : '#';

                if (!type || type === '*') {

                    for (t in map) {

                        if (t.charAt(0) === prefix) {
                            iteratee(elem, t.slice(1), original, handler, root, callback);
                        }
                    }
                } else {

                    var i = 0,
                        l, list = map[prefix + type],
                        a = elem === '*';

                    if (!list) {
                        return;
                    }

                    for (l = list.length; i < l; i++) {
                        if ((a || list[i].matches(elem, original, handler)) && !callback(list[i], list, i, type)) {
                            return;
                        }
                    }
                }
            },

            // Check collection for registered event,
            // match element and handler
            isRegistered = function(elem, type, original, root) {
                var i, list = map[(root ? '¤' : '#') + type];
                if (list) {
                    for (i = list.length; i--;) {
                        if (!list[i].root && list[i].matches(elem, original, null)) {
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
                    key = (entry.root ? '¤' : '#') + entry.type;
                (map[key] || (map[key] = [])).push(entry);
                return contains;
            },
            // Unregister an event instance and its parameters
            unregister = function(entry) {
                iteratee(entry.element, entry.type, null, entry.handler, entry.root, function(entry, list, i) {
                    list.splice(i, 1);
                    entry.removed = true;
                    if (list.length === 0) {
                        delete map[(entry.root ? '¤' : '#') + entry.type];
                    }
                    return false;
                });
            },

            rootHandler = function(event, type) {

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

            removeHandlers = function(elem, type, handler, ns) {

                type = type && type.replace(nameRegex, '');

                var handlers = getRegistered(elem, type, null, false),
                    removed = {},
                    i, l;

                for (i = 0, l = handlers.length; i < l; i++) {
                    if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(ns)) {
                        unregister(handlers[i]);
                        if (!removed[handlers[i].eventType]) {
                            removed[handlers[i].eventType] = {
                                t: handlers[i].eventType,
                                c: handlers[i].type
                            };
                        }
                    }
                }

                for (i in removed) {
                    if (!isRegistered(elem, removed[i].t, null, false)) {
                        elem.removeEventListener(removed[i].t, rootHandler, false);
                    }
                }
            },

            once = function(rm, elem, type, callback, original) {
                return function() {
                    callback.apply(this, arguments);
                    rm(elem, type, original);
                };
            },

            // Find event delegate
            findDelegate = function(target, selector, root) {

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
            // Event delegate
            delegate = function(selector, fn) {
                var handler = function(e) {
                    var cur = e.target;
                    // Don't process clicks on disabled elements
                    if (cur.nodeType && cur.disabled !== true) {
                        var m = findDelegate(cur, selector, this);
                        if (m) {
                            fn.apply(m, arguments);
                        }
                    }
                };

                handler.__kfx2rcf = {
                    ft: findDelegate,
                    selector: selector
                };
                return handler;
            },

            // Add event to element

            on = function(elem, types, selector, callback, one) {

                // Check if typeof hAzzle, then wrap it out, and return current elem

                if (elem instanceof hAzzle) {
                    elem = elem.elements[0];
                }

                var cb, type, i, args, entry, first, hooks, eventType, namespace;

                // Types can be a map of types/handlers

                if (_types.isType(types) === 'object') {
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

                    eventType = types[i].replace(nameRegex, '');

                    // There *must* be a type, no attaching namespace-only handlers

                    if (!eventType) {
                        continue;
                    }

                    namespace = types[i].replace(namespaceRegex, '').split('.'); // namespaces
                    // Registrer
                    first = registrer(entry = new Registry(
                        elem,
                        eventType, // event type
                        callback,
                        cb,
                        namespace,
                        args,
                        false // not root
                    ));

                    if (first) {

                        type = entry.eventType;

                        if ((hooks = specialEvents[type])) {
                            hooks(elem, type);
                        }
                        // Add rootHandler
                        elem.addEventListener(type, rootHandler, false);
                    }
                }

                return elem;
            },

            one = function(elem, types, selector, callback) {
                return on(elem, types, selector, callback, 1);
            },
            // Remove event from element
            off = function(elem, types, callback) {

                if (elem instanceof hAzzle) {
                    elem = elem.elements[0];
                }

                var k, type, namespaces, i;

                if (typeof types === 'string' && types.indexOf(' ') > 0) {
                    // Once for each type.namespace in types; type may be omitted
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

                    removeHandlers(elem, type, callback, namespaces);

                } else if (_types.isType('Function')(types)) {
                    removeHandlers(elem, null, types);
                } else {
                    for (k in types) {
                        off(elem, k, types[k]);
                    }
                }

                return elem;
            },

            // Trigger specific event for element collection

            trigger = function(elem, type, args) {

                if (elem instanceof hAzzle) {
                    elem = elem.elements[0];
                }

                // Don't do events on text and comment nodes
                if (elem.nodeType === 3 || elem.nodeType === 8) {
                    return;
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
                        // Standard DOM Level 2
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
            addEvent = function(elem, type, handle) {
                if (elem.addEventListener) {
                    elem.addEventListener(type, handle, false);
                }
            },
            removeEvent = function(elem, type, handle) {
                if (elem.removeEventListener) {
                    elem.removeEventListener(type, handle, false);
                }
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

                // Support: Cordova 2.5 (WebKit)
                // All events should have a target; Cordova deviceready doesn't
                if (!event.target) {
                    event.target = document;
                }
                var type = event.type,
                    // fired element (triggering the event)
                    target = event.target || event.srcElement,
                    i, l, p, props, fixer;

                // Support: Safari 6.0+, Chrome<28
                this.target = target.nodeType === 3 ? target.parentNode : target;
                this.timeStamp = Date.now(); // Set time event was fixed

                fixer = fixHooks[type];

                if (!fixer) {

                    fixer = fixedEvents[type];

                    if (!fixer) {
                        for (i = 0, l = propHooks.length; i < l; i++) {
                            if (propHooks[i].reg.test(type)) {
                                fixedEvents[type] = fixer = propHooks[i].fix;
                                break;
                            }
                        }
                    }

                    props = fixer(event, this, type);

                    for (i = props.length; i--;) {
                        if (!((p = props[i]) in this) && p in event) {
                            this[p] = event[p];
                        }
                    }
                }
            };

        Event.prototype = {
            constructor: Event,
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
            constructor: Registry,
            init: function(elem, type, handler, original, namespaces, args, docElem) {

                var customType = customEvents[type];

                if (type === 'unload') {
                    handler = once(removeHandlers, elem, type, handler, original);
                }

                if (customType) {
                    if (customType.condition) {
                        handler = createEventHandler(elem, handler, customType.condition, args);
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
                this.handler = createEventHandler(elem, handler, null, args);
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
                        if (checkNamespaces[i] === this.namespaces[j]) {
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
        this.cloneEvents = function(dest, events) {
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
            addEvent: addEvent,
            removeEvent: removeEvent,
            on: on,
            one: one,
            off: off,
            clone: clone,
            trigger: trigger
        };
    });
    // specialEvents.js
    hAzzle.define('specialEvents', function() {

        var _util = hAzzle.require('Util'),
            _has = hAzzle.require('has'),
            _events = hAzzle.require('Events');

        // Handle focusin/focusout for browsers who don't support it ( e.g Firefox)

        if (_has.has('firefox')) {
            var focusBlurFn = function(elem, type) {

                var key,
                    focusEventType = (type === 'focusin') ? 'focus' : 'blur',
                    focusables = (function(elem) {

                        var focusables = hAzzle(elem).find('input').elements,
                            selects = hAzzle(elem).find('select').elements;

                        if (selects.length) {
                            push.apply(focusables, selects);
                        }

                        return focusables;
                    })(elem),
                    handler = (function(type) {
                        return function() {
                            if (this === document.activeElement && this.blur) {
                                hAzzle(this).trigger(type);
                                return false;
                            }
                        };
                    })(type),

                    i = -1,

                    length = focusables.length;

                key = '__' + focusEventType + 'fixed__';

                while (++i < length) {

                    if (!_util.has(focusables[i], key) || !focusables[i][key]) {
                        focusables[i][key] = true;
                        focusables[i].addEventListener(focusEventType, handler, true);
                    }
                }
            };

            _util.each(['focusin', 'focusout'], function(prop) {
                _events.specialEvents[prop] = focusBlurFn;
            });
        }
        return {};
    });
    // eventhooks.js
    hAzzle.define('eventHooks', function() {

        var _event = hAzzle.require('Events'),

            mouseWheelEvent = /mouse.*(wheel|scroll)/i,
            textEvent = /^text/i,
            touchEvent = /^touch|^gesture/i,
            messageEvent = /^message$/i,
            popstateEvent = /^popstate$/i,

            mouseWheelProps = _event.mouseProps.concat(('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
                'deltaY deltaX deltaZ').split(' ')),
            textProps = _event.commonProps.concat(('data').split(' ')),
            touchProps = _event.commonProps.concat(('touches changedTouches targetTouches scale rotation').split(' ')),
            messageProps = _event.commonProps.concat(('data origin source').split(' ')),
            stateProps = _event.commonProps.concat(('state').split(' '));

        _event.propHooks = _event.propHooks.concat([

            { // mouse wheel events
                reg: mouseWheelEvent,
                fix: function() {
                    return mouseWheelProps;
                }
            }, { // TextEvent
                reg: textEvent,
                fix: function() {
                    return textProps;
                }
            }, { // touch and gesture events
                reg: touchEvent,
                fix: function() {
                    return touchProps;
                }
            }, { // message events
                reg: messageEvent,
                fix: function() {
                    return messageProps;
                }
            }, { // popstate events
                reg: popstateEvent,
                fix: function() {
                    return stateProps;
                }
            }
        ]);
        return {};
    });

    // traversing.js
    hAzzle.define('Traversing', function() {

        var _jiesa = hAzzle.require('Jiesa'),
            _collection = hAzzle.require('Collection'),
            _core = hAzzle.require('Core'),
            _util = hAzzle.require('Util');

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
            return selector === undefined ? hAzzle(ret) : hAzzle(ret).filter(selector);
        };

        // Get immediate parents of each element in the collection.
        // If CSS selector is given, filter results to include only ones matching the selector.

        this.parent = function(sel) {
            var matched = this.map(function(elem) {
                var parent = elem.parentElement;
                return parent && parent.nodeType !== 11 ? parent : null;
            }).filter(sel);

            if (this.length > 1) {
                // Remove duplicates
                _core.uniqueSort(matched.elements);
            }
            return matched;
        };

        // Returns all parent elements for nodes
        // Optionally takes a query to filter the child elements.

        this.parents = function(selector) {
            var ancestors = [],
                elements = this.elements;
            while (elements.length > 0 && elements[0] !== undefined) {
                elements = _util.map(elements, function(elem) {
                    if (elem && (elem = elem.parentElement) && elem.nodeType !== 9) {
                        ancestors.push(elem);
                        return elem;
                    }
                });
            }

            if (this.length > 1) {
                // Remove duplicates
                _core.uniqueSort(ancestors);
                // Reverse order for parents
                ancestors.reverse();
            }
            return selector === undefined ? hAzzle(ancestors) : hAzzle(ancestors).filter(selector);
        };

        // Get the first element that matches the selector, beginning at 
        // the current element and progressing up through the DOM tree.

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
                        _jiesa.matches(cur, selector)) {

                        matched.push(cur);
                        break;
                    }
                }
            }

            return hAzzle(matched.length > 1 ? _core.uniqueSort(matched) : matched);
        };

        // Get immediate children of each element in the current collection.
        // If selector is given, filter the results to only include ones matching the CSS selector.

        this.children = function(selector) {
            var children = [];
            this.each(function(elem) {
                _util.each(_collection.slice(elem.children), function(value) {
                    children.push(value);
                });
            });
            return selector === undefined ? hAzzle(children) : hAzzle(children).filter(selector);
        };

        // Return elements that is a descendant of another.

        this.contains = function(selector) {
            var matches;
            return new hAzzle(_collection.reduce(this.elements, function(elements, element) {
                matches = _jiesa.find(element, selector);
                return elements.concat(matches.length ? element : null);
            }, []));
        };

        // Reduce the set of matched elements to those that have a descendant that matches the 
        //selector or DOM element.

        this.has = function(sel) {
            return hAzzle(_util.filter(
                this.elements,
                _util.isElement(sel) ? function(el) {
                    return _core.contains(sel, el);
                } : typeof sel === 'string' && sel.length ? function(el) {
                    return _jiesa.find(sel, el).length;
                } : function() {
                    return false;
                }
            ));
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

                if (!_types.isEmptyObject(elem)) {

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
                        elem && elem.classList[nativeMethodName].apply(elem.classList, classes);
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

            // Check if the first element in the collection has classes

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

            // Add classes to element collection

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

            // Remove classes from element collection

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
            setClass = function(elem, /* classe(s) to be added*/ add, /* classe(s) to be removed*/ remove, fn) {
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
                            _storage.private.set(elem, '__className__', elem.className);
                        }
                        elem.className = elem.className || value === false ?
                            '' :
                            _storage.private.get(this, '__className__') || '';
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

        // Replace a given class with another

        this.replaceClass = function(firstClass, secondClass) {
            if (this.hasClass(firstClass)) {
                this.removeClass(firstClass).addClass(secondClass);
            } else if (this.hasClass(secondClass)) {
                this.removeClass(secondClass).addClass(firstClass);
            }

            return this;
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