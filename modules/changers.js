/**
 * Jiesa - Child Selectors
 *
 * Known as special jQuery selectors.
 *
 * :even, :odd, :eq, :lt, :gt, :first, :last, :nth
 *
 * Note! There is some differences
 *
 * -2 means -2 and not -1 as in jQuey / Sizzle.
 *
 * for gt and lt, positive numbers to left,
 * negative number to the right.
 *
 * Example:
 *
 * Array (1,2,3,4,5)
 *
 * gt(-1) - give you number 5
 *
 * gt(1) - give you number 1
 *
 */
hAzzle.extend({

    changers: {
        'eq': function (arr, index) {
            return arr[index] ? [arr[index]] : [];
        },
        'gt': function (arr, index) {

            return arr.slice(index);
        },
        'lt': function (arr, index) {

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

        'first': function (arr, index) {
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

        'last': function (arr, index) {
            return index ? arr.slice(arr.length - index) : [arr[arr.length - 1]];
        },
        'odd': function (arr) {
            return ofType(arr, 0, 2);
        },
        'even': function (arr) {
            return ofType(arr, 1, 2);
        },
        'nth': function (arr, val) {
            return ofType(arr, val - 1, val);
        }
    }

}, hAzzle.Jiesa);

function ofType(arr, start, increment) {

    var i = start,
        ret = [],
        e;

    while ((e = arr[i])) {

        ret.push(e);
        i += increment;
    }

    return ret;
}