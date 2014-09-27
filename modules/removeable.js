
// removeable.js
var clearData = function(elems) {
    var data, elem, type, i = 0,
        special = hAzzle.event.special;

    for (;
        (elem = elems[i]) !== undefined; i++) {
        if (hAzzle.legalTypes(elem) && (data = elem[_privateData.expando])) {
            if (data.events) {
                for (type in data.events) {
                    if (special[type]) {
                        hAzzle.event.remove(elem, type);
                    } else {
                        hAzzle.removeEvent(elem, type, data.handle);
                    }
                }
            }
            delete data.events;
        }
    }
};

hAzzle.extend({

    /**
     * Remove the set of matched elements from the DOM.
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    remove: function() {

        return this.each(function(elem) {

            if (elem.nodeType === 1) {
                clearData(hAzzle.grab(elem));
            }

            if (elem.parentNode && elem.tagName !== 'BODY') {
                elem.parentNode.removeChild(elem);
            }
        });
    },

    // Remove all child nodes of the set of matched elements from the DOM.

    empty: function() {
        return this.each(function(elem) {
            if (elem.nodeType === 1) {
                // Prevent memory leaks
                clearData(hAzzle.grab(elem, false));
                // Remove any remaining nodes
                elem.textContent = '';
            }
        });
    },

    // Remove the set of matched elements from the DOM.

    detach: function(selector) {
        return this.remove(selector, true);
    },

    // Dispose all children in the set of elements

    dispose: function() {
        return this.parentNode ?
            this.parentNode.removeChild(this) : this;
    }
});