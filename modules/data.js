/** 
 * Data
 */

   var isUndefined = hAzzle.isUndefined,
       nodeType = hAzzle.nodeType,
       html5Json = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/;

    // Extend the hAzzle object

    hAzzle.extend({
		
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
                if (hAzzle._data[hAzzle.getUID(elem)]) {

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

            if (nodeType(1, elem) || nodeType(9, elem) || !( +elem.nodeType )) {

                if (!elem instanceof hAzzle) {
                    elem = hAzzle(elem);
                }

                var id = hAzzle.getUID(elem);
           
		   // Nothing to do if there are no data stored on the elem itself
           
		        if (hAzzle._data[id]) {

                    if (isUndefined(key) && nodeType(1, elem)) {

                        hAzzle._data[id] = {};

                    } else {

                        if (hAzzle._data[id]) {
                            delete hAzzle._data[id][key];
                        } else {
                            hAzzle._data[id] = null;
                        }
                    }

                }
            }
        },

        data: function (elem, key, value) {

            if (nodeType(1, elem) || nodeType(9, elem) || !( +elem.nodeType )) {

                var id = hAzzle._data[hAzzle.getUID(elem)];

                // Create and unique ID for this elem

                if (!id && elem.nodeType) {
                    var pid = hAzzle.getUID(elem);
                    id = hAzzle._data[pid] = {};
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

    hAzzle.extend(hAzzle.fn, {

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
           var len = arguments.length,
                keyType = typeof key;
				
           // If no arguments, try to get the data from the HTML5 data- attribute
           
		   if (!len) {

                var data = hAzzle.data(this[0]),
                    elem = this[0];

                if (nodeType(1, elem) && !hAzzle.data(elem, "parsedAttrs")) {

                    var attr = elem.attributes,
                        name,
                        i = 0,
                        l = attr.length;

                    for (; i < l; i++) {

                        name = attr[i].name;

                        if (name.indexOf("data-") === 0) {

                            name = hAzzle.camelCase(name.substr(5));

                            data = data[name];

                            // Try to fetch data from the HTML5 data- attribute

                            if (isUndefined(data) && nodeType(1, elem)) {

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

                                    hAzzle.data(elem, key, data);

                                } else {
                                    data = undefined;
                                }
                            }
                            return data;
                        }
                    }
					
                    hAzzle.data(elem, "parsedAttrs", true);
                }

                // 'key' defined, but no 'data'.

            } else if (len === 1) {

                if (this.length === 1) {

                    return hAzzle.data(this.elems[0], key);

                } else {

                    // Sets multiple values

                    return this.elems.map(function (el) {

                        return hAzzle.data(el, key);

                    });
                }

            } else if(len === 2) {

                return hAzzle.data(this[0], key, value);
            }
			
			 hAzzle.error("Something went wrong!");
        }

    });