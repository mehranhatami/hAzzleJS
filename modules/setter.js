// setter.js
var setter = hAzzle.setter = function(elems, fn, key, value, chainable, emptyGet, raw) {

 var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( hAzzle.type( key ) === 'object' ) {
		chainable = true;
		for ( i in key ) {
			setter( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( hAzzle.type( value ) !== 'function' ) { 
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {

				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( hAzzle( elem ), value );
				};
			}
		}

		if ( fn ) {

			for ( ; i < len; i++ ) {
				
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};