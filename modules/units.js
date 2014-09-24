// units.js
var urmpRegex = /^(left$|right$|margin|padding)/,
    ureafRegex = /^(relative|absolute|fixed)$/,
    utopbotRegex = /^(top|bottom)$/,
    urotskewRegex = /^(rotate|skew)/i,

    // Get unit types

    getUnitType = function (property) {
        
    if (urotskewRegex.test(property)) {
        return 'deg';
    } else if (utransinpRegex.test(property)) {
        return '';
    } else {

        if (hAzzle.unitless[property]) {
            return '';
        }

        // Default to px for all other properties.
        return 'px';
    }
},
  
/**
 * Converts one unit to another
 *
 * @param {Object} target
 * @param {String} prop
 * @param {String} returnUnit
 *
 */

units = function(px, unit, elem, prop) {

    if (unit === '' ||
        unit === 'px') {

        return px; // Don't waste time if there is no conversion to do.
    }

    if (unit === '%') {

        if (urmpRegex.test(prop)) {

            prop = 'width';

        } else if (utopbotRegex.test(prop)) {

            prop = 'height';
        }

        elem = ureafRegex.test(curCSS(elem, 'position')) ?
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
};

// Expose

hAzzle.getUnitType = getUnitType;
hAzzle.units = units;