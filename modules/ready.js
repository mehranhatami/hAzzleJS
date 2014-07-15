// Dom ready
// The ready event handler
var win = this,
    doc = win.document;

hAzzle.domReady = {
    callbacks: [],
    loaded: false,

    listen: function () {

        if (doc.addEventListener) {

            doc.addEventListener("DOMContentLoaded", hAzzle.domReady.run, false); //the browsers that play nice.

        } else if (doc.readyState) {

            var timer = setInterval(function () {
                if (/loaded|complete/.test(doc.readyState)) {
                    clearInterval(timer);
                    hAzzle.domReady.run();
                }
            }, 50);

        }
    },

    run: function (forceRun) {

        if (!forceRun && this.loaded) {

            return;
        }

        hAzzle.each(hAzzle.domReady.callbacks, function (fn) {

            // Any better solution?
            fn.call(this, doc, hAzzle);
        });

        hAzzle.domReady.loaded = true;

        if (doc.removeEventListener) {

            doc.removeEventListener('DOMContentLoaded', hAzzle.domReady.run, false);
        }
    },

    add: function (fn) {

        if (hAzzle.domReady.callbacks.push(fn) == 1) {

            hAzzle.domReady.listen();
        }
    }
};

/****/
hAzzle.isDomLoaded = function () {
    return hAzzle.domReady.loaded;
};