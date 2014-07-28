// ntapi.js
//
// Is this shim needed in 2014 with all major
// browsers supporting this??

hAzzle.extend({
	
        /**
         * Find next element sibiling.
         *
         * @param {Object} el
         * @return {hAzzle}
         */

        nextElementSibling: function (el) {
            if (el.nextElementSibling) {
                return el.nextElementSibling;
            } else {
                while ((el = el.nextSibling)) {
                    if (el.nodeType !== 1) return el;
                }
            }
        },

        /**
         * Find previous element sibling.
         *
         * @param {Object} el
         * @return {hAzzle}
         */

        previousElementSibling: function (el) {
            if (el.previousElementSibling) {
                return el.previousElementSibling;
            } else {
                while ((el = el.previousSibling)) {
                    if (el.nodeType === 1) return el;
                }
            }
        },

        /**
         * Get the first element child of the given element
         *
         * @param {string} el
         * @return {hAzzle}
         */

        firstElementChild: function (el) {
            var child = el.firstElementChild;
            if (!child) {
                child = el.firstChild;
                while (child && child.nodeType !== 1)
                    child = child.nextSibling;
            }
            return child;
        },

        /**
         * Get the last element child of the given element
         *
         * @param {string} el
         * @return {hAzzle}
         */

        lastElementChild: function (el) {
            var child = el.lastElementChild;
            if (!child) {
                child = el.lastChild;
                while (child && child.nodeType !== 1)
                    child = child.previousSibling;
            }
            return child;
        },

        childElementCount: function (el) {
            var Count = el.childElementCount;
            if (!Count) {
                el = el.firstChild || null;
                do {
                    if (el && el.nodeType === 1) {
                        Count++;
                    }
                    el = el.nextSibling;
                } while (el);
            }
            return Count;
        }
});