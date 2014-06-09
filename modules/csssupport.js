/**
 * hAzzle cssSupport checks if the browsers supports different
 * CSS properties e.g. transform and transitions
 *
 * Natively hAzzle have build-in support for
 * this properties:
 *
 * - transform
 * - transition
 * - animation
 * - textShadow
 * - linearGradient
 * - radialGradient
 * - columnCount
 * - boxSizing (boolean: true / false)
 * - boxShadow
 * - borderImage
 * - boxReflect (boolean: true / false)
 *
 * There also exist cssHooks for all
 * CSS properties listed here.
 *
 * cssSupport are plugin-friendly and can
 * be extended.
 *
 */
var div = document.createElement('div'),
    divStyle = div.style,
    propertyName = 'transform',

    transformProperties = [
        'oTransform',
        'msTransform',
        'webkitTransform',
        'MozTransform',
        // prefix-less property
        propertyName
    ],
    transitionProps = [
        'Property',
        'Duration',
        'TimingFunction'
    ],

    i = transformProperties.length,
    supportProperty,
    rWhitespace = /\s/,


    rLinear = /^(.*?)linear-gradient(.*?)$/i,
    rRadial = /^(.*?)radial-gradient(.*?)$/i,
    rLinearSettings = /^(.*?)(:?linear-gradient)(\()(.*)(\))(.*?)$/i,
    rRadialSettings = /^(.*?)(:?radial-gradient)(\()(.*?)(\))(.*?)$/i,
    rSupportLinearW3C = /(^|\s)linear-gradient/,
    rSupportLinearMoz = /(^|\s)-moz-linear-gradient/,
    rSupportLinearWebkit = /(^|\s)-webkit-linear-gradient/,
    rSupportLinearOpera = /(^|\s)-o-linear-gradient/,
    rSupportRadialW3C = /(^|\s)radial-gradient/,
    rSupportRadialMoz = /(^|\s)-moz-radial-gradient/,
    rSupportRadialWebkit = /(^|\s)-webkit-radial-gradient/,
    rSupportRadialOpera = /(^|\s)-o-radial-gradient/,
    rWhitespace = /\s/,

    rParenWhitespace = /\)\s/,
    cssProps = 'background backgroundImage listStyleImage',
    cssLinear = 'background:-moz-linear-gradient(red, blue);background:-webkit-linear-gradient(red, blue);background:-o-linear-gradient(red, blue);background:-ms-linear-gradient(red, blue);background:linear-gradient(red, blue);',

    cssRadial = 'background-image: -moz-radial-gradient(circle, orange, red);background-image: -webkit-radial-gradient(circle, orange, red);background-image: -o-radial-gradient(circle,red, blue);background-image: radial-gradient(circle, orange, red);',
    cssPropsArray = cssProps.split(rWhitespace),

    column = 'Column',
    columnProps = 'Span Count Gap Width RuleColor RuleStyle RuleWidth'.split(rWhitespace),
    columnPrefix = divStyle.WebkitColumnGap === '' ? 'Webkit' : (divStyle.MozColumnGap === '' ? 'Moz' : ''),
    getCssProperty = function (columnPrefix, columnProps) {
        return columnPrefix + ((columnPrefix === '') ? column.toLowerCase() : column) + columnProps;
    };

// Textshadow check

hAzzle.cssSupport.textShadow = (divStyle.textShadow === '');

// test different vendor prefixes of this property
while (i--) {
    if (transformProperties[i] in divStyle) {
        hAzzle.cssSupport[propertyName] = supportProperty = transformProperties[i];
        continue;
    }
}

hAzzle.cssSupport.columnCount =
    divStyle.MozColumnCount === '' ? 'MozColumnCount' :
    (divStyle.msColumnCount === '' ? 'msColumnCount' :
    (divStyle.WebkitColumnCount === '' ? 'WebkitColumnCount' :
        (divStyle.OColumnCount === '' ? 'OColumnCount' :
            (divStyle.boxShadow === '' ? false :
                false))));

hAzzle.cssSupport.transition =
    divStyle.MozTransition === '' ? 'MozTransition' :
    (divStyle.msTransition === '' ? 'msTransition' :
    (divStyle.WebkitTransition === '' ? 'WebkitTransition' :
        (divStyle.OTransition === '' ? 'OTransition' :
            (divStyle.transition === '' ? 'Transition' :
                false))));
/*
 * Mehran!!
 *
 * There are no cssHooks for this properties. You
 * have to develop that !!
 */
 
hAzzle.cssSupport.animation =
    divStyle.MozAnimation === '' ? 'MozAnimation' :
    (divStyle.msAnimation === '' ? 'msAnimation' :
    (divStyle.WebkitAnimation === '' ? 'WebkitAnimation' :
        (divStyle.OAnimation === '' ? 'OAnimation' :
            (divStyle.animation === '' ? false :
                false))));


hAzzle.cssSupport.boxSizing =
    divStyle.MozBoxSizing === '' ? 'MozBoxSizing' :
    (divStyle.msBoxSizing === '' ? 'msBoxSizing' :
    (divStyle.WebkitBoxSizing === '' ? 'WebkitBoxSizing' :
        (divStyle.OBoxSizing === '' ? 'OBoxSizing' :
            (divStyle.boxSizing === '' ? 'boxSizing' :
                false))));

hAzzle.cssSupport.boxShadow =
    divStyle.MozBoxShadow === '' ? 'MozBoxShadow' :
    (divStyle.msBoxShadow === '' ? 'msBoxShadow' :
    (divStyle.WebkitBoxShadow === '' ? 'WebkitBoxShadow' :
        (divStyle.OBoxShadow === '' ? 'OBoxShadow' :
            (divStyle.boxShadow === '' ? false :
                false))));

hAzzle.cssSupport.boxReflect =
    divStyle.boxReflect === '' ? 'boxReflect' :
    (divStyle.MozBoxReflect === '' ? 'MozBoxReflect' :
    (divStyle.WebkitBoxReflect === '' ? 'WebkitBoxReflect' :
        (divStyle.OBoxReflect === '' ? 'OBoxReflect' : false)));


hAzzle.cssSupport.borderImage =
    divStyle.borderImage === '' ? 'borderImage' :
    (divStyle.msBorderImage === '' ? 'msBorderImage' :
    (divStyle.MozBorderImage === '' ? 'MozBorderImage' :
    (divStyle.WebkitBorderImage === '' ? 'webkitBorderImage' :
        (divStyle.OBorderImage === '' ? 'OBorderImage' : false))));

divStyle.cssText = cssLinear;

hAzzle.cssSupport.linearGradient =
    rSupportLinearW3C.test(divStyle.backgroundImage) ? 'linear-gradient' :
    (rSupportLinearMoz.test(divStyle.backgroundImage) ? '-moz-linear-gradient' :
    (rSupportLinearWebkit.test(divStyle.backgroundImage) ? '-webkit-linear-gradient' :
        (rSupportLinearOpera.test(divStyle.backgroundImage) ? '-o-linear-gradient' :
            false)));

divStyle.cssText = cssRadial;

hAzzle.cssSupport.radialGradient =
    rSupportRadialW3C.test(divStyle.backgroundImage) ? 'radial-gradient' :
    (rSupportRadialMoz.test(divStyle.backgroundImage) ? '-moz-radial-gradient' :
    (rSupportRadialWebkit.test(divStyle.backgroundImage) ? '-webkit-radial-gradient' :
        (rSupportRadialOpera.test(divStyle.backgroundImage) ? '-o-radial-gradient' :
            false)));


// prevent IE memory leak
div = divStyle = null;

// Skip 'px' on transform property

hAzzle.unitless[propertyName] = true;

// Add to cssProps

if (supportProperty && supportProperty != propertyName) {
    hAzzle.cssProps[propertyName] = supportProperty;
}

/**
 * Add CSS transitions to cssHooks
 *
 * Note!! This one can also be without vendor prefix
 *
 */

if (hAzzle.cssSupport.transition) {
    hAzzle.cssHooks.transition = {
        get: function (elem) {
            return hAzzle.map(transitionProps, function (transitionProps) {
                return hAzzle.getStyle(elem, hAzzle.cssProps.transition + transitionProps);
            }).join(" ");
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.transition] = value;
        }
    };

    hAzzle.each(transitionProps, function (transitionProps) {
        hAzzle.cssHooks["transition" + transitionProps] = {
            get: function (elem) {
                return hAzzle.getStyle(elem, hAzzle.cssSupport.transition + transitionProps);
            },
            set: function (elem, value) {
                elem.style[hAzzle.cssSupport.transition + transitionProps] = value;
            }
        };
    });

}
/**
 * Add gradient to cssHooks
 */


function linearSettings(value) {
    var parts = rLinearSettings.exec(value);
    value = value.replace(new RegExp(parts[2], 'g'), hAzzle.cssSupport.linearGradient);
    return value;
}

function radialSettings(value) {
    var parts = rRadialSettings.exec(value);
    value = value.replace(new RegExp(parts[2], 'g'), hAzzle.cssSupport.radialGradient);
    return value;
}


if (hAzzle.cssSupport.linearGradient && hAzzle.cssSupport.linearGradient !== "linear-gradient") {

    hAzzle.each(cssPropsArray, function (cssProps) {

        hAzzle.cssHooks[cssProps] = {

            set: function (elem, value) {

                if (rLinear.test(value)) {
                    elem.style[cssProps] = linearSettings(value);
                } else if (rRadial.test(value)) {
                    elem.style[cssProps] = radialSettings(value);
                } else {
                    elem.style[cssProps] = value;
                }
            }
        };

    });

}
if (hAzzle.cssSupport.columnCount) {

    hAzzle.each(columnProps, function (columnProps) {


        hAzzle.cssHooks['column' + columnProps] = {
            get: function (elem) {
                return hAzzle.getStyle(elem, getCssProperty(columnPrefix, columnProps));
            },
            set: function (elem, value) {
                elem.style[getCssProperty(columnPrefix, columnProps)] = value;
            }
        };

    });
}

if (hAzzle.cssSupport.boxSizing) {

    hAzzle.cssHooks.boxSizing = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxSizing);
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxSizing] = value;
        }
    };
}


function insert_into(string, value, index) {
    var parts = string.split(rWhitespace);
    parts[index] = value;
    return parts.join(" ");
}

if (hAzzle.cssSupport.boxShadow) {

    hAzzle.cssProps.boxShadow = hAzzle.cssSupport.boxShadow;

    hAzzle.cssHooks.boxShadow = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow);
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxShadow] = value;
        }
    };

    hAzzle.cssHooks.boxShadowColor = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow).split(rParenWhitespace)[0] + ')';
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxShadow] = value + " " + hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow).split(rParenWhitespace)[1];
        }
    };

    hAzzle.cssHooks.boxShadowBlur = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow).split(rWhitespace)[5];
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxShadow] = insert_into(hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow), value, 5);
        }
    };

    hAzzle.cssHooks.boxShadowSpread = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow).split(rWhitespace)[6];
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxShadow] = insert_into(hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow), value, 6);
        }
    };

    hAzzle.cssHooks.boxShadowX = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow).split(rWhitespace)[3];
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxShadow] = insert_into(hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow), value, 3);
        }
    };

    hAzzle.cssHooks.boxShadowY = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow).split(rWhitespace)[4];
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxShadow] = insert_into(hAzzle.getStyle(elem, hAzzle.cssSupport.boxShadow), value, 4);
        }
    };


}

if (hAzzle.cssSupport.borderImage) {
    hAzzle.cssHooks.borderImage = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.borderImage);
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.borderImage] = value;
        }
    };
}

if (hAzzle.cssSupport.boxReflect) {

    hAzzle.cssHooks.boxReflect = {
        get: function (elem) {
            return hAzzle.getStyle(elem, hAzzle.cssSupport.boxReflect);
        },
        set: function (elem, value) {
            elem.style[hAzzle.cssSupport.boxReflect] = value;
        }
    };
}