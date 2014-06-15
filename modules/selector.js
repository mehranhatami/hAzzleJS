/*!
 * hAzzle Selector Engine (hSE)
 *
 * Note! This module depends on the 
 * MatchesSelector.js module for
 * cross-browser compability.
 *
 * Do NOT use 'call' on 
 *
 * hAzzle.MatchesSelector()
 *
 * QSA shouldn't be used on XML docs, so 
 * check for that in this module
 *
 */

var
    win = window,
    doc = document,
    winDoc = win.document,
    docElem = hAzzle.docElem,
    idclasstag = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
    whitespace = "[\\x20\\t\\r\\n\\f]",
    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g");


rnative = /^[^{]+\{\s*\[native \w/;

function Core(selector, context, results, seed) {

    if (!seed) {

        try {
          
		  results = context.querySelectorAll(selector);
        
		// Die silently
		
		} catch(e){}
        
		// Seed

    } else {

        while ((elem = seed[i++])) {

            bool = hAzzle.matchesSelector(elem, selector);

            if (bool) {

                results.push(elem);
            }
        }
    }

    return slice.call(results);
}

hAzzle.extend({

    matches: function (selector, context) {

        return selector === '*' || hAzzle.matchesSelector(context, selector);

    },

    select: function (selector, context, results, seed) {

        var match,
            bool, // Boolean for filter function
            elem, m, nodeType,
            i = 0;
alert('*');
	   if ( ( context ? context.ownerDocument || context : winDoc ) !== doc ) {
		      
			  setDocument( context );
	    }

        results = results || [];
        context = context || doc;

        // Early return if context is not an element or document
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {

            return [];
        }

        // Shortcuts

        if ((match = idclasstag.exec(selector))) {

            // #id
            if ((m = match[1])) {

                if (nodeType === 9) {
                    elem = context.getElementById(m);

                    if (elem && elem.parentNode) {

                        if (elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    } else {
                        return results;
                    }
                } else {
                    // Context is not a document
                    if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                        hAzzle.contains(context, elem) && elem.id === m) {
                        results.push(elem);
                        return results;
                    }
                }

                // .class	

            } else if ((m = match[2])) {

                push.apply(results, context.getElementsByClassName(m));
                return results;

                // tag

            } else if ((m = match[3])) {

                push.apply(results, context.getElementsByTagName(selector));
                return results;
            }
        }

        // All others

        return Core(selector.replace(rtrim, "$1"), context, results, seed);
    }

}, hAzzle);