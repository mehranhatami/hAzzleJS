// hAzzle.matchesselector

var documentIsHTML = hAzzle.documentIsHTML,
    Jiesa = hAzzle.Jiesa,
    docElem = hAzzle.docElem,

    // Various regEx we are using
    
	regExpr = {
		
        'id': /#([^\.]+)/,
        'tagName': /^([^#\.]+)/,
        'className': /\.([^#]+)/,
        'all': /^[\.\-\#\w]+$/,
		'simplematch': /^(?:\*|[.#]?-?[_a-zA-Z]{1}(?:[-\w]|[^\x00-\xa0]|\\.)*)$/
    },

    ntapi = {},

    matchesselector = 
    'matchesSelector' in docElem ? 'matchesSelector' :
    'oMatchesSelector' in docElem ? 'oMatchesSelector' :
    'msMatchesSelector' in docElem ? 'msMatchesSelector' :
    'mozMatchesSelector' in docElem ? 'mozMatchesSelector' :
    'webkitMatchesSelector' in docElem ? 'webkitMatchesSelector' : null;

// Expose to the global hAzzle Object

hAzzle.matchesSelector = function (element, selector) {

    var d, j, id, tagName, className,
        m, matched = false, results = [];

    d = element.ownerDocument || element;

    if (typeof selector === 'string') {

        if (regExpr.simplematch.test(selector)) {

          // use a simple selector match (id, tag, class)
		  
          if (selector.match(regExpr.all)) {
          
		       m = selector.match(regExpr.tagName);

			   // Tagname
			   
               tagName = m ? m[1] : '*';
               
			    m = selector.match(regExpr.id);
               
			   // ID
			   
			   id = m ? m[1] : null;
               
			   m = selector.match(regExpr.className);
               
			   // CLASS               
			   
			   className = m ? m[1] : null;
               
			   if ((!id || id === element.id) &&
                    (!tagName || tagName === '*' || (new RegExp(tagName, 'i')).test(element.nodeName)) &&
                    (!className || (' ' + element.className.replace(/\s+/g, ' ') + ' ').indexOf(' ' + className + ' ') > -1)) {
                    matched = true;
                }
            }
		
		// MatchesSelector if any
			
        } else if (Jiesa.has['api-mS'] && documentIsHTML && matchesselector) {

            // disconnected nodes are said to be in a document fragment in IE 9

            if (Jiesa.has['bug-mS'] || element.nodeType !== 11) {
                // use native matchesSelector where available
                return element[matchesselector](selector);
            }

            // Mehran!! Here you need to fall back to compiler.js

        }
        
		return matched;
		
    } else { // Object
       
        if (typeof selector === 'object') {

            for (j in selector) {

                matched = false;

                if (j === 'className') {

                    if ((' ' + element.className.replace(/\s+/g, ' ') + ' ').indexOf(' ' + selector[j] + ' ') > -1) {
                        matched = true;
                    }

                } else if (j === 'nodeName' || j === 'tagName') {

                    if (element[j].toLowerCase() === selector[j].toLowerCase()) {
                        matched = true;
                    }

                } else if (ntapi[j]) {

                    // handle matching nested objects ntapi
                    matched = hAzzle.matches(element[j], selector[j]);

                } else {

                    // handle matching other properties

                    if (element[j] === selector[j]) {
						
                        matched = true;
                    }

                }
                results.push(matched);
            }
        }
    }

    return hAzzle.inArray(results.join('|'), 'false') < 0;
};

/* ============================ INTERNAL =========================== */

hAzzle.each(('parentNode lastChild firstChild nextSibling previousSibling lastElementChild ' + 
             'firstElementChild nextElementSibling previousElementSibling').split(' '), function (value) {
    ntapi[value] = true;
});