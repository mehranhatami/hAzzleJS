/*!
 * Selector
 */

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

hAzzle.extend({

  
    matches: function (selector, context) {

        return selector === '*' || hAzzle.matchesSelector(context, selector);

    },

  select: function (selector, context, results, seed) {
    var match,
      bool, // Boolean for filter function
      elem, m, nodeType,
	  elem,
      i = 0;

    results = results || [];
    context = context || doc;

    if (hAzzle.documentIsHTML && !seed) {

      // Shortcuts

      if ((match = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/.exec(selector))) {

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

      // Everything else

      results = context.querySelectorAll(selector);

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
}, hAzzle);