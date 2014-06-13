/*!
 * Removeable
 */
/**
 * removes the data associated with an element
 * @param {Element} el
 * @return {hAzzle}
 */
function clearData(el) {
    hAzzle.removeData(el);
    hAzzle.event.removeEvent(el);
}

hAzzle.extend({

    /**
     * Remove the set of matched elements from the DOM.
     * @return {hAzzle}
     */

    remove: function (selector) {

        var elem,

            // Filters the set of matched elements to be removed.

            elems = selector ? hAzzle.select(selector, null, null, this) : this,
            i = 0;

        for (;
            (elem = elems[i]) !== null; i++) {

            if (elem.nodeType === 1) {

                hAzzle.removeData(elem);
                hAzzle.event.removeEvent(elem);

            }

            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }

        return this;
    },


    /**
     * @return {hAzzle}
     */

    empty: function () {

        return this.each(function (el) {

            if (el.nodeType === 1) {

                // Prevent memory leaks

                hAzzle.deepEach(el.childNodes, clearData);

                while (el.firstChild) {

                    el.removeChild(el.firstChild);
                }
            }
        });
    },

    detach: function (selector) {
        return this.remove(selector, true);
    }
});