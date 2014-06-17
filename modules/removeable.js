/*!
 * Removeable.js
 */

hAzzle.extend({ 

/**
 * removes the data associated with an element
 * @param {Element} el
 * @return {hAzzle}
 */

  clearData: function(el) {
    hAzzle.removeData(el);
    hAzzle.event.removeEvent(el);
 },

}, hAzzle);


hAzzle.extend({

    /**
     * Remove the set of matched elements from the DOM.
     * @return {hAzzle}
     */

    remove: function (selector) {

        // Filters the set of matched elements to be removed.
       
	    var elem = selector ? hAzzle.select(selector, null, null, this) : this;

        hAzzle.each(elem, function (el) {

            if (el.nodeType === 1) {
                hAzzle.removeData(el);
                hAzzle.event.removeEvent(el);
            }

            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        return this;
    },


    /**
     * @return {hAzzle}
     */

    empty: function () {

        return this.each(function (el) {

            if (el.nodeType === 1) {

                // Prevent memory leaks

                hAzzle.deepEach(el.childNodes, hAzzle.clearData);

                while (el.firstChild) {

                    el.removeChild(el.firstChild);
                }
            }
        });
    },

    /**
     * @return {hAzzle}
     */

	detach: function (selector) {
        return this.remove(selector, true);
    }
});