/**
 * sortOrder
 */
var win = this,
    doc = document, 
	Jiesa = hAzzle.Jiesa;

hAzzle.extend({

    sortOrder: function (a, b) {
        // Flag for duplicate removal
        if (a === b) {
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
    },

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

    firstElementChild: function (el) {
        var child = el.firstElementChild;
        if (!child) {
            child = el.firstChild;
            while (child && child.nodeType !== 1)
                child = child.nextSibling;
        }
        return child;
    },

    lastElementChild: function (el) {
        var child = el.lastElementChild;
        if (!child) {
            child = el.lastChild;
            while (child && child.nodeType !== 1)
                child = child.previousSibling;
        }
        return child;
    },

    next: function (el) {
        while ((el = el.nextSibling) && el.nodeType !== 1);
        return el;
    },

    prev: function (el) {
        while ((el = el.previousSibling) && el.nodeType !== 1);
        return el;
    }
});