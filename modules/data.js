; (function ($) {

var data = {};

/**
 * Store data on an element
 *
 * @param{Object} elem
 * @param{String} key
 * @param{String} value
 * @return {Object}
 */

function set(elem, key, value) {

    if (!$.nodeType(1, elem) || $.nodeType(9, elem) || !(+elem.nodeType)) {
        return 0;
    }

    // Get or create and unique ID
    var id = $.getUID(elem),
        obj = data[id] || (data[id] = {});

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

    var obj = data[$.getUID(elem)];

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
    var obj = data[$.getUID(elem)];
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
    var id = $.getUID(elem);

    // If no key, remove all data

    if (key === undefined && $.nodeType(1, elem)) {
        data[id] = {};

    } else {

        if (data[id]) {
            delete data[id].key;
        } else {
            data[id] = null;

        }
    }
}


    // Extend the hAzzle object

    $.extend({

    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */
    hasData: function (elem, key) {
        if (elem.nodeType) {
            if (data[$.getUID(elem)]) return true;

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
        if (elem instanceof $) {
            if (remove(elem, key)) return true;
        } else if (remove($(elem), key)) return true;
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

$.extend($.fn, {

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

})(hAzzle);