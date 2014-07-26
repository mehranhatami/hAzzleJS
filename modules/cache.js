/**
 * cache.js
 *
 *
 * This function is the cacing mechanism we will be using in compile.js an perhaps in another hAzzle modules
 *
 */
(function (window, undefined) {
  /*
   *
   * This is sort of what I have as my Map structure in fixmvc
   * but I spent more time on that to make it more useful
   * and I like to here your feedback on it.
   * BUT considering that it is not the last state of the code
   * and I know there are still some roomsfor improvements in terms of performance
   * I mean here what I think is worth noting is the algoritm
   * and the win we would have if we use it to prevent looping over lists an arrays
   *
   * These are couple of certain use cases:
   *
   * var cacheMap = createCacheMap();
   *
   * //add your key value pair to the cache
   * cacheMap('mykey', myobject);
   *
   *
   * //then having access to both keys and values
   *
   * //for keys:
   * var mykey = cacheMap(myobject);
   * //or
   * var mykey = cacheMap.key(myobject);
   *
   * //for values:
   * //
   * var myobject = cacheMap('mykey');
   * //or
   * var myobject = cacheMap.val(myobject);
   *
   * You can also use objects as keys, this is what I think could be really useful to make things faster
   * cacheMap(obj1, obj2);
   *
   * then you could have access to any of them passing the other one as the parameter:
   *
   * cacheMap(obj1)//--> this would result obj2
   *
   * cacheMap(obj2)//--> this would result obj1
   *
   * This could make things faster because I am doing it with no loop or iteration.
   *
   * //IF YOU HAVE JUST AN OBJECT WITH NO SPECIFIC KEY YOU CAN STORE IT IN THE CACHE LIKE:
   * cacheMap(myobject);
   *
   * then if it is not a key object for another object it will generate a unique key for you
   *
   */
  // Mehran!! For objects sent into this module / script, you need to make sure it's
  // an Object and not a look-a-like. 
  // 
  // You can do it like this:
  // 
  // if(hAzzle.type(Mehran) === "object") OBJECT
  //

  var types = {},
    cacheKey = '___cachekey___',

    objKeyPrefix = 'obj:',

    storePrototype = {
      'undefined': undefined,
      'null': null,
      'false': false,
      'true': true
    };

  function mapProperty(value) {

    //Prevent it from duplication

    var prop = mapProperty.prop;

    if (prop === undefined) {

      prop = {
        enumerable: false,
        writable: false,
        configurable: false,
        value: null
      };

      mapProperty.prop = prop;
    }

    prop.value = value;

    return prop;
  }

  function createMapStorage() {

    //There will be more code here

    // Mehran! I look forward to see that code :)

    return Object.create(storePrototype);
  }

  function Cache() {
    this.storage = createMapStorage();
  }
  hAzzle.extend({
    key: function (obj) {

      var k = obj[cacheKey];

      if (k) {

        if (k.indexOf(objKeyPrefix) === 0) {

          k = k.substring(objKeyPrefix.length);

          return this.val(k);
        }
        return obj[cacheKey];
      }
      return null;
    },

    val: function (key) {
      var keyObj,
        ktype,
        storage = this.storage;

      if (key === null) {
        return null;
      }

      ktype = hAzzle.type(key);

      if (ktype === 'object' ||
        ktype === 'function') {

        keyObj = this.key(key);

        if (keyObj) {

          key = objKeyPrefix + keyObj;
        }
      }

      if (storage.hasOwnProperty(key)) {

        return storage[key];
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

      if (arguments.length === 1) {

        // Awfull !! :( :(  Wrap it up inside an object or do some makeover!!

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

          //Kenny! Here I needed a way to create a unique key so if you have any faster way of acheiving 
          //        key = hAzzle.pnow() + '';

          // Mehran!  Is this solution better for you???

          key = hAzzle.getID(true, 'cache_') + '';


          //Kenny it is a temporary solution to define a non enumerable and non configurable property on an existing object
          //I probably have to create a method to make cross-browser
          //In terms of performance as far as it happens just once when we store an object or a function in cache
          //I don't think it is a performance killer
          //The other point is about not modifying the object that we don't own,
          //although here the new property gets defined on the value object is not enumerable and writable
          //but it is still a kind of modifying the object
          //I have a solution for that as well, to define a property for an object without modifying the object
          //which will be done in the near furture!
          //I like to here your feedback

          // Mehran!! This is already cross-browser. Have a look at the storage.js and you will see I do the same there

          Object.defineProperty(value, cacheKey, mapProperty(key));

          storage[key] = value;

          return key;
        }
      } else {
        //These are all hardcoded here but the main solution
        //will be having all the types on top of the module definition

        // Mehran, why do it so hard?? Look at the bottom and top of this file too see the magic I did :)

        if (types[valueType]) {

          val = value;

          //Kenny! I know it is not a really good practice and I will fix it later
          //but the main idea is preventing primitive values from getting stored directly
          value = {
            valueOf: (function (val) {
              return function () {
                return val;
              };
            }(val))
          };
        }

        if (keyType === 'object' || keyType === 'function') {
          key = objKeyPrefix + this.cache(key);
        }

        Object.defineProperty(value, cacheKey, mapProperty(key));

        storage[key] = value;

        return key;
      }
    }
  }, Cache.prototype);

  function createCache() {
    return (function (cacheObj) {

      return function () {
        return cacheObj.cache.apply(cacheObj, arguments);
      };

    }(new Cache()));
  }


  // Expand the 'type' object

  hAzzle.each(['null', 'boolean', 'undefined', 'string', 'number'], function (name) {

    types[name] = true;

  });

  hAzzle.extend({

    Cache: Cache,

    createCache: createCache

  }, hAzzle);

})(this);