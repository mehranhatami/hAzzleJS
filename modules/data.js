/** 
 * Data
 */

; (function ($) {

   var isUndefined = $.isUndefined,
       html5Json = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/;

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

            if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || !( +elem.nodeType )) {

                if (!elem instanceof $) {
                    elem = $(elem);
                }

                var id = $.getUID(elem);
           
		   // Nothing to do if there are no data stored on the elem itself
           
		        if ($._data[id]) {

                    if (isUndefined(key) && $.nodeType(1, elem)) {

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

            if (hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || !( +elem.nodeType )) {

                var id = $._data[$.getUID(elem)];

                // Create and unique ID for this elem

                if (!id && elem.nodeType) {
                    var pid = $.getUID(elem);
                    id = $._data[pid] = {};
                }

                // Return all data on saved on the element

                if (isUndefined(key)) {

                    return id;
                }

                if (isUndefined(value)) {

                    return id[key];
                }

                if ( ! isUndefined(value)) {

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

            if (isUndefined(key)) {

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

                            name = $.camelCase(name.substr(5));

                            data = data[name];

                            // Try to fetch data from the HTML5 data- attribute

                            if ($.isUndefined(data) && $.nodeType(1, elem)) {

                                var name = "data-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();

                                data = elem.getAttribute(name);

                                if (typeof data === "string") {
                                    try {
                                        data = data === "true" ? true :
                                            data === "false" ? false :
                                            data === "null" ? null : +data + "" === data ? +data :
                                            html5Json.test(data) ? JSON.parse(data + "") : data;
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

            } else if (isUndefined(value)) {

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