// Storage.js
var sWhiteRegex = (/\S+/g),
    shtmlRegEx = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    scharRegEx = /([A-Z])/g,
    camelize = hAzzle.camelize;

function Storage() {
    this.expando = hAzzle.expando + hAzzle.getID(true, 'storage');
}

Storage.prototype = {

    constructor: Storage,

    expando: 0,

    register: function(owner, initial) {
        var descriptor = {};

        // Secure cache in a non-enumerable, configurable, writable property

        descriptor[this.expando] = {
            value: initial || {},
            writable: true,
            configurable: true
        };
        Object.defineProperties(owner, descriptor);

        return owner[this.expando];
    },

    cache: function(owner, initial) {

        if (!hAzzle.legalTypes(owner)) {
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
        var prop, cache = this.cache(owner);

        // Handle: [ owner, key, value ] args

        if (typeof data === 'string') {
            cache[data] = value;

        } else {

            if (hAzzle.isEmptyObject(cache)) {
                hAzzle.shallowCopy(cache, data);
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
            ((key && typeof key === 'string') && value === undefined)) {

            stored = this.get(owner, key);

            return stored !== undefined ?
                stored : this.get(owner, camelize(key));
        }

        this.set(owner, key, value);

        return value !== undefined ? value : key;
    },
    release: function(owner, key) {
        var i, name, camel,
            cache = this.cache(owner);

        if (key === undefined) {
            this.register(owner);

        } else {

            if (hAzzle.isArray(key)) {

                name = key.concat(key.map(camelize));

            } else {

                camel = camelize(key);

                if (key in cache) {
                    name = [key, camel];

                } else {

                    name = camel;
                    name = name in cache ? [name] : (name.match(sWhiteRegex) || []);
                }
            }

            i = name.length;

            while (i--) {
                delete cache[name[i]];
            }
        }
    },
    hasData: function(owner) {

        return !hAzzle.isEmptyObject(
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

hAzzle.extend({

    flushPrivate: function(elem) {
        return _privateData.flush(elem);
    },

    getPrivate: function(elem, data) {
        return _privateData.get(elem, data);
    },

    // Set user / private data

    setPrivate: function(elem, data, value) {
        return _privateData.set(elem, data, value);
    },

    hasPrivate: function(elem) {
        return _privateData.hasData(elem);
    },
    private: function(elem, name, data) {
        return _privateData.access(elem, name, data);
    },

    // Remove user / private data

    removePrivate: function(elem, name) {
        return _privateData.release(elem, name);
    },

    flushData: function(elem) {
        return _userData.flush(elem);
    },

    // Check if 'elem' has user / private data

    hasData: function(elem) {
        return _userData.hasData(elem);
    },
    data: function(elem, name, data) {
        return _userData.access(elem, name, data);
    },

    // Remove user / private data

    removeData: function(elem, name) {
        return _userData.release(elem, name);
    }
});

// Expand the global hAzzle Object


// Expand hAzzle Core

hAzzle.extend({

    /**
     * Store arbitrary data associated with the matched elements or return the
     * value at the named data store for the first element in the set of matched
     * elements.
     *
     * @param  {String|Object|Array}  key(s)
     * @param  {Object}               value
     * @return {Object|String }
     */

    data: function(key, value) {

        var i, name, data,
            elem = this[0],
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

                                name = camelize(name.slice(5));
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

            return this.each(function() {
                _userData.set(this, key);
            });
        }

        return hAzzle.setter(this, function(value) {

            var data, camelKey = camelize(key);

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

            this.each(function() {
                var data = _userData.get(this, camelKey);
                _userData.set(this, camelKey, value);
                if (isHyphenated && data !== undefined) {
                    _userData.set(this, key, value);
                }

                if (isHyphenated && hasDataAttrs === undefined) {
                    _userData.set(this, key, value);
                }
            });
        }, null, value, arguments.length > 1, null, true);
    },

    /**
     * Remove attributes from element collection
     *
     * @param {String} key
     *
     * @return {Object}
     */

    removeData: function(key) {
        return this.each(function() {
            _userData.release(this, key);
        });
    }
});

function dataAttr(elem, key, data) {

    var name;

    if (data === undefined && elem.nodeType === 1) {

        name = 'data-' + key.replace(scharRegEx, '-$1').toLowerCase();

        data = elem.getAttribute(name);

        if (typeof data === 'string') {
            try {
                data = data === 'true' ? true :
                    data === 'false' ? false :
                    data === 'null' ? null :
                    // Only convert to a number if it doesn't change the string
                    +data + '' === data ? +data :
                    shtmlRegEx.test(data) ? JSON.parse(data + '') : data;
            } catch (e) {}

            // Make sure we set the data so it isn't changed later
            _userData.set(elem, key, data);

        } else {

            data = undefined;
        }
    }

    return data;
}