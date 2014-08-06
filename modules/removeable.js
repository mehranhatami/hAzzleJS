// removeable.js
hAzzle.extend({

    /**
     * Dispose all element children
     *
     * @param {Object} elem
     * @return {hAzzle}
     */

    dispose: function(elem) {

        return elem.parentNode ?
            elem.parentNode.removeChild(elem) : elem;
    },

    /**
     * Clear all data from elements - INTERNAL!!
     *
     * @param {Object|Array} elems
     * @return {hAzzle}
     */

    clearData: function(elems) {
        var data, elem, type, i = 0,
            special = hAzzle.eventHooks.special;

        for (;
            (elem = elems[i]) !== undefined; i++) {
            if (hAzzle.legalTypes(elem) && (data = elem[_privateData.expando])) {
                if (data.events) {
                    for (type in data.events) {
                        if (special[type]) {
                            hAzzle.event.remove(elem, type);

                            // This is a shortcut to avoid jQuery.event.remove's overhead
                        } else {
                            hAzzle.removeEvent(elem, type, data.handle);
                        }
                    }
                }
                delete data.events;
            }
        }
    }
}, hAzzle);

hAzzle.extend({

    /**
     * Remove the set of matched elements from the DOM.
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    remove: function(selector) {

        var elem, elems = selector ?
            hAzzle.find(selector, this) : this,
            i = 0;

        for (;
            (elem = elems[i]) !== null; i++) {

            if (elem.nodeType === 1) {

                hAzzle.clearData(findSubNodes(elem));
            }

            if (elem.parentNode && elem.tagName !== 'BODY') {

                elem.parentNode.removeChild(elem);
            }
        }

        return this;
    },

    /**
     * Remove all child nodes of the set of matched elements from the DOM.
     *
     * @return {hAzzle}
     */

    empty: function() {

        var elem, i = 0;


        return this.each(function(elem) {

            if (elem.nodeType === 1) {

                // Prevent memory leaks
                // Clear data on each childNode

                hAzzle.clearData(findSubNodes(elem));

                // Remove any remaining nodes
                elem.textContent = '';
            }
        });

    },

    /**
     * Remove the set of matched elements from the DOM.
     *
     * @param {String} selector
     * @return {hAzzle}
     */

    detach: function(selector) {
        return this.remove(selector, true);
    },

    /**
     * Dispose all children in the set of elements
     *
     * @return {hAzzle}
     */

    dispose: function() {
        return this.parentNode ?
            this.parentNode.removeChild(this) : this;
    }
});

/* ============================ UTILITY METHODS =========================== */

function findSubNodes(elem) {
    return hAzzle.merge([elem], hAzzle.find('*', elem));
}