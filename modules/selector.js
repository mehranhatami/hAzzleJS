// Selector / Matches

// Native matchSelector polyfi;

var matches = hAzzle.prefix('matchesSelector', document.createElement('div'));

hAzzle.extend(hAzzle.fn, {

    /**
     * Find the first matched element by css selector
     *
     * @param {String|Object} selector
     * @return {Object}
     *
     */

  find: function (selector) {
        var i,
            len = this.length,
            ret = [],
            self = this;

	   // String
	   
	   if (typeof selector === "string") {
            for (i = 0; i < len; i++) {
                hAzzle.find(selector, self[i], ret);
            }
			 return hAzzle(ret);
        } else { // Object
           return hAzzle(selector).filter(function () {
                for (i = 0; i < len; i++) {
                    if (hAzzle.contains(self[i], this)) {
                        return true;
                    }
                }
            });
        }
    }
});

hAzzle.extend({

    find: function (selector, context, results, seed) {

        var match, 
		  sel,
		   bool, // Boolean for filter function
		   elem, m, nodeType,
            i = 0;

        results = results || [];
        context = context || document;

        // Same basic safeguard as Sizzle
        if (!selector || typeof selector !== "string") {

            return results;
        }

        // Early return if context is not an element or document
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {

            return [];
        }

        if (!seed) {

            // Shortcuts
			
            if ((match = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/.exec(selector))) {

                // #id
                if ((sel = match[1])) {

                    elem = context.getElementById(sel);

                    if (elem && elem.parentNode) {
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if (elem.id === m) {

                            results.push(elem);
                            return results;
                        }
                    } else {

                        return results;
                    }

                    // .class	

                } else if ((sel = match[2])) {

                    push.apply(results, context.getElementsByClassName(sel));
                    return results;

                    // tag

                } else if ((sel = match[3])) {

                    push.apply(results, context.getElementsByTagName(selector));
                    return results;
                }
            } 
			
			// Everything else

            results = context.querySelectorAll(selector);

            // Seed

        } else {

            while ((elem = seed[i++])) {

				bool = matches.call(elem, selector);
            
			    if (bool) {
                    results.push(elem);
                }
            }
        }

        return hAzzle.isNodeList(results) ? slice.call(results) : hAzzle.isElement(results) ? [results] : results;
    }
});