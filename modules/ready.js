// Dom ready
// The ready event handler
var win = this,
    doc = win.document,
    hack = doc.documentElement.doScroll,
    // hack for IE9+
    loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);

hAzzle.domReady = {
    callbacks: [],
    loaded: false,
    listen: function () {

        if (!loaded) {

            // Use the handy event callback
            doc.addEventListener("DOMContentLoaded", hAzzle.domReady.run, false); //the browsers that play nice.
            // A fallback to window.onload, that will always work
            win.addEventListener("load", hAzzle.domReady.run, false);
        }
    },

    run: function (forceRun) {

        if (!forceRun && hAzzle.loaded) {

            return;
        }

        hAzzle.each(hAzzle.domReady.callbacks, function (fn) {

            fn.call(this, doc, hAzzle);

            hAzzle.domReady.loaded = true;

            doc.removeEventListener('DOMContentLoaded', hAzzle.domReady.run, false);
            win.removeEventListener("load", hAzzle.domReady.run, false);
        });
    },

    add: function (fn) {

        if (typeof fn !== "function") {
            hAzzle.error("Couldn't load your Javascript code");
            return;
        }

        if (hAzzle.domReady.callbacks.push(fn) === 1) {

            hAzzle.domReady.listen();
        }
    }
};