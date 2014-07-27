// css.js
// Holds all css related code - isolated from the 
// global scope
var

  topBottomRegEx =  /Top|Bottom/,
  absoluteRegex =  /absolute|fixed/,
  autoRegex = /auto/g,
  leftrightRegex = /Left|Right/,

    cssCore = {

        // Feature / bug detection

        has: {

            // Check for getComputedStyle support

            'api-gCS': !!document.defaultView.getComputedStyle
        },

        // Various regex

        numbs: /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,

        directions: ['Top', 'Right', 'Bottom', 'Left'],

        stylePrefixes: ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml'],

        /**
         * CSS Normal Transforms
         */

        cssNormalTransform: {

            letterSpacing: '0',
            fontWeight: '400'
        }
    },

    /**
     * Get native CSS styles
     *
     * @param {Object} elem
     * @return {Object}
     */

    getStyles = hAzzle.getStyles = function(elem) {
        var view = elem.ownerDocument.defaultView;
        return cssCore.has['api-gCS'] ? (view.opener ? view.getComputedStyle(elem, null) :
            window.getComputedStyle(elem, null)) : elem.style;
    };


/* ============================ FEATURE / BUG DETECTION =========================== */

hAzzle.assert(function(div) {

    // Support: IE9-11+

    cssCore.has['bug-clearCloneStyle'] = div.style.backgroundClip === "content-box";

    var pixelPositionVal, boxSizingReliableVal,
        container = document.createElement("div");

    container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
        "position:absolute";

    container.appendChild(div);

    function computePixelPositionAndBoxSizingReliable() {
        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
            "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
            "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
            "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        hAzzle.docElem.appendChild(container);

        var divStyle = window.getComputedStyle(div, null);
        pixelPositionVal = divStyle.top !== "1%";
        boxSizingReliableVal = divStyle.width === "4px";

        hAzzle.docElem.removeChild(container);
    }

    // Check if we support getComputedStyle

    if (cssCore.has['api-gCS']) {

        cssCore.has['api-pixelPosition'] = (function() {
            computePixelPositionAndBoxSizingReliable();
            return pixelPositionVal;
        })();

        cssCore.has['api-boxSizingReliable'] = (function() {
            if (boxSizingReliableVal === null) {
                computePixelPositionAndBoxSizingReliable();
            }
            return boxSizingReliableVal;
        })();

        cssCore.has['api-reliableMarginRight'] = (function() {
            var ret, marginDiv = div.appendChild(document.createElement("div"));
            marginDiv.style.cssText = div.style.cssText =
                "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
                "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
            marginDiv.style.marginRight = marginDiv.style.width = "0";
            div.style.width = "1px";
            hAzzle.docElem.appendChild(container);
            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
            hAzzle.docElem.removeChild(container);
            return ret;
        })();
    }
});

// Expose to the global hAzzle Object

hAzzle.clearCloneStyle = cssCore.has['bug-clearCloneStyle'];
hAzzle.pixelPosition = cssCore.has['api-pixelPosition'];
hAzzle.boxSizingReliable = cssCore.has['api-boxSizingReliable'];
hAzzle.reliableMarginRight = cssCore.has['api-reliableMarginRight'];


// Extend hAzzle.Core

hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function(name, value) {

        return hAzzle.setter(this, function(elem, name, value) {
            var styles, len,
                map = {},
                i = 0;

            if (hAzzle.isArray(name)) {
                styles = getStyles(elem);
                len = name.length;

                for (; i < len; i++) {
                    map[name[i]] = hAzzle.css(elem, name[i], false, styles);
                }

                return map;
            }

            return value !== undefined ?
                hAzzle.style(elem, name, value) :
                hAzzle.css(elem, name);
        }, name, value, arguments.length > 1);
    },

    opacity: function(value) {
        return this.each(function(el) {
            hAzzle.opacity(el, value);
        });
    }
});

// Go globale!

hAzzle.extend({

    // Properties that shouldn't have units behind 

    unitless: {},

    cssHooks: {

        opacity: {
            get: function(el, computed) {

                if (computed) {
                    var ret = curCSS(el, 'opacity');
                    return ret === '' ? '1' : ret;
                }
            }
        }
    },

    cssProps: {

        'float': 'cssFloat'
    },

    /**
     * Set css properties
     *
     * @param {Object} elem
     * @param {String|Object} name
     * @param {String} value
     * @return {String|hAzzle}
     */

    style: function(elem, name, value, extra) {

        // Don't set styles on text and comment nodes
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }

        // Make sure that we're working with the right name
        var ret, type, hooks,
            origName = hAzzle.camelize(name),
            style = elem.style;

        name = hAzzle.cssProps[origName] ||
            (hAzzle.cssProps[origName] = vendorPropName(style, origName));

        // Gets hook for the prefixed version, then unprefixed version

        hooks = hAzzle.cssHooks[name] ||
            hAzzle.cssHooks[origName];

        // Check if we're setting a value

        if (value !== undefined) {

            // convert relative number strings

            if (type === 'string' && (ret = cssCore.numbs.exec(value))) {

                value = hAzzle.units(parseFloat(hAzzle.css(elem, name)), ret[3], elem, name) + (ret[1] + 1) * ret[2];
                type = 'number';
            }

            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {

                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)

            if (type === 'number' && !hAzzle.unitless[name]) {

                value += ret && ret[3] ? ret[3] : 'px';
            }

            if (!cssCore.has['bug-clearCloneStyle'] && value === '' && name.indexOf('background') === 0) {

                style[hAzzle.camelize(name)] = 'inherit';
            }

            // If a hook was provided, use that value, otherwise just set the specified value

            if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                style[name] = value;
            }

        } else {

            // If a hook was provided get the non-computed value from there
            if (hooks && "get" in hooks &&
                (ret = hooks.get(elem, false, extra)) !== undefined) {

                return ret;
            }

            // Otherwise just get the value from the style object
            return elem && elem.style[name];
        }
    },

    /**
     * Set CSS rules on DOM nodes
     *
     * @param {Object} elem
     * @param {String|Object} prop
     * @return {String|Object|Array}
     */

    css: function(elem, name, extra, styles) {

        var val, num, hooks,
            mTop, mRight, mBottom, mLeft,
            origName = hAzzle.camelize(name);

        // Make sure that we're working with the right name
        name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorPropName(elem.style, origName));

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

        // If a hook was provided get the computed value from there
        if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that
        if (val === undefined) {
            val = curCSS(elem, name, styles);
        }

        // Convert "normal" to computed value
        if (val === "normal" && name in cssCore.cssNormalTransform) {
            val = cssCore.cssNormalTransform[name];
        }

        // Convert the ""|"auto" values in a correct pixel value (for IE and Firefox)
        if (extra !== "auto" && /^margin/.test(name) && /^$|auto/.test(val)) {
			
			val = calculateCorrect(elem, name, val);
				
      }
        // Make numeric if forced or a qualifier was provided and val looks numeric

        if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || hAzzle.isNumeric(num) ? num || 0 : val;
        }

        return val;
    },

    /**
     * Set opacity
     *
     * @param{Object} elem
     * @param{number} value
     */
    opacity: function(element, value) {

        if (typeof value !== 'number') {
            value = 1;
        }
        if (value == 1 || value === '') {

            value = '';

        } else if (value < 0.00001) {

            value = 0;
        }

        element.style.opacity = value;
    },

    // Quick functions for setting, getting and 
    // erase CSS styles with cssText

    setCSS: function(elem, style) {
        elem.style.cssText = style;
    },

    getCSS: function(elem) {
        return elem.style.cssText;
    },

    eraseCSS: function(elem) {
        elem.style.cssText = '';
    }

}, hAzzle);

/* =========================== PRIVATE FUNCTIONS ========================== */

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName(style, name) {

    // Shortcut for names that are not vendor prefixed
    if (name in style) {
        return name;
    }

    // Check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
        origName = name,
        i = cssCore.stylePrefixes.length;

    while (i--) {
        name = cssCore.stylePrefixes[i] + capName;
        if (name in style) {
            return name;
        }
    }

    return origName;
}

function curCSS(elem, prop, computed) {
    var ret;

    computed = computed || getStyles(elem);

    if (computed) {
        ret = computed.getPropertyValue(prop) || computed[prop];
    }

    if (computed && (ret === '' && !hAzzle.contains(elem.ownerDocument, elem))) {

        ret = hAzzle.style(elem, prop);
    }

    return ret !== undefined ?
        ret + '' :

        ret;
}


/* ============================ UTILITY METHODS =========================== */
  
 /**
  * Detect correct margin properties for IE9 and Firefox
  *
  * @param {Object} elem
  * @param {String} val
  * @param {String} name
  * @param {Object}
  */
  
  
 function calculateCorrect(elem, name, val) {
			
            if (topBottomRegEx.test(name)) {
                val = "0px";
            } else if (val !== "" && absoluteRegex.test(hAzzle.css(elem, "position"))) {
                val = val.replace(autoRegex, "0px");
            } else if (leftrightRegex.test(name)) {
                mTop = hAzzle.css(elem, name === "marginLeft" ? "marginRight" : "marginLeft", "auto");
                val = hAzzle.css(elem.parentNode, "width", "") - hAzzle(elem).outerWidth();
                val = (mTop === "auto" ? parseInt(val / 2) : val - mTop) + "px";
            } else {
                val =
                    mTop = hAzzle.css(elem, "marginTop");
                mRight = hAzzle.css(elem, "marginRight");
                mBottom = hAzzle.css(elem, "marginBottom");
                mLeft = hAzzle.css(elem, "marginLeft");
                if (mLeft !== mRight) {
                    val += " " + mRight + " " + mBottom + " " + mLeft;
                } else if (mTop !== mBottom) {
                    val += " " + mLeft + " " + mBottom;
                } else if (mTop !== mLeft) {
                    val += " " + mLeft;
                }
            }
			return val;
        }

/* =========================== INTERNAL ========================== */

// Margin and padding cssHooks

hAzzle.each(['margin', 'padding'], function(hook) {
    hAzzle.cssHooks[hook] = {
        get: function(elem) {
            return hAzzle.map(cssCore.directions, function(dir) {
                return hAzzle.css(elem, hook + dir);
            }).join(' ');
        },
        set: function(elem, value) {
            var parts = value.split(/\s/),
                values = {
                    'Top': parts[0],
                    'Right': parts[1] || parts[0],
                    'Bottom': parts[2] || parts[0],
                    'Left': parts[3] || parts[1] || parts[0]
                };
            hAzzle.each(cssCore.directions, function(dir) {
                elem.style[hook + dir] = values[dir];
            });
        }
    };
});

// Populate the unitless list

hAzzle.each(['lineHeight', 'zoom', 'zIndex', 'opacity', 'boxFlex',
        'WebkitBoxFlex', 'MozBoxFlex',
        'columns', 'counterReset', 'counterIncrement',
        'fontWeight', 'float', 'volume', 'stress',
        'overflow', 'fillOpacity',
        'flexGrow', 'columnCount',
        'flexShrink', 'order',
        'orphans', 'widows',
        'transform', 'transformOrigin',
        'transformStyle', 'perspective',
        'perspectiveOrigin', 'backfaceVisibility'
    ],
    function(name) {
        hAzzle.unitless[name] = true;
    });