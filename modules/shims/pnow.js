// polyfill for IE 9 and browsers who don't support performance.now
(function () {

    // prepare base perf object

    if (typeof window.performance === 'undefined') {

        window.performance = {};
    }

    if (!window.performance.now) {

        var nowOffset = hAzzle.now();

        if (performance.timing && performance.timing.navigationStart) {

            nowOffset = performance.timing.navigationStart

        }
        window.performance.now = function now() {
            return hAzzle.now() - nowOffset;
        }
    }
})();