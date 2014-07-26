/**
 * cache.js
 *
 *
 * This function is the cacing mechanism we will be using in compile.js an perhaps in another hAzzle modules
 *
 */
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
var win = this,

  hAzzle = win.hAzzle;

var cacheKey = '___cachekey___',
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
  return Object.create(storePrototype);
}

function createCacheMap() {

  function cacheMap(key, value) {
    var storage = cacheMap.__storage__,
      keyType = typeof key,
      valueType = typeof value,
      val,
      keyObj,
      obj;

    if (storage === undefined) {
      storage = createMapStorage();
      cacheMap.__storage__ = storage;

      cacheMap.key = function (obj) {
        var k;
        if ((k = obj[cacheKey])) {
          if (k.indexOf(objKeyPrefix) === 0) {
            k = k.substring(objKeyPrefix.length);
            return cacheMap.val(k);
          }
          return obj[cacheKey];
        }
        return null;
      };

      cacheMap.val = function (key) {
        var keyObj, ktype;

        if (key === null) {
          return null;
        }

        ktype = typeof key;

        if (ktype === 'object' || ktype === 'function') {
          keyObj = cacheMap.key(key);
          if (keyObj) {
            key = objKeyPrefix + keyObj;
          }
        }

        if (storage.hasOwnProperty(key)) {
          return storage[key];
        }

        return null;
      };
    }

    if (arguments.length === 1) {

      if (keyType === 'string' || keyType === 'number') {
        return cacheMap.val(key);
      }

      if (keyType === 'boolean' || keyType === null || keyType === undefined) {
        return key;
      }

      if (keyType === 'object' || keyType === 'function') {

        keyObj = cacheMap.key(key);
        if (keyObj) {
          obj = cacheMap.val(objKeyPrefix + keyObj);
          if (obj) {
            return obj;
          } else {
            return keyObj;
          }
        }

        value = key;

        //Kenny! Here I needed a way to create a unique key so if you have any faster way of acheiving 
        key = hAzzle.pnow() + '';

        //Kenny it is a temporary solution to define a non enumerable and non configurable property on an existing object
        //I probably have to create a mehod to make cross-browser
        //In terms of performance as far as it happens just once when we store an object or a function in cache
        //I don't think it is a performance killer
        //The other point is about not modifying the object that we don't own,
        //although here the new property gets defined on the value object is not enumerable and writable
        //but it is still a kind of modifying the object
        //I have a solution for that as well, to define a property for an object without modifying the object
        //which will be done in the!
        //I like to here your feedback
        Object.defineProperty(value, cacheKey, mapProperty(key));

        storage[key] = value;

        return key;
      }
    } else {
      //These are all hardcoded here but the main solution
      //will be having all the types on top of the module definition
      if (valueType === 'boolean' ||
        valueType === null ||
        valueType === undefined ||
        valueType === 'string' ||
        valueType === 'number') {
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
        key = objKeyPrefix + cacheMap(key);
      }

      Object.defineProperty(value, cacheKey, mapProperty(key));

      storage[key] = value;

      return key;
    }
  }

  return cacheMap;
}
