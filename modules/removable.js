;(function ($) {

    /**
     * Remove all child nodes of the set of matched elements from the DOM.
     *
     * - It first remove all data stored on the object
     * - Then it remove all event listeners attached on the object
     * - In the end, it removes all HTML on the elems in the elems stack.
     *
     * @return {Object}
     */

    $.fn.empty = function () {

		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( $.nodeType(1, elem) ) {
				$.removeData(elem);
				$.Events.off(elem);
				elem.textContent = "";
			}
	   }
        return this;
    },

    /**
     *  Remove an element from the DOM
     */
    $.fn.remove = function () {

        // Discard any data on the element

        return this.removeData().each(function (_, elem) {

            // Locate all nodes that belong to this element
            // and add them to the "elems stack"

            var elements = $(elem).find('*');
            elements = elements.add(elem);

            $.Events.off(elem);

            var parent = elem.parentNode;

            if (parent) {

                // Remove all children

                this.parentNode.removeChild(elem);
            }

        })
        return false;
    };

})(hAzzle);