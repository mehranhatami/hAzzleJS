// Dom ready
// The ready event handler

var win = this,
   doc = win.document, 
   DOMContentLoaded = false;

hAzzle.extend({

    /**
     * DOM ready
     * Execute a callback for every element in the matched set.
     */

    readyList: [],
    readyFired: false,

    ready: function (fn) {

        if (hAzzle.readyFired) {
            setTimeout(function () {
                fn(document);
            }, 1);
            return;
        } else {

            // add the function and context to the list

            hAzzle.readyList.push(fn);
        }

        // if document already ready to go, schedule the ready function to run
        if (doc.readyState === 'complete') {

            setTimeout(ready, 1);

        } else if (!DOMContentLoaded) {

            // otherwise if we don't have event handlers installed, install them

            doc.addEventListener('DOMContentLoaded', ready, false);
            // backup is window load event
            window.addEventListener('load', ready, false);

            DOMContentLoaded = true;
        }
    }

}, hAzzle);


// call this when the document is ready
// this function protects itself against being called more than once

function ready() {

    var i = 0,
        l = hAzzle.readyList.length;

    if (!hAzzle.readyFired) {
        // this must be set to true before we start calling callbacks
        hAzzle.readyFired = true;

        for (; i < l; i++) {

            hAzzle.readyList[i].call(window, document);
        }
        // allow any closures held by these functions to free
        hAzzle.readyList = [];
    }
}