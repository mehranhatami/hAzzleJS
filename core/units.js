// units.js
hAzzle.include(['curcss'], function(_curcss) {
    var leftRightMargPad = /^(left$|right$|margin|padding)/,
        relAbsFixed = /^(relative|absolute|fixed)$/,
        topBottom = /^(top|bottom)$/,

        // Converts one unit to another

        units = function(px, unit, elem, prop) {

            if (unit === '' ||
                unit === 'px') {
                return px; // Don't waste time if there is no conversion to do.
            }

            if (unit === '%') {

                if (leftRightMargPad.test(prop)) {
                    prop = 'width';

                } else if (topBottom.test(prop)) {
                    prop = 'height';
                }

                elem = relAbsFixed.test(_curcss.css(elem, 'position')) ?
                    elem.offsetParent : elem.parentNode;

                if (elem) {

                    prop = parseFloat(_curcss.css(elem, prop));

                    if (prop !== 0) {
                        return px / prop * 100;
                    }
                }
                return 0;
            }

            if (unit === 'em') {
                return px / parseFloat(_curcss.css(elem, 'fontSize'));
            }

            // The first time we calculate how many pixels there is in 1 meter
            // for calculate what is 1 inch/cm/mm/etc.
            if (units.unity === undefined) {

                var u = units.unity = {},
                    div = document.createElement("div");

                div.style.width = '100cm';
                document.body.appendChild(div); // If we don't link the <div> to something, the offsetWidth attribute will be not set correctly.
                u.mm = div.offsetWidth / 1000;
                document.body.removeChild(div);
                u.cm = u.mm * 10;
                u.in = u.cm * 2.54;
                u.pt = u.in * 1 / 72;
                u.pc = u.pt * 12;
            }

            // If the unity specified is not recognized we return the value.

            unit = units.unity[unit];

            return unit ? px / unit : px;
        };

    return {
        units: units
    };
});