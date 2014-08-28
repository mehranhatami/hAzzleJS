/**
 * hAzzle's caching engine
 */
var
  splice = Array.prototype.splice,
  types = {

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

function resetStorage(self) {

  var hasIndexArray = hAzzle.isArray(self.keys);

  if (hasIndexArray && self.keys.length === 0) {
    return;
  }

  //free up the memory
  if (self.hasOwnProperty('storage')) {
    self.storage = undefined;
    delete self.storage;
  }

  if (hasIndexArray) {
    self.keys = undefined;
    delete self.keys;
  }

  self.storage = createMapStorage();
  self.keys = [];
}

function storeTheKey(self, key) {
  var keys = self.keys,
    len = keys.push(key);

  if (self.hasBound && len > maxCacheLength) {
    self.del(keys[0]);
  }
}

function isDummy(obj) {
  return !!hAzzle.private(obj, '[[hAzzleDummy]]');
}

function createMapStorage() {
  return Object.create(storePrototype);
}

function Cache(hasBound) {
  this.storage = createMapStorage();
  this.keys = [];
  this.hasBound = (hasBound === undefined) ? true : false;
}

/* ============================ PRIVATE FUNCTIONS =========================== */
function createCache() {
  return new Cache();
}

/* ============================ PROTOTYPE CHAIN =========================== */

Cache.prototype = {

  innerCache: null,

  size: function () {
    return this.keys.length;
  },

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

  has: function (key) {
    var keyObj,
      ktype = hAzzle.type(key),
      storage = this.storage;

    if (ktype === 'object' ||
      ktype === 'function') {

      if (this.innerCache === null) {
        return false;
      }

      keyObj = this.innerCache.key(key);

      if (keyObj) {

        key = objKeyPrefix + keyObj;
      }
    }

    return storage.hasOwnProperty(key);
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

      if (this.innerCache === null) {
        return undefined;
      }

      keyObj = this.innerCache.key(key);

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

    return undefined;
  },

  clear: function clear() {
    resetStorage(this);
  },

  del: function del(key) {

    var storage = this.storage,
      keyObj,
      ktype = hAzzle.type(key),
      keys, index, length, keyVal;

    if (ktype === 'object' ||
      ktype === 'function') {

      if (this.innerCache === null) {
        return false;
      }

      keyObj = this.innerCache.key(key);

      if (keyObj) {
        key = objKeyPrefix + keyObj;
      } else {
        return false;
      }

    }

    if (storage.hasOwnProperty(key)) {

      storage[key] = undefined;

      delete storage[key];

      //remove from keys
      keys = this.keys;
      index = -1;
      length = keys.length;
      while (++index < length) {
        keyVal = keys[index];
        if (keyVal === key) {
          splice.call(keys, index--, 1);
          break;
        }
      }

      if (keyObj) {
        this.del(keyObj);
      }

      return true;
    }

    return false;

  },

  cache: function cache(key, value) {

    var storage = this.storage,
      keyType = hAzzle.type(key),
      valueType = hAzzle.type(value),
      val;

    if (arguments.length === 1) {

      value = key;

      key = '[[' + hAzzle.getID(true, 'cache_') + ']]';

      this.cache(key, value);

      return key;

    } else {

      storeTheKey(this, key);

      if (types[valueType]) {

        val = value;

        //This case needs 
        value = hAzzleDummy(val);
      }

      if (keyType === 'object' ||
        keyType === 'function') {

        if (this.innerCache === null) {
          this.innerCache = createCache(this.hasBound);
        }

        key = objKeyPrefix + this.innerCache.cache(key);
      }

      hAzzle.private(value, cacheKey, key);

      storage[key] = value;

      if (types[valueType]) {
        value = value.valueOf();
      }

      return value;
    }
  }
};

// Expand to the global hAzzle Object

hAzzle.createCache = createCache;
hAzzle.Cache = Cache;
hAzzle.localCache = createCache;