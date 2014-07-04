// Jiesa special selectors

hAzzle.extend({

    changers: {
        'eq': function (arr, digit) {
            return arr[digit] ? [arr[digit]] : [];
        },
        'gt': function (arr, digit) {
            return arr.slice(digit);
        },
        'lt': function (arr, digit) {
            return arr.slice(0, digit);
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
        'nth': function (arr, digit) {
            return ofType(arr, digit - 1, digit);
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
    //alert(ret);
    return ret;
}