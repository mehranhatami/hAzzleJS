var topribol = /^(top|right|bottom|left)$/i,
    topleft = /top|left/i,
    curCSS = hAzzle.curCSS = function(elem, prop, computed) {

        if (!computed) {

            // If the computedStyle object has yet to be cached, do so now.

            if (hAzzle.data(elem, 'curCSS') === undefined) {

                computed = hAzzle.data(elem, 'curCSS', window.getComputedStyle(elem, null));

                // If computedStyle is cached, use it.

            } else {

                computed = hAzzle.data(elem, 'curCSS');
            }
        }

        if (prop === 'height' &&
            computed.getPropertyValue('boxSizing').toLowerCase() !== 'border-box') {

            return hAzzle.curCSSHeight(elem, computed);

        } else if (prop === 'width' && computed.getPropertyValue(elem, 'boxSizing').toLowerCase() !== 'border-box') {

            return hAzzle.curCSSWidth(elem, computed);
        }

        if (hAzzle.ie && prop === 'borderColor') {

            prop = 'borderTopColor';
        }

        if (hAzzle.ie === 9 && prop === 'filter') {

            computed = computed.getPropertyValue(prop);

        } else {

            computed = computed[prop];
        }

        // Fall back to the property's style value (if defined) when computedValue returns nothing, which 
        // can happen when the element hasn't been painted.

        if (computed === '') {

            computed = elem.style[prop];
        }

        if (computed === 'auto' && topribol.test(prop)) {

            var position = hAzzle.css(elem, 'position'); /* GET */

            if (position === 'fixed' || (position === 'absolute' && topleft.test(prop))) {
                computed = hAzzle(elem).position()[prop] + 'px';
            }
        }

        return computed;
    };

hAzzle.each(['Width', 'Height'], function(prop) {

    hAzzle['curCSS' + prop] = function(elem, computed) {
        return elem.offsetHeight - (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'borderLeftWidth' : 'borderTopWidth')) || 0) -
            (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'borderLeftWidth' : 'borderBottomWidth')) || 0) -
            (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'paddingLeft' : 'paddingTop')) || 0) -
            (parseFloat(computed.getPropertyValue(prop === 'Width' ? 'paddingRight' : 'paddingBottom')) || 0);
    }
});