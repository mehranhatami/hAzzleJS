// Storage.js
//
// Inspired from jQuery Data module
// Saves data on the object private and public
var WhiteRegex = (/\S+/g),
    htmlRegEx = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    charRegEx = /([A-Z])/g;

function Storage() {

    this.expando = hAzzle.expando;
}

/* =========================== PROTOTYPE CHAIN ========================== */

Storage.prototype = {

    // Registrer

    registrer: function(owner, initial) {
        var descriptor = {};

        try {
            descriptor[this.expando] = {
                value: initial || {},
                writable: true,
                configurable: true
            };
            Object.defineProperties(owner, descriptor);

        } catch (e) {

            descriptor[this.expando] = initial || {};
            hAzzle.shallowCopy(owner, descriptor);
        }

        return owner[this.expando];
    },

    // Cache

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

        return this.registrer(owner, initial);
    },

    // Set

    set: function(owner, data, value) {
        var prop,
            cache = this.cache(owner);

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

    // Get

    get: function(owner, key) {

        var cache = this.cache(owner);

        return key === undefined ?
            cache : cache[key];
    },

    // Access

    access: function(owner, key, value) {
        var stored;

        if (key === undefined ||
            ((key && typeof key === 'string') && value === undefined)) {

            stored = this.get(owner, key);

            return stored !== undefined ?
                stored : this.get(owner, hAzzle.camelize(key));
        }

        this.set(owner, key, value);

        return value !== undefined ? value : key;
    },

    // Release

    release: function(owner, key) {
        var i, name, camel,
            cache = this.cache(owner);

        if (key === undefined) {
            this.registrer(owner);

        } else {

            if (hAzzle.isArray(key)) {

                name = key.concat(key.map(hAzzle.camelize));

            } else {

                camel = hAzzle.camelize(key);

                if (key in cache) {

                    name = [key, camel];

                } else {

                    name = camel;
                    name = name in cache ? [name] :
                        (name.match(WhiteRegex) || []);
                }
            }

            i = name.length;

            while (i--) {

                delete cache[name[i]];
            }
        }
    },

    // Check if has data

    hasData: function(owner) {

        return !hAzzle.isEmptyObject(
            owner[this.expando] || {}
        );
    },

    // Discard data on the object

    discard: function(owner) {

        if (owner[this.expando]) {

            delete owner[this.expando];
        }
    }
};

// This one shall never be documented!!

var dataPriv = hAzzle.dataPriv = new Storage();

// Public and exposed through the hAzzle Object

var dataUser = hAzzle.dataUser = new Storage();

// Expand the global hAzzle Object

hAzzle.extend({

    /* =========================== PRIVATE ========================== */

    getPrivate: function(elem, dta) {

        return dataPriv.get(elem, dta);

    },

    setPrivate: function(elem, data, value) {
        dataPriv.set(elem, data, value);
    },

    hasPrivate: function(elem) {
        return dataPriv.hasData(elem);
    },

    private: function(elem, name, data) {
        return dataPriv.access(elem, name, data);
    },

    removePrivate: function(elem, name) {
        dataPriv.release(elem, name);
    },

    /* =========================== PUBLIC ========================== */

    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */

    hasData: function(elem) {

        return dataUser.hasData(elem) || dataPriv.hasData(elem);
    },

    data: function(elem, name, data) {
        return dataUser.access(elem, name, data);
    },

    /**
     * Remove data from an element
     *
     * @param {String/Object} elem
     * @param {String} key
     * @return {Object}
     */

    removeData: function(elem, name) {
        dataUser.release(elem, name);
    }

}, hAzzle);

// Expand hAzzle Core

hAzzle.extend({

    /**
     * Getter/setter of a data entry value on the hAzzle Object.
     * HTML5 data-* attribute if it exists
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

                data = dataUser.get(elem);

                if (elem.nodeType === 1 && !dataPriv.get(elem, 'hasDataAttrs')) {

                    i = attrs.length;

                    while (i--) {

                        if (attrs[i]) {

                            name = attrs[i].name;

                            if (name.indexOf('data-') === 0) {

                                name = hAzzle.camelize(name.slice(5));
                                dataAttr(elem, name, data[name]);
                            }
                        }
                    }

                    dataPriv.set(elem, 'hasDataAttrs', true);
                }
            }

            return data;
        }

        // Sets multiple values

        if (typeof key === 'object') {

            return this.each(function() {
                dataUser.set(this, key);
            });
        }

        return hAzzle.setter(this, function(value) {

            var data, camelKey = hAzzle.camelize(key);

            if (elem && value === undefined) {

                data = dataUser.get(elem, key);

                if (data !== undefined) {

                    return data;
                }

                data = dataUser.get(elem, camelKey);

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
                var data = dataUser.get(this, camelKey);
                dataUser.set(this, camelKey, value);
                if (key.indexOf('-') !== -1 && data !== undefined) {
                    dataUser.set(this, key, value);
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
            dataUser.release(this, key);
        });
    }
});


/* =========================== INTERNAL ========================== */

function dataAttr(elem, key, data) {
    var name;

    if (data === undefined && elem.nodeType === 1) {

        name = 'data-' + key.replace(charRegEx, '-$1').toLowerCase();

        data = elem.getAttribute(name);

        if (typeof data === 'string') {
            try {
                data = data === 'true' ? true :
                    data === 'false' ? false :
                    data === 'null' ? null :
                    // Only convert to a number if it doesn't change the string
                    +data + '' === data ? +data :
                    htmlRegEx.test(data) ? hAzzle.parseJSON(data) :
                    data;
            } catch (e) {}

            // Make sure we set the data so it isn't changed later
            dataUser.set(elem, key, data);
        } else {
            data = undefined;
        }
    }
    return data;
}