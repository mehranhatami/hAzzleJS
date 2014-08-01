/**
 * Removes the data associated with an element
 * @param {Object} elem
 * @return {hAzzle}
 */
hAzzle.extend({

    clearData: function(elems) {
        var data, elem, type,
            special = hAzzle.eventHooks.special,
            i = 0;

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
     * @param {hAzzle}
     * @return {hAzzle}
     *
     */

    remove: function(selector) {

        var elem, elems = selector ?
            hAzzle.find(selector, this) : this,
            i = 0;
        for (;
            (elem = elems[i]) !== null; i++) {
            //        hAzzle.each(elem, function(el) {

            if (elem.nodeType === 1) {

                hAzzle.clearData(hAzzle.merge([elem], hAzzle.find('*', elem)));
            }

            // In DOM Level 4 we have remove() with same effect 
            // as this code, but we cant' use it. Using
            // el.remove() will just call hAzzle.Core.remove
            // and we will sit back with no removing of
            // parentNodes and memory leak 

            if (elem.parentNode && elem.tagName !== 'BODY') {

                elem.parentNode.removeChild(elem);
            }
        }

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