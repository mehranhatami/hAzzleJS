// shallowcopy.js

hAzzle.shallowCopy = function() {

            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === 'boolean') {

                deep = target;

                target = arguments[i] || {};
                i++;
            }

            if (typeof target !== 'object' && !hAzzle.isFunction(target)) {
                target = {};
            }

            if (i === length) {
                target = this;
                i--;
            }

            for (; i < length; i++) {

                if ((options = arguments[i]) !== null) {
                    // Extend the base object
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays

                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = hAzzle.isArray(copy)))) {

                            if (copyIsArray) {

                                copyIsArray = false;
                                clone = src && hAzzle.isArray(src) ? src : [];

                            } else {
                                clone = src && hAzzle.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = hAzzle.shallowCopy(deep, clone, copy);

                            // Don't bring in undefined values

                        } else if (copy !== undefined) {

                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        };
  