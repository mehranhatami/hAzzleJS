// matches.js
hAzzle.define('Matches', function() {

    /**
     * IMPORTANT!! This module are not finished at all. Still a lot to do:
     *
     * - check if matchesSelector are buggy and fallback to Jiesa if it is
     * - check for matchesSelector support
     * - and a lot more...
     */

    var _util = hAzzle.require('Util'),
        _collection = hAzzle.require('Collection'),
        _jiesa = hAzzle.require('Jiesa'),
        matchesSelector,

        rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,

        matches = function(element, selector) {
            var match;

            if (!element || !_util.isElement(element) || !selector) {
                return false;
            }

            if (selector.nodeType) {
                return element === selector;
            }

            // If instance of hAzzle

            if (selector instanceof hAzzle) {
                return _util.some(selector.elements, function(selector) {
                    return matches(element, selector);
                });
            }

            if (element === document) {
                return false;
            }

            var quick = rquickIs.exec(selector);

            if (quick) {
                //   0  1    2   3          4
                // [ _, tag, id, attribute, class ]
                if (quick[1]) {
                    quick[1] = quick[1].toLowerCase();
                }
                if (quick[3]) {
                    quick[3] = quick[3].split('=');
                }
                if (quick[4]) {
                    quick[4] = ' ' + quick[4] + ' ';
                }
            }

            if (quick) {
                return (
                    (!quick[1] || element.nodeName.toLowerCase() === quick[1]) &&
                    (!quick[2] || element.id === quick[2]) &&
                    (!quick[3] || (quick[3][1] ? element.getAttribute(quick[3][0]) === quick[3][1] : element.hasAttribute(quick[3][0]))) &&
                    (!quick[4] || (' ' + element.className + ' ').indexOf(quick[4]) >= 0)
                );
            }

            try {

                if (typeof selector !== 'string') {
                    return selector;
                }
                return element.matches(selector)
            } catch (e) {

                match = _jiesa.find(element.parentNode, selector).indexOf(element) >= 0;

                return match;
            }
        }

    return {
        matches: matches
    };
});