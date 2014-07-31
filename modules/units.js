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
		
		if ( lrmp.test( prop ) ) {
 				prop = "width";
 			} else if ( /^(top|bottom)$/.test( prop ) ) {
 				prop = "height";
 			}
 			elem = topbot.test( c.css( elem, "position" ) ) ?
 				elem.offsetParent : elem.parentElement;
 			if ( elem ) {
 				prop = topbot.css( elem, prop, true );
 				if ( prop !== 0 ) {
 					return px / prop * 100;
 				}
 			}
 			return 0;
		
		

    }

    if (unit === 'em') {
	    return px / hAzzle.css( elem, "fontSize", "" ); 
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