// changers.js
hAzzle.extend({

    changers: {
        'eq': function(arr, index) {
            return arr[index] ? [arr[index]] : [];
        },
        'gt': function(arr, index) {

            return arr.slice(index);
        },
        'lt': function(arr, index) {

            return arr.slice(0, index);
        },

        /**
         * Reduce the set of matched elements to the first in the set,
         * OR to the first Nth elements, if index is specified
         *
         * @param {Array} arr
         * @param {Number} index
         * @return {hAzzle}
         */

        'first': function(arr, index) {
            return index ? arr.slice(0, index) : [arr[0]];
        },

        /**
         * Reduce the set of matched elements to the final one in the set,
         * OR to the last Nth elements, if index is specified
         *
         * @param {Array} arr
         * @param {Number} index
         * @return {hAzzle}
         */

        'last': function(arr, index) {
            return index ? arr.slice(arr.length - index) : [arr[arr.length - 1]];
        },
        'odd': function(arr) {
            return arrCalc(arr, 0, 2);
        },
        'even': function(arr) {
            return arrCalc(arr, 1, 2);
        },
        'nth': function(arr, val) {
            return arrCalc(arr, val - 1, val);
        }
    }

}, hAzzle.Jiesa);

/* =========================== PRIVATE FUNCTIONS ========================== */

function arrCalc(arr, start, increment) {
    var i = start,
        ret = [],
        e;
    while ((e = arr[i])) {
        ret.push(e);
        i += increment;
    }
    return ret;
}