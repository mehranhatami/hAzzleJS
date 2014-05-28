/*!
 * HTML5 lLocaleStorage
 */
// Common 5MB localStorage
var win = this,
  doc = win.document,
  defaultSize = 5242880;

// Inital check to see if localStorage is supported in the browser

(function () {
  var supported = false,

    //TODO Kenny: check the slightly different behaviour of the new encodeURI function
    //This is because escape and unescape are deprecated
    escape = encodeURI,
    unescape = decodeURI;

  // Derived from Modernizer (http://github.com/Modernizr/Modernizr)

  try {
    localStorage.setItem('hAzzle', 'hAzzle');
    localStorage.removeItem('hAzzle');
    supported = true;
  } catch (e) {
    supported = false;
  }

  /**
   *  Implements localStorage if not supported
   *
   * NOTE !! We are going to remove this 'shim' in the future. Just now Opera Mini and IE Mobile 9 and older are not supporting this one.
   *
   * From https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Storage?redirectlocale=en-US&redirectslug=DOM%2FStorage
   */

  if (!supported) {
    window.localStorage = {
      getItem: function (sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) {
          return null;
        }
        return unescape(document.cookie.replace(new RegExp('(?:^|.*;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') +
          '\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*'), '$1'));
      },

      key: function (nKeyId) {
        return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, '').split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
      },

      setItem: function (sKey, sValue) {
        if (!sKey) {
          return;
        }
        document.cookie = escape(sKey) + '=' + escape(sValue) + '; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/';
        this.length = document.cookie.match(/\=/g).length;
      },

      length: 0,

      removeItem: function (sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) {
          return;
        }
        document.cookie = escape(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        this.length--;
      },

      // Really bad name, but not my idea :)

      hasOwnProperty: function (sKey) {
        return (new RegExp('(?:^|;\\s*)' + escape(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
      }
    };

    window.localStorage.length = (doc.cookie.match(/\=/g) || window.localStorage).length;
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

    if (key && typeof key === 'string') {
      return hAzzle.indexOf(this.getStorageKeys(), key) !== -1;
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

    if (typeof key === 'string') {

      localStorage.removeItem(key);

    } else if (hAzzle.isArray(key)) {

      var i = key.length;

      while (i--) {

        if (typeof key[i] === 'string') {

          localStorage.removeItem(key[i]);
        }
      }
    }
  },

  /**
   * Returns the proper-type value of a specified key
   */
  getStorage: function (key, defaultValue) {

    if (key && typeof key === 'string') {

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
        value = JSON.parse(value + '');
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

    } else if (key && typeof key === 'string') {

      if (typeof value === 'object') {

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

    if (value && typeof value === 'object' && !(value instanceof Array)) {
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