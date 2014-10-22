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