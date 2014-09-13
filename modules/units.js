// Wrap into a Object to avoid conflicts
lrmpRegex = /^(left$|right$|margin|padding)/,
    reafRegex = /^(relative|absolute|fixed)$/,
    topbotRegex = /^(top|bottom)$/,
    azRegex = /[%A-z]+$/,
    rotskewRegex = /^(rotate|skew)/i,
    transinpRegex = /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i,

    callUnitConversionData = {
        parent: null,
        position: null,
        fontSize: null,
        lastpToPW: null,
        lastToPH: null,
        lastEmToPx: null,
        remToPx: null,
        vwToPx: null,
        vhToPx: null
    }
    /**
     * Converts one unit to another
     *
     * @param {Object} target
     *  @param {String} prop
     * @param {String} returnUnit
     *
     */

    hAzzle.units = function(px, unit, elem, prop) {

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

hAzzle.getUnitType = function(property) {
    if (rotskewRegex.test(property)) {
        return 'deg';
    } else {
      
	  // Unitless properties
     
	 if(hAzzle.unitless[property]) {
       return '';
     }
		
        /* Default to px for all other properties. */
        return 'px';
    }
}

 // Calculate unit ratios

     function calculateUnitRatios(elem) {

        var sameRatioIndicators = {
                parent: elem.parentNode || document.body,
                position: getCSS(elem, 'position'),
                fontSize: getCSS(elem, 'fontSize')
            },

            // Determine if the same % ratio can be used. % is based on 
            // the elem's position value and its parent's width and height dimensions.

            samePercentRatio = ((sameRatioIndicators.position === callUnitConversionData.position) &&
                (sameRatioIndicators.parent === callUnitConversionData.parent)),

            // Determine if the same em ratio can be used. em is relative to the elem's fontSize.

            sameEmRatio = (sameRatioIndicators.fontSize === callUnitConversionData.fontSize);

        // Store these ratio indicators call-wide for the next elem to compare against.
        callUnitConversionData.parent = sameRatioIndicators.parent;
        callUnitConversionData.position = sameRatioIndicators.position;
        callUnitConversionData.fontSize = sameRatioIndicators.fontSize;

        var measurement = 100,
            unitRatios = {};

        if (!sameEmRatio || !samePercentRatio) {

            var overflowxy = ['overflow', 'overflowX', 'overflowY'],
                dim = ['minWidth', 'maxWidth', 'width', 'minHeight', 'maxHeight', 'height'],
                i = overflowxy.length,
                x = dim.length,
                dummy = hAzzle.private(elem).isSVG ?
                document.createElementNS('http://www.w3.org/TR/SVG/', 'rect') :
                document.createElement('div');

            hAzzle.styleCache(dummy);
            
            sameRatioIndicators.parent.appendChild(dummy);

            // To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
            // Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well.
            // Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values.

            while (i--) {
                setCSS(dummy, overflowxy[i], 'hidden');
            }

            setCSS(dummy, 'position', sameRatioIndicators.position);
            setCSS(dummy, 'fontSize', sameRatioIndicators.fontSize);
            setCSS(dummy, 'boxSizing', 'content-box');

            // Width and height act as our proxy properties for measuring the horizontal and vertical % ratios.

            while (x--) {
                setCSS(dummy, dim[x], measurement + '%');
            }

            // PaddingLeft arbitrarily acts as our proxy property for the em ratio.

            setCSS(dummy, 'paddingLeft', measurement + 'em');

            // Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite.

            unitRatios.lastpToPW = callUnitConversionData.lastpToPW = (parseFloat(getCSS(dummy, 'width', null, true)) || 1) / measurement;
           
            
            unitRatios.lastToPH = callUnitConversionData.lastToPH = (parseFloat(getCSS(dummy, 'height', null, true)) || 1) / measurement;
            unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(getCSS(dummy, 'paddingLeft')) || 1) / measurement;

            sameRatioIndicators.parent.removeChild(dummy);
            
            // Avoid memory leak in IE

           dummy = null;
           
        } else {
            unitRatios.lastEmToPx = callUnitConversionData.lastEmToPx;
            unitRatios.lastpToPW = callUnitConversionData.lastpToPW;
            unitRatios.lastToPH = callUnitConversionData.lastToPH;
        }

        // Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
        // once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
        // that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
        // so we calculate it now.

        if (callUnitConversionData.remToPx === null) {
            // Default to browsers' default fontSize of 16px in the case of 0.
            callUnitConversionData.remToPx = parseFloat(getCSS(document.body, 'fontSize')) || 16;
        }

        // Similarly, viewport units are %-relative to the window's inner dimensions.

        if (callUnitConversionData.vwToPx === null) {
            callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100;
            callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100;
        }

        unitRatios.remToPx = callUnitConversionData.remToPx;
        unitRatios.vwToPx = callUnitConversionData.vwToPx;
        unitRatios.vhToPx = callUnitConversionData.vhToPx;
        return unitRatios;
    }