var win = this,
    doc = win.document || {},

    // Make sure we always are on the correct document

    MutationObserver = win.MutationObserver || win.WebKitMutationObserver,

    isObject = hAzzle.isObject,
    isString = hAzzle.isString,
    isFunction = hAzzle.isFunction;


function processSelectorResult(el, fn) {

    if (!hAzzle.data(el, 'live_processed')) {
        return false;
    }
    if (!isHidden(hAzzle(el)[0])) {
        return false;
    }
    fn(el);
    hAzzle(el).data('live_processed', true);
    return true;
};

function checkElements(container) {

    if (!container) {

        container = docElem;

    }

    var ek;

    for (ek in hAzzle.LiveElements) {

        if (hAzzle.LiveElements[ek].selector) {


            hAzzle(hAzzle.LiveElements[ek].selector, container).each(function (el) {

                processSelectorResult(el, hAzzle.LiveElements[ek].fn);
            });

        } else {


            if (hAzzle.contains(container, hAzzle.LiveElements[ek].elem[0]) || container === hAzzle.LiveElements[ek].elem[0]) {


                if (hAzzle.LiveElements[ek].options.visibility) {

                    if (!isHidden(hAzzle.LiveElements[ek].elem[0])) {

                        hAzzle.LiveElements[ek].fn.call(hAzzle.LiveElements[ek].elem);
                        hAzzle.LiveElements.splice(ek, 1);
                    }

                } else {

                    hAzzle.LiveElements[ek].fn.call(hAzzle.LiveElements[ek].elem);
                    hAzzle.LiveElements.splice(ek, 1);
                }
            }
        }
    }
};




    /**
     * Track the DOM tree 'live' for one or more elements
     *
     * @param {Object} options
     * @param {Functions} fn
     * @return {hAzzle}
     */

hAzzle.Core['live'] = function (opts, fn) {

        var self = this;

        if (isFunction(opts)) {

            fn = opts;
            opts = {};

        } else if (!isObject(opts)) {

            opts = {};
        }

        if (typeof opts.visibility !== 'boolean') {

            opts.visibility = true;
        }

        if (!isFunction(fn)) {

            return;
        }

        if (!hAzzle.LiveElements) {

            hAzzle.LiveElements = [];
        }

        if (!hAzzle.whenLiveInit) {

            hAzzle.whenLiveInit = true;

            if (MutationObserver) {

                var mutation,
                    ni = 0,
                    mi = 0,
                    node,
                    observer = new MutationObserver(function (mutations) {
                        for (; mi < mutations.length; mi++) {
                            mutation = mutations[mi];
                            checkElements(mutation.target);
                            if (hAzzle.LiveElements.length && mutation.addedNodes !== null) {
                                for (; ni < mutation.addedNodes.length; ni++) {
                                    node = mutation.addedNodes[ni];
                                    checkElements(node);
                                }
                            }
                        }
                    });

                observer.observe(document, {
                    'childList': true,
                    'subtree': true,
                    'attributes': true
                });

            } else {

                hAzzle.whenLiveLoop = function () {
                    checkElements();
                    if (hAzzle.LiveElements.length > 0) {
                        hAzzle.safeRAF(hAzzle.whenLiveLoop);
                    }
                };

            }

        }

        if (this.selector) {

            // We're watching for any elements that match the specified selector
            // Process any existing matches

            hAzzle(this.selector).filter(':visible').each(function (el) {
                processSelectorResult(el, fn);
            });

            // Watch for future matches
            hAzzle.LiveElements.push({
                'elem': null,
                'selector': this.selector,
                'fn': fn,
                'opts': opts
            });

            if (!MutationObserver) {

                if (hAzzle.LiveElements.length === 1) {

                    safeRAF(hAzzle.whenLiveLoop);
                }
            }

        } else {

            // We're watching for a specific element

            if (hAzzle.contains(docElem, this[0])) {
                // The element exists within the DOM
                if (opts.visibility) {
                    if (!isHidden(hAzzle(this)[0])) {
                        fn();
                    } else {

                        hAzzle.LiveElements.push({
                            'elem': self,
                            'selector': null,
                            'fn': fn,
                            'options': opts
                        });

                        if (!MutationObserver) {

                            if (hAzzle.LiveElements.length === 1) {

                                safeRAF(hAzzle.whenLiveLoop);
                            }
                        }
                    }
                } else {

                    fn();
                }
            } else {
                // The element is outside of the DOM
                hAzzle.LiveElements.push({
                    'elem': self,
                    'selector': null,
                    'fn': fn,
                    'options': opts
                });
                if (!MutationObserver) {
                    if (hAzzle.LiveElements.length === 1) {
                        safeRAF(hAzzle.whenLiveLoop);
                    }
                }
            }
        }
    }