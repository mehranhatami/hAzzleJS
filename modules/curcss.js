// url: ehttp://caniuse.com/getcomputedstyle
var topribol = /^(top|right|bottom|left)$/i,
    topleft = /top|left/i,
    computedValues = function(elem) {

        if (elem && elem !== window) {

            if (elem.ownerDocument !== undefined) {
                var view = elem.ownerDocument.defaultView;
            }
            return view && hAzzle.cssCore.has['api-gCS'] ? (view.opener ? view.getComputedStyle(elem, null) :
                window.getComputedStyle(elem, null)) : elem.style;
        }
        return null;
    },
    getStyles = function(elem) {

        var computed;

        // We save the computedStyle on the object to avoid stressing the DOM

        if (hAzzle.data(elem, 'CSS') === undefined) {
            //console.log('not cached')
            return computedValues(elem);

            /* If the computedStyle object has yet to be cached, do so now. */
        } else if (!hAzzle.data(elem, 'CSS').computedStyle) {
            //console.log('caching just NOW')
            computed = hAzzle.data(elem, 'CSS').computedStyle = computedValues(elem);

            // If computedStyle is cached, use it.

        } else {
            // console.log('data cached')
            computed = hAzzle.data(elem, 'CSS').computedStyle;
        }

        return computed;
    },

    curCSS = hAzzle.curCSS = function(elem, prop, computed) {

        computed = computed || getStyles(elem);

        if (prop === 'height' && computed.getPropertyValue(elem, 'boxSizing').toLowerCase() !== 'border-box') {

            return hAzzle.curCSSHeight(elem, computed);

        } else if (prop === 'width' && computed.getPropertyValue(elem, 'boxSizing').toLowerCase() !== 'border-box') {

            return hAzzle.curCSSWidth(elem, computed);
        }

        // Internet Explorer doesn't return a value for borderColor - it only returns 
        // individual values for each border side's color. 
        // As a polyfill, default to querying for just the top border's color

        if (hAzzle.ie && prop === 'borderColor') {

            prop = 'borderTopColor';
        }

        // IE9 has a bug in which the "filter" property must be accessed from computedStyle 
        // using the getPropertyValue method instead of a direct property lookup.  The getPropertyValue
        // method is slower than a direct lookup, which is why we avoid it by default.

        if (hAzzle.ie === 9 && prop === 'filter') {

            computed = computed.getPropertyValue(prop);
        }

        if (computed === 'auto' && topribol.test(prop)) {

            var position = hAzzle.css(elem, 'position');

            if (position === 'fixed' || (position === 'absolute' && topleft.test(prop))) {

                // hAzzle strips the pixel unit from its returned values; we re-add it here 
                // to conform with computePropertyValue's behavior.

                computed = hAzzle(elem).position()[prop] + 'px';
            }

        } else {
            if (computed != null) {
                computed = computed[prop];
            }
        }

        return computed;
    };

hAzzle.each(['Width', 'Height'], function(prop) {
    hAzzle['curCSS' + prop] = function(elem, computed) {
        if (computed) {
            return elem.offsetHeight - (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'borderLeftWidth' : 'borderTopWidth')) || 0) -
                (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'borderLeftWidth' : 'borderBottomWidth')) || 0) -
                (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'paddingLeft' : 'paddingTop')) || 0) -
                (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'paddingRight' : 'paddingBottom')) || 0);
        }
        return null;
    };
});