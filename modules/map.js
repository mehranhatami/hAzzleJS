/*
 * Not implemented completely
 */
(function () {
  var Map,
    MapIterator;

  Map = function Map() {
    this.mapCache = hAzzle.createCache(false);
  };

  function getKeyValuePair(map, index) {
    var keys = map instanceof Map ? map.keys() : undefined,
      key,
      value;

    if (!keys || !keys.length || index < 0 || index > keys.length - 1) {
      return undefined;
    }

    if (keys.hasOwnProperty(index)) {

      key = keys[index];

      value = map.get(key);

      return [key, value];
    } else {
      return undefined;
    }
  }

  function iterate(iterator) {
    var key,
      value,
      baseMap = iterator.baseMap,
      type = iterator.type;

    if (!(baseMap instanceof Map)) {
      return null;
    }

    if (baseMap.keys.length &&
      iterator.currentPointer < baseMap.keys.length) {

      iterator.currentPointer++;

      if (type === 'entries') {
        value = getKeyValuePair(baseMap, iterator.currentPointer);
      } else if (type === 'keys') {
        value = baseMap.mapCache.keys[iterator.currentPointer];
      } else if (type === 'values') {
        key = baseMap.mapCache.keys[iterator.currentPointer];
        value = baseMap.get(key);
      }
      return {
        done: false,
        value: value
      };
    }

    return {
      done: true,
      value: undefined
    };
  }

  MapIterator = (function () {

    function MapIterator(baseMap, type) {
      this.baseMap = baseMap;
      this.type = type;
      this.currentPointer = -1;
    }

    MapIterator.prototype.baseMap = null;

    MapIterator.prototype.next = function () {
      return iterate(this);
    };

    return MapIterator;

  }());



  var proto = {
    size: 0,

    clear: function () {
      this.mapCache.clear();
    },

    delete: function (key) {
      this.size--;
      return this.mapCache.del(key);
    },


    entries: function () {
      return new MapIterator(this, 'entries');
    },

    forEach: function (callbackFn, thisArg) {
      var key,
        value,
        index = 0,
        size = this.size,
        keys = this.mapCache.keys,
        fn;

      if (size !== keys.length) {
        console.log('Invalid map object!');
        return false;
      }

      fn = !thisArg ? callbackFn : (function (callbackFn, thisArg) {
        return function (value, key, map) {
          return callbackFn.call(thisArg, value, key, map);
        };
      }(callbackFn, thisArg));

      while (index < size) {
        key = keys[index];
        value = this.get(key);
        fn(value, key, this);
        index++;
      }
    },

    get: function (key) {
      return this.mapCache.val(key);
    },

    has: function (key) {
      return this.mapCache.has(key);
    },

    keys: function () {
      return new MapIterator(this, 'keys');
    },

    set: function (key, value) {
      this.size++;
      return this.mapCache.cache(key, value);
    },

    values: function () {
      return new MapIterator(this, 'values');
    }
  };

  Map.prototype = proto;

  hAzzle.Map = Map;

}(this));