var lrmp = /^(left$|right$|margin|padding)/,
    reaf = /^(relative|absolute|fixed)$/,
    topbot = /^(top|bottom)$/;

hAzzle.extend({
    /**
     * Converts one unit to another
     *
     * @param {Object} target
     *  @param {String} prop
     * @param {String} returnUnit
     *
     */

    units: function(px, unit, elem, prop) {

        if (unit === '' ||
            unit === 'px') {

            return px; // Don't waste our time if there is no conversion to do.
        }

        if (unit === '%') {

            if (lrmp.test(prop)) {
                prop = "width";
            } else if (topbot.test(prop)) {
                prop = "height";
            }
            elem = reaf.test(curCSS(elem, "position")) ?
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
            return px / parseFloat(hAzzle.curCSS(elem, 'fontSize'));
        }

        // The first time we calculate how many pixels there is in 1 meter
        // for calculate what is 1 inch/cm/mm/etc.

        if (hAzzle.units.unity === undefined) {

            var units = hAzzle.units.unity = {};

            hAzzle.assert(function(div) {

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

        unit = hAzzle.units.unity[unit];

        return unit ? px / unit : px;
    },

    /**
     * Separates a property value into its numeric value and its unit type.
     */

    separateValue: function(property, value) {
        var unitType,
            numericValue;

        numericValue = (value || 0)
            .toString()
            .toLowerCase()
            // Match the unit type at the end of the value.
            .replace(/[%A-z]+$/, function(match) {
                // Grab the unit type.
                unitType = match;

                // Strip the unit type off of value.
                return "";
            });

        // If no unit type was supplied, assign one that is appropriate for this 
        // property (e.g. 'deg' for rotateZ or 'px' for width).

        if (!unitType) {
            unitType = hAzzle.getUnitType(property);
        }

        // Return an array with the numeric value and the unit type

        return [numericValue, unitType];
    }

}, hAzzle);