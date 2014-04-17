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

    if (!hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || !(+elem.nodeType)) {
        return 0;
    }

    // Get or create and unique ID
    var id = hAzzle.getUID(elem),
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

function get(elem, key) {

    var obj = storage[hAzzle.getUID(elem)];

    if (!obj) {

        return;
    }

    // If no key, return all data stored on the object

    if (arguments.length === 1) {

        return obj;

    } else {

        return obj[key];
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

    // If no key, remove all data

    if (key === undefined && hAzzle.nodeType(1, elem)) {
        storage[id] = {};

    } else {

        if (storage[id]) {
            delete storage[id].key;
        } else {
            storage[id] = null;

        }
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
        if (elem.nodeType) {
            if (storage[hAzzle.getUID(elem)]) return true;

            else {

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
        if (elem instanceof hAzzle) {
            if (remove(elem, key)) return true;
        } else if (remove(hAzzle(elem), key)) return true;
        return false;
    },

    data: function (elem, key, value) {
		
     if(typeof value === 'undefined') {
		 
		 return get(elem, key)

	 } else {
		 
		 set(elem, key, value)
	}

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