
var matches = hAzzle.prefix('matchesSelector', document.createElement('div'));

hAzzle.extend({
	
	filter: function( expr, elems, not ) {

		if ( not ) {
			expr = ":not(" + expr + ")";
		}
		return elems.length === 1 ?
			hAzzle.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			hAzzle.matches(expr, elems);
	},
	
	matches: function( expr, elements ) {
		return hAzzle.find( expr, null, null, elements );
	},
	matchesSelector: function( elem, expr ) {
		return matches.call( elem, expr );
	},
	
	find: function( selector, context, results, seed ) {
		var elem, nodeType,
			i = 0;

		results = results || [];
		context = context || document;

		// Same basic safeguard as Sizzle
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}

		// Early return if context is not an element or document
		if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
			return [];
		}

		if ( seed ) {
			while ( (elem = seed[i++]) ) {
				if ( hAzzle.matchesSelector(elem, selector) ) {
					results.push( elem );
				}
			}
		} else {

			hAzzle.merge( results, context.querySelectorAll(selector) );
		}

		return results;
	}
});

