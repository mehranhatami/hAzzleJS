(function () {

  var fnToString = Function.prototype.toString,

    //detect "this" keyword in decompiled function source
    rgxThis = /\bthis\b/,
    push = Array.prototype.push,

    /** Used to detected named functions */
    rgxNamedFunction = /^\s*function[ \n\r\t]+\w/,

    fnNameSupport = typeof Function.name == 'string',

    /**
     * Detect if functions can be decompiled by "Function.prototype.toString"
     * (all but PS3 and older Opera mobile browsers).
     * Since hAzzle.Core.each uses "this" keyword in its body
     * this way we check if we can detect if the rgxThis can match the "this" keyword
     * if yes it means the JavaScript engine that we are using supports function decompilation
     */
    decompilationSupport = rgxThis.test(hAzzle.Core.each),

    fnCache = hAzzle.createCache();

  function slice(array, start, end) {
    if (typeof start == 'undefined') {
      start = 0;
    }
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  function createCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return false;
    }

    var fnSource,
      boundInfo;

    // exit early for no "thisArg" or already bound by "Function#bind"
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }

    //prevent it from executing regexps over and over
    boundInfo = fnCache.val(func);

    if (fnNameSupport) {
      boundInfo = !func.name;
    }

    boundInfo = boundInfo || !decompilationSupport;
    if (!boundInfo) {
      fnSource = fnToString.call(func);
      if (!fnNameSupport) {
        boundInfo = !rgxNamedFunction.test(fnSource);
      }
      if (!boundInfo) {
        // checks if "func" references the "this" keyword and stores the result
        boundInfo = rgxThis.test(fnSource);

        //store the boundInfo to prevent it from decompiling
        //a function over and over
        fnCache.cache(func, boundInfo);
      }
    }

    // exit early if there are no "this" references or "func" is bound
    if (boundInfo === false || (boundInfo !== true && boundInfo[1] & 1)) {
      return func;
    }

    //A hard coded fast path to speed up
    //function invokation when args count is fixed
    switch (argCount) {
    case 1:
      return function (value) {
        return func.call(thisArg, value);
      };
    case 2:
      return function (a, b) {
        return func.call(thisArg, a, b);
      };
    case 3:
      return function (value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
    case 4:
      return function (accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return hAzzle.bind(func, thisArg);
  }

  function bind(func, thisArg, args) {
    var bindArgs = arguments;

    function bound() {
      var boundArgs,
        thisBinding,
        result;

      if (args) {

        // avoid "slice"ing "arguments" object using "Array.prototype.slice.call"
        //and not assigning "arguments" to a variable as a ternary expression
        if (bindArgs.length === 3 &&
          typeof args === 'object' &&
          hAzzle.isArraylike(args)) {
          boundArgs = slice(args);
        } else {
          boundArgs = slice(bindArgs, 2);
        }

        //using "push" instead of "concat" is much fatser
        push.apply(boundArgs, arguments);

      }

      // "Function#bind" spec
      // mimic the constructor's "return" behavior
      if (this instanceof bound) {
        // ensure "new bound" is an instance of "func"
        thisBinding = Object.create(func.prototype);
        result = func.apply(thisBinding, boundArgs || arguments);
        return hAzzle.isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, boundArgs || arguments);
    }

    fnCache.cache(bound, slice(arguments));
    return bound;
  }

  hAzzle.createCallback = createCallback;
  hAzzle.bind = bind;
  hAzzle.slice = slice;

}());