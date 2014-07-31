var lrmp = /^(left$|right$|margin|padding)/,
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

    if (unit === '' || 
	    unit === 'px') {

        return px; // Don't waste our time if there is no conversion to do.
    }

    if (unit === '%') {
		
		if ( lrmp.test( prop ) ) {

 				prop = 'width';

 			} else if ( topbot.test( prop ) ) {

 				prop = 'height';
 			}
			
 			elem = reaf.test( hAzzle.css( elem, 'position' ) ) ?
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
	    return px / hAzzle.css( elem, 'fontSize', '' ); 
    }
     
	 // The first time we calculate how many pixels there is in 1 meter
 	 // for calculate what is 1 inch/cm/mm/etc.
    
	if (hAzzle.units.unity === undefined) {

        var units = hAzzle.units.unity = {};

        hAzzle.assert(function (div) {

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