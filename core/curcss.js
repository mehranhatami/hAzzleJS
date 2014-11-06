// curcss.js
hAzzle.include([
    'storage',
    'core',
    'has'
], function(_storage, _core, _feature) {

    var computedValues = function(elem) {
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
            return computed(elem).computedStyle === null ?
                computed(elem).computedStyle = computedValues(elem) :
                computed(elem).computedStyle;
        },

        toPixel = function(value) {
            // style values can be floats, client code may want
            // to round for integer pixels.
            return parseFloat(value) || 0;
        },

        css = function(elem, prop, force) {

            elem = elem instanceof hAzzle ? elem.elements[0] : elem;

            var ret = 0;

            if (_feature.has('ie') && prop === 'auto') {
                if (prop === 'height') {
                    return elem.offsetHeight;
                }
                if (prop === 'width') {
                    return elem.offsetWidth;
                }
            }

            if (!force) {

                if (prop === 'height' &&
                    css(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return elem.offsetHeight -
                        (toPixel(css(elem, 'borderTopWidth'))) -
                        (toPixel(css(elem, 'borderBottomWidth'))) -
                        (toPixel(css(elem, 'paddingTop'))) -
                        (toPixel(css(elem, 'paddingBottom')));
                } else if (prop === 'width' &&
                    css(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return elem.offsetWidth -
                        (toPixel(css(elem, 'borderLeftWidth'))) -
                        (toPixel(css(elem, 'borderRightWidth'))) -
                        (toPixel(css(elem, 'paddingLeft'))) -
                        (toPixel(css(elem, 'paddingRight')));
                }
            }

            var computedStyle = getStyles(elem);

            if (computedStyle) {

                // IE and Firefox do not return a value for the generic borderColor -- they only return 
                // individual values for each border side's color.

                if ((_feature.ie || _feature.has('firefox')) && prop === 'borderColor') {
                    prop = 'borderTopColor';
                }

                // Support: IE9
                // getPropertyValue is only needed for .css('filter')

                if (_feature.ie === 9 && prop === 'filter') {
                    ret = computedStyle.getPropertyValue(prop);
                } else {
                    ret = computedStyle[prop];
                }

                // Fall back to the property's style value (if defined) when 'ret' returns nothing

                if (ret === '' && !_core.contains(elem.ownerDocument, elem)) {
                    ret = elem.style[prop];
                }
            }
            return ret !== undefined ? ret + '' : ret;
        };

    return {
        computed: computed,
        styles: getStyles,
        css: css
    };
});
