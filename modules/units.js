var doc = this.document,
    lrmp = /^(left$|right$|margin|padding)/,
    reaf = /^(relative|absolute|fixed)$/,
    topbot = /^(top|bottom)$/;

/**
 * Converts one unit to another
 *
 * @param {Object} target
 *  @param {String} prop
 * @param {String} returnUnit
 *
 */

hAzzle.units = function (px, unit, elem, prop) {

    var val, num;

    if (unit === '' || unit === 'px') {

        return px; // Return if already 'px' or blank
    }

    if (unit === '%') {

        if (lrmp.test(prop)) {
            prop = 'width';

        } else if (topbot.test(prop)) {

            prop = 'height';
        }

        if (reaf.test(hAzzle.css(elem, 'position'))) {

            elem = elem.offsetParent;

        } else {

            elem = elem.parentNode;
        }

        if (elem) {

            val = hAzzle.css(elem, prop);
            num = num = parseFloat(val);

            prop = hAzzle.isNumeric(num) ? num || 0 : val;

            if (prop !== 0) {

                return px / prop * 100;
            }
        }
        return 0;
    }

    if (unit === 'em') {


        val = hAzzle.css(elem, 'fontSize');
        num = parseFloat(val);

        prop = hAzzle.isNumeric(num) ? num || 0 : val;

        return px / prop;
    }

    if (hAzzle.units.unity === undefined) {

        var units = hAzzle.units.unity = {};

        hAzzle.assert(function (div) {

            div.style.width = '100cm';
            doc.body.appendChild(div);
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