/**
 * Removes the data associated with an element
 * @param {Object} elem
 * @return {hAzzle}
 */
hAzzle.clearData = function(elems) {

    var data, elem, type,
        special = hAzzle.eventHooks.special,
        i = 0;

    for (;
        (elem = elems[i]) !== undefined; i++) {

        if (hAzzle.legalTypes(elem) && (data = elem[hAzzleData.expando])) {

            if (data.events) {

                for (type in data.events) {

                    if (special[type]) {

                        hAzzle.event.remove(elem, type);

                    } else {

                        if (elem.removeEventListener) {

                            elem.removeEventListener(type, data.handle, false);
                        }
                    }
                }
            }

            delete data.events;
        }
    }
}


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

                hAzzle.clearData(hAzzle.merge([el], hAzzle.find('*', el)));
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