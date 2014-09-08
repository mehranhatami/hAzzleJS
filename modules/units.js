// Wrap into a Object to avoid conflicts
lrmpRegex = /^(left$|right$|margin|padding)/,
    reafRegex = /^(relative|absolute|fixed)$/,
    topbotRegex = /^(top|bottom)$/,
    azRegex = /[%A-z]+$/,
    rotskewRegex = /^(rotate|skew)/i,
    transinpRegex = /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i,

    /**
     * Converts one unit to another
     *
     * @param {Object} target
     *  @param {String} prop
     * @param {String} returnUnit
     *
     */

    hazRegexzle.units = function(px, unit, elem, prop) {

        if (unit === '' ||
            unit === 'px') {

            return px; // Don't waste time if there is no conversion to do.
        }

        if (unit === '%') {

            if (lrmpRegex.test(prop)) {

                prop = 'width';

            } else if (topbotRegex.test(prop)) {

                prop = 'height';
            }

            elem = reafRegex.test(curCSS(elem, 'position')) ?
                elem.offsetParent : elem.parentNode;

            if (elem) {

                prop = parseFloat(curCSS(elem, prop));

                if (prop !== 0) {

                    return px / prop * 100;
                }
            }
            return 0;
        }

        if (unit === 'em') {

            return px / parseFloat(hazRegexzle.curCSS(elem, 'fontSize'));
        }

        // The first time we calculate how many pixels there is in 1 meter
        // for calculate what is 1 inch/cm/mm/etc.

        if (hazRegexzle.units.unity === undefined) {

            var units = hazRegexzle.units.unity = {};

            hazRegexzle.assert(function(div) {

                div.style.width = '100cm';
                document.body.appendChild(div);
                units.mm = div.offsetWidth / 1000;
            });

            units.cm = units.mm * 10;
            units.in = units.cm * 2.54;
            units.pt = units.in * 1 / 72;
            units.pc = units.pt * 12;
        }

        // If the unity specified is not recognized we return the value.

        unit = hazRegexzle.units.unity[unit];

        return unit ? px / unit : px;
    };

hazRegexzle.getUnitType = function(property) {
    if (rotskewRegex.test(property)) {
        return 'deg';
    } else if (transinpRegex.test(property)) {
        /* The above properties are unitless. */
        return '';
    } else {
        /* Default to px for all other properties. */
        return 'px';
    }
}