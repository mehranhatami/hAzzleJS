/**
 * hAzzle's caching engine
 */
var types = {

    'null': 1,
    'boolean': 1,
    'undefined': 1,
    'string': 1,
    'number': 1

  },

  cacheKey = '[[___cachekey___]]',

  objKeyPrefix = '[[obj]]',

  maxCacheLength = 70,

  storePrototype = {
    'undefined': undefined,
    'null': null,
    'false': false,
    'true': true
  };

function hAzzleDummy(val) {
  var obj = {
    valueOf: function () {
      return val;
    }
  };

  hAzzle.private(obj, '[[hAzzleDummy]]', true);

  return obj;
}

function modifyKeys(cacheObject, key) {

  if (cacheObject.keys.push(key) > maxCacheLength) {

    //REVIEW NEEDED: set a maximum cache size to prevent memory leak
    //delete storage[cacheObject.keys.shift()];

  }
}

function isDummy(obj) {
  return !!hAzzle.private(obj, '[[hAzzleDummy]]');
}

function Cache() {

  this.storage = createMapStorage();
  this.keys = [];
}

/* ============================ PROTOTYPE CHAIN =========================== */

Cache.prototype = {

  key: function (obj) {

    var otype = hAzzle.type(obj),
      keyObj;

    if (otype !== 'object' && otype !== 'function') {
      return null;
    }

    keyObj = hAzzle.private(obj, cacheKey);

    if (keyObj) {

      if (keyObj.indexOf(objKeyPrefix) === 0) {

        keyObj = keyObj.slice(objKeyPrefix.length);

        return this.val(keyObj);
      }

      return keyObj;
    }

    return null;
  },

  val: function (key) {

    var keyObj,
      ktype = hAzzle.type(key),
      storage = this.storage,
      val;

    if (key === null) {
      return null;
    }

    if (ktype === 'object' ||
      ktype === 'function') {

      keyObj = this.key(key);

      if (keyObj) {

        key = objKeyPrefix + keyObj;
      }
    }

    if (storage.hasOwnProperty(key)) {
      val = storage[key];

      if (isDummy(val)) {
        return val.valueOf();
      }

      return val;
    }

    return null;
  },

  cache: function cacheMap(key, value) {

    var storage = this.storage,
      keyType = hAzzle.type(key),
      valueType = hAzzle.type(value),
      val,
      keyObj,
      obj;

    modifyKeys(this, key);

    if (arguments.length === 1) {

      if (keyType === 'string' ||
        keyType === 'number') {

        return this.val(key);
      }

      if (keyType === 'boolean' ||
        key === null ||
        key === undefined) {

        return key;
      }

      if (keyType === 'object' || keyType === 'function') {

        keyObj = this.key(key);

        if (keyObj) {

          obj = this.val(objKeyPrefix + keyObj);

          if (obj) {

            return obj;

          } else {

            return keyObj;
          }
        }

        value = key;

        key = '[[' + hAzzle.getID(true, 'cache_') + ']]';

        hAzzle.private(value, cacheKey, key);

        storage[key] = value;

        return key;
      }
    } else {

      if (types[valueType]) {

        val = value;

        //This case needs 
        value = hAzzleDummy(val);
      }

      if (keyType === 'object' ||
        keyType === 'function') {

        key = objKeyPrefix + this.cache(key);
      }

      hAzzle.private(value, cacheKey, key);

      storage[key] = value;

      return value;
    }
  }
};

/* ============================ PRIVATE FUNCTIONS =========================== */
// Create Map Storage

function createMapStorage() {

  return Object.create(storePrototype);
}

function createCache() {
  return new Cache();
}

// Expand to the global hAzzle Object

hAzzle.createCache = createCache;
hAzzle.Cache = Cache;
hAzzle.localCache = createCache;