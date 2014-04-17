/**
 * Locale storage
 * HTML5 API
 */
 
var storage = {},
    storage_size = 0,
    timeout = null;


/**
 * Save data to the localeStorage
 */
function saveIt() {
    localStorage.hAzzle_storage = JSON.stringify(storage);
    storage_size = localStorage.hAzzle_storage ? String(localStorage.hAzzle_storage).length : 0;
    return true;
}


/**
 * Reload data from storage when needed
 */
function reloadData() {
    load_storage();
    removeStorageKeys();
}


function load_storage() {

    var source = localStorage.hAzzle_storage;

    storage = hAzzle.parseJSON(source) || {};

    storage_size = source ? String(source).length : 0;
}

/**
 * Remove key from the storage
 */


function removeStorageKeys() {

    var curtime, i, len, expire, keys, nextExpire = Infinity,
        expiredKeysCount = 0;

    clearTimeout(timeout);

    if (!storage || !storage.__hAzzle_storage || !storage.__hAzzle_storage.TTL) {
        return;
    }

    curtime = +new Date();
    keys = storage.__hAzzle_storage.TTL.keys || [];
    expire = storage.__hAzzle_storage.TTL.expire || {};

    for (i = 0, len = keys.length; i < len; i++) {
        if (expire[keys[i]] <= curtime) {
            expiredKeysCount++;
            delete storage[keys[i]];
            delete expire[keys[i]];
        } else {
            if (expire[keys[i]] < nextExpire) {
                nextExpire = expire[keys[i]];
            }
            break;
        }
    }

    // set next check
    if (nextExpire !== Infinity) {
        timeout = setTimeout(removeStorageKeys, Math.min(nextExpire - curtime, 0x7FFFFFFF));
    }

    // remove expired from TTL list and save changes
    if (expiredKeysCount) {
        keys.splice(0, expiredKeysCount);

        cleanMetaObject();
        saveIt();
    }
}




function setTTL(key, ttl) {
    var curtime = +new Date(),
        i, len, added = false;

    ttl = Number(ttl) || 0;

    // Set TTL value for the key
    if (ttl !== 0) {
        // If key exists, set TTL
        if (storage.hasOwnProperty(key)) {

            if (!storage.__hAzzle_storage) {
                storage.__hAzzle_storage = {};
            }

            if (!storage.__hAzzle_storage.TTL) {
                storage.__hAzzle_storage.TTL = {
                    expire: {},
                    keys: []
                };
            }

            storage.__hAzzle_storage.TTL.expire[key] = curtime + ttl;

            // remove from keys array
            if (storage.__hAzzle_storage.TTL.expire.hasOwnProperty(key)) {
                for (i = 0, len = storage.__hAzzle_storage.TTL.keys.length; i < len; i++) {
                    if (storage.__hAzzle_storage.TTL.keys[i] == key) {
                        storage.__hAzzle_storage.TTL.keys.splice(i);
                    }
                }
            }

            // add to keys array, sorted by ttl
            for (i = 0, len = storage.__hAzzle_storage.TTL.keys.length; i < len; i++) {
                if (storage.__hAzzle_storage.TTL.expire[storage.__hAzzle_storage.TTL.keys[i]] > curtime + ttl) {
                    storage.__hAzzle_storage.TTL.keys.splice(i, 0, key);
                }
            }

            if (!added) {
                storage.__hAzzle_storage.TTL.keys.push(key);
            }
        } else {
            return false;
        }
    } else {
        // Remove TTL if set
        if (storage && storage.__hAzzle_storage && storage.__hAzzle_storage.TTL) {

            if (storage.__hAzzle_storage.TTL.expire.hasOwnProperty(key)) {
                delete storage.__hAzzle_storage.TTL.expire[key];
                for (i = 0, len = storage.__hAzzle_storage.TTL.keys.length; i < len; i++) {
                    if (storage.__hAzzle_storage.TTL.keys[i] == key) {
                        storage.__hAzzle_storage.TTL.keys.splice(i, 1);
                        break;
                    }
                }
            }

            cleanMetaObject();
        }
    }

    // schedule next TTL check
    clearTimeout(timeout);
    if (storage && storage.__hAzzle_storage && storage.__hAzzle_storage.TTL && storage.__hAzzle_storage.TTL.keys.length) {
        timeout = setTimeout(removeStorageKeys, Math.min(Math.max(storage.__hAzzle_storage.TTL.expire[storage.__hAzzle_storage.TTL.keys[0]] - curtime, 0), 0x7FFFFFFF));
    }

    return true;
}

function cleanMetaObject() {
    var updated = false,
        hasProperties = false,
        i;

    if (!storage || !storage.__hAzzle_storage) {
        return updated;
    }

    // If nothing to TTL, remove the object
    if (storage.__hAzzle_storage.TTL && !storage.__hAzzle_storage.TTL.keys.length) {
        delete storage.__hAzzle_storage.TTL;
        updated = true;
    }

    // If meta object is empty, remove it
    for (i in storage.__hAzzle_storage) {
        if (storage.__hAzzle_storage.hasOwnProperty(i)) {
            hasProperties = true;
            break;
        }
    }

    if (!hasProperties) {
        delete storage.__hAzzle_storage;
        updated = true;
    }

    return updated;
}

hAzzle.extend({

    /**
     * Retrive data from localeStorage during page refresh
     */

    pageLoad: function () {

        // Load data from storage
        load_storage();

        // remove dead keys
        removeStorageKeys();

        // start listening for changes

        hAzzle(window).on("storage", reloadData);

        // Remove the listener after loading

        hAzzle(window).one('pageshow', function (event) {

            if (event.persisted) {
                reloadData();
            }
        }, false);
    },

    /** Store, update or retrive a value in the local storage.
     *
     * @param {String} key
     * @param {String} value
     * @param {Number} ttl
     *
     */

    storage: function (key, value, ttl) {

        var len = arguments.length;

        if (len === 1) {

            if (storage.hasOwnProperty(key) && key != "__hAzzle_storage") {
                // TTL value for an existing key is either a positive number or an Infinity
                if (this.getTTL(key)) {
                    return storage[key] && storage[key];
                }
            }


        } else if (len >= 2) {

            if (key == "__hAzzle_storage") {
                return false;
            }

            if (!storage) {
                return false;
            }

            // undefined values are deleted automatically
            if (typeof value == "undefined") {
                return this.deleteKey(key);
            }

            // Check if the value is JSON compatible (and remove reference to existing objects/arrays)

            if (hAzzle.isObject(value)) {

                value = hAzzle.parseJSON(JSON.stringify(value));
            }

            storage[key] = value;

            if (ttl) {

                setTTL(key, ttl || 0);

            }

            return saveIt();
        }

        return;
    },

    /**
     * Delete key from the Storage
     *
     * @param {String} key
     */

    deleteKey: function (key) {
        return storage ? key in storage ? (delete storage[key], setTTL(key, 0), saveIt()) : false : false;
    },

    /**
     * Set a millisecond timeout on a key in the Storage
     *
     * @param {String} key
     * @param {Number} ttl
     */

    setTTL: function (key, ttl) {
      return storage ? (setTTL(key, ttl), saveIt()) : false; 
    },

    /**
     * Retrieve remaining milliseconds for a key with TTL
     *
     * @param {String} key
     */

    getTTL: function (key) {
        var ttl;

        if (!storage) {
            return false;
        }

        if (storage.hasOwnProperty(key)) {
            if (storage.__hAzzle_storage &&
                storage.__hAzzle_storage.TTL &&
                storage.__hAzzle_storage.TTL.expire &&
                storage.__hAzzle_storage.TTL.expire.hasOwnProperty(key)) {

                ttl = Math.max(storage.__hAzzle_storage.TTL.expire[key] - (+new Date()) || 0, 0);

                return ttl || false;
            } else {
                return Infinity;
            }
        }

        return false;
    },

    /**
     * Clear all values
     * @return {Array}
     */

    flush: function () {
     return storage ? (storage = {}, localStorage.removeItem("hAzzle_storage"), true) : false;
    },

    /**
     * Retrieve all used keys as an array
     */

    storageIndex: function () {
        if (!storage) {
            return false;
        }

        var index = [],
            i;
        for (i in storage) {
            if (storage.hasOwnProperty(i) && i != "__hAzzle_storage") {
                index.push(i);
            }
        }
        return index;
    },

    storageSize: function () {
        return storage_size;
    }

});