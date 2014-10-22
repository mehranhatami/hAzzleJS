// ready.js
hAzzle.define('Ready', function() {

    var

        _util = hAzzle.require('Util'),

        // Static property indicating whether DOM is ready.

        isReady = false,

        // List of functions to be executed after DOM is ready.

        readyList = [],

        /**
         * Specify a function to execute when the DOM is fully loaded.
         *
         * @param {Function} callback
         */

        ready = function(callback) {

            // Handler
            var readyHandler = function() {
                if (!isReady) {
                    isReady = true;
                    ready = function(callback) {
                        return callback(hAzzle);
                    };

                    _util.each(readyList, function(callback) {
                        // Remove the handlers
                        document.removeEventListener('DOMContentLoaded', readyHandler, false);
                        window.removeEventListener('load', readyHandler, false);
                        // Execute the callback
                        callback(hAzzle);
                    });
                    readyList = []; // Clear the ready list
                }
            };

            // Catch cases where hAzzle.ready() is called after the browser event has already occurred.
            if (document.readyState === 'complete') {
                readyHandler();
            } else {
                if (document.addEventListener) { // Standards-based browsers support DOMContentLoaded
                    // Use the handy event callback
                    document.addEventListener('DOMContentLoaded', readyHandler, false);
                    // A fallback to window.onload, that will always work
                    window.addEventListener('load', readyHandler, false);
                }
                ready = function(callback) {
                    readyList.push(callback);
                };
                return ready(callback);
            }
        };

    return {

        isReady: isReady,
        readyList: readyList,
        ready: ready
    };
});