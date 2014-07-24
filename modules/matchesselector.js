// hAzzle.matchesselector
var documentIsHTML = hAzzle.documentIsHTML,
    Jiesa = hAzzle.Jiesa,
    matches = Jiesa.mS,

    // Various regEx we are using

    regExpr = {

        'id': /#([^\.]+)/,
        'tagName': /^([^#\.]+)/,
        'className': /\.([^#]+)/,
        'all': /^[\.\-\#\w]+$/,
        'simplematch': /^(?:\*|[.#]?-?[_a-zA-Z]{1}(?:[-\w]|[^\x00-\xa0]|\\.)*)$/
    },

    ntapi = {};

// Expose to the global hAzzle Object

hAzzle.matchesSelector = function (element, selector) {

    var d, j, id, tagName, className,
        m, matched = false,
        results = [];

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

            /**
             * MEHRAN!!!
             *
             * If XML document, OR if the matchesselector can't find complex
             * selectors. You need to fix it so it fall back to compiler.js
             * and return a boolean true / false
             */

            // MatchesSelector if any

        } else if (Jiesa.has['api-mS'] && documentIsHTML) {

            if (Jiesa.has['bug-mS'] || element.nodeType !== 11) {

                return matches.call(element, selector);
            }
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
                    matched = hAzzle.matchesSelector(element[j], selector[j]);

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