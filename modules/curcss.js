var topribol = /^(top|right|bottom|left)$/i,
    topleft = /top|left/i,
    curCSS = hAzzle.curCSS = function(elem, prop, computed) {

        if (!computed) {

            if (hAzzle.data(elem, 'curCSS') === undefined) {

                computed = window.getComputedStyle(elem, null);

                // If the computedStyle object has yet to be cached, do so now.

            } else if (!hAzzle.data(elem, 'curCSS').computedStyle) {

                computed = hAzzle.data(elem, 'curCSS').computedStyle = window.getComputedStyle(elem, null);

                // If computedStyle is cached, use it.

            } else {

                computed = hAzzle.data(elem, 'curCSS').computedStyle;
            }
        }

        if (prop === 'height' &&
            computed.getPropertyValue('boxSizing').toLowerCase() !== 'border-box') {

            return curCSSHeight(elem, computed);

        } else if (prop === 'width' && computed.getPropertyValue(elem, 'boxSizing').toLowerCase() !== 'border-box') {

            return curCSSWidth(elem, computed);
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

            if (position === 'fixed' || (position === 'absolute' && topleft.test(property))) {
                computed = hAzzle(elem).position()[prop] + 'px';
            }
        }

        return computed;
    };

function curCSSHeight(elem, computed) {
    return elem.offsetHeight - (parseFloat(computed.getPropertyValue('borderTopWidth')) || 0) -
        (parseFloat(computed.getPropertyValue('borderBottomWidth')) || 0) -
        (parseFloat(computed.getPropertyValue('paddingTop')) || 0) - (parseFloat(computed.getPropertyValue('paddingBottom')) || 0);
}

function curCSSWidth(elem, computed) {
    return elem.offsetWidth - (parseFloat(computed.getPropertyValue('borderLeftWidth')) || 0) -
        (parseFloat(computed.getPropertyValue('borderRightWidth')) || 0) -
        (parseFloat(computed.getPropertyValue('paddingLeft')) || 0) -
        (parseFloat(computed.getPropertyValue('paddingRight')) || 0);

}