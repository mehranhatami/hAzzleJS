/**
 * Jiesa changers - special pseudo selectors
 *
 * Know from Sizzle, but for Jiesa, this are
 * developed the natural way. Meaning
 *
 * -2 means -2 and not -1 as in Sizzle.
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
        'eq': function (arr, val) {
            return arr[val] ? [arr[val]] : [];
        },
        'gt': function (arr, val) {

            return arr.slice(val);
        },
        'lt': function (arr, val) {
            return arr.Array.prototype.slice(0, val);
        },
        'first': function (arr) {
            return [arr[0]];
        },
        'last': function (arr) {
            return [arr[arr.length - 1]];
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