/*!
 * Document Ready function . hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.1.1
 * Released under the MIT License.
 *
 * Date: 2014-03-30
 */
var fns = [],
    args = [],
    call = 'call',
    isReady = false,
    errorHandler = null;

/**
 * Prepare a ready handler
 * @private
 * @param {function} fn
 */

function prepareDOM(fn) {

    try {
        // Call function
        fn.apply(this, args);
    } catch (e) {
        // Error occured while executing function
        if (null !== errorHandler) errorHandler[call](this, fn);
    }
}

/**
 * Call all ready handlers
 */

function run() {

    isReady = true;

    for (var x = 0, len = fns.length; x < len; x = x + 1) prepareDOM(fns[x]);
    fns = [];
}

hAzzle.extend({

    ready: function (fn) {

        // Let the event live only once and then die...

        document.addEventListener('DOMContentLoaded', function () {
            run();
        }, true);

        if (isReady) prepareDOM(fn);
        else fns[fns.length] = fn;
    }

});