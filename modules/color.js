var colorProperties = hAzzle.colorProperties = ['backgroundColor',
        'borderColor',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor',
        'color',
        'columnRuleColor',
        'outlineColor',
        'textDecorationColor',
        'textEmphasisColor'
    ],

    // Others names can be added through plug-ins

    colorNames = hAzzle.colorNames = {
        aqua: 'rgb(0, 255, 255)',
        aliceblue: 'rgb(240, 248,255)',
        black: 'rgb(0, 0, 0)',
        blue: 'rgb(0, 0, 255)',
        fuchsia: 'rgb(255, 0, 255)',
        gray: 'rgb(128, 128, 128)',
        green: 'rgb(0, 128, 0)',
        lime: 'rgb(0, 255, 0)',
        maroon: 'rgb(128, 0, 0)',
        navy: 'rgb(0, 0, 128)',
        olive: 'rgb(128, 128, 0)',
        purple: 'rgb(128, 0, 128)',
        red: 'rgb(255, 0, 0)',
        silver: 'rgb(192, 192, 192)',
        teal: 'rgb(0, 128, 128)',
        white: 'rgb(255, 255, 255)',
        yellow: 'rgb(255, 255, 0)',
        bisque: 'rgb(255, 228, 196)',
        coral: 'rgb(255, 127, 80)',
        cyan: 'rgb(0, 255, 255)',
        crimson: 'rgb(220, 20, 60)',
        beige: 'rgb(245, 245, 220)',
        darkblue: 'rgb(0, 0, 139)',
        darkcyan: 'rgb(0, 139, 139)',
        pink: 'rgb(255, 192, 203)',
        gold: 'rgb(255, 215, 0)',
        indigo: 'rgb(75, 0, 130)',
        ivory: 'rgb(255, 139, 139)',
        magenta: 'rgb(255, 0, 255)',
    },

    // Unwrap a property value's surrounding text, e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" 
    // and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px". */

    valueUnwrap = /^[A-z]+\((.*)\)$/i,
    wrappedValueAlreadyExtracted = /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,

    // Split a multi-value property into an array of subvalues, 
    // e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]. 

    valueSplit = /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig;

hAzzle.each(colorProperties, function(colorName) {

    function hexToRgb(hex) {
        var shortformRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
            rgbParts;

        hex = hex.replace(shortformRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        rgbParts = longformRegex.exec(hex);

        return rgbParts ? 'rgb(' + (parseInt(rgbParts[1], 16) + ' ' + parseInt(rgbParts[2], 16) + ' ' + parseInt(rgbParts[3], 16)) + ')' : 'rgb(0 0 0)';
    }

    // Wrap the dynamically generated normalization function in a new scope so that 
    // colorName's value is paired with its respective function. (Otherwise, all functions 
    // would take the final for loop's colorName.) 

    (function() {

        cssCore.normalize[colorName] = function(type, element, propertyValue) {
            switch (type) {
                case 'name':
                    return colorName;
                    // Convert all color values into the rgb format.
                case 'extract':
                    var extracted;

                    if (wrappedValueAlreadyExtracted.test(propertyValue)) {
                        extracted = propertyValue;
                    } else {
                        var converted;

                        // Convert color names to rgb.

                        if (/^[A-z]+$/i.test(propertyValue)) {
                            if (colorNames[propertyValue] !== undefined) {
                                converted = colorNames[propertyValue];

                            } else {

                                // If an unmatched color name is provided, default to black.

                                converted = colorNames.black;
                            }
                            // Convert hex values to rgb.

                        } else if (/^#([A-f\d]{3}){1,2}$/i.test(propertyValue)) {
                            converted = hexToRgb(propertyValue);

                            // If the provided color doesn't match any of the accepted color formats, 
                            // default to black. 

                        } else if (!(/^rgba?\(/i.test(propertyValue))) {
                            converted = colorNames.black;
                        }

                        // Remove the surrounding 'rgb/rgba()' string then replace commas with spaces and strip 
                        // repeated spaces (in case the value included spaces to begin with).

                        extracted = (converted || propertyValue).toString().match(valueUnwrap)[1].replace(/,(\s+)?/g, ' ');
                    }

                    if (extracted.split(' ').length === 3) {
                        extracted += ' 1';
                    }

                    return extracted;
                case 'inject':

                    if (propertyValue.split(' ').length === 3) {
                        propertyValue += ' 1';
                    }

                    // Re-insert the browser-appropriate wrapper('rgb/rgba()'), insert commas, and strip off decimal 
                    // units on all values but the fourth (R, G, and B only accept whole numbers). 

                    return 'rgba(' + propertyValue.replace(/\s+/g, ',').replace(/\.(\d)+(?=,)/g, '') + ')';
            }
        };
    })();
});


// cssHook

hAzzle.each(hAzzle.colorProperties, function(prop) {
    hAzzle.cssHooks[prop] = {
        // Convert color values to rgb(a) and set the style property
        set: function(elem, value) {
            var hcn = hAzzle.cssCore.normalize,
                convert = hcn[prop]('extract', elem, value);
            elem.style[prop] = hcn[prop]('inject', elem, convert);
        }
    }

});