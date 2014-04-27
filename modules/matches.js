// hAzzle matches

;(function ($) {

var doc = document,
     cached = [],
    ghost = doc.createElement('div');


            // Fall back to performing a selector if the matchesSelector are not supported

 function fallback(sel, element) {

          var match;
		  
		        if (!element.parentNode) {

                    ghost.appendChild(element);
                }

                match = $.indexOf($.select(sel, element.parentNode), element) >= 0;

                if (element.parentNode === ghost) {
                    ghost.removeChild(element);
                }
                return match;
           }



$.extend($, {

    /** 
     * Returns a predicate for checking whether an object has a given set of `key:value` pairs.
     */

    matches: function (element, sel) {

        // Make sure that attribute selectors are quoted

      //sel = sel.replace(/=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g, "='$1']");


        if (!element || !$.isElement(element) || !sel) {
            return false;
        }

        if (sel['nodeType']) {
            return element === sel;
        }

        if (sel instanceof $) {
            return sel.elems.some(function (sel) {
                return $.matches(element, sel);
            });
        }

        if (element === doc) {
            return false;
        }

       var matchesSelector = $.prefix('matchesSelector', ghost);

        if (matchesSelector) {
            // IE9 supports matchesSelector, but doesn't work on orphaned elems / disconnected nodes

            var supportsOrphans = cached[sel] ? cached[sel] : cached[sel] = matchesSelector.call(ghost, 'div');

            if (supportsOrphans) {

                // Avoid document fragment

                if (!$.nodeType(11, element)) {

                    return matchesSelector.call(element, sel);
                }

            } else { // For IE9 or other browsers who fail on orphaned elems, we walk the hard way !! :)

                return fallback(sel, element);
            }
        }

        return fallback(sel, element);
    }
});

})(hAzzle);