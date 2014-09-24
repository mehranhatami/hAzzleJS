// csscore.js
var cssProperties = ('textShadow opacity clip zIndex flex order borderCollapse animation animationFillMode ' +
        'animationDirection animatioName animationTimingFunction animationPlayState perspective boxSizing ' +
        'textOverflow columns borderRadius boxshadow borderImage columnCount boxReflect transform transformOrigin ' +
        'columnRuleColor outlineColor textDecorationColor textEmphasisColor transition transitionDelay filter ' +
        'columnSpan columnCount columnGap columnWidth columnRuleColor columnRuleStyle columnRuleWidth').split(' '),

    unitlessProps = ('zoom box-flex columns counter-reset volume stress overflow flex-grow ' +
        'column-count flex-shrink flex-height order orphans widows rotate3d flipped ' +
        'transform ms-flex-order transform-origin perspective transform-style ' +
        'ms-flex-negative ms-flex-positive transform-origin perspective ' +
        'perspective-origin backface-visibility scale scale-x scale-y scale-z ' +
        'scale3d reflect-x-y reflect-z reflect-y reflect ' +
        'background-color border-bottom-color border-left-color border-right-color border-top-color ' +
        'color column-rule-color outline-color text-decoration-color text-emphasis-color ' +
        'alpha z-index font-weight opacity red green blue').split(' '),

    prefixCache = {},

    cssCore = {

        // RegEx we are using

        RegEx: {
            sLnline: /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
            sListitem: /^(li)$/i,
            sTablerow: /^(tr)$/i,
            sZeroValue: /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i,
            sLeftright: /Left|Right/,
            sNumbs: /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
            isHex: /^#([A-f\d]{3}){1,2}$/i,
            sUnwrap: /^[A-z]+\((.*)\)$/i,
        },

        cssProps: {
            'float': 'cssFloat'
        },

        // Unitless CSS properties

        unitless: {},

        // Pre-camelized CSS properties

        cssCamelized: {},

        has: {

            // Check for getComputedStyle support

            ComputedStyle: !!document.defaultView.getComputedStyle
        },

        support: {},

        // Animation

        FX: {

            // CSS Properties activated for the animation engine

            activated: {},

            cssHooks: {

            }
        },

        // CSS hooks

        hooks: {

            opacity: {
                get: function(elem, value) {

                    if (value) {
                        // We should always get a number back from opacity
                        var ret = curCSS(elem, 'opacity');
                        return ret === '' ? '1' : ret;
                    }
                }
            },
        }
    },

    // Expose

    cssHook = cssCore.hooks,

    prefixCheck = function(prop) {
        if (prefixCache[prop]) {
            return [prefixCache[prop], true];
        }
        return [prop, false];
    },
    getDisplayType = function(elem) {
        var tagName = elem.tagName.toLowerCase();
        if (cssCore.RegEx.sLnline.test(tagName)) {
            return 'inline';
        }
        if (cssCore.RegEx.sListitem.test(tagName)) {
            return 'list-item';
        }
        if (cssCore.RegEx.sTablerow.test(tagName)) {
            return 'table-row';
        }
        return 'block';
    },

    isZeroValue = function(value) {
        return (value === 0 || cssCore.RegEx.sZeroValue.test(value));
    };

// Expose

hAzzle.cssCore = cssCore;
hAzzle.unitless = cssCore.unitless;
hAzzle.cssProperties = cssProperties;
hAzzle.cssSupport = cssCore.support;
hAzzle.cssProps = cssCore.cssProps;
hAzzle.cssHas = cssCore.has;
hAzzle.getDisplayType = getDisplayType;
hAzzle.isZeroValue = isZeroValue;
hAzzle.prefixCheck = prefixCheck;
hAzzle.cssHooks = cssHook;
hAzzle.fxHooks = cssCore.FX.cssHooks;

/* ============================ FEATURE / BUG DETECTION =========================== */

hAzzle.assert(function(div) {

    var pixelPositionVal, boxSizingReliableVal;

    div.style.backgroundClip = 'content-box';
    div.cloneNode(true).style.backgroundClip = '';

    cssCore.has['bug-clearCloneStyle'] = div.style.backgroundClip === 'content-box';

    // Only if ComputedStyle are supported

    if (hAzzle.cssHas.ComputedStyle) {

        div.style.cssText = 'border:1px;padding:1px;width:4px;position:absolute';
        var divStyle = window.getComputedStyle(div, null);

        cssCore.has['api-boxSizing'] = divStyle.boxSizing === 'border-box';

        pixelPositionVal = divStyle.top !== '1%';
        boxSizingReliableVal = divStyle.width === '4px';
        cssCore.has['api-pixelPosition'] = pixelPositionVal;
        cssCore.has['api-boxSizingReliable'] = boxSizingReliableVal;
    }
});

// Check for translate3d support

hAzzle.assert(function(div) {

    var has3d, t, transforms = {
        'webkitTransform': '-webkit-transform',
        'OTransform': '-o-transform',
        'msTransform': '-ms-transform',
        'MozTransform': '-moz-transform',
        'transform': 'transform'
    };

    for (t in transforms) {
        if (div.style[t] !== undefined) {
            div.style[t] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(div).getPropertyValue(transforms[t]);
        }
    }

    hAzzle.cssSupport.translate3d = (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
});

// Extend CSS properties

hAzzle.cssProps.transform = cssCore.support.transform;
hAzzle.cssProps.transformOrigin = cssCore.support.transformOrigin;

/* ============================ AUTO-PREFIXING / CAMELIZING =========================== */

var computed = getStyles(document.documentElement),
    reDash = /\-./g,
    props = Array.prototype.slice.call(computed, 0);

// Iterate through    

hAzzle.each(props, function(propName) {
    var prefix = propName[0] === '-' ? propName.substr(1, propName.indexOf('-', 1) - 1) : null,
        unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, function(str) {
            return str[1].toUpperCase();
        });
    // Most of browsers starts vendor specific props in lowercase
    if (!(stylePropName in computed)) {
        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    // 'prefixCache' contains:
    // camelized properties to left - camelized vendor prefixed properties to right
    // To get a prefixed property, just to:
    //
    // prefixCache[boxAlign]
    //
    // Result in Firefox would be: MozBoxAlign

    prefixCache[hAzzle.camelize(unprefixedName)] = stylePropName;

    // 'cssCamelized' contains:
    // un-prefixed CSS properties to left - camelized properties to right
    // To get a camelized property, just to:
    //
    // hAzzle.autoCamelize[animation-iteration-count]

    //
    // Result: 'animationIterationCount'

    cssCore.cssCamelized[unprefixedName] = stylePropName;
});

// Populate the unitless properties list

hAzzle.each(unitlessProps, function(prop) {
    hAzzle.unitless[cssCore.cssCamelized[prop]] = true;
});

// Expose

hAzzle.autoCamelize = function(prop) {
    return cssCore.cssCamelized[prop];
};


// Detect support for other CSS properties
hAzzle.each(cssProperties, function(prop) {
    if (prefixCache[prop]) {
        hAzzle.cssSupport[prop] = true;
    }
});