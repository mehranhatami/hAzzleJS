// setter.js
var setter = hAzzle.setter = function(elems, fn, key, value, chainable, eG, raw) {

    var i = 0, l = elems.length, elem, bulk = key === null;

    // Set multiple values

    if (hAzzle.type(key) === 'object') {

        chainable = true;

        for (i in key) {
            setter(elems, fn, i, key[i], true, eG, raw);
        }

        // Sets one value

    } else if (typeof value !== 'undefined') {

        chainable = true;

        if (typeof value !== 'function') {

            raw = true;
        }

        if (bulk) {

            if (raw) {

                fn.call(elems, value);
                fn = null;

            } else {

                bulk = fn;
                fn = function(elem, key, value) {
                    return bulk.call(hAzzle(elem), value);
                };
            }
        }

        if (fn) {

            while (l--) {
                elem = elems[l];
                fn(elems[l], key, raw ?
                    value :
                    value.call(elem, l, fn(elem, key)));
            }
        }
    }

    return chainable ? elems : bulk ?
        fn.call(elems) : l ?
        fn(elems[0], key) : eG;
}