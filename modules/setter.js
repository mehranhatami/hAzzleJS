// setter.js

var setter = hAzzle.setter = function(elems, fn, key, value, chainable, emptyGet, raw) {
	
    var i = 0, len = elems.length,
        bulk = key === null;

    // Set multiple values
	
    if (hAzzle.type(key) === 'object') {
        
		chainable = true;
		
        for (i in key) {
        
		    setter(elems, fn, i, key[i], true, emptyGet, raw);
        }

    // Sets one value
	
    } else if (value !== undefined) {
    
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
			
            for (; i < len; i++) {
				
                fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
            }
        }
    }

    return chainable ? elems : bulk ?
        fn.call(elems) : len ? 
		fn(elems[0], key) : emptyGet;
};
