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
            return isType(obj) !== "object" && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
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
            // use the trick NodeList(index), all browsers support
            try {
                if (nodes(0) === null || (nodes(0) && nodes(0).tagName)) return true;
            } catch (e) {
                return false;
            }
            return false;
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
        isNodeList: isNodeList
    };
});