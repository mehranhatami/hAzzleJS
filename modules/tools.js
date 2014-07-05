/**
 * sortOrder
 */
 
 // Need this for CSS4 selectors

var Jiesa = hAzzle.Jiesa,
    sO = Jiesa.sortOrder = function( a, b ) {
		// Flag for duplicate removal
		if ( a === b ) {
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ) {

				// Choose the first element that is related to our document
				if ( a === document || hAzzle.contains(document, a) ) {
					return -1;
				}
				if ( b === document || hAzzle.contains(document, b) ) {
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

/* =========================== GLOBALE JIESA VARS ========================== */

// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters

   Jiesa.whitespace = "[\\x20\\t\\r\\n\\f]";
   Jiesa.runescape = new RegExp("\\\\([\\da-f]{1,6}" + Jiesa.whitespace + "?|(" + Jiesa.whitespace + ")|.)", "ig");
   Jiesa.funescape = function (_, escaped, escapedWhitespace) {
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
    };


/* =========================== VARIOUS SHIMS ========================== */
/**
 * Find next element sibiling.
 *
 * @param {Object} el
 *
 * @return {Object}
 */

Jiesa.nextElementSibling = function(el) {
    if (el.nextElementSibling) {
        return el.nextElementSibling;
    } else {
        while (el = el.nextSibling) {
            if (el.nodeType !== 1) return el;
        }
    }
}


/**
 * Find previous element sibling.
 *
 * @param {Object} el
 *
 * @return {Object}
 */

Jiesa.previousElementSibling = function(el) {
    if (el.previousElementSibling) {
        return el.previousElementSibling;
    } else {
        while (el = el.previousSibling) {
            if (el.nodeType === 1) return el;
        }
    }
}

Jiesa.firstElementChild = function(el) {
    var child = el.firstElementChild;
    if (!child) {
        child = el.firstChild;
        while (child && child.nodeType !== 1)
            child = child.nextSibling;
    }
    return child;
}

Jiesa.lastElementChild = function(el) {
    var child = el.lastElementChild;
    if (!child) {
        child = el.lastChild;
        while (child && child.nodeType !== 1)
            child = child.previousSibling;
    }
    return child;
}

Jiesa.next = function(el) {
    while ((el = el.nextSibling) && el.nodeType !== 1);
    return el;
}

Jiesa.prev = function(el) {
    while ((el = el.previousSibling) && el.nodeType !== 1);
    return el;
}