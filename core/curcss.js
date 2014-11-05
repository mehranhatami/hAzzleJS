// curcss.js
hAzzle.define('css', function() {

    var _storage = hAzzle.require('Storage'),
        _core = hAzzle.require('Storage'),
        _has = hAzzle.require('Storage'),

        computedValues = function(elem) {

            if (elem && elem.ownerDocument !== null) {
                var view = false;
                if (elem) {
                    if (elem.ownerDocument !== undefined) {
                        view = elem.ownerDocument.defaultView;
                    }
                    return view && view.opener ? view.getComputedStyle(elem, null) : window.getComputedStyle(elem, null);
                }
                return elem.style;
            }
            return '';
        },
        computed = function(elem) {
            if (elem) {
                if (_storage.private.get(elem, 'computed') === undefined) {
                    _storage.private.access(elem, 'computed', {
                        computedStyle: null
                    });
                }
                return _storage.private.get(elem, 'computed');
            }
        },
        getStyles = function(elem) {
            var computed;
            if (computed(elem).computedStyle === null) {
                computed = computed(elem).computedStyle = computedValues(elem);
            } else {
                computed = computed(elem).computedStyle;
            }

            return computed;
        },
        css = function(elem, prop, force) {

         elem = elem instanceof hAzzle ? elem.elements[0] : elem;

            var ret = 0;

            if (!force) {

                if (prop === 'height' &&
                    css(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return elem.offsetHeight -
                        (parseFloat(css(elem, 'borderTopWidth')) || 0) -
                        (parseFloat(css(elem, 'borderBottomWidth')) || 0) -
                        (parseFloat(css(elem, 'paddingTop')) || 0) -
                        (parseFloat(css(elem, 'paddingBottom')) || 0);
                } else if (prop === 'width' &&
                    css(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return elem.offsetWidth -
                        (parseFloat(css(elem, 'borderLeftWidth')) || 0) -
                        (parseFloat(css(elem, 'borderRightWidth')) || 0) -
                        (parseFloat(css(elem, 'paddingLeft')) || 0) -
                        (parseFloat(css(elem, 'paddingRight')) || 0);
                }
            }

            var computedStyle = getStyles(elem);

            if (computedStyle) {

                // IE and Firefox do not return a value for the generic borderColor -- they only return 
                // individual values for each border side's color.

                if ((_has.ie || _has.has('firefox')) && prop === 'borderColor') {
                    prop = 'borderTopColor';
                }

                // Support: IE9
                // getPropertyValue is only needed for .css('filter'). It's terrible slow and ugly too!

                if (_has.ie === 9 && prop === 'filter') {
                    ret = computedStyle.getPropertyValue(prop);
                } else {
                    ret = computedStyle[prop];
                }

                // Fall back to the property's style value (if defined) when 'ret' returns nothing

                if (ret === '' && !_core.contains(elem.ownerDocument, elem)) {
                    ret = elem.style[prop];
                }
            }
        };

    return {
        computed: computed,
        styles: getStyles,
        css: css
    };
});