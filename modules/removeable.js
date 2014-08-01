/**
 * Removes the data associated with an element
 * @param {Object} elem
 * @return {hAzzle}
 */
hAzzle.extend({

    clearData: function(elems) {

        var data, elem, type, key,
            special = hAzzle.eventHooks.special,
            i = 0;

        for (;
            (elem = elems[i]) !== undefined; i++) {

            if (hAzzle.legalTypes(elem)) {

                key = elem[_privateData.expando];

                if (key && (data = _privateData.cache[key])) {

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

                        delete data.events;
                    }
                    if (_privateData.cache[key]) {
                        // Discard any remaining `private` data
                        delete _privateData.cache[key];
                    }
                }

            }
            // Discard any remaining `user` data
            delete _userData.cache[elem[_userData.expando]];
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