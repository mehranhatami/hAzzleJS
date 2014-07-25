/**
 * Removes the data associated with an element
 * @param {Object} elem
 * @return {hAzzle}
 */
hAzzle.clearData = function(elem) {
    hAzzle.removeData(elem);
    hAzzle.event.remove(elem);
};


hAzzle.extend({

    /**
     * Remove the set of matched elements from the DOM.
     * @param {hAzzle}
     * @return {hAzzle}
	 *
     */

    remove: function(selector) {

        // Filters the set of matched elements to be removed.

        var elem = selector ? hAzzle.find(selector, this) : this;
        hAzzle.each(elem, function(el) {

            if (el.nodeType === 1) {
                hAzzle.removeData(el);
                hAzzle.event.remove(el);
            }

	 // In DOM Level 4 we have remove() with same effect 
	 // as this code, but we cant' use it. Using
	 // el.remove() will just call hAzzle.Core.remove
	 // and we will sit back with no removing of
	 // parentNodes and memory leak 

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

    empty: function() {

        return this.each(function(el) {

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

    detach: function(selector) {
        return this.remove(selector, true);
    },

    dispose: function() {
        return this.parentNode ? this.parentNode.removeChild(this) : this;
    }
});