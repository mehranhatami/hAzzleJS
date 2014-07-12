/**
 * Core
 *
 * Core function for hAzzle and Jiesa selector engine.
 * Contains functions to sort DOM nodes, and 
 * functions only for Jiesa
 */
var win = this,
    doc = win.document,
    Jiesa = hAzzle.Jiesa,
    expando = "DOM" + -hAzzle.now(),

    // Core methods for DOM

    domCore = {
		
        'api-stableSort': expando.split("").sort(sortOrder).join("") === expando,
		'api-sortInput': false
    },
	
	 sortOrder = function(a, b) {
        // Flag for duplicate removal
        if (a === b) {
			
            domCore['api-sortInput'] = true;
		    return 0;
        }

        var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);

        if (compare) {
            // Disconnected nodes
            if (compare & 1) {

                // Choose the first element that is related to our document
                if (a === doc || hAzzle.contains(doc, a)) {
                    return -1;
                }
                if (b === doc || hAzzle.contains(doc, b)) {
                    return 1;
                }

                // Maintain original order
                return 0;
            }

            return compare & 4 ? -1 : 1;
        }

        // Not directly comparable, sort on existence of method
        return a.compareDocumentPosition ? -1 : 1;
    };

hAzzle.extend({

    sortOrder: sortOrder,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters

    whitespace: "[\\x20\\t\\r\\n\\f]",
    runescape: new RegExp("\\\\([\\da-f]{1,6}" + Jiesa.whitespace + "?|(" + Jiesa.whitespace + ")|.)", "ig"),
    funescape: function (_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        // Support: Firefox<24
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    },
	
	// HAS BEEN MOVED!!! WILL FIX THIS AS SOON AS I CAN WORK WITH COMPILER.JS!!!!!

    /**
     * Find next element sibiling.
     *
     * @param {Object} el
     *
     * @return {Object}
     */

    nextElementSibling: function (el) {
        if (el.nextElementSibling) {
            return el.nextElementSibling;
        } else {
            while (el = el.nextSibling) {
                if (el.nodeType !== 1) return el;
            }
        }
    },


    /**
     * Find previous element sibling.
     *
     * @param {Object} el
     *
     * @return {Object}
     */

    previousElementSibling: function (el) {
        if (el.previousElementSibling) {
            return el.previousElementSibling;
        } else {
            while (el = el.previousSibling) {
                if (el.nodeType === 1) return el;
            }
        }
    },
    /**
     * Get the first element child of the given element
     *
     * @param {string} el
     * @return {hAzzle}
     */
    firstElementChild: function (el) {
        var child = el.firstElementChild;
        if (!child) {
            child = el.firstChild;
            while (child && child.nodeType !== 1)
                child = child.nextSibling;
        }
        return child;
    },
    /**
     * Get the last element child of the given element
     *
     * @param {string} el
     * @return {hAzzle}
     */

    lastElementChild: function (el) {
        var child = el.lastElementChild;
        if (!child) {
            child = el.lastChild;
            while (child && child.nodeType !== 1)
                child = child.previousSibling;
        }
        return child;
    },

    childElementCount: function (el) {
        var count = el.childElementCount;
        if (!count) {
            el = el.firstChild || null;
            do {
                if (el && el.nodeType === 1) {
                    count++;
                }
                el = el.nextSibling;
            } while (el);
        }
        return count;

    },

    next: function (el) {
        while ((el = el.nextSibling) && el.nodeType !== 1);
        return el;
    },

    prev: function (el) {
        while ((el = el.previousSibling) && el.nodeType !== 1);
        return el;
    }
}, Jiesa);

 /* =========================== UNIQUE SORT FUNCTION ========================== */

hAzzle.uniqueSort = function (results) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0,
		apis =  domCore['api-sortInput'];

        // Unless we *know* we can detect duplicates, assume their presence

  
    apis = !domCore['api-stableSort'] && results.slice(0);

//     results.sort(sortOrder);

    if (apis) {
        while ((elem = results[i++])) {
            if (elem === results[i]) {
                j = duplicates.push(i);
            }
        }
        while (j--) {
            results.splice(duplicates[j], 1);
        }
    }

    apis = null;

    return results;
};