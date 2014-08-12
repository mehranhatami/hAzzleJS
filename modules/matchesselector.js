// hAzzle.matchesselector
var documentIsHTML = hAzzle.documentIsHTML,
    docElem = hAzzle.docElem,
    quickMatch = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
    ntapi = {};
	

    var matches = hAzzle.features['api-mS'] ? function(node, selector) {
        // 'matches' standard in DOM Level 4 and replacement for
        // matchesselector
        return node.matches(selector);
//        return !Jiesa.has['bug-mS'] && typeof node === 'function' ? node.matches(selector) : hAzzle.find(node, selector);
    } : hAzzle.find();


// Expose to the global hAzzle Object

hAzzle.matchesSelector = function(elem, selector) {

    var j, found,
        matched = false,
        results = [];

    if (typeof selector === 'string') {

        // Always make sure we have a nodeName

        if ((found = quickMatch.exec(selector))) {

            // Find a match, Mehran !!

            return findAMatchMehran(elem, found);
        }

        // If no XML doc, and not a document fragment, use
        // Matchesselector

        if (documentIsHTML && elem.nodeType !== 11) {

            return matches(elem, selector);
        }

        // Fall back to compiler.js
        return hAzzle.find();

    } else { // Object

        if (typeof selector === 'object') {

            for (j in selector) {

                matched = false;

                if (j === 'className') {

                    if ((' ' + elem.className.replace(/\s+/g, ' ') + ' ').indexOf(' ' + selector[j] + ' ') > -1) {
                        matched = true;
                    }

                } else if (j === 'nodeName' || j === 'tagName') {

                    if (elem[j].toLowerCase() === selector[j].toLowerCase()) {
                        matched = true;
                    }

                } else if (ntapi[j]) {

                    // handle matching nested objects ntapi
                    matched = hAzzle.matchesSelector(elem[j], selector[j]);

                } else {

                    // handle matching other properties

                    if (elem[j] === selector[j]) {

                        matched = true;
                    }
                }
                results.push(matched);
            }
        }
    }

    return hAzzle.inArray(results.join('|'), 'false') < 0;
};

/* ============================ INTERNAL FUNCTIONS =========================== */


function findAMatchMehran(elem, m) {
    if (m[1]) m[1] = m[1].toLowerCase();
    if (m[3]) m[3] = m[3].split("=");
    if (m[4]) m[4] = " " + m[4] + " ";
    if (elem && elem.nodeName) {
        return (
            (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
            (!m[2] || elem.id === m[2]) &&
            (!m[3] || (m[3][1] ? elem.getAttribute(m[3][0]) === m[3][1] : elem.hasAttribute(m[3][0]))) &&
            (!m[4] || (' ' + elem.className + ' ').indexOf(m[4]) >= 0)
        );
    }
}

/* ============================ INTERNAL =========================== */

hAzzle.each(('parentNode lastChild firstChild nextSibling previousSibling lastElementChild ' +
    'firstElementChild nextElementSibling previousElementSibling').split(' '), function(value) {
    ntapi[value] = true;
});