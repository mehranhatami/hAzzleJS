/*!
 * DOM ready
 */

; (function ($) {

    var readyList = [],
        readyFired = false,
        readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
   
    function ready() {
   
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
				
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    // Extend the hAzzle object

    $.extend({

    
	ready: function (callback, context) {
         
		 // context are are optional, but document by default
	     
		 context = context || document;
	
		if (readyFired) {
            setTimeout(function() { callback(context); }, 1);
            return;
        } else {

            // add the function and context to the list

            readyList.push({fn: callback, ctx: context});
        }
		// if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
			
            setTimeout(ready, 1);

		} else if (!readyEventHandlersInstalled) {

            // otherwise if we don't have event handlers installed, install them

                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);

            readyEventHandlersInstalled = true;
        }
    }
});

})(hAzzle);