// ready.js
hAzzle.include(function() {

    var
        doc = window.document,
        readyStates = {
            'loaded': 1,
            'complete': 1
        },
        fixReadyState = typeof doc.readyState !== 'string',
        ready = !!readyStates[doc.readyState],
        readyQ = [],
        recursiveGuard;

    function domReady(callback) {
        readyQ.push(callback);
        if (ready) {
            processQ();
        }
    }

    domReady.load = function(id, req, load) {
        clearTimeout(poller);
        domReady(load);
    };

    function processQ() {
        // Calls all functions in the queue in order, unless processQ() is already running, in which case just return

        if (recursiveGuard) {
            return;
        }
        recursiveGuard = true;

        while (readyQ.length) {
            try {
                (readyQ.shift())(doc);
            } catch (err) {
                hAzzle.err(true, 7, 'error in domReady callback');
            }
        }

        recursiveGuard = false;
    }

    if (!ready) {
        var tests = [],
            detectReady = function(evt) {
                evt = evt || window.event;
                if (ready || (evt.type === 'readystatechange' && !readyStates[doc.readyState])) {
                    return;
                }

                ready = 1;
                processQ();
            },
            on = function(node, event) {
                node.addEventListener(event, detectReady, false);
                readyQ.push(function() {
                    node.removeEventListener(event, detectReady, false);
                });
            };

        on(doc, 'DOMContentLoaded');
        // This is based on the custom load event
        on(window, 'load');

        if ('onreadystatechange' in doc) {
            on(doc, 'readystatechange');
        } else if (!fixReadyState) {
            // if the ready state property exists and there's
            // no readystatechange event, poll for the state
            // to change
            tests.push(function() {
                return readyStates[doc.readyState];
            });
        }

        if (tests.length) {
            var poller = function() {
                if (ready) {
                    return;
                }
                var i = tests.length;
                while (i--) {
                    if (tests[i]()) {
                        detectReady('poller');
                        return;
                    }
                }
                setTimeout(poller, 30);
            };
            poller();
        }
    }

    return {
        ready: domReady
    };
});
