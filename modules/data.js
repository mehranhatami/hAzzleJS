/** 
 * Data
 */
var html5Json = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,

    // Unique ID

    uid = {
        current: 0,
        next: function () {
            var id = ++this.current + '';
            return 'hAzzle_' + id;
        }
    },

    getUID = function (el) {

        if (el) {

            return (el.hAzzle_id || (el.hAzzle_id = uid.next()));

        }
    };

// Extend the hAzzle object

hAzzle.extend({

    _cache: {},

    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */

    hasData: function (elem) {
        return elem.nodeType && hAzzle._cache[getUID(elem)] ? true : false;
    },
    /**
     * Remove data from an element
     *
     * @param {String/Object} elem
     * @param {String} key
     * @return {Object}
     */

    removeData: function (elem, key) {

        if (_validate(elem)) {

            if (!elem instanceof hAzzle) {

                elem = hAzzle(elem);
            }

            // get / create unique ID for this element

            var id = getUID(elem);

            // Nothing to do if there are no data stored on the elem itself

            if (hAzzle._cache[id]) {

                if (typeof key === 'undefined' && elem.nodeType === 1) {

                    hAzzle._cache[id] = {};

                } else {

                    if (hAzzle._cache[id]) {

                        delete hAzzle._cache[id][key];

                    } else {

                        hAzzle._cache[id] = null;
                    }
                }

            }
        }
    },

    data: function (elem, key, value) {

        if (_validate(elem)) {

            var pid,
                id = hAzzle._cache[getUID(elem)];

            // Create and unique ID for this elem

            if (!id && elem.nodeType) {

                pid = getUID(elem);
                id = hAzzle._cache[pid] = {};
            }

            // Return all data on the element

            if (key === undefined) {

                return id;
            }

            if (value === undefined) {

                return id[key];
            }

            if (typeof value !== 'undefined') {

                // Set and return the value

                id[key] = value;

                return id[key];
            }
        }
    }
}, hAzzle);

hAzzle.extend({

    /**
     * Remove attributes from element collection
     *
     * @param {String} key
     *
     * @return {Object}
     */

    removeData: function (key) {
        return this.each(function () {
            hAzzle.removeData(this, key);
        });
    },

    /**
     * Getter/setter of a data entry value on the hAzzle Object. Tries to read the appropriate
     * HTML5 data-* attribute if it exists
     * @param  {String|Object|Array}  key(s)
     * @param  {Object}               value
     * @return {Object|String }
     */

    data: function (key, value) {

        // If no params, try to get the data from the HTML5 data- attribute

        if (key === undefined) {

            var data = hAzzle.data(this[0]),
                elem = this[0];

            if (elem.nodeType === 1 && !hAzzle.data(elem, "parsedAttrs")) {

                var attr = elem.attributes,
                    name,
                    i = attr.length;

                while (i--) {

                    if (attr[i]) {

                        name = attr[i].name;

                        if (name.indexOf("data-") === 0) {

                            name = hAzzle.camelize(name.substr(5));

                            data = data[name];

                            // Try to fetch data from the HTML5 data- attribute

                            if (typeof data === 'undefined' && elem.nodeType === 1) {

                                name = "data-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();

                                data = elem.getAttribute(name);

                                if (typeof data === "string") {
                                    try {
                                        data = data === "true" ? true :
                                            data === "false" ? false :
                                            data === "null" ? null :
                                            +data + "" === data ? +data :
                                            html5Json.test(data) ? JSON.parse(data + "") : data;

                                    } catch (e) {}

                                    // Make sure we set the data so it isn't changed later

                                    hAzzle.data(elem, key, data);

                                } else {
                                    data = undefined;
                                }
                            }
                            return data;
                        }
                    }
                }

                hAzzle.data(elem, "parsedAttrs", true);
            }

            // 'key' defined, but no 'data'.

        } else if (typeof key !== 'undefined') {

            if (this.length === 1) {

                return hAzzle.data(this[0], key, value);

            } else {

                // Sets multiple values

                return this.map(function (el) {

                    return hAzzle.data(el, key, value);

                });
            }

        } else {

            return hAzzle.data(this[0], key, value);
        }
    }

});


/* =========================== INTERNAL ========================== */

function _validate(elem) {
    if (elem.nodeType === 1 || elem.nodeType === 9 || !elem.hasOwnProperty('nodeType')) {
        return true;
    }
    return false;
}