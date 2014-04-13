// hAzzle matches
var ghost = doc.createElement('div');

hAzzle.extend({

    /** 
     * Returns a predicate for checking whether an object has a given set of `key:value` pairs.
     */

    matches: function (element, sel) {

        // Make sure that attribute selectors are quoted

        sel = sel.replace(/=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g, "='$1']");

        var matchesSelector, match,

            // Fall back to performing a selector if the matchesSelector are not supported

            fallback = (function (sel, element) {

                if (!element.parentNode) {

                    ghost.appendChild(element);
                }

                match = hAzzle.indexOf(hAzzle.select(sel, element.parentNode), element) >= 0;

                if (element.parentNode === ghost) {
                    ghost.removeChild(element);
                }
                return match;

            });

        if (!element || !hAzzle.isElement(element) || !sel) {
            return false;
        }

        if (sel['nodeType']) {
            return element === sel;
        }

        if (sel instanceof hAzzle) {
            return sel.elems.some(function (sel) {
                return hAzzle.matches(element, sel);
            });
        }

        if (element === doc) {
            return false;
        }

        matchesSelector = hAzzle.prefix('matchesSelector', ghost);

        if (matchesSelector) {
            // IE9 supports matchesSelector, but doesn't work on orphaned elems / disconnected nodes

            var supportsOrphans = cached[sel] ? cached[sel] : cached[sel] = matchesSelector.call(ghost, 'div');

            if (supportsOrphans) {

                // Avoid document fragment

                if (!hAzzle.nodeType(11, element)) {

                    return matchesSelector.call(element, sel);
                }

            } else { // For IE9 only or other browsers who fail on orphaned elems, we walk the hard way !! :)

                return fallback(sel, element);
            }
        }

        return fallback(sel, element);
    }
})