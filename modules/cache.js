// cache.js
var types = {

        'null': 1,
        'boolean': 1,
        'undefined': 1,
        'string': 1,
        'number': 1

    },
    
	// Mehran!! Why 3x ___ ??
    
	cacheKey = '___cachekey___',

    objKeyPrefix = 'obj:',

    storePrototype = {
        'undefined': undefined,
        'null': null,
        'false': false,
        'true': true
    };


function Cache() {
	
    this.storage = createMapStorage();
}

/* ============================ PROTOTYPE CHAIN =========================== */

Cache.prototype = {

    key: function(obj) {

// Mehran!!  You have to verify this one. If its a value or
// not
        var k = obj[cacheKey];

        if (k) {

// Mehran! Try to use hAzzle.inArray for better performance

            if (k.indexOf(objKeyPrefix) === 0) {

// Mehran!! I replaced substring with slice. Better
// performance, and we then shaved off some bytes

                k = k.slice(objKeyPrefix.length);

                return this.val(k);
            }
            return obj[cacheKey];
        }
        return null;
    },

    val: function(key) {
		
        var keyObj,
		    htype = hAzzle.type(key),
            storage = this.storage;
    
	// Mehran! I guess 'key' are an Object. Change back
	// if not a Object
	
	if (hAzzle.isEmptyObject(key) || key === null) {
    //    if (key === null) {

            return null;
        }

        if (htype === 'object' ||
            key === 'function') {

            keyObj = this.key(key);

            if (keyObj) {

                key = objKeyPrefix + keyObj;
            }
        }

        if (storage.hasOwnProperty(key)) {

            return storage[key];
        }

        return null;
    },

    cache: function cacheMap(key, value) {
		
        var storage = this.storage,
            keyType = hAzzle.type(key),
            valueType = hAzzle.type(value),
            val,
            keyObj,
            obj;

        if (arguments.length === 1) {

            if (keyType === 'string' ||
                keyType === 'number') {

                return this.val(key);
            }

            if (keyType === 'boolean' ||
                key === null ||
                key === undefined) {

                return key;
            }

            if (keyType === 'object' || keyType === 'function') {

                keyObj = this.key(key);

                if (keyObj) {

                    obj = this.val(objKeyPrefix + keyObj);

                    if (obj) {

                        return obj;

                    } else {

                        return keyObj;
                    }
                }

                value = key;

                key = hAzzle.getID(true, 'cache_') + '';

                Object.defineProperty(value, cacheKey, mapProperty(key));

                storage[key] = value;

                return key;
            }
        } else {

            if (types[valueType]) {

                val = value;

                // Mehran! What do you really try to do here?? Cant you have a simple
                // function with return of val instead of this closure wrap-up ??

                value = {
                    valueOf: (function(val) {
                        return function() {
                            return val;
                        };
                    }(val))
                };
            }

            if (keyType === 'object' ||
                keyType === 'function') {

                key = objKeyPrefix + this.cache(key);
            }

            Object.defineProperty(value, cacheKey, mapProperty(key));

            storage[key] = value;

            return key;
        }
    }
};

/* ============================ PRIVATE FUNCTIONS =========================== */

// Map properties

function mapProperty(value) {

    // Prevent duplication

    var prop = mapProperty.prop;

    if (typeof prop === 'undefined') {

        prop = {
            enumerable: false,
            writable: false,
            configurable: false,
            value: null
        };

        mapProperty.prop = prop;
    }

    prop.value = value;

    return prop;
}

// Create Map Storage

function createMapStorage() {

    return Object.create(storePrototype);
}

// Expand to the global hAzzle Object

var createCache = hAzzle.createCache = new Cache();
hAzzle.Cache = Cache;
