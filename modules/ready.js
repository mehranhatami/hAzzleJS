hAzzle.extend({

    // Static property indicating whether DOM is ready.

    isReady: false,

    // List of functions to be executed after DOM is ready.

    readyList: [],

    /**
     * Specify a function to execute when the DOM is fully loaded.
     *
     * @param {Function} callback
     */

    ready: function(callback) {
       
       
        // Handler
        var readyHandler = function() {
            if (!hAzzle.isReady) {
                hAzzle.isReady = true;
                hAzzle.ready = function(callback) {
                    return callback(hAzzle);
                };
                hAzzle.each(hAzzle.readyList, function(callback) {
                    // Remove the handlers
                    document.removeEventListener('DOMContentLoaded', readyHandler, false);
                    window.removeEventListener('load', readyHandler, false);
                    // Execute the callback
                    callback(hAzzle);
                });
                hAzzle.readyList = []; // Clear the ready list
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
            hAzzle.ready = function(callback) {
                hAzzle.readyList.push(callback);
            };
            return hAzzle.ready(callback);
        }
    },

}, hAzzle);