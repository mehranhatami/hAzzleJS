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
            if (typeof func == 'function') {
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
                    if (!i || seen !== value) result.push(value);
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
                if (typeof isSorted == 'number') {
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