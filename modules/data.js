var storage = {};

/**
 * Store data on an element
 *
 * @param{Object} elem
 * @param{String} key
 * @param{String} value
 * @return {Object}
 */

function set(element, key, value) {
    var id = hAzzle.getUID(element),
        obj = storage[id] || (storage[id] = {});
    obj[key] = value;
}

/**
 * Get data from an element
 *
 * @param{Object} elem
 * @param{String} key
 * @return {Object}
 */

function get(element, key) {
    var obj = storage[hAzzle.getUID(element)];
    return key === null ? obj : obj && obj[key]
}

/**
 * Check if an element contains any data
 *
 * @param{Object} elem
 * @param{String} key
 * @return {Object}
 */

function has(element, key) {
    var obj = storage[hAzzle.getUID(element)];
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


function remove(element, key) {
    var id = hAzzle.getUID(element);
    if (key === undefined && hAzzle.nodeType(1, element)) {
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
            if (has(elem, key)) return true;
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
            if (remove(elem, key)) return true;
        } else if (remove(hAzzle(elem)[0], key)) return true;
        return false;
    },

    data: function (elem, key, value) {
        return hAzzle.isDefined(value) ? set(elem, key, value) : get(elem, key);
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
        this.each(function () {
            remove(this, key);
        });
        return this;
    },

    /**
     * Store random data on the hAzzle Object
     *
     * @param {String} key
     * @param {String|Object} value
     *
     * @return {Object|String}
     *
     */

    data: function (key, value) {
        return hAzzle.isDefined(value) ? (this.each(function () {
            set(this, key, value);
        }), this) : this.elems.length === 1 ? get(this.elems[0], key) : this.elems.map(function (value) {
            return get(value, key);
        });
    }

});