/*!
 * HTML5 lLocaleStorage
 */
var // Common 5MB localStorage

    defaultSize = 5242880;

// Inital check to see if localStorage is supported in the browser


(function () {
    var supported = false;

    // Derived from Modernizer (http://github.com/Modernizr/Modernizr)

    try {
        localStorage.setItem('hAzzle', 'hAzzle');
        localStorage.removeItem('hAzzle');
        supported = true;
    } catch (e) {
        supported = false;
    }


    if (!supported) {

        var Storage = function (type) {
            function createCookie(name, value, days) {
                var date, expires;

                if (days) {
                    date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toGMTString();
                } else {
                    expires = "";
                }
                document.cookie = name + "=" + value + expires + "; path=/";
            }

            function readCookie(name) {
                var nameEQ = name + "=",
                    ca = document.cookie.split(';'),
                    i, c;

                for (i = 0; i < ca.length; i++) {
                    c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1, c.length);
                    }

                    if (c.indexOf(nameEQ) === 0) {
                        return c.substring(nameEQ.length, c.length);
                    }
                }
                return null;
            }

            function setData(data) {
                data = typeof data !== 'string' ? JSON.stringify(data) : data;
                if (type == 'session') {
                    window.name = data;
                } else {
                    createCookie('localStorage', data, 365);
                }
            }

            function clearData() {
                if (type == 'session') {
                    window.name = '';
                } else {
                    createCookie('localStorage', '', 365);
                }
            }

            function getData() {
                var data = type == 'session' ? window.name : readCookie('localStorage');
                return data || {};
            }


            // initialise if there's already data
            var data = getData();

            return {
                length: 0,
                clear: function () {
                    data = {};
                    this.length = 0;
                    clearData();
                },
                getItem: function (key) {
                    return data[key] === undefined ? null : data[key];
                },
                key: function (i) {
                    // not perfect, but works
                    var ctr = 0;
                    for (var k in data) {
                        if (ctr == i) return k;
                        else ctr++;
                    }
                    return null;
                },
                removeItem: function (key) {
                    delete data[key];
                    this.length--;
                    setData(data);
                },
                setItem: function (key, value) {
                    if (data[key] === undefined) this.length++;
                    data[key] = value + ''; // forces the value to a string
                    setData(data);
                }
            };
        };

        window.localStorage = new Storage('local');
        window.sessionStorage = new Storage('session');
    }
})();

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