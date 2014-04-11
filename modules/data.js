var storage = {};

/**
 * Store data on an element
 *
 * @param{Object} elem
 * @param{String} key
 * @param{String} value
 * @return {Object}
 */

function set(elem, key, value) {

    if (!hAzzle.acceptData(elem)) {
        return 0;
    }

    var id = hAzzle.getUID(elem),
        obj = storage[id] || (storage[id] = {});
    obj[hAzzle.camelCase(key)] = value;
}

/**
 * Get data from an element
 *
 * @param{Object} elem
 * @param{String} key
 * @return {Object}
 */

function get(elem, key) {

    var obj = storage[hAzzle.getUID(elem)];

    if (arguments.length === 1) {
        return obj;
    } else {
        return obj[hAzzle.camelCase(key)];
    }

}

/**
 * Check if an element contains any data
 *
 * @param{Object} elem
 * @param{String} key
 * @return {Object}
 */

function has(elem, key) {
    var obj = storage[hAzzle.getUID(elem)];
    if (key === null) {
        return false;
    }
    if (obj && obj[key]) return true;
}

/**
 * Remove data from an element
 *
 * @param{Object} elem
 * @param{String} key
 * @return {Object}
 */


function remove(elem, key) {
    var id = hAzzle.getUID(elem);
    if (key === undefined && hAzzle.nodeType(1, elem)) {
        storage[id] = {};
    } else {
        var obj = storage[id];
        obj && delete obj[key];
    }
}


hAzzle.extend({

    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */
    hasData: function (elem, key) {

        if (elem instanceof hAzzle) {
            if (has(elem[0], key)) return true;
        } else if (has(hAzzle(elem)[0], key)) return true;
        return false;
    },

    /**
     * Remove data from an element
     *
     * @param {String/Object} elem
     * @param {String} key
     * @return {Object}
     */

    removeData: function (elem, key) {
        if (elem instanceof hAzzle) {
            if (remove(elem[0], key)) return true;
        } else if (remove(hAzzle(elem)[0], key)) return true;
        return false;
    },

    data: function (elem, key, value) {
        len = arguments.length;
        keyType = typeof key;
        len === 1 ? set(elem[0], key, value) : len === 2 && get(elem[0], key);
    },

    /**
     * Get all data stored on an element
     */

    getAllData: function (elem) {
        return get(elem[0]);
    },

    /**
     * Determines whether an object can have data
     */

    acceptData: function (elem) {

        return hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || !(+elem.nodeType);

    }

});

hAzzle.fn.extend({

    /**
     * Remove attributes from element collection
     *
     * @param {String} key
     *
     * @return {Object}
     */

    removeData: function (key) {
        return this.each(function () {
            remove(this, key);
        });
    },

    /**
     * Store random data on the hAzzle Object
     *
     * @param {String} key(s)
     * @param {String|Object} value
     *
     * @return {Object|String}
     *
     */

    data: function (key, value) {


        var len = arguments.length,
            keyType = typeof key;

        if (len === 1) {

            if (this.elems.length === 1) {

                return get(this.elems[0], key);
            } else {

                return this.elems.map(function (value) {
                    return get(value, key);
                });
            }

        } else if (len === 2) {

            return this.each(function () {
                set(this, key, value);
            })
        } else {
            return get(this[0]);
        }
    }

});