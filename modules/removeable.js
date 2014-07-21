/*!
 * Removeable.js
 */


/**
 * Removes the data associated with an element
 * @param {Object} elem
 * @return {hAzzle}
 */

hAzzle.clearData = function(elem) {
    hAzzle.removeData(elem);
    hAzzle.event.removeEvent(elem);
 };


hAzzle.extend({

    /**
     * Remove the set of matched elements from the DOM.
     * @param {hAzzle}
     * @return {hAzzle}
     */

    remove: function (selector) {

        // Filters the set of matched elements to be removed.
       
	    var elem = selector ? hAzzle.find(selector, this) : this;

        hAzzle.each(elem, function (el) {

            if (el.nodeType === 1) {
                hAzzle.removeData(el);
                hAzzle.event.removeEvent(el);
            }

            if (el.parentNode && el.tagName !== 'BODY') {
                el.parentNode.removeChild(el);
            }
        });

        return this;
    },

    /**
	 * Remove all child nodes of the set of matched elements from the DOM.
     * @return {hAzzle}
     */

    empty: function () {

        return this.each(function (el) {

            if (el && el.nodeType === 1) {

                // Prevent memory leaks

                hAzzle.deepEach(el.childNodes, hAzzle.clearData);

                while (el.firstChild) {

                    el.removeChild(el.firstChild);
                }
            }
        });
    },

    /**
     * Remove the set of matched elements from the DOM.
	 * @return {hAzzle}
     */

	detach: function (selector) {
        return this.remove(selector, true);
    }
});