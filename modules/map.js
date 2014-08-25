/*
 * Not implemented completely
 */
(function () {

  function Map() {
    this.mapCache = hAzzle.createCache(false);
  }

  var proto = {
    size: 0,

    clear: function () {
      this.mapCache.clear();
    },
    delete: function (key) {
      return this.mapCache.del(key);
    },
    entries: function () {

    },
    forEach: function (callbackFn, thisArg) {

    },
    get: function (key) {
      return this.mapCache.val(key);
    },
    has: function (key) {

    },
    keys: function () {
      return this.mapCache.keys;
    },
    set: function (key, value) {
      return this.mapCache.cache(key, value);
    },
    values: function () {

    }
  };

  Map.prototype = proto;

  hAzzle.Map = Map;

}(this));