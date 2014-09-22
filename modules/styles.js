// styles.js
var prefixMatches = {},

    cssProperties = ('textShadow opacity clip zIndex flex order borderCollapse animation animationFillMode ' +
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

    cssNormalTransform = {
        letterSpacing: '0',
        fontWeight: '400'
    },

    // Templates for use with animation engine

    templates = {
        'clip': ['Top Right Bottom Left', '0px 0px 0px 0px'],
    },

    cssCore = {

        RegEx: {
            sLnline: /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
            sListitem: /^(li)$/i,
            sTablerow: /^(tr)$/i,
            sZeroValue: /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i,
            sLeftright: /Left|Right/,
            sNumbs: /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,
            isHex: /^#([A-f\d]{3}){1,2}$/i,
            sUnwrap: /^[A-z]+\((.*)\)$/i,
            sWrappetVAE: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
            sValueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig
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

                clip: {

                    name: 'clip',
                    set: function(elem, value) {
                        return 'rect(' + value + ')';
                    },

                    get: function(elem, value) {

                        var extracted;

                        if (cssCore.RegEx.sWrappetVAE.test(value)) {
                            extracted = value;
                        } else {
                            extracted = value.toString().match(cssCore.RegEx.sUnwrap);
                            extracted = extracted ? extracted[1].replace(/,(\s+)?/g, ' ') : value;
                        }

                        return extracted;
                    }
                },

                blur: {

                    name: '-webkit-filter',
                    set: function(elem, value) {

                        if (!parseFloat(value)) {
                            return 'none';
                        } else {
                            return 'blur(' + value + ')';
                        }
                    },
                    get: function(elem, value) {

                        var extracted = parseFloat(value);
                        if (!(extracted || extracted === 0)) {
                            var blurComponent = value.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                            if (blurComponent) {
                                extracted = blurComponent[1];
                            } else {
                                extracted = 0;
                            }
                        }
                        return extracted;
                    }
                }
            }
        },

        // CSS hooks

        hooks: {

            opacity: {
                name: 'opacity',
                set: function(elem, value) {
                    return value;
                },
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
    },

    prefixCheck = function(prop) {

        if (prefixMatches[prop]) {
            return [prefixMatches[prop], true];
        }
        return [prop, false];
    },

    getRoot = function(property) {
        var hookData = cssCore.FX.activated[property];

        if (hookData) {
            return hookData[0];
        } else {
            // If there was no hook match, return the property name untouched
            return property;
        }
    },

    cleanRootPropertyValue = function(rootProperty, rootPropertyValue) {

        if (cssCore.RegEx.sUnwrap.test(rootPropertyValue)) {
            rootPropertyValue = rootPropertyValue.match(cssCore.FX.RegEx.sUnwrap)[1];
        }

        if (hAzzle.isZeroValue(rootPropertyValue)) {
            rootPropertyValue = templates[rootProperty][1];
        }

        return rootPropertyValue;
    },

    extractValue = function(name, value) {
        var hookData = cssCore.FX.activated[name];
        if (hookData) {
            var hookRoot = hookData[0],
                hookPosition = hookData[1];
            value = cleanRootPropertyValue(hookRoot, value);
            return value.toString().match(cssCore.RegEx.sValueSplit)[hookPosition];
        } else {
            return value;
        }
    },

    // Inject value

    injectValue = function(name, value, root) {
        var hookData = cssCore.FX.activated[name];
        if (hookData) {
            var hookRoot = hookData[0],
                hookPosition = hookData[1],
                rootParts,
                rootUpdated;
            root = cleanRootPropertyValue(hookRoot, root);
            rootParts = root.match(cssCore.RegEx.sValueSplit);
            rootParts[hookPosition] = value;
            rootUpdated = rootParts.join(' ');

            return rootUpdated;
        } else {
            return root;
        }
    },

    cssHook = cssCore.hooks,

    // Style getter / setter for animation engine

    getFXCss = function(elem, prop, root, force) {
        var propertyValue;

        // Check for FX hook

        if (cssCore.FX.activated[prop]) {

            var hook = prop,
                hookRoot = getRoot(hook);

            if (root === undefined) {
                root = getFXCss(elem, hAzzle.prefixCheck(hookRoot)[0]);
            }

            if (cssCore.FX.cssHooks[hookRoot]) {
                root = cssCore.FX.cssHooks[hookRoot].get(elem, root);
            }

            propertyValue = extractValue(hook, root);

        } else if (cssCore.FX.cssHooks[prop]) {
            var normalizedPropertyName = cssCore.FX.cssHooks[prop].name,
                normalizedPropertyValue;

            if (normalizedPropertyName !== 'transform') {
                normalizedPropertyValue = curCSS(elem, hAzzle.prefixCheck(normalizedPropertyName)[0], force);

                if (hAzzle.isZeroValue(normalizedPropertyValue) && templates[prop]) {
                    normalizedPropertyValue = templates[prop][1];
                }
            }

            propertyValue = cssCore.FX.cssHooks[prop].get(elem, normalizedPropertyValue);
        }

        if (!/^[\d-]/.test(propertyValue)) {
            if (hAzzle.private(elem, 'CSS') && hAzzle.private(elem, 'CSS').isSVG && cssCore.Names.SVGAttribute(prop)) {

                if (/^(height|width)$/i.test(prop)) {
                    propertyValue = elem.getBBox()[prop];
                } else {
                    propertyValue = elem.getAttribute(prop);
                }
            } else {
                propertyValue = curCSS(elem, hAzzle.prefixCheck(prop)[0]);
            }
        }

        if (hAzzle.isZeroValue(propertyValue)) {
            propertyValue = 0;
        }
        return propertyValue;
    },

    setFXCss = function(elem, prop, value, root, scrollData) {
        var propertyName = prop;

        if (prop === 'scroll') {
            if (scrollData.container) {
                scrollData.container['scroll' + scrollData.direction] = value;
            } else {
                if (scrollData.direction === 'Left') {
                    window.scrollTo(value, scrollData.alternateValue);
                } else {
                    window.scrollTo(scrollData.alternateValue, value);
                }
            }
        } else {

            if (cssCore.FX.cssHooks[prop] && cssCore.FX.cssHooks[prop].name === 'transform') {
                cssCore.FX.cssHooks[prop].set(elem, value);
                propertyName = 'transform';
                value = hAzzle.private(elem, 'CSS').transformCache[prop];
            } else {
                if (cssCore.FX.activated[prop]) {
                    var hookName = prop,
                        hookRoot = getRoot(prop);

                    root = root || getFXCss(elem, hookRoot);

                    value = injectValue(hookName, value, root);
                    prop = hookRoot;
                }

                if (cssCore.FX.cssHooks[prop]) {
                    value = cssCore.FX.cssHooks[prop].set(elem, value);
                    prop = cssCore.FX.cssHooks[prop].name;
                }

                propertyName = hAzzle.prefixCheck(prop)[0];

                if (hAzzle.private(elem, 'CSS') && hAzzle.private(elem, 'CSS').isSVG && cssCore.Names.SVGAttribute(prop)) {
                    hAzzle.setAttribute(elem, prop, value);
                } else {
                    elem.style[propertyName] = value;
                }
            }
        }
        return [propertyName, value];
    },

    // The two following functions are kept due to jQuery API compability

    getCSS = function(elem, prop, extra, styles) {

        var val, num;

        prop = cssCore.cssCamelized[prop];

        if (cssHook[prop]) {
            val = cssHook[prop].get(elem, prop);
        }

        // Otherwise, if a way to get the computed value exists, use that

        if (val === undefined) {
            val = curCSS(elem, prop, null, styles);
        }

        // Convert "normal" to computed value
        if (val === 'normal' && prop in cssNormalTransform) {
            val = cssNormalTransform[prop];
        }

        if (extra === '' || extra) {
            num = parseFloat(val);
            return extra === true || hAzzle.isNumeric(num) ? num || 0 : val;
        }

        return val;
    },

    setCSS = function(elem, prop, value, extra) {

        var type, ret, oldValue,
            nType = elem.nodeType,
            style = elem.style;

        // Don't set styles on text and comment nodes
        if (nType === 3 ||
            nType === 8 || !elem) {
            return;
        }

        // Check if we're setting a value

        if (value !== undefined) {

            // Check for 'cssHook'

            if (cssHook[prop]) {
                value = cssHook[prop].set(elem, value, extra);
                prop = cssHook[prop].name;

            } else {
                prop = cssCore.cssCamelized[prop];
            }

            // Assign the appropriate vendor prefix before perform an official style update.

            prop = hAzzle.prefixCheck(prop)[0];

            type = typeof value;

            // Convert relative number strings

            if (type === 'string' && (ret = cssCore.RegEx.sNumbs.exec(value))) {
                value = hAzzle.css(elem, prop, '');
                value = hAzzle.units(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];
                type = 'number';
            }

            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {

                return;
            }

            // If a number was passed in, add 'px' to the number (except for certain CSS properties)

            if (type === 'number' && !hAzzle.unitless[prop]) {

                value += ret && ret[3] ? ret[3] : 'px';
            }

            if (cssCore.has['bug-clearCloneStyle'] &&
                value === '' && prop.indexOf('background') === 0) {
                style[cssCore.cssCamelized[prop]] = 'inherit';
            }

            oldValue = elem.style[name];
            style[name] = value;

            // Revert to the old value if the browser didn't accept the new rule to
            // not break the cascade.

            if (value && !elem.style[name]) {
                style[name] = oldValue;
            }

            style[prop] = value;

        } else {

            // If a hook was provided get the non-computed value from there

            if (cssHook[prop]) {
                return cssHook[prop].get(elem, prop);
            }

            // Otherwise just get the value from the style object
            return style[prop];
        }
    };

hAzzle.extend({

    css: function(name, value) {

        return hAzzle.setter(this, function(elem, name, value) {
            var map = {},
                i = 0;

            if (hAzzle.isArray(name)) {

                i = name.length;

                while (i--) {

                    map[name[i]] = getCSS(elem, name[i], false);
                }

                return map;
            }

            return value !== undefined ?
                setCSS(elem, name, value) :
                getCSS(elem, name);
        }, name, value, arguments.length > 1);
    },

    zIndex: function(zIndex) {
        if (zIndex !== undefined) {
            return this.css('zIndex', zIndex);
        }

        if (this.length) {
            var elem = hAzzle(this[0]),
                position, value;
            while (elem.length && elem[0] !== document) {
                position = elem.css('position');
                if (position === 'absolute' || position === 'relative' || position === 'fixed') {
                    value = parseInt(elem.css('zIndex'), 10);
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                elem = elem.parent();
            }
        }

        return 0;
    }
});

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
hAzzle.css = getCSS;
hAzzle.style = setCSS;

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
    var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
        unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, function(str) {
            return str[1].toUpperCase();
        });
    // Most of browsers starts vendor specific props in lowercase
    if (!(stylePropName in computed)) {
        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    // 'prefixMatches' contains:
    // camelized properties to left - camelized vendor prefixed properties to right
    // To get a prefixed property, just to:
    //
    // prefixMatches[boxAlign]
    //
    // Result in Firefox would be: MozBoxAlign

    prefixMatches[hAzzle.camelize(unprefixedName)] = stylePropName;

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
    return cssCore.cssCamelized[prop]
};


// Detect support for other CSS properties
hAzzle.each(cssProperties, function(prop) {
    if (prefixMatches[prop]) {
        hAzzle.cssSupport[prop] = true;
    }
});


// Fixes Chrome bug / issue
if (hAzzle.isChrome) {
    hAzzle.cssHooks.textDecoration = {
        name: 'textDecoration',
        set: function(elem, value) {
            return value;
        },
        get: function(elem, computed) {
            if (computed) {

                //Chrome 31-36 return text-decoration-line and text-decoration-color
                //which are not expected yet.
                //see https://code.google.com/p/chromium/issues/detail?id=342126
                var ret = curCSS(elem, "text-decoration");
                //We cannot assume the first word as "text-decoration-style"
                if (/\b(inherit|(?:und|ov)erline|blink|line\-through|none)\b/.test(ret)) {
                    return RegExp.$1;
                }
            }
        }
    }
}