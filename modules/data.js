/** 
 * Data
 *
 * Save data on elements
 *
 * I tried to make this module so simple and fast as possible. And I don't like to publish data to the rest of the world. THEREFOR
 * hAzzle *only* store data on elements, and not with the HTML5 attribute. However. hAzzle collects data from the HTML5 data- attribute
 * as a fallback if no key present.
 *
 * Shoot me if I'm wrong, but I did this because the developer who use hAzzle lib, can set data on the HTML 5 data- attribute. If so,
 * we get it, save it internally and return it's value. When we save data on that object again, we save the normal way.
 * This should be the fastest, and most safest method I guess.
 *
 */
;
(function ($) {

    // Extend the hAzzle object

    $.extend({
        _data: {},
        /**
         * Check if an element contains data
         *
         * @param{String/Object} elem
         * @param{String} key
         * @return {Object}
         */
        hasData: function (elem) {

            if (elem.nodeType) {
                if ($._data[$.getUID(elem)]) {

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

            if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem)) {

                if (!elem instanceof $) {
                    elem = $(elem);
                }

                var id = $.getUID(elem);

                if (id) {

                    if (typeof key === "undefined" && $.nodeType(1, elem)) {

                        $._data[id] = {};

                    } else {

                        if ($._data[id]) {
                            delete $._data[id][key];
                        } else {
                            $._data[id] = null;
                        }
                    }

                }
            }
        },

        data: function (elem, key, value) {

            if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem)) {

                var id = $._data[$.getUID(elem)];

                // Create and unique ID for this elem

                if (!id && elem.nodeType) {
                    var pid = $.getUID(elem);
                    id = $._data[pid] = {};
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
                $.removeData(this, key);
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

            if (typeof key === "undefined") {

                var data = $.data(this[0]),
                    elem = this[0];

                if (hAzzle.nodeType(1, elem) && !$.data(elem, "parsedAttrs")) {

                    var attr = elem.attributes,
                        name,
                        i = 0,
                        l = attr.length;

                    for (; i < l; i++) {

                        name = attr[i].name;

                        if (name.indexOf("data-") === 0) {

                            name = $.camelCase(name.substring(5));

                            data = data[name];

                            // Try to fetch data from the HTML5 data- attribute

                            if (data === undefined && hAzzle.nodeType(1, elem)) {

                                var name = "data-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();

                                data = elem.getAttribute(name);

                                if (typeof data === "string") {
                                    try {
                                        data = data === "true" ? true :
                                            data === "false" ? false :
                                            data === "null" ? null : +data + "" === data ? +data :
                                            /(?:\{[\s\S]*\}|\[[\s\S]*\])$/.test(data) ? $.parseJSON(data) : data;
                                    } catch (e) {}

                                    // Make sure we set the data so it isn't changed later

                                    $.data(elem, key, data);

                                } else {
                                    data = undefined;
                                }
                            }
                            return data;
                        }
                    }
                    $.data(elem, "parsedAttrs", true);
                }

                // 'key' defined, but no 'data'.

            } else if (typeof value === "undefined") {

                if (this.length === 1) {

                    return $.data(this.elems[0], key);

                } else {

                    // Sets multiple values

                    return this.elems.map(function (el) {

                        return $.data(el, key);

                    });
                }

            } else {

                return $.data(this[0], key, value);
            }
        }

    });

})(hAzzle);