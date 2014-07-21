/*!
* HTML5 lLocaleStorage
*/
    var // Common 5MB localStorage

        defaultSize = 5242880;

    hAzzle.extend({

        /**
         * Convert bytes to human readable KB / MB / GB
         */

        bytesToSize: function (bytes) {
            var k = 1000,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

            if (bytes === 0) {

                return '0 Bytes';
            }
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        },

        /**
         * Removes all key / value pairs from localStorage
         */

        clearStorage: function () {
            localStorage.clear();
        },

        /**
         * Returns an array of keys currently stored in localStorage.
         */

        storageContains: function (key) {

            if (key && typeof key === "string") {
                return hAzzle.inArray(this.getStorageKeys(), key) !== -1;
            }
        },

        /**
         * Returns an array of keys currently stored in localStorage.
         */

        getStorageKeys: function () {

            var result = [],
                i = 0;

            for (i = localStorage.length; i--;) {
                result.push(localStorage.key(i));
            }

            return result;
        },

        /**
         * Returns an approximation of how much space is left in localStorage
         */

        getRemainingStorageSpace: function () {
            return this.bytesToSize(defaultSize - this.getStorageSize(true));
        },

        /**
         * Returns the size of the total contents in localStorage.
         *
         */

        getStorageSize: function ( /*INTERNAL*/ pure) {

            if (pure) {

                return JSON.stringify(localStorage).length;

            } else { // Human readable

                return this.bytesToSize(JSON.stringify(localStorage).length);
            }
        },

        /**
         *  Returns true if localStorage has no key/value pairs
         */

        isStorageEmpty: function () {
            return this.getStorageKeys().length === 0;
        },

        /**
         * Removes the specified key/value pair
         */

        removeStorage: function (key) {

            if (!key) {

                return;
            }

            if (typeof key === "string") {

                localStorage.removeItem(key);

            } else if (hAzzle.isArray(key)) {

                var i = key.length;

                while (i--) {

                    if (typeof key[i] === "string") {

                        localStorage.removeItem(key[i]);
                    }
                }
            }
        },

        /**
         * Returns the proper-type value of a specified key
         */
        getStorage: function (key, defaultValue) {

            if (key && typeof key === "string") {

                var value = localStorage.getItem(key).toLowerCase(), // retrieve value
                    number = parseFloat(value); // to allow for number checking

                if (value === null) {

                    // Returns default value if key is not set, otherwise returns null
                    return arguments.length === 2 ? defaultValue : null;
                }

                if (!hAzzle.IsNaN(number)) {

                    return number; // value was of type number
                }

                if (value === 'true' || value === 'false') {
                    return value === 'true'; //value was of type boolean
                }

                try {
                    value = JSON.parse(value + "");
                    return value;

                } catch (e) {

                    return value;
                }
            }

        },

        /**
         * Stores a given object in localStorage, allowing access to individual object properties
         **/

        setStorage: function (key, value) {

            if (arguments.length === 1) {

                this.store(key);

            } else if (key && typeof key === "string") {

                if (typeof value === "object") {

                    value = JSON.stringify(value);
                }

                localStorage.setItem(key, value);
            }
        },

        /**
         * Saves a given object in localStorage, allowing access to individual object properties
         **/

        saveStorage: function (value) {
            var property;

            if (value && typeof value === "object" && !(value instanceof Array)) {
                for (property in value) {
                    localStorage.setItem(property, value[property]);
                }
            }
        },

        /**
         * Returns an object representation of the current state of localStorage
         *
         */

        StorageToObject: function () {

            var o = {},
                keys = this.getStorageKeys(),
                i = keys.length;

            while (i--) {
                o[keys[i]] = this.getStorage(keys[i]);
            }

            return o;
        }

    }, hAzzle);
