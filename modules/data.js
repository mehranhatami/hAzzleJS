/** 
 * Data
 */
 
var htmlRegEx = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
    charRegEx = /([A-Z])/g,

    // We use dataStorage Object to avoid  exposing 
    // of internal data to the global hAzzle Object

    dataStorage = {

        UID: 1,

        cache: {},

        // Set / Get Unique ID

        getID: function (elem) {

            // Always return 0 if el === window

            if (elem === window) {

                return 0;
            }

            if (typeof elem.hAzzleID === 'undefined') {

                elem.hAzzleID = 'hAzzle_' + dataStorage.UID++;
            }

            return elem.hAzzleID;
        },

        // Accepted nodeTypes

        accepted: function (elem) {

            if (elem && (elem.nodeType === 1 ||
                elem.nodeType === 9 ||
                !elem.hasOwnProperty('nodeType'))) {
                return true;
            }

            return false;
        }
    };

hAzzle.extend({

    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */

    hasData: function (elem) {

        if (elem.nodeType) {

            if (dataStorage.cache[dataStorage.getID(elem)]) {

                return true;

            } else {

                return false;
            }
        }
    },

    /**
     * Remove data from an element
     *
     * @param {String/Object} elem
     * @param {String} key
     * @return {Object}
     */

    removeData: function (elem, key) {

        if (dataStorage.accepted(elem)) {

            // get / create unique ID for this element

            var id = dataStorage.getID(elem);

            // Nothing to do if there are no data on the element

            if (dataStorage.cache[id]) {

                if (key === undefined) {

                    dataStorage.cache[id] = {};

                } else {

                    if (dataStorage.cache[id]) {

                        delete dataStorage.cache[id][key];

                    } else {

                        dataStorage.cache[id] = null;
                    }
                }
            }
        }
    },

    data: function (elem, key, value) {

        if (dataStorage.accepted(elem)) {

            var id = dataStorage.cache[dataStorage.getID(elem)];

            // Create and unique ID for this elem

            if (!id && elem.nodeType) {
                var pid = dataStorage.getID(elem);
                id = dataStorage.cache[pid] = {};
            }

            // Return all data on saved on the element

            if (typeof key === 'undefined') {

                return id;
            }

            if (typeof value === 'undefined') {

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
        var len = arguments.length;

        // If no arguments, try to get the data from the HTML5 data- attribute

        if (!len) {

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
                            getDataAttr(elem, name, data[name]);
                        }
                    }
                }

                hAzzle.data(elem, "parsedAttrs", true);
            }
            // 'key' defined, but no 'data'.

        } else if (len === 1) {

            if (this.length === 1) {

                return hAzzle.data(this[0], key);

            } else {

                // Set multiple values

                return this.map(function (el) {

                    return hAzzle.data(el, key);
                });
            }

        } else {

            return hAzzle.data(this[0], key, value);
        }
    }

});

/* =========================== INTERNAL ========================== */

function getDataAttr(elem, key, data) {
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
            hAzzle.data(elem, key, data);

        } else {

            data = undefined;
        }
    }
    return data;
}