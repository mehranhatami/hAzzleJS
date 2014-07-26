// Storage.js
var expando = hAzzle.expando,
    camelize = hAzzle.camelize,
    WhiteRegex = (/\S+/g),
    htmlRegEx = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    charRegEx = /([A-Z])/g;

/* =========================== PROTOTYPE ========================== */

function Storage() {

    Object.defineProperty(this.cache = {}, 0, {
        get: function() {
            return {};
        }
    });
}

/* =========================== PROTOTYPE CHAIN ========================== */

Storage.prototype = {

    key: function(owner) {

        if (!hAzzle.legalTypes(owner)) {

            return 0;
        }

        var descriptor = {},
            unlock = owner[expando];

        if (!unlock) {

            unlock = Storage.uid++;

            descriptor[expando] = {
                value: unlock
            };

            Object.defineProperties(owner, descriptor);
        }

        if (!this.cache[unlock]) {

            this.cache[unlock] = {};
        }

        return unlock;
    },
    set: function(owner, data, value) {

        var prop,
            unlock = this.key(owner),
            cache = this.cache[unlock];

        if (typeof data === "string") {

            cache[data] = value;

        } else {

            if (hAzzle.isEmptyObject(cache)) {

                hAzzle.shallowCopy(this.cache[unlock], data);

            } else {

                for (prop in data) {

                    cache[prop] = data[prop];
                }
            }
        }
        return cache;
    },
    get: function(owner, key) {

        var cache = this.cache[this.key(owner)];

        return key === undefined ?
            cache : cache[key];
    },
    access: function(owner, key, value) {

        var stored;

        if (key === undefined ||

            ((key && typeof key === "string") && value === undefined)) {

            stored = this.get(owner, key);

            return stored !== undefined ?
                stored : this.get(owner, camelize(key));
        }

        this.set(owner, key, value);

        return value !== undefined ? value : key;
    },
    erease: function(owner, key) {

        var i, name, camel,
            unlock = this.key(owner),
            cache = this.cache[unlock];

        if (key === undefined) {

            this.cache[unlock] = {};

        } else {

            if (hAzzle.isArray(key)) {

                name = key.concat(key.map(camelize));

            } else {

                camel = camelize(key);

                // Try the string as a key before any manipulation

                if (key in cache) {

                    name = [key, camel];

                } else {

                    name = camel;
                    name = name in cache ? [name] : (name.match(WhiteRegex) || []);
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
            this.cache[owner[expando]] || {}
        );
    },
    discard: function(owner) {
        if (owner[expando]) {
            delete this.cache[owner[expando]];
        }
    }
};

Storage.uid = 1;
Storage.accepts = hAzzle.acceptData;

// Make it accessible

var hAzzleData = new Storage();

// Expand the global hAzzle Object

hAzzle.extend({

    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */

    hasData: function(elem) {
        return hAzzleData.hasData(elem);
    },

    data: function(elem, name, data) {
        return hAzzleData.access(elem, name, data);
    },

    /**
     * Remove data from an element
     *
     * @param {String/Object} elem
     * @param {String} key
     * @return {Object}
     */

    removeData: function(elem, name) {
        hAzzleData.erease(elem, name);
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
                data = hAzzleData.get(elem);

                if (elem.nodeType === 1 && !hAzzleData.get(elem, "hasDataAttrs")) {
                    i = attrs.length;

                    while (i--) {
                        if (attrs[i]) {
                            name = attrs[i].name;
                            if (name.indexOf("data-") === 0) {
                                name = camelize(name.slice(5));
                                dataAttr(elem, name, data[name]);
                            }
                        }
                    }
                    hAzzleData.set(elem, "hasDataAttrs", true);
                }
            }

            return data;
        }

        // Sets multiple values

        if (typeof key === "object") {
            return this.each(function() {
                hAzzleData.set(this, key);
            });
        }

        return hAzzle.setter(this, function(value) {
            var data,
                camelKey = camelize(key);

            if (elem && value === undefined) {

                data = hAzzleData.get(elem, key);
                if (data !== undefined) {
                    return data;
                }

                data = hAzzleData.get(elem, camelKey);
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
                var data = hAzzleData.get(this, camelKey);
                hAzzleData.set(this, camelKey, value);
                if (key.indexOf("-") !== -1 && data !== undefined) {
                    hAzzleData.set(this, key, value);
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
            hAzzleData.erease(this, key);
        });
    }
});


/* =========================== INTERNAL ========================== */

function dataAttr(elem, key, data) {
    var name;

    if (data === undefined && elem.nodeType === 1) {
        name = "data-" + key.replace(charRegEx, "-$1").toLowerCase();

        data = elem.getAttribute(name);

        if (typeof data === "string") {
            try {
                data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    // Only convert to a number if it doesn't change the string
                    +data + "" === data ? +data :
                    htmlRegEx.test(data) ? hAzzle.parseJSON(data) :
                    data;
            } catch (e) {}

            // Make sure we set the data so it isn't changed later
            hAzzleData.set(elem, key, data);
        } else {
            data = undefined;
        }
    }
    return data;
}